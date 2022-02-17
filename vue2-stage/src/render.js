import { createElement, createTextElement } from "./vdom/index"

export function renderMixin(Vue) {
  Vue.prototype._c = function() {//createElement
    return createElement(this,...arguments)
  }
  Vue.prototype._v = function(text) { //createTextElement
    return createTextElement(this,text)
  }
  Vue.prototype._s = function(val) {// stringify
    return JSON.stringify(val)
  }

  Vue.prototype._render = function() {
    const vm = this
    let render = vm.$options.render // 解析出来的render方法,同时也可能是用户写的

    let vnode = render.call(vm)


    return vnode
  }
}