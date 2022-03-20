// 路由公共方法

function createRoute(record, location) {//创建路由
  const matched = []
  if (record) {
    while(record) { // 不停的查找父级
      matched.unshift(record)
      record = record.parent
    }
  }
  return {
    ...location,
    matched: []
  }
}

// 依次执行队列逻辑
function runQueue(queue, iterator, cb) {
  function step(index) {
    if(index >= queue.length) return cb()
    let hook = queue[index]
    iterator(hook, () => step(index++))
  }
  step(0)
}

export default class History {
  constructor(router) {
    this.router = router

    // 用一个数据来保存路径的变化
    // 当前没有匹配到记录
    this.current = createRoute(null, {
      path: '/'
    }) // => {path: '/', matched: []}
  }
  listen(cb){ // 保存当前的cb函数
    this.cb = cb
  }

  transitionTo(path, cb) {
    let record = this.router.match(path)// 匹配到后
    // 更新current 需要重新渲染视图
    // 如果两次路由一致 不需要跳转了
    let route = createRoute(record, {path})
    // 1.保证跳转的路径 和 当前路径一致
    // 2.匹配到的记录个数应该和当前匹配的个数一致 说明是相同路由
    if(path === this.current.path && route.matched.length === this.current.matched.length) {
      return 
    }

    // 在跳转前先走对应的钩子
    let queue =  this.router.beforeHooks
    const iterator = (hook,next) => { //此迭代函数可以拿到对应的hook
      hook(route, this.current, next)
    }
    runQueue(queue, () => {
      // 修改current _route实现跳转
      this.updateRoute(route)
      cb && cd() //默认第一次cb是hashchange

      // 后置钩子
    })

    
  }
  updateRoute(route) {
    this.current = route
    // 路径变化 需要渲染组件  响应式原理
    // 需要将current属性变成响应式的，后续更改current就可以渲染组件了
    // Vue.util.defineReactive() === defineReactive
    // 可以再router-view组件中使用current属性  如果路径变化了就可以更新router-view了
    this.cb && this.cb() // 不光要改变current,还要改变_route
  }
}