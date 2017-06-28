const path = require("path");
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
    isExists,
    node_env } = require("../src/utils.js");

const crypto = require("crypto");
const moment = require("moment");
const ReadTodo = require("../src/readtodo.js");
const { $it ,
        $beforeEach,
        $afterEach } = require("async-await-jasmine");

describe("#duty test", () => {

    let fs,  test_config, test_config2, _test, DutyInstance, DutyClass , add, parsedConfig;
    beforeEach(() => {

        fs = require("fs"),
        test_config = path.join(__dirname,"test_config.json"),
        test_config2 = path.join(__dirname, "test_config2.json"),
        _test = path.join(__dirname, ".test.json");

        fs.writeFileSync(test_config, JSON.stringify({
            location: "not_valid_location"
        }));

        fs.writeFileSync(_test, JSON.stringify({}));

        fs.writeFileSync(test_config2, JSON.stringify({
            location: _test,
            notification: "yes",
            timeout: 60000,
        }));


        parsedConfig = JSON.parse(fs.readFileSync(test_config2,"utf8"));

        Object.assign(parsedConfig, {
            todoGroup: require(parsedConfig.location)
        });

        DutyClass = require("../src/duty.js");

        DutyInstance = new DutyClass(parsedConfig);


    });

    afterEach(() => {
        fs.unlinkSync(test_config);
        fs.unlinkSync(_test);
        fs.unlinkSync(test_config2);

        test_config = undefined;
        test_config2 = undefined;
        _test = undefined;
        fs = undefined;
        parsedConfig = undefined;
        DutyInstance = undefined;
        DutyClass = undefined;

    });
    describe("#checking todo configuration", () => {
        it("should print out an error message if bad config  file is passed", () => {

            expect(isExists("/configf.json")).toEqual("error while reading config file");
        });

        it("should print out an error message if location property filedoes not existws", () => {
            expect(isExists("./test/test_config.json")).toEqual("error while reading config file");
        });

        it("should print out Enjoy... if the location property file exists", () => {
            return node_env() ? fail("NODE_ENV is not set to development") : "";

            expect(isExists("./test/test_config2.json")).toEqual("Enjoy...");
        });

    });
    describe("adding todos without category", () => {
        it("should add todo successfully", done => {
            addOption("hello world",undefined,DutyInstance)
                .then( result => {
                    let { content, longHash } = result;
                    expect(result).toEqual(jasmine.any(Object));
                    expect(content).toEqual("hello world");
                    expect(longHash).toEqual(crypto.createHash("sha256").update(content).digest("hex"));
                    done();
                });
        });

        it("should not add todo for already existing todos", done => {
            addOption("hello world",undefined,DutyInstance)
                .then( result => {

                    expect(result).toEqual("this todo already exists");

                    expect(Object.keys(parsedConfig.todoGroup).length).toEqual(1);
                    done();
                });
        });
    });

    describe("adding todos with categories", () => {
        let categoryArray;
        beforeEach(() => {
            category = ["greetings","earthlings"];
        });
        afterEach(() => {
            category = undefined;
        });
        it("should add todo with categories successfully", done => {
            addOption("hello earthlings",category,DutyInstance)
                .then( result => {
                    const { category } = result;
                    expect(category).toEqual(jasmine.arrayContaining(["greetings","earthlings"]));
                    done();
                });
        });

        it("should not add todo for already existing todos", done => {
            addOption("hello earthlings",category,DutyInstance)
                .then( result => {
                    expect(result).toEqual("this todo already exists");
                    expect(Object.keys(parsedConfig.todoGroup).length).toEqual(2);
                    done();
                });
        });
    });

    describe("appending a todo", () => {
        // 402fa814b15f892d898ecf6d1c903fe2899018b46caf9c92ea1cb1e3719bbf86
        it("should return a failed promise, if hash length is not greater than 9", done => {
            let hash = "402fa";
            appendOption(hash," ---",DutyInstance)
                .then( result => {
                    expect(result).toEqual(`hash length is suppose to be 9 but got ${hash.length}`);
                    done();
                });
        });
        it("should return a failed promise, if the specified hash value is not found", done => {
            appendOption("8a27b264090c4", " --- ", DutyInstance)
                .then( result => {
                    expect(result).toEqual("hash was not found");
                    done();
                });
        });
        it("should return a successfull promise, if the specified hash is greater than 9 and it is found", done => {
            appendOption("402fa814b15f892d898ec"," ---",DutyInstance)
                .then( result => {
                    const { previousHash, currentHash } = result;
                    const _prev = new RegExp(`^${previousHash}`);
                    expect(currentHash).not.toMatch(_prev);
                    done();
                });
        });
    });

    describe("replace todos", () => {
        //b71419e58709541b5d30a5a197dc73ce84e9eb1db141925c5347e3d98d531a93
        it("should return failed promise for invalid hash", done => {
            replaceOption("8a27b264090c4",/earthlings/, "world",DutyInstance)
                .then(result => {
                    expect(result).toEqual("hash was not found");
                    done();
                });
        });
        it("should return fulfilled promise for valid hash", done => {
            replaceOption("b71419e58709541b5d30a5",/earthlings/,"world",DutyInstance)
                .then( result => {
                    const { previousHash, currentHash } = result;
                    const { content } = parsedConfig.todoGroup[currentHash];
                    const _prev = new RegExp(`^${previousHash}`);
                    expect(currentHash).not.toMatch(_prev);
                    expect(content).toMatch("world");
                    done();

                });
        });
        it("should return failed promise for hash values that are less than 9", done => {
            let hash = "b71419";
            replaceOption(hash,/earthlings/,"world",DutyInstance)
                .then( result => {
                    expect(result).toEqual(`hash length is suppose to be 9 but got ${hash.length}`);
                    done();
                });
        });
    });
    describe("check if todo have been successfully marked completed", () => {
        it("should return a failed promise for invalid hash", done => {
            markCompletedOption("8a27b264090c4",DutyInstance)
                .then( result => {
                    expect(result).toEqual("hash was not found");
                    done();
                });
        });
        it("should return a failed promise for hash length less than 9", done => {
            let hash = "b71";
            markCompletedOption(hash,DutyInstance)
                .then( result => {
                    expect(result).toEqual(`hash length is suppose to be 9 but got ${hash.length}`);
                    done();
                });
        });
        it("should return a fulfilled promise for valid hash", done => {
            markCompletedOption("b9b2839a75e400d56ca5e",DutyInstance)
                .then( result => {
                    const { completed } = result;
                    const { todoGroup: { completed: _completed } } = parsedConfig;
                    expect(completed).toBe(completed);
                    expect(completed).toBeTruthy();
                    done();
                });
        });
    });

    describe("adding notes", () => {
        it("should return a failed promise for invalid hash", done => {
            noteOption("8a27b264090c4","fffffffffffffffffffffffffffffffffff",DutyInstance)
                .then( result => {
                    expect(result).toEqual("hash was not found");
                    done();
                });
        });
        it("should return a failed promise for hash length less than 9", done => {
            let hash = "b71";
            noteOption(hash,"fffffffffffffffffffffffffffffffffff",DutyInstance)
                .then( result => {
                    expect(result).toEqual(`hash length is suppose to be 9 but got ${hash.length}`);
                    done();
                });
        });
        it("should return a fulfilled promise for valid hash ( note should be added )", done => {
            noteOption("b9b2839a75e400d56ca5e","fffffffffffffffffffffffffffffffffff",DutyInstance)
                .then( result => {

                    const { note } = result;
                    const { note: _note } = parsedConfig.todoGroup["b9b2839a7"];

                    expect(_note).toBeDefined();

                    expect(note).toBeDefined();

                    expect(_note).toEqual(note);

                    expect("fffffffffffffffffffffffffffffffffff").toEqual(note);

                    done();

                });
        });
    });
    describe("remove notes", () => {
        it("should return a failed promise for invalid hash ( note should not be removed ) ", done => {
            removenoteOption("8a27b264090c4",DutyInstance)
                .then( result => {
                    expect(result).toEqual("hash was not found");
                    done();
                });
        });
        it("should return a failed promise for hash length less than 9 ( note should not be removed ) ", done => {
            let hash = "b71";
            removenoteOption(hash,DutyInstance)
                .then( result => {
                    expect(result).toEqual(`hash length is suppose to be 9 but got ${hash.length}`);
                    done();
                });
        });
        it("should return a fulfilled promise for valid hash ( note should be removed )", done => {
            removenoteOption("b9b2839a75e400d56ca5e",DutyInstance)
                .then( result => {

                    const { note } = result;
                    const { note: _note } = parsedConfig.todoGroup["b9b2839a7"];

                    expect(_note).toBeUndefined();

                    expect(note).toBeUndefined();

                    expect(_note).toEqual(note);

                    done();

                });
        });
    });
    describe("setting the due date of todos", () => {
        let hash = "b9b23";
        it("should return a failed promise for  hash less than 9 when setting the due date of todo", done => {
            dueOption(hash,"10/15/2017",DutyInstance)
                .then( result => {
                    expect(result).toEqual(`hash length is suppose to be 9 but got ${hash.length}`);
                    done();
                });
        });
        it("should return a failed promise for invalid date formats", done => {
            dueOption("b9b2839a75e400d56ca5e","2017/12/12",DutyInstance)
                .then( result => {
                    expect(result).toEqual("invalid date format specfied 2017/12/12. Date should be specfied  in dd/mm/yyyy");
                    done();
                });
        });
        it("should set the due date of a todo when all requirements are met", done => {

            dueOption("b9b2839a75e400d56ca5e","15/10/2017",DutyInstance)
                .then( result => {
                    const { due_date } = result;
                    expect(due_date).toBeDefined();
                    expect(due_date).toEqual("15/10/2017");
                    done();
                });
        });
        it("should return a failed promise if a hash value was not found", done => {
            dueOption("b39543fe2c3458a", "15/10/2017", DutyInstance)
                .then( result => {
                    expect(result).toEqual("hash was not found");
                    done();
                });
        });
    });



    describe("setting urgencies for todo", () => {
        let hash;
        // stupid framework ( async-await-jasmine ) does not handle scoping properly in $beforeEach,
        //   this framework will be changed in the future
        $it("should return a failed promise for invalid urgency specification", async () => {
            
            ({ hash } = await addOption("set urgency for todos", undefined, DutyInstance));
            
            let result = await urgencyOption(hash,"urgency:fakeurgency",DutyInstance);

            expect(result).toEqual(`invalid urgency type, supported urgency type are
					urgency:pending
					urgency:waiting
					urgency:tomorrow
					urgency:later
					urgency:today`);
        });
        
        $it("should return a failed promise for invalid hash i.e hash values not greaterthan or equal 9", async () => {
            let result = await urgencyOption("1233","urgency:pending",DutyInstance);
            expect(result).toEqual("hash length is suppose to be 9 but got 4");
        });
        
        $it("should return a failed promise for hash that does not exists", async () => {
            let result = await urgencyOption("1234abcdefgh","urgency:pending", DutyInstance);
            expect(result).toEqual("hash was not found");
        });
        
        $it("should return a sucessfull promise for all urgency options", async () => {
            
            let { urgency } = await urgencyOption(hash,"urgency:pending",DutyInstance);

            expect(urgency).toBeDefined();
            expect(urgency).toEqual(jasmine.any(Array));
            expect(urgency).toContain("pending");

            ({urgency} = await urgencyOption(hash,"urgency:waiting", DutyInstance));

            expect(urgency).toContain("waiting");

            ({urgency} = await urgencyOption(hash,"urgency:tomorrow", DutyInstance));

            expect(urgency).toContain("tomorrow");

            ({urgency} = await urgencyOption(hash,"urgency:later", DutyInstance));

            expect(urgency).toContain("later");
            
            ({urgency} = await urgencyOption(hash,"urgency:today", DutyInstance));
            
            expect(urgency).toContain("today");

        });

        $it("should return a rejected promise if an already existing urgency type in a todo is readded", async () => {
            // pending already exists
            let result = await urgencyOption(hash,"urgency:pending",DutyInstance);

            expect(result).toEqual("the specfied urgency type already exists on this todo");
        });        
    });
    
    describe("reading of todos", () => {
        $it("should return a failed promises when invalid read option is specified", async () => {
            
            let result = await readOption("readread", undefined, DutyInstance);
            
            expect(result).toEqual("readread is not supported");
            
        });
        describe("reading all todos", () => {
            it("should return a successful promise for reading all todos", done => {
                readOption("all", undefined, DutyInstance)
                    .then( result => {
                        const { todoGroup } = parsedConfig;
                        expect(result).toBeDefined();
                        expect(result).toEqual(jasmine.any(Array));
                        expect(result.length).toBeGreaterThan(0);
                        done();
                    });
            });
            describe("# return failed promise when no todo is available", () => {
                beforeEach(() => {
                    // delete todo here
                });
                // it("should return a failed promise when no todos are available for all", done => {
                //     readOption("all", undefined, DutyInstance)
                //         .then( result => {
                //             console.log(result);
                //             done();
                //         });
                // }); 
            });
            
        });

        describe("reading category todos", () => {
            it("should return a successfull promise for reading categories", done => {
                readOption("category:earthlings",undefined,DutyInstance)
                    .then( result => {
                        const { todoGroup } = parsedConfig;
                        expect(result).toBeDefined();
                        expect(result).toEqual(jasmine.any(Array));
                        expect(result.length).toBeGreaterThan(0);
                        done();
                    });
            });
            it("should return a failed promise for reading invalid categories", done => {
                readOption("category:notavailable", undefined, DutyInstance)
                    .then( result => {
                        expect(result).toEqual("the specified type is not available for reading");
                        done();
                    });
            });
        });

        xdescribe("reading notificatons", () => {
            let handleNotification;
            
            beforeEach( done => {
                let main_key;
                
                handleNotification = (type) => {
                    addOption(`without notificaton ${Math.random(5)} `, undefined, DutyInstance)
                        .then( result => {
                            let { hash } = result;
                            setnotifyOption(hash,type,3000,DutyInstance);
                        });
                };
                done();
            });
            afterEach(() => {
                handleNotification = undefined;
            });
            it("should return successfull promise for notification that is set to yes", done => {
                handleNotification("yes");
                readOption("notification", undefined, DutyInstance)
                    .then( result => {
                        expect(result).toEqual(jasmine.any(Array));
                        //loopNotification(result,"yes");
                        

                        result.forEach( res => {
                            let { notification } = res;
                            expect(notification).toEqual("yes");
                        });
                        
                        done();
                    });
            });
            it("should return a no notificaton for todos", done => {
                handleNotification("no");
                readOption("notification", undefined, DutyInstance)
                    .then( result => {
                        expect(result).toEqual(jasmine.any(Array));
                        
                        result.forEach( res => {
                            let { notification } = res;
                            expect(notification).toEqual("no");
                        });
                        
                        done();
                    });                
            });
        });
        describe("reading todo by evaluating strings", () => {
            beforeEach( done => {
                addOption("Hello adding new todo",undefined,DutyInstance)
                    .then( result => {
                        const { hash } = result;
                        dueOption(hash,moment().add(2, "days").format("DD/MM/YYYY"), DutyInstance)
                            .then( result => { /* do nothing */ });
                        done();
                    });
            });
            it("should evaluate strings as date", done => {
                
                readOption("eval:2 days from now",undefined,DutyInstance)
                    .then( result => {
                        expect(result).toEqual(jasmine.any(Array));
                        
                        for ( let i of result ) {
                            let { due_date } = i;
                            expect(ReadTodo.HANDLE_DUE_DATE({due_date})).toEqual("2 days from now");
                        }
                        done();
                    });
            });
        });
        describe("reading todo with due date", () => {
            $it("should return a failed promise when due is set as type and date is undefined", async ()  => {
                let result = await readOption("due",{date: undefined },DutyInstance);
                expect(result).toEqual("expected date argument to be set");
            });
            
            $it("should return a successfull promise when due is set as type and date is undefined", async () => {
                let result = await addOption("Hello adding todo to be read",undefined,DutyInstance),
                    { hash } = result;
                
                result = await dueOption(hash,"10/12/2017",DutyInstance);

                result = await readOption("due",{date: "10/12/2017"},DutyInstance);
                expect(result).toEqual(jasmine.any(Array));
                result.forEach( res => {
                    const { due_date } = res;
                    expect(due_date).toBeDefined();
                    expect(due_date).toEqual("10/12/2017");
                });

                
            });
        });
        describe("reading completed or notcompleted todos", () => {
            
            $it("should return a successful promise when completed todos are required to be read", async () => {
                let result = await readOption("completed",undefined,DutyInstance);
                expect(result).toEqual(jasmine.any(Array));
                result.forEach( res => {
                    const { completed } = res;
                    expect(completed).toBeDefined();
                    expect(completed).toBeTruthy();
                });
            });
            $it("should return a sucessfull promise when todo that are not yet completed are required to be read", async () => {
                let result = await readOption("notcompleted", undefined, DutyInstance);
                expect(result).toEqual(jasmine.any(Array));
                result.forEach( res => {
                    const { completed } = res;
                    expect(completed).toBeDefined();
                    expect(completed).toBeFalsy();
                });
            });
        });
    });
    describe("reading todos with date option", () => {
        let modifiedDate, date;
        $beforeEach( () => {
            modifiedDate = date = moment().format("DD/MM/YYYY");
        });
        $it("should return a failed promise if type is date and modified date and date is undefined" , async () => {
            let result = await readOption("date", undefined, DutyInstance);

            expect(result).toEqual("expected two argument but got one, second argument should be a date in dd/mm/yyyy.");
        });
        $it("should return a failed promise when an invalid date type is specified", async () => {
            let result = await readOption("date", { date: "2017/06/05" }, DutyInstance);
            
            expect(result).toEqual("expected two argument but got one, second argument should be a date in dd/mm/yyyy.");
            
            result = await readOption("date", { modifiedDate: "2017/06/05" }, DutyInstance);
            
            expect(result).toEqual("expected two argument but got one, second argument should be a date in dd/mm/yyyy.");                        
        });
        $it("should return a sucessfull promse when todo with valid date is accessed", async () => {
            
            let result = await readOption("date", { date }, DutyInstance);

            expect(result).toEqual(jasmine.any(Array));

            result.forEach( res => {
                let { date: _todoDate } = res;
                expect(_todoDate).toEqual(date);
            });
        });
        $it("should return a sucessfull promise when todo with valid modifiedDate is accessed", async () => {
            
            let result = await addOption("modified todo", undefined, DutyInstance),
                { hash } = result;
            
            result = await replaceOption(hash,/modified/, "modifying", DutyInstance);
            
            // main test
            
            result = await readOption("date", { modifiedDate }, DutyInstance);
            
            expect(result).toEqual(jasmine.any(Array));
            
            result.forEach( res => {
                let { modifiedDate: _todoDateModified } = res;
                expect(_todoDateModified).toBeDefined();
                expect(_todoDateModified).toEqual(modifiedDate);
            });
        });
        $it("should return a sucessful promise when todo with valid modifiedDate and date is specified", async () => {
            
            let result = await readOption("date", { date , modifiedDate }, DutyInstance);

            expect(result).toEqual(jasmine.any(Array));

            result.forEach( res => {
                let { date: _todoDate, modifiedDate: _todoDateModified } = res;

                expect(_todoDate).toEqual(date);
                expect(_todoDateModified).toBeDefined();
                expect(_todoDateModified).toEqual(modifiedDate);
            });
        });
        
        describe("reading todos with urgency type", () => {
            $it("should return a failed promise for invalid urgency type", async () => {
                let result = await readOption("urgency:fakeurgencytype",undefined,DutyInstance);
                expect(result).toEqual("invalid urgency type to read");
            });
            $it("should read todo with valid urgency", async () => {
                let [ { urgency } ] = await readOption("urgency:pending",undefined,DutyInstance);

                expect(urgency).toBeDefined();
                expect(urgency).toEqual(jasmine.any(Array));
                expect(urgency).toContain("pending");
                
                [ { urgency } ] = await readOption("urgency:waiting",undefined,DutyInstance);

                expect(urgency).toContain("waiting");

                [ { urgency } ] = await readOption("urgency:tomorrow",undefined,DutyInstance);

                expect(urgency).toContain("tomorrow");

                [ { urgency } ] = await readOption("urgency:later", undefined, DutyInstance);

                expect(urgency).toContain("later");
                
                [ { urgency } ] = await readOption("urgency:today", undefined,DutyInstance);
                
                expect(urgency).toContain("today");
                
            });
        });
    });
    
    describe("setting todo priority", () => {
        
        let priorFunc;
        
        $beforeEach( () => {
            
            priorFunc = async (type) => {
                let { hash } = await addOption(`set priority of todo ${Math.random(5)}`,undefined,DutyInstance);

                let result = await priorityOption(hash,type,DutyInstance);

                return result;
            };
            
        });
        
        $afterEach( () => {
            priorFunc = undefined;
            // delete todo here
        });
        
        $it("should return a failed promise if hash length is less than 9 ", async () => {
            let result = await priorityOption("1233","critical",DutyInstance);
            expect(result).toEqual("hash length is suppose to be 9 but got 4");
        });
        $it("should return a failed promise if hash is not found", async () => {
            let result = await priorityOption("1233444444444","critical",DutyInstance);
            expect(result).toEqual("hash was not found");
        });
        $it("should return a fulfilled promise if hash is found and critical priority is set", async () => {
            let { priority } = await priorFunc("critical");
            expect(priority).toEqual("critical");
        });
        $it("should return a fulfilled promise if hash is found and critical priority is set", async () => {
            let { priority } = await priorFunc("notcritical");
            expect(priority).toEqual("notcritical");
        });
        $it("should return a failed promise for invalid priority type" , async () => {
            let result = await priorFunc("fakepriority");
            expect(result).toEqual("invalid priority type. Use critical or notcritical");
        });
    });
    describe("categorizing todos", () => {

        $it("should return a failed promise if hash length is less than 9 ", async () => {
            let result = await categorizeOption("1234",["family"],DutyInstance);
            expect(result).toEqual("hash length is suppose to be 9 but got 4");
        });
        $it("should return a failed promise if hash is not found", async () => {
            let result = await categorizeOption("1233444444444",["family"],DutyInstance);
            expect(result).toEqual("hash was not found");
        });
        $it("should add category when category does not exists for a todo", async () => {
            
            let { hash } = await addOption("clean your room", undefined, DutyInstance);

            let {category} = await categorizeOption(hash,["chores"],DutyInstance);

            expect(category).toContain("chores");
        });
    });
    describe("setting notification state of todos", () => {
        
        $it("should return a failed promise if hash length is less than 9 ", async () => {
            let result = await setnotifyOption("1234","yes",3000,DutyInstance);
            expect(result).toEqual("hash length is suppose to be 9 but got 4");
        });
        $it("should return a failed promise if hash is not found", async () => {
            let result = await setnotifyOption("12344444444444444","yes",3000,DutyInstance);
            expect(result).toEqual("hash was not found");
        });
        $it("should return a failed promise if specified notification is not supported", async () => {
            let { hash }  = await addOption("unsupported notification", undefined, DutyInstance);
            let result = await setnotifyOption(hash,"fakenotifcationtype",30000,DutyInstance);
            
            expect(result).not.toEqual(jasmine.any(Object));
            expect(result).toEqual("notification state argument needs to be yes or no");
        });
        $it("should return a failed promise if specified timeout is not a number", async () => {
            let { hash } = await addOption("unsupported timeuot", undefined, DutyInstance);
            let result = await setnotifyOption(hash,"yes","hello",DutyInstance);

            expect(result).not.toEqual(jasmine.any(Object));
            expect(result).toEqual("timeout that is amount of times the todo should show is not a number");
        });
        $it("should return a fulfilled promise if all argument to setnotifyOption is valid" , async () => {
            let { hash } = await addOption("supported notification", undefined, DutyInstance);
            let result = await setnotifyOption(hash,"yes",3000,DutyInstance);

            expect(result).toEqual(jasmine.any(Object));

            let { notification , timeout } = result;

            expect(notification).toBeDefined();
            expect(notification).toEqual("yes");

            result = await setnotifyOption(hash,"no", 3000, DutyInstance);

            
            expect(result).toEqual(jasmine.any(Object));

            ({ notification , timeout } = result);

            expect(notification).toBeDefined();
            expect(notification).toEqual("no");
        });
        
    });
    describe("test for editing todos", () => {
        $it("should return a failed promise for invalid hash length" , async () => {
            let result = await editOption("1234","edit todo",DutyInstance);
            expect(result).toEqual("hash length is suppose to be 9 but got 4");
        });
        $it("should return a failed promise if hash is not found", async () => {
            let result = await editOption("12345abcdef","edit todo", DutyInstance);
            expect(result).toEqual("hash was not found");
        });
        $it("should return a sucessfull promise if all argument to editOption is valid", async () => {
            
            let { hash } = await addOption("edit todo", undefined, DutyInstance),
                
                result = await editOption(hash,"this todo has been edited", DutyInstance),
                
                { todoGroup } = parsedConfig,
                
                allKeys = Object.keys(todoGroup),
                
                { hash: _parsedHash, modifiedDate }  = todoGroup[allKeys[allKeys.length - 1]];

            expect(_parsedHash).not.toEqual(hash);
            expect(modifiedDate).toBeDefined();
        });
    });
    describe("handle deleting of todos", () => {
        $it("should return a failed promise when type is date and value is undefined", async () => {
            let result = await deleteOption("date",undefined,DutyInstance);
            expect(result).toEqual("expected two argument but got one, second argument should be a date in dd/mm/yyyy");
            
        });
        $it("should return a failed promise when date format specified is not valid ( of the form dd/mm/yyyy", async () => {
            let result = await deleteOption("date", { value: "05/12/" }, DutyInstance);
            expect(result).toEqual("invalid date format specfied 05/12/. Date should be specfied  in dd/mm/yyyy");
        });

        $it("should return a failed promise if type is hash but no hash was specified", async () => {
            let result = await deleteOption("hash", undefined, DutyInstance);
            expect(result).toEqual("hash value is required");
        });
        $it("should return a failed promise when hash is specified but hash length is lessthan 9", async () => {
            let result = await deleteOption("hash", { value: "12345" }, DutyInstance);
            expect(result).toEqual("hash length is suppose to be 9 but got 5");
        });
        $it("should return a failed promise when type is category but category type is not specified", async () => {
            let result = await deleteOption("category", undefined, DutyInstance);
            expect(result).toEqual("category type was not sepcified");
        });



        
        
        
        
    });
});
