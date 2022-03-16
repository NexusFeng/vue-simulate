import Vue from 'vue'
import ModuleCollection from '../vuex/module/module-collection'
import { forEach } from './utils'
function installModule(store,rootState, path, module) {
  if (path.length > 0) {// 子模块
    // 需要找到对应父模块,将状态声明上去
    let parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current]
    }, rootState)
    // 对象新增属性不能导致重新更新视图
    Vue.set(parent, path[path.length - 1], module.state)
    // parent[path[path.length - 1]] = module.state
  }
  // 需要循环当前模块
  module.forEachGetters((fn, key) => {
    store.warpperGetters[key] = function () {
      return fn.call(store, module.state)
    }
  })
  module.forEachMutation((fn, key) => { 
    store.mutations[key] = store.mutations[key] || []
    store.mutations[key].push((payload) => {
      return fn.call(store, module.state, payload)
    })
  })
  module.forEachActions((fn, key) => {
    store.actions[key] = store.actions[key] || []
    store.actions[key].push((payload) => {
      return fn.call(store, store, payload)
    })
  })
  module.forEachChildren((child, key) => {
    installModule(store,rootState, path.concat(key), child)
  })
}
class Store {
  constructor(options) {
    // 对用户的模块进行整合
    // 当前格式化完毕的数据 放到了this._modules里
    this._modules = new ModuleCollection(options) //对用户的参数进行格式化操作
    this.warpperGetters = {}
    this.mutations = {}
    this.actions = {}
    this.getters = {} //需要将模块中的所有getters,mutations,actions进行收集
    const computed = {}

    // 没有namespace的时候 getter都放在根上, actions, mutations会被合并
    let state = options.state
    installModule(this, state, [],this._modules.root)

    forEach(this.warpperGetters, (getter, key) => {
      computed[key] = getter
      Object.defineProperty(this.getters, key, {
        get: () => this._vm[key]
      })
    })

   
    this._vm = new Vue({
      data: {
        $$state: state
      },
      computed
    })
    
   
  }

  get state() {
    return this._vm._data.$$state
  }
  
  commit = (mutationName, payload) => { // 发布
    this.mutations[mutationName] && this.mutations[mutationName].forEach(fn => fn(payload))
  }

  dispatch = (actionName, payload) => { // 发布
    this.actions[actionName] && this.actions[actionName].forEach(fn => fn(payload))
  }

}

export default Store