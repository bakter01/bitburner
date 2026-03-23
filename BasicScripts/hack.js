/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    if (!target) return;

    // Szigorúbb határértékek a maximális profit érdekében
    const moneyThresh = ns.getServerMaxMoney(target) * 0.95;
    const securityThresh = ns.getServerMinSecurityLevel(target) + 1; // Közel a minimumhoz tartjuk

    while(true) {
        let currentSecurity = ns.getServerSecurityLevel(target);
        let currentMoney = ns.getServerMoneyAvailable(target);

        if (currentSecurity > securityThresh) {
            // Weaken: A biztonság a legfontosabb, mert ez lassít le mindent
            await ns.weaken(target);
        } else if (currentMoney < moneyThresh) {
            // Grow: Pénz nélkül nincs mit hackelni
            await ns.grow(target);
        } else {
            // Hack: Csak ha a szerver "puha" és "tele van"
            await ns.hack(target);
        }
    }
}