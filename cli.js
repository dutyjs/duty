#!/usr/bin/env node

const ff = require("./index.js")
const fs = require("fs")
const path = require("path")
const commander = require("commander")

commander
    .version("3.0.0")
    .command("add <todo> [category...]")
    .description("Add todo into category, category is optional")
    .action((todo,category) => {
        return ( category ? ff.add({todo,category}) : ff.add({todo}))
    })



commander
    .command("append <hash> <text>")
    .description("Append text into todo with the id of hash")
    .action((hash,text) => {
        return ff.append({hash,text})
    })

commander
    .command("replace <hash> <regexp> <text>")
    .description("replace a text speicified by regexp with text into todo with id of hash")
    .action((hash,regexp,text) => {
        return ff.replace({hash,regexp,text})
    })

commander
    .command("markcompleted <hash>")
    .description("mark a todo with the id of hash completed")
    .action( hash => {
        return ff.markcompleted({hash})
    })

commander
    .command("note <hash> <note>")
    .description("add a little note in a todo with id of hash")
    .action( (hash,note) => {
        return ff.note({hash,note})
    })


commander
    .command("removenote <hash>")
    .description("remove note that has been added to todo with the id of hash")
    .action( hash => {
        return ff.removenote({hash})
    })

commander
    .command("read <type>")
    .description(`read the todo that meets the type criteria
                  valid types are all , date , completed, notcompleted, due , category, urgency, eval`)
    .option("--date <date> specifiy date to use")
    .option("--modifiedDate <date> specifiy a modified date to search with")
    .action((type,options) => {
        const { date, modifiedDate } = options
        if ( date && ! modifiedDate ) {
	        return ff.read(type, { date }) 
        } else if ( ! date && modifiedDate ) {
            return ff.read(type, {modifiedDate})
        } else if ( date && modifiedDate ) {
            return ff.read(type,{date,modifiedDate})
        } else {
            return ff.read(type)
        }
    })

commander
    .command("delete <type>")
    .description(`delete any todo that meets the type criteria
                  valid types are all , hash, completed, date, category, `)
    .action( type => {
        let argumentArray
    	const [ _type, value ] = argumentArray = type.split(":")

        if ( /^all$|^completed$/.test(_type) )  {
            return ff.delete(_type)
        } else {
            return ff.delete(_type,{ value })
        }

    })


commander
    .command("urgency <hash> <urgency>")
    .description(`specify how urgent you want to accomplish this task
                  valid urgency types are pending,waiting,later,tomorrow,today`)
    .action( (hash,urgency) => {
        return ff.urgency({hash,urgency})
    })

commander
    .command("priority <hash> <priority>")
    .description(`specify the task priority
                 valid priorities are critical and notcritical`)
    .action( (hash,priority) => {
        return ff.setPriority({hash,priority})
    })

commander
    .command("categorize <hash> [category...]")
    .description("add a todo to a particular category")
    .action( (hash,category) => {
        return ff.categorize({hash,category})
    })

commander
    .command("due <hash> <date>")
    .description("set the date in which hash is due")
    .action((hash,date) => {
        return ff.due({hash,date})
    })

commander
    .command("export <type> <path>")
    .description(`export todo as type to path
                 valid export types are xml,html,json`)
    .action( (type,path) => {
        return ff.export({type,path})
    })

commander
    .command("set_notify <hash> <notification> <timeout> ")
    .description("set notification option for a particular todo")
    .action((hash,notification,timeout) => {
        ff.set_notify(hash,{notification,timeout})
    })

commander
    .command("help")
    .description("show help commands for duty")
    .action(_ => {
        commander.outputHelp()
    })

commander
    .command("daemon")
    .description("use to make duty run in background, executing this subcommand from the commandline won't work")
    .action( _ => {
        ff.daemon()
    })

commander
    .command("status <type>")
    .description("shows the breakdown of all your todos, it takes one argument which is the type of status you want to read, the types supported are all and category, not specifing a type will read all the todos")
    .action(type => {
        ff.status(type)
    })

commander
    .command("create-service")
    .description("creates a service file to handle daemons for background notification")
    .action(() => {
        ff.execDaemon()
    })
commander
    .command("edit <hash> <text>")
    .description("this subcommand edits a todo")
    .action((hash,text) => {
        ff.edit({hash,text})
    })

commander.parse(process.argv)



if ( ! process.argv.slice(2).length ) {
    process.stdout.write(isExists("/config.json"));
}    

function isExists(file) {
        
    let fileContent,
        _file = path.join(__dirname, file)
    
    if ( fs.existsSync(_file) && (fileContent = fs.readFileSync(_file) ) && 
        fs.existsSync(JSON.parse(fileContent.toString()).location) )  {
        
        if ( process.env.NODE_ENV  ) {
            commander.outputHelp()
            return
        }

        return "Enjoy..."
    }
    
    return "error while reading config file"

}


module.exports = isExists