<template>
  <div id="app">
    名字是{{this.$store.state.name}}
    年龄是{{this.$store.getters.myAge}}
    <button @click="$store.commit('changeAge', 10)">点击</button>
    <button @click="$store.dispatch('changeAge', 10)">异步点击</button>

    t1年龄{{this.$store.state.a.name}}
    <button @click="registerModule">动态注册模块</button>
    {{$store.state.b.name&&$store.state.b.name}}  {{$store.state.b.age&&$store.state.b.age}}
  </div>
</template>

<script>
import store from './store'

export default {
  name: 'app',
  methods: {
    registerModule() {
      store.registerModule('b', {
        state: {
          name: 'fem=ng', 
          age: 18
        }
      })
    }
  }
  
}
</script>

<style>

</style>

