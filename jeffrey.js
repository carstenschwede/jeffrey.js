var argv = require("./CommandLine");

var CONFIG = {
	audio: {
		levelDuration: 1,
		channels: 1,
		bitDepth: 16,
		sampleRate: 16000,
		tempDir: argv.tempDir,
		tempFile: argv.tempDir + "/jeffrey.tmp"
	},
	stt: {
		language: argv.lang,
		script: "./stt/google.sh"
	},
	tts: {
		language: argv.lang
	},
	plugins: {
		wikipedia: {},
		wolfram: {
			apikey: argv.wolframkey
		}
	}
};

CONFIG.data = {};
var Jeffrey = function(CONFIG) {
	var globalData = {};

	var Plugins = require("./Plugins")(CONFIG),
		Speaker = require("./Speaker")(CONFIG);

	var TextHandler = require("./TextHandler")(CONFIG,Plugins),
		SpeechRecognizer = require("./SpeechRecognizer")(CONFIG,{
			ready: function() {
				var response = "Jeffrey is ready";
				Speaker.speak({
					text: response,
					language: "en"
				},CONFIG.tts.language);
			},
			recognized: function(recognition,confidence) {
				console.log(recognition,"<-");
				var query = {
					text: recognition,
					language: CONFIG.stt.language
				};
				TextHandler(query,function(err,result) {
					if (err || !result) {
						Plugins.get("wolfram").action(query,function(err,response) {
							response = response || {
									text: "I dont't know",
									language: "en"
							}
							Speaker.speak(response,CONFIG.tts.language);
						});
					}
				})
			},
			startedListening: function() {
				//console.log("REC STARTED");
			},
			stoppedListening: function() {
				//console.log("REC STOPPED");
			}
		}
	);

	Speaker.onStartStop(function(isSpeaking) {
		if (isSpeaking)
			SpeechRecognizer.pause();
		else
			SpeechRecognizer.resume();
	});
};

Jeffrey(CONFIG);
