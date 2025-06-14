
const MCItemStack = Java.type("net.minecraft.item.ItemStack")
export const C04PacketPlayerPosition = Java.type("net.minecraft.network.play.client.C03PacketPlayer$C04PacketPlayerPosition")
export const C06PacketPlayerPosLook = Java.type("net.minecraft.network.play.client.C03PacketPlayer$C06PacketPlayerPosLook")
export const C05PacketPlayerLook = Java.type("net.minecraft.network.play.client.C03PacketPlayer$C05PacketPlayerLook")
export const C03PacketPlayer = Java.type("net.minecraft.network.play.client.C03PacketPlayer")
export const S08PacketPlayerPosLook = Java.type("net.minecraft.network.play.server.S08PacketPlayerPosLook")
export const C0BPacketEntityAction = Java.type("net.minecraft.network.play.client.C0BPacketEntityAction")
export const C08PacketPlayerBlockPlacement = Java.type("net.minecraft.network.play.client.C08PacketPlayerBlockPlacement")

export const eyeHeights = {
    normal: 1.54,
    standing: 1.62,
    modern: 1.27,
}

const validEtherwarpItems = [
    "ASPECT_OF_THE_END",
    "ASPECT_OF_THE_VOID",
    "ETHERWARP_CONDUIT",
]

export const isEtherwarpItem = (item, itemID) => {

    if (!validEtherwarpItems.includes(itemID)) {
        return false
    }
    
    // Etherwarp conduit doesn't have the ethermerge NBT tag, the ability is there by default
    return item.getNBT()?.toObject()?.tag?.ExtraAttributes?.ethermerge == 1 || itemID == "ETHERWARP_CONDUIT"
}

export const getTunerBonusDistance = () => {
    return Player.getHeldItem()?.getNBT()?.toObject()?.tag?.ExtraAttributes?.tuned_transmission || 0
}

// If one of these blocks is above the targeted etherwarp block, it is a valid teleport.
// However if the block itself is being targetted, then it is not a valid block to etherwarp to.
const etherBlockTypes = [
    "minecraft:air",
    "minecraft:fire",
    "minecraft:carpet",
    "minecraft:skull",
    "minecraft:lever",
    "minecraft:stone_button",
    "minecraft:wooden_button",
    "minecraft:torch",
    "minecraft:tripwire_hook",
    "minecraft:tripwire",
    "minecraft:rail",
    "minecraft:activator_rail",
    "minecraft:snow_layer",
    "minecraft:carrots",
    "minecraft:wheat",
    "minecraft:potatoes",
    "minecraft:nether_wart",
    "minecraft:pumpkin_stem",
    "minecraft:melon_stem",
    "minecraft:redstone_torch",
    "minecraft:redstone_wire",
    "minecraft:red_flower",
    "minecraft:yellow_flower",
    "minecraft:sapling",
    "minecraft:flower_pot",
    "minecraft:deadbush",
    "minecraft:tallgrass",
    "minecraft:ladder",
    "minecraft:double_plant",
    "minecraft:unpowered_repeater",
    "minecraft:powered_repeater",
    "minecraft:unpowered_comparator",
    "minecraft:powered_comparator",
    "minecraft:web",
    "minecraft:water",
    "minecraft:lava",
    "minecraft:torch",
    "minecraft:vine",
    "minecraft:brown_mushroom",
    "minecraft:red_mushroom",
    "minecraft:piston_extension",
    "minecraft:portal",
    "minecraft:reeds",
    "minecraft:flowing_lava",
    "minecraft:cocoa",
].map(a => new BlockType(a).getID())

// Make it so that the array can be directly indexed into via the block id instead of having to calculate a hash with a set
// Each index corresponds to a block ID, where that index can either be true or false depending on if this is a valid ether foot block
const validEtherwarpFeetBlocks = new Array(500).fill(false).map((_, i) => etherBlockTypes.includes(i))

const isValidEtherwarpFootBlock = (blockID) => {
    if (blockID == null || blockID < 0 || blockID >= validEtherwarpFeetBlocks.length) {
        return false
    }

    return validEtherwarpFeetBlocks[blockID]
}

export const simEtherwarp = (x0, y0, z0, x1, y1, z1) => {
    // Initialize Shit
    let x = Math.floor(x0)
    let y = Math.floor(y0)
    let z = Math.floor(z0)

    let endX = Math.floor(x1)
    let endY = Math.floor(y1)
    let endZ = Math.floor(z1)

    const dirX = x1 - x0
    const dirY = y1 - y0
    const dirZ = z1 - z0

    const stepX = Math.sign(dirX)
    const stepY = Math.sign(dirY)
    const stepZ = Math.sign(dirZ)

    const thingX = 1 / dirX
    const thingY = 1 / dirY
    const thingZ = 1 / dirZ

    const tDeltaX = Math.min(thingX * stepX, 1)
    const tDeltaY = Math.min(thingY * stepY, 1)
    const tDeltaZ = Math.min(thingZ * stepZ, 1)
    
    let tMaxX = Math.abs((x + Math.max(stepX, 0) - x0) * thingX)
    let tMaxY = Math.abs((y + Math.max(stepY, 0) - y0) * thingY)
    let tMaxZ = Math.abs((z + Math.max(stepZ, 0) - z0) * thingZ)

    let iters = 0
    while (true && iters++ < 1000) {

        // Do block check function stuff
        let currentBlock = World.getBlockAt(x, y, z)
        
        // End Reached
        if (currentBlock.type.getID() !== 0) {
            // Cannot stand ontop
            if (isValidEtherwarpFootBlock(currentBlock.type.getID())) return null

            // Block the player's feet will be in after etherwarping
            let footBlock = World.getBlockAt(x, y+1, z)
            if (!isValidEtherwarpFootBlock(footBlock.type.getID())) return null

            // Head block after etherwarp
            let headBlock = World.getBlockAt(x, y+2, z)
            if (!isValidEtherwarpFootBlock(headBlock.type.getID())) return null

            return [x, y, z]
        }

        // End Reached without finding a block
        if (x == endX && y == endY && z == endZ) {
            return null
        }

        // Find the next direction to step in
        if (tMaxX < tMaxY) {
            if (tMaxX < tMaxZ) {
                tMaxX += tDeltaX
                x += stepX
            }
            else {
                tMaxZ += tDeltaZ
                z += stepZ
            }
        }
        else {
            if (tMaxY < tMaxZ) {
                tMaxY += tDeltaY
                y += stepY
            }
            else {
                tMaxZ += tDeltaZ
                z += stepZ
            }
        }
    }

    return null
}

/**
 * Gets the Skyblock item ID of the given MCItem or CT Item
 * @param {Item | MCItemStack} item 
 */
export const getSkyblockItemID = (item) => {
    if (item instanceof MCItemStack) item = new Item(item)
    if (!(item instanceof Item)) return null

    const extraAttributes = item.getNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")
    const itemID = extraAttributes?.getString("id") ?? null

    if (itemID !== "ENCHANTED_BOOK") return itemID
    
    // Enchanted books are a pain in the ass
    const enchantments = extraAttributes.getCompoundTag("enchantments")
    const enchants = [...enchantments.getKeySet()]
    if (!enchants.length) return null

    const enchantment = enchants[0]
    const level = enchantments.getInteger(enchants[0])

    return `ENCHANTMENT_${enchantment.toUpperCase()}_${level}`
}

// For etherwarp shit to be perfectly accurate
let lastSentCoords = null
let lastSentLook = null
export const getLastSentCoord = () => lastSentCoords ? [...lastSentCoords] : null 
/**
 * 
 * @returns {[Number, Number] | null} - The last [pitch, yaw] sent to the server
 */
export const getLastSentLook = () => lastSentLook ? [...lastSentLook] : null 

const getPacketCoord = (c03Packet) => {
    const x = c03Packet.func_149464_c()
    const y = c03Packet.func_149467_d()
    const z = c03Packet.func_149472_e()
    return [x, y, z]
}

const getPacketLook = (c03Packet) => {
    const pitch = c03Packet.func_149470_h()
    const yaw = c03Packet.func_149462_g()
    return [pitch, yaw]
}

register("packetSent", (packet) => {
    if (packet instanceof C04PacketPlayerPosition) lastSentCoords = getPacketCoord(packet)
    else if (packet instanceof C05PacketPlayerLook) lastSentLook = getPacketLook(packet)
    else if (packet instanceof C06PacketPlayerPosLook) {
        lastSentCoords = getPacketCoord(packet)
        lastSentLook = getPacketLook(packet)
    }
}).setFilteredClass(C03PacketPlayer)

register("worldUnload", () => {
    lastSentLook = null
    lastSentCoords = null
})
register("worldLoad", () => {
    lastSentLook = null
    lastSentCoords = null
})