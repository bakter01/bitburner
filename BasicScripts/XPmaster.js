/** @param {NS} ns */
export async function main(ns) {
    const workerScript = "XPFarm.js";
    const target = "joesguns"; // Joesguns-nak jó a nehézség/idő aránya XP-hez
    
    // 1. Összegyűjtjük az összes szervert (Hálózat + Vásárolt)
    const allServers = new Set(["home"]);
    function scanAll(node) {
        for (const next of ns.scan(node)) {
            if (!allServers.has(next)) {
                allServers.add(next);
                scanAll(next);
            }
        }
    }
    scanAll("home");

    ns.tprint("--- XP Farm kampány indítása ---");

    for (const host of allServers) {
        // Csak ott futtatjuk, ahol van Root jogunk
        if (!ns.hasRootAccess(host)) continue;

        // Kiszámoljuk a szabad RAM-ot
        // Home esetén hagyunk 20GB-ot magunknak, más szervereken mindent viszünk
        let availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
        if (host === "home") availableRam -= 20; 

        const scriptRam = ns.getScriptRam(workerScript);
        const threads = Math.floor(availableRam / scriptRam);

        if (threads > 0) {
            // Megállítjuk a régi verziót, ha fut
            ns.scriptKill(workerScript, host);
            
            // Átmásoljuk és indítjuk
            if (host !== "home") {
                await ns.scp(workerScript, host, "home");
            }
            ns.exec(workerScript, host, threads, target);
            ns.print(`[XP FARM] ${host}: ${threads} szál indítva.`);
        }
    }
    ns.tprint("--- Minden szabad RAM XP farmolásra állítva! ---");
}