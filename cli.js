#!/usr/bin/env node

const ff = require('./index.js');
const fs = require('fs');

const commander = require('commander');

commander
    .version('0.0.1')
    .command('add <todo> [category...]')
    .description('Add todo into category, category is optional')
    .action((todo,category) => {
	return ( category ? ff.add({todo,category}) : ff.add({todo}));
    });



commander
    .command('append <hash> <text>')
    .description('Append text into todo with the id of hash')
    .action((hash,text) => {
	return ff.append({hash,text});
    });

commander
    .command('replace <hash> <regexp> <text>')
    .description('replace a text speicified by regexp with text into todo with id of hash')
    .action((hash,regexp,text) => {
	return ff.replace({hash,regexp,text});
    });

commander
    .command('markcompleted <hash>')
    .description('mark a todo with the id of hash completed')
    .action( hash => {
	return ff.markcompleted({hash});
    });

commander
    .command('note <hash> <note>')
    .description('add a little note in a todo with id of hash')
    .action( (hash,note) => {
	return ff.note({hash,note});
    });


commander
    .command('removenote <hash>')
    .description('remove note that has been added to todo with the id of hash')
    .action( hash => {
	return ff.removenote({hash});
    });

commander
    .command('read <type>')
    .description(`read the todo that meets the type criteria
                  valid types are all , date , completed, notcompleted, due , category, urgency`)
    .option('--date <date> specifiy date to use')
    .option('--modifiedDate <date> specifiy a modified date to search with')
    .action((type,options) => {
	const { date, modifiedDate } = options;
	if ( ! date && ! modifiedDate ) {
	    return ff.read(type);
	}
	return ff.read(type, { date , modifiedDate });
    });

commander
    .command('delete <type>')
    .description(`delete any todo that meets the type criteria
                  valid types are all , hash, completed, date, category, `)
    .option('--date <date> specifiy date to use')
    .option('--category <category> delete todos with that belongs to a particular category')
    .option('--hash <hash> specify a hash to delete ', 'specify a hash to delete')
    .action((type,options) => {
	const { date, category, hash } = options;
	if ( date ) {
	    return ff.delete(type, { date } );
	} else if ( category) {
	    return ff.delete(type, {category});
	} else if ( hash ) {
        return ff.delete(type, { hash });
    } else {
	    return ff.delete(type);
	}
    });


commander
    .command('urgency <hash> <urgency>')
    .description(`specify how urgent you want to accomplish this task
                  valid urgency types are pending,waiting,later,tomorrow,today`)
    .action( (hash,urgency) => {
	return ff.urgency({hash,urgency});
    });

commander
    .command('priority <hash> <priority>')
    .description(`specify the task priority
                 valid priorities are critical and notcritical`)
    .action( (hash,priority) => {
	return ff.setPriority({hash,priority});
    });

commander
    .command('categorize <hash> [category...]')
    .description('add a todo to a particular category')
    .action( (hash,category) => {
	return ff.categorize({hash,category});
    });

commander
    .command('due <hash> <date>')
    .description('set the date in which hash is due')
    .action((hash,date) => {
	return ff.due({hash,date});
    });

commander
    .command('export <type> <path>')
    .description(`export todo as type to path
                 valid export types are xml,html,json`)
    .action( (type,path) => {
	return ff.export({type,path});
    });

commander
    .command('help')
    .description('show help commands for duty')
    .action(_ => {
        commander.outputHelp();
    });

commander
    .command('daemon')
    .description("use to make duty run in background, executing this subcommand from the commandline won't work")
    .action( _ => {
        ff.daemon();
    });


commander.parse(process.argv);

if ( ! process.argv.slice(2).length ) {

    if ( fs.existsSync(JSON.parse(fs.readFileSync(__dirname + "/config.json")).location ) ) {
	commander.outputHelp();
	process.exit(0);
    }

}
//module.exports = ff;
