const colors = require('colors');
const crypto = require('crypto');
const fs = require('fs');
const ReadTodo = require('./readtodo');
const util = require('util');
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
    static URGENCY_ERROR() {
	return 'URGENCY_ERROR';
    }
    static CALLGENERATORYLOOP(_this,cb) {
	
	if ( ! cb ) throw new Error('check the stack trace, you are suppose to call cb on CALLGENERATORLOOP');
	
	return new Promise((resolve,reject) => {
	    
	    const gen = _this.IterateTodo();
	    
	    let _n = gen.next(),
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
		//  is not a bad coding practice
		
		if ( f === false ) {
		    reject();
		    break;
		} else if ( f === true ) {
		    resolve();
		    break;
		} else if ( f === DutyTodo.URGENCY_ERROR() ) {
		    reject(_n.value);
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
    static SaveTodo({manager: { m , location },hash,todo,category}) {
	
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


	if ( category && Array.isArray(category) ) {
	    
	    Object.assign(m[hash], { category });
	    
	} else if ( ! Array.isArray(category) ) {
	    DutyTodo.ErrMessage(`expected category to be an array but got ${typeof(category)}`);
	    
	    return false;
	}
	
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
    add({todo , category }) {

	if ( ! todo ) {
	    DutyTodo.ErrMessage(`A todo content needs to be added`);
	    return false;
	}
	
	let hash = crypto.createHash('sha256').update(todo).digest('hex')
	,manager,
	    {m} = manager = this.MANAGER;
	
	if ( ! DutyTodo.NotEmpty(manager) ) {
	    DutyTodo.SaveTodo({manager,hash,todo,category});
	    return true;
	}
	let j = 0,
	    isAdded = false;
	let cb = ({ longHash }) => {
	    j++;
	    if ( longHash === hash ) {
		isAdded = true;
		return false;
	    } else if ( (Object.keys(m).length === j) && (! isAdded) ) {
		return true;
	    }
	};
	
	DutyTodo.CALLGENERATORYLOOP(this,cb)
	    .then( _ => {
		DutyTodo.SaveTodo({manager,hash,todo,category});
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
	    cb =  ({hash,longHash,content}) => {
		j++;
		if ( hashRegex.test(longHash) ) {
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
	    cb = ({hash,longHash,content}) => {
		j++;
		if ( hashRegex.test(longHash) ) {
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
	    cb = ({hash,longHash,completed}) => {
		j++;
		if ( hashRegex.test(longHash) && ! completed ) {
		    Object.assign(m[hash], { completed: true });
		    return true;
		} else if (hashRegex.test(longHash) && completed ) {
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
	    cb = ({hash,longHash}) => {
		j++;
		if ( hashRegex.test(longHash) && ! m[hash].note ) {

		    Object.assign(m[hash], { note });
		    console.log(m[hash]);
		    return true;
		    
		} else if ( hashRegex.test(longHash) && m[hash].note ) {
		    
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
	    cb = ({hash,longHash}) => {
		j++;
		if ( hashRegex.test(longHash) && m[hash].note ) {
		    delete m[hash].note;
		    return true;
		} else if (hashRegex.test(longHash) && ! m[hash].note ) {
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
    read(type,opt = {}) {
	
	// completed
	// notcompleted
	// pending
	// today
	// waiting
	// tomorrow
	let { date , modifiedDate} = opt;
	if ( ! type ) {
	    DutyTodo.ErrMessage(`type ${type} is not supported`);
	    return false;
	} else if ( type === 'date' && ( ! date && ! modifiedDate)) {
	    DutyTodo.ErrMessage(`expected two argument but got one, second argument should be a date in dd/mm/yy`);
	    return false;
	}

	try {
	    const p = ReadTodo.createType(
		type,
		opt,
		this,
		DutyTodo);
	    p.handleRead();
	} catch (ex) {
	    console.log(ex);
	    DutyTodo.ErrMessage(`${type} is not supported`);
	    return false;
	}
    }
    deleteAll() {
	
	let {location,m} = this.MANAGER;

	delete this.MANAGER[m];
	
	m = {};
	
	DutyTodo.WriteFile({location,m});
	
	return true;
    }
    deleteCompleted() {
	let {location,m} = this.MANAGER,
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
	
	DutyTodo.CALLGENERATORYLOOP(this,cb)
	    .then( _ => {
		DutyTodo.WriteFile({location,m});
		process.stdout.write(`completed todos have been deleted\n`);
	    }).catch( _ => {
		DutyTodo.ErrMessage(`Nothing was removed`);
	    });
    }
    deleteByHash({hash}) {
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
	    cb = ({longHash,hash}) => {
		j++;
		if ( hashRegex.test(longHash) ) {
		    delete m[hash];
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
    urgency({hash,urgency}) {
	if ( ! hash ) {
	    DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`);
	    return false;
	} else if ( hash.length <= 4 ) {
	    DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`);
	    return false;
	} else if ( ! urgency ) {
	    DutyTodo.ErrMessage(`require urgency argument to be set`);
	    return false;	    
	}
	let [,_urgency] = urgency.match(/^urgency:([a-z]+)$/);
	
	switch(_urgency) {
	case "pending":break;
	case "waiting":break;
	case "tomorrow":break;
	case "later":break;
	case "today": break;
	default:
	    DutyTodo.ErrMessage(`invalid urgency type`);
	    return false;
	}

	let {location,m} = this.MANAGER,
	    hashRegex = new RegExp(`^${hash}`),
	    j = 0,
	    cb = ({hash,longHash,urgency}) => {
		j++;
		if ( hashRegex.test(longHash) && Array.isArray(urgency) ) {
		    
		    let _shouldPush = urgency.some( _x => _x === _urgency );
		    
		    if ( _shouldPush ) return DutyTodo.URGENCY_ERROR();
		    
		    urgency.push(_urgency);
		    Object.assign(m[hash], { urgency });
		    return true;
		} else if ( hashRegex.test(longHash) && ! urgency ) {
		    let urgency = [];
		    urgency.push(_urgency);
		    Object.assign(m[hash], { urgency });
		    return true;
		} else if ( Object.keys(m).length === j ) {
		    return false;
		}		
	    };
	DutyTodo.CALLGENERATORYLOOP(this,cb)
	    .then( _ => {
		DutyTodo.WriteFile({location,m});
	    }).catch( errMessage => {
		if ( errMessage ) {
		    return DutyTodo.ErrMessage(`the specified urgency message, has already been added`);
		}
		
		DutyTodo.ErrMessage(`${hash} was not found`);
	    });	
    }
    setPriority({hash,priority}) {
	if ( ! hash ) {
	    DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`);
	    return false;
	} else if ( hash.length <= 4 ) {
	    DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`);
	    return false;
	} else if ( ! priority ) {
	    DutyTodo.ErrMessage(`required proirity argument to be set`);
	    return false;	    
	} else if ( priority ) {
	    switch(priority) {
	    case "critical": break;
	    case "notcritical": break;
	    default:
		DutyTodo.ErrMessage(`invalid priority type. Use critical or not critical`);
	    }
	}

	let {location,m} = this.MANAGER,
	    hashRegex = new RegExp(`^${hash}`),
	    j = 0,
	    cb = ({hash,longHash}) => {
		j++;
		if ( hashRegex.test(longHash) ) {
		    Object.assign(m[hash], { priority });
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
    categorize({hash,category}) {
	
	if ( ! hash ) {
	    
	    DutyTodo.ErrMessage(`got ${typeof(hash)} instead of a hash value`);
	    return false;
	    
	} else if ( hash.length <= 4 ) {
	    
	    DutyTodo.ErrMessage(`length of ${hash} is not greater than 4`);
	    return false;
	    
	} else if ( ! category || ! Array.isArray(category) ) {
	    
	    DutyTodo.ErrMessage(`expected category to be an array but got ${typeof(category)}`);
	    return false;
	    
	}
	
	let {location,m} = this.MANAGER,
	    hashRegex = new RegExp(`^${hash}`),
	    j = 0,
	    cb = ({hash,longHash,category:_jsonCategory}) => {
		j++;
		if ( hashRegex.test(longHash) && _jsonCategory ) {

		    //category.forEach(cat => _jsonCategory.push(cat));
		    
		    category.filter( _x => ! _jsonCategory.includes(_x))
			.forEach(_x => _jsonCategory.push(_x));
		    
		    Object.assign(m[hash], { category: _jsonCategory });
		    
		    return true;
		    
		} else if ( hashRegex.test(longHash) && ! _jsonCategory)  {
		    
		    _jsonCategory = [];
		    
		    category.forEach(cat => _jsonCategory.push(cat));
		    Object.assign(m[hash], { category: _jsonCategory });
		    
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
    
}

module.exports = DutyTodo.createInstance;