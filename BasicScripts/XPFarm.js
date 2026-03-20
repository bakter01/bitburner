/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0] || "joesguns";
    while (true) {
        await ns.weaken(target);
        await ns.grow(target);
    }
}