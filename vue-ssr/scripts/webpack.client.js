const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {merge} = require('webpack-merge')
const base = require('./webpack.base')

module.exports = merge(base, {
  entry: {
    client:path.resolve(__dirname, '../src/client-entry.js')
  },
  plugins: [
    //实际开发中不需要客户端代码
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
      filename: 'client.html'
    })
  ]
})