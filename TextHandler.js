var Translator = require("./Translator");
var async =require("async");
var TextHandler = function(CONFIG,Plugins) {
	var Speaker = require("./Speaker")(CONFIG);
	var ActionTemplates = require("./ActionTemplates")(CONFIG,Plugins);
	var regexps = [];
	Object.keys(ActionTemplates).forEach(function(actionLabel) {
		var action = ActionTemplates[actionLabel];
		var regExpStrs = action.languages[CONFIG.stt.language];
		if (!regExpStrs) return;

		Object.keys(regExpStrs).forEach(function(regExpStr) {
			var regexp = new RegExp(regExpStr,"i");
			var handle = typeof(regExpStrs[regExpStr]) == "function" ? regExpStrs[regExpStr] : function(result,callback) {
				var str = regExpStrs[regExpStr];
				var varNames = str.match(/\$\w+/g);
				varNames.forEach(function(varName) {
					str = str.replace(varName,result[varName.substr(1)]);
				});
				callback(str);
			};
			regexps.push({
				//REGEXP
				r:regexp,

				//ACTION
				a: function(callback,match) {
					action.cmd(match,CONFIG.stt.language,function(err,result) {
						if (err) {
							/*
							Speaker.speak({
								text: "Error:" + err,
								language: "en"
							});
							*/
							callback(err);
							return;
						}
						var go = function(result) {
							handle(result,function(text) {
								Speaker.speak({
									text: text,
									language: CONFIG.stt.language
								},CONFIG.tts.language);
								callback(null,text);
							});
						};
						if (result.text && result.language) {
							Translator(result,CONFIG.stt.language, function(err,result) {
								go(result);
							});
						} else {
							go(result)
						}
					})
				}
			});
		});
	});

	return function(query,callback) {
		var found = false;
		async.eachSeries(regexps,function(regexp,next) {
			if (found) {
				next();
				return;
			}
			var match = query.text.match(regexp.r);
			if (match) {
				regexp.a(function(err,result) {
					if (!err && result) {
						found = true;
						callback(null,result);
					}
					next();
				},match);
			} else {
				next();
			}
		},function() {
			if(!found)
				callback(true);
		});
	}
};

module.exports = TextHandler;