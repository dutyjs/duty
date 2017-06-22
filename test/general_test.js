
const path = require("path");
const { dueOption, readOption, removenoteOption, noteOption, markCompletedOption, replaceOption, appendOption, addOption, isExists, node_env } = require("../src/utils.js");
const crypto = require("crypto");
const moment = require("moment");
const ReadTodo = require("../src/readtodo.js");

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
                    expect(result).toEqual("invalid date format specfied 2017/12/12. Date should be specfied  in mm/dd/yy");
                    done();
                });
        });
        it("should set the due date of a todo when all requirements are met", done => {

            dueOption("b9b2839a75e400d56ca5e","10/15/2017",DutyInstance)
                .then( result => {
                    const { due_date } = result;
                    expect(due_date).toBeDefined();
                    expect(due_date).toEqual("10/15/2017");
                    done();
                });
        });
        it("should return a failed promise if a hash value was not found", done => {
            dueOption("b39543fe2c3458a", "10/15/2017", DutyInstance)
                .then( result => {
                    expect(result).toEqual("hash was not found");
                    done();
                });
        });
    });
    describe("reading of todos", () => {
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

        describe("reading notificatons", () => {
            let handleNotification, loopNotification;
            beforeEach( done => {
                let main_key;

                handleNotification = (type) => {
                    addOption("without notificaton", undefined, DutyInstance)
                        .then( result => {
                            const { todoGroup } = parsedConfig;
                            
                            for ( let [key,val] of Object.entries(todoGroup) )
                                DutyInstance.set_notify(key, { notification: type, timeout: 3000});
                        });
                };

                loopNotification = (result,type) => {
                    for ( let i of result ) {
                        let { notification } = i;
                        expect(notification).toEqual(type);
                    }
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
                        loopNotification(result,"yes");
                        done();
                    });
            });
            it("should return a no notificaton for todos", done => {
                handleNotification("no");
                readOption("notification", undefined, DutyInstance)
                    .then( result => {
                        expect(result).toEqual(jasmine.any(Array));
                        loopNotification(result,"no");
                        done();
                    });                
            });
        });
        describe("reading todo by evaluating strings", () => {
            beforeEach( done => {
                addOption("Hello adding new todo",undefined,DutyInstance)
                    .then( result => {
                        const { hash } = result;
                        dueOption(hash,moment().add(2, "days").format("MM/DD/YYYY"), DutyInstance)
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
    });

});