/* eslint-disable import/unambiguous, import/no-commonjs, sort-keys, global-require, no-process-env */
const path = require('path');
const {name: pkgName} = require('./package.json');

const cssLoaders = [
  {
    loader: 'style-loader'
  },
  {
    loader: 'css-loader',
    options: {
      importLoaders: 3,
      localIdentName: '[local]--[hash:base64:4]',
      modules: true,
      sourceMap: true
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      config: {
        path: './postcss.config.js'
      },
      sourceMap: true
    }
  }
];

const rules = [
  {
    exclude: /node_modules\/(?!@mol-fe\/).*/,
    loader: 'babel-loader',
    test: /\.js$/
  },
  {
    test: /\.svg$/,
    use: ['babel-loader', 'svg-react-loader']
  },
  {
    test: /\.css$/,
    use: [
      ...cssLoaders
    ]
  }
];

module.exports = {
  devtool: 'source-map',
  entry: {
    index: './src/index.js'
  },
  module: {rules},
  output: {
    devtoolFallbackModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]?[hash]`,
    devtoolModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]`,
    filename: '[name].js',
    path: path.join(__dirname, 'dist')
  }
};
