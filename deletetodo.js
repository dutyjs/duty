class DeleteTodo {
    constructor() {}
    static createType() {
	return new DeleteTodo();
    }
    handleDelete({type,opt,self: _this,DutyTodo}) {

	let { m , location } = _this.MANAGER;

	this.type = type;
	this.DutyTodo = DutyTodo;
	this.m = m ;
	this._this = _this;
	this._opt = opt;
	this.location = location;

	this[this.type]();
    }
    all() {

	let { DutyTodo,  _this: { MANAGER }, m , location} = this;

	delete MANAGER[m];

	m = {};

	DutyTodo.WriteFile({location,m});

	return true;
    }
    hash() {
	let { DutyTodo , location , m , _opt: { hash },_this} = this,
	    hashRegex = new RegExp(`^${hash}`),
	    j = 0,
	    cb = ({longHash,hash}) => {
		j++;
		if ( hashRegex.test(longHash) ) {
		    delete m[hash];
		    return true;
		} else if ( Object.keys(m).length === j ) {
		    return false;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .then( _ => {
		DutyTodo.WriteFile({location,m});
	    }).catch( _ => {
		DutyTodo.ErrMessage(`${hash} was not found`);
	    });
    }
    completed() {
	let {DutyTodo,location,m,_this} = this,

	    isDelete,j = 0,

	    cb = ({hash,completed}) => {
		j++;
		if ( completed ) {
		    delete m[hash];
		    isDelete = true;
		    j--;
		}

		if ( ! isDelete && Object.keys(m).length === j ) {
		    return false;
		} else if ( isDelete && Object.keys(m).length === j ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .then( _ => {
		DutyTodo.WriteFile({location,m});
		process.stdout.write(`completed todos have been deleted\n`);
	    }).catch( _ => {
		DutyTodo.ErrMessage(`Nothing was removed`);
	    });
    }
    date() {

	let { DutyTodo, _this, m, location} = this,
	    { date: _userDate } = this._opt,
	    isRead = false,j = 0,
	    cb = ({date,modifiedDate,hash}) => {
		j++;
		if ( _userDate === date ) {
		    delete m[hash];
		    isRead = true;
		    j--;
		}

		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .then( _ => {
		DutyTodo.WriteFile({location,m});
	    })
	    .catch( _ => {
		process.stdout.write(`no match for the specified date was found\n`);
	    });
    }
    category() {
	let { DutyTodo , location , m , _opt: { category },_this} = this,
	    j = 0,isDelete = false,
	    cb = ({hash,category: _category}) => {

		j++;

		if ( _category && _category.includes(category) ) {
		    delete m[hash];
		    isDelete = true;
		    j--;
		}

		if ( Object.keys(m).length === j && ( ! isDelete) ) {
		    return false;
		} else if ( Object.keys(m).length === j && ( isDelete ) ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .then( _ => {
		DutyTodo.WriteFile({location,m});
	    }).catch( _ => {
		DutyTodo.ErrMessage(`${category} was not found`);
	    });
    }
}

module.exports = DeleteTodo;
