
class ExportTodo {
    
    constructor() {}
    
    static createExport() {
	return new ExportTodo();
    }
    export(type) {
	this.type = type;
	this[this.type]();
    }
    pdf() {
	console.log('pdf exported');
    }
    html() {
	console.log('html');
    }
    json() {
	console.log('json');
    }
    xml() {
	console.log('xml');
    }
}

module.exports = ExportTodo;
