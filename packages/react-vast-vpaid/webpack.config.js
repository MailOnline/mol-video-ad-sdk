/* eslint-disable import/unambiguous, import/no-commonjs, sort-keys, global-require */
const path = require('path');
const baseConfig = require('../../webpack.base.config');
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
  ...baseConfig.module.rules,
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

module.exports = (env, {mode}) => {
  const config = {
    ...baseConfig,
    output: {
      devtoolFallbackModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]?[hash]`,
      devtoolModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]`,
      path: path.join(__dirname, 'dist'),
      filename: '[name].js',
      library: 'reactVastVpaid',
      libraryTarget: 'umd',
      umdNamedDefine: true
    }
  };

  if (mode === 'development') {
    config.entry = {
      main: './src/index.js',
      demo: './demo/index.js'
    };
    config.module.rules = rules;
  }

  return config;
};
