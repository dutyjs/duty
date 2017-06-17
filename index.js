const fs = require('fs');
const path = require('path');
// const mkdirp = require('mkdirp');
const os = require('os');
try {

    const config = require('./config.json');

    Object.assign(config, {
        todoGroup: require(config.location)
    })

    module.exports = new(require('./src/duty.js'))(config);


} catch (ex) {
    // if ( process.env.NODE_ENV === "development" ) {
    //     console.log(ex);
    // }
    ;
    (() => {
        const rl = require('readline');
        const DEFAULT = `${path.join(os.homedir(), ".duty.json")}`;
        const notification = true;
        const timeout = 60000;

        const interface = rl.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        function askQuestion(question) {
            return new Promise((resolve) => {
                interface.question(question, answer => resolve(answer));
            });
        }

        async function _f() {

            try {

                let answer = await askQuestion(
                        `default todo location not found, use \"${DEFAULT}\" as default (y/n) `
                    ),
                    config;


                switch (answer) {
                    case 'y':

                        interface.close();

                        config = {
                            location: DEFAULT,
                            notification,
                            timeout
                        };

                        fs.writeFileSync(config.location, "{}");

                        fs.writeFileSync("./config.json", JSON.stringify(config));

                        module.exports = new(require('./src/duty.js'))(config);

                        break;
                    case 'n':

                        answer = await askQuestion(
                            `specify a directory to save the todos `
                        );

                        interface.close();

                        if (answer.length === 0) {
                            console.error(`invalid input specified\n`);
                            break;
                        }

                        // mkdirp.sync(answer.substr(0, answer.lastIndexOf(path.sep)));

                        if ( ! fs.existsSync(answer) ) {
                            console.error(`${answer} does not exists`);
                            return ;
                        }
                        
                        config = {
                            location: `${path.join(answer, ".duty.json")}`,
                            notification,
                            timeout
                        };

                        fs.writeFileSync(config.location, "{}");

                        fs.writeFileSync("./config.json", JSON.stringify(config));

                        module.exports = new(require('./src/duty.js'))(config);

                        break;
                    default:
                        _f();

                }


            } catch (ex) {
                console.log(ex);
            }

        };

        _f();

    })();
}