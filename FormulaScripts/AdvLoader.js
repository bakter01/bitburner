/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    
    // Paraméter kezelés: run AdvLoader.js true --> bekapcsolja az újratöltést
    // Alapértelmezett: false (csak egyszer fut le az elosztás)
    const autoRefresh = ns.args[0] !== undefined ? ns.args[0] : false;
    const scriptName = "hack.js";

    // Belső ciklus, ami vagy egyszer fut le, vagy végtelenül
    do {
        let targets = [];
        let servers = getAllServers(ns);
        let pObj = ns.getPlayer();

        // 1. Profit számítás Formulas alapján
        for (let server of servers) {
            if (!ns.hasRootAccess(server) || ns.getServerMaxMoney(server) <= 0) continue;

            let sObj = ns.getServer(server);
            sObj.hackDifficulty = sObj.minDifficulty; // Ideális állapottal számolunk
            
            let hackChance = ns.formulas.hacking.hackChance(sObj, pObj);
            let hackTime = ns.formulas.hacking.hackTime(sObj, pObj);
            let hackMoney = ns.formulas.hacking.hackPercent(sObj, pObj) * sObj.moneyMax;
            
            let score = (hackMoney * hackChance) / (hackTime / 1000);
            targets.push({ name: server, score: score });
        }

        targets.sort((a, b) => b.score - a.score);
        let bestTarget = targets[0].name;

        ns.print(`[${new Date().toLocaleTimeString()}] Legjobb célpont: ${bestTarget} | AutoRefresh: ${autoRefresh}`);

        // 2. Szálak szétosztása
        for (let server of servers) {
            if (!ns.hasRootAccess(server)) continue;

            // Csak akkor avatkozunk be, ha autoRefresh van, vagy ha még nem fut semmi ezen a szerveren
            let isRunningOurScript = ns.ps(server).some(p => p.filename === scriptName);
            
            if (autoRefresh || !isRunningOurScript) {
                let freeRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
                
                // Ha autoRefresh van, hozzáadjuk a már futó scriptünk RAM-ját a számításhoz (mert le fogjuk lőni)
                if (autoRefresh) {
                    let currentProcs = ns.ps(server).filter(p => p.filename === scriptName);
                    currentProcs.forEach(p => freeRam += (p.threads * ns.getScriptRam(scriptName)));
                    ns.killall(server, true); // Itt a "true" megvédi magát a futó AdvLoader-t
                }

                if (server === "home") freeRam -= 32; 

                let threads = Math.floor(freeRam / ns.getScriptRam(scriptName));
                if (threads > 0) {
                    ns.scp(scriptName, server, "home");
                    ns.exec(scriptName, server, threads, bestTarget);
                }
            }
        }

        if (autoRefresh) {
            await ns.sleep(60000); // Percenkénti frissítés, ha kérted
        }

    } while (autoRefresh); // Ha false, a ciklus véget ér az első kör után

    ns.tprint("AdvLoader: Szálak szétosztva, a script leállt (nincs folyamatos frissítés).");
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