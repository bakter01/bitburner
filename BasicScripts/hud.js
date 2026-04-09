/** @param {NS} ns */
export async function main(ns) {
    // 1. ÖNELLENŐRZÉS
    const helpers = ns.ps("home");
    const alreadyRunning = helpers.filter(p => p.filename === ns.getScriptName()).length > 1;

    if (alreadyRunning) {
        ns.tprint("!!! HIBA: A HUD már fut!");
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

    while (true) {
        try {
            const headers = [];
            const values = [];
            const player = ns.getPlayer();

            // --- PÉNZÜGYEK ---
            headers.push("Scripts: ");
            values.push("$" + ns.formatNumber(ns.getTotalScriptIncome()[0], 2) + '/s');

            // --- TAPASZTALAT ---
            headers.push("Hack XP: ");
            values.push(ns.formatNumber(ns.getTotalScriptExpGain(), 2) + '/s');

            // --- STATOK ---
            const karma = ns.heart.break();
            headers.push("Karma: ");
            values.push(ns.formatNumber(karma, 1) + (karma <= -90 ? " (OK)" : ""));

            const pservs = ns.getPurchasedServers().length;
            headers.push("P-Servers: ");
            values.push(`${pservs} / ${ns.getPurchasedServerLimit()}`);

            headers.push("City: ");
            values.push(player.city);

            // --- UI FRISSÍTÉS ---
            hook0.innerText = headers.join("\n");
            hook1.innerText = values.join("\n");

            // Színkódolás a Karma állapota alapján
            if (karma <= -90) {
                hook1.style.color = "#00ff00"; // Zöld, ha a Syndicate kész
            } else {
                hook1.style.color = "#ff6600"; // Narancs, amíg dolgozunk rajta
            }

        } catch (e) {
            ns.print("HUD Error: " + e);
        }
        await ns.sleep(1000);
    }
}