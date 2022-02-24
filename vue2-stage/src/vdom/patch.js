
export function patch(oldVnode, vnode) {
  if (!oldVnode) {
    return createElm(vnode) // 如果没有el元素，那就直接根据虚拟节点返回真实节点
  }
  if(oldVnode.nodeType === 1) {
    console.log(oldVnode, 'oldVnode')
    //用vnode生成真实dom，替换原本的dom元素
    const parentElm = oldVnode.parentNode //找到它的父亲
    let elm = createElm(vnode) // 根据虚拟节点 创建元素
    parentElm.insertBefore(elm, oldVnode.nextSibling)
    // 第一次渲染删除节点，下次再使用无法获取
    parentElm.removeChild(oldVnode)
    return elm
  }
}

function createComponent(vnode) {
  let i = vnode.data
  if ((i = i.hook) && (i = i.init)) {
    i(vnode)//调用init方法
  }
  if(vnode.componentInstance) { //有属性说明子组件new完毕了，并且组件对应的真实dom挂载到了vnode.componentInstance.$el上
    return true
  }
}

//创建真实节点
function createElm(vnode) {
  let {tag, data, children, text, vm} = vnode
  if(typeof tag === 'string') { // 元素

    if(createComponent(vnode)) {
      //返回组件对应的真实节点
      return vnode.componentInstance.$el

    }

    vnode.el = document.createElement(tag) //虚拟节点会有一个el属性,对应真实节点
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    })


  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}