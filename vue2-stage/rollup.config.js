import babel from 'rollup-plugin-babel'
export default {
  input: './src/index.js',
  output: {
    format: 'umd', // 支持amd和commonjs规范 可以暴露一个接口 window.Vue
    name: 'Vue',//可以暴露一个接口 window.Vue
    file: 'dist/vue.js',
    sourcemap: true, //es5=> es6源代码映射
  },
  plugins: [
    babel({ //使用babel进行转化,但是排除node_modules文件
      exclude: 'node_modules/**'//**表示任意文件
    })
  ]
}