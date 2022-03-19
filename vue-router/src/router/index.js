import Vue from 'vue'
import VueRouter from 'vue-router'
// import VueRouter from '@/vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

Vue.use(VueRouter)// 注册两个全局组件,<router-link>和<router-view></router-view>
// 核心实现,根据路径变化 找到对应的组件   显示到router-view中

// 做映射表
// / => home
// /about =>  about
// /about/a => [about, a]
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    children: [
      {path: 'a', component: {
        render: (h) => <h1>about - a</h1>
      }}
    ]
  }
]

const router = new VueRouter({
  mode: 'hash', // history模式需要服务器端支持,在开发环境内部提供了historyFallback插件，刷新不会404
  routes
})

export default router
