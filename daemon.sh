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

    [[ "$(file $(which init))" =~ (systemd) ]] && {
        __systemd "${install_path}"
    } || {
        printf "%s\n" "only systemd daemon mananger is required";
    }
    

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
WatchdogSec=5
Environment=DISPLAY=:0

[Install]
WantedBy=multi-user.target

EOF
}

installDaemon "${1}"
