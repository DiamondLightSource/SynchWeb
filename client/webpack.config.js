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
const gitHash = childProcess.execSync('git rev-parse --short HEAD').toString().trim();
const config = require('./src/js/config.json')

module.exports = (env, argv) => ({
  entry: {
      main: './src/js/app/index.js',
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist', gitHash),
    publicPath: path.join('/dist', gitHash, '/'),
  },
  devServer: {
    host: (env && env.host) || 'localhost',
    port: (env && env.port) || 9000,
    https: true,
    historyApiFallback: {
      index: '/dist/'+gitHash+'/index.html',
      // Allow parsing urls with dots in parameters (e.g. unit cell search)
      disableDotRule: true
    },
    proxy: [{
        context: ['/api'],
        // Change this target to where SynchWeb server is running
        target: (env && env.proxy && env.proxy.target) || 'http://127.0.0.1',
        // Intercept the request and add auth header
        onProxyReq: function(proxyReq, req, res) {
          if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
          }
        },
        secure: env && env.proxy && env.proxy.secure && JSON.parse(env.proxy.secure)
      },
    ],
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
      'jquery-ui.timepicker': 'jquery-ui-timepicker-addon', // Need to update timepicker css to avoid showing microseconds/milliseconds      
      // Jquery-ui-combox is based on an extension from npm
      // The original was based on a collection of extensions: (https://github.com/bseth99/jquery-ui-extensions)
      // Currently using a modified version from npm
      'jquery-ui.combobox': 'vendor/jquery/jquery-ui.combobox.custom',
      // 'jquery-ui.combobox': 'vendor/jquery/jquery-ui.combobox',

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

      // jeditable can be provided by NPM (but only for jQuery 3.x). Does not work with our legacy jquery.
      // 'jquery.editable': 'jquery-jeditable/dist/jquery.jeditable.min',
      // 'jquery.editable.datepicker': 'jquery-jeditable/dist/jquery.jeditable.datepicker.min',
      'jquery.editable': 'vendor/jquery/jquery.jeditable.min',
      'jquery.editable.datepicker': 'vendor/jquery/jquery.jeditable.datepicker',

      // Jquery.color plugin also NPM package
      // Only used from within utils.js
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
      luxon: 'luxon',
      formatDate: 'date-fns/format',

      js: path.resolve(__dirname, 'src/js'),
      css: path.resolve(__dirname, 'src/css'),
      // vuejs: path.resolve(__dirname, 'src/js/vuejs'),

    },
    modules: [
      path.resolve(__dirname, 'src/js'),
      path.resolve(__dirname, 'src/css'),
      path.resolve(__dirname, 'node_modules'),
    ],
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
        test: /font-awesome[\\\/].+\.(svg)$/,
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
        test: /templates[\\\/]vue[\\\/].+\.html$/,
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
          // Extract the CSS into separate files
          { 
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: argv.mode === 'development',
              // reloadAll: true,
            }
          },
          "css-loader", // translates CSS into CommonJS
          "postcss-loader",
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
      title: 'ISPyB',
      filename: path.resolve(__dirname, 'index.php'),
      template: 'src/index.php',
      jsonConfig: config,
    }),
    new HtmlWebpackPlugin({
      title: 'ISPyB',
      filename: path.resolve(__dirname, 'dist/', gitHash, 'index.html'),
      template: 'src/index.html',
      jsonConfig: config,
    }),
    // Generate main html file in root client dir
    new HtmlWebpackPlugin({
      title: 'ISPyB',
      filename: path.resolve(__dirname, 'index.html'),
      template: 'src/index.html',
      jsonConfig: config,
    }),
    // Copy static assets to the assets folder
    // Anything matching in the from path is copied so images/file.png => assets/images/file.png
    // Also copy jquery to assets dir, so we can use it for Dialog popup with log files (see js/views/log.js)
    // Also copy config.json to assets dir, app uses the assets/js/config.json to tell if client needs updating
    new CopyPlugin([
      { context: path.resolve(__dirname, 'src'),
        from: 'images/**',
        to: path.resolve(__dirname, 'assets') },
      { context: path.resolve(__dirname, 'src'),
        from: 'js/config.json',
        to: path.resolve(__dirname, 'assets/js/') },
      { context: path.resolve(__dirname, 'src'),
        from: 'js/vendor/jquery/jquery-1.9.1.min.js',
        to: path.resolve(__dirname, 'assets/js/') },
      { context: path.resolve(__dirname, 'src'),
        from: 'files/**',
        to: path.resolve(__dirname, 'assets') }
    ]),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    // Allow use to use process.env.NODE_ENV in the build
    // NODE_ENV should be set in scripts for production builds
    new webpack.EnvironmentPlugin(['NODE_ENV'])
  ]
})
