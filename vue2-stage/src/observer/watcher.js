import { popTarget, pushTarget } from "./dep"
import { queueWatcher } from "./scheduler"

let id = 0
class Watcher {
   // vm, updateComponent, () => {回调}, true
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.exprOrFn = exprOrFn// exprOrFn
    this.user = !!options.user//是不是用户watcher
    this.cb = cb
    this.dirty = options.lazy // 如果是计算属性, 那麽默认值lazy: true, dirty: true
    this.lazy = !!options.lazy
    this.options = options
    this.id = id++
    this.deps = []
    this.depsId = new Set()
    if(typeof exprOrFn == 'string') {
      this.getter = function() {//需要将表达式转成函数
        //当数据取值时会进行依赖收集 age.n => vm['age]['n']
        let path = exprOrFn.split('.') // [age, n]
        let obj = vm
        for(let i = 0; i < path.length; i++) {
          obj = obj[path[i]]
        }
        return obj
      }
    } else {
      // 默认应该执行exprOrFn， render(去vm上取值)
      this.getter = exprOrFn
    }
    // 第一次的value
    this.value = this.lazy? undefined: this.get() // 默认初始化要取值
  }

  get() { //用户更新时可以重新调用get
    // 取值时会调defineProperty.get方法， 每个属性都可以收集自己的watcher，一个属性对应多个watcher，一个watcher可以对应多个属性
    pushTarget(this)
    const value = this.getter.call(this.vm)
    popTarget()// Dep.target = null, 如果Dep.target有值说明这个变量在模板中使用了

    return value
  }
  addDep(dep) {
    let id = dep.id
    if(!this.depsId.has(id)) {
      this.depsId.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }
  update() { // vue中的更新操作是异步的
    // this.get()
    if (this.lazy) {
      this.dirty = true
    } else {
      // 每次更新时 this=> watcher
      queueWatcher(this) //多次调用update 先将watcher缓存下来,等一会一起更新
    }
    
  }
  run() {
    let newValue = this.get()
    let oldValue = this.value
    this.value = newValue //为了保证下一次更新时 上一次的最新值时下一次的旧值
    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue)
    }
  }
  evaluate() {
    this.dirty = false //false表示取过值了 
    this.value =  this.get()//用户的getter执行
  }
  depend() {
    let i = this.deps.length
    while(i--) {
      this.deps[i].depend()//name friends收集watcher
    }
  }
 }

 // watcher 和dep
 //将更新的功能封装成一个watcher
 // 渲染前会将当前watcher放在Dep类上
 // 在vue中页面渲染时使用的属性,需要进行依赖收集,收集对象的渲染watcher
 // 取值时,给每个属性都加dep属性,用于储存这个渲染watcher （同一个watcher会对应多个dep）
 // 每个属性可能对应多个视图（多个视图多个watcher） 一个属性要对应多个watcher
 // dep.depend（） => 通知dep存放watcher => Dep.target.addDep() => 通知watcher存放dep
 // 双向存储
 export default Watcher