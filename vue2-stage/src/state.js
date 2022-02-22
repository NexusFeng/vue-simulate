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
  // if (opts.computed) {
  //   initComputed()
  // }
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