/** @param {NS} ns */
export async function main(ns) {
    // 1. Paraméter kezelése (alapértelmezett: +5, azaz a top 5 legjövedelmezőbb)
    const nParam = ns.args[0] !== undefined ? ns.args[0] : 5;
    const count = Math.abs(nParam);
    const mode = nParam >= 0 ? "PROFIT" : "KÖNNYŰ";

    // API keresése (a jól bevált fallback rendszer)
    let locationsFunc = null;
    let summaryFunc = null;
    if (ns.infiltration && typeof ns.infiltration.getInfiltrationLocations === 'function') {
        locationsFunc = () => ns.infiltration.getInfiltrationLocations();
        summaryFunc = (name) => ns.infiltration.getInfiltration(name);
    } else if (ns.infiltration && typeof ns.infiltration.getPossibleLocations === 'function') {
        locationsFunc = () => ns.infiltration.getPossibleLocations();
        summaryFunc = (name) => ns.infiltration.getInfiltration(name);
    } else {
        ns.tprint("!!! HIBA: Nem találom az Infiltration API-t.");
        return;
    }

    const locations = locationsFunc();
    const data = [];

    for (const loc of locations) {
        const info = summaryFunc(loc.name);
        data.push({
            name: loc.name,
            city: loc.city,
            difficulty: info.difficulty,
            money: info.reward.sellCash,
            rep: info.reward.tradeRep
        });
    }

    // 2. Dinamikus rendezés a paraméter előjele alapján
    data.sort((a, b) => {
        if (nParam >= 0) {
            // Pozitív: A legtöbb Reputációt adó szerverek előre
            return b.rep - a.rep;
        } else {
            // Negatív: A legkönnyebb (legalacsonyabb difficulty) előre
            return a.difficulty - b.difficulty;
        }
    });

    ns.tprint(`\n--- LISTÁZÁS: ${mode} (Top ${count}) ---`);
    
    // 3. Megjelenítés
    data.slice(0, count).forEach((item, i) => {
        ns.tprint(
            `${i + 1}. [${item.city}] ${item.name}\n` +
            `   Nehézség: ${item.difficulty.toFixed(2)} | ` +
            `   Pénz: $${ns.formatNumber(item.money)} | ` +
            `   Rep: ${ns.formatNumber(item.rep)}`
        );
    });
}