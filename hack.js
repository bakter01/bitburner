/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    
    // Határértékek: a szerver alapértékeihez képest számolunk
    const moneyThresh = ns.getServerMaxMoney(target) * 0.9;
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

    while(true) {
        // Ha a biztonság elszállt, ELŐSZÖR gyengítünk
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        } 
        // Ha a pénz kevés, növelünk
        else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target);
        } 
        // Csak ha minden ideális, akkor hackelünk
        else {
            await ns.hack(target);
        }
    }
}