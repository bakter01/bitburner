/** @param {NS} ns */
export async function main(ns) {
    const scriptsToKill = ["hack.js", "XPFarm.js"];
    const mainScript = "hack.js"; // Ezt fogjuk újraindítani
    const homeReservedRam = 64;   // Kicsit emeltem, hogy ne akadjon el a HUD/ServerBuy
    const topN = ns.args[0] !== undefined ? ns.args[0] : 0;
    const maxWeakenTime = 10 * 60 * 1000; 

    ns.disableLog("ALL");
    ns.tprint("--- RENDSZER RESET ÉS ÚJRATERVEZÉS INDÍTÁSA ---");

    // 1. Összes elérhető szerver feltérképezése
    let allHosts = getAllServers(ns);
    let targets = [];

    // 2. Takarítás: Mindenhol lelőjük a régi scripteket
    for (const host of allHosts) {
        if (!ns.hasRootAccess(host)) continue;
        
        for (const sName of scriptsToKill) {
            ns.scriptKill(sName, host);
        }
    }
    ns.print("Régi folyamatok leállítva.");

    // 3. Célpontok kiválasztása (csak amikre van root és pénz)
    let attackable = [];
    for (const host of allHosts) {
        if (ns.hasRootAccess(host) && !host.startsWith("pserv-") && host !== "home") {
            const maxMoney = ns.getServerMaxMoney(host);
            if (maxMoney > 0 && ns.getServerRequiredHackingLevel(host) <= ns.getHackingLevel()) {
                if (ns.getWeakenTime(host) < maxWeakenTime) {
                    attackable.push({ name: host, money: maxMoney });
                }
            }
        }
    }

    attackable.sort((a, b) => b.money - a.money);
    targets = (topN === 0) ? attackable.map(s => s.name) : attackable.slice(0, topN).map(s => s.name);

    if (targets.length === 0) {
        ns.tprint("HIBA: Nincs megfelelő célpont!");
        return;
    }

    // 4. Újraosztás az összes munkás szerveren (Home + Pserv + RAM-mal rendelkező hálózati gépek)
    const scriptRam = ns.getScriptRam(mainScript);

    for (const host of allHosts) {
        if (!ns.hasRootAccess(host)) continue;

        let maxRam = ns.getServerMaxRam(host);
        let usedRam = ns.getServerUsedRam(host);
        let availableRam = (host === "home") ? maxRam - usedRam - homeReservedRam : maxRam - usedRam;

        if (availableRam <= 0) continue;

        const totalThreads = Math.floor(availableRam / scriptRam);
        if (totalThreads < 1) continue;

        let threadsPerTarget = Math.floor(totalThreads / targets.length);
        let activeCount = targets.length;

        if (threadsPerTarget < 1) {
            threadsPerTarget = 1;
            activeCount = totalThreads;
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

    ns.tprint(`Siker! ${targets.length} célpont újraütemezve a teljes hálózaton.`);
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