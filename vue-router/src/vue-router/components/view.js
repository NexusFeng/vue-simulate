export default {
  // render函数返回的是虚拟节点
  //render方法和template等价的  => template语法需要被编译成render函数 还可以写jsx语法
  functional: true,
  render(h, {parent,data}) {  // data里可以增加点标识
    let route = parent.$route // 获取current对象
    // 依次将matched的每个结果赋予给router-view
    // 渲染先父后子

    let depth = 0
    while(parent) { //1.得是组件
      if(parent.$vnode && parent.$vnode.data.routerView) {
        depth ++
      }
      parent = parent.$parent  //不停的找父亲
    }
    let record = route.matched[depth] // 默认渲染第一层

    // 当父子嵌套时 有两个router-view /about  /about/a 会有一个是空
    if(!record) {
      return h() // 空
    }
    // 渲染匹配到的组件 加标识避免一致渲染的是第一个
    data.routerView = true
    return h(record.component, data)
  }
}