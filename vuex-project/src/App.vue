<template>
  <div id="app">
    名字是{{this.$store.state.name}}
    年龄是{{this.$store.getters.myAge}}
    <button @click="$store.commit('chnageAge', 10)">点击</button>
    <button @click="$store.dispatch('chnageAge', 10)">异步点击</button>

    t1年龄{{this.$store.state.a.name}}
  </div>
</template>

<script>

export default {
  name: 'app'
  
}
</script>

<style>

</style>

