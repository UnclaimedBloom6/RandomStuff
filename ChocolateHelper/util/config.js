
import {
    @ButtonProperty,
    @CheckboxProperty,
    Color,
    @ColorProperty,
    @PercentSliderProperty,
    @SelectorProperty,
    @SwitchProperty,
    @TextProperty,
    @Vigilant,
    @SliderProperty,
    @NumberProperty,
} from '../../Vigilance/index';

@Vigilant("ChocolateHelper/data", "Chocolate Helper!", {
    getCategoryComparator: () => (a, b) => {
        const categories = [];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Config {
    constructor() {
        this.initialize(this)
        this.addDependency("Move Rabbit Count", "Show Rabbit Count")
        this.addDependency("Move Egg Timers", "Show Egg Timers")
    }

    eggGui = new Gui()
    rabbitsGui = new Gui()
    // Clicking

    @SwitchProperty({
        name: "No Item Pickup",
        description: "Prevents you from picking up clicked items in the chocolate factory gui.",
        category: "Clicking",
        subcategory: "Manual Clicks"
    })
    noItemPickup = false;
    
    @SliderProperty({
        name: "Auto Clicker CPS",
        description: "How many clicks per second the auto clicker will click the cookie. Will only click whilst keybind is held.\nThe auto clicker can be toggled via the keybind in your controls.",
        category: "Clicking",
        subcategory: "Auto Clicker",
        min: 1,
        max: 20
    })
    autoClickerCps = 7;

    @SwitchProperty({
        name: "Auto Click Me",
        description: "Automatically clicks the \"CLICK ME\" items when they spawn.",
        category: "Clicking",
        subcategory: "Click Me"
    })
    autoClickMe = false;

    @SwitchProperty({
        name: "Click Me Sound",
        description: "Plays a sound whenever a \"CLICK ME\" item spawns in the chocolate factory.",
        category: "Clicking",
        subcategory: "Click Me"
    })
    clickMeSound = false;

    // Overlays

    @SwitchProperty({
        name: "Show Chocolate",
        description: "Shows your current chocolate and cps above the chocolate item.",
        category: "Overlays",
        subcategory: "Gui"
    })
    showChocolate = false;

    @SwitchProperty({
        name: "Show Egg Timers",
        description: "Shows egg timers for Hoppity.",
        category: "Overlays",
        subcategory: "Gui"
    })
    showEggTimers = false;

    @ButtonProperty({
        name: "Move Egg Timers",
        description: "Moves the egg timers",
        category: "Overlays",
        subcategory: "Gui",
        placeholder: "Move"
    })
    moveEggTimer() {
        this.eggGui.open()
    };

    @SwitchProperty({
        name: "Show Rabbit Count",
        description: "Shows the amount of unique rabbits and duplicates.",
        category: "Overlays",
        subcategory: "Gui"
    })
    showRabbitCount = false;

    @ButtonProperty({
        name: "Move Rabbit Count",
        description: "Moves the rabbit count gui.",
        category: "Overlays",
        subcategory: "Gui",
        placeholder: "Move"
    })
    moveRabbitCount() {
        this.rabbitsGui.open()
    };

    @SwitchProperty({
        name: "Show Prestige",
        description: "Highlights the prestige slot when you can pestige.",
        category: "Overlays",
        subcategory: "slots"
    })
    showPrestigeHighlight = false;

    // Upgrades

    @SwitchProperty({
        name: "&6Show Best Upgrade",
        description: "Shows the best upgrade of all of the individual upgrades you have enabled.",
        category: "Upgrades"
    })
    showBestUpgrade = false;

    @SwitchProperty({
        name: "Auto Buy Best Upgrade",
        description: "Automatically buys the best upgrade when you have enough chocolate.",
        category: "Upgrades"
    })
    autoBuyBestUpgrade = false;

    @SwitchProperty({
        name: "Show Queued Clicks",
        description: "Shows a small number in the corner of the slot showing how many times a slot will be clicked.",
        category: "Upgrades"
    })
    showQueuedClicks = false;

    @SliderProperty({
        name: "Max CPS",
        description: "The most amount of clicks per second that upgrades can be bought at. \n&cThis will be bottlenecked by your ping.",
        category: "Upgrades",
        min: 1,
        max: 20
    })
    maxUpgradesPerSecond = 10;

    @SwitchProperty({
        name: "Employees",
        description: "Includes employees when calculating the best upgrade.",
        category: "Upgrades",
        subcategory: "Upgrades"
    })
    upgradeIncludeEmployees = true;

    @SwitchProperty({
        name: "Jackrabbit",
        description: "Includes jackrabbit when calculating the best upgrade.",
        category: "Upgrades",
        subcategory: "Upgrades"
    })
    upgradeIncludeJackrabbit = true;

    @SwitchProperty({
        name: "Time Tower",
        description: "Includes the time tower when calculating the best upgrade.",
        category: "Upgrades",
        subcategory: "Upgrades"
    })
    upgradeIncludeTimeTower = true;

    // Eggs

    @SwitchProperty({
        name: "Egg ESP",
        description: "Shows you where chocolate eggs are in the world.",
        category: "Eggs"
    })
    eggEsp = false;

    @SwitchProperty({
        name: "Announce Egg Location",
        description: "Announces the coordinates of newly spawned chocolate eggs in chat when they first spawn.",
        category: "Eggs"
    })
    announceEggLocations = false;

}
export default new Config()