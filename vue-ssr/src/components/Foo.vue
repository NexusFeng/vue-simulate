<template>
  <div @click="show">
    foo
  </div>
</template>

<script>
export default {
  methods: {
    show() {
      console.log('foo')
    }
  }
}
</script>

<style scoped>
div{
  background:red;
}
</style>