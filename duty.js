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
    static ErrMessage(msg) {
	process.stderr.write(`${msg}.red\n`);
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
	      year = DATE.getYear();

	m[hash] = {
	    content: todo,
	    hash,
	    longHash,
	    date,
	    month,
	    year
	};
	DutyTodo.WriteFile({location,m});
	process.stdin.write(`New todo has been added\nTotal todo is ${Object.keys(m).length}\n`.green);
    }    
    *IterateTodo() {
	let { m } = this.MANAGER;
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
	
	const gen = this.IterateTodo();
	
	let _n = gen.next();
	
	while ( ! _n.done  ) {
	    if ( _n.value.longHash === hash ) {
		DutyTodo.ErrMessage(`This todo already exists`);
		return false;
	    }
	    _n = gen.next();
	}
	
	DutyTodo.SaveTodo({manager,hash,todo});
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
	
	let gen = this.IterateTodo(),
	    _n = gen.next(),
	    hashRegex = new RegExp(`^${hash}`),
	    found = false;
	
	while ( ! _n.done ) {
	    if ( hashRegex.test(_n.value.hash) ) {
		
		let { content, hash } = _n.value;
		let { location , m } = this.MANAGER;
		found = true;
		_n.value.content = content = `${content} ${text}`;
		DutyTodo.WriteFile({location,m});
		break;
	    }
	    _n = gen.next();
	}
	if ( ! found ) {
	    DutyTodo.ErrMessage(`${hash} was not found`);
	    return false;
	}
	return true;
    }
}

module.exports = DutyTodo.createInstance;
