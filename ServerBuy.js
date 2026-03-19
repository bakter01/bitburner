/** @param {NS} ns */
export async function main(ns) {
    const ram = 8; // Kezdeti RAM méret (8, 16, 32... 2^n)
    let i = ns.getPurchasedServers().length;

    while (i < ns.getPurchasedServerLimit()) {
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            let hostname = ns.purchaseServer("pserv-" + i, ram);
            ns.tprint("Vásárolva: " + hostname);
            i++;
        }
        await ns.sleep(10000); // 10 másodpercenként csekkol
    }
    ns.tprint("Elérted a szerverlimit MAXIMUMÁT!");
}