const path = require('path');
const webpack = require("webpack");
const childProcess = require('child_process')
// As of v3.0.3 GitRevisionPlugin does not work with MiniCssExtractPlugin
// const GitRevisionPlugin = require('git-revision-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// These steps remove the need for a separate plugin to set the githash
const gitHashLength = 8
const gitHash = childProcess.execSync('git rev-parse --short HEAD').toString().substring(0,gitHashLength);

module.exports = {
  entry: {
      main: './src/index.js',
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist', gitHash),
    publicPath: path.join('/dist', gitHash, '/'),
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  resolve: {
    alias: {
      marionette: 'backbone.marionette/lib/backbone.marionette.min',

      'jquery.touchswipe': 'jquery-touchswipe',
      'jquery.ui': 'vendor/jquery/jquery-ui.min', // Revert to old version for testing...
      // 'jquery.ui': 'jquery-ui', // Only required for timepicker-addon 1.5.5 apparently!
      'jquery-ui.timepicker': 'jquery-ui-timepicker-addon', // Need to update timepicker css to avoid showing microseconds/milliseconds      
      // Jquery-ui-combox is not the official combobox extension from npm
      // Instead it is a collection of extensions: (https://github.com/bseth99/jquery-ui-extensions)
      'jquery-ui.combobox': 'vendor/jquery/jquery-ui.combobox', 

      // Jquery.flot provided by NPM package (exact name match)
      // Jquery.flot.resize also from NPM but slightly older version 1.0.0 2012 instead of 2013 (vendor lib)
      'jquery.flot.resize': 'jquery-flot-resize', 
      'jquery.flot.pie': 'flot-pie',
      'jquery.flot.time': 'vendor/flot/jquery.flot.time.min',
      'jquery.flot.selection': 'vendor/flot/jquery.flot.selection',
      'jquery.flot.stack': 'vendor/flot/jquery.flot.stack',

       // Jquery flot tooltip is provided ny NPM with exact name match,
       // so not aliased here, was: 'vendor/flot/jquery.flot.tooltip',
      'jquery.flot.tickrotor': 'vendor/flot/jquery.flot.tickrotor',
      'jquery.flot.axislabels': 'flot-axislabels',
      
      // We can't currently use the magnific-popup from npm e.g.:
      // 'jquery.mp': 'magnific-popup',
      // The vendor library has been modified to append proposal to the request
      // Hence the vendor magnific-popup has a dependency on our utils/xhrimage
      'jquery.mp': 'vendor/jquery/jquery.magnific-popup',

      // jeditable provided by NPM.
      'jquery.editable': 'jquery-jeditable/dist/jquery.jeditable.min',
      'jquery.editable.datepicker': 'jquery-jeditable/dist/jquery.jeditable.datepicker.min',
  
      // Jquery.color plugin also NPM package
      'jquery.color': 'jquery-color',

      // Caman npm depends on fibers, canvas, fs which we don't want...
      // So use direct downloaded dependency
      caman: 'vendor/caman.min',

      // heatmap in npm has dependency on canvas/node-gyp... so use old one for now
      heatmap: 'vendor/hmap',
      
      // gunzip is actually the zlib library
      // https://npm.taobao.org/package/zlibjs
      gzip: 'zlibjs/bin/gunzip.min',

      markdown: 'markdown/lib/markdown',

      highmaps: 'highcharts/highmaps',
      'highmaps-world': '@highcharts/map-collection/custom/world',

      // Vue packages from npm (vee-validate requires promise polyfill - also npm)
      vue: 'vue/dist/vue.min',
      veevalidate: 'vee-validate/dist/vee-validate.min',
    },
    modules: [
      path.resolve(__dirname, 'src/js'),
      path.resolve(__dirname, 'src/css'),
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
          path.resolve(__dirname, 'src/js/templates/vue')
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
      // Font loader - url should be relative to entry main.scss file
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: '../../assets/fonts', // output path is relative to main module outputPath
            publicPath: '/assets/fonts'
          }
        }
      },
      // SVG could be images or fonts so use more explicit test here...
      {
        test: /font-awesome\/.+\.(svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: '../../assets/fonts',
            publicPath: '/assets/fonts'
          }
        }
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
          }
        ]
      },
      {
        test: /vue\/.+\.html$/,
        use: ['html-loader']
      },
      // We need to help Caman load properly
      // Caman adds to the window object within a browser
      // The import loader ensures it it recognised as browser env not NodeJS
      {
        test: /caman\.min\.js$/,
        use: "imports-loader?exports=>undefined,require=>false,this=>window"
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, // Extract the CSS into separate files
          },
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      },
      {
        test: /\.(png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096, // Anything less than this limit is inlined
              name: '[path][name].[ext]',
              outputPath: '../../assets',
              publicPath: '/assets',
              context: 'src',
            }
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
        "window.jQuery": "jquery",
        Highcharts: "highmaps"
    }),
    // This generates a short (8 char) git hash used for build paths
    // new GitRevisionPlugin({
    //   commithashCommand: 'rev-parse --short HEAD'
    // }),
    // This builds an index.php file from the src template
    new HtmlWebpackPlugin({
      title: 'SynchWeb Webpack',
      filename: path.resolve(__dirname, 'index.php'),
      template: 'src/index.php',
    }),
    // Copy static assets to the assets folder
    // Anything matching in the from path is copied so images/file.png => assets/images/file.png
    new CopyPlugin([
      // { context: path.resolve(__dirname, 'src/css/stylesheets'),
      //   from: 'images/**',
      //   to: path.resolve(__dirname, 'assets') },
      { context: path.resolve(__dirname, 'src'),
        from: 'images/**',
        to: path.resolve(__dirname, 'assets') }
    ]),
    // Ignore all locale files of moment.js
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ]
}
