import PogObject from "../../PogData"
import logger from "./logger"
import { alwaysBuy, getItemApiData, getSellPrice, getSkyblockItems } from "./prices"


const C02PacketUseEntity = Java.type("net.minecraft.network.play.client.C02PacketUseEntity")
const EntityOtherPlayerMP = Java.type("net.minecraft.client.entity.EntityOtherPlayerMP")
const MCEntity = Java.type("net.minecraft.entity.Entity")
const Vec3 = Java.type("net.minecraft.util.Vec3")
const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand")

export const acPogObj = new PogObject("AutoCroesus", {
    lastApiUpdate: null,

    minClickDelay: 500,
    noClick: false,
    showChestInfo: false,

    useKismets: false,
    kismetMinProfit: 2_000_000,
    kismetFloors: [],
    
    useChestKeys: true,
    chestKeyMinProfit: 200_000,


}, "data/data.json")

acPogObj.autosave()

export const numerals = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
const REACH = 4
export const CHEST_REGEX = /^(§.)(Wood|Gold|Diamond|Emerald|Obsidian|Bedrock)$/

export const formattedBool = (bool) => bool ? "&atrue" : "&cfalse"
export const formatNumber = (num) => num?.toString()?.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

export const tierColors = {
    "COMMON": "&f",
    "UNCOMMON": "&a",
    "RARE": "&9",
    "EPIC": "&5",
    "LEGENDARY": "&6",
    "MYTHIC": "&d",
    "SPECIAL": "&c",
    "VERY_SPECIAL": "&c",
    "SUPREME": "&4",
}

// These items are not in the Skyblock items API endpoint, and thus can't have their item
// names automatically be mapped to item IDs.
export const itemReplacements = {
    "Shiny Wither Boots": "WITHER_BOOTS",
    "Shiny Wither Leggings": "WITHER_LEGGINGS",
    "Shiny Wither Chestplate": "WITHER_CHESTPLATE",
    "Shiny Wither Helmet": "WITHER_HELMET",
    "Shiny Necron's Handle": "NECRON_HANDLE",
    "Wither Shard": "SHARD_WITHER",
    "Thorn Shard": "SHARD_THORN",
    "Apex Dragon Shard": "SHARD_APEX_DRAGON",
    "Power Dragon Shard": "SHARD_POWER_DRAGON",
    "Scarf Shard": "SHARD_SCARF",
    "Necron Dye": "DYE_NECRON",
    "Livid Dye": "DYE_LIVID",
}

export const tryClickEntity = (entity) => {
    let finalEntity = entity
    if (entity instanceof Entity) {
        finalEntity = entity.getEntity()
    }
    if (!(finalEntity instanceof MCEntity)) {
        return false
    }

    const packet = new C02PacketUseEntity(finalEntity, new Vec3(0, 0, 0))
    Client.sendPacket(packet)

    return true
}

const findCroesusEntity = () => {
    const stands = World.getAllEntitiesOfType(EntityArmorStand).filter(a => a.getName() == "Croesus")
    if (!stands.length) return null

    const displayStand = stands[0]

    const players = World.getAllEntitiesOfType(EntityOtherPlayerMP).filter(a => {
        const distX = (displayStand.getX() - a.getX())
        const distY = (displayStand.getY() - a.getY())
        const distZ = (displayStand.getZ() - a.getZ())

        // ChatLib.chat(`distx=${distX} disty=${distY} distz=${distZ}`)

        return a.getUUID().version() == 2 && distX == 0 && distY == 0 && distZ == 0
    })

    if (!players.length) return null

    if (players.length > 1) {
        ChatLib.chat(`Found multiple possible croesus entities?`)
        return null
    }

    return players[0]
}

export const tryClickCroesus = () => {
    const croesusEntity = findCroesusEntity()

    if (!croesusEntity) {
        logger.push("Could not find croesus entity")
        return false
    }

    const distSq = (croesusEntity.getX() - Player.getX())**2 + (croesusEntity.getY() - Player.getY())**2 + (croesusEntity.getZ() - Player.getZ())**2

    // Too far away
    if (distSq > REACH**2) {
        logger.push("Croesus entity is too far away")
        return false
    }

    return tryClickEntity(croesusEntity.getEntity())
}

export const chestSlots = [10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30, 31, 32, 33, 34, 37, 38, 39, 40, 41, 42, 43]

export const isInvLoaded = (inv) => {
    return inv.getSize() > 45 && inv.getItems()[inv.getSize() - 45] !== null
}

export const inCroesus = () => {
    const inv = Player.getContainer()
    return isInvLoaded(inv) && inv.getName() == "Croesus"
}

export const inRunGui = () => {
    const inv = Player.getContainer()
    return /^(?:Master )?Catacombs - ([FloorVI\d ]*)$/.test(inv.getName())
}

export const getCurrPage = () => {
    const inv = Player.getContainer()
    
    const nextItem = inv.getStackInSlot(53)
    const prevItem = inv.getStackInSlot(45)

    if (!nextItem || !prevItem) return null

    if (nextItem.getName() == "§aNext Page") {
        const match =  nextItem.getLore()[1].match(/^§5§o§ePage (\d+)$/)
        if (!match) {
            return null
        }

        return parseInt(match[1]) - 1
    }
    
    if (prevItem.getName() == "§aPrevious Page") {
        const match =  prevItem.getLore()[1].match(/^§5§o§ePage (\d+)$/)
        if (!match) {
            return null
        }

        return parseInt(match[1]) + 1
    }

    return 1
}

export const findUnopenedChest = (inv, excludedIndexes=[], page, canKismet=true) => {
    const items = inv.getItems()

    for (let i = 0; i < chestSlots.length; i++) {
        let ind = chestSlots[i]
        // Index including pages
        let extendedIndex = ind + (page - 1) * 54

        if (excludedIndexes.includes(extendedIndex)) {
            continue
        }

        let item = items[ind]

        // They are ordered, none can appear after here
        if (!item) {
            logger.push(`Item in index ${i} is null`)
            return [null, null]
        }

        if (item.getRegistryName() !== "minecraft:skull") {
            logger.push(`Index ${i} is not a skull`)
            continue
        }

        if (!item.getLore().includes("§5§o§cNo chests opened yet!")) {
            logger.push(`Index ${i} already looted`)
            continue
        }

        // Find the floor
        let dungeonType = item.getName().removeFormatting()
        let floorMatch = item.getLore()[1].match(/^(?:§.)+§eFloor (\w+)$/)
        if (!floorMatch) {
            logger.push(`Could not match floor: "${item.getLore()[1]}"`)
            excludedIndexes.push(extendedIndex)
            return [null, null]
        }

        let floorNum = parseInt(floorMatch[1])
        if (isNaN(floorNum)) {
            floorNum = decodeNumeral(floorMatch[1])
        }

        let floorLetter = dungeonType == "Master Mode The Catacombs" ? "M" : "F"
        // let floorNum = decodeNumeral(floorMatch[1])
        let floor = `${floorLetter}${floorNum}`

        // Kismetting for this floor has been disabled for this session
        if (!canKismet && acPogObj.kismetFloors.includes(floor)) {
            excludedIndexes.push(extendedIndex)
            continue
        }

        return [ind, floor]
    }

    return [null, null]
}

const numeralValues = {
    "I": 1,
    "V": 5,
    "X": 10,
    "L": 50,
    "C": 100,
    "D": 500,
    "M": 1000
}

/**
 * Decodes a roman numeral into it's respective number. Eg VII -> 7, LII -> 52 etc.
 * Returns null if the numeral is invalid.
 * Supported symbols: I, V, X, L, C, D, M
 * @param {String} numeral 
 * @returns {Number | null}
 */
export const decodeNumeral = (numeral) => {
    if (!numeral.match(/^[IVXLCDM]+$/)) return null
    let sum = 0
    for (let i = 0; i < numeral.length; i++) {
        let curr = numeralValues[numeral[i]]
        let next = i < numeral.length-1 ? numeralValues[numeral[i+1]] : 0

        if (curr < next) {
            sum += next - curr
            i++
            continue
        }
        sum += curr
    }
    return sum
}

const tryParseBook = (line) => {
    const match = line.match(/^(?:§.)*Enchanted Book \((§d§l)?([\w ]+) (\w+)(?:§.)*\)$/) // https://regex101.com/r/zr3NwH/1
    if (!match) return null

    const [_, ultFormatting, bookName, tierStr] = match

    let tier = parseInt(tierStr)
    if (isNaN(tier)) {
        tier = decodeNumeral(tierStr)
    }
    const ult = !!ultFormatting

    const sbID = `ENCHANTMENT_${ult ? "ULTIMATE_" : ""}${bookName.toUpperCase().replace(/ /g, "_")}_${tier}`.replace("ULTIMATE_ULTIMATE_", "ULTIMATE_")

    return [sbID, 1]
}

const tryParseEssence = (line) => {
    const match = line.match(/^§5§o§d(\w+) Essence §8x(\d+)$/)
    if (!match) return null
    
    const [_, essType, qtyStr] = match
    
    const qty = parseInt(qtyStr)
    const sbID = `ESSENCE_${essType.toUpperCase()}`

    return [sbID, qty]
}

const tryParsePet = (line) => {
    // "§5§o§7[Lvl 1] §6Spirit"
    const match = line.match(/^(?:§.)*\[Lvl 1\] §(.)(\w+)$/)

    if (!match) {
        return null
    }

    const [_, color, pet] = match
    let tier = 3 // Epic
    
    if (color == "6") {
        tier = 4 // Legendary
    }

    return [`${pet.toUpperCase()};${tier}`, 1]
    
}

const tryParseLine = (line) => {
    const bookInfo = tryParseBook(line)
    if (bookInfo) {
        return bookInfo
    }

    const essenceInfo = tryParseEssence(line)
    if (essenceInfo) {
        return essenceInfo
    }

    const petInfo = tryParsePet(line)
    if (petInfo) {
        return petInfo
    }

    const itemUnformatted = line.removeFormatting().trim()

    if (itemUnformatted in itemReplacements) {
        return [itemReplacements[itemUnformatted], 1]
    }

    const itemInfo = getSkyblockItems()
    const entry = itemInfo.find(a => a.name == itemUnformatted && !a.id.startsWith("STARRED_"))

    if (!entry) {
        logger.push(`No item ID found for item "${line}"`)
        return [false, `Could not find item ID for line "${line}&r"`]
    }

    return [entry.id, 1]
}

export const parseRewards = (itemLines, costStr) => {
    const chestInfo = {
        cost: 0,
        value: 0,
        profit: 0,
        items: [] // [{id: SKYBLOCK_ID, qty: 2, value: 1000}, ...]
    }

    // Parse the chest cost
    logger.push(`Chest Cost is "${costStr}"`)
    if (costStr !== "§5§o§aFREE") {
        const costMatch = costStr.match(/^§5§o§6([\d,]+) Coins$/)
        // If the cost can't be found, then it's safer to just not claim this chest and have the user do it manually
        if (!costMatch) {
            logger.push("Could not match chest cost with regex")
            return [false, "Could not find chest cost"]
        }

        chestInfo.cost = parseInt(costMatch[1].replace(/,/g, ""))
    }

    // And now the items
    for (let line of itemLines) {
        logger.push(`Trying to parse line "${line}"`)
        let result = tryParseLine(line)

        // Could not parse this line. Return the entire line to print back to the user for debugging
        if (!result) {
            logger.push(`Failed to parse`)
            return [false, `Could not parse line: "${line}&r"`]
        }

        let [sbID, qty] = result
        let itemValue = getSellPrice(sbID, true)

        if (itemValue === null) {
            logger.push(`Item value of ${sbID} was null`)
            return [false, `Could not find value of \"${line}\"`]
        }

        chestInfo.value += itemValue * qty

        chestInfo.items.push({
            id: sbID,
            qty: qty,
            value: itemValue,
            displayName: line.replace(/^§5§o/, "")
        })
    }

    chestInfo.items.sort((a, b) => b.value * b.qty - a.value * a.qty)
    chestInfo.profit = chestInfo.value - chestInfo.cost

    return [true, chestInfo]
}

export const sortChestData = (chestData) => {
    chestData.sort((a, b) => {
        if (b.items.some(a => alwaysBuy.has(a.id))) {
            return Infinity
        }

        return b.profit - a.profit
    })
}

/**
 * Appends a string to a new line in a file. If the file does not exist, the file is created.
 * @param {String} moduleName 
 * @param {String} filePath 
 * @param {String} toWrite 
 * @returns 
 */
export const appendToFile = (moduleName, filePath, toWrite) => {
    if (!FileLib.exists(moduleName, filePath)) {
        FileLib.write(moduleName, filePath, toWrite, true)
        return
    }

    FileLib.append(moduleName, filePath, `\n${toWrite}`)
}

export const titleCase = (str) => {
    return str.replace(/(\b[a-z])/g, (a) => a.toUpperCase())
}

export const getFormattedNameFromId = (itemID) => {
    
    if (itemID.startsWith("ENCHANTMENT_ULTIMATE")) {
        let [_, enchant, tier] = itemID.match(/^ENCHANTMENT_ULTIMATE_([\w_]+)_(\d+)$/)
        
        if (itemID.startsWith("ENCHANTMENT_ULTIMATE_WISE")) enchant = "ULTIMATE_WISE"
        if (itemID.startsWith("ENCHANTMENT_ULTIMATE_JERRY")) enchant = "ULTIMATE_JERRY"

        enchant = titleCase(enchant.replace(/_/g, " ").toLowerCase())

        return `&aEnchanted Book (&d&l${enchant} ${numerals[parseInt(tier)]}&a)&r`
    }
    
    if (itemID.startsWith("ENCHANTMENT_")) {
        let [_, enchant, tier] = itemID.match(/^ENCHANTMENT_([\w_]+)_(\d+)$/)
        
        enchant = titleCase(enchant.replace(/_/g, " ").toLowerCase())
        let enchantColor = ""

        if (tier >= 9) {
            enchantColor = "&d"
        }
        else if (tier == 8) {
            enchantColor = "&6"
        }
        else if (tier == 7) {
            enchantColor = "&5"
        }
        else if (tier == 6) {
            enchantColor = "&9"
        }
        else if (tier == 5) {
            enchantColor = "&a"
        }
        else {
            enchantColor = "&f"
        }
    
        return `&aEnchanted Book (${enchantColor}${enchant} ${numerals[parseInt(tier)]}&a)&r`
    }

    if (itemID.startsWith("ESSENCE_")) {
        const [_, essType] = itemID.match(/^ESSENCE_(.+)$/)

        const essName = titleCase(essType.replace(/_/g, " ").toLowerCase())

        return `&d${essName} Essence&r`
    }

    const itemEntry = getItemApiData(itemID)

    if (!itemEntry) return itemID

    const tier = itemEntry.tier
    const name = itemEntry.name

    return `${tierColors[tier]}${name}`
}