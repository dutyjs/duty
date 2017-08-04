#!/usr/bin/env bash

installDaemon() {
    local install_path="${1}"
    
    [[ -z "${install_path}" ]] && {
        printf "%s\n" "specify the location where duty was installed"
        return 1;
    }
    
    location="$(which ${install_path})"

    {
        [[ -z "${location}" ]] || [[ "$(type -t ${location})" != "file" ]]
    } && {
        printf "%s\n" "cannot get the location of ${install_path}"
        return 1;
    }

    install_path="$(which ${install_path})"
    local platform="$(uname -s)"
    platform="${platform,,}"

    if [[ "${platform}" == "linux" ]];then

        __systemd "${install_path}"
        return 0;

  elif [[ "${platform}" == "darwin" ]];then

      __launchd "${install_path}"
      return 0;

  else 

    printf "%s\n" "platform is not supported"
    return 3;

  fi

    

}

__systemd() {
    local _path="${1}"
    cat <<EOF > /etc/systemd/system/duty-js.service
[Unit]
Description=Duty Todo Daemon

[Service]
Type=notify
ExecStart=${_path} daemon
Restart=always
RestartSec=5s
WatchdogSec=5
Environment=DISPLAY=:0

[Install]
WantedBy=multi-user.target

EOF
# WatchdogSec=15
# StartLimitBurst=5
# StartLimitInterval=50
# 
# 
systemctl disable &>/dev/null 
systemctl enable duty-js
systemctl daemon-reload
service duty-js restart &>/dev/null
}
__launchd() {
    local _path="${1}"
    mkdir -p ~/Library/LaunchAgents/
    cat <<EOF > ~/Library/LaunchAgents/com.duty.js.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>Label</key>
        <string>com.duty.js</string>
        <key>ProgramArguments</key>
        <array>
            <string>${_path}</string>
            <string>daemon</string>
        </array>
        <key>StartInterval</key>
        <integer>3000</integer>
        <key>ThrottleInterval</key>
        <integer>30</integer>
        <key>RunAtLoad</key>
        </true>
        <key>KeepAlive</key>
        </true>
    </dict>
</plist>

EOF

launchctl load -w ${location} && launchctl start com.duty.js

}

installDaemon "${1}"
