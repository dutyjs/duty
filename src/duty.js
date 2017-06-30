const colors = require("colors");
const crypto = require("crypto");
const fs = require("fs");
const ReadTodo = require("./readtodo");
const DeleteTodo = require("./deletetodo");
const ExportTodo = require("./exporttodo");

const Daemon = require("./daemon");
const moment = require("moment");

const {
  homedir
} = require("os");

let Notify = require("node-notifier");

const {
  resolve,
  join
} = require("path");


class DutyTodo {
  constructor ({
    location,
    todoGroup
  }) {
    this.MANAGER = {
      location,
      todoGroup
    };
  }
  static VERIFY_DATE (date) {
    // day,month,year
    date = date.split("/").filter(Number);

    if (date.length !== 3) {
      return false;
    }

    const [day, month, year] = date.map(Number);

    if (

      (day >= 1 && day <= 31) &&
                (month >= 1 && month <= 12) &&
                (String(year).length === 4)

    ) return true;

    return false;
  }
  static PRINT (text) {
    process.stdout.write(colors.bold(text));
  }
  static REMODIFIYHASH ({
    type,
    content,
    text,
    regex,
    todoGroup,
    hash
  }) {
    switch (type) {
    case "replace":
      content = content.replace(regex, text);
      break;
    case "append":
      content = `${content} ${text}`;
      break;
    case "edit":
      content = text;
      break;
    default:
      return Promise.reject(`invalid type <${type}>`);
    }

    let newHash = crypto.createHash("sha256").update(content)
        .digest("hex"),
      mDate = moment().format("DD/MM/YYYY"),
      modifiedDate = mDate,
      longHash = newHash;

    newHash = newHash.slice(0, newHash.length - 55);
    todoGroup[newHash] = {};
    Object.assign(todoGroup[newHash], todoGroup[hash], {
      content,
      longHash,
      hash: newHash,
      modifiedDate
    });

    return delete todoGroup[hash];
  }
  static NotEmpty ({
    todoGroup
  }) {
    return (Object.keys(todoGroup).length !== 0);
  }
  static URGENCY_ERROR () {
    return "URGENCY_ERROR";
  }
  static HASH_ERROR () {
    return "HASH_ERROR";
  }
  static EXISTS_ERROR () {
    return "EXISTS_ERROR";
  }
  static TODO_MARKCOMPLETED () {
    return "TODO_MARKCOMPLETED";
  }
  static TODO_REPLACE () {
    return "TODO_REPLACE";
  }
  static TODO_APPENDED () {
    return "TODO_APPENDED";
  }
  static TODO_ADDED () {
    return "TODO_ADDED";
  }
  static NOTE_REMOVED () {
    return "NOTE_REMOVED";
  }
  static NOTE_ADDED () {
    return "NOTE_ADDED";
  }
  static DUE_DATE_SET () {
    return "DUE_DATE_SET";
  }
  static NO_READ () {
    return "NO_READ";
  }
  static URGENCY_SET () {
    return "URGENCY_SET";
  }
  static PRIORITY_SET () {
    return "PRIORITY_SET";
  }
  static CATEGORY_SET () {
    return "CATEGORY_SET";
  }
  static NOTIFY () {
    return "NOTIFY";
  }
  static EDITED () {
    return "EDITED";
  }
  static CALLGENERATORYLOOP (_this, cb) {
    return new Promise((resolve, reject) => {
      const gen = _this.IterateTodo();

      let _n = gen.next(),
        f;

      // this is done to fix errors, in doing any kind of operation on todo
      //    when todo content is empty;

      if (!_n.value) reject("todo is empty");

      while (!_n.done) {
        // pass the object to the callback function
        //   to see if it already exists
        //   the object will be modified in the callback function
        //   since object are passed by reference
        //   any scope that access the object, will get the
        //   modified object

        f = cb(_n.value);

        switch (f) {
        case "URGENCY_ERROR":
          reject("the specfied urgency type already exists on this todo");
          break;
        case "EXISTS_ERROR":
          reject("this todo already exists");
          break;
        case "NO_READ":
          reject("the specified type is not available for reading");
          break;
        case "HASH_ERROR":
          reject("hash was not found");
          break;
        case "TODO_APPENDED":
          resolve(_n.value);
          break;
        case "TODO_ADDED":
          resolve();
          break;
        case "TODO_REPLACE":
          resolve(_n.value);
          break;
        case "TODO_MARKCOMPLETED":
          resolve(_n.value);
          break;
        case "NOTE_ADDED":
          resolve(_n.value);
          break;
        case "NOTE_REMOVED":
          resolve(_n.value);
          break;
        case "DUE_DATE_SET":
          resolve(_n.value);
          break;
        case "URGENCY_SET":
          resolve(_n.value);
          break;
        case "PRIORITY_SET":
          resolve(_n.value);
          break;
        case "CATEGORY_SET":
          resolve(_n.value);
          break;
        case "NOTIFY":
          resolve(_n.value);
          break;
        case "EDITED":
          resolve(_n.value);
          break;
        case "DELETE_TODO":
          resolve(_n.value);
          break;
        case "DELETE_NOT_FOUND":
          reject("specified delete option was not found");
          break;
        default:

          if (Array.isArray(f) && f.length !== 0) {
            resolve(f);
          } else if (typeof (f) === "object" && f.hasOwnProperty("_path")) {
            resolve(f);
          }

          break;
        }
        _n = gen.next();
      }
    });
  }

  static ErrMessage (msg) {
    process.stderr.write(colors.bold(`${msg}\n`.red));
  }
  static PrintHashError (hash) {
    return Promise.reject(`hash length is suppose to be 9 but got ${hash.length}`);
  }
  static WriteFile ({
    location,
    todoGroup
  }) {
    fs.writeFileSync(location, JSON.stringify(todoGroup));
    return "changes have been saved\n".green;
  }
  static SaveTodo ({
    manager: {
      todoGroup,
      location
    },
    hash,
    todo,
    category
  }) {
    let longHash = hash;

    hash = hash.slice(0, hash.length - 55);

    const DATE = moment().format("DD/MM/YYYY"),
      date = DATE,
      completed = false;

    todoGroup[hash] = {
      content: todo,
      hash,
      longHash,
      date,
      completed,
      notification: "no",
      timeout: 6000
    };

    if (category && Array.isArray(category)) {
      Object.assign(todoGroup[hash], {
        category
      });
    }

    DutyTodo.WriteFile({
      location,
      todoGroup
    });

    if (process.env.NODE_ENV === "development") { return todoGroup[hash]; }

    return `Total todo is ${Object.keys(todoGroup).length}\n`.green;
  }
  * IterateTodo () {
    let {
      todoGroup
    } = this.MANAGER;
    // Object.keys and Object.entries
    //   in this case i choose to use Object.keys
    //   because Object.entries shows you the members of all
    //   the objects, and that is wanted is just the property names
    for (let todos of Object.keys(todoGroup)) {
      yield todoGroup[todos];
    }
  }
  add ({
    todo,
    category,
    hash
  }, manager) {
    let { todoGroup } = manager;

    if (!DutyTodo.NotEmpty(manager)) {
      return Promise.resolve();
    }
    let j = 0,
      isAdded = false;
    let cb = ({
      longHash
    }) => {
      j++;

      if (longHash === hash) {
        isAdded = true;
        return DutyTodo.EXISTS_ERROR();
      } else if ((Object.keys(todoGroup).length === j) && (!isAdded)) {
        return DutyTodo.TODO_ADDED();
      }
    };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }

  append ({
    hash,
    text
  }) {
    if (hash.length < 9) {
      return DutyTodo.PrintHashError(hash);
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
        j++;
        if (hashRegex.test(longHash)) {
          const type = "append";

          DutyTodo.REMODIFIYHASH({
            type,
            content,
            text,
            undefined,
            todoGroup,
            hash
          });

          return DutyTodo.TODO_APPENDED();
        } else if (Object.keys(todoGroup).length === j) {
          // this block of code should never run if a true hash
          //     was found
          return DutyTodo.HASH_ERROR();
        }
      };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }
  replace ({
    hash,
    regexp,
    text
  }) {
    if (hash.length < 9) {
      return DutyTodo.PrintHashError(hash);
    }

    let {
      location,
      todoGroup
    } = this.MANAGER;
    let hashRegex = new RegExp(`^${hash}`),
      j = 0,
      regex = new RegExp(regexp),
      cb = ({
        hash,
        longHash,
        content
      }) => {
        j++;
        if (hashRegex.test(longHash)) {
          const type = "replace";

          DutyTodo.REMODIFIYHASH({
            type,
            content,
            text,
            regex,
            todoGroup,
            hash
          });
          return DutyTodo.TODO_REPLACE();
        } else if (Object.keys(todoGroup).length === j) {
          return DutyTodo.HASH_ERROR();
        }
      };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }
  markcompleted ({
    hash
  }) {
    if (hash.length < 9) {
      return DutyTodo.PrintHashError(hash);
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
        j++;
        if (hashRegex.test(longHash) && !completed) {
          Object.assign(todoGroup[hash], {
            completed: true
          });
          return DutyTodo.TODO_MARKCOMPLETED();
        } else if (hashRegex.test(longHash) && completed) {
          return DutyTodo.TODO_MARKCOMPLETED();
        } else if (Object.keys(todoGroup).length === j) {
          return DutyTodo.HASH_ERROR();
        }
      };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }
  note ({
    hash,
    note
  }) {
    if (hash.length < 9) {
      return DutyTodo.PrintHashError(hash);
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
        j++;
        if (hashRegex.test(longHash) && !todoGroup[hash].note) {
          Object.assign(todoGroup[hash], {
            note
          });

          return DutyTodo.NOTE_ADDED();
        } else if (hashRegex.test(longHash) && todoGroup[hash].note) {
          note = `${todoGroup[hash].note} ${note}`;

          Object.assign(todoGroup[hash], {
            note
          });
          return DutyTodo.NOTE_ADDED();
        } else if (Object.keys(todoGroup).length === j) {
          return DutyTodo.HASH_ERROR();
        }
      };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }
  removenote ({
    hash
  }) {
    if (hash.length < 9) {
      return DutyTodo.PrintHashError(hash);
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
        j++;
        if (hashRegex.test(longHash) && todoGroup[hash].note) {
          delete todoGroup[hash].note;
          return DutyTodo.NOTE_REMOVED();
        } else if (hashRegex.test(longHash) && !todoGroup[hash].note) {
          return DutyTodo.NOTE_REMOVED();
        } else if (Object.keys(todoGroup).length === j) {
          return DutyTodo.HASH_ERROR();
        }
      };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }
  read (type, opt = {}) {
    let {
      date,
      modifiedDate
    } = opt;

    if (type === "date" && (!date && !modifiedDate)) {
      return Promise.reject("expected two argument but got one, second argument should be a date in dd/mm/yyyy.");
    } else if (type === "due" && !date) {
      return Promise.reject("expected date argument to be set");
    } else if ((date || modifiedDate) && !DutyTodo.VERIFY_DATE(date || modifiedDate)) {
      return Promise.reject("expected two argument but got one, second argument should be a date in dd/mm/yyyy.");
    }

    try {
      const p = ReadTodo.createType();
      const self = this;

      // this is also a promise, the resolved value will be used
      //   in utils.js

      return p.handleRead({
        type,
        opt,
        self,
        DutyTodo
      });
    } catch (ex) {
      return Promise.reject(`${type} is not supported`);
    }
  }
  delete (type, opt = {}) {
    let {
      value
    } = opt;

    if (type === "date" && !value) {
      return Promise.reject("expected two argument but got one, second argument should be a date in dd/mm/yyyy");
    } else if (type === "date" && !DutyTodo.VERIFY_DATE(value)) {
      return Promise.reject(`invalid date format specfied ${value}. Date should be specfied  in dd/mm/yyyy`);
    } else if (type === "hash" && !value) {
      return Promise.reject("hash value is required");
    } else if (type === "hash" && value.length < 9) {
      return DutyTodo.PrintHashError(value);
    } else if (type === "category" && (!value)) {
      return Promise.reject("category type was not sepcified");
    }

    try {
      const p = DeleteTodo.createType();

      const self = this;

      return (p.handleDelete({ type, opt, self, DutyTodo }));
    } catch (ex) {
      return Promise.reject(`${type} is not supported`);
    }
  }
  urgency ({
    hash,
    urgency
  }) {
    if (hash.length < 9) {
      return DutyTodo.PrintHashError(hash);
    }

    let [, _urgency] = urgency.match(/^urgency:([a-z]+)$/);

    switch (_urgency) {
    case "pending":
      break;
    case "waiting":
      break;
    case "tomorrow":
      break;
    case "later":
      break;
    case "today":
      break;
    default:
      return Promise.reject(`invalid urgency type, supported urgency type are
					urgency:pending
					urgency:waiting
					urgency:tomorrow
					urgency:later
					urgency:today`);
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
        j++;
        if (hashRegex.test(longHash) && Array.isArray(urgency)) {
          if (urgency.includes(_urgency)) {
            return DutyTodo.URGENCY_ERROR();
          }

          urgency.push(_urgency);

          Object.assign(todoGroup[hash], {
            urgency
          });

          return DutyTodo.URGENCY_SET();
        } else if (hashRegex.test(longHash) && !urgency) {
          let urgency = [];

          urgency.push(_urgency);

          Object.assign(todoGroup[hash], {

            urgency
          });

          return DutyTodo.URGENCY_SET();
        } else if (Object.keys(todoGroup).length === j) {
          return DutyTodo.HASH_ERROR();
        }
      };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }

  setpriority ({
    hash,
    priority
  }) {
    if (hash.length < 9) {
      return DutyTodo.PrintHashError(hash);
    }

    switch (priority) {
    case "critical":
      break;
    case "notcritical":
      break;
    default:
      return Promise.reject("invalid priority type. Use critical or notcritical");
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
        j++;
        if (hashRegex.test(longHash)) {
          Object.assign(todoGroup[hash], {
            priority
          });

          return DutyTodo.PRIORITY_SET();
        } else if (Object.keys(todoGroup).length === j) {
          return DutyTodo.HASH_ERROR();
        }
      };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }
  categorize ({
    hash,
    category
  }) {
    if (hash.length < 9) {
      return DutyTodo.PrintHashError(hash);
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
        j++;
        if (hashRegex.test(longHash)) {
          category.filter(_x => !_jsonCategory.includes(_x))
            .forEach(_x => _jsonCategory.push(_x));

          Object.assign(todoGroup[hash], {
            category: _jsonCategory
          });

          return DutyTodo.CATEGORY_SET();
        } else if (Object.keys(todoGroup).length === j) {
          return DutyTodo.HASH_ERROR();
        }
      };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }
  due ({
    hash,
    date
  } = {}) {
    if (hash.length < 9) {
      return DutyTodo.PrintHashError(hash);
    } else if (!DutyTodo.VERIFY_DATE(date)) {
      return Promise.reject(`invalid date format specfied ${date}. Date should be specfied  in dd/mm/yyyy`);
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
        j++;
        if (hashRegex.test(longHash)) {
          Object.assign(todoGroup[hash], {
            due_date: date
          });

          return DutyTodo.DUE_DATE_SET();
        }
        if (Object.keys(todoGroup).length === j) {
          return DutyTodo.HASH_ERROR();
        }
      };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }
  export ({
    type,
    path
  }) {
    if ((!fs.existsSync(path) || fs.existsSync(path))) {
      // get the absolute path of the specified path
      path = resolve(path);
    }

    try {
      const _export = ExportTodo.createExport();

      const self = this;

      return (_export.export({
        type,
        DutyTodo,
        self,
        path
      }));
    } catch (ex) {
      return Promise.reject(`format ${type} is not supported`);
    }
  }
  static NotificationArg (notification) {
    return (notification === "yes" || notification === "no");
  }
  static TimeoutArg (timeout) {
    return !isNaN(Number(timeout));
  }
  setnotify (hash, {
    notification,
    timeout
  }) {
    if (hash.length < 9) { return DutyTodo.PrintHashError(hash); }

    if (!DutyTodo.NotificationArg(notification)) { return Promise.reject("notification state argument needs to be yes or no"); }

    if (!DutyTodo.TimeoutArg(timeout)) { return Promise.reject("timeout that is amount of times the todo should show is not a number"); }

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
        j++;
        if (hashRegex.test(longHash)) {
          Object.assign(todoGroup[hash], {
            notification,
            timeout
          });
          return DutyTodo.NOTIFY();
        }
        if (Object.keys(todoGroup).length === j) {
          return DutyTodo.HASH_ERROR();
        }
      };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }
  edit ({hash, text}) {
    if (hash.length < 9) {
      return DutyTodo.PrintHashError(hash);
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
        j++;
        if (hashRegex.test(longHash)) {
          const type = "edit";
          DutyTodo.REMODIFIYHASH({
            type,
            content,
            text,
            undefined,
            todoGroup,
            hash
          });
          return DutyTodo.EDITED();
        } else if (Object.keys(todoGroup).length === j) {
          return DutyTodo.HASH_ERROR();
        }
      };

    return DutyTodo.CALLGENERATORYLOOP(this, cb);
  }
  execDaemon (platform) {
    try {
      return Daemon.CreateDaemon(platform());
    } catch (ex) {
      // this block of code should never execute
      return Promise.reject("platfrom is not supported");
    }
  }

  daemon () {
    // this daemon method is to be use only the daemon manager
    const self = this;

    setInterval(_ => {
      let readDaemonObject = {
        type: "due",
        opt: {

          date: moment().format("DD/MM/YYYY"),

          _cb ({
            content,
            hash,
            due_date,
            notification,
            timeout
          }) {
            if (!notification) return false;

            setTimeout(_ => {
              Notify.notify({
                title: `Todo ${hash} is due for today ${due_date}`,
                icon: join(__dirname, "assets/logo.png"),
                message: content,
                sound: true,
                wait: true
              });
            }, Number(timeout));
          }
        },
        self,
        DutyTodo
      };

      const daemonRead = ReadTodo.createType();
      daemonRead.handleRead(readDaemonObject)
        .catch(err => {
          console.log(err);
        });
    }, 20000);
  }
}

module.exports = DutyTodo;
