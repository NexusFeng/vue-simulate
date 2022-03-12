import Vue from 'vue'
import App from './App.vue'

// new Vue({
//   render: h=> h(App)
// }).$mount('#app')

// 入口改装成函数,目的是服务端渲染时,每次访问的实例都是可以通过这个工厂函数返回一个全新的实例,保证每个人访问的都可以拿到自己的实例
export default() => {
  new Vue({
    render: h=> h(App)
  })
  return {app}
}