import { data } from "../utils"

export const doChocolateItem = (itemName, lore, slot) => {
    const chocolateMatch = itemName.match(/^§e([\d,\.]+) §6Chocolate$/)
    if (!chocolateMatch) return false

    data.chocolate = parseFloat(chocolateMatch[1].replace(/,/g, ""))
    data.chocolateSlot = slot

    for (let line of lore) {

        let cpsMatch = line.match(/^§5§o§6([\d,\.]+) §8per second$/)
        if (cpsMatch) {
            data.cps = parseFloat(cpsMatch[1].replace(/,/g, ""))
            data.baseCps = data.cps / data.cpsMultiplier
            continue
        }

        let allTimeChocolateMatch = line.match(/^§5§o§7All-time Chocolate: §6([\d,\.]+)$/)
        if (allTimeChocolateMatch) {
            data.allTimeChocolate = parseFloat(allTimeChocolateMatch[1].replace(/,/g, ""))
            continue
        }
    }

    return true
}