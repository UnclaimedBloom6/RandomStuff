import PogObject from "../PogData"

const S2FPacketSetSlot = Java.type("net.minecraft.network.play.server.S2FPacketSetSlot")
const C0EPacketClickWindow = Java.type("net.minecraft.network.play.client.C0EPacketClickWindow")

let data = new PogObject("PianoProdigy", {
    "uuid": null,
    "delay": 0
}, "data.json")

const sendWindowClick = (windowId, slot, clickType, actionNumber=0) => Client.sendPacket(new C0EPacketClickWindow(windowId ?? Player.getContainer().getWindowId(), slot, clickType ?? 0, 0, null, actionNumber))
const slots = [37, 38, 39, 40, 41, 42, 43]
let canClick = false

const funkyStuff = () => {
    canClick = false
    let inv = Player.getContainer()
    if (!inv || !inv.getName().startsWith("Harp - ") || inv.getSize() < 54) return
    for (let s of slots) {
        let item = inv.getStackInSlot(s-9)
        if (!item) continue
        let name = item.getName()
        let split = name.split(" ")
        if (split.length < 2) continue
        let color = split[1][1]
        if (color == "7") continue
        sendWindowClick(null, s, 0)
        canClick = false
    }
}

register("packetReceived", () => {
    if (canClick) return
    canClick = true
    Client.scheduleTask(data.delay, funkyStuff)
}).setPacketClass(S2FPacketSetSlot)

register("step", () => {
    if (data.uuid == Player.getUUID()) return
    data.uuid = Player.getUUID()
    data.save()
    ChatLib.chat(`&a/harpdelay <ticks> to customize the delay before clicking. Lower values recommended for faster songs.`)
}).setFps(2)

register("command", (d) => {
    if (!d) return ChatLib.chat(`&aCurrent harp delay: &6${data.delay}`)
    data.delay = parseInt(d)
    data.save()
    ChatLib.chat(`&aHarp delay set to &6${data.delay}`)
}).setName("harpdelay")