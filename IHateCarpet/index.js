const BlockPoss = Java.type("net.minecraft.util.BlockPos")
const getDistance = (x1, y1, z1, x2, y2, z2) => Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2)
const setAir = (x, y, z) => World.getWorld().func_175698_g(new BlockPoss(x, y, z))
const setBlockState = (x, y, z, state) => World.getWorld().func_175656_a(new BlockPoss(x, y, z), state)

let carpets = []
register("tick", () => {
    let pX = parseInt(Player.getX())
    let pY = parseInt(Player.getY())
    let pZ = parseInt(Player.getZ())
    for (let x = pX-3; x < pX+2; x++) {
        for (let y = pY-3; y < pY+2; y++) {
            for (let z = pZ-3; z < pZ+2; z++) {
                let block = World.getBlockAt(x, y, z)
                if (!block || block.type.getID() !== 171) continue
                carpets.push([block.getState(), x, y, z])
                setAir(x, y, z)
            }
        }
    }
    // ChatLib.chat(carpets.length)
})

register("tick", () => {
    for (let i = 0; i < carpets.length; i++) {
        let x = carpets[i][1]
        let y = carpets[i][2]
        let z = carpets[i][3]
        if (getDistance(parseInt(Player.getX()), parseInt(Player.getY()), parseInt(Player.getZ()), x, y, z) > 3) {
            setBlockState(x, y, z, carpets[i][0])
            carpets.splice(i, 1)
        }
    }
})