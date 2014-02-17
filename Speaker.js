
var exec = require("child_process").exec;
var Translator = require("./Translator");
var queue = [],isSpeaking = false;
var onStartStopListener = [], onStartStop = function() {
	onStartStopListener.forEach(function(callback) {
		callback(isSpeaking);
	});
}
var Speaker = function(CONFIG) {
	checkQueue = function() {
		if (!isSpeaking) {
			var obj = queue.shift();
			if (obj) {
				isSpeaking = true;
				onStartStop();
				exec("curl '" + obj.url + "' -H 'Pragma: no-cache' -H 'Accept-Encoding: identity;q=1, *;q=0' -H 'Host: translate.google.com' -H 'Accept-Language: de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36' -H 'Accept: */*' -H 'Cache-Control: no-cache' -H 'Referer: http://translate.google.com/translate_tts?tl="+obj.language+"&q=' -H 'Connection: keep-alive' -H 'Range: bytes=0-' --compressed | mpg321 -q -",function() {
					obj.callback();
					isSpeaking = false;
					onStartStop();
					checkQueue();
				});
			}
		}
	};

	return {
		speak: function speak(sentence,targetLanguage,callback) {
			sentence.text = sentence.text.trim();
			callback = callback || function() {};
			if (targetLanguage != sentence.language) {
				Translator(sentence,targetLanguage, function(err,translatedText) {
					if (err) {
						console.log(err);
						return;
					}
					speak(translatedText,targetLanguage, callback);
				});
				return;
			}


			if (sentence.text.length > 99) {
				//console.log("Only reading first 99 characters");
				sentence.text = sentence.text.substr(0,99);
			}

			var url = "http://translate.google.com/translate_tts?tl="+targetLanguage+"&q="+encodeURIComponent(sentence.text);
			url = url.replace(/\'/g,"");
			console.log(sentence.text,"->");
			queue.push({
				url: url,
				callback: callback,
				language: targetLanguage
			});
			checkQueue();
		},
		onStartStop: function(callback) {
			onStartStopListener.push(callback);
		}
	};
};
module.exports = Speaker;