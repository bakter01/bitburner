/** @param {NS} ns */
export async function main(ns) {
    const scriptName = "hack.js";
    const homeReservedRam = 32;
    const topN = ns.args[0] !== undefined ? ns.args[0] : 0;
    
    // MAX IDŐ: Ha egy weaken tovább tartana, mint 15 perc (900 mp), hanyagoljuk.
    const maxWeakenTime = 15 * 60 * 1000; 

    if (!ns.fileExists(scriptName, "home")) {
        ns.tprint(`HIBA: A '${scriptName}' hiányzik!`);
        return;
    }

    let allServers = [];
    const visited = new Set();

    function scanAll(hostname) {
        if (visited.has(hostname)) return;
        visited.add(hostname);
        
        if (ns.hasRootAccess(hostname) && hostname !== "home" && !hostname.startsWith("pserv-")) {
            const maxMoney = ns.getServerMaxMoney(hostname);
            const reqLevel = ns.getServerRequiredHackingLevel(hostname);
            const wTime = ns.getWeakenTime(hostname);

            // SZŰRÉS: 
            // 1. Legyen rajta pénz
            // 2. A szintem ne legyen kisebb, mint a követelmény
            // 3. A weaken idő ne legyen több a limitnél
            if (maxMoney > 0 && reqLevel <= ns.getHackingLevel() && wTime < maxWeakenTime) {
                allServers.push({ name: hostname, money: maxMoney });
            }
        }

        const neighbors = ns.scan(hostname);
        for (const neighbor of neighbors) scanAll(neighbor);
    }

    scanAll("home");

    // Rendezés profit szerint
    allServers.sort((a, b) => b.money - a.money);

    let targets = [];
    if (topN === 0) {
        targets = allServers.map(s => s.name);
        ns.tprint(`--- ÖSSZES (${targets.length}) szerver támadása ---`);
    } else {
        targets = allServers.slice(0, topN).map(s => s.name);
        ns.tprint(`--- TOP ${targets.length} szerver támadása ---`);
    }

    if (targets.length === 0) {
        ns.tprint("Nincs elérhető célpont!");
        return;
    }

    // 3. Erőforrások (Home + Vásárolt szerverek) kezelése
    const hosts = ns.getPurchasedServers();
    hosts.push("home");
    const scriptRam = ns.getScriptRam(scriptName);

    for (const host of hosts) {
        // Először takarítás az adott gépen
        ns.scriptKill(scriptName, host);

        let maxRam = ns.getServerMaxRam(host);
        let availableRam = (host === "home") ? maxRam - homeReservedRam : maxRam;

        if (availableRam <= 0) continue;

        const totalThreadsPossible = Math.floor(availableRam / scriptRam);
        if (totalThreadsPossible < 1) continue;

        // OKOS SZÁLKEZELÉS:
        // Kiszámoljuk, hány célpontot tudunk ténylegesen kiszolgálni ezen a gépen
        let threadsPerTarget = Math.floor(totalThreadsPossible / targets.length);
        let activeTargetsCount = targets.length;

        // Ha kevesebb a szál, mint a célpont (kis RAM-os pserv), 
        // akkor csak az első pár célpontot támadjuk 1-1 szállal.
        if (threadsPerTarget < 1) {
            threadsPerTarget = 1;
            activeTargetsCount = totalThreadsPossible;
        }

        // Fájl másolása (szükséges a pserv-ekhez)
        if (host !== "home") {
            await ns.scp(scriptName, host, "home");
        }

        // Támadás indítása
        for (let i = 0; i < activeTargetsCount; i++) {
            const target = targets[i];
            
            // Az utolsó célpont megkapja a maradék "töredék" szálakat is
            const currentThreads = (i === activeTargetsCount - 1) 
                ? (totalThreadsPossible - (threadsPerTarget * (activeTargetsCount - 1))) 
                : threadsPerTarget;

            if (currentThreads > 0) {
                ns.exec(scriptName, host, currentThreads, target);
            }
        }
        ns.print(`[DEPLOY] ${host}: ${totalThreadsPossible} szál elindítva ${activeTargetsCount} célpont ellen.`);
    }

    ns.tprint("Sikeresen frissítve minden szerveren.");
}