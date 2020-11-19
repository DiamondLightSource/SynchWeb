// postcss.config.js
const path = require('path');

module.exports = ({env}) => (
  {
    syntax: 'postcss-scss',
    plugins: [
      require('postcss-import'),
      require('postcss-mixins')({
        mixinsDir: path.join(__dirname, 'src', 'css', 'mixins')
      }),
      require('postcss-simple-vars'),
      require('postcss-nested'),
      require('postcss-extend'),
      require('postcss-strip-inline-comments'),
      require('postcss-color-function'),
      require('autoprefixer'),
    ]
  }
)
