

export const printHelp = () => {
    new Message(
        `&b&lAuto Croesus &aCommands &7(Hover to see description)\n`,
        new TextComponent(`&a//ac\n`)
            .setHover("show_text", "Shows this message."),
        new TextComponent(`&a//ac go\n`)
            .setHover("show_text", "Start looting Croesus."),
        new TextComponent(`&a//ac api\n`)
            .setHover("show_text", "Refresh API."),
        new TextComponent(`&a//ac settings\n`)
            .setHover("show_text", "View current settings."),
        new TextComponent(`&a//ac overlay\n`)
            .setHover("show_text", "Toggle the overlay for the run loot and unclaimed chests (Will still show without auto looting on)."),
        new TextComponent(`&a//ac delay <ms>\n`)
            .setHover("show_text", "Throttle how quickly the module will be allowed to click (Values lower than your ping will not make a difference)."),
        new TextComponent(`&a//ac loot help|floor:[floor] limit:[limit] score:[minscore]\n`)
            .setHover("show_text", "Shows all of the loot collected from using the module, with optional params to filter the loot based on floor, score or limit the number of runs to show."),
        "\n",
        new TextComponent(`&a//ac kismet\n`)
            .setHover("show_text", "Toggle rerolling."),
        new TextComponent(`&a//ac kismet <min_profit>\n`)
            .setHover("show_text", "Configure how much profit is required for the chest to not be rerolled.\nEg 2,000,000 would mean any chest with >=2m profit will not be rerolled."),
        new TextComponent(`&a//ac kismet <floor>\n`)
            .setHover("show_text", "Add or remove the floor from the floors to kismet."),
        new TextComponent(`&a//ac key\n`)
            .setHover("show_text", "Toggle using chest keys."),
        new TextComponent(`&a//ac key <min_profit>\n`)
            .setHover("show_text", "Configure how much profit is needed for a chest key to be used on a chest."),
        "\n",
        new TextComponent(`&a//ac alwaysbuy\n`)
            .setHover("show_text", "Prints the list of items which the looter will always buy no matter what they are worth."),
        new TextComponent(`&a//ac alwaysbuy <ITEM_ID>\n`)
            .setHover("show_text", "Adds the item with the given Skyblock Item ID to the list of items to always be bought."),
            new TextComponent(`&a//ac alwaysbuy reset\n`)
                .setHover("show_text", "Resets the list of items to always buy back to their\ndefaults found in data/defaults/always_buy.txt"),

        new TextComponent(`&a//ac worthless\n`)
            .setHover("show_text", "Prints the list of items with their values hard coded to 0."),
        new TextComponent(`&a//ac worthless <ITEM_ID>\n`)
            .setHover("show_text", "Adds the item with the given Skyblock Item ID to the list of worthless items."),
        new TextComponent(`&a//ac worthless reset\n`)
            .setHover("show_text", "Resets the list of worthless items back to their\ndefaults found in data/defaults/worthless.txt"),
    ).chat()
}