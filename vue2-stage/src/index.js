//用class类写vue不好拆封,所以采用构造函数方式写

import { initGlobalApi } from './global-api/index'
import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from './render'
import { stateMixin } from './state'

function Vue(options) {
  // options用户传入选项
  //构造函数中的this指向new的实例
  this._init(options)// 初始化操作
}
// 扩展原型
initMixin(Vue)
renderMixin(Vue) // _render
lifecycleMixin(Vue) // _update
stateMixin(Vue)


// 在类上扩展
initGlobalApi(Vue) //初始化全局api

import { compileToFunction } from './compiler/index'
import { createElm, patch } from './vdom/patch'
// diff核心
let oldTemplate = `<div>{{message}}</div>`

let vm1 = new Vue({data: {message: 'hello'}})
const render1 = compileToFunction(oldTemplate)
const oldVnode = render1.call(vm1) //虚拟dom
console.log(createElm(oldVnode))

let newTemplate = `<p>{{message}}</p>`
let vm2 = new Vue({data: {message: 'hello'}})
const render2 = compileToFunction(newTemplate)
const newVnode = render2.call(vm2) //虚拟dom
console.log(createElm(newVnode))
// 根据新的虚拟节点更新老的节点，老的节点能复用就复用

patch(oldVnode, newVnode)


export default Vue