/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail(); // A modern, támogatott módszer az ablak megnyitására

    const targetKarma = -90; 
    const minSuccessChance = 0.8; 

    const crimes = [
        "Shoplift", "Rob Store", "Mug someone", "Larceny", "Deal Drugs",
        "Bond Forgery", "Traffick Illegal Arms", "Homicide", "Grand Theft Auto",
        "Kidnap and Ransom", "Assassinate", "Heist"
    ];

    while (ns.heart.break() > targetKarma) {
        let bestCrime = "Shoplift";
        let bestKarmaPerSecond = 0;

        for (const crime of crimes) {
            const stats = ns.singularity.getCrimeStats(crime);
            const chance = ns.singularity.getCrimeChance(crime);

            if (chance >= minSuccessChance) {
                // Karma per másodperc számítás (Karma negatív, ezért abszolút érték)
                const karmaPerSecond = (Math.abs(stats.karma) * chance) / (stats.time / 1000);
                
                if (karmaPerSecond > bestKarmaPerSecond) {
                    bestKarmaPerSecond = karmaPerSecond;
                    bestCrime = crime;
                }
            }
        }

        const currentKarma = ns.heart.break().toFixed(2);
        const stats = ns.singularity.getCrimeStats(bestCrime);
        
        ns.print(`--- KARMA: ${currentKarma} / ${targetKarma} ---`);
        ns.print(`Aktuális bűntény: ${bestCrime}`);
        ns.print(`Várható bevétel: $${ns.formatNumber(stats.money)}`);
        
        const waitTime = ns.singularity.commitCrime(bestCrime);
        await ns.sleep(waitTime);
    }

    ns.tprint("CÉL ELÉRVE: Megvan a -90 Karma. Mehetünk a Syndicate-hez!");
    ns.singularity.stopAction();
}