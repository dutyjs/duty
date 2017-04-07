// completed
// notcompleted
// pending
// today
// waiting
// tomorrow


// to avoid cyclic dependency issues,
//   it is important to avoid require duty.js and extending
//   the below class with DutyTodo class
class ReadTodo {
    constructor({type,opt,_this,DutyTodo}) {
	let { m } = _this.MANAGER;
	this.type = type;
	this.DutyTodo = DutyTodo;
	this.m = m ;
	this._this = _this;
	this._opt = opt;
    }
    static createType(type,opt,_this,DutyTodo) {
	return new ReadTodo({type,opt,_this,DutyTodo});
    }
    static DATE_CHECK() {
    }
    handleRead() {
	this[this.type]();
    }
    completed() {
	let { DutyTodo, _this: {MANAGER: {m} } } = this,
	    isRead = false,j = 0,
	    cb = ({completed,hash}) => {
		j++;
		if ( completed ) {
		    console.log(m[hash]);
		    isRead = true;
		}
		
		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(this._this,cb)
	    .catch( _ => {
		process.stdout.write(`nothing complete to read\n`);
	    });
	
    }
    notcompleted() {
	
	let { DutyTodo, _this: {MANAGER: {m} } } = this,
	    isRead = false,j = 0,
	    cb = ({completed,hash}) => {
		j++;
		if ( ! completed ) {
		    console.log(m[hash]);
		    isRead = true;
		}
		
		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(this._this,cb)
	    .catch( _ => {
		process.stdout.write(`nothing complete to read\n`);
	    });
	
    }
    date() {
	let { DutyTodo, _this: {MANAGER: {m} } } = this,
	    { date: _userDate } = this._opt,
	    isRead = false,j = 0,
	    cb = ({date,hash}) => {
		j++;
		if ( date === _userDate ) {
		    console.log(m[hash]);
		    isRead = true;
		}
		
		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(this._this,cb)
	    .catch( _ => {
		process.stdout.write(`no match for the specified date was found\n`);
	    });
    }
    modifiedDate() {
	let { DutyTodo, _this: {MANAGER: {m} } } = this,
	    { date: _userDate } = this._opt,
	    isRead = false,j = 0,
	    cb = ({modifiedDate,hash}) => {
		j++;
		if ( modifiedDate === _userDate ) {
		    console.log(m[hash]);
		    isRead = true;
		}
		
		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(this._this,cb)
	    .catch( _ => {
		process.stdout.write(`no match for the specified date was found\n`);
	    });
    }
    
}
module.exports = ReadTodo;
