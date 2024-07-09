import { sendWindowClick } from "../../BloomCore/utils/Utils"
import config from "../util/config"
import { data, highlightSlot } from "../util/utils"

const acKey = new KeyBind("Click!", Keyboard.KEY_NONE, "Chocolate!")

let lastClick = Date.now()
let isClicking = false
let lastKeyState = false

register("tick", () => {
    // The keybind logic
    if (!data.inFactory) {
        isClicking = false
        lastKeyState = false
        return
    }
    const currKeyState = Keyboard.isKeyDown(acKey.getKeyCode())

    if (currKeyState && !lastKeyState) isClicking = !isClicking
    lastKeyState = currKeyState

    // And the actual autoclicker
    if (!isClicking || Date.now() - lastClick < 1000 / config.autoClickerCps || data.chocolateSlot == null || data.isBuyingUpgrades) return
    lastClick = Date.now()
    const inv = Player.getContainer()
    // inv.click(13, false, "MIDDLE")
    sendWindowClick(inv.getWindowId(), data.chocolateSlot, 0)
})

register("renderSlot", (slot, gui, event) => {
    if (slot.getIndex() !== 13 || !data.inFactory || !isClicking) return

    let r = 0
    if (data.isBuyingUpgrades) r = 255
    highlightSlot(slot, 255, 255, 0, 125)
})