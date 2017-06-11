const LINUX = {
    Unit: {
        Description: "Duty Todasdfasdfo Daemon"
    },
    Service: {
        Type: "Notify",
        ExecStart:`${process.argv[1]} daemon`,
        Restart: "always",
        WatchdogSec: "5",
        Environment: "DISPLAY=:0"
    },
    Install: {
        WantedBy: "multi-user.target"
    }
}

const WINDOWS = {

}

const DARWIN = {
    key: {
        Label: [{string: "com.duty.js"}],
        ProgramArguments: {
            array: [{ string: `${process.argv[1]}` },{ string: "daemon" }]
        },
        StartInterval: [{integer: 3e2}],
        ThrottleInterval: [{integer: 30}],
        RunAtLoad: true,
        KeepAlive: true
    }
}

module.exports = {
    LINUX,
    WINDOWS,
    DARWIN
}