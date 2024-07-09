import { decodeNumeral } from "../../../BloomCore/utils/Utils"
import config from "../config"
import { data, updateBestUpgrade } from "../utils"

export const doTimeTowerItem = (itemName, lore, slot) => {
    const nameMatch = itemName.match(/^§dTime Tower\s*(.+)?$/)
    if (!nameMatch) return false

    let level = 0
    const [_, tierNumeral] = nameMatch
    if (tierNumeral) level = decodeNumeral(tierNumeral)
    
    data.timeTower.level = level
    data.timeTower.slot = slot
    data.timeTower.cost = null


    for (let line of lore) {
        let costMatch = line.match(/^§5§o§6([\d,\.]+) Chocolate$/)
        if (!costMatch) continue

        data.timeTower.cost = parseInt(costMatch[1].replace(/,/g, ""))
        break
    }

    if (data.fullyLoaded && config.upgradeIncludeTimeTower) updateBestUpgrade(true)

    return true
}