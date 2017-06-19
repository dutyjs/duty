// to avoid cyclic dependency issues,
//   it is important to avoid require duty.js and extending
//   the below class with DutyTodo class

const colors = require("colors");
const moment = require("moment");

class ReadTodo {
    constructor() {}
    static createType() {
        return new ReadTodo();
    }
    static UNICODE_VALUES() {
        const bold = colors.bold;
        return {
            checkmark: bold("\u2714".green),
            ballot: bold("\u2718".red),
            critical: bold("\u25CF".red),
            notcritical: bold("\u25D0".green),
            critical: bold("\u2762".red),
            notcritical: bold("\u2762".green),
            circle: bold("\u25CF".red),
            halfcircle: bold("\u25CB".green),
            completecircle: bold("\u25CF".green)
        };
    }
    static HANDLE_DUE_DATE({due_date}) {

        let _date = moment().format("MM/DD/YYYY");

        due_date = Number(due_date.split("/").join(""));
        _date = Number(_date.split("/").join(""));

        const TIME_LEFT = String((due_date - _date)).replace(/0+$/,"");

        const { circle, halfcircle, completecircle } = ReadTodo.UNICODE_VALUES();

        if ( due_date > _date ) {
            return `${TIME_LEFT}days from now`;
        } else if ( due_date < _date ) {
            return `${parseInt(TIME_LEFT) * -1}days before now`;
        } else if ( due_date === _date ) {
            return `today ${completecircle}`;
        }

    }
    static NO_NOTCOMPLETED() {
        return "NO_NOTCOMPLETED";
    }
    static NO_COMPLETED() {
        return "NO_COMPLETED";
    }
    static NO_DATE() {
        return "NO_DATE";
    }
    static NO_CATEGORY() {
        return "NO_CATEGORY";
    }
    static NO_URGENCY() {
        return "NO_URGENCY";
    }
    static HANDLE_PRIORITY(priority) {
        return ((priority === "critical") ?  "critical" : "notcritical");
    }

    static STYLE_READ(opt,DutyTodo, { notification: _configNotification , timeout: _configTimeout }) {

        let {
            hash,
            content,
            completed,
            date,
            modifiedDate,
            due_date,
            priority,
            urgency,
            category,
            note,
            notification,
            timeout
        } = opt;

        let unicodes = ReadTodo.UNICODE_VALUES();
        // moment(date).format('MM/DD/YYYY') to support
        //    todo added with previous version of duty-js


        DutyTodo.PRINT(`

hash:\t\t${hash}  ${completed ? unicodes.checkmark : unicodes.ballot}
creation date:\t${date} ${modifiedDate ? `
modified date:\t${modifiedDate}` : ""} ${due_date ? `
due date:\t${ReadTodo.HANDLE_DUE_DATE({due_date})}` : ""}${category ? `
category:\t(${category})` : ""} ${priority ? `
priority:\t${priority}${unicodes[ReadTodo.HANDLE_PRIORITY(priority)]}` : ""} ${urgency ? `
urgency:\t${urgency} `: ""} ${note ? `
note:\t\t${note}`: ""}
content:\t${content}
notification:\t${/^yes$|^no$/.test(notification) ? notification : _configNotification}
timeout:\t${timeout ? timeout : _configTimeout}
`);

    }
    handleRead({type,opt,self: _this,DutyTodo}) {
        let { todoGroup } = _this.MANAGER;
        this.type = type;
        this.DutyTodo = DutyTodo;
        this.todoGroup = todoGroup ;
        this._this = _this;
        this._opt = opt;

        let _matched = this.type.match(/^(urgency|category|eval):([a-zA-Z0-9\"\s]+)$/);
        const [,_type,_typeOfType] = _matched ? _matched : [,undefined,undefined];

        if ( _typeOfType ) {
            return this[_type](_typeOfType);
            
        }

        return this[this.type]();
    }

    static MakeBuffer(hashValues) {
        return Buffer.from(hashValues);
    }

    all() {

        let { DutyTodo, _this, todoGroup } = this,
            hashValues = [], j = 0,
            cb = ({hash}) => {
                j++;
                if ( Object.keys(todoGroup).length !== j ) {
                    hashValues.push(hash);
                } else {
                    return hashValues;
                }
            };

        return DutyTodo.CALLGENERATORYLOOP(_this, cb);
    }
    notification() {
        let { DutyTodo, _this, todoGroup } = this,
            hashValues = [], j = 0,

            cb = ({notification:_notify,hash}) => {
                j++;
                if ( Object.keys(todoGroup).length !== j ) {
                    if ( _notify === "yes" ) {
                        hashValues.push(hash);
                    }
                } else {
                    return hashValues;
                }
            };

        return DutyTodo.CALLGENERATORYLOOP(_this, cb);
    }
    eval(strToEval) {

        let { DutyTodo, _this, todoGroup } = this,
            hashValues = [], j = 0,

            cb =  ({due_date,hash}) => {
                j++;
                if ( Object.keys(todoGroup).length !== j ) {

                    if ( due_date && 
                        ReadTodo.HANDLE_DUE_DATE({due_date}) === strToEval ) {
                        hashValues.push(hash);
                    }

                } else {
                    return hashValues;
                }
            }

        return DutyTodo.CALLGENERATORYLOOP(_this,cb)
    }
    due() {

        let { DutyTodo, _this, todoGroup } = this,
            { date: _dueDate } = this._opt, j = 0,
            hashValues = [],
            cb = ({hash,due_date}) => {
                j++;

                if ( Object.keys(todoGroup).length !== j ) {

                    if ( due_date && _dueDate === due_date ) {
                        hashValues.push(hash);
                    }    

                } else {
                    return hashValues;
                }
            };


        return DutyTodo.CALLGENERATORYLOOP(_this,cb);

    }
    category(categoryType) {

        let { DutyTodo, _this, todoGroup } = this,
            isRead = false, j = 0,
            hashValues = [],
            cb = ({hash,category}) => {
                j++;
                if ( category && Array.isArray(category) && category.includes(categoryType)) {
                    isRead = true;
                    hashValues.push(hash);
                }

                if ( ! isRead && Object.keys(todoGroup).length === j ) {
                    return ReadTodo.NO_CATEGORY();
                } else if ( isRead && Object.keys(todoGroup).length === j ) {
                    return hashValues;
                }
            };

        return DutyTodo.CALLGENERATORYLOOP(_this,cb);
    }
    urgency(urgencyType) {

        let { DutyTodo, _this, todoGroup } = this;
        switch(urgencyType) {
        case "pending":break;
        case "waiting":break;
        case "tomorrow":break;
        case "later":break;
        case "today": break;
        default:
            return Promise.reject("invalid urgency type to read");
        }

        let isRead = false, j = 0,
            hashValues = [],
            cb = ({hash,urgency}) => {
                j++;
                if ( urgency && Array.isArray(urgency) && urgency.includes(urgencyType) ) {
                    isRead = true;
                    hashValues.push(hash);
                }

                if ( ! isRead && Object.keys(todoGroup).length === j ) {
                    return ReadTodo.NO_URGENCY();
                } else if ( isRead && Object.keys(todoGroup).length === j ) {
                    return hashValues;
                }
            };

        return DutyTodo.CALLGENERATORYLOOP(_this,cb);

    }
    completed() {
        let { DutyTodo, _this, todoGroup } = this,
            isRead = false,j = 0,
            hashValues = [],
            cb = ({completed,hash}) => {
                j++;
                if ( completed ) {
                    isRead = true;
                    hashValues.push(hash);
                }

                if ( ! isRead && Object.keys(todoGroup).length === j ) {
                    return ReadTodo.NO_COMPLETED();
                } else if ( isRead && Object.keys(todoGroup).length === j ) {
                    return hashValues;
                }
            };

        return DutyTodo.CALLGENERATORYLOOP(_this,cb);

    }
    notcompleted() {

        let { DutyTodo, _this, todoGroup } = this,
            isRead = false,j = 0,
            hashValues = [],
            cb = ({completed,hash}) => {
                j++;
                if ( ! completed ) {
                    isRead = true;
                    hashValues.push(hash);
                }

                if ( ! isRead && Object.keys(todoGroup).length === j ) {
                    return ReadTodo.NO_NOTCOMPLETED();
                } else if ( isRead && Object.keys(todoGroup).length === j ) {
                    return hashValues;
                }
            };

        return DutyTodo.CALLGENERATORYLOOP(_this,cb);

    }
    date() {
        let { DutyTodo, _this, todoGroup } = this,
            { date: _userDate , modifiedDate: _userModifiedDate} = this._opt,
            isRead = false,j = 0,
            hashValues = [],
            cb = ({date,modifiedDate,hash}) => {
                j++;
                if ( (_userDate && date === _userDate) && (_userModifiedDate && modifiedDate === _userModifiedDate)
                ) {
                    isRead = true;
                    hashValues.push(hash);
                } else if ( (_userDate && date === _userDate) && !_userModifiedDate ) {
                    isRead = true;
                    hashValues.push(hash);
                }

                if ( ! isRead && Object.keys(todoGroup).length === j ) {
                    return ReadTodo.NO_DATE();
                } else if ( isRead && Object.keys(todoGroup).length === j ) {
                    return hashValues;
                }
            };

        return DutyTodo.CALLGENERATORYLOOP(_this,cb);
    }


}
module.exports = ReadTodo;
