/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();

    // A célpontok listája
    const targets = [
        "CSEC",
        "avmnite-02h",
        "I.I.I.I",
        "run4theh111z",
        "powerhouse-fitness",
        "fulcrumassets"
    ];

    for (const target of targets) {
        ns.print(`--- Célpont: ${target} ---`);

        // 1. Útvonal keresése (Hasonlóan a find.js logikájához)
        let route = findRoute(ns, target);

        if (!route) {
            ns.print(`HIBA: ${target} nem található a hálózaton!`);
            continue;
        }

        // 2. Kapcsolódás a szerverhez az útvonalon keresztül
        ns.print(`Kapcsolódás: ${route.join(" -> ")}`);
        for (const node of route) {
            ns.singularity.connect(node);
        }

        // 3. Backdoor telepítése
        // Ellenőrizzük, van-e elég root hozzáférésünk (nuke)
        if (!ns.hasRootAccess(target)) {
            ns.print(`HIBA: Nincs ROOT hozzáférés a ${target} szerverhez! Futtass NUKE-ot előbb.`);
        } else {
            ns.print(`Backdoor telepítése a ${target} szerverre...`);
            try {
                await ns.singularity.installBackdoor();
                ns.print(`SUCCESS: ${target} backdoor kész!`);
                ns.toast(`${target} backdoor kész!`, "success");
            } catch (e) {
                ns.print(`HIBA: Nem sikerült a telepítés ${target}-re. (Alacsony hacking szint?)`);
            }
        }

        // 4. Visszatérés a home-ra a következő célpont előtt
        ns.singularity.connect("home");
    }

    ns.print("Minden célpont feldolgozva.");
}

/** * Rekurzív függvény az útvonal megkereséséhez (BFS)
 * @param {NS} ns 
 * @param {string} target 
 */
function findRoute(ns, target) {
    let queue = [["home"]];
    let visited = new Set(["home"]);

    while (queue.length > 0) {
        let path = queue.shift();
        let node = path[path.length - 1];

        if (node === target) return path;

        for (let neighbor of ns.scan(node)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([...path, neighbor]);
            }
        }
    }
    return null;
}