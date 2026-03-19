/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0]; // Target settings
    const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

    // Infinite loop
    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // If security is high weaken it
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // If money is low raise it
            await ns.grow(target);
        } else {
            // If optimal hack
            await ns.hack(target);
        }
    }
}