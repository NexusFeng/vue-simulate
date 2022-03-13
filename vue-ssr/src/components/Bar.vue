<template>
  <div>
    bar
    {{$store.state.name}}
  </div>
</template>

<style  scoped>
div{
  background:red;
}
</style>
<script>
export default {
  asyncData(store) { //再服务端执行的方法
    return store.dispatch('changeName')
  }
}
</script>