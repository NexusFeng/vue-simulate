import Dep from "./observer/dep"
import { observe } from "./observer/index"
import Watcher from "./observer/watcher"
import { isFunction } from "./util"


export function stateMixin(Vue) {
  Vue.prototype.$watch = function (key, handler,options = {}) {
    options.user = true //是一个用户写的watcher
    let watcher = new Watcher(this, key, handler, options)

    if(options.immediate) {
      handler(watcher.value)
    }
  }
}
// 状态初始化
export function initState(vm) {
  const opts = vm.$options
  // if (opts.props) {
  //   initProps()
  // }
  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm, opts.computed)
  }
  if (opts.watch) {// 初始化watch
    initWatch(vm, opts.watch)
  }
}

// 代理
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(newVal) {
      vm[source][key] = newVal
    }
  })
}

function initData(vm) {
  let data = vm.$options.data // vm.$el vue内部会对属性检测如果以$开头 不会进行代理
  // vue2会将data中的所有数据进行劫持 Object.defineProperty
  //这个时候data和vm没有任何关系,通过_data进行关联
  data = vm._data =isFunction(data)?data.call(vm): data

  for(let key in data) { //取name时直接可以写vm.name vm.xxx => vm._data.xxx
    proxy(vm, '_data', key)
  }
  
  observe(data)
}

function initWatch(vm, watch) {
  for(let key in watch) {
    console.log(key, watch, 'watch')
    let handler = watch[key]
    if (Array.isArray(handler)) {
      for(let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, key, handler) {
  return vm.$watch(key, handler)
}

function initComputed(vm, computed) {
  const watchers = vm._computedWatchers = {}
  for(let key in computed) {
    const userDef = computed[key]

    // 依赖的属性变化就重新赋值 get
    let getter = typeof userDef == 'function'? userDef: userDef.get
    // 每个计算属性本质就是watcher
    //将watcher和属性做一个映射
    watchers[key] = new Watcher(vm, getter, ()=>{}, {lazy: true})// 默认不执行
    // 将key定义在vm上
    defineComputed(vm, key, userDef)
  }
}

function createComputedGetter (key) {
  return function computedGetter() {// 取计算属性的值执行这个函数
    //this._computedWatchers包含所有的计算属性
    // 通过key可以拿到对应的watcher,这个watcher中包含了getter
    let watcher = this._computedWatchers[key]
    //脏需要调用用户getter
    if(watcher.dirty) {//根据dirty属性判断是否重新求值
      watcher.evaluate()
    }

    // 如果当前取完值后,Dep.target还有值需要继续向上收集
    if(Dep.target) {
      // 计算属性watcher内部有两个dep
      watcher.depend()// watcher里对应了多个dep
    }

    return watcher.value
  }
}

function defineComputed(vm, key, userDef) {
  let sharedProperty = {}
  if(typeof userDef == 'function') {
    sharedProperty.get = createComputedGetter(key)
  } else {
    sharedProperty.get = createComputedGetter(key)
    sharedProperty.set = userDef.set
  }
  Object.defineProperty(vm, key, sharedProperty)
}