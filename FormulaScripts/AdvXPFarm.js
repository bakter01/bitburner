/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    const scriptName = "xp-grow.js"; // Egy egyszerű script, ami csak ns.grow(target)-et futtat

    // Létrehozzuk a grow scriptet, ha nem létezik
    if (!ns.fileExists(scriptName)) {
        await ns.write(scriptName, "export async function main(ns) { while(true) { await ns.grow(ns.args[0]); } }", "w");
    }

    while (true) {
        let bestTarget = "";
        let bestXPRate = 0;
        let servers = getAllServers(ns);
        let p = ns.getPlayer();

        for (let server of servers) {
            if (!ns.hasRootAccess(server)) continue;

            let s = ns.getServer(server);
            // XP farmoláshoz a grow() a legjobb, mert nem rontja a biztonságot annyira, mint a hack()
            // és 100% az esélye, ha van root access.
            
            let time = ns.formulas.hacking.growTime(s, p);
            let exp = ns.formulas.hacking.hackExp(s, p);
            
            // XP per másodperc per szál
            let xpRate = exp / (time / 1000);

            if (xpRate > bestXPRate) {
                bestXPRate = xpRate;
                bestTarget = server;
            }
        }

        ns.print(`Legjobb XP célpont: ${bestTarget} (${ns.formatNumber(bestXPRate, 3)} XP/s/thread)`);

        // Szétosztjuk a szálakat
        for (let server of servers) {
            if (!ns.hasRootAccess(server)) continue;
            
            let freeRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
            if (server === "home") freeRam -= 32; 

            let threads = Math.floor(freeRam / ns.getScriptRam(scriptName));
            if (threads > 0) {
                ns.scp(scriptName, server, "home");
                ns.killall(server, true); 
                ns.exec(scriptName, server, threads, bestTarget);
            }
        }

        await ns.sleep(300000); // 5 percenként újratervezés (XP közben nő a szintünk)
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