// Custom plotly loader to manage build sizes.
// Add chart types required here
var Plotly = require('plotly.js/lib/core');

// Load in the trace types for line/scatter plots
// Extend with other plot types as required...
Plotly.register([
    require('plotly.js/lib/scatter'),
    require('plotly.js/lib/histogram'), // used by EM / Ice Breaker
    // require('plotly.js/lib/bar'),
]);

module.exports = Plotly;
