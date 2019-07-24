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
      
      'jquery.flot': 'vendor/flot/jquery.flot.min',
      'jquery.flot.resize': 'vendor/flot/jquery.flot.resize',
      'jquery.flot.pie': 'vendor/flot/jquery.flot.pie',
      'jquery.flot.time': 'vendor/flot/jquery.flot.time.min',
      'jquery.flot.selection': 'vendor/flot/jquery.flot.selection',
      'jquery.flot.stack': 'vendor/flot/jquery.flot.stack',

      'jquery.flot.tickrotor': 'vendor/flot/jquery.flot.tickrotor',
      'jquery.flot.tooltip': 'vendor/flot/jquery.flot.tooltip',
      'jquery.flot.axislabels': 'vendor/flot/jquery.flot.axislabels',
      
      // We can't currently use the magnific-popup from npm e.g.:
      // 'jquery.mp': 'magnific-popup',
      // The vendor library has been modified to append proposal to the request
      // Hence the vendor magnific-popup has a dependency on our utils/xhrimage
      'jquery.mp': 'vendor/jquery/jquery.magnific-popup',

      // jeditable provided by NPM.
      'jquery.editable': 'jquery-jeditable/dist/jquery.jeditable.min',
      'jquery.editable.datepicker': 'jquery-jeditable/dist/jquery.jeditable.datepicker.min',
  
      'jquery.color': 'vendor/jquery/jquery.color',
      
      // Canvas Mix in class..
      // canvas: 'utils/canvas',

      // Caman npm depends on fibers, canvas, fs which we don't wont...
      caman: 'vendor/caman.min',

      // heatmap in npm has dependency on canvas/node-gyp... so use old one for now
      heatmap: 'vendor/hmap',
      
      // gunzip is actually the zlib library
      gzip: 'vendor/gunzip.min',
        
      // highmaps: 'vendor/highmaps/highmaps',
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
