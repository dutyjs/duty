const { Duplex } = require('stream');
const { appendFileSync, writeFileSync, readFileSync } = require('fs');

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
    static BUILDHTML({key: type,prop: value}) {
	
	const BUILD_HTML = `
<tr>
  <td> ${type} </td>
  <td>${Array.isArray(value) ? ExportTodo.FlattenArray(value,'ul','li') : value}</td>
</tr>
`;

	return BUILD_HTML;
    }
    static FlattenArray(arr,parent,children) {
	
	let BUILD_LIST = `<${parent}>`;
	
	for ( let i of arr ) {
	    
	    BUILD_LIST += `
        <${children}>
            ${i}
        </${children}>
`;
	    
	}
	
	BUILD_LIST += `      </${parent}>`;
	
	return BUILD_LIST;
	
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
	// uh
	let { _this: { MANAGER: { location }} } = this;
	
	try {
	    writeFileSync('./duty.json', readFileSync(location).toString('ascii'));
	    process.stdout.write(`finish converting json data to json\n`);
	} catch(ex) {
	    process.stdout.write(`error converting todo list to json\n`);
	}
	
    }
    xml() {
	
	let Build_xml = `
<?xml version="1.0" encoding="UTF-8"?>
<duty>
`;

	writeFileSync('./duty.xml', '');

	let { DutyTodo, _this } = this,
	    { m } = _this.MANAGER,
	    j = 0,
	    cb = (opt) => {
		
		j++;
		
		let { hash } = opt;

		Build_xml += `
  <id hash="${hash}">
`;
		for ( let [key,prop] of Object.entries(opt) ) {

		    if ( key === hash ) continue ;
		    
		    Build_xml += `
    <${key}>
      ${Array.isArray(prop) 
         ? ExportTodo.FlattenArray(prop,'_parent','_child')
         : prop}
    </${key}>
`;
		}


		Build_xml += `
  </id>
`;
		
		appendFileSync('./duty.xml', Build_xml);

		Build_xml = '';
		
		if ( Object.keys(m).length === j ) {

		    Build_xml = `
</duty>
`;
		    appendFileSync('./duty.xml', Build_xml);
		    
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .then( _ => {
		process.stdout.write(`finish converting json data to xml\n`);
	    })
	    .catch( _ => {
		process.stdout.write(`error converting todo list to xml\n`);
	    });		
	
    }
}

module.exports = ExportTodo;
