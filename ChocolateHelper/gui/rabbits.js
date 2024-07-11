import config from "../util/config";
import { isHoppity, leftRightAlignFormat, pogObj } from "../util/utils";

let colorCodes = ['f', 'a', '9', '5', '6', 'd', 'b']
let rabbitsArray = Object.keys(pogObj.rabbits).filter(key => key != 'x' && key != 'y' && !"totallast".includes(key))

let messages = []
let totalMessage
let rabbitsMessages = []
let uniqueMessage
const WIDTH = 150

register('renderOverlay', () => {
    if (!config.showRabbitCount || !isHoppity() || messages.length != 3) return
    Renderer.drawStringWithShadow(messages[0], pogObj.rabbits.x, pogObj.rabbits.y)
    messages[1].forEach((a, index) => {
        Renderer.drawStringWithShadow(a, pogObj.rabbits.x, pogObj.rabbits.y + 10*(index+1))
    })
    Renderer.drawStringWithShadow(messages[2], pogObj.rabbits.x, pogObj.rabbits.y + 10*(rabbitsArray.length+1))
})

register('step', () => {
    if (!config.showRabbitCount || !isHoppity()) return
    totalMessage = leftRightAlignFormat("&3Total", `${pogObj.rabbits.totalUniques}&8/&3${pogObj.rabbits.total} [${pogObj.rabbits.totalUniques + pogObj.rabbits.totalDuplicates}]`, WIDTH)
    rabbitsArray.forEach((key, index) => {
        let color = `&${colorCodes[index]}`
        rabbitsMessages[index] = leftRightAlignFormat(`${color}${key.charAt(0).toUpperCase()+key.slice(1)}`, `${pogObj.rabbits[key].unique}&8/${color}${pogObj.rabbits[key].total} [${pogObj.rabbits[key].duplicates}]`, WIDTH)
    })
    uniqueMessage = leftRightAlignFormat("&3Last Unique", `${pogObj.rabbits.lastUnique}`, WIDTH)
    messages[0] = totalMessage
    messages[1] = rabbitsMessages
    messages[2] = uniqueMessage
}).setFps(1)

register('dragged', (dx, dy, x, y, bn) => {
    if (!config.rabbitsGui.isOpen() || bn == 2) return
    pogObj.rabbits.x = x
    pogObj.rabbits.y = y
    pogObj.save()
})