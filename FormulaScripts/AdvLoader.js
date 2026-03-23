/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    
    const autoRefresh = ns.args[0] === true || ns.args[0] === "true";
    const scriptName = "hack.js";
    const maxWeakenTimeSeconds = 600; 

    // Ezt a változót kihozzuk a ciklus elé, hogy a legvégén is elérhető legyen
    let lastBestTarget = "Nincs";

    do {
        let targets = [];
        let allServers = getAllServers(ns);
        let pObj = ns.getPlayer();

        for (let server of allServers) {
            if (!ns.hasRootAccess(server) || ns.getServerMaxMoney(server) <= 0) continue;

            let sObj = ns.getServer(server);
            sObj.hackDifficulty = sObj.minDifficulty; 
            
            let wTime = ns.formulas.hacking.weakenTime(sObj, pObj) / 1000;
            if (wTime > maxWeakenTimeSeconds) continue; 

            let hTime = ns.formulas.hacking.hackTime(sObj, pObj) / 1000;
            let hChance = ns.formulas.hacking.hackChance(sObj, pObj);
            let hPercent = ns.formulas.hacking.hackPercent(sObj, pObj);
            let hMoney = hPercent * sObj.moneyMax;
            
            let score = (hMoney * hChance) / hTime;
            targets.push({ name: server, score: score, wTime: wTime });
        }

        targets.sort((a, b) => b.score - a.score);
        
        if (targets.length === 0) {
            ns.tprint("HIBA: Nincs célpont a megadott időlimiten belül!");
            return;
        }

        let bestTarget = targets[0].name;
        lastBestTarget = bestTarget; // Elmentjük a külső változóba

        ns.print(`--- ÚJ CÉLPONT ---`);
        ns.print(`Cél: ${bestTarget} | Weaken: ${Math.round(targets[0].wTime)} mp`);

        for (let server of allServers) {
            if (!ns.hasRootAccess(server)) continue;
            let reservedRam = (server === "home") ? 64 : 0; 
            
            let isRunning = ns.ps(server).some(p => p.filename === scriptName);
            
            // Ha autoRefresh van, VAGY nem fut semmi, akkor telepítünk
            if (autoRefresh || !isRunning) {
                let procs = ns.ps(server).filter(p => p.filename === scriptName);
                for (let p of procs) ns.kill(p.pid);

                let freeRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server) - reservedRam;
                let threads = Math.floor(freeRam / ns.getScriptRam(scriptName));
                
                if (threads > 0) {
                    await ns.scp(scriptName, server, "home");
                    ns.exec(scriptName, server, threads, bestTarget);
                }
            }
        }

        if (autoRefresh) await ns.sleep(60000); 

    } while (autoRefresh);

    // Itt volt a hiba: a targets[0] helyett a kimentett változót használjuk
    ns.tprint(`AdvLoader: Kész! Aktuális legjobb célpont: ${lastBestTarget}`);
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