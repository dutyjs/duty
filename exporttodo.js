const { Duplex } = require('stream');
const { appendFileSync, writeFileSync } = require('fs');

class ExportTodo {
    
    constructor() {}
    
    static createExport() {
	return new ExportTodo();
    }
    export({type,DutyTodo,self}) {
	this.type = type;
	this.DutyTodo = DutyTodo;
	this._this = self;
	this[this.type]();
    }
    pdf() {
	console.log('pdf exported');
    }
    static FlattenArray(arr) {
	
	let BUILD_LIST = `<ul>`;
	
	for ( let i of arr ) {
	    
	    BUILD_LIST += `<li>${i}</li>`;
	    
	}
	
	BUILD_LIST += `</ul>`;
	return BUILD_LIST;
	
    }
    
    static BUILDHTML({key: type,prop: value}) {
	
	const BUILD_HTML = `
<tr>
  <td> ${type} </td>
  <td>${Array.isArray(value) ? ExportTodo.FlattenArray(value) : value}</td>
</tr>
`;

	return BUILD_HTML;
    }
    html() {
	let buildHtml = `
<!doctype html>
<html>
 <head>
   <title> Duty Todo Html Summary </title>
   <link rel="stylesheet" href="duty.css"/>
 </head>
 <body>

   <div class="im"><img src="logo.jpg"/></div>
   <div>
`;
	writeFileSync('./duty.html', '');
	let { DutyTodo, _this } = this,
	    { m } = _this.MANAGER,
	    j = 0,
	    cb = (opt) => {
		j++;
		let { hash } = opt;
		buildHtml += `

<table>
  <thead>
    <tr><th>${hash}</th></tr>
  </thead>
`;
		
		for ( let [key,prop] of Object.entries(opt) ) {
		    
		    if ( key === hash ) continue ;
		    const RET_VALUE = ExportTodo.BUILDHTML({key,prop});
		    
		    buildHtml += RET_VALUE;
		}
		
		buildHtml += `</table>`;
		
		appendFileSync('./duty.html', buildHtml);
		
		buildHtml = '';
		
		if ( Object.keys(m).length === j ) {
		    
		    buildHtml = `
  </div>
   </body>
</html>
`;
		    
		    appendFileSync('./duty.html', buildHtml);
		    
		    return true;
		}
	    };
	
	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .then( _ => {
		process.stdout.write(`finish converting json html to todo\n`);
	    })
	    .catch( _ => {
		process.stdout.write(`error converting todo list to html\n`);
	    });	
    }
    json() {
	console.log('json');
    }
    xml() {
	console.log('xml');
    }
}

module.exports = ExportTodo;
