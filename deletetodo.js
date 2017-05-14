class DeleteTodo {
	constructor() {}
	static createType() {
		return new DeleteTodo();
	}
	handleDelete({type,opt,self: _this,DutyTodo}) {

		let { todoGroup , location } = _this.MANAGER;

		this.type = type;
		this.DutyTodo = DutyTodo;
		this.todoGroup = todoGroup ;
		this._this = _this;
		this._opt = opt;
		this.location = location;

		this[this.type]();
	}
	all() {

		let { DutyTodo,  _this: { MANAGER }, todoGroup , location} = this;

		delete MANAGER[todoGroup];

		todoGroup = {};

		DutyTodo.WriteFile({location,todoGroup});

		return true;
	}
	hash() {
		let { DutyTodo , location , todoGroup , _opt: { value: hash },_this} = this,
		hashRegex = new RegExp(`^${hash}`),
		j = 0,
		cb = ({longHash,hash}) => {
			j++;
			if ( hashRegex.test(longHash) ) {
				delete todoGroup[hash];
				return true;
			} else if ( Object.keys(todoGroup).length === j ) {
				return false;
			}
		};

		DutyTodo.CALLGENERATORYLOOP(_this,cb)
		.then( _ => {
			DutyTodo.WriteFile({location,todoGroup});
		}).catch( _ => {
			DutyTodo.ErrMessage(`${hash} was not found`);
		});
	}
	completed() {
		let {DutyTodo,location,todoGroup,_this} = this,

		isDelete,j = 0,

		cb = ({hash,completed}) => {
			j++;
			if ( completed ) {
				delete todoGroup[hash];
				isDelete = true;
				j--;
			}

			if ( ! isDelete && Object.keys(todoGroup).length === j ) {
				return false;
			} else if ( isDelete && Object.keys(todoGroup).length === j ) {
				return true;
			}
		};

		DutyTodo.CALLGENERATORYLOOP(_this,cb)
		.then( _ => {
			DutyTodo.WriteFile({location,todoGroup});
			process.stdout.write(`completed todos have been deleted\n`);
		}).catch( _ => {
			DutyTodo.ErrMessage(`Nothing was removed`);
		});
	}
	date() {

		let { DutyTodo, _this, todoGroup, location} = this,
		{ value: _userDate } = this._opt,
		isRead = false,j = 0,
		cb = ({date,modifiedDate,hash}) => {
			j++;
			if ( _userDate === date ) {
				delete todoGroup[hash];
				isRead = true;
				j--;
			}

			if ( ! isRead && Object.keys(todoGroup).length === j ) {
				return false;
			} else if ( isRead && Object.keys(todoGroup).length === j ) {
				return true;
			}
		};

		DutyTodo.CALLGENERATORYLOOP(_this,cb)
		.then( _ => {
			DutyTodo.WriteFile({location,todoGroup});
		})
		.catch( _ => {
			process.stdout.write(`no match for the specified date was found\n`);
		});
	}
	category() {
		let { DutyTodo , location , todoGroup , _opt: { value: category },_this} = this,
		j = 0,isDelete = false,
		cb = ({hash,category: _category}) => {

			j++;

			if ( _category && _category.includes(category) ) {
				delete todoGroup[hash];
				isDelete = true;
				j--;
			}

			if ( Object.keys(todoGroup).length === j && ( ! isDelete) ) {
				return false;
			} else if ( Object.keys(todoGroup).length === j && ( isDelete ) ) {
				return true;
			}
		};

		DutyTodo.CALLGENERATORYLOOP(_this,cb)
		.then( _ => {
			DutyTodo.WriteFile({location,todoGroup});
		}).catch( _ => {
			DutyTodo.ErrMessage(`${category} was not found`);
		});
	}
}

module.exports = DeleteTodo;
