/** @param {NS} ns */
export async function main(ns) {
    // Első paraméter a mélység (alapértelmezett: 30)
    const maxDepth = ns.args[0] || 30;
    const visited = new Set();

    ns.tprint(`--- Hálózat feltérképezése kezdődik (${maxDepth} szint mélyen) ---`);
    await scanServer("home", 0, maxDepth, ns, visited);
    ns.tprint("--- Feltérképezés kész! ---");
}

async function scanServer(hostname, currentDepth, maxDepth, ns, visited) {
    // Ha már voltunk itt, vagy elértük a limitet, megállunk
    if (visited.has(hostname) || currentDepth > maxDepth) return;
    visited.add(hostname);

    // 1. Megpróbáljuk feltörni (ha még nincs meg a root)
    if (!ns.hasRootAccess(hostname)) {
        let openPorts = 0;

        // Sorban kinyitjuk a portokat, ha megvannak az exe-k
        if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(hostname); openPorts++; }
        if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(hostname); openPorts++; }
        if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(hostname); openPorts++; }
        if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(hostname); openPorts++; }
        if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(hostname); openPorts++; }

        // Ha elég portot nyitottunk a NUKE-hoz
        const requiredPorts = ns.getServerNumPortsRequired(hostname);
        if (openPorts >= requiredPorts) {
            ns.nuke(hostname);
            ns.tprint(`[SUCCESS] NUKE sikeres: ${hostname}`);
        } else {
            ns.tprint(`[SKIP] Nincs elég portnyitó: ${hostname} (${requiredPorts} kellene)`);
        }
    }

    // 2. Megkeressük a szomszédokat és mélyebbre megyünk
    const neighbors = ns.scan(hostname);
    for (const neighbor of neighbors) {
        await scanServer(neighbor, currentDepth + 1, maxDepth, ns, visited);
    }
}