import config from "../util/config";
import { isHoppity, pogObj } from "../util/utils";

let colorCodes = ['f', 'a', '9', '5', '6', 'd', 'b']
let hoppity = false
register('step', () => {
    if (!config.showRabbitCount) return
    hoppity = isHoppity()
}).setFps(1)

register('renderOverlay', () => {
    // if (!config.showRabbitCount || !hoppity) return
    Renderer.drawStringWithShadow(`&3Total Uniques: ${pogObj.rabbits.totalUniques}&8/&3${pogObj.rabbits.total} [${pogObj.rabbits.totalUniques + pogObj.rabbits.totalDuplicates}]`, pogObj.rabbits.x, pogObj.rabbits.y)
    Object.keys(pogObj.rabbits).filter(key => key != 'x' && key != 'y' && !key.includes('total')).forEach((key, index) => {
        let color = `&${colorCodes[index]}`
        Renderer.drawStringWithShadow(
            `${color}${key.charAt(0).toUpperCase()+key.slice(1)}: ${pogObj.rabbits[key].unique}&8/${color}${pogObj.rabbits[key].total} [${pogObj.rabbits[key].duplicates}]`,
             pogObj.rabbits.x, pogObj.rabbits.y + 10*(index+1))
    })
})

register('dragged', (dx, dy, x, y, bn) => {
	if (!config.rabbitsGui.isOpen() || bn == 2) return
	pogObj.rabbits.x = x
	pogObj.rabbits.y = y
	pogObj.save()
})