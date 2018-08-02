/* eslint-disable import/unambiguous, import/no-commonjs, sort-keys, global-require */
const path = require('path');
const pkg = require('./package.json');

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

const devRules = [
  ...rules,
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
    entry: {
      [pkg.main]: './src/index.js'
    },
    devtool: 'source-map',
    module: {rules},
    optimization: {
      concatenateModules: true,
      namedModules: true,
      noEmitOnErrors: true
    },
    output: {
      devtoolFallbackModuleFilenameTemplate: `webpack:///${pkg.name}/[resource-path]?[hash]`,
      devtoolModuleFilenameTemplate: `webpack:///${pkg.name}/[resource-path]`,
      path: path.join(__dirname, 'dist'),
      filename: '[name].js',
      library: 'reactVastVpaid',
      libraryTarget: 'umd',
      umdNamedDefine: true
    }
  };

  if (mode === 'development') {
    config.entry = {
      'main.umd': './src/index.js',
      demo: './demo/index.js'
    };
    config.module.rules = devRules;
  }

  return config;
};
