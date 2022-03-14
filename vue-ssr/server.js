const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
const VueServerRenderer = require('vue-server-renderer')
const static = require('koa-static')

const fs = require('fs')
const path = require('path')
const serverBundle = fs.readFileSync(path.resolve(__dirname, 'dist/server.bundle.js'), 'utf8')
const template = fs.readFileSync(path.resolve(__dirname, 'dist/server.html'), 'utf8')

// 根据实例
const render =  VueServerRenderer.createBundleRenderer(serverBundle, {
  template
})

router.get('/', async ctx => {
  ctx.body = await new Promise((resolve, reject) => {
    render.renderToString({url: ctx.url},(err, html) => {//如果想让css生效,只能使用回调的方式
      if(err && err.code == 404) reject(err)
      resolve(html)
    })
  })
  
  // const html = await render.renderToString()//生成字符串
})

//当用户访问一个不存在的路径的服务端路径 返回首页,通过前端的js渲染的时候,会重新根据路劲渲染组件
// 只要用户刷新就会向服务器发请求
router.get('/(.*)', async ctx => {
  ctx.body = await new Promise((resolve, reject) => {
    render.renderToString({url: ctx.url},(err, html) => {//通过服务端渲染 渲染后返回
      if(err) reject(err)
      resolve(html)
    })
  })
})


//保证先走自己定义的路由,再走静态文件
// app.use(router.routes())

// 默认先查找静态目录

// 当客户端发送请求时会先去dist目录下查找
app.use(static(path.resolve(__dirname, 'dist')))//顺序问题
app.use(router.routes())
// 
app.listen(3000)

// 在没有data-server-rendered属性的元素上,还可以向$mount函数的hydrating参数位置传入true,来强制使用激活模式
// 在开发模式下,Vue将推断客户端生成的虚拟dom树是否与从服务器渲染的dom结构相匹配,如果无法匹配,将退出混合模式,丢弃现有的dom并从头渲染,在生产模式下,此检测会被跳过,直接使用服务端返回的结果，以免性能损耗

// 1.服务端渲染核心  是解析vue的实例 生成一个字符串 返回给浏览器
// createRenderer.renderToString(vm)
// let vm = new Vue({
//   template: '<div>hello world</div>'
// })

// 2.通过webpack打包 把所有的代码进行了打包返回一个函数，函数执行后的结果是一个promise => vue的实例
// createBundleRenderer 找到webpack打包后的函数  内部会调用这个函数获取vue实例
// .renderToString(vm) => 生成一个字符串返回给浏览器

// createBundleRenderer 去调用函数 获取实例
// renderToString根据实例生成一个字符串

// node目的：可以解析js语法，可以将vue的实例渲染成字符串

//默认直接url 回车输入 访问的是服务端(通过服务器渲染)

// 数据再前端还是后端请求？ 看使用场景， 1.如果希望加载的html内容很快的显示,那就再服务端,2.如果是后续点击按钮 其他逻辑 可以使用前端请求