
const path = require("path");
const { appendOption, addOption, isExists, node_env } = require("../src/utils.js");

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
            notification: true,
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

                    expect(result).toEqual(jasmine.any(Object));
                    done();
                });
        });

        it("should not add todo for already existing todos", done => {
            addOption("hello world",undefined,DutyInstance)
                .then( result => {

                    expect(result).toEqual("failed");

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
                    expect(result.category).toEqual(jasmine.arrayContaining(["greetings","earthlings"]));
                    done();
                });
        });

        it("should not add todo for already existing todos", done => {
            addOption("hello earthlings",category,DutyInstance)
                .then( result => {
                    expect(result).toEqual("failed");
                    expect(Object.keys(parsedConfig.todoGroup).length).toEqual(2);
                    done();
                });
        });
    });

    describe("appending a todo", () => {
        // 402fa814b15f892d898ecf6d1c903fe2899018b46caf9c92ea1cb1e3719bbf86
        it("should return a failed promise, if hash length is not greater than 9", done => {
            
            appendOption("402fa"," ---",DutyInstance)
                .then( result => {
                    expect(result).toEqual("failed");
                    done();
                })
        });
        it("should return a failed promise, if the specified hash value is not found", done => {
            appendOption("8a27b264090c4", " --- ", DutyInstance)
                .then( result => {
                    expect(result).toEqual("failed");
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
        })
    })
    
});