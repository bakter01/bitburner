/** @param {NS} ns */
export async function main(ns) {
    const doc = eval("document");
    const hook0 = doc.getElementById('overview-extra-hook-0');
    const hook1 = doc.getElementById('overview-extra-hook-1');

    ns.atExit(() => {
        hook0.innerText = "";
        hook1.innerText = "";
    });

    while (true) {
        try {
            const headers = [];
            const values = [];

            // Adatok lekérése - A javított formázó függvényekkel
            headers.push("Money/sec: ");
            values.push(ns.formatNumber(ns.getTotalScriptIncome()[0], 2) + '/s');

            headers.push("Hack XP/sec: ");
            values.push(ns.formatNumber(ns.getTotalScriptExpGain(), 2) + '/s');

            // Megjelenítés
            hook0.innerText = headers.join("\n");
            hook1.innerText = values.join("\n");
        } catch (e) {
            ns.print("HUD Error: " + e);
        }
        await ns.sleep(1000);
    }
}