import { observe } from "./observer/index"
import { isFunction } from "./util"

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
  // if (opts.watch) {
  //   initWatch()
  // }
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