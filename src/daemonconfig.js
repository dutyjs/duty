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

}

module.exports = {
    LINUX,
    WINDOWS,
    DARWIN
}