import {Vue} from "./install"

class Store {
  constructor(options) {
    let { state, getters, mutation, actions, module, strict } = options
    // 这个状态在页面渲染时需要收集对应的渲染watcher,这样状态更新才会更新视图
    this._vm = new Vue({
      data: { // $符号开头的数据不会被挂载到实例上,但是会挂载到当前的_data上,减少了一次代理
        $$state: state
      }
    })

    //用户组件中使用的$store = this

  }
  // 类的属性访问器
  get state() { // this.$store.state => defineProperty中的get
    // 依赖于vue的响应式原理
    return this._vm._data.$$state
  }
}

export default Store