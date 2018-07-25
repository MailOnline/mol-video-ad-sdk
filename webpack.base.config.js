/* eslint-disable import/unambiguous, import/no-commonjs, sort-keys, global-require */
const rules = [
  {
    exclude: /node_modules\/(?!@mol\/).*/,
    loader: 'babel-loader',
    test: /\.jsx?$/
  }
];

module.exports = {
  devtool: 'source-map',
  module: {rules},
  optimization: {
    namedModules: true,
    noEmitOnErrors: true,
    concatenateModules: true
  }
};
