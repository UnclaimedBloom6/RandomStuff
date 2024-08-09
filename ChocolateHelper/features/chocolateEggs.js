import { renderBoxOutline, renderFilledBox } from "../../BloomCore/RenderUtils"
import { EntityArmorStand, getEntitySkullTexture, getEntityXYZ } from "../../BloomCore/utils/Utils"
import config from "../util/config"
import { isHoppity, pogObj, skullTextures } from "../util/utils"

let eggs = []
let mostRecentEgg = null
let isRegistered = false

register("chat", (egg) => {
    mostRecentEgg = egg
}).setCriteria(/^HOPPITY'S HUNT A (.+) has appeared!$/)

register("worldUnload", () => {
    mostRecentEgg = null
})

register("step", () => {
<<<<<<< HEAD
    if (!config.eggEsp) return
    if (!isHoppity()) {
        if (isRegistered) {
            eggEsp.unregister()
            isRegistered = false
        }
        return
    } else {
        if (!isRegistered) {
            eggEsp.register()
            isRegistered = true
        }
=======
    if (!isHoppity() || !config.eggEsp) {
        eggEsp.unregister()
        return
    } else {
        eggEsp.register()
>>>>>>> 5b657018353f54ae8b6e0027819804466121d5ce
    }

    const stands = World.getAllEntitiesOfType(EntityArmorStand)
    eggs = []
    stands.forEach(entity => {
        const skullTexture = getEntitySkullTexture(entity)
        if (!skullTexture) return
        Object.entries(skullTextures).forEach(([eggName, eggTexture]) => {
            if (skullTexture !== eggTexture) return

            let [r, g, b] = [1, 1, 0]
            // Hightlight and/or announce most recent egg
            if (mostRecentEgg && mostRecentEgg == eggName.removeFormatting()) {
                // Announce egg location
                if (pogObj.lastEggAnnounced !== mostRecentEgg && config.announceEggLocations) {
                    pogObj.lastEggAnnounced = mostRecentEgg
                    
                    const [x, y, z] = getEntityXYZ(entity)
                    ChatLib.command(`ac ${mostRecentEgg} is at x: ${Math.floor(x)}, y: ${Math.floor(y+1)}, z: ${Math.floor(z)}`, false)
                }
            }
            
            if (pogObj.eggs[eggName.split(' ')[1].toLowerCase()].isAvailable) r = 0

            eggs.push({
                entity: entity,
                color: [r, g, b],
                name: eggName
            })
        })
    })
}).setFps(1)

const eggEsp = register("renderWorld", () => {
    eggs.forEach(e => {
        const { entity, color, name } = e
        const [x, y, z] = getEntityXYZ(entity)
        const [r, g, b] = color
        renderFilledBox(x, y+1.4, z, 0.8, 0.8, r, g, b, 0.2, true)
        renderBoxOutline(x, y+1.4, z, 0.8, 0.8, r, g, b, 1, 2, true)
        Tessellator.drawString(name, x, y+3, z)
    })
}).unregister()