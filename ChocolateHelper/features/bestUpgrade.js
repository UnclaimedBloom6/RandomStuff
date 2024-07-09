import { sendWindowClick } from "../../BloomCore/utils/Utils"
import config from "../util/config"
import { data, highlightSlot, updateBestUpgrade } from "../util/utils"

let lastClick = null
let waitingForUpgrade = false

// Rendering
register("renderSlot", (slot) => {
    if (!config.showBestUpgrade || !data.bestUpgrade) return

    if (slot.getIndex() !== data.bestUpgrade.slot) return

    const canAfford = data.bestUpgrade.cost < data.chocolate

    let [r, g, b] = canAfford ? [0, 255, 0] : [255, 0, 0]

    highlightSlot(slot, r, g, b, 255)
})

const resetWaiting = () => {
    waitingForUpgrade = false
}

register("chat", resetWaiting).setCriteria(/^Rabbit \w+ has been promoted to \[\d+\] .+!$/)
register("chat", resetWaiting).setCriteria(/^You upgraded to Time Tower.+!$/)
register("chat", resetWaiting).setCriteria(/^You upgraded to Coach Jackrabbit.+!$/)

// Auto Clicking
register("step", () => {
    if (!config.autoBuyBestUpgrade || !data.bestUpgrade || data.chocolate < data.bestUpgrade.cost) return
    // Can't click yet
    const timeSinceUpgrade = Date.now() - lastClick
    if (timeSinceUpgrade < 1000 / config.maxUpgradesPerSecond) return
    if (waitingForUpgrade && timeSinceUpgrade < 1000) return

    const inv =  Player.getContainer()
    
    lastClick = Date.now()
    waitingForUpgrade = true
    sendWindowClick(inv.getWindowId(), data.bestUpgrade.slot)
})
