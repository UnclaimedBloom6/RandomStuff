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
    @DecimalSliderProperty
} from "../Vigilance/index";

@Vigilant("ZeroPingEtherwarp/data", "Zero Ping Etherwarp")

class Config {
    constructor() {
        this.initialize(this)
        this.setCategoryDescription("General", `
        &6&l&nZeroPingEtherwarp

        &aNOTE: It is strongly recommended to use the Bloom Module Etherwarp overlay when using this (/ct import Bloom). Other overlays will not be accurate.
        `)
    }

    @SwitchProperty({
        name: "Zero Ping Etherwarp",
        description: `Toggle zero ping etherwarp.\n&cNOTE: There are no checks to see if you are in Trap, F7 boss etc. If you wouldn't be able to etherwarp normally, do not try to.`,
        category: "General"
    })
    zeroPingEtherwarp = false;

}
export default new Config()