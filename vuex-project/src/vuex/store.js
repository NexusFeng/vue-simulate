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
    store._withCommitting(() => {
      Vue.set(parent, path[path.length - 1], module.state)
    })
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
      store._withCommitting(() => {
        fn.call(store, getNewState(store, path), payload) //先调用mutation 在执行subscribe
      })
      
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

function resetVM(store,state) {
  let oldVm = store._vm
  this.getters = {} //需要将模块中的所有getters,mutations,actions进行收集
  const computed = {}
  forEach(store.warpperGetters, (getter, key) => {
    computed[key] = getter
    Object.defineProperty(store.getters, key, {
      get: () => this._vm[key]
    })
  })
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  if (store.strict) { // 说明是严格模式，要监控状态
    store._vm.$watch(() =>store._vm._data.$$state, () => {
      //状态变化后直接能监控 watcher是异步的,sync为true状态变化后会立即执行,不是异步watcher
      console.assert(store._commiting, 'no mutate in mutation handler outside')
    }, {deep: true,sync: true})
  }

  if(oldVm) { //重新创建实例后需要将老的实例卸载掉
    Vue.$nextTick(() => oldVm.$destroy())
  }
}

class Store {
  constructor(options) {
    // 对用户的模块进行整合
    // 当前格式化完毕的数据 放到了this._modules里
    this._modules = new ModuleCollection(options) //对用户的参数进行格式化操作
    this.warpperGetters = {}
    this.mutations = {}
    this.actions = {}
    this._commiting = false // 默认不是在mutation中更改的
    this.strict = options.strict

    this._subscribes =  []


    // 没有namespace的时候 getter都放在根上, actions, mutations会被合并
    let state = options.state
    installModule(this, state, [],this._modules.root)

    resetVM(this, state)
    
    if (options.plugins) { // 说明用户使用了插件
      options.plugins.forEach(plugin => plugin(this))
    }
    
   
  }
  _withCommitting(fn) {
    this._commiting = true
    fn() // 同步函数 获取_committing 就是true,如果是异步的那么就会变成false 机会打印日志
    this._commiting = false
  }
  subscribe(fn) {
    this._subscribe.push(fn)
  }
  replaceState(newState) {// 需要替换的状态
  store._withCommitting(() => {
    this._vm._data.$$state = newState // 替换最新的状态，赋予对象类型会被重新劫持
  })
    
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

  registerModule(path,module) {//最终都转换为数组
    if(typeof path == 'string') path = [path]
    //用户直接写的
    this._modules.register(path, module) // 模块的注册,将用户给的数据放在树中
    //注册完毕后再进行安装

    //将用户的module重新安装
    installModule(this, this.state, path, newModule)

    // vuex内部重新注册的话, 会重新生成实例 ,虽然重新安装了,只解决了状态的问题,但是computed就丢失了

    resetVM(this, this.state) //销毁重来
  }

}

export default Store