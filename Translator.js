var request = require("request");
var Translator = function(query,tl,callback) {
	if (!query.language) {
		console.trace();
		return;
	}
	if (query.language == tl) {
		callback(null,query);
		return;
	};

	request({
		url: "http://translate.google.com/translate_a/t?client=t&sl="+query.language+"&tl="+tl+"&hl=de&sc=2&ie=UTF-8&oe=UTF-8&oc=1&otf=2&ssel=0&tsel=0&q=" + encodeURIComponent(query.text),
		headers: {
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36"
		}
	}, function(err,resp,body) {
		if (err) {
			callback("ERROR");
			return;
		}
		body = body.replace(/[,]+/g,",");
		var obj = {};
		try {
			obj = JSON.parse(body);
			result = obj[0][0][0];
			callback(null,{
				text:result,
				language: tl
			});
		} catch(e) {
			callback("JSON ERROR",body);
		}
	})
}

module.exports = Translator;