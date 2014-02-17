var Translator = require("../Translator");

var wolfram = {
	data: {},
	load: function(config,callback) {
		this.data.api = require('wolfram-alpha').createClient(config.apikey,{
			reinterpret: true,
			translation: false
		});
		callback();
	},
	action: function(query,callback) {
		var self = this;
		Translator(query,"en",function(err,query) {
			self.data.api.query(query.text, function (err, result) {
				if (err) {
					callback(err);return;
				}

				if (result && result.length > 1) {
					response = result[1].subpods[0].text;
					response = response.replace(/km\^2/ig,"square kilometer");
					response = response.replace(/\×10\^6/ig," million")
					response = response.replace(/\×10\^9/ig," billion")
					response = response.replace(/\×10\^12/ig," trillion")
					if (response.match(/[0-9a-f]+_\d+/)) {
						response = response.substr(0,response.indexOf("_")).split("").join(" ");
					}
					
					var result = response.match(/[a-z]\./);
					response = result ? response.substr(0,result.index+1) +"." : response;
					response = response.replace(/\([^\)]+\)/g,"");

					callback(null,{
						text: response,
						language: "en"
					});
				} else {
					callback("NO RESULTS");
				}
			});
		});
	}
}

module.exports = wolfram;