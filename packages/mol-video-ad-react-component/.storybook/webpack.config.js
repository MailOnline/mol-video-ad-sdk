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
  module: {rules}
};