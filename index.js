const fs = require("fs");
const path = require("path");
// const mkdirp = require('mkdirp');
const { homedir }  = require("os");

const confLocation = path.join(homedir(), ".duty.config.json");

if ( ! fs.existsSync(confLocation) ) fs.writeFileSync(confLocation,"{}");

function isCFGLocation(location) {
  return fs.existsSync(location);
}

try {

  const config = require(confLocation);
    
  const envLocation = process.env.DUTY_TODO;
    
  if ( envLocation && fs.existsSync(envLocation) ) {

    config.location = envLocation;
        
  } else if ( envLocation && ! fs.existsSync(envLocation) ) {
        
    fs.writeFileSync(envLocation, JSON.stringify({}));

    config.location = envLocation;
        
  }

  config.todoGroup = require(config.location);


  module.exports = new(require("./src/duty.js"))(config);


} catch (ex) {
  // if ( process.env.NODE_ENV === "development" ) {
  //     console.log(ex);
  // }
  console.log(ex);
  ;
  (() => {
    const rl = require("readline");
    const DEFAULT = `${path.join(homedir(), ".duty.json")}`;
        
    const _interface = rl.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    function askQuestion(question) {
      return new Promise((resolve) => {
        _interface.question(question, answer => resolve(answer));
      });
    }

    async function _f() {

      try {

        let answer = await askQuestion(
            `default todo location not found, use \"${DEFAULT}\" as default (y/n) `
          ),
          config;


        switch (answer) {
        case "y":

          _interface.close();

          config = {
            location: DEFAULT
          };

          if ( ! isCFGLocation(config.location) )
            fs.writeFileSync(config.location, "{}");

          fs.writeFileSync(confLocation, JSON.stringify(config));

          module.exports = new(require("./src/duty.js"))(config);

          break;
        case "n":

          answer = await askQuestion(
            "specify a directory to save the todos "
          );

          _interface.close();

          if (answer.length === 0) {
            console.error("invalid input specified\n");
            break;
          }

          // mkdirp.sync(answer.substr(0, answer.lastIndexOf(path.sep)));

          if ( ! fs.existsSync(answer) ) {
            console.error(`${answer} does not exists`);
            return ;
          } else {
            config = {
              location: `${path.join(answer, ".duty.json")}`
            };
          }

          if ( ! isCFGLocation(config.location) )
            fs.writeFileSync(config.location, "{}");
                    
          fs.writeFileSync(confLocation, JSON.stringify(config));

          module.exports = new(require("./src/duty.js"))(config);

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
