import { onSetSlotReceived } from "../../BloomCore/utils/Events"
import { sendWindowClick } from "../../BloomCore/utils/Utils"
import config from "../util/config"
import { data } from "../util/utils"

const clickMeItems = [
    /^§6§lGolden Rabbit §8- .+$/,
    /^§e§lCLICK ME!$/
]

onSetSlotReceived((item, slot) => {
    if (!item || !data.inFactory || (!config.autoClickMe && !config.clickMeSound)) return

    const ctItem = new Item(item)
    const itemName = ctItem.getName()
    if (itemName.includes('CAUGHT!')) ChatLib.chat(`&6[ChocolateFactory] &aClicked&r ${itemName}`)
    if (!clickMeItems.some(a => a.test(itemName))) return

    if (config.clickMeSound) {
        World.playSound("random.successful_hit", 1, 0)
    }

    if (!config.autoClickMe) return

    setTimeout(() => {
        const inv = Player.getContainer()
        let slotToClick = slot
        if (!inv || !data.inFactory) return

        sendWindowClick(inv.getWindowId(), slotToClick, 0)
    }, Math.floor(500 + Math.random() * 2000));
})
