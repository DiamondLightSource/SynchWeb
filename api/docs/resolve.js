var resolve = require('/usr/local/lib/node_modules/json-refs').resolveRefs;
var YAML = require('/usr/local/lib/node_modules/js-yaml');
var fs = require('fs');

var root = YAML.load(fs.readFileSync('spec.yaml').toString());
var options = {
  	filter        : ['relative', 'remote'],
  	loaderOptions : {
    	processContent : function (res, callback) {
      		callback(null, YAML.load(res.text));
    	}
  	}
};

resolve(root, options).then(function (results) {
  	fs.writeFile('dist/spec.json', JSON.stringify(results.resolved, null, 2), function(err) {
  		if (err) return console.log(err)
  	})
});
