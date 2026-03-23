/** @param {NS} ns */
export async function main(ns) {
    const programs = [
        "BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", 
        "HTTPWorm.exe", "SQLInject.exe", "Formulas.exe"
    ];

    ns.disableLog("ALL");
    
    while (true) {
        let allOwned = true;

        if (!ns.hasTorRouter()) {
            if (ns.getServerMoneyAvailable("home") >= 200000) {
                ns.singularity.purchaseTor();
            }
            allOwned = false;
        } else {
            for (let prog of programs) {
                if (!ns.fileExists(prog, "home")) {
                    let cost = ns.singularity.getDarkwebProgramCost(prog);
                    if (ns.getServerMoneyAvailable("home") >= cost && cost > 0) {
                        ns.singularity.purchaseProgram(prog);
                    } else {
                        allOwned = false; // Még nincs elég pénz erre a programra
                    }
                }
            }
        }

        if (allOwned) {
            ns.tprint("SoftwareBuy: Minden szoftver megvéve. A script leáll.");
            return; 
        }

        await ns.sleep(10000); // 10 másodpercenként csekkol, ha még gyűjtesz
    }
}