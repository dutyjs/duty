// to avoid cyclic dependency issues,
//   it is important to avoid require duty.js and extending
//   the below class with DutyTodo class
const colors = require('colors');
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
			halfcircle: bold('\u25CB'.green),
			completecircle: bold("\u25CF".green)
		};
	}
	static HANDLE_DUE_DATE({due_date}) {

		let _date = new Date();

		_date = _date.toLocaleDateString().split('/').join('');

		due_date = due_date.split('/').join('');

		const TIME_LEFT = String((due_date - _date)).replace(/0+$/,'');

		const { circle, halfcircle, completecircle } = ReadTodo.UNICODE_VALUES();

		if ( due_date > _date ) {
			return `${TIME_LEFT}days from now${halfcircle}`;
		} else if ( due_date < _date ) {
			return `${parseInt(TIME_LEFT) * -1}days before now${circle}`;
		} else if ( due_date === _date ) {
			return `today ${completecircle}`;
		}

	}
	static HANDLE_PRIORITY(priority) {
		return ((priority === 'critical') ?  'critical' : 'notcritical');
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

		DutyTodo.PRINT(`

hash:\t\t${hash}  ${completed ? unicodes.checkmark : unicodes.ballot}
creation date:\t${date} ${modifiedDate ? `
modified date:\t${modifiedDate}` : ''} ${due_date ? `
due date:\t${ReadTodo.HANDLE_DUE_DATE({due_date})}` : ''}${category ? `
category:\t(${category})` : ''} ${priority ? `
priority:\t${priority}${unicodes[ReadTodo.HANDLE_PRIORITY(priority)]}` : ''} ${urgency ? `
urgency:\t${urgency} `: ''} ${note ? `
note:\t\t${note}`: ''}
content:\t${content}
notification:\t${/^true$|^false$/.test(String(notification)) ? notification : _configNotification}
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

		let _matched = this.type.match(/^(urgency|category):([a-z]+)$/);
		const [,_type,_typeOfType] = _matched ? _matched : [,undefined,undefined];

		if ( _typeOfType ) {
			this[_type](_typeOfType);
			return ;
		}

		this[this.type]();
	}
	all() {

		let { DutyTodo, _this, todoGroup } = this;

		DutyTodo.CALLGENERATORYLOOP(_this, ({hash}) => {
                  let { notification, timeout} = _this.MANAGER;
			ReadTodo.STYLE_READ(todoGroup[hash],DutyTodo,{notification,timeout});
		});
	}
      notification() {
            let { DutyTodo, _this, todoGroup } = this;
            DutyTodo.CALLGENERATORYLOOP(_this, ({notification:_notify,hash}) => {
                  if ( _notify ) {
                        let { notification, timeout } = _this.MANAGER;
                        ReadTodo.STYLE_READ(todoGroup[hash],DutyTodo,{notification,timeout});
                  }
            }).catch(_ => {
                  console.log(_);
                  DutyTodo.ErrMessage(`unknown error while wanting to read for notification todos`);
            });
      }
	due() {

		let { DutyTodo, _this, todoGroup } = this,
		{ date: _dueDate,_cb} = this._opt, j = 0,
		cb = ({hash,due_date}) => {

			j++;
			if ( due_date && _dueDate === due_date ) {
				if ( _cb ) {
					_cb(todoGroup[hash]);
					return DutyTodo.DAEMONMATCH;
				}

                        let { notification, timeout} = _this.MANAGER;
                        ReadTodo.STYLE_READ(todoGroup[hash],DutyTodo,{notification,timeout});
				return true;
			}
			if ( Object.keys(todoGroup).length === j ) {

				if ( ! _cb ) return false;

				return DutyTodo.NO_DAEMONMATCH;
			}
		};

        // the catch block is entirely useless
        //   when due is executed from the daemon
        //   an extra check will be made to see if a due date is set

        DutyTodo.CALLGENERATORYLOOP(_this,cb)
        .catch( _ => {
        	process.stdout.write(`specified due date was not found\n`);
        });

      }
      category(categoryType) {

      	let { DutyTodo, _this, todoGroup } = this,
      	isRead = false, j = 0,
      	cb = ({hash,category}) => {
      		j++;
      		if ( category && Array.isArray(category) && category.includes(categoryType)) {
      			isRead = true;

                        let { notification, timeout} = _this.MANAGER;
                        ReadTodo.STYLE_READ(todoGroup[hash],DutyTodo,{notification,timeout});
      		}

      		if ( ! isRead && Object.keys(todoGroup).length === j ) {
      			return false;
      		} else if ( isRead && Object.keys(todoGroup).length === j ) {
      			return true;
      		}
      	};

      	DutyTodo.CALLGENERATORYLOOP(_this,cb)
      	.catch( _ => {
      		process.stdout.write(`no todo with such category\n`);
      	});
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
      		DutyTodo.ErrMessage(`invalid urgency type to read`);
      		return false;
      	}

      	let isRead = false, j = 0,
      	cb = ({hash,urgency}) => {
      		j++;
      		if ( urgency && Array.isArray(urgency) && urgency.includes(urgencyType) ) {
      			isRead = true;
                        let { notification, timeout} = _this.MANAGER;
                        ReadTodo.STYLE_READ(todoGroup[hash],DutyTodo,{notification,timeout});
      		}

      		if ( ! isRead && Object.keys(todoGroup).length === j ) {
      			return false;
      		} else if ( isRead && Object.keys(todoGroup).length === j ) {
      			return true;
      		}
      	};

      	DutyTodo.CALLGENERATORYLOOP(_this,cb)
      	.catch( _ => {
      		process.stdout.write(`no todo with such urgency\n`);
      	});

      }
      completed() {
      	let { DutyTodo, _this, todoGroup } = this,
      	isRead = false,j = 0,
      	cb = ({completed,hash}) => {
      		j++;
      		if ( completed ) {
      			isRead = true;
                        let { notification, timeout} = _this.MANAGER;
                        ReadTodo.STYLE_READ(todoGroup[hash],DutyTodo,{notification,timeout});
      		}

      		if ( ! isRead && Object.keys(todoGroup).length === j ) {
      			return false;
      		} else if ( isRead && Object.keys(todoGroup).length === j ) {
      			return true;
      		}
      	};

      	DutyTodo.CALLGENERATORYLOOP(_this,cb)
      	.catch( _ => {
      		process.stdout.write(`nothing complete to read\n`);
      	});

      }
      notcompleted() {

      	let { DutyTodo, _this, todoGroup } = this,
      	isRead = false,j = 0,
      	cb = ({completed,hash}) => {
      		j++;
      		if ( ! completed ) {
      			isRead = true;
                        let { notification, timeout} = _this.MANAGER;
                        ReadTodo.STYLE_READ(todoGroup[hash],DutyTodo,{notification,timeout});
      		}

      		if ( ! isRead && Object.keys(todoGroup).length === j ) {
      			return false;
      		} else if ( isRead && Object.keys(todoGroup).length === j ) {
      			return true;
      		}
      	};

      	DutyTodo.CALLGENERATORYLOOP(_this,cb)
      	.catch( _ => {
      		process.stdout.write(`nothing complete to read\n`);
      	});

      }
      date() {
      	let { DutyTodo, _this, todoGroup } = this,
      	{ date: _userDate , modifiedDate: _userModifiedDate} = this._opt,
      	isRead = false,j = 0,
      	cb = ({date,modifiedDate,hash}) => {
      		j++;
      		if ( (_userDate && date === _userDate) && (_userModifiedDate && modifiedDate === _userModifiedDate)
      			) {
      			isRead = true;
                        let { notification, timeout} = _this.MANAGER;
                        ReadTodo.STYLE_READ(todoGroup[hash],DutyTodo,{notification,timeout});
      	} else if ( (_userDate && date === _userDate) && !_userModifiedDate ) {
      		isRead = true;
                  let { notification, timeout} = _this.MANAGER;
                  ReadTodo.STYLE_READ(todoGroup[hash],DutyTodo,{notification,timeout});
      	}

      	if ( ! isRead && Object.keys(todoGroup).length === j ) {
      		return false;
      	} else if ( isRead && Object.keys(todoGroup).length === j ) {
      		return true;
      	}
      };

      DutyTodo.CALLGENERATORYLOOP(_this,cb)
      .catch( _ => {
      	process.stdout.write(`no match for the specified date was found\n`);
      });
    }


  }
  module.exports = ReadTodo;
