const fs = require("fs")
const { FILE_MAP } = require('./daemon.js')

module.exports = class Platform {

    constructor() {}

    static createType() {
        return new Platform()
    }

    checkPlatform(platform) {
        return this[platform]()
    }

    linux() {
        return fs.existsSync(FILE_MAP.get("linux"));
    }
    darwin() {
        return fs.existsSync(FILE_MAP.get("darwin"));
    }
}