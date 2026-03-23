/** @param {NS} ns */
export async function main(ns) {
    ns.tprint("--- Rendszer indítása ---");
    // 0. SoftwareBuy indítása a háttérben, hogy közben gyűjtse a programokat
    //ns.run("SoftwareBuy.js");
    //await ns.sleep(1000);

    // 1. Hud inicializálása
    ns.run("hud.js"); 

    // 2. Hálózat feltörése (DeepScan)
    ns.run("Crawler.js");
    await ns.sleep(1000);

    // 3. Támadás elindítása
    ns.run("BasicLoader.js"); 

    // 4. XP Farm elindítása
    ns.run("XPMaster.js"); 

    // 5. Szervervásárló indítása a háttérben
    /*ns.run("ServerBuy.js");
    await ns.sleep(1000);*/
    
    ns.tprint("--- Minden alrendszer ONLINE ---");
}