import { createMatcher } from "./create-matcher"
import HTML5History from "./history/h5"
import Hash from "./history/hash"
import install from "./install"
class VueRouter{
  constructor(options = {}) {
    const routes = options.routes
    this.mode = options.mode || 'hash'

    //先做格式化
    //传入路径 返回对应的记录 /about => About
    // match 匹配方法 
    // addRoutes 动态添加路由
    this.matcher = createMatcher(options.routes || [])
    // 根据模式需要初始化不同的路由系统 hash/history  底层实现不一样 但是使用的方法时一样的
    //hash => hash.js => push
    // history => history.js => push
    // 共同的 base

    // 每次跳转 需要获取当前的路径 this.$router.pathname
    switch(this.mode){
      case 'hash': // location.hash
        this.history = new Hash(this)
        break

      case "history": // pushState
        this.history = new HTML5History(this)
        break
    }
    this.beforeHooks = []
  }
  match(location) {
    return this.matcher.match(location)
  }
  push(location) {
    // 跳转页面
    this.history.transitionTo(location, () => {
      window.location.hash = location // 更改hash值
    })
  }
  init(app) {
    const history = this.history  // 当前管理路由的
    // hash => hashchange 但是浏览器支持popstate 就优先采用popstate
    // history => popstate 性能高于hashchange 但是有兼容性问题

    // 页面初始化完毕后需要先跳转一次
    // 跳转到某个路径
    const setUpListener = function () {
      // 事件的实现方式两个模式的也不一样
      history.setUpListener()
    }
    history.transitionTo(history.getCurrentLocation(), setUpListener)
    history.listen((route) => {
      // 监听 如果current变化了 就重新给_route赋值
      app._route = route
    })
  }
  beforeEach(fn){
    this.beforeHooks.push(fn)
  }
}
VueRouter.install = install


export default VueRouter

// 路由的钩子执行思路和koa express中间件的原理一样 就是把所有的钩子组成一个数组依次执行