var Styles = require('main.scss')
var FontAwesome = require('font-awesome/css/font-awesome.css')
const config = require('./js/config.json')

// With Webpack we use the maintenance flag in config.json
// to modify the main index page. Checking the flag here prevents the
// main js bundle from loading resources we don't need.
require(['app'], function(app) {
    "use strict"
    if ( !config.maintenance ) {
      app.start()
    }
  })
  