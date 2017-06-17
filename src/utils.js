const crypto = require("crypto");
const DutyTodo = require("./duty.js");
const path = require("path");
const fs = require("fs");

const node_env = () => {
    return process.env.NODE_ENV !== "development";
};

const getPrevCurrHash = (previousHash, todoGroup) => {
    return {
        previousHash,
        currentHash: getProperty(todoGroup).hash
    }
}

const getProperty = todoGroup => {

    let  __hash = Object.keys(todoGroup);
    __hash = __hash[__hash.length - 1];

    return todoGroup[__hash];
}

function isExists(file,commander) {

    let fileContent,
        _file = path.join(path.dirname(__dirname), file);

    if ( fs.existsSync(_file) && (fileContent = fs.readFileSync(_file) ) &&
fs.existsSync(JSON.parse(fileContent.toString()).location) )  {

        return node_env() ? commander.outputHelp() : "Enjoy...";

    }

    return "error while reading config file";

}


function addOption(todo,category = ["general"],ff) {
    let hash = crypto.createHash("sha256").update(todo).digest("hex"),
        manager = ff.MANAGER;

    return ff.add({todo,category,hash},manager)
        .then(_ => {

            let _pMessage = DutyTodo.SaveTodo({
                manager,
                hash,
                todo,
                category
            });
            node_env() ? DutyTodo.PRINT(_pMessage) : "";

            return {
                manager,
                hash,
                todo,
                category
            };

        }).catch(_ => {

            node_env() ? DutyTodo.ErrMessage(_) : "";
            return "failed";

        });
}

function appendOption(hash,text,ff) {

    let { location, todoGroup } = ff.MANAGER;

    return ff.append({hash,text})
        .then(_ => {
            let _pMessage = DutyTodo.WriteFile({
                location,
                todoGroup
            });

            node_env() ? DutyTodo.PRINT(_pMessage) : "";

            return getPrevCurrHash(hash,todoGroup);
        })
        .catch( _  => {
            node_env() ? DutyTodo.ErrMessage(_ ? _ : `content of ${hash} appended succefully`) : "";
            return "failed";
        });

}

function replaceOption(hash,regexp,text,ff) {

    let { todoGroup, location } = ff.MANAGER;

    return ff.replace({hash,regexp,text}).then(_ => {

        let _pMessage = DutyTodo.WriteFile({
            location,
            todoGroup
        });

        node_env() ? DutyTodo.PRINT(_pMessage) : "";

        return getPrevCurrHash(hash,todoGroup);

    }).catch(_ => {
        node_env() ? DutyTodo.ErrMessage(_) : console.log();
        return "failed";
    });
}

function markCompletedOption(hash,ff) {

    let { todoGroup, location } = ff.MANAGER;

    return ff.markcompleted({hash}).then(_ => {

            let _pMessage = DutyTodo.WriteFile({
                location,
                todoGroup
            });

            node_env() ? DutyTodo.PRINT(_pMessage) : "";

            return {
                completed: getProperty(todoGroup).completed
            }
        }).catch(_ => {
            node_env() ? DutyTodo.ErrMessage(_) : console.log();
            return "failed";
        });
}

function noteOption(hash,note,ff) {
    let { todoGroup, location } = ff.MANAGER;
    return ff.note({hash,note}).then( _ => {
            let _pMessage = DutyTodo.WriteFile({
                location,
                todoGroup
            });

            node_env() ? DutyTodo.PRINT(_pMessage) : "";

            return {
                note: getProperty(todoGroup).note
            }
        }).catch(_ => {
            node_env() ? DutyTodo.ErrMessage(_) : console.log();
            return "failed";
        });
}

module.exports = {
    addOption,
    appendOption,
    replaceOption,
    markCompletedOption,
    noteOption,
    isExists,
    node_env
};