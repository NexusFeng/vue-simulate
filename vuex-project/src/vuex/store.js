import Vue from 'vue'
import ModuleCollection from '../vuex/module/module-collection'
import { forEach } from './utils'

function getNewState(store, path) {
  return path.reduce((memo, current) => {
    return memo[current]
  }, store.state)
}

function installModule(store,rootState, path, module) {

  // 获取moduleCollection类的实例
  let ns = store._modules.getNamespace(path)
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
    store.warpperGetters[ns+key] = function () {
      return fn.call(store, getNewState(store, path))
    }
  })
  module.forEachMutation((fn, key) => { 
    store.mutations[ns+key] = store.mutations[ns+key] || []
    store.mutations[ns+key].push((payload) => {
      fn.call(store, getNewState(store, path), payload) //先调用mutation 在执行subscribe
      store._subscribes.forEach(fn => fn({type: ns+key,payload}, store.state ))
    })
  })
  module.forEachActions((fn, key) => {
    store.actions[ns+key] = store.actions[ns+key] || []
    store.actions[ns+key].push((payload) => {
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
    this._subscribes =  []


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
    
    if (options.plugins) { // 说明用户使用了插件
      options.plugins.forEach(plugin => plugin(this))
    }
    
   
  }
  subscribe(fn) {
    this._subscribe.push(fn)
  }
  replaceState(newState) {// 需要替换的状态
    this._vm._data.$$state = newState // 替换最新的状态，赋予对象类型会被重新劫持
    // 虽然替换了状态,但是mutation getter中的state在初始化的时候 已经被绑定死了老的状态
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