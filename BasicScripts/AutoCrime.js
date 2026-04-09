/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();

    // Paraméter kezelése: ha nincs megadva, akkor egy elérhetetlenül alacsony számot adunk meg
    const argKarma = ns.args[0];
    const hasTarget = argKarma !== undefined;
    const targetKarma = hasTarget ? argKarma : -1e12; // -1 billió (gyakorlatilag végtelen)

    const minSuccessChance = 0.8; 

    const crimes = [
        "Shoplift", "Rob Store", "Mug someone", "Larceny", "Deal Drugs",
        "Bond Forgery", "Traffick Illegal Arms", "Homicide", "Grand Theft Auto",
        "Kidnap and Ransom", "Assassinate", "Heist"
    ];

    ns.print(hasTarget ? `Célkitűzés: ${targetKarma} Karma elérése.` : "Mód: Végtelenített farmolás.");

    while (ns.heart.break() > targetKarma) {
        let bestCrime = "Shoplift";
        let bestKarmaPerSecond = 0;

        for (const crime of crimes) {
            const stats = ns.singularity.getCrimeStats(crime);
            const chance = ns.singularity.getCrimeChance(crime);

            if (chance >= minSuccessChance) {
                // Karma per másodperc számítás
                const karmaPerSecond = (Math.abs(stats.karma) * chance) / (stats.time / 1000);
                
                if (karmaPerSecond > bestKarmaPerSecond) {
                    bestKarmaPerSecond = karmaPerSecond;
                    bestCrime = crime;
                }
            }
        }

        const currentKarma = ns.heart.break().toFixed(2);
        const stats = ns.singularity.getCrimeStats(bestCrime);
        
        ns.print(`--- JELENLEGI KARMA: ${currentKarma} ---`);
        if (hasTarget) ns.print(`Cél: ${targetKarma}`);
        ns.print(`Aktuális bűntény: ${bestCrime} (${(ns.singularity.getCrimeChance(bestCrime) * 100).toFixed(1)}%)`);
        
        const waitTime = ns.singularity.commitCrime(bestCrime);
        await ns.sleep(waitTime);
    }

    if (hasTarget) {
        ns.tprint(`Siker! Elérted a(z) ${targetKarma} Karmát. A script leállt.`);
    }
    ns.singularity.stopAction();
}