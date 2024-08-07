import { onSetSlotReceived, onOpenWindowPacket } from "../../BloomCore/utils/Events"
import { sendWindowClick } from "../../BloomCore/utils/Utils"
import config from "../util/config"
let isHoppityCalling = false

// Auto Pick-Up
register('chat', (caller) => {
    if (!config.autoPickUpCall) return
    isHoppityCalling = caller.includes('Hoppity')
}).setCriteria(/^✆ (\w+) ✆ /)

register('chat', (event) => {
    if (!isHoppityCalling) return
    let command = new Message(event).getMessageParts().find(text => text.getClickValue() != null)?.getClickValue()?.replace('/','')
    ChatLib.command(command)
}).setCriteria(/^✆ RING\.\.\.  \[PICK UP\]$/)

// Auto Open
register('chat', (event) => {
    if (!isHoppityCalling) return
    isHoppityCalling = false // Avoid it somehow triggering before another call
    let command = new Message(event).getMessageParts().find(text => text.getText().includes('Yes') && text.getClickValue() != null)?.getClickValue()?.replace('/','')
    ChatLib.command(command)
}).setCriteria(/^Select an option: \[Yes\] \[No\] $/).setContains()

// Auto Buy
let wId = null

onOpenWindowPacket((title, windowId) => {
    if (title == '§rHoppity§r') wId = windowId
})

onSetSlotReceived((item, slot, windowId) => {
    if (wId != windowId || !item || slot > 53) return

    const ctItem = new Item(item)
    const lore = ctItem.getLore()

    console.log('Received item ' + ctItem.getName() + ' in Hoppity GUI')

    if (!lore.some(line => line.includes('Click to trade!'))) return

    for (let line of lore) {
        console.log(line + '\n') // TO DO: Make Buy Only Unique work (i dont have the lore)
    }

    // setTimeout(() => {
    //     const inv = Player.getContainer()
    //     let slotToClick = slot
    //     if (!inv) return
        
    //     sendWindowClick(inv.getWindowId(), slotToClick, 0)
    //     console.log(`Bought ${ctItem.getName()}`)
    // }, Math.floor(500 + Math.random() * 2000));
})


