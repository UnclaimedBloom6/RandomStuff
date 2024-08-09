import { data, pogObj, prefix } from "./util/utils"
import config from "./util/config"

// TODO:
// Make it so that upgrades can be bought faster than your ping. Store upgrade costs locally.

import "./util/scraper"

import "./features/autoClicker"
import "./features/bestUpgrade"
import "./features/chocolateEggs"
import "./features/clickMe"
import "./features/guiElements"
import "./features/noItemPickup"
import "./features/rabbitsCounter"
import "./features/autoPickUpHoppity"
import { deepCopyObject } from "../BloomCore/utils/Utils"

import './gui/eggs'
import './gui/rabbits'


register("command", (...args) => {
    if (!args[0]) {
        config.openGUI()
        return
    }

    if (args[0] == "debug") {
        pogObj.debug = !pogObj.debug
        ChatLib.chat(`${prefix} &aDebug mode ${pogObj.debug ? "Enabled" : "&cDisabled"}&a.`)
        pogObj.debug ? debugLines.register() : debugLines.unregister()
        return
    }
}).setTabCompletions(["debug"]).setName("chocolatehelper").setAliases(["/ch", "choco"])


const debugLines = register("postGuiRender", () => {
    if (!data.inFactory) return

    const jsonCopy = deepCopyObject(data)
    delete jsonCopy.queuedSlotClicks

    const jsonStr = JSON.stringify(jsonCopy, null, 4)

    const LINE_HEIGHT = 9

    const lines = jsonStr.split("\n").length
    const screenHeight = Renderer.screen.getHeight()
    let scale = 1

    if (lines * LINE_HEIGHT > screenHeight) {
        scale = screenHeight / (lines * LINE_HEIGHT)
    }

    Renderer.scale(scale)
    Renderer.drawString(jsonStr, 0, 0)
}).unregister()
