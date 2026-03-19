/** @param {NS} ns */
export async function main(ns) {
    // 1. ÖNELLENŐRZÉS: Megnézzük, fut-e már ez a script
    // Ha a visszatérési érték nem null, és a PID nem a mostani scripté, akkor leállunk.
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

            // Adatok gyűjtése
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

            const pservs = ns.getPurchasedServers().length;
            headers.push("P-Servers: ");
            values.push(`${pservs} / ${ns.getPurchasedServerLimit()}`);

            // Kiírás a UI-ra
            hook0.innerText = headers.join("\n");
            hook1.innerText = values.join("\n");

        } catch (e) {
            ns.print("HUD Error: " + e);
        }
        await ns.sleep(1000);
    }
}