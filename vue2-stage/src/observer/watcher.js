import { popTarget, pushTarget } from "./dep"

let id = 0
class Watcher {
   // vm, updateComponent, () => {回调}, true
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    this.cb = cb
    this.options = options
    this.id = id++
    this.deps = []
    this.depsId = new set()

    // 默认应该执行exprOrFn， render(去vm上取值)
    this.getter = exprOrFn

    this.get() // 默认初始化要取值
  }

  get() { //用户更新时可以重新调用get
    // 取值时会调defineProperty.get方法， 每个属性都可以收集自己的watcher，一个属性对应多个watcher，一个watcher可以对应多个属性
    pushTarget(this)
    this.getter()
    popTarget()// Dep.target = null, 如果Dep.target有值说明这个变量在模板中使用了
  }
  addDep(dep) {
    let id = dep.id
    if(this.depsId.has(id)) {
      this.depsId.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }
  update() {
    this.get()
  }
 }

 export default Watcher