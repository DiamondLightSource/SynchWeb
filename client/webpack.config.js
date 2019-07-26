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
      marionette: 'backbone.marionette/lib/backbone.marionette.min',

      'jquery.touchswipe': 'jquery-touchswipe',
      'jquery.ui': 'jquery-ui', // Only required for timepicker-addon 1.5.5 apparently!
      'jquery-ui.timepicker': 'jquery-ui-timepicker-addon', // Need to update timepicker css to avoid showing microseconds/milliseconds
      'jquery-ui.combobox': 'vendor/jquery/jquery-ui.combobox', // Not the official combobox extension from npm but a collection of extensions

      // 'jquery.flot': 'vendor/flot/jquery.flot.min', // NPM
      'jquery.flot.resize': 'jquery-flot-resize', // NPM Older version 1.0.0 2012 instead of 2013
      // 'jquery.flot.resize': 'vendor/flot/jquery.flot.resize',
      'jquery.flot.pie': 'flot-pie',
      // 'jquery.flot.pie': 'vendor/flot/jquery.flot.pie',
      'jquery.flot.time': 'vendor/flot/jquery.flot.time.min',
      'jquery.flot.selection': 'vendor/flot/jquery.flot.selection',
      'jquery.flot.stack': 'vendor/flot/jquery.flot.stack',

      'jquery.flot.tickrotor': 'vendor/flot/jquery.flot.tickrotor',
      // 'jquery.flot.tooltip': 'vendor/flot/jquery.flot.tooltip', // NPM
      'jquery.flot.axislabels': 'flot-axislabels',
      // 'jquery.flot.axislabels': 'vendor/flot/jquery.flot.axislabels',
      
      // We can't currently use the magnific-popup from npm e.g.:
      // 'jquery.mp': 'magnific-popup',
      // The vendor library has been modified to append proposal to the request
      // Hence the vendor magnific-popup has a dependency on our utils/xhrimage
      'jquery.mp': 'vendor/jquery/jquery.magnific-popup',

      // jeditable provided by NPM.
      'jquery.editable': 'jquery-jeditable/dist/jquery.jeditable.min',
      'jquery.editable.datepicker': 'jquery-jeditable/dist/jquery.jeditable.datepicker.min',
  
      'jquery.color': 'jquery-color',
      
      // Canvas Mix in class..
      // canvas: 'utils/canvas',

      // Caman npm depends on fibers, canvas, fs which we don't wont...
      caman: 'vendor/caman.min',

      // heatmap in npm has dependency on canvas/node-gyp... so use old one for now
      heatmap: 'vendor/hmap',
      
      // gunzip is actually the zlib library
      // https://npm.taobao.org/package/zlibjs
      gzip: 'zlibjs/bin/gunzip.min',

      markdown: 'markdown/lib/markdown',

      highmaps: 'highcharts/highmaps',
      'highmaps-world': '@highcharts/map-collection/custom/world',
      // 'highmaps-world': 'vendor/highmaps/world',

      // Move these to npm installs once working
      vue: 'vue/dist/vue.min',
      veevalidate: 'vee-validate',
      // promise: 'vendor/vue/polyfill.min',
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
      },
      // We need to help Caman load properly
      // Caman adds to the window object within a browser
      // The import loader ensures it it recognised as browser env not NodeJS
      {
        test: /caman\.min\.js$/,
        use: "imports-loader?exports=>undefined,require=>false,this=>window"
      },
      // {
      //   test: /gunzip\.min\.js$/,
      //   use: "imports-loader?exports=>undefined,require=>false,this=>window"
      // }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
       $: "jquery",
        jQuery: "jquery",
        _: "underscore",
        "window.jQuery": "jquery",
        Highcharts: "highmaps"
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
