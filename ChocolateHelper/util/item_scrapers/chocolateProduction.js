import { data } from "../utils"

export const doChocolateProductionItem = (itemName, lore) => {
    if (itemName !== "§6Chocolate Production") return false

    for (let line of lore) {
        let totalMultiMatch = line.match(/^§5§o§7Total Multiplier: §6([\d\,.]+)x$/)
        if (totalMultiMatch) {
            let [_, multiplier] = totalMultiMatch
            data.cpsMultiplier = parseFloat(multiplier)
            data.baseCps = data.cps / data.cpsMultiplier
            continue
        }

        // Cps Sources
        // https://regex101.com/r/NH3uID/1
        let cpsSourceMatch = line.match(/^§5§o  §6\+([\d\.,]+) §8\((?:§.)*(.+)§8\)$/)
        if (cpsSourceMatch) {
            let [_, cps, source] = cpsSourceMatch
            data.cpsSources[source] = parseFloat(cps.replace(/,/g, ""))
            continue
        }

        // Multipliers
        // https://regex101.com/r/zOhycJ/1
        let multiplierMatch = line.match(/^§5§o  §6\+([\d\.]+)x §8\((?:§.)*(.+)§8\)$/)
        if (multiplierMatch) {
            let [_, multiplier, source] = multiplierMatch
            data.productionMultipliers[source] = parseFloat(multiplier)
            continue
        }
    }

    return true
}