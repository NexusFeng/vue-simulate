import { compileToFunction } from "./compiler/index"
import { initState } from "./state"

export function initMixin(Vue) { //表示在vue的基础上做一次混合操作
  Vue.prototype._init = function (options) {
    const vm = this
    vm.$options = options//后面会对options进行扩展

    // 对数据进行初始化
    initState(vm)//vm.$options.data 数据劫持

    
    if(vm.$options.el) {
      // 将数据挂载到这个模板上
      vm.$mount(vm.$options.el)
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options
    el = document.querySelector(el)
    console.log(el ,'el')

    // 把模版转换成 对应的渲染函数 =》 虚拟dom vnode diff算法 更新虚拟dom => 真实dom

    if(!options.render) { // 没有render用template
      let template = options.template
      if(!template && el) {// 没有template就取el的内容作为模板
        template = el.outerHTML
        let render = compileToFunction(template)
        options.render = render
      }
    }
    // options.render就是渲染函数
  }

}

