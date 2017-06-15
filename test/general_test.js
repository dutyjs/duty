/* eslint-disable */

const path = require("path");
const cliTest = require('./cli_test.js');
const addTest = require('./add_todo_test.js');

describe("#duty test", () => {
    let fs,  test_config, test_config2, _test
    beforeEach(() => {

        fs = require('fs'),
        test_config = path.join(__dirname,"test_config.json"),
        test_config2 = path.join(__dirname, "test_config2.json"),
        _test = path.join(__dirname, ".test.json");

        fs.writeFileSync(test_config, JSON.stringify({
            location: "not_valid_location"
        }))

        fs.writeFileSync(_test, JSON.stringify({}));

        fs.writeFileSync(test_config2, JSON.stringify({
            location: _test
        }))
        

    });

    afterEach(() => {
        fs.unlinkSync(test_config);
        fs.unlinkSync(_test);

        test_config = undefined;
        test_config2 = undefined;
        _test = undefined;
        fs = undefined;
    })

    describe("#cli test", () => {
        cliTest();        
    });
    
    describe("#add_todo test", () => {
        addTest(test_config2);
    });

})