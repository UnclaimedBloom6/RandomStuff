import { isHoppity, pogObj } from "../util/utils"
import config from "../util/config"

const respawnTime = 60*20*1000 // 20 minutes in ms
let breakfastTimer = null
let lunchTimer = null
let dinnerTimer = null

register('step', () => {
    if (!config.showEggTimers || !isHoppity()) return
    breakfastTimer = twentyMinuteTimer(pogObj.eggs.breakfast.lastSpawn, 'breakfast')
    lunchTimer = twentyMinuteTimer(pogObj.eggs.lunch.lastSpawn, 'lunch')
    dinnerTimer = twentyMinuteTimer(pogObj.eggs.dinner.lastSpawn, 'dinner')
}).setFps(1)

register("chat", (egg) => { // 20 minute timer when they appear
    pogObj.eggs[egg.toLowerCase()].isAvailable = true
    pogObj.eggs[egg.toLowerCase()].lastSpawn = Date.now()
    pogObj.save()
}).setCriteria(/^HOPPITY'S HUNT A Chocolate (.+) Egg has appeared!$/)

register("chat", (egg) => { // 20 minute timer when they appear
    pogObj.eggs[egg.toLowerCase()].isAvailable = false
    pogObj.save()
}).setCriteria(/^HOPPITY'S HUNT You found a Chocolate (.+) Egg .+!$/)

function twentyMinuteTimer(epoch, eggName) {
    if (epoch == null) return
    if (Date.now() - epoch >= respawnTime) { // Should be ready now
        pogObj.eggs[eggName].isAvailable = true // figure out whose epoch it is and set to available
        pogObj.eggs[eggName].lastSpawn += (respawnTime * Math.floor((Date.now() - epoch) / respawnTime ))// add 20 minutes to the epoch time so it doesnt keep trying to set to available
        pogObj.save()
    }

    let ms = respawnTime + epoch - Date.now()
    let totalSeconds = Math.floor(ms / 1000);
    
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    
    if (minutes > 0) {
        return `${minutes}m${seconds}s`;
    } else {
        return `${seconds}s`;
    };
}

register('renderOverlay', () => {
    if (!config.showEggTimers || !isHoppity()) return
    Renderer.drawStringWithShadow(pogObj.eggs.breakfast.isAvailable ? `&6Breakfast: Ready! &8(&6${breakfastTimer}&8)` : `&6Breakfast: ${breakfastTimer}`, pogObj.eggs.x, pogObj.eggs.y)
    Renderer.drawStringWithShadow(pogObj.eggs.lunch.isAvailable ? `&9Lunch: Ready! &8(&9${lunchTimer}&8)` : `&9Lunch: ${lunchTimer}`, pogObj.eggs.x, pogObj.eggs.y + 10)
    Renderer.drawStringWithShadow(pogObj.eggs.dinner.isAvailable ? `&aDinner: Ready! &8(&a${dinnerTimer}&8)` : `&aDinner: ${dinnerTimer}`, pogObj.eggs.x, pogObj.eggs.y + 20)
})

register('dragged', (dx, dy, x, y, bn) => {
	if (!config.eggGui.isOpen() || bn == 2) return
	pogObj.eggs.x = x
	pogObj.eggs.y = y
	pogObj.save()
})