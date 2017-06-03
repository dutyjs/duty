const fs = require('fs');

class Platform {

    constructor() {}

    static createType() {
        return new Platform();
    }

    checkPlatform(platform) {
        return this[platform]();
    }

    linux() {

        if (
            fs.existsSync('/etc/systemd/system/duty-js.service')
        ) {
            return true;
        }
    }
}

module.exports = Platform;