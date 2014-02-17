var fs = require("fs"),async = require("async");
var Plugins = function(CONFIG,callback) {
	callback = callback || function() {};
	var obj = {
		container: {},
		load: function(names,callback) {
			names = typeof(names) == "string" ? [names] : names;
			callback = callback || function() {};
			var self = this;
			async.each(names,function(name,next) {
				var path = "./plugins/"+name;
				if (!fs.existsSync(path+".js")) {
					console.log("Plugin %s not found",name);
					next(name+" not found");
					return;
				}
				var plugin = require(path);
				plugin.name = name;

				var pluginConfig = CONFIG.plugins[name] || {};
				self.container[name] = plugin;
				self.container[name].load(pluginConfig,function() {
					console.log("Plugin loaded",name);
					next();
				});
			},callback);
		},
		get: function(name) {
			var plugin = this.container[name] || {
				action: function(query,callback) {
					callback("Plugin " + name + "is not loaded");
				}
			};
			return plugin;
		}
	};
	obj.load(Object.keys(CONFIG.plugins),callback);
	return obj;
};
module.exports = Plugins;