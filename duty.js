const colors = require('colors');
const crypto = require('crypto');
const fs = require('fs');

class DutyTodo {
    constructor({m,location}) {
	this.MANAGER = {
	    location,
	    m
	};
    }
    static NotEmpty({ m }) {
	return ( Object.keys(m).length !== 0 ) ? true : false;
    }
    static CALLGENERATORYLOOP(_this,cb) {
	
	if ( ! cb ) throw new Error('check the stack trace, you are suppose to call cb on CALLGENERATORLOOP');
	
	return new Promise((resolve,reject) => {
	    
	    const gen = _this.IterateTodo();
	    
	    let _n = gen.next(),
		isFound = false,
		f ;
	    
	    while ( ! _n.done  ) {
		
		// pass the object to the callback function
		//   to see if it already exists
		//   the object will be modified in the callback function
		//   since object are passed by reference
		//   any scope that access the object, will get the
		//   modified object
		
		f = cb(_n.value);
		
		// different values will be returned
		//  so f === false and f === true
		//  is not that so bad here
		
		if ( f === false ) {
		    reject();
		    isFound = true;
		    break;
		} else if ( f === true ) {
		    resolve();
		    isFound = false;
		    break;
		}
		_n = gen.next();
	    }
	    
	});
    }
    static ErrMessage(msg) {
	process.stderr.write(`${msg}\n`.red);
    }
    static WriteFile({location, m}) {
	fs.writeFileSync(location, JSON.stringify(m));
    }
    static SaveTodo({manager: { m , location },hash,todo}) {
	
	let longHash = hash;
	
	hash = hash.slice(0, hash.length - 55);
	
	const DATE = new Date(),
	      date = DATE.toLocaleDateString(),
	      month = DATE.getMonth(),
	      year = DATE.getYear(),
	      completed = false;
	
	m[hash] = {
	    content: todo,
	    hash,
	    longHash,
	    date,
	    month,
	    year,
	    completed
	};
	DutyTodo.WriteFile({location,m});
	process.stdin.write(`New todo has been added\nTotal todo is ${Object.keys(m).length}\n`.green);
    }    
    *IterateTodo() {
	let { m } = this.MANAGER;
	// Object.keys and Object.entries
	//   in this case i choose to use Object.keys
	//   because Object.entries shows you the members of all
	//   the objects, and that is wanted is just the property names
	for ( let todos  of Object.keys(m) ) {
	    yield m[todos];
	}
    }
    add(todo = false) {

	if ( ! todo ) {
	    DutyTodo.ErrMessage(`A todo content needs to be added`);
	    return false;
	}
	
	let hash = crypto.createHash('sha256').update(todo).digest('hex');

	const manager= this.MANAGER;
	
	if ( ! DutyTodo.NotEmpty(manager) ) {
	    DutyTodo.SaveTodo({manager,hash,todo});
	    return true;
	}
	
	let cb = ({ longHash }) => {
	    if ( longHash === hash ) {
		return false;
	    }
	};
	
	DutyTodo.CALLGENERATORYLOOP(this,cb)
	    .then( _ => {
		DutyTodo.SaveTodo({manager,hash,todo});
	    })
	    .catch( _ => {
		DutyTodo.ErrMessage(`This todo already exists`);
	    });
    }
    
    static createInstance({config_locationContent: m, location}) {
	return new DutyTodo({m,location});
    }
    append({hash,text}) {
	if ( ! hash ) {
	    DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`);
	    return false;
	} else if ( ! text ) {
	    DutyTodo.ErrMessage(`got ${typeof(text)} instead of text`);
	    return false;
	} else if ( hash.length <= 4 ) {
	    DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`);
	    return false;
	}
	

	let hashRegex = new RegExp(`^${hash}`),
	    { location , m } = this.MANAGER,
	    j = 0,
	    cb =  ({hash,content}) => {
		j++;
		if ( hashRegex.test(hash) ) {
		    content = `${content} ${text}`;
		    
		    let newHash = crypto.createHash('sha256').update(content)
			    .digest('hex'),
			mDate = new Date(),
			modifiedDate = mDate.toLocaleDateString(),
			longHash = newHash;

		    newHash = newHash.slice(0, newHash.length - 55);
		    m[newHash] = Object.create({});
		    Object.assign(m[newHash],m[hash],{
			content,
			longHash,
			hash: newHash,
			modifiedDate
		    });
		    delete m[hash];
		    return true;
		} else if ( Object.keys(m).length === j ) {
		    // this block of code should never run if a true hash
		    //     was found
		    return false;
		}
	    };
	
	DutyTodo.CALLGENERATORYLOOP(this,cb)
	    .then( _ => {
	 	DutyTodo.WriteFile({location,m});
	    })
	    .catch( _ => {
	 	DutyTodo.ErrMessage(`${hash} was not found, todo is not in list`);
	    });
    }
    replace({hash,regexp,text}) {
	if ( ! hash ) {
	    DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`);
	    return false;
	} else if ( ! text ) {
	    DutyTodo.ErrMessage(`got ${typeof(text)} instead of text`);
	    return false;
	} else if ( hash.length <= 4 ) {
	    DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`);
	    return false;
	} else if ( ! regexp ) {
	    DutyTodo.ErrMessage(`length of ${regexp} is not greater than 4`);
	    return false;	    
	}
	
	let { location , m } = this.MANAGER;
	let hashRegex = new RegExp(`^${hash}`),
	    j = 0,
	    regex = new RegExp(regexp),
	    cb = ({hash,content}) => {
		j++;
		if ( hashRegex.test(hash) ) {
		    // since the content change,
		    //   the hash is suppose to change too
		    content = `${content.replace(regex,text)}`;
		    let newHash = crypto.createHash('sha256').update(content)
			    .digest('hex'),
			mDate = new Date(),
			modifiedDate = mDate.toLocaleDateString(),
			longHash = newHash;

		    newHash = newHash.slice(0, newHash.length - 55);
		    m[newHash] = Object.create({});
		    Object.assign(m[newHash],m[hash],{
			content,
			longHash,
			hash: newHash,
			modifiedDate
		    });
		    delete m[hash];
		    return true;
		} else if ( Object.keys(m).length === j ) {
		    return false;
		};
	    };

	DutyTodo.CALLGENERATORYLOOP(this,cb)
	    .then( _ => {
		DutyTodo.WriteFile({location,m});
	    }).catch( _ => {
		DutyTodo.ErrMessage(`${hash} was not found`);
	    });
    }
    markcompleted({hash}) {
	if ( ! hash ) {
	    DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`);
	    return false;
	} else if ( hash.length <= 4 ) {
	    DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`);
	    return false;
	}
	let {location,m} = this.MANAGER,
	    hashRegex = new RegExp(`^${hash}`),
	    j = 0,
	    cb = ({hash,completed}) => {
		j++;
		if ( hashRegex.test(hash) && ! completed ) {
		    Object.assign(m[hash], { completed: true });
		    return true;
		} else if (hashRegex.test(hash) && completed ) {
		    return true;
		} else if ( Object.keys(m).length === j ) {
		    return false;
		}
	    };
	
	DutyTodo.CALLGENERATORYLOOP(this,cb)
	    .then( _ => {
		DutyTodo.WriteFile({location,m});
	    }).catch( _ => {
		DutyTodo.ErrMessage(`${hash} was not found`);
	    });
	
	
    }
    note({hash,note}) {
	if ( ! hash ) {
	    DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`);
	    return false;
	} else if ( hash.length <= 4 ) {
	    DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`);
	    return false;
	} else if ( ! note ) {
	    DutyTodo.ErrMessage(`note is not defined`);
	    return false;	    
	}
	
	let {location,m} = this.MANAGER,
	    hashRegex = new RegExp(`^${hash}`),
	    j = 0,
	    cb = ({hash}) => {
		j++;
		if ( hashRegex.test(hash) && ! m[hash].note ) {

		    Object.assign(m[hash], { note });
		    console.log(m[hash]);
		    return true;
		    
		} else if ( hashRegex.test(hash) && m[hash].note ) {
		    
		    note = `${m[hash].note} ${note}`;

		    Object.assign(m[hash], { note });
		    console.log(m[hash]);
		    return true;
		} else if ( Object.keys(m).length === j ) {
		    return false;
		}
	    }

	DutyTodo.CALLGENERATORYLOOP(this,cb)
	    .then( _ => {
		DutyTodo.WriteFile({location,m});
	    }).catch( _ => {
		DutyTodo.ErrMessage(`${hash} was not found`);
	    });
	
    }
    removenote({hash}) {
	
	if ( ! hash ) {
	    DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`);
	    return false;
	} else if ( hash.length <= 4 ) {
	    DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`);
	    return false;
	}

	let {location,m} = this.MANAGER,
	    hashRegex = new RegExp(`^${hash}`),
	    j = 0,
	    cb = ({hash}) => {
		j++;
		if ( hashRegex.test(hash) && m[hash].note ) {
		    delete m[hash].note;
		    return true;
		} else if (hashRegex.test(hash) && ! m[hash].note ) {
		    return true;
		} else if ( Object.keys(m).length === j ) {
		    return false;
		}
	    };
	
	DutyTodo.CALLGENERATORYLOOP(this,cb)
	    .then( _ => {
		DutyTodo.WriteFile({location,m});
	    }).catch( _ => {
		DutyTodo.ErrMessage(`${hash} was not found`);
	    });
	
    }
    notcompleted() {
    }
    completed() {
    }
    read() {
    }

    delete() {
    }
    setPriority() {
    }
    category() {
	// coming soon, this requires the entire API
	//   of this program to change
    }
    
}

module.exports = DutyTodo.createInstance;
