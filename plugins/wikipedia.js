var request = require("request");
var Translator = require("../Translator");

var Wikipedia = {
	load: function(config,callback) {
		this.config = config;
		callback();
	},
	action: function(query,callback) {
		Translator(query,"en",function(err,query) {
			var url = "http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryString="+encodeURIComponent(query.text)+"&MaxHits=1";
			request({
				url: url,
				headers: {
					"Accept": "application/json"
				}
			}, function(err,resp,body) {
				var result;
				var response = false;
				try {
					result = JSON.parse(body);
					if (result && result.results.length > 0) {
						var desc = result.results[0].description;
						desc = desc.replace(/\([^\)]+\)/g,"");
						var result = desc.match(/[a-z]\./);

						var desc = result ? desc.substr(0,result.index+1)+"." : desc;
						
						desc = desc.replace(/[\s\n]+/g," ");
						var response = {
							text: desc,
							language: "en"
						}
						callback(null,response);
					}
				} catch(e) {
					console.log(e,"Wikipedia Error",body);;
				}
			});
		});
	}
};

module.exports = Wikipedia;