export function createRouteMap(routes, oldPathMap) {
  // 如果有oldPathMap,需要将routes格式化后 放入oldPathMap中

  // 如果没有传 需要生成一个映射表

  let pathMap = oldPathMap || {}

  routes.forEach(route => {
    addRouteRecord(route, pathMap)
  });

  return {
    pathMap
  }
}

function addRouteRecord(route, pathMap, parent){
  let path = parent ? `${parent.path} / ${route.path}`: route.path
  // 将记录和路径关联起来
  let record = { // 最终路径  会匹配到这个记录 里边可以自定义属性等
    path,
    component: route.component,
    props: route.props || {},
    parent
  }

  pathMap[path] = record
  route.children && route.children.forEach( children => {
    addRouteRecord(children, pathMap,record) // 再循环儿子的时候将父路径也同时传进去，目的是为了再子路由添加时可以拿到父路径
  })

}