const LINUX = {
    Unit: {
        Description: "Duty Todo Daemon"
    },
    Service: {
        Type: "Notify",
        ExecStart:`${process.argv[1]} daemon`,
        Restart: "always",
        WatchdogSec: "10",
        Environment: "DISPLAY=:0"
    },
    Install: {
        WantedBy: "multi-user.target"
    }
}

const WINDOWS = {

}

const DARWIN = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>Label</key>
        <string>com.duty.js</string>
        <key>ProgramArguments</key>
        <array>
            <string>${process.argv[0]}</string>
            <string>daemon</string>
        </array>
        <key>StartInterval</key>
        <integer>${3e2}</integer>
        <key>ThrottleInterval</key>
        <integer>30</integer>
        <key>RunAtLoad</key>
        </true>
        <key>KeepAlive</key>
        </true>
    </dict>
</plist>
`

module.exports = {
    LINUX,
    WINDOWS,
    DARWIN
}