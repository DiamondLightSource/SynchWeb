const path = require('path');
const webpack = require("webpack");
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
      main: './src/index.js',
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist', '[git-revision-hash]'),
    publicPath: '/dist/[git-revision-hash]/'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    }
  },
  resolve: {
    alias: {
      // underscore: 'vendor/underscore.min',
      // backbone: 'vendor/backbone/backbone',
      marionette: 'backbone.marionette/lib/backbone.marionette.min',
      // 'backbone.paginator': 'vendor/backbone/backbone.paginator',
      // 'backbone-validation': 'vendor/backbone/backbone-validation',
      // backgrid: 'vendor/backbone/backgrid',
      // 'backgrid-paginator': 'vendor/backbone/backgrid-paginator',
      // 'backgrid-select-all': 'vendor/backbone/backgrid-select-all',
      // 'backbone.syphon': 'vendor/backbone/backbone.syphon',
      
      'jquery': 'vendor/jquery/jquery-1.9.1.min',
      'jquery-ui': 'vendor/jquery/jquery-ui.min',

      'jquery.cookie': 'vendor/jquery/jquery.cookie',

      'jquery.touchswipe': 'vendor/jquery/jquery.touchSwipe',      
      'jquery-ui.combobox': 'vendor/jquery/jquery-ui.combobox',
      'jquery-ui.timepicker': 'vendor/jquery/jquery-ui.timepicker-addon',
      
      'jquery.flot': 'vendor/flot/jquery.flot.min',
      'jquery.flot.resize': 'vendor/flot/jquery.flot.resize',
      'jquery.flot.pie': 'vendor/flot/jquery.flot.pie',
      'jquery.flot.time': 'vendor/flot/jquery.flot.time.min',
      'jquery.flot.selection': 'vendor/flot/jquery.flot.selection',
      'jquery.flot.stack': 'vendor/flot/jquery.flot.stack',

      'jquery.flot.tickrotor': 'vendor/flot/jquery.flot.tickrotor',
      'jquery.flot.tooltip': 'vendor/flot/jquery.flot.tooltip',
      'jquery.flot.axislabels': 'vendor/flot/jquery.flot.axislabels',
      
      'jquery.mp': 'vendor/jquery/jquery.magnific-popup',
      
      'jquery.editable': 'vendor/jquery/jquery.jeditable.min',
      'jquery.editable.datepicker': 'vendor/jquery/jquery.jeditable.datepicker',
  
      'jquery.color': 'vendor/jquery/jquery.color',
      
      // Canvas Mix in class..
      // canvas: 'utils/canvas',

      // Moved Caman to npm
      // caman: 'vendor/caman.min',
      // fibers included as a dependency of caman through npm
      // using newer version as old (6 years) 1.0.1 not compatible with v8

      heatmap: 'vendor/hmap',
      
      gzip: 'vendor/gunzip.min',
      
      markdown: 'vendor/markdown',
  
      three: 'vendor/three.min',
      uglymol: 'vendor/uglymol',
  
      // moment: 'vendor/moment',
  
      // highmaps: 'vendor/highmaps/highmaps',
      // 'highmaps-world': 'vendor/highmaps/world',

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
  node: {
    fs: 'empty',
    child_process: 'empty',
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
        ],
        exclude: [
          path.resolve(__dirname, 'js/templates/vue')
        ]
      },
      {
        test: /\.xml$/,
        use: [
          {
            loader: 'raw-loader',
          }
        ]
      },
      {
        test: /vue\/.+\.html/,
        use: [
          {
            loader: 'raw-loader',
          }
        ]
      }    
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
       $: "jquery",
        jQuery: "jquery",
        _: "underscore",
    }),
    // This generates a short (8 char) git hash used for build paths
    new GitRevisionPlugin({
      commithashCommand: 'rev-parse --short HEAD'
    }),
    // This builds an index.php file from the src template
    new HtmlWebpackPlugin({
      title: 'SynchWeb Webpack',
      filename: path.resolve(__dirname, 'index.php'),
      template: 'src/index.php',
    }),
  ]
}
