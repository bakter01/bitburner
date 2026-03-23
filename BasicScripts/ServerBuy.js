/** @param {NS} ns */
export async function main(ns) {
    const limit = ns.getPurchasedServerLimit();
    const maxAllowedRam = ns.getPurchasedServerMaxRam();
    const loaderScript = "BasicLoader.js";
    
    ns.disableLog("ALL");
    ns.ui.openTail();

    while (true) {
        let servers = ns.getPurchasedServers();
        let myMoney = ns.getServerMoneyAvailable("home");
        let upgraded = false;

        // 1. FÁZIS: Kezdeti 25 szerver kiépítése
        if (servers.length < limit) {
            let startRam = 1024;
            let cost = ns.getPurchasedServerCost(startRam);
            if (myMoney >= cost) {
                let sName = `pserv-${servers.length}`;
                ns.purchaseServer(sName, startRam);
                ns.print(`Vásárolva: ${sName}`);
                upgraded = true; // Jelzzük, hogy változott a kapacitás
            }
        } 
        // 2. FÁZIS: Batch Upgrade (25 szerver egyszerre)
        else {
            let currentRam = Math.min(...servers.map(s => ns.getServerMaxRam(s)));
            let nextRam = currentRam * 2;

            if (nextRam <= maxAllowedRam) {
                let totalCost = ns.getPurchasedServerCost(nextRam) * limit;

                ns.clearLog();
                ns.print("=== BATCH SERVER MANAGER ===");
                ns.print(`Szint: ${ns.formatRam(currentRam)} -> ${ns.formatRam(nextRam)}`);
                ns.print(`Ár:    $${ns.formatNumber(totalCost)}`);
                ns.print(`Kész:  ${((myMoney / totalCost) * 100).toFixed(1)}%`);

                if (myMoney >= totalCost) {
                    ns.print("UPGRADE FOLYAMATBAN...");
                    for (let i = 0; i < limit; i++) {
                        let sName = `pserv-${i}`;
                        ns.killall(sName);
                        ns.deleteServer(sName);
                        ns.purchaseServer(sName, nextRam);
                    }
                    upgraded = true; // Sikerült a bővítés
                }
            } else {
                ns.print("Minden szerver MAXON (1PB).");
                return;
            }
        }

        // --- AZ AUTOMATIZÁLÁS LELKE ---
        // Ha történt változás (új szerver vagy upgrade), indítjuk a Loadert
        if (upgraded) {
            ns.print("Kapacitás változott! BasicLoader indítása...");
            
            // Ha már fut a loader, megvárjuk/leállítjuk (opcionális, de így tiszta)
            ns.scriptKill(loaderScript, "home");
            
            // Elindítjuk a Loadert (pl. a TOP 10 szerverre koncentrálva)
            // A 10-es számot átírhatod, ha több vagy kevesebb célpontot akarsz.
            ns.run(loaderScript, 1, 10); 
        }

        await ns.sleep(5000);
    }
}