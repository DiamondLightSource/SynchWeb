// postcss.config.js
const path = require('path');
const colsMixinFunction = require(path.join(__dirname, 'src', 'css', 'mixins', 'cols.js'))

// Disabling purgecss for now because it strips too many styles.
// TODO - figure out the correct extractor to parse backbone templates (inline and html)
// const purgecss = require('@fullhuman/postcss-purgecss')({

//   // Specify the paths to all of the template files in your project
//   content: [
//     './src/index.php',
//     './src/**/*.html',
//     './src/**/*.vue',
//     './src/**/*.js', /* Lots of classes are used within inline templates... */
//   ],
//   defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
// })

module.exports = ({env}) => (
  {
    syntax: 'postcss-scss',
    plugins: [
      require('postcss-import'),
      require('postcss-mixins')({
        // mixinsDir: path.join(__dirname, 'src', 'css', 'mixins')
        mixins: {
          cols: colsMixinFunction
        }
      }),
      // Using utilities for clearfix - ie8 style is closer to original one used
      require('postcss-utilities')({ ie8: true}),
      require('postcss-simple-vars'),
      require('postcss-strip-inline-comments'),
      require('postcss-color-function'),
      require('postcss-nested'),
      require('postcss-extend-rule'),
      require('tailwindcss'),
      require('autoprefixer'),
      // Disabling purgecss for now - strips out too many styles
      // ...process.env.NODE_ENV === 'production' ? [purgecss]: [],
    ]
  }
)
