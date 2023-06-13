/// <reference types="../CTAutocomplete" />

import { getEtherwarpBlock, getSkyblockItemID } from "../BloomCore/utils/Utils"
import config from "./config"


register("command", () => {
    config.openGUI()
}).setName("zeropingetherwarp").setAliases(["etherwarp", "zpew"])

const teleportTo = (x, y, z) => Player.getPlayer().func_70107_b(x, y, z)

const baseEtherwarpDistance = 57
register("playerInteract", (action, pos, event) => {
    if (!config.zeroPingEtherwarp || action.toString() !== "RIGHT_CLICK_EMPTY") return
    if (!Player.isSneaking()) return

    // Check that ur actually holding an etherwarp item
    const heldItem = Player.getHeldItem()
    if (!heldItem || !["ASPECT_OF_THE_VOID", "ASPECT_OF_THE_END"].includes(getSkyblockItemID(heldItem))) return

    // Check for etherwarp and get number of tuners
    const extraAttributes = heldItem.getNBT().getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")
    const hasEtherwarp = extraAttributes?.getInteger("ethermerge") == 1
    const tuners = extraAttributes?.getInteger("tuned_transmission") ?? 0
    if (!hasEtherwarp) return

    const distance = baseEtherwarpDistance + tuners

    // Do the etherwarp stuff
    const endBlock = getEtherwarpBlock(true, distance)
    if (!endBlock) return

    const [x, y, z] = endBlock
    teleportTo(x+0.5, y+1.05, z+0.5)
    //                .setVelocity(0, 0, 0)
    Player.getPlayer().func_70016_h(0, 0, 0)
})
