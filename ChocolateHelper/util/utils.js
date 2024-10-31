import { deepCopyObject, readFileLines } from "../../BloomCore/utils/Utils"
import PogObject from "../../PogData"
import config from "./config"


export const prefix = `&b[&dChocolateHelper&b]&r`

// Where most of the stuff grabbed from the scraper is sent to.
export let data = {
    inFactory: false,
    fullyLoaded: false, // Flips to true when every item in the gui has been loaded
    windowId: null,
    chocolate: 0,
    chocolateSlot: null,
    allTimeChocolate: 0,
    cps: 0,
    baseCps: 0,
    cpsMultiplier: 0,
    factoryTier: 1,
    canPrestige: false,
    factoryItemSlot: null,
    productionMultipliers: {}, // {"Hoppity's Collection": 0.693, ...}
    cpsSources: {}, // {"Rabbit Employees": 2630, ...}
    bestUpgrade: null, // {slot: 10, cost: 100000000, costPerCps: 420}
    employees: {},
    jackrabbit: {
        level: 0,
        cost: null,
        slot: null,
    },
    timeTower: {
        level: 0,
        cost: null,
        slot: null,
    },
    rabbitShrine: {
        level: 0,
        cost: null,
        slot: null,
    },

}

export const pogObj = new PogObject("ChocolateHelper", {
    lastEggAnnounced: null,
    debug: false,
    eggs: {
        breakfast: {
            isAvailable: null,
            lastSpawn: null,
        },
        lunch : {
            isAvailable: null,
            lastSpawn: null,
        },
        dinner : {
            isAvailable: null,
            lastSpawn: null,
        },
        x: Renderer.screen.getWidth()/2,
        y: Renderer.screen.getHeight()/2
    },
    rabbits: {
        common: {
            unique: 0,
            duplicates: 0,
            total: 0,
        },
        uncommon: {
            unique: 0,
            duplicates: 0,
            total: 0,
        },
        rare: {
            unique: 0,
            duplicates: 0,
            total: 0,
        },
        epic: {
            unique: 0,
            duplicates: 0,
            total: 0,
        },
        legendary: {
            unique: 0,
            duplicates: 0,
            total: 0,
        },
        mythic: {
            unique: 0,
            duplicates: 0,
            total: 0,
        },
        divine: {
            unique: 0,
            duplicates: 0,
            total: 0,
        },
        total: 0,
        totalDuplicates: 0,
        totalUniques: 0,
        lastUnique: 0,
        x: Renderer.screen.getWidth()/2,
        y: Renderer.screen.getHeight()/2
    }
}, "data/persistent.json")
pogObj.autosave()

const dataCopy = deepCopyObject(data)
delete dataCopy.windowId // Want to preserve the window id

export const resetData = () => {
    const clearedData = deepCopyObject(dataCopy)
    Object.entries(clearedData).forEach(([k, v]) => data[k] = v)
}

// Base CPS for each employee
export const employeeCpsValues = {
    "Rabbit Bro": 1,
    "Rabbit Cousin": 2,
    "Rabbit Sis": 3,
    "Rabbit Daddy": 4,
    "Rabbit Granny": 5,
    "Rabbit Uncle": 6,
    "Rabbit Dog": 7,
}
const employees = Object.keys(employeeCpsValues)

export const skullTextures = {
    "§6Chocolate Breakfast Egg": "ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjY3MzE0OSwKICAicHJvZmlsZUlkIiA6ICJiN2I4ZTlhZjEwZGE0NjFmOTY2YTQxM2RmOWJiM2U4OCIsCiAgInByb2ZpbGVOYW1lIiA6ICJBbmFiYW5hbmFZZzciLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYTQ5MzMzZDg1YjhhMzE1ZDAzMzZlYjJkZjM3ZDhhNzE0Y2EyNGM1MWI4YzYwNzRmMWI1YjkyN2RlYjUxNmMyNCIKICAgIH0KICB9Cn0=",
    "§9Chocolate Lunch Egg": "ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjU2ODExMiwKICAicHJvZmlsZUlkIiA6ICI3NzUwYzFhNTM5M2Q0ZWQ0Yjc2NmQ4ZGUwOWY4MjU0NiIsCiAgInByb2ZpbGVOYW1lIiA6ICJSZWVkcmVsIiwKICAic2lnbmF0dXJlUmVxdWlyZWQiIDogdHJ1ZSwKICAidGV4dHVyZXMiIDogewogICAgIlNLSU4iIDogewogICAgICAidXJsIiA6ICJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlLzdhZTZkMmQzMWQ4MTY3YmNhZjk1MjkzYjY4YTRhY2Q4NzJkNjZlNzUxZGI1YTM0ZjJjYmM2NzY2YTAzNTZkMGEiCiAgICB9CiAgfQp9",
    "§aChocolate Dinner Egg": "ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjY0OTcwMSwKICAicHJvZmlsZUlkIiA6ICI3NGEwMzQxNWY1OTI0ZTA4YjMyMGM2MmU1NGE3ZjJhYiIsCiAgInByb2ZpbGVOYW1lIiA6ICJNZXp6aXIiLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZTVlMzYxNjU4MTlmZDI4NTBmOTg1NTJlZGNkNzYzZmY5ODYzMTMxMTkyODNjMTI2YWNlMGM0Y2M0OTVlNzZhOCIKICAgIH0KICB9Cn0=",
}

export const getTimeTowerUpgradeCost = (currentTier) => {
    const baseCost = 5_500_000 + (500_000 * (data.factoryTier - 1))
    // Cost increases by an order of this amount per level from the base cost
    const levelMultipliers = [1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 20, 24, 30, 40]

    if (currentTier > levelMultipliers.length) return null

    return baseCost * levelMultipliers[currentTier - 1]
}

export const getRabbitShrineCost = (currentTier) => {

    const baseCost = 10_000_000
    const levelMultipliers = [1, 2, 3, 4, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]

    if (currentTier > levelMultipliers.length) return
    return baseCost * levelMultipliers[currentTier]
}


// const jackrabbitCosts = readFileLines("ChocolateHelper", "upgrades/jackrabbit.txt").map(v => parseInt(v))

export const getJackrabbitUpgradeCost = (currentTier) => {
    if (currentTier > jackrabbitCosts.length) return null

    return jackrabbitCosts[currentTier]
}

/**
 * Updates the best upgrade to get. If recursive, will find all of the best upgrades until chocolate runs out.
 * @param {Boolean} recursive - Tries to upgrade as many times as possible. Will also add the slots to the click queue if auto upgrades are enabled.
 * This should only be ran when auto upgrades is on.
 * @param {*} currentLevels - An object containing the current levels of each possible upgrade.
 * @returns 
 */
export const updateBestUpgrade = () => {
    // Auto upgrading is in progress, we don't wanna continue otherwise it'll
    // mess up the order upgrades are bought and waste chocolate.

    let best = null

    // All upgradable objects must be an object containing 'cost' and 'slot'.
    const processUpgrade = (name, upgradableObject, cpsGain, maxTier) => {
        const { level, slot, cost } = upgradableObject

        // This upgrade is already maxed
        if (level == maxTier) return
        
        
        if (cost == null || slot == null) return
        // ChatLib.chat(`${name}: ${cost / cpsGain} c/cps | ${cpsGain / data.cps} t/cps`)

        const costPerCps = cost / cpsGain
        // const upgradeEfficiency = cpsGain / (cost * cost / data.cps)
        // ChatLib.chat(`${name}: ${(upgradeEfficiency*100000000).toFixed(2)}`)
        if (best && best.costPerCps < costPerCps) return

        best = {
            name,
            slot,
            cost,
            costPerCps
        }
    }

    if (config.upgradeIncludeEmployees) {
        Object.entries(data.employees).forEach(([employee, info]) => {
            const { level, slot, cost } = info

            // Need previous employee to be lvl >20 first
            const employeeIndex = employees.indexOf(employee)
            if (employeeIndex > 0) {
                const prevEmployee = employees[employeeIndex-1]
                const prevEmployeeLevel = data.employees[prevEmployee]?.level
                
                if (prevEmployeeLevel < 20) return
            }

            processUpgrade(employee, info, info.cps)
        })
    }

    if (config.upgradeIncludeJackrabbit) {
        processUpgrade("Jackrabbit", data.jackrabbit, data.baseCps * 0.01)
    }

    if (config.upgradeIncludeTimeTower) {
        processUpgrade("Time Tower", data.timeTower, data.baseCps * 0.1 / 8)
    }

    data.bestUpgrade = best
}

/**
 * 
 * @param {Slot} slot 
 * @param {Number} r - 0-255
 * @param {Number} g - 0-255
 * @param {Number} b - 0-255
 * @param {Number} a - 0-255
 */
export const highlightSlot = (slot, r, g, b, a) => {
    const x = slot.getDisplayX()
    const y = slot.getDisplayY()

    Renderer.translate(x, y)
    Renderer.drawRect(Renderer.color(r, g, b, a), 0, 0, 16, 16)
}

let inHoppity = false
register('step', () => {
    inHoppity = Scoreboard?.getLines()?.findIndex(line => line?.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, "")?.includes(' Spring ')) != -1
}).setFps(1)

export const isHoppity = () => {
    return inHoppity
}

export function leftRightAlignFormat(text, counter, totalWidth) {
    const textWidth = Renderer.getStringWidth(text);
    const counterWidth = Renderer.getStringWidth(counter);
    const spaceWidth = Renderer.getStringWidth(" ");
    const spacesNeeded = Math.max(0, Math.floor((totalWidth - textWidth - counterWidth) / spaceWidth));

    return text + " ".repeat(spacesNeeded) + counter;
}