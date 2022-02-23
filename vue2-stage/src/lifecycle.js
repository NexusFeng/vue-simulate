import Watcher from "./observer/watcher"
import { patch } from "./vdom/patch"


export function lifecycleMixin(Vue) {
  Vue.prototype._update = function(vnode) {
    // 既有初始化,又有更新
    const vm = this
    vm.$el = patch( vm.$el, vnode)

  }
  Vue.prototype.$nextTick = function () {
    
  }
}
// 后续每个组件渲染的时候都会有一个watcher
export function mountComponent(vm, el) {

  // 更新函数 数据变化后 会再次调用此函数
  let updateComponent = () => {
    //调用render函数,生成虚拟dom
    vm._update(vm._render()) // 后续更新可以调用updateComponent方法
    // 用虚拟dom,生成真实dom
  }
  callHook(vm, 'beforeMount')
  //观察者模式：属性是被观察者 观察者：刷新页面 
  // updateComponent()
  new Watcher(vm, updateComponent, () => {
    // 回调
  }, true)//true表示是一个渲染watcher 还有其他watcher

}

export function callHook(vm, hook) {
  let handlers = vm.$options[hook]
  if(handlers) {
    for(let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm)
    }
  }
}