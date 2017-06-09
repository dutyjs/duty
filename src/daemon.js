const fs = require("fs")
const cp = require("child_process")

const { LINUX , WINDOWS, DARWIN } = require("./daemonconfig")

const FILE_MAP = new Map([
    ["windows", "NA"],
    ["linux", "/etc/systemd/system/duty-js.service"],
    ["darwin", "NA"]
])

let configBuild = ""

const flatten = (value = {}) => {
    if ( typeof(value) === "object" && ! Array.isArray(value) && Object.keys(value).length != 0 ) {
        for ( let [key,_value] of Object.entries(value) ) {
            configBuild += `\n[${key}]\n`
            setupValues(_value)
        }
        return configBuild
    }
}

const setupValues = (value) => {
    for ( let [idx,val] of Object.entries(value) ) {
        configBuild += `${idx}=${val}\n`
    }
}

module.exports = class Daemon {
    static CreateDaemon(platform) {
        Daemon[platform]()
    }
    static writeConfig({location,config}) {
        try {
            fs.writeFileSync(location,config)
        } catch(ex) {
            throw ex
        }
    }
    static linux() {
        const config = flatten(LINUX)
        const location = FILE_MAP.get("linux")

        Daemon.writeConfig({location,config})
        process.stdout.write("wait while the daemon is been enabled...")
        
        cp.execSync("systemctl enable duty-js && systemctl daemon-reload && systemctl start duty-js")

    }
    static windows() {

    }
    static darwin() {

    }
}