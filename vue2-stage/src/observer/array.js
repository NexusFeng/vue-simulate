let oldArrayPrototype = Array.prototype
// 继承数组方法
export let arrayMethods = Object.create(oldArrayPrototype)
// arrayMethods.__proto__ = Array.prototype 

//只有这7个可以改变原数组
let methods = [
  'push',
  'shift',
  'unshift',
  'pop',
  'reverse',
  'sort',
  'splice'
]

methods.forEach(method => {
  // 用户调用的如果是以上七个方法,会用重写的,负责调用原来的数组方法
  arrayMethods[method] = function (...args) {
    // 此处this是数组
    oldArrayPrototypep[method].call(this, ...args)
    let inserted
    let ob = this.__ob__//根据当前数组获取observe实例
    switch(method){
      case 'push':
      case 'unshift':
        inserted = args // 就是新增的内容
        break
      case 'splice':
        inserted = args.slice(2)
        break
      default: 
        break
    }
    // 如果有新增的内容要继续劫持 需要观测数组每一项,而不是数组
    if(inserted) ob.observeArray(inserted)

    // arr.push({a:1}, {b:2})
    // arr.splice(0, 1, xxxx)
  }
})