export let Vue
function install (_Vue) {
  Vue = _Vue
  Vue.mixin({ //this代表的是每个组件实例
    beforeCreate(){
      //获取根组件上的store将它共享给每个组件

      // 每个组件中都应该有$store
      let options = this.$options
      if(options.store) {
        //根
        this.$store = options.store
      } else {
        
        if(this.$parent && this.$parent.$store){
          //子组件
          // 先保证他是一个子组件,并且父亲上有$store
          this.$store = this.$parent.$store
        }
      }

    }
  })
}

export default install