/* eslint-disable */
const cli = require('../cli.js');


module.exports = () => {
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
};


