	var fs = require("fs");
	var optimist = require('optimist')
		.usage("Jeffrey - Personal assistant\nExample: node jeffrey.js -l en")
		
		.options("l", {
			alias: "lang",
			describe: "Language used for Input/Output",
			demand: true
		})
		.options("d",{
			alias: "device",
			default: "plughw:1,0",
			describe: "audio hardware to be used"
		})
		.options("t", {
			alias: "tempDir",
			default: "/tmp",
			describe: "Directory used for tempory data",
		})
		.options("w", {
			alias:"wolframkey",
			describe: "Your API key from Wolfram Alpha"
		})
		.options("h", {
			alias: "help",
			describe: "prints this usage information"
		})

		.check(function(argv) {
			var fd;
			if (!fs.existsSync(argv.t)) throw ("Error:" + argv.t + " does not exist");
			try {
				fd = fs.openSync(argv.t + "/jeffrey.tmp", "w");
			} catch (e) {
				throw("Error:" + argv.t + " is not writeable");
			};
			fs.closeSync(fd);
		});

	var argv = optimist.argv;

	if (argv.help) {
		optimist.showHelp();
		process.exit(0);
	}

	module.exports = argv;