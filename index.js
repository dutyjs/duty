const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

try {

	const config = require('./config.json');

	const config_locationContent = require(config.location);

	let { location } = config;

	module.exports = require('./duty.js')({config_locationContent,location});


} catch(ex) {

	; ( () => {
		const rl = require('readline');
		const DEFAULT = `${process.env.HOME}/.duty.json`;
		const notification = true;
		const timeout = 60000;

		const interface = rl.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		function askQuestion(question) {
			return new Promise((resolve) => {
				interface.question(question, answer => resolve(answer) );
			});
		}

		async function _f() {

			try {

				let answer = await askQuestion(
					`default todo location not found, use \"${DEFAULT}\" as default (y/n) `
					), obj;

				switch(answer) {
					case 'y':

					interface.close();

					obj = { location: DEFAULT, notification, timeout};

					fs.writeFileSync(DEFAULT, "{}");

					fs.writeFileSync("./config.json", JSON.stringify(obj));

					module.exports = require('./duty.js')(DEFAULT);

					break;
					case 'n':

					answer = await askQuestion(
						`specify a location to save the information: `
						);

					interface.close();

					if ( answer.length === 0 ) {
						console.error(`invalid input specified\n`);
						return ;
					} else {

						mkdirp.sync(answer.substr(0,answer.lastIndexOf(path.sep)));

						obj = { location: answer + ".json", notification, timeout};

						fs.writeFileSync(obj.location, "{}");

						fs.writeFileSync("./config.json", JSON.stringify(obj));

						module.exports = require('./duty.js')(answer);

						return ;

					}
					break;
					default:
					_f();

				}


			} catch(ex) {
				console.log(ex);
			}

		};

		_f();

	})();
}
