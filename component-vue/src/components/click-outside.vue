<template>
  <div class="box" v-click-outside = "hide">
    <input type="text" @focus="show" >
    <div v-show="isShow">
      面板
    </div>
  </div>
</template>
<script>
//指令特点 可以复用 核心是控制dom 给dom元素绑定事件
//自定义指令核心就是操作dom
//图片懒加载  虚拟滚动
export default {
  name: "clickOutSide",
  directives: {
    clickOutside: { // => 默认bind+update
      bind(el, bindings, vnode) {
        const handler = e => {
          if(!el.contains(e.target)) {
            //点击的是外面
            let fn = vnode.context[bindings.expression] //hide
            fn()
          }
        }
        el.handler = handler
        document.addEventListener('click', handler)
      },
      unbind(el){
        document.removeEventListener('click', el.handler)
      }
    }
  },
  data() {
    return{ //data是函数为了防止变量污染
      isShow: false
    }
  },
  methods: {
    show() {
      this.isShow = true
    },
    hide(){
      this.isShow = false
    }
  }
}
</script>

<style>
.box{
  display: inline-flex;
  flex-direction: column;
  border: 1px solid red;
}
</style>