/** @param {NS} ns */
export async function main(ns) {
    // --- KONFIGURÁCIÓ ---
    const mainScript = "hack.js"; 
    const scriptsToKill = ["hack.js", "XPFarm.js"];
    const homeReservedRam = 64;   
    const nParam = ns.args[0] !== undefined ? ns.args[0] : 0; 
    const maxWeakenTime = 10 * 60 * 1000; // 10 perc max várakozás

    ns.disableLog("ALL");
    ns.tprint("--- RENDSZER RESET ÉS AUTO-CRACK INDÍTÁSA ---");

    // 1. Összes elérhető szerver feltérképezése
    let allHosts = getAllServers(ns);

    // 2. AUTO-CRACK & NUKE (Singularity/BN4 kompatibilis)
    for (const host of allHosts) {
        if (host === "home" || host.startsWith("pserv-")) continue;
        
        // Ha nincs root, megpróbáljuk feltörni
        if (!ns.hasRootAccess(host)) {
            let portsOpened = 0;
            if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(host); portsOpened++; }
            if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(host); portsOpened++; }
            if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(host); portsOpened++; }
            if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(host); portsOpened++; }
            if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(host); portsOpened++; }

            if (ns.getServerNumPortsRequired(host) <= portsOpened) {
                ns.nuke(host);
                ns.print(`ÚJ SZERVER FELTÖRVE: ${host}`);
            }
        }
    }

    // 3. Takarítás: Mindenhol lelőjük a régi folyamatokat
    for (const host of allHosts) {
        if (!ns.hasRootAccess(host)) continue;
        for (const sName of scriptsToKill) {
            ns.scriptKill(sName, host);
        }
    }

    // 4. Potenciális célpontok szűrése
    let attackable = [];
    for (const host of allHosts) {
        if (ns.hasRootAccess(host) && !host.startsWith("pserv-") && host !== "home") {
            const maxMoney = ns.getServerMaxMoney(host);
            // Csak olyan gép, amin van pénz és elég a hacking szintünk hozzá
            if (maxMoney > 0 && ns.getServerRequiredHackingLevel(host) <= ns.getHackingLevel()) {
                if (ns.getWeakenTime(host) < maxWeakenTime) {
                    attackable.push({ name: host, money: maxMoney });
                }
            }
        }
    }

    // 5. Célpontok kiválasztása az N paraméter alapján
    let targets = [];
    if (nParam === 0) {
        targets = attackable.map(s => s.name);
        ns.tprint(`Mód: Összes elérhető célpont (${targets.length} db)`);
    } 
    else if (nParam > 0) {
        attackable.sort((a, b) => b.money - a.money); // Leggazdagabbak előre
        targets = attackable.slice(0, nParam).map(s => s.name);
        ns.tprint(`Mód: TOP ${targets.length} leggazdagabb szerver`);
    } 
    else {
        attackable.sort((a, b) => a.money - b.money); // Legszegényebbek előre
        targets = attackable.slice(0, Math.abs(nParam)).map(s => s.name);
        ns.tprint(`Mód: ${targets.length} legkönnyebb szerver (XP farmolás)`);
    }

    if (targets.length === 0) {
        ns.tprint("HIBA: Nincs megfelelő célpont a listán!");
        return;
    }

    // 6. Újraosztás a teljes hálózaton
    const scriptRam = ns.getScriptRam(mainScript);

    for (const host of allHosts) {
        if (!ns.hasRootAccess(host)) continue;

        let maxRam = ns.getServerMaxRam(host);
        let usedRam = ns.getServerUsedRam(host);
        let availableRam = (host === "home") ? maxRam - usedRam - homeReservedRam : maxRam - usedRam;

        if (availableRam <= 0) continue;

        const totalThreads = Math.floor(availableRam / scriptRam);
        if (totalThreads < 1) continue;

        // Elosztjuk a szálakat a célpontok között
        let threadsPerTarget = Math.floor(totalThreads / targets.length);
        let activeCount = targets.length;

        // Ha kevesebb szál van, mint célpont, minden szál kap egy gépet, amíg tart
        if (threadsPerTarget < 1) {
            threadsPerTarget = 1;
            activeCount = Math.min(totalThreads, targets.length);
        }

        if (host !== "home") await ns.scp(mainScript, host, "home");

        for (let i = 0; i < activeCount; i++) {
            const currentThreads = (i === activeCount - 1) 
                ? (totalThreads - (threadsPerTarget * (activeCount - 1))) 
                : threadsPerTarget;

            if (currentThreads > 0) {
                ns.exec(mainScript, host, currentThreads, targets[i]);
            }
        }
    }

    ns.tprint("Siker! A teljes hálózat újraütemezve.");
}

/** Segédfüggvény az összes szerver megkereséséhez */
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