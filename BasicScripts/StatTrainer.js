/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail(); // Most már az új, támogatott metódus!

    const targetLevel = ns.args[0] !== undefined ? ns.args[0] : 200;
    const stats = ["strength", "defense", "dexterity", "agility"];
    const gymName = "Powerhouse Gym";

    ns.print(`--- EDZÉSI TERV INDÍTÁSA (Cél: ${targetLevel}) ---`);
    ns.singularity.travelToCity("Sector-12");

    for (const stat of stats) {
        ns.print(`Aktuális fókusz: ${stat.toUpperCase()}`);
        
        while (ns.getPlayer().skills[stat] < targetLevel) {
            ns.singularity.gymWorkout(gymName, stat, false);
            
            let currentLevel = ns.getPlayer().skills[stat];
            let progress = ((currentLevel / targetLevel) * 100).toFixed(1);
            
            ns.print(`${stat}: ${currentLevel} / ${targetLevel} (${progress}%)`);
            await ns.sleep(30000);
        }
    }

    ns.tprint(`--- STATOK KÉSZ! (>= ${targetLevel}) ---`);
    ns.run("AutoCrime.js", 1, -90);
}