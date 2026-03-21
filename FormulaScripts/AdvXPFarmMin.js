/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    const workerScript = "xp-grow.js";

    // Létrehozzuk a segédscriptet, ha nincs meg
    if (!ns.fileExists(workerScript)) {
        await ns.write(workerScript, "export async function main(ns) { while(true) { await ns.grow(ns.args[0]); } }", "w");
    }

    while (true) {
        let bestTarget = "";
        let bestXPRate = 0;
        let servers = getAllServers(ns);
        let p = ns.getPlayer();

        // 1. A legjobb célpont kiválasztása Formulas alapján
        for (let server of servers) {
            if (!ns.hasRootAccess(server)) continue;
            let s = ns.getServer(server);
            
            let time = ns.formulas.hacking.growTime(s, p);
            let exp = ns.formulas.hacking.hackExp(s, p);
            let xpRate = exp / (time / 1000);

            if (xpRate > bestXPRate) {
                bestXPRate = xpRate;
                bestTarget = server;
            }
        }

        ns.print(`XP Célpont: ${bestTarget} | Frissítés...`);

        // 2. Szétosztás a szabad memóriára
        for (let server of servers) {
            if (!ns.hasRootAccess(server)) continue;

            // Csak a SAJÁT korábbi xp-grow.js példányainkat lőjük le ezen a szerveren
            let procs = ns.ps(server);
            for (let proc of procs) {
                if (proc.filename === workerScript) {
                    ns.kill(proc.pid);
                }
            }

            // Kiszámoljuk, mennyi RAM maradt a többi script (pl. AdvLoader) után
            let freeRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
            
            // Biztonsági tartalék a home szerveren (hogy ne fagyjon le a UI)
            if (server === "home") freeRam -= 16; 

            let threads = Math.floor(freeRam / ns.getScriptRam(workerScript));
            
            if (threads > 0) {
                ns.scp(workerScript, server, "home");
                ns.exec(workerScript, server, threads, bestTarget);
            }
        }

        // Ritkább frissítés, hogy ne rángassa a rendszert (10 perc)
        await ns.sleep(600000); 
    }
}

function getAllServers(ns) {
    let servers = new Set(["home"]);
    let queue = ["home"];
    while (queue.length > 0) {
        let host = queue.shift();
        for (let next of ns.scan(host)) {
            if (!servers.has(next)) {
                servers.add(next);
                queue.push(next);
            }
        }
    }
    return Array.from(servers);
}