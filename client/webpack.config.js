const path = require('path');
const webpack = require("webpack");
const GitRevisionPlugin = require('git-revision-webpack-plugin')

module.exports = {
  entry: {
      main: './js/main.js',
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'assets/js', '[git-revision-hash]'),
    publicPath: '/assets/js/[git-revision-hash]/'
  },
  resolve: {
    alias: {
      underscore: 'vendor/underscore.min',
      backbone: 'vendor/backbone/backbone',
      marionette: 'vendor/backbone/backbone.marionette',
      'backbone.paginator': 'vendor/backbone/backbone.paginator',
      'backbone-validation': 'vendor/backbone/backbone-validation',
      backgrid: 'vendor/backbone/backgrid',
      'backgrid-paginator': 'vendor/backbone/backgrid-paginator',
      'backgrid-select-all': 'vendor/backbone/backgrid-select-all',
      'backbone.syphon': 'vendor/backbone/backbone.syphon',
      
      'jquery': 'jquery',
      'jquery-ui': 'vendor/jquery/jquery-ui.min',

      'jquery.cookie': 'vendor/jquery/jquery.cookie',

      'jquery.touchswipe': 'vendor/jquery/jquery.touchSwipe',      
      'jquery-ui.combobox': 'vendor/jquery/jquery-ui.combobox',
      'jquery-ui.timepicker': 'vendor/jquery/jquery-ui.timepicker-addon',
      
      'jquery.flot': 'jquery.flot',
      'jquery.flot.resize': 'jquery.flot/jquery.flot.resize',
      'jquery.flot.pie': 'jquery.flot/jquery.flot.pie',
      'jquery.flot.time': 'jquery.flot/jquery.flot.time',
      'jquery.flot.selection': 'jquery.flot/jquery.flot.selection',
      'jquery.flot.stack': 'jquery.flot/jquery.flot.stack',

      'jquery.flot.tickrotor': 'vendor/flot/jquery.flot.tickrotor',
      'jquery.flot.tooltip': 'vendor/flot/jquery.flot.tooltip',
      'jquery.flot.axislabels': 'vendor/flot/jquery.flot.axislabels',
      
      'jquery.mp': 'vendor/jquery/jquery.magnific-popup',
      
      'jquery.editable': 'vendor/jquery/jquery.jeditable.min',
      'jquery.editable.datepicker': 'vendor/jquery/jquery.jeditable.datepicker',
  
      'jquery.color': 'vendor/jquery/jquery.color',
      
      // Not convinced..
      canvas: 'utils/canvas',

      caman: 'vendor/caman.min',
      fibers: 'vendor/caman.min',
      fs: 'vendor/caman.min',
      heatmap: 'vendor/hmap',
      
      gzip: 'vendor/gunzip.min',
      
      markdown: 'vendor/markdown',
  
      three: 'vendor/three.min',
      uglymol: 'vendor/uglymol',
  
      // moment: 'vendor/moment',
  
      highmaps: 'vendor/highmaps/highmaps',
      'highmaps-world': 'vendor/highmaps/world',

      // Move these to npm installs once working
      vue: 'vendor/vue/vue.min',
      veevalidate: 'vendor/vue/vee-validate.min',
      promise: 'vendor/vue/polyfill.min',
    },
    modules: [
      path.resolve(__dirname, 'js'),
      path.resolve(__dirname, 'node_modules'),      
    ]
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'underscore-template-loader',
            options: {
              engine: 'underscore',
            }
          }
        ]
      },
      {
        test: /\.json$/,
        use: 'raw-loader',
        exclude: /config\.json$/,
      },
      {
        test: /\.xml$/,
        use: [
          {
            loader: 'raw-loader',
          }
        ]
      }    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
       $: "jquery",
        jQuery: "jquery",
        _: "underscore",
    }),	
    new GitRevisionPlugin({
      commithashCommand: 'rev-parse --short HEAD'
    }),
  ]
}
