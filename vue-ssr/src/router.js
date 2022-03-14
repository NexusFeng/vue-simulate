import Vue from 'vue'
import VueRouter from 'vue-router'
import Foo from './components/Foo.vue'

Vue.use(VueRouter) //内部会提供两个全局组件


// 每个人访问服务器都需要产生一个路由系统

export default () => {
  let router = new VueRouter({
    mode: "history",
    routes: [
      {path: '/', component: Foo},
      {path: '/bar', component: () => import('./components/Bar.vue')}//懒加载
    ]
  })
  return router
}

// 前端的路由的两种方式 hash history
//hash #

// 路由就是根据路径的不同渲染不同的组件 hash值特点就是hash变化不会导致页面重新渲染,可以监控hash值得变化  显示对应的组件(可以产生历史记录) 缺点就是路径会带一个#号 （服务端获取不到hash）

// history H5 api  路径中不会有# 问题是刷新时会产生404