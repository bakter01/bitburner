/** @param {NS} ns */
export async function main(ns) {
    const limit = ns.getPurchasedServerLimit(); // 25
    const maxAllowedRam = ns.getPurchasedServerMaxRam();
    const loaderScript = "BasicLoader.js";
    const startRam = 8; // Itt állítottam át 8 GB-ra
    
    ns.disableLog("ALL");
    ns.ui.openTail();

    while (true) {
        let servers = ns.getPurchasedServers();
        let myMoney = ns.getServerMoneyAvailable("home");
        let upgraded = false;

        // 1. FÁZIS: Kezdeti 25 szerver kiépítése
        if (servers.length < limit) {
            let cost = ns.getPurchasedServerCost(startRam);
            
            if (myMoney >= cost) {
                // Sorszám formázása: 00, 01, 02...
                let sIndex = servers.length.toString().padStart(2, '0');
                let sName = `pserv-${sIndex}`;
                
                let result = ns.purchaseServer(sName, startRam);
                if (result) {
                    ns.print(`[VÁSÁRLÁS] ${sName} (${startRam} GB) - OK`);
                    upgraded = true;
                }
            } else {
                ns.clearLog();
                ns.print(`Várakozás az első 25 szerverre...`);
                ns.print(`Szükséges: $${ns.formatNumber(cost)} | Van: $${ns.formatNumber(myMoney)}`);
            }
        } 
        // 2. FÁZIS: Batch Upgrade
        else {
            // Megkeressük a legkisebb RAM-ot a meglévők közül
            let currentRam = Math.min(...servers.map(s => ns.getServerMaxRam(s)));
            let nextRam = currentRam * 2;

            if (nextRam <= maxAllowedRam) {
                // Kiszámoljuk a teljes kört (25 szerver fejlesztése)
                let upgradeCostPerServer = ns.getPurchasedServerUpgradeCost(servers[0], nextRam);
                let totalCost = upgradeCostPerServer * limit;

                ns.clearLog();
                ns.print("=== BATCH SERVER MANAGER ===");
                ns.print(`Upgrade: ${ns.formatRam(currentRam)} -> ${ns.formatRam(nextRam)}`);
                ns.print(`Összköltség (25db): $${ns.formatNumber(totalCost)}`);
                ns.print(`Haladás: ${((myMoney / totalCost) * 100).toFixed(1)}%`);

                if (myMoney >= totalCost) {
                    ns.print("BATCH UPGRADE INDÍTÁSA...");
                    for (const sName of servers) {
                        ns.upgradePurchasedServer(sName, nextRam);
                    }
                    upgraded = true;
                }
            } else {
                ns.print("Minden szerver elérte a maximumot (1 PB).");
                return;
            }
        }

        // --- LOAD INDÍTÁSA ---
        if (upgraded) {
            ns.print("Kapacitás változott! Loader frissítése...");
            ns.scriptKill(loaderScript, "home");
            ns.run(loaderScript, 1, 10); 
        }

        await ns.sleep(2000); // 2 másodpercenként csekkolunk
    }
}