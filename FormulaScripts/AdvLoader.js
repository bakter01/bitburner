/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    const scriptName = "hack.js"; // A fájl, amit a távoli szervereken futtatunk

    while (true) {
        let targets = [];
        let servers = getAllServers(ns);

        for (let server of servers) {
            if (!ns.hasRootAccess(server) || ns.getServerMaxMoney(server) <= 0) continue;

            // Kiszámoljuk a maximális elméleti profitot/másodperc a Formulas segítségével
            // Feltételezzük a szerver minimális biztonsági szintjét és max pénzét
            let sObj = ns.getServer(server);
            let pObj = ns.getPlayer();
            
            // Beállítjuk az ideális állapotot a kalkulációhoz
            sObj.hackDifficulty = sObj.minDifficulty;
            
            let hackChance = ns.formulas.hacking.hackChance(sObj, pObj);
            let hackTime = ns.formulas.hacking.hackTime(sObj, pObj);
            let hackMoney = ns.formulas.hacking.hackPercent(sObj, pObj) * sObj.moneyMax;
            
            // Profit per másodperc (Idővel és eséllyel súlyozva)
            let score = (hackMoney * hackChance) / (hackTime / 1000);
            
            targets.push({ name: server, score: score });
        }

        // Sorba rendezzük profit szerint csökkenő sorrendben
        targets.sort((a, b) => b.score - a.score);
        
        // Kiválasztjuk a legjobb célpontot (vagy az első párat)
        let bestTarget = targets[0].name;
        ns.print(`--- Új ciklus: Legjobb célpont: ${bestTarget} (${Math.round(targets[0].score)}$/s) ---`);

        // Szétosztjuk a szálakat az összes elérhető szerveren
        for (let server of servers) {
            if (!ns.hasRootAccess(server)) continue;

            let freeRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
            if (server === "home") freeRam -= 32; // Home tartalék

            let threads = Math.floor(freeRam / ns.getScriptRam(scriptName));

            if (threads > 0) {
                ns.scp(scriptName, server, "home");
                ns.killall(server, true); // Opcionális: leállítjuk a régit, hogy az új célpontra fókuszáljunk
                ns.exec(scriptName, server, threads, bestTarget);
            }
        }

        await ns.sleep(60000); // 1 perc múlva újratervezünk (ha nőtt a szintünk, változhat a legjobb célpont)
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