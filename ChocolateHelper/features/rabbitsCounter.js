import { onOpenWindowPacket, onSetSlotReceived } from "../../BloomCore/utils/Events"
import { pogObj } from "../util/utils"

let temporaryMap = new Map([ // Map to store temporarily
    ['common', { unique: 0, duplicates: 0, total: 0 }],
    ['uncommon', { unique: 0, duplicates: 0, total: 0 }],
    ['rare', { unique: 0, duplicates: 0, total: 0 }],
    ['epic', { unique: 0, duplicates: 0, total: 0 }],
    ['legendary', { unique: 0, duplicates: 0, total: 0 }],
    ['mythic', { unique: 0, duplicates: 0, total: 0 }],
    ['divine', { unique: 0, duplicates: 0, total: 0 }]
])

// Import through the menu
let wId
let shouldImport = false
let reachedEnd = false

onOpenWindowPacket((title, windowId) => {
    let match = title.match(/§r\((\d+)\/(\d+)\) Hoppity\'s Collection§r/) // §r(1/17) Hoppity's Collection§r

    if (!match) return
    wId = windowId

    let [_, a, b] = match

    if (a == 1) { // Reset the temporary map
        [...temporaryMap.keys()].forEach(rarity => {
            temporaryMap.get(rarity).unique = 0
            temporaryMap.get(rarity).duplicates = 0
            temporaryMap.get(rarity).total = 0
        })
        shouldImport = true
        reachedEnd = false
        expectedTotal = -1
        if (pogObj.rabbits.common.unique == 0) ChatLib.chat('&6[ChocolateHelper] &aScroll through the pages to import the rabbit data. (Don\'t spam click)')
    }

    if (a != b || !shouldImport) return
    reachedEnd = true
})

register('packetSent', () => { // Save on gui close to avoid the last page not counting
    if (shouldImport && reachedEnd) {
        let totalPossible = 0;
        let totalDuplicates = 0;
        let totalUniques = 0;

        [...temporaryMap.keys()].forEach(rarity => {
            totalUniques += pogObj.rabbits[rarity].unique = temporaryMap.get(rarity).unique
            totalDuplicates += pogObj.rabbits[rarity].duplicates = temporaryMap.get(rarity).duplicates
            totalPossible += pogObj.rabbits[rarity].total = temporaryMap.get(rarity).total

        })

        pogObj.rabbits.total = totalPossible
        pogObj.rabbits.totalDuplicates = totalDuplicates
        pogObj.rabbits.totalUniques = totalUniques
        pogObj.save()
        shouldImport = false
        ChatLib.chat('&6[ChocolateFactory] &aSuccessfully updated the rabbit data.')

        if (expectedTotal != totalPossible) ChatLib.chat('&6[ChocolateFactory] &cUnexpected total number of rabbits, try again.')
    }
}).setFilteredClass(Java.type('net.minecraft.network.play.client.C0DPacketCloseWindow'))

let expectedTotal = -1
onSetSlotReceived((item, slot, windowId) => {
    if (wId != windowId || slot > 53 || !item) return
    
    const ctItem = new Item(item)
    const lore = ctItem.getLore()

    if (ctItem.getName().includes('Hoppity\'s') && expectedTotal == -1) expectedTotal = parseInt(lore.find(line => line.startsWith("§5§o§2§l§m")).split('/')[1].removeFormatting())

    let duplicateMatch 
    let rarityMatch

    for (let line of lore) {
        if (!duplicateMatch) duplicateMatch = line.match(/^§5§o§7Duplicates Found: §a(\d+)$/) // §5§o§7Duplicates Found: §a0
        if (!rarityMatch) rarityMatch = line.match(/^§5§o§.§L(\w+) RABBIT$/) // §5§o§6§LLEGENDARY RABBIT
    }

    if (!rarityMatch) return
    
    let rarity = rarityMatch[1].toLowerCase()
    temporaryMap.get(rarity).total += 1 // Add to the total number of rabbits that exist on that rarity
    if (ctItem.getID() == 351) return // If not found dont continue
    
    let duplicates = 0 // 0 by default
    if (duplicateMatch) duplicates = parseInt(duplicateMatch[1])
    temporaryMap.get(rarity).unique += 1 // If theres a duplicate match, that means that the rabbit has been found, thus unique
    temporaryMap.get(rarity).duplicates += duplicates
})

// Add through eggs
register('chat', (rarity, event) => {
    rarity = rarity.toLowerCase().removeFormatting()

    let hoverValue = new Message(event).getMessageParts().find(text => text.getHoverValue() != null)?.getHoverValue() 
    if (!hoverValue) return

    if (hoverValue.includes('NEW RABBIT!')) { // https://i.imgur.com/692Fkja.png
    pogObj.rabbits[rarity].unique += 1
    pogObj.rabbits[rarity].totalUniques += 1
    pogObj.rabbits.totalUniques += 1
    } else {
        pogObj.rabbits[rarity].duplicates += 1
        pogObj.rabbits[rarity].totalDuplicates += 1
        pogObj.rabbits.totalDuplicates += 1
    }
    pogObj.save()
}).setCriteria(/&r&D&LHOPPITY'S HUNT &7You found .+ &.\(&.&.(.+)&.\)!&r/)