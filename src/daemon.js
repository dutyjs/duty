const fs = require("fs")
const cp = require("child_process")
const path = require('path');

const { LINUX , WINDOWS, DARWIN } = require("./daemonconfig")

const FILE_MAP = new Map([
    ["windows", "NA"],
    ["linux", `${path.join(path.sep, "etc", "systemd", "system", "duty-js.service")}`],
    ["darwin", `${path.join(process.env.HOME, "Library", "LaunchAgents", "com.duty.js.plist")}`]
]);

let configBuild = ""

const isObject = value => {
    return typeof(value) === "object" && ! Array.isArray(value);
};

const flattenSYSTEMD = (value = {}) => {
    if ( isObject(value) ) {
        for ( let [key,_value] of Object.entries(value) ) {
            configBuild += `\n[${key}]\n`
            setupValues(_value)
        }
        let _Cbuild = configBuild;
        configBuild = "";
        return _Cbuild;
    }
}

const setupValues = (value) => {
    for ( let [idx,val] of Object.entries(value) ) {
        configBuild += `${idx}=${val}\n`
    }
}

class Daemon {
    static CreateDaemon(platform) {
        // every things that happens in this
        //  static method is just to make the code,
        //  dependency injectable

        let { writeConfig: wr } = Daemon,
            { execSync } = cp;

        Daemon[platform]({wr,execSync});
    }
    static writeConfig({location,config}) {
        try {
            fs.writeFileSync(location,config)
        } catch(ex) {
            throw ex
        }
    }
    static wait() {
        process.stdout.write("wait while the daemon is been enabled...")        
    }
    static linux({wr,execSync}) {
        const config = flattenSYSTEMD(LINUX)
        const location = FILE_MAP.get("linux")

        wr({location,config})

        Daemon.wait();
        try {
            execSync("systemctl enable duty-js && systemctl daemon-reload && systemctl start duty-js")
        } catch(ex) {
            throw(`error encountered while enabling service`);
        }

        return true;
    }
    static windows({wr,execSync}) {
        // 
    }
    static darwin({wr,execSync}) {

        const config = DARWIN;
        const location = FILE_MAP.get("darwin");

        wr({location,DARWIN});

        Daemon.wait();

        try {
            execSync(`launchctl load -w ${location} && launchctl start com.duty.js`);
        } catch(ex) {
            throw(`error encountered while enabling service`);
        }

        return true;

    }
}

module.exports = {
    Daemon,
    FILE_MAP
}