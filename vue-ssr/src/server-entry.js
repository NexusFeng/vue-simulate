//服务端入口

import createApp from './app'



// 服务端渲染可以返回一个函数

export default ({url}) => {// 服务端调用方法时会传入url属性
  // 此方法是在服务端调用的
  //路由时异步组件,需要等路由加载完成
  return new Promise((resolve,reject) => {
    let {app, router} = createApp()
    router.push(url)
    router.onReady(() => { //等待路由跳转完成  组件已经准备好了再触发
      const matchComponents = router.getMatchedComponents()
      if(matchComponents.length == 0) {//没有匹配到前端路由
        return reject({code: 404})
      } else {
        resolve(app)
      }
    })
  })
  
  // router.push('/')//表示永远跳转/路由
  // app对应的就是 new Vue 并没有被路由所管理,希望等到路由跳转完毕后 再进行服务端渲染

  // 当用户访问了一个不存在的页面,如何匹配到前端的路由

  // return app // 每次都能产生一个新的应用
}

//当用户访问bar的时候,服务端直接进行了服务端渲染,渲染后的结果返回给了浏览器,浏览器加载js脚本,根据路径加载js脚本，又重新渲染了bar