import PogObject from "../PogData"

const MouseEvent = Java.type("net.minecraftforge.client.event.MouseEvent")
const C08PacketPlayerBlockPlacement = Java.type("net.minecraft.network.play.client.C08PacketPlayerBlockPlacement")
const MCItemStack = Java.type("net.minecraft.item.ItemStack")

const sneakKey = new KeyBind(Client.getMinecraft().field_71474_y.field_74311_E)

/**
 * Gets the Skyblock item ID of the given MCItem or CT Item
 * @param {Item | MCItemStack} item 
 */
const getSkyblockItemID = (item) => {
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

const sendUseItem = () => {
    Client.sendPacket(new C08PacketPlayerBlockPlacement(Player.getHeldItem()?.getItemStack() ?? null))
}

const isHoldingEtherwarpItem = () => {
    const held = Player.getHeldItem()
    const sbId = getSkyblockItemID(held)

    if (sbId !== "ASPECT_OF_THE_END" && sbId !== "ASPECT_OF_THE_VOID" && sbId !== "ETHERWARP_CONDUIT") return false
    
    return held.getNBT()?.toObject()?.tag?.ExtraAttributes?.ethermerge == 1 || sbId == "ETHERWARP_CONDUIT"
}

const pogObj = new PogObject("LeftClickEtherwarp", {
    enabled: false,
}, "data/data.json")

let shouldUnsneak = true

// le toggle
register("command", () => {
    pogObj.enabled = !pogObj.enabled
    pogObj.save()
    ChatLib.chat(`&aLeft Click Etherwarp ${pogObj.enabled ? "&aEnabled" : "&cDisabled"}`)
}).setName("leftclicketherwarp").setAliases(["lcew"])

// Left click detection
register(MouseEvent, (event) => {
    const held = Player.getHeldItem()
    const item = getSkyblockItemID(held)
    if (!pogObj.enabled) return

    const btn = event.button
    const state = event.buttonstate
    if (btn !== 0 || !state || !isHoldingEtherwarpItem() || !Client.isTabbedIn()) return

    // Cancel the left click
    cancel(event)

    // Don't press the sneak key down if you're already sneaking
    const shouldSneak = !Player.isSneaking() && item !== "ETHERWARP_CONDUIT"
    if (shouldSneak) sneakKey.setState(true)
    
    Client.scheduleTask(0, () => {
        sendUseItem()
        if (!shouldUnsneak) return

        if (shouldSneak) sneakKey.setState(false)
    })
})

register("tick", () => {
    const sneakKeycode = sneakKey.getKeyCode()

    if (Keyboard.isKeyDown(sneakKeycode)) {
        shouldUnsneak = false
        return
    }
    
    shouldUnsneak = true
})