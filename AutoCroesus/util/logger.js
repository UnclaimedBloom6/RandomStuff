
/**
 * Mainly used to copy the lore of items to make it easier to debug when other users are having problems with the module
 */
export default new class Logger {
    constructor() {
        this.str = ""
    }

    push(str) {
        if (this.str !== "") {
            this.str += "\n"
        }

        this.str += str
    }

    copy() {
        if (this.str) {
            ChatLib.command(`ct copy ${this.str}`, true)
            return
        }
        
        const str = FileLib.read("AutoCroesus", "data/log.txt")
        ChatLib.command(`ct copy ${str}`, true)
    }

    clear() {
        this.str = ""
    }

    write() {
        FileLib.write("AutoCroesus", "data/log.txt", this.str, true)
    }
}