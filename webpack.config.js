const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    index: "./src/index.jsx"
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader'
      }]
    }, {
      test: /\.less$/,
      exclude: /node_modules/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader',
        options: {
          url: false
        },
      }, {
        loader: 'less-loader',
      }],
    }],
  },
  externals: {
    react: 'React'
  },
}
