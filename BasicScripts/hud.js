/** @param {NS} ns */
export async function main(ns) {
    // 1. ÖNELLENŐRZÉS
    const helpers = ns.ps("home");
    const alreadyRunning = helpers.filter(p => p.filename === ns.getScriptName()).length > 1;

    if (alreadyRunning) {
        ns.tprint("!!! HIBA: A HUD már fut! Ez a példány most leáll.");
        return; 
    }

    const doc = eval("document");
    const hook0 = doc.getElementById('overview-extra-hook-0');
    const hook1 = doc.getElementById('overview-extra-hook-1');

    ns.atExit(() => {
        hook0.innerText = "";
        hook1.innerText = "";
    });

    ns.disableLog("ALL");
    ns.tprint("HUD sikeresen elindítva.");

    while (true) {
        try {
            const headers = [];
            const values = [];

            // --- Pénzügyek és XP ---
            headers.push("Scripts: ");
            values.push("$" + ns.formatNumber(ns.getTotalScriptIncome()[0], 2) + '/s');

            let hnIncome = 0;
            for (let i = 0; i < ns.hacknet.numNodes(); i++) {
                hnIncome += ns.hacknet.getNodeStats(i).production;
            }
            headers.push("Hacknet: ");
            values.push("$" + ns.formatNumber(hnIncome, 2) + '/s');

            headers.push("Hack XP: ");
            values.push(ns.formatNumber(ns.getTotalScriptExpGain(), 2) + '/s');

            // --- Szerverek ---
            const pservs = ns.getPurchasedServers().length;
            headers.push("P-Servers: ");
            values.push(`${pservs} / ${ns.getPurchasedServerLimit()}`);

            // --- KARMA (AZ ÚJ RÉSZ) ---
            // A karma lekérése a rejtett statisztikából
            const karma = ns.getPlayer().karma;
            headers.push("Karma: ");
            // Ha elérted a -90-et, kap egy kis jelzést
            values.push(karma.toFixed(1) + (karma <= -90 ? " (OK)" : ""));

            // Kiírás a UI-ra
            hook0.innerText = headers.join("\n");
            hook1.innerText = values.join("\n");

            // Opcionális: Színkódolás a karmához (figyelem, ez az egész oszlop színét módosíthatja)
            if (karma <= -90) {
                hook1.style.color = "#00ff00"; // Zöld, ha minden kész
            } else {
                hook1.style.color = ""; // Alapértelmezett szín
            }

        } catch (e) {
            ns.print("HUD Error: " + e);
        }
        await ns.sleep(1000);
    }
}