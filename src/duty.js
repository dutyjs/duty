const colors = require("colors")
const crypto = require("crypto")
const fs = require("fs")
const ReadTodo = require("./readtodo")
const DeleteTodo = require("./deletetodo")
const ExportTodo = require("./exporttodo")


const Daemon = require("./daemon")
const moment = require("moment")

const {
    platform,
    homedir
} = require("os")
const util = require("util")

let Notify = require("node-notifier")

const {
    resolve,
    join
} = require("path")
const { printf } = require("control-js");


class DutyTodo {
    constructor({
        location,
        todoGroup,
        notification,
        timeout
    }) {

        this.MANAGER = {
            location,
            todoGroup,
            notification,
            timeout
        }

    }

    static CATEGORIES(_this) {

        let {
            MANAGER: {
                todoGroup
            }
        } = _this,
            _categories = new Map(),
            i = 0,
            cb = ({
                category
            }) => {

                i++

                for (let _cat of category) {

                    if (_categories.has(_cat)) {
                        _categories.set(_cat, _categories.get(_cat) + 1)
                        continue
                    }

                    _categories.set(_cat, 1)

                }

                if (Object.keys(todoGroup).length === i) {
                    return true
                }

            }

        const _recurseCategories = cateState => {

            let {
                value
            } = cateState.next()

            if (value) {
                let [category, assigned] = value

                printf("%s (%d)", category, assigned)

                _recurseCategories(cateState)

            }

            return 0
        }

        DutyTodo.CALLGENERATORYLOOP(_this, cb).then(_ => {

            const _getCategories = _categories.entries()

            _recurseCategories(_getCategories)

        })
    }
    static VERIFY_DATE(date) {
        // month, day, year
        date = date.split("/").filter(Number)

        if (date.length !== 3) {
            return false
        }

        const [month, day, year] = date.map(Number)


        if ((month >= 1 && month <= 12) &&
            (day >= 1 && day <= 31) &&
            (String(year).length === 4)) {
            return true
        }

        return false


    }
    static PRINT(text) {
        process.stdout.write(colors.bold(text))
    }
    static REMODIFIYHASH({
        type,
        content,
        text,
        regex,
        todoGroup,
        hash
    }) {

        
        switch(type) {
            case "replace":
                content = content.replace(regex,text);
                break;
            case "append":
                content = `${content} ${text}`
                break;
            case "edit":
                content = text;
                break;
            default:
                DutyTodo.ErrMessage(`invalid type <${type}>`);
        }

        let newHash = crypto.createHash("sha256").update(content)
            .digest("hex"),
            mDate = moment().format("DD/MM/YYYY"),
            modifiedDate = mDate,
            longHash = newHash

        newHash = newHash.slice(0, newHash.length - 55)
        todoGroup[newHash] = Object.create({})
        Object.assign(todoGroup[newHash], todoGroup[hash], {
            content,
            longHash,
            hash: newHash,
            modifiedDate
        })

        delete todoGroup[hash]

    }
    static NotEmpty({
        todoGroup
    }) {
        return (Object.keys(todoGroup).length !== 0) ? true : false
    }
    static URGENCY_ERROR() {
        return "URGENCY_ERROR"
    }
    static NO_DAEMONMATCH() {
        return "NO_DAEMONMATCH"
    }
    static DAEMONMATCH() {
        return "DAEMONMATCH"
    }
    static CALLGENERATORYLOOP(_this, cb) {

        // if ( ! cb ) throw new Error('check the stack trace, you are suppose to call cb on CALLGENERATORLOOP');

        return new Promise((resolve, reject) => {

            const gen = _this.IterateTodo()

            let _n = gen.next(),
                f

            while (!_n.done) {

                // pass the object to the callback function
                //   to see if it already exists
                //   the object will be modified in the callback function
                //   since object are passed by reference
                //   any scope that access the object, will get the
                //   modified object

                f = cb(_n.value)

                // different values will be returned
                //  so f === false and f === true
                //  is not a bad coding practice

                if (f === false) {
                    reject()
                    break
                } else if (f === true) {
                    resolve()
                    break
                } else if (f === DutyTodo.URGENCY_ERROR()) {
                    reject(_n.value)
                    break
                }
                _n = gen.next()
            }

        })
    }

    static ErrMessage(msg) {
        process.stderr.write(colors.bold(`${msg}\n`.red))
    }
    static WriteFile({
        location,
        todoGroup
    }) {
        fs.writeFileSync(location, JSON.stringify(todoGroup))
    }
    static SaveTodo({
            manager: {
                todoGroup,
                location,
                notification,
                timeout
            },
            hash,
            todo,
            category
        }) {

        let longHash = hash

        hash = hash.slice(0, hash.length - 55)

        const DATE = moment().format("DD/MM/YYYY"),
            date = DATE,
            completed = false


        todoGroup[hash] = {
            content: todo,
            hash,
            longHash,
            date,
            completed,
            notification,
            timeout
        }


        if (category && Array.isArray(category)) {

            Object.assign(todoGroup[hash], {
                category
            })

        } else if (category && (!Array.isArray(category))) {
            DutyTodo.ErrMessage(`expected category to be an array but got ${typeof(category)}`)

            return false
        }

        DutyTodo.WriteFile({
            location,
            todoGroup
        })
        DutyTodo.PRINT(`New todo has been added\nTotal todo is ${Object.keys(todoGroup).length}\n`.green)
    } *
        IterateTodo() {
            let {
                todoGroup
            } = this.MANAGER
            // Object.keys and Object.entries
            //   in this case i choose to use Object.keys
            //   because Object.entries shows you the members of all
            //   the objects, and that is wanted is just the property names
            for (let todos of Object.keys(todoGroup)) {
                yield todoGroup[todos]
            }
        }
    add({
        todo,
        category
    }) {

        if (!todo) {
            DutyTodo.ErrMessage("A todo content needs to be added")
            return false
        }

        let hash = crypto.createHash("sha256").update(todo).digest("hex"),
            manager, {
                todoGroup
            } = manager = this.MANAGER

        if (!DutyTodo.NotEmpty(manager)) {
            DutyTodo.SaveTodo({
                manager,
                hash,
                todo,
                category
            })
            return true
        }
        let j = 0,
            isAdded = false
        let cb = ({
            longHash
        }) => {
            j++

            if (longHash === hash) {
                isAdded = true
                return false
            } else if ((Object.keys(todoGroup).length === j) && (!isAdded)) {
                return true
            }
        }

        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.SaveTodo({
                    manager,
                    hash,
                    todo,
                    category
                })
            })
            .catch(_ => {
                DutyTodo.ErrMessage("This todo already exists")
            })
    }

    append({
        hash,
        text
    }) {
        if (!hash) {
            DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`)
            return false
        } else if (!text) {
            DutyTodo.ErrMessage(`got ${typeof(text)} instead of text`)
            return false
        } else if (hash.length <= 4) {
            DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`)
            return false
        }


        let hashRegex = new RegExp(`^${hash}`),
            {
                location,
                todoGroup
            } = this.MANAGER,
            j = 0,
            cb = ({
                hash,
                longHash,
                content
            }) => {
                j++
                if (hashRegex.test(longHash)) {

                    const type = "append"

                    DutyTodo.REMODIFIYHASH({
                        type,
                        content,
                        text,
                        undefined,
                        todoGroup,
                        hash
                    })

                    return true
                } else if (Object.keys(todoGroup).length === j) {
                    // this block of code should never run if a true hash
                    //     was found
                    return false
                }
            }

        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.WriteFile({
                    location,
                    todoGroup
                })
            })
            .catch(_ => {
                DutyTodo.ErrMessage(`${hash} was not found, todo is not in list`)
            })
    }
    replace({
        hash,
        regexp,
        text
    }) {
        if (!hash) {
            DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`)
            return false
        } else if (!text) {
            DutyTodo.ErrMessage(`got ${typeof(text)} instead of string`)
            return false
        } else if (hash.length <= 4) {
            DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`)
            return false
        } else if (!regexp) {
            DutyTodo.ErrMessage("not regexp was set")
            return false
        }

        let {
            location,
            todoGroup
        } = this.MANAGER
        let hashRegex = new RegExp(`^${hash}`),
            j = 0,
            regex = new RegExp(regexp),
            cb = ({
                hash,
                longHash,
                content
            }) => {
                j++
                if (hashRegex.test(longHash)) {

                    const type = "replace"

                    DutyTodo.REMODIFIYHASH({
                        type,
                        content,
                        text,
                        regex,
                        todoGroup,
                        hash
                    })
                    return true
                } else if (Object.keys(todoGroup).length === j) {
                    return false
                }
            }

        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.WriteFile({
                    location,
                    todoGroup
                })
            }).catch(_ => {
                DutyTodo.ErrMessage(`${hash} was not found`)
            })
    }
    markcompleted({
        hash
    }) {
        if (!hash) {
            DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`)
            return false
        } else if (hash.length <= 4) {
            DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`)
            return false
        }
        let {
            location,
            todoGroup
        } = this.MANAGER,
            hashRegex = new RegExp(`^${hash}`),
            j = 0,
            cb = ({
                hash,
                longHash,
                completed
            }) => {
                j++
                if (hashRegex.test(longHash) && !completed) {
                    Object.assign(todoGroup[hash], {
                        completed: true
                    })
                    return true
                } else if (hashRegex.test(longHash) && completed) {
                    return true
                } else if (Object.keys(todoGroup).length === j) {
                    return false
                }
            }

        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.WriteFile({
                    location,
                    todoGroup
                })
            }).catch(_ => {
                DutyTodo.ErrMessage(`${hash} was not found`)
            })


    }
    note({
        hash,
        note
    }) {
        if (!hash) {
            DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`)
            return false
        } else if (hash.length <= 4) {
            DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`)
            return false
        } else if (!note) {
            DutyTodo.ErrMessage("note is not defined")
            return false
        }

        let {
            location,
            todoGroup
        } = this.MANAGER,
            hashRegex = new RegExp(`^${hash}`),
            j = 0,
            cb = ({
                hash,
                longHash
            }) => {
                j++
                if (hashRegex.test(longHash) && !todoGroup[hash].note) {

                    Object.assign(todoGroup[hash], {
                        note
                    })
                    return true

                } else if (hashRegex.test(longHash) && todoGroup[hash].note) {

                    note = `${todoGroup[hash].note} ${note}`

                    Object.assign(todoGroup[hash], {
                        note
                    })
                    return true
                } else if (Object.keys(todoGroup).length === j) {
                    return false
                }
            }

        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.WriteFile({
                    location,
                    todoGroup
                })
            }).catch(_ => {
                DutyTodo.ErrMessage(`${hash} was not found`)
            })

    }
    removenote({
        hash
    }) {

        if (!hash) {
            DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`)
            return false
        } else if (hash.length <= 4) {
            DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`)
            return false
        }

        let {
            location,
            todoGroup
        } = this.MANAGER,
            hashRegex = new RegExp(`^${hash}`),
            j = 0,
            cb = ({
                hash,
                longHash
            }) => {
                j++
                if (hashRegex.test(longHash) && todoGroup[hash].note) {
                    delete todoGroup[hash].note
                    return true
                } else if (hashRegex.test(longHash) && !todoGroup[hash].note) {
                    return true
                } else if (Object.keys(todoGroup).length === j) {
                    return false
                }
            }

        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.WriteFile({
                    location,
                    todoGroup
                })
            }).catch(_ => {
                DutyTodo.ErrMessage(`${hash} was not found`)
            })

    }
    read(type, opt = {}) {


        let {
            date,
            modifiedDate
        } = opt
        if (!type) {
            DutyTodo.ErrMessage(`type ${type} is not supported`)
            return false
        } else if (type === "date" && (!date && !modifiedDate)) {
            DutyTodo.ErrMessage("expected two argument but got one, second argument should be a date in mm/dd/yy. ")
            return false
        } else if (type === "due" && !date) {
            DutyTodo.ErrMessage("expected date argument to be set")
            return false
        } else if ((date || modifiedDate) && !DutyTodo.VERIFY_DATE(date)) {
            DutyTodo.ErrMessage("expected two argument but got one, second argument should be a date in mm/dd/yy.")
            return false
        }


        try {
            const p = ReadTodo.createType()
            const self = this

            p.handleRead({
                type,
                opt,
                self,
                DutyTodo
            })
        } catch (ex) {
            DutyTodo.ErrMessage(`${type} is not supported`)
            return false
        }
    }
    delete(type, opt = {}) {

        let {
            value
        } = opt

        if (!type) {
            DutyTodo.ErrMessage(`type ${type} is not supported`)
            return false
        } else if (type === "date" && (!value)) {
            DutyTodo.ErrMessage("expected two argument but got one, second argument should be a date in mm/dd/yy")
            return false
        } else if (type === "hash" && (!value || value.length <= 4)) {

            DutyTodo.ErrMessage("invalid hash type")
            return false
        } else if (type === "category" && (!value)) {
            DutyTodo.ErrMessage("category type is not specified")
            return false
        } else if (type === "date" && !DutyTodo.VERIFY_DATE(value)) {
            return DutyTodo.ErrMessage(`invalid date format specfied ${value}. Date should be specfied  in mm/dd/yy`)

        }
        try {
            const p = DeleteTodo.createType()

            const self = this

            p.handleDelete({
                type,
                opt,
                self,
                DutyTodo
            })

        } catch (ex) {
            DutyTodo.ErrMessage(`${type} is not supported`)
            return false
        }
    }
    urgency({
        hash,
        urgency
    }) {
        if (!hash) {
            DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`)
            return false
        } else if (hash.length <= 4) {
            DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`)
            return false
        } else if (!urgency) {
            DutyTodo.ErrMessage("require urgency argument to be set")
            return false
        }

        let [, _urgency] = urgency.match(/^urgency:([a-z]+)$/)

        switch (_urgency) {
        case "pending":
            break
        case "waiting":
            break
        case "tomorrow":
            break
        case "later":
            break
        case "today":
            break
        default:
            DutyTodo.ErrMessage(`invalid urgency type, supported urgency type are
					urgency:pending
					urgency:waiting
					urgency:tomorrow
					urgency:later
					urgency:today`)
            return false
        }

        let {
            location,
            todoGroup
        } = this.MANAGER,
            hashRegex = new RegExp(`^${hash}`),
            j = 0,
            cb = ({
                hash,
                longHash,
                urgency
            }) => {
                j++
                if (hashRegex.test(longHash) && Array.isArray(urgency)) {

                    if (urgency.includes(_urgency)) {
                        return DutyTodo.URGENCY_ERROR()
                    }

                    urgency.push(_urgency)
                    Object.assign(todoGroup[hash], {
                        urgency
                    })

                    return true
                } else if (hashRegex.test(longHash) && !urgency) {
                    let urgency = []
                    urgency.push(_urgency)
                    Object.assign(todoGroup[hash], {
                        urgency
                    })
                    return true
                } else if (Object.keys(todoGroup).length === j) {
                    return false
                }
            }
        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.WriteFile({
                    location,
                    todoGroup
                })
            }).catch(errMessage => {
                if (errMessage) {
                    return DutyTodo.ErrMessage("the specified urgency message, has already been added")
                }

                DutyTodo.ErrMessage(`${hash} was not found`)
            })
    }
    setPriority({
        hash,
        priority
    }) {
        if (!hash) {
            DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`)
            return false
        } else if (hash.length <= 4) {
            DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`)
            return false
        } else if (!priority) {
            DutyTodo.ErrMessage("required proirity argument to be set")
            return false
        } else if (priority) {
            switch (priority) {
            case "critical":
                break
            case "notcritical":
                break
            default:
                DutyTodo.ErrMessage("invalid priority type. Use critical or not critical")
            }
        }

        let {
            location,
            todoGroup
        } = this.MANAGER,
            hashRegex = new RegExp(`^${hash}`),
            j = 0,
            cb = ({
                hash,
                longHash
            }) => {
                j++
                if (hashRegex.test(longHash)) {
                    Object.assign(todoGroup[hash], {
                        priority
                    })
                    return true
                } else if (Object.keys(todoGroup).length === j) {
                    return false
                }
            }
        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.WriteFile({
                    location,
                    todoGroup
                })
            }).catch(_ => {
                DutyTodo.ErrMessage(`${hash} was not found`)
            })

    }
    categorize({
        hash,
        category
    }) {

        if (!hash) {

            DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`)
            return false

        } else if (hash.length <= 4) {

            DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`)
            return false

        } else if (!category || !Array.isArray(category)) {

            DutyTodo.ErrMessage(`expected category to be an array but got ${typeof(category)}`)
            return false

        }

        let {
            location,
            todoGroup
        } = this.MANAGER,
            hashRegex = new RegExp(`^${hash}`),
            j = 0,
            cb = ({
                hash,
                longHash,
                category: _jsonCategory
            }) => {
                j++
                if (hashRegex.test(longHash) && _jsonCategory) {


                    category.filter(_x => !_jsonCategory.includes(_x))
                        .forEach(_x => _jsonCategory.push(_x))

                    Object.assign(todoGroup[hash], {
                        category: _jsonCategory
                    })

                    return true

                } else if (hashRegex.test(longHash) && !_jsonCategory) {

                    _jsonCategory = []

                    category.forEach(cat => _jsonCategory.push(cat))
                    Object.assign(todoGroup[hash], {
                        category: _jsonCategory
                    })

                    return true
                } else if (Object.keys(todoGroup).length === j) {
                    return false
                }
            }

        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.WriteFile({
                    location,
                    todoGroup
                })
            }).catch(_ => {
                DutyTodo.ErrMessage(`${hash} was not found`)
            })

    }
    due({
        hash,
        date
    } = {}) {
        if (!hash || !date) {
            DutyTodo.ErrMessage("hash and due date needs to be specified")
            return false
        } else if (hash.length <= 4) {
            DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`)
            return false
        } else if (date && !DutyTodo.VERIFY_DATE(date)) {
            return DutyTodo.ErrMessage(`invalid date format specfied ${date}. Date should be specfied  in mm/dd/yy`)

        }

        let {
            location,
            todoGroup
        } = this.MANAGER,
            hashRegex = new RegExp(`^${hash}`),
            j = 0,
            cb = ({
                hash,
                longHash
            }) => {
                j++
                if (hashRegex.test(longHash)) {
                    Object.assign(todoGroup[hash], {
                        due_date: date
                    })
                    return true
                }
                if (Object.keys(todoGroup).length === j) {
                    return false
                }
            }

        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.WriteFile({
                    location,
                    todoGroup
                })
            }).catch(_ => {
                DutyTodo.ErrMessage(`${hash} was not found`)
            })
    }
    export ({
        type,
        path
    }) {
        if (!type) {
            DutyTodo.ErrMessage("specify the format type to export as")
            return false
        } else if ((path && (!fs.existsSync(path) || fs.existsSync(path)))) {
            path = resolve(path)
        }

        try {
            const _export = ExportTodo.createExport()
            const self = this
            _export.export({
                type,
                DutyTodo,
                self,
                path
            })
        } catch (ex) {
            DutyTodo.ErrMessage(`format ${type} is not supported`)
        }
    }
    static NotificationArg(notification) {
        return /^true$|^false$/.test(notification)
    }
    static TimeoutArg(timeout) {
        return !isNaN(Number(timeout))
    }
    set_notify(hash, {
        notification,
        timeout
    }) {

        if (!hash) {
            DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`)
            return false
        } else if (hash && hash.length < 4) {
            DutyTodo.ErrMessage("length of hash should be greater than or equal to 4")
            return false
        }

        if (!DutyTodo.NotificationArg(notification)) {
            DutyTodo.ErrMessage("notification state argument needs to be true or false")
            return false
        }

        if (!DutyTodo.TimeoutArg(timeout)) {
            DutyTodo.ErrMessage("timeout that is amount of times the todo should show is not a number")
            return false
        }

        let {
            location,
            todoGroup
        } = this.MANAGER,
            hashRegex = new RegExp(`^${hash}`),
            j = 0,
            cb = ({
                hash,
                longHash
            }) => {
                j++
                if (hashRegex.test(longHash)) {
                    Object.assign(todoGroup[hash], {
                        notification,
                        timeout
                    })
                    return true
                }
                if (Object.keys(todoGroup).length === j) {
                    return false
                }
            }

        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.WriteFile({
                    location,
                    todoGroup
                })
            }).catch(_ => {
                DutyTodo.ErrMessage(`hash value ${hash} was not found`)
            })

    }
    edit({hash,text}) {
        if (!hash) {
            DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`)
            return false
        } else if (hash && hash.length < 4) {
            DutyTodo.ErrMessage("length of hash should be greater than or equal to 4")
            return false
        }

        let {
            location,
            todoGroup
        } = this.MANAGER,
            hashRegex = new RegExp(`^${hash}`),
            j = 0,
            cb = ({
                longHash,
                content
            }) => {
                j++
                if (hashRegex.test(longHash)) {    
                    const type = "edit"
                    DutyTodo.REMODIFIYHASH({
                        type,
                        content,
                        text,
                        undefined,
                        todoGroup,
                        hash
                    });
                    return true
                }
                if (Object.keys(todoGroup).length === j) {
                    return false
                }
            }



        DutyTodo.CALLGENERATORYLOOP(this, cb)
            .then(_ => {
                DutyTodo.WriteFile({
                    location,
                    todoGroup
                })
            }).catch(_ => {
                DutyTodo.ErrMessage(`hash value ${hash} was not found`)
            })

    }
    status(type = "all") {

        if (type === "all") {

            let {
                MANAGER: {
                    todoGroup
                }
            } = this

            DutyTodo.PRINT(`total todos are ${Object.keys(todoGroup).length}`.green)

            DutyTodo.CATEGORIES(this)

        } else if (type === "category") {
            DutyTodo.CATEGORIES(this)
        } else {
            DutyTodo.ErrMessage(`${type} is not supported`)
        }


    }
    execDaemon() {
        try {
            Daemon.CreateDaemon(platform())
            DutyTodo.PRINT("service has been created...")
            process.exit(0)
        } catch(ex) {
            throw ex
        }
    }
    // this daemon method is to be use only the daemon manager
    daemon() {
        const self = this;

        setInterval(_ => {
            
            let readDaemonObject = {
                type: "due",
                opt: {

                    date: moment().format("MM/DD/YYYY"),

                    _cb({
                        content,
                        hash,
                        due_date,
                        notification,
                        timeout
                    }) {
                        
                        if (!notification) return false

                        setTimeout(_ => {
                            Notify.notify({
                                title: `Todo ${hash} is due for today ${due_date}`,
                                icon: join(__dirname, "assets/logo.png"),
                                message: content,
                                sound: true,
                                wait: true
                            })

                        }, Number(timeout))
                    }
                },
                self,
                DutyTodo
            }

            const daemonRead = ReadTodo.createType()
            daemonRead.handleRead(readDaemonObject)

        }, 20000);
    }
}

module.exports = DutyTodo
