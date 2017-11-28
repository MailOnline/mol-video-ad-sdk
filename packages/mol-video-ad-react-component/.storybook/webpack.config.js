/* eslint-disable import/no-commonjs, import/unambiguous */
const autoprefixer = require('autoprefixer')
const cssLoaders = [
  {
    loader: 'style-loader'
  },
  {
    loader: 'css-loader',
    options: {
      importLoaders: 3,
      localIdentName: '',
      modules: true,
      sourceMap: true
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      config: {
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
  module: {rules}
};