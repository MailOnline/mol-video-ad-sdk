/* eslint-disable import/no-commonjs, import/unambiguous */
const rules = [
  {
    exclude: /node_modules\/(?!@mol-).*/,
    loader: 'babel-loader',
    test: /\.js$/
  }
];

module.exports = {
  module: {rules}
};