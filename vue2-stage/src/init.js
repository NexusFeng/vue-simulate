import { compileToFunction } from "./compiler/index"
import { callHook, mountComponent } from "./lifecycle"
import { initState } from "./state"
import { mergeOptions } from "./util"

export function initMixin(Vue) { //表示在vue的基础上做一次混合操作
  Vue.prototype._init = function (options) {
    const vm = this
    vm.$options = mergeOptions(vm.constructor.options,options)//后面会对options进行扩展
    // 对数据进行初始化
    callHook(vm, 'beforeCreate')
    initState(vm)//vm.$options.data 数据劫持
    callHook(vm, 'created')

    
    if(vm.$options.el) {
      // 将数据挂载到这个模板上
      vm.$mount(vm.$options.el)
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options
    el = document.querySelector(el)
    vm.$el = el
    console.log(el ,'el')

    // 把模版转换成 对应的渲染函数 =》 虚拟dom vnode diff算法 更新虚拟dom => 真实dom

    if(!options.render) { // 没有render用template
      let template = options.template
      if(!template && el) {// 没有template就取el的内容作为模板
        template = el.outerHTML
        
      }
      let render = compileToFunction(template)
      options.render = render
    }
    // options.render就是渲染函数
    // 调用render方法 渲染成真实dom 替换掉页面的内容

    mountComponent(vm, el) // 组件挂载过程
  }

}

