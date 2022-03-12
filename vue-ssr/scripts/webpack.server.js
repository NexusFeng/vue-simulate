const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {merge} = require('webpack-merge')
const base = require('./webpack.base')

module.exports = merge(base,{
  target: 'node',
  entry: {
    server: path.resolve(__dirname, '../src/server-entry.js')
  },
  output: {
    libraryTarget: "commonjs2"
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.ssr.html'),
      filename: 'server.html',//默认名字是index.html
      excludeChunks: ['server'],
      minify: false,//不需要压缩
    })
  ]
})