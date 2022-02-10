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

function initData() {
  let data = vm.$options.data
  // vue2会将data中的所有数据进行劫持 Object.defineProperty
  //这个时候data和vm没有任何关系,通过_data进行关联
  data = vm._data =isFunction(data)?data.call(vm): data

  observe(data)
}