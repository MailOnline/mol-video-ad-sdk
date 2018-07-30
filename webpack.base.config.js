/* eslint-disable import/unambiguous, import/no-commonjs, global-require */
const rules = [
  {
    enforce: 'pre',
    exclude: /node_modules\/(?!@mol\/).*/,
    test: /\.js$/,
    use: ['source-map-loader']
  },
  {
    exclude: /node_modules/,
    loader: 'babel-loader',
    test: /\.jsx?$/
  }
];

module.exports = {
  devtool: 'source-map',
  module: {rules},
  optimization: {
    concatenateModules: true,
    namedModules: true,
    noEmitOnErrors: true
  }
};
