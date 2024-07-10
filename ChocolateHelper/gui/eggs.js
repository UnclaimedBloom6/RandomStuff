import { isHoppity, leftRightAlignFormat, pogObj } from "../util/utils"
import config from "../util/config"

const respawnTime = 60*20*1000 // 20 minutes in ms
let breakfastTimer = null
let lunchTimer = null
let dinnerTimer = null

let messages = [] // Breakfast, Lunch, Dinner
const WIDTH = 150
register('step', () => {
    if (!config.showEggTimers || !isHoppity()) return
    breakfastTimer = twentyMinuteTimer(pogObj.eggs.breakfast.lastSpawn, 'breakfast')
    lunchTimer = twentyMinuteTimer(pogObj.eggs.lunch.lastSpawn, 'lunch')
    dinnerTimer = twentyMinuteTimer(pogObj.eggs.dinner.lastSpawn, 'dinner')
    messages[0] = leftRightAlignFormat("&6Breakfast", pogObj.eggs.breakfast.isAvailable ? `Ready! &8(&6${breakfastTimer}&8)` : `${breakfastTimer}`, WIDTH)
    messages[1] = leftRightAlignFormat("&9Lunch", pogObj.eggs.lunch.isAvailable ? `Ready! &8(&9${lunchTimer}&8)` : `${lunchTimer}`, WIDTH)
    messages[2] = leftRightAlignFormat("&aDinner", pogObj.eggs.dinner.isAvailable ? `Ready! &8(&a${dinnerTimer}&8)` : `${dinnerTimer}`, WIDTH)
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
    if (!config.showEggTimers || !isHoppity() || messages.length != 3) return
    messages.forEach((a, index) => {
        Renderer.drawStringWithShadow(a, pogObj.eggs.x, pogObj.eggs.y + 10*(index+1))
    })
})

register('dragged', (dx, dy, x, y, bn) => {
	if (!config.eggGui.isOpen() || bn == 2) return
	pogObj.eggs.x = x
	pogObj.eggs.y = y
	pogObj.save()
})