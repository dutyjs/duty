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

    [[ "$(file $(which init))" =~ (systemd|upstart|sysvinit) ]]
    
    case "${BASH_REMATCH}" in
        systemd)
            __systemd "${install_path}"
            ;;
        upstart)
            ;;
        sysvinit)
            ;;
    esac
    

}

__systemd() {
    local _path="${1}"
    cat <<EOF >> /etc/systemd/system/duty-js.service
[Unit]
Description=Duty Todo Daemon

[Service]
ExecStart=${_path} daemonize
Restart=always
StartLimitBurst=100
RestartSec=1


[Install]
WantedBy=multi-user.target

EOF
}



installDaemon "${1}"
