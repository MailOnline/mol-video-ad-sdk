/* eslint-disable import/unambiguous, import/no-commonjs, sort-keys, global-require */
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
    exclude: /node_modules\/(?!@mol\/).*/,
    loader: 'babel-loader',
    test: /\.jsx?$/
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
  mode: 'development',
  devtool: 'source-map',
  entry: {
    index: './demo/index.js'
  },
  module: {rules},
  output: {
    devtoolFallbackModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]?[hash]`,
    devtoolModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]`,
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  }
};
