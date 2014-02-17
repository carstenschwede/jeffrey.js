
var spawn = require("child_process").spawn,
	exec = require("child_process").exec;

var SpeechRecognizer = function(CONFIG,callbacks) {
	var paused = 0;
	//	callback("Wie alt ist Barack Obama?");return;
	var isSpeaking = false;
	var audiorecord = spawn("arecord",("-D plughw:1,0 -t raw -r " + CONFIG.audio.sampleRate + " -c "+CONFIG.audio.channels+" -f S16_LE -V mono " + CONFIG.audio.tempFile).split(" "));
	audiorecord.on('close', function (code, signal) {
		console.log('child process terminated due to receipt of signal '+signal);
	});

	var silenceTimer = false;
	audiorecord.stdout.on("data", function(stdout) {
		//console.log("PAUSED",paused);
		if (paused > 0) return;
		var stdout = stdout.toString();
		var l = stdout.length;

		if (stdout.substr(-1) == "%") {
			var value = parseInt(stdout.substr(-4));
			if (value > 1) {
				silenceTimer = clearTimeout(silenceTimer);
				if (!isSpeaking) {
					callbacks.startedListening();
					isSpeaking = +(new Date());
					//callback(value);
				}
			} else {
				if (isSpeaking) {
					var speakDuration = (+(new Date()) - isSpeaking)/1000;
					if (speakDuration < 1.0) return;
					silenceTimer = silenceTimer || setTimeout(function() {
						isSpeaking = false;
						callbacks.stoppedListening();
						speakDuration+=1.0;
						var bytes = Math.floor(speakDuration * CONFIG.audio.sampleRate * CONFIG.audio.bitDepth * CONFIG.audio.channels / 8);
		
						var cmd = "tail -c " + bytes + " " + CONFIG.audio.tempFile + " | " + CONFIG.stt.script + " " + CONFIG.stt.language + " " + CONFIG.audio.tempDir;
						exec(cmd,function(err,stdout,stderr) {
		
							if (err) {
								console.log("Error",err,stderr);
								return;
							}
							if (stdout && stdout.length > 0) {
								var obj = {};
								try {
									obj = JSON.parse(stdout);
								} catch(e) {
									console.log("unable to parse",stdout);
									return;
								}
								if (obj.status == 0 && obj.hypotheses && obj.hypotheses.length > 0) {
									var bestMatch = obj.hypotheses[0];
									callbacks.recognized(bestMatch.utterance, bestMatch.confidence);
								} else {
									console.log("no google results")
								}
							}
							//console.log(err,stdout,stderr);
						});
					},150);
				}
			}
		}
		//console.log("stdout",stdout.toString());
	});

	audiorecord.stderr.on("data", function(stderr) {
		if (stderr.toString().indexOf("Recording") > -1) {
			setTimeout(callbacks.ready,1000);
			return;
		}
		console.log("ERR",stderr.toString());
	});

	return {
		pause: function() {
			paused++;
		},
		resume: function() {
			setTimeout(function() {
				paused--;
			},300);
		}
	}
};

module.exports = SpeechRecognizer;