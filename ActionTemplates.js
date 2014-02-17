	
	var CleverBot = require("./cleverbot");
	var timeToText = require("./timeToText");
	var ActionTemplates = function(CONFIG,Plugins) {
		return {
			"wiki": {
				"languages": {
					"en": {
						"tell [\\w\\s]* about (.+)": "$text"
					},
					"de": {
						"erzähle* [\\w\\s]* über (.+)": "$text"
					}
				},
				"cmd": function(match,language,respond) {
					Plugins.get("wikipedia").action({
						text: match[1],
						language: language
					},respond);
				}
			},
			"time": {
				"languages": {
					"de": {
						"wie spät|wieviel uhr": "$hours Uhr $minutes",
						"tag \\w+ heute": function(result,callback) {
							var dayOfWeek = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"][result.dateObj.getDay()];
							var dayOfMonth = result.dateObj.getDate();
							callback(dayOfWeek + " der " + dayOfMonth + "te");
						}
					},
					"en": {
						"what time is it": function(result,callback) {
							callback(timeToText(result.dateObj));
						},
						"day \\w+ today": function(result,callback) {
							var dayOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][result.dateObj.getDay()];
							var dayOfMonth = result.dateObj.getDate();
							var suffix = "th";
							if (dayOfMonth == 1) suffix = "st";
							if (dayOfMonth == 2) suffix = "nd";
							if (dayOfMonth == 3) suffix = "rd";
							
							callback(dayOfWeek + " the " + dayOfMonth + suffix);
						}
					}
				},
				"cmd": function(match,language,respond) {
					var now = new Date();
					respond(null,{
						dateObj: now,
						hours: now.getHours(),
						minutes: now.getMinutes(),
					})
				}
			},
			"chatStart": {
				"languages": {
					"en": {
						"you [\\w\\s]+chat": "$text"
					},
					"de": {
						"unterhalten": "Worüber möchtest du dich unterhalten?"
					}
				},
				"cmd": function(match,language,respond) {
					if (CONFIG.data.chat) {
						respond(true);
						return;
					}

					CONFIG.data.chat = new CleverBot();
					CONFIG.data.chat.think(match.input, function(response) {
						respond(null,{
							text:response,
							language: "en"
						})
					});
				}
			},
			"chatStop": {
				"languages": {
					"en": {
						"bye|good\\s*bye|good night": "$text"
					}
				},
				"cmd": function(match,language,respond) {
					if (!CONFIG.data.chat) {
						respond(true);
						return;
					}
					
					CONFIG.data.chat.think(match.input, function(response) {
						respond(null,{
							text:response,
							language: "en"
						})
					});
					delete CONFIG.data.chat;
				}
			},
			"chat": {
				"languages": {
					"en": {
						".*": "$text"
					}
				},
				"cmd": function(match,language,respond) {
					if (!CONFIG.data.chat) {
						respond(true);
						return;
					}

					CONFIG.data.chat.think(match.input, function(response) {
						respond(null,{
							text:response,
							language: "en"
						})
					});
				}
			}
		}
	};

	module.exports = ActionTemplates;
