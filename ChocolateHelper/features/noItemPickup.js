import { sendWindowClick } from "../../BloomCore/utils/Utils"
import config from "../util/config"
import { data } from "../util/utils"


register("guiMouseClick", (x, y, btn, gui, event) => {
    if (!data.inFactory || btn !== 0 || !config.noItemPickup) return
    const slot = Client.currentGui.getSlotUnderMouse()
    if (!slot) return
    
    const ind = slot.getIndex()
    // ChatLib.chat(`btn: ${btn}, slot: ${ind}`)
    cancel(event)
    const inv = Player.getContainer()
    sendWindowClick(inv.getWindowId(), ind, 0)
})
