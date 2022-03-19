import { createRouteMap } from "./create-route-map"

export function createMatcher(routes) {

  // 路径和记录匹配
  let { pathMap } = createRouteMap(routes) //创建映射表
  // 动态路由就是将新的路由插入到老的路由的映射表中
  function addRoutes(routes) {
    //将新的路由添加到pathMap中
    createMatcher(routes, pathMap)
  }

  function match(path) {
    // 去pathMap中去找对应的记录
    return pathMap[path]
  }

  return {
    addRoutes,
    match
  }
}