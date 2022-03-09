<template>
  <div id="app">
    <!-- <ClickOutSide></ClickOutSide> -->
    <VueLazyLoad></VueLazyLoad>
  </div>
</template>

<script>
// import ClickOutSide from "@/components/click-outside.vue"
import VueLazyLoad from "@/components/vue-lazyload.vue"
export default {
  name: 'App',
  components: {
    VueLazyLoad
  }
}
</script>

<style>

</style>
