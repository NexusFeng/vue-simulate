import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

// 生成的项目时runtime-only 没有withCompiler
new Vue({
  render: h => h(App),
  // components: {
  //   App
  // },
  // template: `<App></App>` //得在vue.config.js里配置runtimeCompiler: true
}).$mount('#app')
