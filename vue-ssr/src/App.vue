<template>
  <div>
    <Foo></Foo>
    <Bar></Bar>
  </div>
</template>

<script>
import Bar from './component/Bar.vue'
import Foo from './component/Foo.vue'
export default {
  components: {
    Bar,
    Foo
  },
  data() {
    return {

    }
  }
}
</script>