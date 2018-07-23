/* eslint-disable import/unambiguous, import/no-commonjs, sort-keys, global-require */
const path = require('path');
const {name: pkgName} = require('./package.json');

const rules = [
  {
    exclude: /node_modules\/(?!@mol\/).*/,
    loader: 'babel-loader',
    test: /\.jsx?$/
  }
];

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    index: './src/index.js'
  },
  module: {rules},
  output: {
    devtoolFallbackModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]?[hash]`,
    devtoolModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]`,
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    library: 'reactVastVpaid',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  optimization: {
    namedModules: true,
    noEmitOnErrors: true,
    concatenateModules: true
  }
};
