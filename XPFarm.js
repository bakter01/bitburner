/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0] || "joesguns";
    while (true) {
        // Csak weaken, semmi más.
        await ns.weaken(target);
    }
}