//用class类写vue不好拆封,所以采用构造函数方式写

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

export default Vue