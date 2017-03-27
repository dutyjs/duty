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
	fs.writeFileSync(location, JSON.stringify(m));
	process.stdin.write(`New todo has been added\nTotal todo is ${Object.keys(m).length}\n`.green);
    }    
    *IterateTodo() {
	let { m } = this.MANAGER;
	for ( let todos  of Object.keys(m) ) {
	    yield m[todos].longHash;
	}
    }
    add(todo = false) {

	if ( ! todo ) {
	    process.stderr.write(`A todo content needs to be added\n`.red);
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
	    if ( _n.value === hash ) {
		process.stderr.write(`This todo already exists\n`.red);
		return false;
	    }
	    _n = gen.next();
	}
	
	DutyTodo.SaveTodo({manager,hash,todo});
    }
    
    static createInstance({config_locationContent: m, location}) {
	return new DutyTodo({m,location});
    }
}

module.exports = DutyTodo.createInstance;
