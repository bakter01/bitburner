/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    if (!target) {
        ns.tprint("Hiba: Adj meg egy célpontot! (pl. run find.js run4theh111z)");
        return;
    }

    let visited = new Set();
    let path = [];

    function recursiveScan(current) {
        visited.add(current);
        path.push(current);

        if (current === target) {
            return true;
        }

        let neighbors = ns.scan(current);
        for (let next of neighbors) {
            if (!visited.has(next)) {
                if (recursiveScan(next)) return true;
            }
        }

        path.pop();
        return false;
    }

    if (recursiveScan("home")) {
        // Összerakjuk a connect parancsokat egyetlen sorba
        let output = "Útvonal megtalálva:\nhome; ";
        for (let i = 1; i < path.length; i++) {
            output += `connect ${path[i]}; `;
        }

        output += `backdoor;`;
        ns.tprint(output);
    } else {
        ns.tprint(`A szerver '${target}' nem található a hálózaton.`);
    }
}