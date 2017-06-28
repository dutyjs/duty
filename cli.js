#!/usr/bin/env node

const ff = require("./index.js");
const commander = require("commander");
const {
    deleteOption,
    editOption,
    setnotifyOption,
    categorizeOption,
    priorityOption,
    urgencyOption,
    dueOption,
    readOption,
    removenoteOption,
    noteOption,
    markCompletedOption,
    replaceOption,
    appendOption,
    addOption,
    isExists } = require("./src/utils.js");

const pkgJson = require("./package.json");


commander
    .version(pkgJson.version)
    .command("add <todo> [category...]")
    .description("Add todo into category, category is optional")
    .action((todo,category) => {
        return addOption(todo,category,ff);
    });



commander
    .command("append <hash> <text>")
    .description("Append text into todo with the id of hash")
    .action((hash,text) => {
        return appendOption(hash,text,ff);
    });

commander
    .command("replace <hash> <regexp> <text>")
    .description("replace a text speicified by regexp with text into todo with id of hash")
    .action((hash,regexp,text) => {
        return replaceOption(hash,regexp,text,ff);
    });

commander
    .command("markcompleted <hash>")
    .description("mark a todo with the id of hash completed")
    .action( hash => {
        // return ff.markcompleted({hash});
        return markCompletedOption(hash,ff);
    });

commander
    .command("note <hash> <note>")
    .description("add a little note in a todo with id of hash")
    .action( (hash,note) => {
        return noteOption(hash,note,ff);
    });


commander
    .command("removenote <hash>")
    .description("remove note that has been added to todo with the id of hash")
    .action( hash => {
        return removenoteOption(hash);
    });

commander
    .command("read <type>")
    .description(`read the todo that meets the type criteria
valid types are all , date , completed, notcompleted, due , category, urgency, eval`)
    .option("--date <date> specifiy date to use")
    .option("--modifiedDate <date> specifiy a modified date to search with")
    .action((type,options) => {
        const { date, modifiedDate } = options;
        if ( date && ! modifiedDate ) {
            return readOption(type, { date },ff);
        } else if ( ! date && modifiedDate ) {
            return readOption(type, {modifiedDate},ff);
        } else if ( date && modifiedDate ) {
            return readOption(type,{date,modifiedDate},ff);
        } else {
            return readOption(type,undefined,ff);
        }
    });

commander
    .command("delete <type>")
    .description(`delete any todo that meets the type criteria
valid types are all , hash, completed, date, category, `)
    .action( type => {
        let argumentArray;
        const [ _type, value ] = argumentArray = type.split(":");

        if ( /^all$|^completed$/.test(_type) )  {
            return deleteOption(_type,undefined,ff);
        } else {
            return deleteOption(_type,{ value },ff);
        }

    });


commander
    .command("urgency <hash> <urgency>")
    .description(`specify how urgent you want to accomplish this task
valid urgency types are pending,waiting,later,tomorrow,today`)
    .action( (hash,urgency) => {
        return urgencyOption(hash,urgency,ff);
    });

commander
    .command("priority <hash> <priority>")
    .description(`specify the task priority
valid priorities are critical and notcritical`)
    .action( (hash,priority) => {
        return priorityOption(hash,priority,ff);
    });

commander
    .command("categorize <hash> [category...]")
    .description("add a todo to a particular category")
    .action( (hash,category) => {
        return categorizeOption(hash,category,ff);
    });

commander
    .command("due <hash> <date>")
    .description("set the date in which hash is due")
    .action((hash,date) => {
        return dueOption(hash,date,ff);
    });

commander
    .command("export <type> <path>")
    .description(`export todo as type to path
valid export types are xml,html,json`)
    .action( (type,path) => {
        return ff.export({type,path});
    });

commander
    .command("set_notify <hash> <notification> <timeout> ")
    .description("set notification option for a particular todo")
    .action((hash,notification,timeout) => {
        return setnotifyOption(hash,{notification,timeout});
    });

commander
    .command("help")
    .description("show help commands for duty")
    .action(_ => {
        commander.outputHelp();
    });

commander
    .command("daemon")
    .description("use to make duty run in background, executing this subcommand from the commandline won't work")
    .action( _ => {
        ff.daemon();
    });

commander
    .command("status <type>")
    .description("shows the breakdown of all your todos, it takes one argument which is the type of status you want to read, the types supported are all and category, not specifing a type will read all the todos")
    .action(type => {
        ff.status(type);
    });

commander
    .command("create-service")
    .description("creates a service file to handle daemons for background notification")
    .action(() => {
        ff.execDaemon();
    });
commander
    .command("edit <hash> <text>")
    .description("this subcommand edits a todo")
    .action((hash,text) => {
        return editOption(hash,text,ff);
    });

commander.parse(process.argv);



if ( ! process.argv.slice(2).length ) {
    isExists("/config.json",commander);
}
