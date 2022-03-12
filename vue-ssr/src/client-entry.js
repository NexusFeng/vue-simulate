//客户端渲染

//每个用户访问服务器 都需要产生一个新的实例 不能所有的用户使用同一个实例

//打包两份,服务端提供的是字符串,没有实际功能,打包客户端的为了提供给页面功能

import createApp from './app'

let {app} = createApp()

app.$mount('#app') //客户端渲染可以直接使用client-entry.js