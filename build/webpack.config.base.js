//public webpack 
const path = require('path');
const createVueLoaderOptions = require("./vue-loader.config");
const isDev = process.env.NODE_ENV === 'development';

const config = {
  target: 'web',
  entry: path.join(__dirname, '../client/index.js'),
  output: {
    filename: 'bundle.[hash:8].js',
    path: path.join(__dirname, '../dist'),
    publicPath: "/public/"
  },
  module: {
    rules: [
      /*{
        test: /\.(vue|js|jsx)$/,
        loader: "eslint-loader",
        exclude: /node_modules/,
        enforce: "pre"
      },*/
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: createVueLoaderOptions(isDev)
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader'
      },
        {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/ //node_modules忽略掉
        },
        {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              name: '/resource/[path][name].[hash:8].[ext]'//静态文件打包在资源文件下
            }
          }
        ]
      }
    ]
  }
}

module.exports = config
