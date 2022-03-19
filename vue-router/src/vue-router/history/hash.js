import History from "./base";

function ensureHash() {
  if(!window.location.hash) {
    window.location.hash = '/'
  }
}

function getHash() {
  return window.location.hash.slice(1)
}

export default class Hash extends History {
  constructor(router) {
    super(router)
    // hash路由初始化时， 需要增加一个默认hash值 /#/
    ensureHash()
  }
  getCurrentLocation() {
    return getHash()
  }
  setUpListener() {
    window.addEventListener('hashchange', () => {
      // hash值变化后再去切换组件渲染
      this.transitionTo(getHash())
    })
  }
} 