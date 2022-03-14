//服务端入口

import createApp from './app'



// 服务端渲染可以返回一个函数

export default (context) => {// 服务端调用方法时会传入url属性
  // 此方法是在服务端调用的
  //路由时异步组件,需要等路由加载完成
  const {url} = context
  return new Promise((resolve,reject) => {
    let {app, router, store} = createApp()
    router.push(url)
    router.onReady(() => { //等待路由跳转完成  组件已经准备好了再触发
      const matchComponents = router.getMatchedComponents()

      if(matchComponents.length == 0) {//没有匹配到前端路由
        return reject({code: 404})
      } else {
        //matchComponents 指的是路由匹配到的所有组件(页面级别的组件)
        Promise.all(matchComponents.map(component => {
          if(component.asyncData) { // 服务端再渲染的时候,默认会找到页面级别组件中的asyncData,并且再服务端也会创建一个vuex,传递给asyncData
            return component.asyncData(store)
          }
        })).then(() => {//会默认再window下生成一个变量 内部默认
          context.state = store.state // 服务器执行完毕后 最新的状态保存在store.state上
          resolve(app) //app是已经获取实例的字符串
        })
        
      }
    })
  })
  
  // router.push('/')//表示永远跳转/路由
  // app对应的就是 new Vue 并没有被路由所管理,希望等到路由跳转完毕后 再进行服务端渲染

  // 当用户访问了一个不存在的页面,如何匹配到前端的路由

  // return app // 每次都能产生一个新的应用
}

//当用户访问bar的时候,服务端直接进行了服务端渲染,渲染后的结果返回给了浏览器,浏览器加载js脚本,根据路径加载js脚本，又重新渲染了bar