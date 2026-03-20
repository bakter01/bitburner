/** @param {NS} ns */
export async function main(ns) {
    const limit = ns.getPurchasedServerLimit(); 
    let ram = 8; 

    ns.disableLog("ALL");
    
    // A RÉGI ns.tail() HELYETT AZ ÚJ:
    ns.ui.openTail(); 

    while (true) {
        let servers = ns.getPurchasedServers();

        // 1. Ha még nincs meg a 25 szerver, veszünk újakat
        if (servers.length < limit) {
            if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
                let name = "pserv-" + servers.length;
                ns.purchaseServer(name, ram);
                ns.print(`Vásárolva: ${name} (${ram}GB)`);
            }
        } 
        // 2. Ha már megvan a 25, elkezdjük őket fejleszteni (Upgrade)
        else {
            // Megkeressük a legkisebb RAM-mal rendelkező szervert
            let minRam = Infinity;
            let targetServer = "";

            for (let s of servers) {
                let sRam = ns.getServerMaxRam(s);
                if (sRam < minRam) {
                    minRam = sRam;
                    targetServer = s;
                }
            }

            // A következő szint mindig a duplázás (pl. 8 -> 16 -> 32...)
            let upgradeRam = minRam * 2;
            
            // A játékban a max RAM egy szerveren 2^20 (1,048,576 GB)
            if (upgradeRam <= ns.getPurchasedServerMaxRam()) {
                if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(upgradeRam)) {
                    ns.print(`Fejlesztés: ${targetServer} -> ${upgradeRam}GB`);
                    ns.killall(targetServer);
                    ns.deleteServer(targetServer);
                    ns.purchaseServer(targetServer, upgradeRam);
                }
            } else {
                ns.print("Minden szerver elérte a MAXIMUMOT!");
                return; // Megáll a script, ha minden maxon van
            }
        }

        await ns.sleep(5000); // 5 másodpercenként ellenőriz
    }
}