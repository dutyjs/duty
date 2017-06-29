const { Duplex } = require('stream');
const { appendFileSync, writeFileSync, readFileSync, createWriteStream } = require('fs');
const { dirname , extname, join }  = require('path');
const fs = require('fs');


class ExportTodo {

    constructor() {}

    static createExport() {
        return new ExportTodo();
    }
    export({type,DutyTodo,self,path}) {
        this.type = type;
        this.DutyTodo = DutyTodo;
        this._this = self;
        this._path = ( extname(path) !== `.${type}` )
            ? `${path}.${type}` : path;

        this._pathDir = dirname(this._path);
        return this[this.type]();
    }

    static BUILDHTML({key: type,prop: value}) {

        const BUILD_HTML = `
<tr>
   <td> ${type} </td>
   <td>${Array.isArray(value) ? ExportTodo.FlattenArray(value,"ul","li") : value}</td>
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
        let { _path , _pathDir, DutyTodo, _this  } = this,
            
            buildHtml = `
<!doctype html>
<html>
   <head>
     <title> Duty Todo Html Summary </title>
     <link rel="stylesheet" href="duty.css"/>
   </head>
   <body>

      <div class="im"><img src="logo.png"/></div>
<div>
`;

        writeFileSync(_path, "");


        let { todoGroup } = _this.MANAGER,
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

                buildHtml += "</table>";

                appendFileSync(_path, buildHtml);

                buildHtml = "";

                if ( Object.keys(todoGroup).length === j ) {

                    buildHtml = `
</div>
</body>
</html>
`;
                    appendFileSync(_path, buildHtml);
                    
                    return { _pathDir, _path };
                }
            };

        return DutyTodo.CALLGENERATORYLOOP(_this,cb);

    }
    json() {
        
        // uh
        
        let { _this: { MANAGER: { location }} , DutyTodo, _path} = this;

        try {
            writeFileSync(_path, readFileSync(location).toString("ascii"));
            return Promise.resolve(`file location ${_path}\n`);
        } catch(ex) {
            return Promise.reject("error converting todo list to json\n");
        }

    }
    xml() {
        let { _path, DutyTodo, _this } = this,
            Build_xml = `<?xml version="1.0" encoding="UTF-8"?>
<duty>
`;

        writeFileSync(_path, "");

        let  { todoGroup } = _this.MANAGER,
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
        ? ExportTodo.FlattenArray(prop,"_parent","_child")
        : prop}
</${key}>
`;
                }


                Build_xml += `
</id>
`;

                appendFileSync(_path, Build_xml);

                Build_xml = "";

                if ( Object.keys(todoGroup).length === j ) {

                    Build_xml = `
</duty>
`;
                    appendFileSync(_path, Build_xml);

                    return { _path };
                }
            };

        return DutyTodo.CALLGENERATORYLOOP(_this,cb);

    }
}

module.exports = ExportTodo;
