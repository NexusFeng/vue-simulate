// vuex
// state: {
//   tokens: []
// },
// mutations: {
//   setToken(state, token){
//     // 希望状态被跟踪,一般不采用push
//     // state.tokens.push(tokens)
//     state.tokens = [...state.tokens, token] //存储token
//   },
//   clearToken(state){
//     state.token.forEach(token => token()) //执行所有的取消放法
//     state.token = [] //清空列表
//   }
// }



// 数组可追踪
// 用push数组的地址不变
// let s1 = [] => 地址0xfff1
// let s2 = [] => 地址0xfff2
// 用push
// let s1 = [].push => 地址0xfff1



import axios from 'axios'
import Store from './src/vuex/store'
class HttpRequest {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production'? '/': 'loaclhost:8000'
    this.timeout = 3000
    // queue可以做loading处理
    this.queue = {} // 专门用来维护请求队列
    // 页面切换取消请求
  }

  setInterceptor(instance, url) {//拦截器

    instance.interceptor.request.use((config) => {
      //开启loading
      if(Object.keys(this.queue).length == 0) {
        // open loading
      }

      // 可以记录请求的取消函数
      let CancelToken = axios.CancelToken
      config.cancelToken = new CancelToken(c => {//c可以存到vuex中,页面切换的时候,组件销毁的时候执行
        // c就是当前取消请求的token
         Store.commit('setToken', c)
      })
      
      this.queue[url] = true

      return config //拓展请求配置
    })

    instance.interceptor.response.use((res) => {
      delete this.queue[url] // 一旦响应了 ,就从队列删除
      if(Object.keys(this.queue).length == 0) {
        // close loading
      }
      if(res.data.err == 0) {
        return res.data.data
      } else {
        return Promise.reject(res.data) //失败抛异常
      }
    }, err => {
      if(Object.keys(this.queue).length == 0) {
        // close loading
      }
      delete this.queue[url]
      return Promise.reject(err)
    })


  }

  request(options) {// 进行请求操作
    //每次请求可以创建一个新的实例  
    let instance = axios.create()
    let config = {
      baseURL: this.baseURL,
      timeout:this.timeout,
      ...options
    }
    this.setInterceptor(instance,config.url)
    return instance(config)//产生一个promise
  }

  get(url, data) {
    return this.request({
      url,
      method: 'get',
      ...data
    })
  }

  post(url, data) {
    return this.request({
      url,
      method: 'post',
      ...data
    })
  }
}
// ab用的同一个实例，拦截器会共享 a、b需要独立的拦截器
export default new HttpRequest