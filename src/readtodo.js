// to avoid cyclic dependency issues,
//   it is important to avoid require duty.js and extending
//   the below class with DutyTodo class

const colors = require("colors");
const moment = require("moment");

class ReadTodo {
  constructor () {}
  static createType () {
    return new ReadTodo();
  }
  static UNICODE_VALUES () {
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
  static HANDLE_DUE_DATE ({due_date}) {
    const dueDate = moment(due_date, "DD/MM/YYYY"),
      presentDate = moment(),
      diff = dueDate.diff(presentDate, "days");

    if (Math.sign(diff) === -1) { return `${diff * -1} day(s) before now`; }

    if (Math.sign(diff) > 0) { return `${diff} day(s) from now`; }

    if (Math.sign(diff) === 0) { return "today"; }
  }
  static HANDLE_PRIORITY (priority) {
    return ((priority === "critical") ? "critical" : "notcritical");
  }

  static STYLE_READ (opt, DutyTodo) {
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
urgency:\t${urgency} ` : ""} ${note ? `
note:\t\t${note}` : ""}
content:\t${content}
notification:\t${notification}
timeout:\t${timeout}
`);
  }

  handleRead ({type, opt, self: _this, DutyTodo}) {
    let { todoGroup } = _this.MANAGER;
    this.type = type;
    this.DutyTodo = DutyTodo;
    this.todoGroup = todoGroup;
    this._this = _this;
    this._opt = opt;

    let _matched = this.type.match(/^(urgency|category|eval):([a-zA-Z0-9\"\s()]+)$/);
    const [, _type, _typeOfType] = _matched || [, undefined, undefined];

    if (_typeOfType) {
      return this[_type](_typeOfType);
    }

    return this[this.type]();
  }

  all () {
    let { DutyTodo, _this, todoGroup } = this,
      hashValues = [], j = 0, isRead = false,
      cb = ({hash}) => {
        if (Object.keys(todoGroup).length !== j++) {
          isRead = true;
          hashValues.push(hash);
        }
        let retval = ReadTodo.CheckState(isRead, todoGroup, j, hashValues, DutyTodo);

        if (retval) return retval;
      };

    return DutyTodo.CALLGENERATORYLOOP(_this, cb);
  }
  notification () {
    let { DutyTodo, _this, todoGroup } = this,
      hashValues = [], j = 0,
      isRead = false,
      cb = ({notification: _notify, hash}) => {
        if (Object.keys(todoGroup).length !== j++) {
          if (_notify === "yes") {
            isRead = true;
            hashValues.push(hash);
          }
        }

        let retval = ReadTodo.CheckState(isRead, todoGroup, j, hashValues, DutyTodo);

        if (retval) return retval;
      };

    return DutyTodo.CALLGENERATORYLOOP(_this, cb);
  }
  eval (strToEval) {
    let { DutyTodo, _this, todoGroup } = this,
      hashValues = [], j = 0,
      isRead = false,
      cb = ({due_date, hash}) => {
        if (Object.keys(todoGroup).length !== j++) {
          if (due_date && ReadTodo.HANDLE_DUE_DATE({due_date}) === strToEval) {
            isRead = true;
            hashValues.push(hash);
          }
        }

        let retval = ReadTodo.CheckState(isRead, todoGroup, j, hashValues, DutyTodo);

        if (retval) return retval;
      };

    return DutyTodo.CALLGENERATORYLOOP(_this, cb);
  }
  static CheckState (isRead, todoGroup, j, hashValues, DutyTodo) {
    if (!isRead && Object.keys(todoGroup).length === j) {
      return DutyTodo.NO_READ();
    } else if (isRead && Object.keys(todoGroup).length === j) {
      return hashValues;
    }
    return undefined;
  }
  due () {
    let { DutyTodo, _this, todoGroup } = this,
      { date } = this._opt, j = 0,
      hashValues = [],
      isRead = false,
      cb = ({hash, due_date}) => {
        if (Object.keys(todoGroup).length !== j++) {
          if (due_date && date === due_date) {
            isRead = true;
            hashValues.push(hash);
          }
        }

        let retval = ReadTodo.CheckState(isRead, todoGroup, j, hashValues, DutyTodo);

        if (retval) return retval;
      };

    return DutyTodo.CALLGENERATORYLOOP(_this, cb);
  }
  category (categoryType) {
    let { DutyTodo, _this, todoGroup } = this,
      isRead = false, j = 0,
      hashValues = [],
      cb = ({hash, category}) => {
        j++;
        if (category && Array.isArray(category) && category.includes(categoryType)) {
          isRead = true;
          hashValues.push(hash);
        }

        let retval = ReadTodo.CheckState(isRead, todoGroup, j, hashValues, DutyTodo);

        if (retval) return retval;
      };

    return DutyTodo.CALLGENERATORYLOOP(_this, cb);
  }
  urgency (urgencyType) {
    let { DutyTodo, _this, todoGroup } = this;
    switch (urgencyType) {
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
      cb = ({hash, urgency}) => {
        j++;
        if (urgency && Array.isArray(urgency) && urgency.includes(urgencyType)) {
          isRead = true;
          hashValues.push(hash);
        }

        let retval = ReadTodo.CheckState(isRead, todoGroup, j, hashValues, DutyTodo);

        if (retval) return retval;
      };

    return DutyTodo.CALLGENERATORYLOOP(_this, cb);
  }
  completed () {
    let { DutyTodo, _this, todoGroup } = this,
      isRead = false, j = 0,
      hashValues = [],
      cb = ({completed, hash}) => {
        j++;
        if (completed) {
          isRead = true;
          hashValues.push(hash);
        }

        let retval = ReadTodo.CheckState(isRead, todoGroup, j, hashValues, DutyTodo);

        if (retval) return retval;
      };

    return DutyTodo.CALLGENERATORYLOOP(_this, cb);
  }
  notcompleted () {
    let { DutyTodo, _this, todoGroup } = this,
      isRead = false, j = 0,
      hashValues = [],
      cb = ({completed, hash}) => {
        j++;
        if (!completed) {
          isRead = true;
          hashValues.push(hash);
        }

        let retval = ReadTodo.CheckState(isRead, todoGroup, j, hashValues, DutyTodo);

        if (retval) return retval;
      };

    return DutyTodo.CALLGENERATORYLOOP(_this, cb);
  }
  date () {
    let { DutyTodo, _this, todoGroup } = this,
      { date: _userDate, modifiedDate: _userModifiedDate} = this._opt,
      isRead = false, j = 0,
      hashValues = [],
      cb = ({date, modifiedDate, hash}) => {
        j++;
        if ((_userDate && date === _userDate) && (_userModifiedDate && modifiedDate === _userModifiedDate)
        ) {
          isRead = true;
          hashValues.push(hash);
        } else if ((_userDate && date === _userDate) && !_userModifiedDate) {
          isRead = true;
          hashValues.push(hash);
        } else if (!_userDate && (_userModifiedDate && modifiedDate === _userModifiedDate)) {
          isRead = true;
          hashValues.push(hash);
        }

        let retval = ReadTodo.CheckState(isRead, todoGroup, j, hashValues, DutyTodo);

        if (retval) return retval;
      };

    return DutyTodo.CALLGENERATORYLOOP(_this, cb);
  }
}
module.exports = ReadTodo;
