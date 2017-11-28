/* eslint-disable import/no-commonjs, import/unambiguous, filenames/match-regex */
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    autoprefixer({
      browsers: [
        '> 1%',
        'last 3 versions',
        'iOS > 6',
        'ie > 9',
        'not ie < 10'
      ]
    })
  ]
};
