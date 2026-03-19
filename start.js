/** @param {NS} ns */
export async function main(ns) {
    ns.tprint("--- Rendszer indítása ---");

    // 1. Hálózat feltörése (DeepScan)
    ns.run("Crawler.js");
    await ns.sleep(1000);

    // 2. Szervervásárló indítása a háttérben
    ns.run("ServerBuy.js");
    await ns.sleep(1000);

    // 3. Támadás elindítása a TOP 10 célpont ellen
    ns.run("BasicLoader.js", 1, 10); 

    // 4. Hud inicializálása
    ns.run("hud.js"); 
    
    ns.tprint("--- Minden alrendszer ONLINE ---");
}