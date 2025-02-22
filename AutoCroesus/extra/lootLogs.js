import { getSellPrice } from "../util/prices"
import { appendToFile, formatNumber, getFormattedNameFromId } from "../util/utils"

const getScoreFromChestCount = (chestCount) => {
    // Less than A
    if (chestCount == 3) {
        return 229
    }

    // A
    if (chestCount == 4) {
        return 230
    }

    // S, assumes all floors below F5 can't get S+ because there's no way to differentiate based on chest count
    if (chestCount == 5) {
        return 270
    }

    // S+
    if (chestCount == 6) {
        return 300
    }

    // Should never happen
    return 0
}

export const logLoot = (floor, chestInfo, chestCount) => {
    const totalCost = chestInfo.reduce((a, b) => a + b.cost, 0)
    // const totalProfit = chestInfo.reduce((a, b) => a + b.profit, 0)
    const score = getScoreFromChestCount(chestCount)

    // ChestInfo should only contain the info for the chests which were actually claimed. So one normally, two if chest key used.
    const combinedItems = chestInfo.reduce((totalLoot, chest) => {
        for (let entry of chest.items) {
            let { id, qty } = entry

            if (!(id in totalLoot)) totalLoot[id] = 0

            totalLoot[id] += qty
        }

        return totalLoot
    }, {})

    const combinedItemStr = Object.entries(combinedItems).map(([sbid, qty]) => `${sbid}:${qty}`).join(" ")
    
    // Format: FLOOR SCORE CHEST_COST ...SKYBLOCK_ID:QTY
    const final = `${floor} ${score} ${totalCost} ${combinedItemStr}`
    
    appendToFile("AutoCroesus", "data/runLoot.txt", final)
}

const getFiltersFromArgs = (...args) => {
    const final = {
        score: 300, // Minimum score
        floor: null,
        limit: null // Max number of runs to include in the log
    }

    for (let segment of args) {
        let scoreMatch = segment.match(/^(?:score|s):(\d+)$/)
        if (scoreMatch) {
            let score = parseInt(scoreMatch[1])
            if (score < 0 || score > 317) {
                ChatLib.chat(`Score ${score} not in valid range 0 - 317`)
                return null
            }

            final.score = score
        }

        let floorMatch = segment.match(/^(?:f|floor):([fFmM][1-7])$/)
        if (floorMatch) {
            final.floor = floorMatch[1].toUpperCase()
        }

        let limitMatch = segment.match(/^(?:l|limit):(\d+)$/)
        if (limitMatch) {
            final.limit = parseInt(limitMatch[1])
        }
    }

    return final
}

export const handleLootCommand = (...args) => {
    if (args[1] == "help") {
        ChatLib.chat(`&e//ac loot [floor:<floor>] [limit:<limit>] [score:<score_num>]`)
        ChatLib.chat(`For example: "&b//ac loot floor:F5 limit:100 score:300&f" will show the last 100 runs logged on Floor 5 with a score of 300 or more.`)
        return
    }

    const filters = getFiltersFromArgs(...args)
    if (!filters) {
        ChatLib.chat(`Invalid Filters`)
        return
    }

    const { score, floor, limit } = filters

    if (!FileLib.exists("AutoCroesus", "data/runLoot.txt")) {
        ChatLib.chat(`No loot has been logged!`)
        return
    }

    const lines = FileLib.read("AutoCroesus", "data/runLoot.txt").split("\n").reverse()
    let dungeons = 0
    let loot = {}
    let totalChestCost = 0
    for (let line of lines) {
        let [runFloor, runScore, chestCost, ...runLoot] = line.split(" ")
        if (floor && runFloor !== floor) continue
        if (runScore < score) continue
        dungeons++
        totalChestCost += parseInt(chestCost)

        for (let itemInfo of runLoot) {
            let [itemID, quantStr] = itemInfo.split(":")

            if (!(itemID in loot)) loot[itemID] = 0
            loot[itemID] += parseInt(quantStr)

        }

        if (dungeons == limit) break
    }

    let totalProfit = -totalChestCost
    let floorColor = floor?.startsWith("M") ? "&c&l" : "&a"
    let renderStr = `&aLoot from &e${formatNumber(dungeons)} &aruns on ${floorColor}${floor ?? "All Floors"}&a:`
    // ["ITEM_ID", ITEM_VALUE, QUANTITY]
    // Sort by total value qty*value
    const itemInfo = Object.entries(loot).reduce((a, [item, quant]) => {
        let value = getSellPrice(item, true) ?? 0

        totalProfit += value * quant

        a.push([item, value, quant])
        return a
    }, []).sort((a, b) => b[1]*b[2] - a[1]*a[2])

    let totalSellPrice = totalProfit + totalChestCost
    let extraLoot = [0, 0] // [amount, value]

    for (let i = 0; i < itemInfo.length; i++) {
        let entry = itemInfo[i]
        let [itemID, value, quantity] = entry
        let totalValue = value * quantity

        if (i >= 25) {
            extraLoot[0]++
            extraLoot[1] += totalValue
            continue
        }

        renderStr += `\n&b${formatNumber(quantity)}x &a${getFormattedNameFromId(itemID)} &a(&6${formatNumber(Math.floor(value))}&a) = &6${formatNumber(Math.floor(totalValue))} &8(${(totalValue / totalSellPrice*100).toFixed(2)}%)`
    }

    if (extraLoot[0] > 0) {
        renderStr += `\n&a... and ${extraLoot[0]} more (&6${formatNumber(Math.floor(extraLoot[1]))}&a)`
    }

    renderStr += `\n&cTotal Chest Cost: &6${formatNumber(Math.floor(totalChestCost))}`
    renderStr += `\n&cTotal Sell Price: &6${formatNumber(Math.floor(totalSellPrice))}`
    renderStr += `\n&eTotal Profit: &6${formatNumber(Math.floor(totalProfit))}`
    renderStr += `\n&bProfit/Run: &6${formatNumber(Math.floor(totalProfit/dungeons))}`
    
    const averageProfit = Math.floor(totalProfit / dungeons)

    ChatLib.chat(`&aAverage profit from &e${dungeons} &aruns on &b${floor ?? "All Floors"}&a: &6${formatNumber(averageProfit)}`)
    new TextComponent(`&aTotal Profit: &6${formatNumber(Math.floor(totalProfit))}`).setHover("show_text", renderStr).chat()
}