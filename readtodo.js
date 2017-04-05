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
    constructor({type,_this,DutyTodo}) {
	let { m } = _this.MANAGER;
	this.type = type;
	this.DutyTodo = DutyTodo;
	this.m = m ;
	this._this = _this;
    }
    static createType(type,_this,DutyTodo) {
	return new ReadTodo({type,_this,DutyTodo});
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
	    .then( _ => {
		console.log('read');
	    }).catch( _ => {
		process.stdout.write(`nothing complete to read\n`);
	    });
	
    }
    notcompleted() {
	return 'not completed';
    }
    pending() {
	return 'pending';
    }
    tomorrow() {
	return 'tomorrow';
    }
    
}
module.exports = ReadTodo;
