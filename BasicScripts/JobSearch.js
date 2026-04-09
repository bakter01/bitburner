/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail(); 

    const companies = [
        "ECorp", "MegaCorp", "KuaiGong International", "Four Sigma", "NWO",
        "Blade Industries", "OmniTek Incorporated", "Bachman & Associates",
        "Clarke Incorporated", "Fulcrum Technologies", "Aevum Police Headquarters",
        "Galactic Cybersystems", "NetLink Technologies", "CompTek", "Watchdog Security",
        "Rho Construction", "Iron Gym", "Powerhouse Gym", "Universal Energy",
        "Icarus Microsystems", "DeltaOne Software", "Solaris Space Systems",
        "Global Pharmaceuticals", "Nova Medical", "Omega Software", "Joe's Guns",
        "FoodNStuff", "Sigma Cosmetics", "Alpha Enterprises"
    ];

    const fields = ["Software", "IT", "Security", "Business", "Financial", "Software Consultant"];

    ns.print("--- MUNKAERŐPIACI JELENTÉS ---");
    // Formázott fejléc: Város (12 karakter), Cég (20), Beosztás (15), Szorzó (5)
    ns.print(ns.sprintf("%-12s | %-20s | %-15s | %-5s", "Város", "Cég", "Beosztás", "Mult"));
    ns.print("-".repeat(60));

    let foundAny = false;

    for (const companyName of companies) {
        for (const field of fields) {
            try {
                // Jelentkezés megkísérlése
                const success = ns.singularity.applyToCompany(companyName, field);
                
                if (success) {
                    // Céginformáció lekérése a városhoz és a szorzóhoz
                    const coInfo = ns.singularity.getCompanyInformation(companyName);
                    
                    ns.print(ns.sprintf("%-12s | %-20s | %-15s | %-5s", 
                        coInfo.city, 
                        companyName, 
                        field, 
                        coInfo.expMultiplier.toFixed(1) + "x"
                    ));
                    foundAny = true;
                }
            } catch (e) {
                // Ha a cég nem létezik vagy nincs ilyen részlege
                continue;
            }
        }
    }

    if (!foundAny) {
        ns.print("Nincs új előléptetés. Minden statodhoz tartozó legjobb állásban vagy már.");
    }

    ns.print("-".repeat(60));
}