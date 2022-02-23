import { mergeOptions } from "../util"

export function initGlobalApi(Vue) {
  // Vue.component
  // Vue.filter
  // Vue.directive
  Vue.options = {} // 用来存放全局的配置,每个组件初始化时,都会和options选项进行合并
  Vue.mixin = function (options) {
    // 第一次调用                     {}         {beforeCreate: Fn} => {beforeCreate: [fn]}
    // 第二次调用        {beforeCreate: [fn]} {beforeCreate: Fn2} => {beforeCreate: [fn,fn2]}
    this.options = mergeOptions(this.options, options)
    return this
  }
}