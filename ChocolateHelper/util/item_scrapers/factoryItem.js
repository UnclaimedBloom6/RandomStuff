import { decodeNumeral } from "../../../BloomCore/utils/Utils"
import { data } from "../utils"


export const doFactoryItem = (itemName, lore, slot) => {
    const match = itemName.match(/^§6Chocolate Factory ([IXVCM]+)$/)
    if (!match) return false

    data.factoryTier = decodeNumeral(match[1])
    data.factoryItemSlot = slot

    for (let line of lore) {
        if (line !== "§5§o§eClick to prestige!") continue
        data.canPrestige = true
        break
    }

    return true
}