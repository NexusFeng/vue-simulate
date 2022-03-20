import RouterLink from "./components/link"
import RouterView from "./components/view"

export let Vue

export default function install(_Vue) {
  Vue = _Vue

  Vue.mixin({
    beforeCreated() {
      //给根实例增加一个_router属性,所有都能拿到根上的_router
      if(this.$options.router) {
        // 根组件
        this._router = this.$options.router // （router实例）
        this._routerRoot = this // 表示根组件上有唯一一个标识叫_routerRoot 指向了自己(Vue的实例，根实例，有_router属性 所有组件都能通过_routerRoot._router获取)

        // 初始化路由  只会初始化一次
        this._router.init(this) //整个应用的根 this是当前组件的实例
        // vuex中的state 在哪里使用就会收集对应的watcher
        // current里边的属性在哪里使用 就会收集对应的watcher
        Vue.util.defineReactive(this, '_route',this._router.history.current)
      } else {
        //子
        this._routerRoot = this.$parent && this.$parent._routerRoot
      }
      // 所有组件都会有 _routerRoot._router属性 获取路由的实例
    }
  })

  Object.defineProperty(Vue.prototype, "$router", { //存的方法
    get() {
      return this._routerRoot._router
    }
  })

  Object.defineProperty(Vue.prototype, "$route", { // 存的都是属性
    get() {
      return this._routerRoot._route
    }
  })

  Vue.component('router-link', RouterLink)
  Vue.component('router-view', RouterView)
}