import { fn } from "../../BloomCore/utils/Utils"
import config from "../util/config"
import { data, highlightSlot } from "../util/utils"


// Chocolate display and CPS
register("renderSlot", (slot, gui, event) => {
    if (!data.inFactory || !config.showChocolate) return
    if (slot.getIndex() !== 13) return 

    
    const lines = [
        `&e${fn(data.chocolate)}`,
        `&6${fn(data.cps)}`
    ]
    
    Renderer.translate(slot.getDisplayX()+8, slot.getDisplayY(), 800)
    Renderer.retainTransforms(true)
    
    lines.forEach((line, i) => {
        let lineWidth = Renderer.getStringWidth(line)
        Renderer.drawString(line, -lineWidth/2, i*10-20)
    })
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

// Prestige highlight
register("renderSlot", (slot) => {
    if (!config.showPrestigeHighlight || !data.canPrestige || data.factoryItemSlot == null || slot.getIndex() !== data.factoryItemSlot) return

    highlightSlot(slot, 0, 255, 0, 255)
})