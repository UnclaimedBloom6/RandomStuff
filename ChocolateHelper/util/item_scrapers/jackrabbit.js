import { decodeNumeral } from "../../../BloomCore/utils/Utils"
import config from "../config"
import { data, updateBestUpgrade } from "../utils"

export const doJackrabbitItem = (itemName, lore, slot) => {
    const nameMatch = itemName.match(/^§dCoach Jackrabbit\s*(.+)?$/)
    if (!nameMatch) return false

    let level = 0
    const [_, tierNumeral] = nameMatch
    if (tierNumeral) level = decodeNumeral(tierNumeral)
        
    
    data.jackrabbit.level = level
    data.jackrabbit.slot = slot
    data.jackrabbit.cost = null

    for (let line of lore) {
        let costMatch = line.match(/^§5§o§6([\d,\.]+) Chocolate$/)
        if (!costMatch) continue

        data.jackrabbit.cost = parseInt(costMatch[1].replace(/,/g, ""))
        break
    }

    if (data.fullyLoaded && config.upgradeIncludeJackrabbit) updateBestUpgrade(true)

    return true
}