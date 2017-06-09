# duty.js

[![Logo](assets/logo.png)](assets/logo.jpg)


[duty.js](https://github.com/zombieleet/duty) is a lightweight commandline todo application with desktop notification 


## Installation

`npm install -g duty-js`


## usage

**To properly setup duty the first thing you should do after installation is to run** `duty` without any argument or subcommand 

when no argument is specified, help is outputed

**add** 
    
	This command takes two argument, the todo to add and a category to add the todo into.
	The category to add the todo is optional
	
`duty add "go to the dry cleaner"`

	Some characters a special to the shell. If a category contains space, you have to wrap with in double or single quotes
	
`duty add "go to the dry cleaner" "wash clothes" laundary`

**append**

	This command takes two argument, the hash id of a valid todo , and a text to append
	All the arguments are compulsory
	
`duty append f82dc15f4 " before mum comes back from work"`


**replace**

	This command takes three argument, the hash id of a valid todo , a regular expression to match, a text to replace the matched regular expression
	All the arguments are compulsory
	
`duty replace 0476b60de work journey`


**markcompleted**

	This command marks a todo as completed, it takes just an argument, which is a valid hash id the todo to mark has completed
	
`duty markcompleted 57c86e40f`

**note**

	Add a little note to an already added todo, it takes two argument, a valid hash id of a todo that has already been added and a text which will server as a note.
	Both of the arguments are compulsory
	
`duty note 57c86e40f "go back to the dry cleaner to collect the remaining clothe"`

**removenote**
	
This subcommand removes an already added note. It takes just a single argument which is a valid hash id of a todo 

`duty removenote 57c86e40f`

**delete**

This subcommand deletes a particular todo, that matches a certain type
supported types are

1. hash < deletes a todo that has the value of hash>
2. completed < deletes all completed todo >
3. category:type < deletes all todo with a `type` category >
4. date (requires a date argument in this format dd/mm/yy) < deletes all todo that matches a specific date >
5. all < removes all todo >

# supported for deleting todos

`duty delete hash:1591a6d40`

`duty delete completed`

`duty delete category:food`

`duty delete date:mm/dd/yy`

`duty delete all`

**read**

	This subcommand prints all added todos that matches a particular type

1. all < reads all todo >
2. date ( takes two argument, the --date option is compulsory , but the --modifiedDate option is not compulsory) < read all todo that matches the specified --date option, if --modifiedDate is specified, it read all todo that has the specified date option and was modified that the the specified modify date option
3. category:type ( reads all todo that belongs to the type category )
4. urgency:type ( read all todo thas have the type urgency)
5. completed ( reads all completed todo)
6. notcompleted ( reads all todo that has not been marked completed)

**example**
	
`duty read all`

`duty read date --date 14/12/1999`

`duty read date --date 14/12/1999 --modifiedDate 14/12/2020`

`duty read category:dutyProject`

`duty read urgency:pending`

`duty read urgency:waiting`

`duty read urgency:tomorrow`

`duty read urgency:later`

`duty read urgency:today`

## new way of reading todos

**The eval read option , reads the due date of todos as a string**

`duty read eval:"today"`

`duty read eval:"2days before now"`

`duty read eval:"5days from now"`

**urgency**

	This subcommand takes two compulsory argument, the first argument is a valid hash id, while the second argument is an urgency type to set the hash id to
	valid urgency types are

1. pending
2. waiting
3. tomorrow
4. later
5. today


**example**

`duty urgency a6bfb2750 urgency:pending`

**priority**

        This subcommand takes two compulsory argument, the first argument is a valid hash id, while the second argument is a priority to set the hash id as
        Valid priorities are

1. critical
2. notcritical        

**example**

`duty priority a6bfb2750 critical`

`duty priority 8cab293f8 notcritical`


**categorize**

        This subcommand takes two argument, a valid hash id to categorize, and a list of category to set the hash id to
        Both arguments are compulsory


`duty categorize 8cab293f8 dance education learn`




**due**

        This subcommand sets a due date for a particular todo. It takes to argument, a valid hash id and a date 
        Both arguments are compulsory

`duty due 8cab293f8 4/16/2017`

**export**

        This subcommand requires two argument, it exports all todos to a specific path
        The first argument is an export type, while the second argument is the path to export todo to
        Valid types are

1. xml
2. html
3. json

**example**

`duty export html /root/duty.html`

`duty export html /root/duty`

`duty export xml /root/duty`

`duty export xml /root/duty.xml`


**status** status subcommand shows you a breakdwon of the todo

`duty status`

The status subcommand receives at least a single argument, which is all or category. If no argument is specified duty reads all todo


**help**
	
	This subcommand shows all subcommand related to duty.js
		

**NOTE:** 

	hash length that is greater than 4 can be use with any subcommand that requires hash as an argument

# what changed in v2

1. new way of reading todos with the use of eval
2. the way to delete todos has changed, check the above documentation on how to delete todos
3. The ability to get notified only in linux systems with systemd as the daemon manager

# how to set notification

run `duty create-service`

it should be noted that for now notification only works for linux O.S with systemd as the daemon manager

automatically notification is been set for added todo, incase you want to disable notification for a todo do this

`duty set_notify 23abcdef false 3000` // all the arguments are required, the first argument `set_notify` sets the notification, the second argument is the hash to work on, the fourth argument ( false ) disables notification, the fifth argument 3000 specifies the timeout of a notification

# the daemon method

The daemon method is used by systemd , running it from the commandline, won't do anything special


# FIX

1. Proper date validation


## LICENSE

MIT 

GNU  ( either version 2 of the License, or (at your option) any later version. )
