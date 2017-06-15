/* eslint-disable */

const cli = require('../cli.js');
const path = require("path");

describe("#cli test", () => {
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
        _test = undefined;
        fs = undefined;
    })

    it("should print out an error message if bad config  file is passed", () => {
        expect(cli("/configf.json")).toEqual("error while reading config file")
    });

    it("should print out Enjoy... for valid config file", () => {
        expect(cli("/config.json")).toEqual("Enjoy...");
    })
    it("should print out an error message if location property filedoes not existws", () => {
        expect(cli("./test/test_config.json")).toEqual("error while reading config file");
    });

    it("should print out Enjoy... if the location property file exists", () => {
        expect(cli("./test/test_config2.json")).toEqual("Enjoy...");
    })

})