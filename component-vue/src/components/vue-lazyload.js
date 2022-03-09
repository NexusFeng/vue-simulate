
const VueLazyLoad =  {
  install(Vue,options) {
    const lazyClass = lazy(Vue)
    let instance = new LazyClass(options)
    Vue.directive('lazy', {
      bind: instance.add.bind(instance),
      unbind: instance.remove.bind(instance)
    })
  }
}
const lazy  = (vue) => {
  return class LazyClass {
    constructor(options) {
      this.options = options
    }
    add(el) {
      // 1.监控el 是否需要显示
      // 2.绑定滚动事件
    }
    remove(el) {

    }
  }
}

export default VueLazyLoad