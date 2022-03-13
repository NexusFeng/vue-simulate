<template>
<!-- 得加一个id -->
  <div id="app">
    <router-link to="/">foo</router-link>
    <router-link to="/bar">bar</router-link>
    <router-view></router-view>
    <!-- <Foo></Foo>
    <Bar></Bar> -->
  </div>
</template>

<script>
// import Bar from './components/Bar.vue'
// import Foo from './components/Foo.vue'
export default {
  // components: {
  //   Bar,
  //   Foo
  // },
  data() {
    return {

    }
  }
}
</script>