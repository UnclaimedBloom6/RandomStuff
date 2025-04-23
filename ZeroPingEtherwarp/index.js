import PogObject from "../PogData"
import {
    C06PacketPlayerPosLook,
    C08PacketPlayerBlockPlacement,
    C0BPacketEntityAction,
    getLastSentCoord,
    getLastSentLook,
    getSkyblockItemID,
    getTunerBonusDistance,
    isEtherwarpItem,
    S08PacketPlayerPosLook,
    simEtherwarp,
    SNEAKING_EYE_HEIGHT,
    STANDING_EYE_HEIGHT
} from "./utils"

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
let isSneaking = false

register("packetSent", (packet) => {
    const action = packet.func_180764_b()

    if (action == C0BPacketEntityAction.Action.START_SNEAKING) {
        isSneaking = true
    }
    else if (action == C0BPacketEntityAction.Action.STOP_SNEAKING) {
        isSneaking = false
    }
}).setFilteredClass(C0BPacketEntityAction)

register("worldUnload", () => {
    isSneaking = false
})

register("worldLoad", () => {
    isSneaking = false
})

const checkAllowedFails = () => {
    // Queue of teleports too long
    if (recentlySentC06s.length >= MAXQUEUEDPACKETS) return false
    
    // Filter old fails
    while (recentFails.length > 0 && Date.now() - recentFails[0] > FAILWATCHPERIOD * 1000) {
        recentFails.shift()
    }

    return recentFails.length < MAXFAILSPERFAILPERIOD
}

// Have to do this since scheduleTask sometimes doesn't fucking run, so we've gotta send it at the start of the next tick.
let c06ToSend = null
const c06Sender = register("tick", () => {
    c06Sender.unregister()
    
    // Should never happen but best to be careful
    if (!c06ToSend) {
        return
    }

    const { x, y, z, pitch, yaw } = c06ToSend

    Player.getPlayer().func_70107_b(x, y, z)
    Client.sendPacket(new C06PacketPlayerPosLook(x, y, z, yaw, pitch, Player.asPlayerMP().isOnGround()))

    if (!dataObject.keepMotion) {
        Player.getPlayer().func_70016_h(0, 0, 0) //.setVelocity()
    }

    c06Sender.unregister()
}).unregister()

const doZeroPingEtherwarp = (x0, y0, z0, pitch, yaw) => {
    const distance = 57 + getTunerBonusDistance() - 1

    yaw %= 360
    if (yaw < 0) {
        yaw += 360
    }

    const f = Math.cos(-yaw * 0.017453292 - Math.PI)
    const f1 = Math.sin(-yaw * 0.017453292 - Math.PI)
    const f2 = -Math.cos(-pitch * 0.017453292)
    const f3 = Math.sin(-pitch * 0.017453292)

    const dx = f1 * f2 * distance
    const dy = f3 * distance
    const dz = f * f2 * distance

    const eyePos = y0 + (isSneaking ? SNEAKING_EYE_HEIGHT : STANDING_EYE_HEIGHT)
    const etherSpot = simEtherwarp(x0, eyePos, z0, x0+dx, eyePos+dy, z0+dz)

    if (!etherSpot) {
        return
    }

    let [x, y, z] = etherSpot

    x += 0.5
    y += 1.05
    z += 0.5

    recentlySentC06s.push({ pitch, yaw, x, y, z, sentAt: Date.now() })

    // The danger zone
    // At the end of this tick, send the C06 packet which would normally be sent after the server teleports you
    // and then set the player's position to the destination. The C06 being sent is what makes this true zero ping.
    c06ToSend = { x, y, z, pitch, yaw }
    c06Sender.register()
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
    const sbId = getSkyblockItemID(held)

    // Not holding etherwarp item or looking at chest
    if (!isEtherwarpItem(held, sbId) || blacklistedIds.includes(Player.lookingAt()?.getType()?.getID())) {
        return
    }

    // Enable zero ping for etherwarp conduit
    if (!isSneaking && sbId !== "ETHERWARP_CONDUIT") {
        return
    }

    const lastLook = getLastSentLook()
    const lastStand = getLastSentCoord()

    // Always sync with the server
    if (!lastLook || !lastStand) {
        return
    }
    
    // Failsafe
    if (!checkAllowedFails()) {
        ChatLib.chat(`&cZero ping etherwarp teleport aborted.\n&c${recentFails.length} fails last ${FAILWATCHPERIOD}s\n&c${recentlySentC06s.length} C06's queued currently`)
        return
    }

    const [x0, y0, z0] = lastStand
    const [pitch, yaw] = lastLook

    doZeroPingEtherwarp(x0, y0, z0, pitch, yaw)
}).setFilteredClass(C08PacketPlayerBlockPlacement)

// For whatever rounding errors etc occur
const isWithinTolerence = (n1, n2) => Math.abs(n1 - n2) < 1e-4

// Listening for server teleport packets
register("packetReceived", (packet, event) => {
    if (!dataObject.enabled || recentlySentC06s.length == 0) return

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
    if (wasPredictionCorrect) {
        cancel(event)
        return
    }

    // The etherwarp was not predicted correctly
    recentFails.push(Date.now())
    
    // Discard the rest of the queued teleports to check since one earlier in the chain failed
    while (recentlySentC06s.length > 0) {
        recentlySentC06s.pop()
    }

}).setFilteredClass(S08PacketPlayerPosLook)
