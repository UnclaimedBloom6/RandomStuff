import { getEtherwarpBlock, getLastSentLook, getSkyblockItemID } from "../BloomCore/utils/Utils"
import PogObject from "../PogData"

const S08PacketPlayerPosLook = Java.type("net.minecraft.network.play.server.S08PacketPlayerPosLook")
const C06PacketPlayerPosLook = Java.type("net.minecraft.network.play.client.C03PacketPlayer$C06PacketPlayerPosLook")

const C08PacketPlayerBlockPlacement = Java.type("net.minecraft.network.play.client.C08PacketPlayerBlockPlacement")

const dataObject = new PogObject("ZeroPingEtherwarp", {
    firstTime: true,
    enabled: false,
    keepMotion: true,
}, "data.json")

const firstInstallTrigger = register("tick", () => {
    firstInstallTrigger.unregister()
    if (!dataObject.firstTime) return

    dataObject.firstTime = false
    dataObject.save()

    const lines = [
        "",
        "Although initial testing has shown that this does not ban",
        "immediately, there may be some cases where this module will",
        "try to teleport to places where it can't. The prediction is",
        "good, but it's not perfect. There are no checks to prevent",
        "you from trying to teleport in rooms or areas which you",
        "shouldn't normally be able to teleport in, like certain puzzles",
        "or Skyblock areas. Lagbacks may also cause teleports to fail,",
        "as well as server lag. There are safeguards built in to limit",
        "how many fails are allowed before the module reverts back to",
        "normal etherwarps for a little bit, but don't be stupid with it.",
        "",
    ]

    const final = [
        `&b&m${ChatLib.getChatBreak(" ")}`,
        ChatLib.getCenteredText("&b&lZero Ping Etherwarp"),
        `${lines.join("\n")}`,
        ChatLib.getCenteredText("&4&lThis module is high risk to use."),
        `&b&m${ChatLib.getChatBreak(" ")}`,
    ].join("\n")

    ChatLib.chat(final)
})

register("command", (arg1, arg2) => {
    if (!arg1) {
        const message = [
            "&b/zpew - &3Shows this message",
            "&b/zpew toggle - &3Toggle the module",
            "&b/zpew keepmotion - &3Preserves momentum after teleporting"
        ].join("\n")
        ChatLib.chat(message)
        return
    }

    if (arg1 == "toggle") {
        dataObject.enabled = !dataObject.enabled
        dataObject.save()
        ChatLib.chat(`&aZero Ping Etherwarp ${dataObject.enabled ? "&aEnabled" : "&cDisabled"}&a.`)
        return
    }

    if (arg1 == "keepmotion") {
        dataObject.keepMotion = !dataObject.keepMotion
        dataObject.save()
        ChatLib.chat(`&aKeep Motion ${dataObject.keepMotion ? "&aEnabled" : "&cDisabled"}&a.`)
        return
    }
}).setName("zeropingetherwarp").setAliases(["zpew"]).setTabCompletions(["toggle", "keepmotion"])

const FAILWATCHPERIOD = 20 // 20 Seconds
const MAXFAILSPERFAILPERIOD = 3 // 3 fails allowed per 20 seconds. Higher numbers of fails could cause timer bans
const MAXQUEUEDPACKETS = 3 // Longest chain of queued zero ping teleports at a time
const recentFails = [] // Timestamps of the most recent failed teleports
const recentlySentC06s = [] // [{pitch, yaw, x, y, z, sentAt}, ...] in the order the packets were sent

const checkAllowedFails = () => {
    // Queue of teleports too long
    if (recentlySentC06s.length >= MAXQUEUEDPACKETS) return false
    
    // Filter old fails
    while (recentFails.length && Date.now() - recentFails[0] > FAILWATCHPERIOD * 1000) recentFails.shift()

    return recentFails.length < MAXFAILSPERFAILPERIOD
}

const validEtherwarpItems = new Set([
    "ASPECT_OF_THE_END",
    "ASPECT_OF_THE_VOID",
    "ETHERWARP_CONDUIT",
])

const isHoldingEtherwarpItem = () => {
    const held = Player.getHeldItem()
    const sbId = getSkyblockItemID(held)

    if (!validEtherwarpItems.has(sbId)) return false
    
    // Etherwarp conduit doesn't have the ethermerge NBT tag, the ability is there by default
    return held.getNBT()?.toObject()?.tag?.ExtraAttributes?.ethermerge == 1 || sbId == "ETHERWARP_CONDUIT"
}

const getTunerBonusDistance = () => {
    return Player.getHeldItem()?.getNBT()?.toObject()?.tag?.ExtraAttributes?.tuned_transmission || 0
}

const doZeroPingEtherwarp = () => {
    const rt = getEtherwarpBlock(true, 57 + getTunerBonusDistance() - 1)
    if (!rt) return

    let [pitch, yaw] = getLastSentLook()
    yaw %= 360
    if (yaw < 0) yaw += 360

    let [x, y, z] = rt

    x += 0.5
    y += 1.05
    z += 0.5

    recentlySentC06s.push({ pitch, yaw, x, y, z, sentAt: Date.now() })

    // The danger zone
    // At the end of this tick, send the C06 packet which would normally be sent after the server teleports you
    // and then set the player's position to the destination. The C06 being sent is what makes this true zero ping.
    Client.scheduleTask(0, () => {

        Client.sendPacket(new C06PacketPlayerPosLook(x, y, z, yaw, pitch, Player.asPlayerMP().isOnGround()))
        // Player.getPlayer().setPosition(x, y, z)
        Player.getPlayer().func_70107_b(x, y, z)

        // .setVelocity()
        if (!dataObject.keepMotion) Player.getPlayer().func_70016_h(0, 0, 0)
    })
}

// Don't teleport when looking at these blocks
const blacklistedIds = [
    54,  // Chest
    146, // Trapped Chest
]

// Detect when the player is trying to etherwarp
register("packetSent", (packet) => {
    if (!dataObject.enabled) return

    // Dir = 255 means no block was clicked
    const dir = packet.func_149568_f()
    if (dir !== 255) return

    const held = Player.getHeldItem()
    const item = getSkyblockItemID(held)
    const blockID = Player.lookingAt()?.getType()?.getID()
    if (!isHoldingEtherwarpItem() || !getLastSentLook() || !Player.isSneaking() && item !== "ETHERWARP_CONDUIT" || blacklistedIds.includes(blockID)) return
    if (!checkAllowedFails()) {
        ChatLib.chat(`&cZero ping etherwarp teleport aborted.\n&c${recentFails.length} fails last ${FAILWATCHPERIOD}s\n&c${recentlySentC06s.length} C06's queued currently`)
        return
    }

    doZeroPingEtherwarp()
}).setFilteredClass(C08PacketPlayerBlockPlacement)

// For whatever rounding errors etc occur
const isWithinTolerence = (n1, n2) => Math.abs(n1 - n2) < 1e-4

// Listening for server teleport packets
register("packetReceived", (packet, event) => {
    if (!dataObject.enabled || !recentlySentC06s.length) return

    const { pitch, yaw, x, y, z, sentAt } = recentlySentC06s.shift()

    const newPitch = packet.func_148930_g()
    const newYaw = packet.func_148931_f()
    const newX = packet.func_148932_c()
    const newY = packet.func_148928_d()
    const newZ = packet.func_148933_e()

    // All of the values of this S08 packet must match up to the last C06 packet which was sent when you teleported.
    const lastPresetPacketComparison = {
        pitch: isWithinTolerence(pitch, newPitch) || newPitch == 0,
        yaw: isWithinTolerence(yaw, newYaw) || newYaw == 0,
        x: x == newX,
        y: y == newY,
        z: z == newZ
    }

    const wasPredictionCorrect = Object.values(lastPresetPacketComparison).every(a => a == true)

    // The etherwarp was predicted correctly, cancel the packet since we've already sent the response back when we tried to teleport
    if (wasPredictionCorrect) return cancel(event)

    // The etherwarp was not predicted correctly
    recentFails.push(Date.now())
    
    // Discard the rest of the queued teleports to check since one earlier in the chain failed
    while (recentlySentC06s.length) recentlySentC06s.shift()

}).setFilteredClass(S08PacketPlayerPosLook)

