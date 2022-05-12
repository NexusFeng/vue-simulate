
export function patch(oldVnode, vnode) {
  if (!oldVnode) {
    return createElm(vnode) // 如果没有el元素，那就直接根据虚拟节点返回真实节点
  }
  if(oldVnode.nodeType == 1) {
    //用vnode生成真实dom，替换原本的dom元素
    const parentElm = oldVnode.parentNode //找到它的父亲
    let elm = createElm(vnode) // 根据虚拟节点 创建元素
    parentElm.insertBefore(elm, oldVnode.nextSibling)
    // 第一次渲染删除节点，下次再使用无法获取
    parentElm.removeChild(oldVnode)
    return elm
  } else {
    // 如果标签名称不一样 直接删掉老的换成新的即可
    if(oldVnode.tag !== vnode.tag) {
      // 可以通过vnode.el属性获取现在的真实dom
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }

    let el = vnode.el = oldVnode.el //表示当新节点复用老节点
    
    // 如果两个虚拟节点是文本节点 比较文本内容
    if(vnode.tag == undefined) {//新老都是文本
      if(oldVnode.text !== vnode.text) {
        el.textContent = vnode.text
      }
      return
    }
    //如果标签一样 比较属性,传入新的虚拟节点,和老的属性，用新的属性更新老的
    patchProps(vnode, oldVnode.data)
    // 属性可能有删除的情况

    // 一方有儿子 一方没儿子
    let oldChildren = oldVnode.children || []
    let newChildren = vnode.children || []
    if(oldChildren.length > 0 && newChildren.length > 0) {
      // 双方都有儿子
      // vue用了双指针方法比对 同层比对
      patchChildren(el, oldChildren, newChildren)


    } else if (newChildren.length > 0) { // 老的没儿子,但是新的有儿子
      for (let i = 0; i < newChildren.length; i++) {
        let child = createElm(newChildren[i])
        el.appendChild(child) // 循环创建新节点
      }
    } else if (oldChildren.length > 0){ // 老的有儿子 新的没儿子
      el.innerHTML = `` //直接删除老节点
    }
    // vue的特点是每个组件都有一个watcher，当前数组中的数据变化 只需要更新当前组件
    return el
  }
}

function isSameVnode(oldVnode, newVnode) {
  return (oldVnode.tag == newVnode.tag) && (oldVnode.key == newVnode.key)
}


//dom的生成 ast => render方法 => 虚拟节点 => 真实dom
//更新时需要重新创建ast语法树吗？
//如果动态添加了节点(绕过vue添加的vue监控不到)
// 后续数据遍历,只会操作自己管理的dom元素

//如果直接操作dom和vue无关,不需要重新创建ast语法树 ast语法树只创建了一次


function patchChildren (el, oldChildren, newChildren) {

  let oldStartIndex = 0
  let oldStartVnode = oldChildren[0]
  let oldEndIndex = oldChildren.length - 1
  let oldEndVnode = oldChildren[oldEndIndex]

  let newStartIndex = 0
  let newStartVnode = newChildren[0]
  let newEndIndex = newChildren.length - 1
  let newEndVnode = newChildren[newEndIndex]
  //做映射表
  const makeIndexByKey = (children) => {
    return children.reduce((memo, current,index) => {
      if(current.key) {
        memo[current.key] = index
      }
      return memo
    }, {})
  }
  const keysMap = makeIndexByKey(oldChildren)
  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 头头比较 尾尾比较 头尾比较 尾头比较
    // 优化了 向后添加 向前添加 尾部移动到头部 头部移动到尾部 反转
    if(!oldStartVnode) {// 已经被移走了
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex]
    }
    // 同时循环新的节点和老的节点，有一方循环完毕就结束了
    if(isSameVnode(oldStartVnode, newStartVnode)) { //头头比较，标签一致，
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if(isSameVnode(oldEndVnode, newEndVnode)) {// 从尾部开始比较
      patch(oldStartVnode, newStartVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    }
    // 头尾比较=> reverse
    else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patch(oldStartVnode, newEndVnode)
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)// 移动老的元素，老的元素就会被移走不用删除
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    }
    // 尾头比较
    else if (isSameVnode(oldEndVnode, newStartVnode)){
      patch(oldEndVnode, newStartVnode)
      el.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    }else { //乱序比对  核心diff
      // 1.需要根据key和对应的索引将老的内容生成映射表
      let moveIndex = keysMap[newStartVnode.key]

      if(moveIndex == undefined) { // 如果不能复用直接创建新的插入到老的节点开头处
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      } else {
        let moveNode = oldChildren[moveIndex]
        oldChildren[moveIndex] = null
        el.insertBefore(moveNode.el, oldStartVnode.el)
        patch(moveNode, newStartVnode)//比较两个节点的属性
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }
  
  // 用户追加一个元素

  // 尾部追加
  if (newStartIndex <= newEndIndex) {
    for(let i = newStartIndex; i <= newEndIndex; i++) {
      // el.appendChild(createElm(newChildren[i]))
      // insertBefore方法可以实现appendChild功能

      // 判断尾指针的下一个元素是否存在
      let anchor = newChildren[newEndIndex + 1] == null? null : newChildren[newEndIndex + 1].el
      // node.insertBefore(newnode,existingnode) newnode:必需。需要插入的节点对象。existingnode 可选。在其之前插入新节点的子节点。如果未规定，则 insertBefore 方法会在结尾插入 newnode。
      el.insertBefore(createElm(newChildren[i]),anchor)
    }
  }

  if (oldStartIndex <= oldEndIndex) {
    for(let i = oldStartIndex; i <= oldEndIndex; i++) {
      // 如果老的多 将老节点删除  但是可能里边有null的情况
      if(oldChildren[i] !== null) el.removeChild(oldChildren[i].el)
    }
  }

}

// 创建真实节点
function patchProps(vnode, oldProps = {}) { // 初次渲染时可以调用此方法,后续更新也可以调用此方法
  let newProps = vnode.data || {}
  let el = vnode.el
  // 如果老的属性有,新的属性没有 直接删除
  let newStyle = newProps.style || {}
  let oldStyle = oldProps.style || {}

  for(let key in oldStyle) {
    if (!newStyle[key]) { //新的里边不存在这个样式
      el.style[key] = ''
    }
  }
  for(let key in oldProps) {
    if (key === 'style') {

    }
    if(!newProps[key]) {
      el.removeAttribute(key)
    }
  }
  for(let key in newProps) {
    if(key === 'style') {
      for(let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    } else {
      el.setAttribute(key, newProps[key])
    }
    
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
export function createElm(vnode) {
  let {tag, data, children, text, vm} = vnode
  if(typeof tag === 'string') { // 元素

    if(createComponent(vnode)) {
      //返回组件对应的真实节点
      return vnode.componentInstance.$el

    }

    vnode.el = document.createElement(tag) //虚拟节点会有一个el属性,对应真实节点
    patchProps(vnode)
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    })


  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}