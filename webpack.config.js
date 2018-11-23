/* eslint-disable import/unambiguous, import/no-commonjs, sort-keys */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const {name: pkgName} = require('./package.json');

// eslint-disable-next-line no-process-env
const devMode = process.env.NODE_ENV !== 'production';
const alias = {};

if (devMode) {
  alias['@mailonline/video-ad-sdk'] = path.resolve(__dirname, 'src/index.js');
} else {
  alias['@mailonline/video-ad-sdk'] = path.resolve(__dirname, 'dist/main.esm.js');
}

module.exports = {
  entry: {demo: './demo/index'},
  devtool: 'source-map',
  devServer: {
    publicPath: '/',
    contentBase: [
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, 'ghPage')
    ],
    compress: true,
    https: true,
    port: 9000,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  externals: {
    'video.js': {
      commonjs: 'video.js',
      commonjs2: 'video.js',
      root: 'videojs'
    }
  },
  module: {
    rules: [
      {
        exclude: devMode ? /node_modules\/(?!@mailonline\/).*/ : /node_modules\/.*/,
        loader: 'babel-loader',
        test: /\.js$/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  optimization: {
    minimize: !devMode,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  output: {
    libraryTarget: 'umd',
    devtoolFallbackModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]?[hash]`,
    devtoolModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]`,
    publicPath: devMode ? 'http://localhost:9000/' : '../',
    path: path.resolve(__dirname, 'ghPage/')
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'MOL Video Ad SDK Suite Inspector',
      template: './demo/index.html',
      filename: 'index.html',
      minify: false,
      chunks: []
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ],
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules'],
    alias
  }
};
