import { onOpenWindowPacket, onSetSlotReceived, onWindowItemsPacket } from "../../BloomCore/utils/Events";
import { C0DPacketCloseWindow, appendToFile, decodeNumeral } from "../../BloomCore/utils/Utils";
import config from "./config";
import { doChocolateItem } from "./item_scrapers/chocolateItem";
import { doChocolateProductionItem } from "./item_scrapers/chocolateProduction";
import { doEmployeeItem } from "./item_scrapers/employee";
import { doFactoryItem } from "./item_scrapers/factoryItem";
import { doJackrabbitItem } from "./item_scrapers/jackrabbit";
import { doTimeTowerItem } from "./item_scrapers/timeTower";
import { data, pogObj, resetData, updateBestUpgrade } from "./utils";

/**
 * Most of the item name and lore parsing is done here
 * It is a mess, so better to keep it all in one file.
*/

onOpenWindowPacket((title, windowId) => {
    if (pogObj.debug) appendToFile("ChocolateHelper", "debug/titles.txt", title)

    if (title !== "§rChocolate Factory§r") return

    data.windowId = windowId
    data.inFactory = true

})

onWindowItemsPacket((_, windowId) => {
    if (windowId == data.windowId && !data.inFactory) {
        data.inFactory = true
    }
})

register("packetSent", () => {
    resetData()
    data.windowId = null
}).setFilteredClass(C0DPacketCloseWindow)

register("guiClosed", () => {
    resetData()
})



onSetSlotReceived((item, slot, windowId, event) => {
    // To deal with the fuckery which occurs when navigating between guis
    if (windowId == data.windowId && !data.inFactory && Client.isInGui()) {
        data.inFactory = true
    }

    if (!data.inFactory || windowId !== data.windowId || !item) return

    try {
    const ctItem = new Item(item)
    const itemName = ctItem.getName()
    const lore = ctItem.getLore()

    if (pogObj.debug) {
        appendToFile("ChocolateHelper", "debug/itemnames.txt", `\n${itemName}`)
        appendToFile("ChocolateHelper", "debug/lore.txt", `\n${lore.join("\n")}`)
    }

    if (slot == 53) {
        data.fullyLoaded = true
        updateBestUpgrade(true)
    }

    if (doFactoryItem(itemName, lore, slot)) return
    if (doChocolateItem(itemName, lore, slot)) return
    if (doEmployeeItem(itemName, lore, slot)) return
    if (doChocolateProductionItem(itemName, lore)) return
    if (doJackrabbitItem(itemName, lore, slot)) return
    if (doTimeTowerItem(itemName, lore, slot)) return
    } catch(e) {
        console.log("Error on scraper#onSetSlotReceived: " + e)
    }
})