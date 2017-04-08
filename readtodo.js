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
    handleRead() {
	
	let _matched = this.type.match(/^(urgency|category):([a-z]+)$/);
	
	const [,type,_typeOfType] = _matched ? _matched : [,undefined,undefined];
	if ( _typeOfType ) {
	    this[type](_typeOfType);
	    return ;
	}
	
	this[this.type]();
    }
    category(categoryType) {
	let { DutyTodo, _this: {MANAGER: {m} } } = this,
	    isRead = false, j = 0,
	    cb = ({hash,category}) => {
		j++;
		if ( category && Array.isArray(category) ) {
		    let _isFoundInArray = category
			    .some( _x => _x === categoryType);
		    
		    if ( _isFoundInArray ) {
			isRead = true;
			console.log(m[hash]);
		    }
		}
		
		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };
	
	DutyTodo.CALLGENERATORYLOOP(this._this,cb)
	    .catch( _ => {
		process.stdout.write(`no todo with such category\n`);
	    });	
    }
    urgency(urgencyType) {
	
	let { DutyTodo, _this: {MANAGER: {m} } } = this;
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
		if ( urgency && Array.isArray(urgency) ) {
		
		    let _isFoundInArray = urgency
			    .some( _x => _x === urgencyType);
		    
		    if ( _isFoundInArray ) {
			isRead = true;
			console.log(m[hash]);
		    }
		}
		
		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };
	
	DutyTodo.CALLGENERATORYLOOP(this._this,cb)
	    .catch( _ => {
		process.stdout.write(`no todo with such urgency\n`);
	    });	
	
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
	    { date: _userDate , modifiedDate: _userModifiedDate} = this._opt,
	    isRead = false,j = 0,
	    cb = ({date,modifiedDate,hash}) => {
		j++;
		if ( (_userDate && date === _userDate) && (_userModifiedDate && modifiedDate === _userModifiedDate)
		   ) {
		    console.log(m[hash]);
		    isRead = true; 
		} else if ( (_userDate && date === _userDate) && !_userModifiedDate ) {
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
