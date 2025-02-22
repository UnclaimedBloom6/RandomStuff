import Promise from "../../PromiseV2";
import request from "../../requestV2";

export const worthless = new Set()
export const alwaysBuy = new Set()

const writeAlwaysBuy = () => {
    const toWrite = [...alwaysBuy].join("\n")
    FileLib.write("AutoCroesus", "data/always_buy.txt", toWrite)
}

const writeWorthless = () => {
    const toWrite = [...worthless].join("\n")
    FileLib.write("AutoCroesus", "data/worthless.txt", toWrite)
}

export const initAlwaysBuy = () => {
    // Grab always buy and worthless items from default as they've not been initialized yet
    ChatLib.chat(`Initializing data/always_buy.txt`)
    const defaultData = FileLib.read("AutoCroesus", "data/defaults/always_buy.txt")
    FileLib.write("AutoCroesus", "data/always_buy.txt", defaultData)
}

export const loadAlwaysBuy = () => {
    const alwaysBuyLines = FileLib.read("AutoCroesus", "data/always_buy.txt").split("\n")
    alwaysBuy.clear()
    for (let itemID of alwaysBuyLines) {
        alwaysBuy.add(itemID)
    }
}

export const initWorthless = () => {
    // Grab always buy and worthless items from default as they've not been initialized yet
    ChatLib.chat(`Initializing data/worthless.txt`)
    const defaultData = FileLib.read("AutoCroesus", "data/defaults/worthless.txt")
    FileLib.write("AutoCroesus", "data/worthless.txt", defaultData)
}

export const loadWorthless = () => {
    const worthlessLines = FileLib.read("AutoCroesus", "data/worthless.txt").split("\n")
    worthless.clear()
    for (let itemID of worthlessLines) {
        worthless.add(itemID)
    }
}

let cachedBzValues = {}
let cachedItems = {}
let cachedBins = {}

let itemIdMap = {} // {sbID: APIItemData}

if (FileLib.exists("AutoCroesus", "data/bzValues.json")) {
    cachedBzValues = JSON.parse(FileLib.read("AutoCroesus", "data/bzValues.json"))
}

if (FileLib.exists("AutoCroesus", "data/items.json")) {
    cachedItems = JSON.parse(FileLib.read("AutoCroesus", "data/items.json"))
    itemIdMap = {}

    for (let item of cachedItems) {
        itemIdMap[item.id] = item
    }
}

if (FileLib.exists("AutoCroesus", "data/binValues.json")) {
    cachedBins = JSON.parse(FileLib.read("AutoCroesus", "data/binValues.json"))
}

export const getBzValues = () => cachedBzValues
export const getSkyblockItems = () => cachedItems
export const getBinValues = () => cachedBins

export const getItemApiData = (sbId) => {
    if (!(sbId in itemIdMap)) {
        return null
    }

    return itemIdMap[sbId]
}

const handleBzData = (resp) => {
    if (!resp.success) {
        return [false, resp.cause]
    }

    let data = {}
    if (FileLib.exists("AutoCroesus", "data/bzValues.json")) {
        data = JSON.parse(FileLib.read("AutoCroesus", "data/bzValues.json"))
    }

    const products = resp.products

    for (let entry of Object.entries(products)) {
        let [itemID, info] = entry

        // Take the top three order and average their prices to try and get an accurate value for the item
        let buyOrders = info.buy_summary
        let sellOrderValue = info.quick_status.buyPrice
        if (buyOrders.length) {
            let sample = buyOrders.slice(0, 5)
            sellOrderValue = sample.reduce((a, b) => a + b.pricePerUnit, 0) / sample.length
        }

        // Insta sells go directly to buy orders
        let sellOrders = info.sell_summary
        let instaSellValue = info.quick_status.sellPrice
        if (sellOrders.length) {
            let sample = sellOrders.slice(0, 5)
            instaSellValue = sample.reduce((a, b) => a + b.pricePerUnit, 0) / sample.length
        }

        data[itemID] = {
            sellOrderValue,
            instaSellValue,
        }
    }

    cachedBzValues = data
    FileLib.write("AutoCroesus", "data/bzValues.json", JSON.stringify(data, null, 4), true)

    return [true, ""]
}

const handleItemResp = (resp) => {
    if (!resp.success) {
        return [false, resp.cause]
    }

    cachedItems = resp.items
    for (let item of cachedItems) {
        itemIdMap[item.id] = item
    }

    FileLib.write("AutoCroesus", "data/items.json", JSON.stringify(resp.items, null, 4), true)

    return [true, ""]
}

const handleBinResp = (resp) => {
    cachedBins = resp
    FileLib.write("AutoCroesus", "data/binValues.json", JSON.stringify(resp, null, 4))

    return [true, ""]
}

export const updatePrices = () => new Promise((resolve, reject) => {
    Promise.all([
        request({
            url: "https://api.hypixel.net/skyblock/bazaar",
            json: true
        }),
        request({
            url: "https://api.hypixel.net/v2/resources/skyblock/items",
            json: true
        }),
        request({
            url: "https://moulberry.codes/lowestbin.json" ,
            json: true
        }),
    ]).then(([bzResp, itemResp, binResp]) => {
        const bzSuccess = handleBzData(bzResp)
        const itemSuccesss = handleItemResp(itemResp) 
        const binSuccess = handleBinResp(binResp)

        if (!bzSuccess[0]) {
            reject(bzSuccess[1])
            return
        }
        
        if (!itemSuccesss[0]) {
            reject(itemSuccesss[1])
            return
        }

        if (!binSuccess[0]) {
            reject(binSuccess[1])
            return
        }

        resolve()
    }).catch(e => {
        reject(e)
    })

})


export const getSellPrice = (sbID, useSellOrder=true) => {
    // Override to avoid price manipulation
    if (worthless.has(sbID)) {
        return 0
    }

    const bzData = getBzValues()
    if (sbID in bzData) {
        if (useSellOrder) {
            return bzData[sbID].sellOrderValue
        }
        return bzData[sbID].instaSellValue
    }

    const binData = getBinValues()
    if (sbID in binData) {
        return binData[sbID]
    }

    return null
}

const itemIdExists = (itemID) => {
    if (itemID in itemIdMap || itemID in cachedBzValues) {
        return true
    }

    return false
}

export const addAlwaysBuy = (itemId) => {
    const upper = itemId.toUpperCase()
    if (alwaysBuy.has(upper)) {
        ChatLib.chat(`&cRemoved &f${upper} &cfrom Always Buy list!`)
        alwaysBuy.delete(upper)
        writeAlwaysBuy()
        return
    }

    if (!itemIdExists(upper)) {
        ChatLib.chat(`&cWarning: Could not find &f${upper} &cin the Skyblock items database. This could be a new item, so it will be added to the list anyway.`)
    }
    
    ChatLib.chat(`&aAdded &f${upper} &ato the list of items to always be bought.`)
    alwaysBuy.add(upper)
    writeAlwaysBuy()
}

export const addWorthlessItem = (itemId) => {
    const upper = itemId.toUpperCase()
    if (worthless.has(upper)) {
        worthless.delete(upper)
        ChatLib.chat(`&cRemoved &f${upper} &cfrom Always Buy list!`)
        writeWorthless()
        return
    }
    
    if (!itemIdExists(upper)) {
        ChatLib.chat(`&cWarning: Could not find &f${upper} &cin the Skyblock items database. This could be a new item, so it will be added to the list anyway.`)
    }

    ChatLib.chat(`&aAdded &f${upper} &ato the list of worthless items.`)
    worthless.add(upper)
    writeWorthless()

}