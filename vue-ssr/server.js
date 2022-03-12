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
    render.renderToString((err, html) => {//如果想让css生效,只能使用回调的方式
      if(err) reject(err)
      resolve(html)
    })
  })
  
  // const html = await render.renderToString()//生成字符串
})
// 当客户端发送请求时会先去dist目录下查找
app.use(static(path.resolve(__dirname, 'dist')))
app.use(router.routes())
app.listen(3000)

// 在没有data-server-rendered属性的元素上,还可以向$mount函数的hydrating参数位置传入true,来强制使用激活模式
// 在开发模式下,Vue将推断客户端生成的虚拟dom树是否与从服务器渲染的dom结构相匹配,如果无法匹配,将退出混合模式,丢弃现有的dom并从头渲染,在生产模式下,此检测会被跳过,直接使用服务端返回的结果，以免性能损耗