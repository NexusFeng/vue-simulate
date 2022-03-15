import {Vue} from "./install"
import { forEach } from "./utils"


class Store {
  constructor(options) {
    // 用户传入的数据
    let { state, getters, mutations, actions, module, strict } = options
    this.getters = {} // 在取getters属性时 把他代理到计算属性上
    const computed = {}

    forEach(getters, (fn, key) => {
      computed[key] = () => {
        return fn(this.state) // 为了保证参数是state
      }
      // 当去getters上取值 需要对computed取值
      Object.defineProperty(this.getters, key, {
        get: () => this._vm[key] // 具备了缓存功能
      })
    })

    this.mutations = {}
    forEach(mutations, (fn, key) => {
      // this.mutations = {changeAge: ()=> {}}
      this.mutations[key] = (payload) => fn.call(this,this.state, payload)
    })

    this.actions = {}
    forEach(actions, (fn, key) => {
      // this.mutations = {changeAge: ()=> {}}
      this.actions[key] = (payload) => fn.call(this,this, payload)
    })

    // 这个状态在页面渲染时需要收集对应的渲染watcher,这样状态更新才会更新视图
    this._vm = new Vue({
      data: { // $符号开头的数据不会被挂载到实例上,但是会挂载到当前的_data上,减少了一次代理
        $$state: state
      },
      computed
    })

    //用户组件中使用的$store = this


  }
  // 类的属性访问器
  get state() { // this.$store.state => defineProperty中的get
    // 依赖于vue的响应式原理
    return this._vm._data.$$state
  }
  dispatch = (type, payload) => {
    this.actions[type](payload)
  }
  commit = (type, payload) => {
    this.mutations[type](payload)
  }
}

export default Store