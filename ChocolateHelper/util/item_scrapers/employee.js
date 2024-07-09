import { appendToFile } from "../../../BloomCore/utils/Utils"
import config from "../config"
import { data, employeeCpsValues, pogObj, updateBestUpgrade } from "../utils"

export const doEmployeeItem = (itemName, lore, slot) => {
    // https://regex101.com/r/bAFbya/2
    const employeeMatch = itemName.match(/^(§.Rabbit .+?)(?:§8 - )?(?:§7\[([\d,]+)§7\] §..+|§cUnemployed)?$/)
    if (!employeeMatch) return false

    let [_, employee, countStr] = employeeMatch

    const level = countStr ? parseInt(countStr) : 0

    const employeeName = employee.removeFormatting()

    // Don't know this employee's cps
    if (!(employeeName in employeeCpsValues)) return false

    const employeeCps = employeeCpsValues[employeeName]

    data.employees[employeeName] = {
        colored: employee + "§r",
        level,
        cps: employeeCps,
        totalCps: level * employeeCps,
        cost: null,
        slot
    }
    

    for (let line of lore) {
        let costMatch = line.match(/^§5§o§6([\d,\.]+) Chocolate$/)
        if (costMatch) {
            data.employees[employeeName].cost = parseFloat(costMatch[1].replace(/,/g, ""))
            continue
        }
    }

    if (pogObj.debug) appendToFile("ChocolateHelper", `debug/${employeeName.replace(/ /g, "_").toLowerCase()}.txt`, `${data.employees[employeeName].cost}`)

    if (data.fullyLoaded && config.upgradeIncludeEmployees) updateBestUpgrade(true)

    return true
}