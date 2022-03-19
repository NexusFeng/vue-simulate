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

export default class History {
  constructor(router) {
    this.router = router

    // 用一个数据来保存路径的变化
    // 当前没有匹配到记录
    this.current = createRoute(null, {
      path: '/'
    })
  }

  transitionTo(path, cb) {
    let record = this.router.match(path)
    // 匹配到后
    this.current = createRoute(record, {
      path
    })
    // 路径变化 需要渲染组件  响应式原理
    // 需要将current属性变成响应式的，后续更改current就可以渲染组件了
    // Vue.util.defineReactive() === defineReactive

    // 可以再router-view组件中使用current属性  如果路径变化了就可以更新router-view了

    cb && cd()
  }
}