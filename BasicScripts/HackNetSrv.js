/** @param {NS} ns */
export async function main(ns) {
    const maxNodes = ns.args[0] || 20;
    const maxROI_Seconds = ns.args[1] || 3600; // Alapértelmezett: 1 óra (3600 mp)

    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.print(`--- Hacknet ROI Manager ---`);
    ns.print(`Limit: ${maxNodes} node | Max megtérülés: ${maxROI_Seconds}s`);

    while (true) {
        // 1. ÚJ CSOMÓPONT VÁSÁRLÁSA
        if (ns.hacknet.numNodes() < maxNodes) {
            let cost = ns.hacknet.getPurchaseNodeCost();
            // Egy új node alaptermelése (Level 1, 1GB RAM, 1 Core) kb. így néz ki:
            let gain = ns.formulas.hacknetNodes.moneyGainRate(1, 1, 1);
            let roi = cost / gain;

            if (roi < maxROI_Seconds && ns.getServerMoneyAvailable("home") > cost) {
                ns.hacknet.purchaseNode();
                ns.print(`[VÁSÁRLÁS] Új node! Megtérülés: ${Math.round(roi)}s`);
            }
        }

        // 2. MEGLÉVŐ FEJLESZTÉSEK ELLENŐRZÉSE
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            let s = ns.hacknet.getNodeStats(i);

            // Megnézzük a 3 típust: Level, RAM, Cores
            checkUpgrade(ns, i, "Level", ns.hacknet.getLevelUpgradeCost(i, 1), 
                         ns.formulas.hacknetNodes.moneyGainRate(s.level + 1, s.ram, s.cores) - s.production, maxROI_Seconds);
            
            checkUpgrade(ns, i, "RAM", ns.hacknet.getRamUpgradeCost(i, 1), 
                         ns.formulas.hacknetNodes.moneyGainRate(s.level, s.ram * 2, s.cores) - s.production, maxROI_Seconds);
            
            checkUpgrade(ns, i, "Core", ns.hacknet.getCoreUpgradeCost(i, 1), 
                         ns.formulas.hacknetNodes.moneyGainRate(s.level, s.ram, s.cores + 1) - s.production, maxROI_Seconds);
        }

        await ns.sleep(1000);
    }
}

// Segédfüggvény a döntéshez
function checkUpgrade(ns, idx, type, cost, gainIncr, limit) {
    if (cost === Infinity || gainIncr <= 0) return;
    let roi = cost / gainIncr;

    if (roi < limit && ns.getServerMoneyAvailable("home") > cost) {
        if (type === "Level") ns.hacknet.upgradeLevel(idx, 1);
        if (type === "RAM") ns.hacknet.upgradeRam(idx, 1);
        if (type === "Core") ns.hacknet.upgradeCore(idx, 1);
        ns.print(`[UPGRADE] Node ${idx} ${type} | ROI: ${Math.round(roi)}s`);
    }
}