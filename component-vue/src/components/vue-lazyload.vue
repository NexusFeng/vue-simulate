<template>
  <div class="box">
    <li v-for="(l,index) in list" :key="index">
      <img :src="l" >
    </li>
  </div>
</template>
<script>
import VueLazyLoad from './vue-lazyload.js'
import Vue from 'vue'
Vue.use(VueLazyLoad, {
  loading: logo,
  preload: 1.2
}

)
export default {

  data() {
    return{ 
      list: []
    }
  },
  // created() { // 服务器端渲染支持created 所以把请求写在这里保持和服务端一致

  // },
  async mounted() {//服务端不支持mounted
    let {data: imgs} = await axios.get('/api')
    this.list = imgs
  },
  methods: {
  }
}
</script>

<style>
.box{
  width: 400px;
  height: 400px;
  overflow: scroll;
}
img{
  width: 100px;
  height: 150px;
}
</style>