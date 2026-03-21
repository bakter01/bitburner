/** @param {NS} ns */
export async function main(ns) {
    ns.tprint("--- Rendszer indítása ---");

    // 1. Hálózat feltörése (DeepScan)
    ns.run("Crawler.js");
    await ns.sleep(1000);

    // 2. Támadás elindítása
    ns.run("AdvLoader.js"); 

    // 3. XP Farm elindítása
    ns.run("AdvXPFarmMin.js"); 

    // 4. Szervervásárló indítása a háttérben
    /*ns.run("ServerBuy.js");
    await ns.sleep(1000);*/

    
    await ns.sleep(5000);
    // 99. Hud inicializálása
    ns.run("hud.js"); 
    
    ns.tprint("--- Minden alrendszer ONLINE ---");
}