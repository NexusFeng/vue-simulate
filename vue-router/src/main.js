import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false


// vue-router 注册的是_router  ($router $route) (原型扩展)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
