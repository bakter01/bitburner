/** @param {NS} ns */
export async function main(ns) {
    const scriptName = "hack.js";
    const homeReservedRam = 32; // Több RAM-ot hagyunk a home-on a többi scriptnek
    const topLimit = 10;

    if (!ns.fileExists(scriptName, "home")) {
        ns.tprint(`HIBA: A '${scriptName}' nem található!`);
        return;
    }

    // 1. Összegyűjtjük az összes feltört szervert és rangsoroljuk őket
    let allServers = [];
    const visited = new Set();

    function scanAll(hostname) {
        if (visited.has(hostname)) return;
        visited.add(hostname);
        
        if (ns.hasRootAccess(hostname) && hostname !== "home" && !hostname.startsWith("pserv-")) {
            const maxMoney = ns.getServerMaxMoney(hostname);
            if (maxMoney > 0) {
                allServers.push({ name: hostname, money: maxMoney });
            }
        }

        const neighbors = ns.scan(hostname);
        for (const neighbor of neighbors) {
            scanAll(neighbor);
        }
    }

    scanAll("home");

    // Rendezés pénz szerint csökkenő sorrendbe és a TOP 10 kiválasztása
    const targets = allServers
        .sort((a, b) => b.money - a.money)
        .slice(0, topLimit)
        .map(s => s.name);

    ns.tprint(`--- TOP ${targets.length} Célpont kiválasztva ---`);

    // 2. Erőforrások (Home + Vásárolt szerverek) összegyűjtése
    const hosts = ns.getPurchasedServers();
    hosts.push("home");

    const scriptRam = ns.getScriptRam(scriptName);

    for (const host of hosts) {
        // Először leállítjuk a régi hacket ezen a gépen
        ns.scriptKill(scriptName, host);

        let availableRam = ns.getServerMaxRam(host);
        if (host === "home") {
            availableRam -= homeReservedRam;
        }

        if (availableRam <= 0) continue;

        const totalThreadsPossible = Math.floor(availableRam / scriptRam);
        if (totalThreadsPossible < 1) continue;

        // Elosztjuk a szálakat a TOP célpontok között ezen a konkrét szerveren
        const threadsPerTarget = Math.floor(totalThreadsPossible / targets.length);

        if (host !== "home") {
            await ns.scp(scriptName, host, "home");
        }

        let launchedOnHost = 0;
        for (const target of targets) {
            const currentThreads = (launchedOnHost === targets.length - 1) 
                ? (totalThreadsPossible - (threadsPerTarget * (targets.length - 1))) // Maradék szálak az utolsónak
                : threadsPerTarget;

            if (currentThreads > 0) {
                ns.exec(scriptName, host, currentThreads, target);
                launchedOnHost++;
            }
        }
        ns.print(`[DEPLOY] ${host}: ${totalThreadsPossible} szál elosztva a célpontok között.`);
    }

    ns.tprint(`Siker: A támadás fut a home-on és ${hosts.length - 1} vásárolt szerveren.`);
}