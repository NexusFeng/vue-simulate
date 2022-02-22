import { isObject } from "../util";
import { arrayMethods } from "./array";
import Dep from './dep'

// 1.如果数据是对象 会将对象不停的递归 进行劫持
// 2.如果是数组, 会劫持数组的方法 并对数组中不是基本数据类型的进行检测

//检测数据变化，类有类型,对象无类型

// 如果给对象新增一个属性不会触发视图更新（给对象本身也增加一个dep，dep中存watcher，如果增加一个属性后，就手动触发watcher的更新）
class Observer{
  constructor(data) {//对对象中的所有属性进行劫持

    this.dep = new Dep()//数据可能是数组或者对象

    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false //不可枚举
    })
    // data.__ob__ = this //所有被劫持过的属性都有__ob__
    if(Array.isArray(data)) {
      //数组劫持，对数组原来方法改写,切片编程
      data.__proto__  = arrayMethods
      //如果数组中的数据是对象类型,需要监控对象的变化
      this.observeArray(data)
    }else {
      this.walk(data) //对象劫持
    }
  }

  observeArray(data) { //对数组中的数组和数组中的对象再次劫持
    //如果数组里放的是对象类型，也做了观测，JSON.stringify()也做了收集依赖
    data.forEach(item => {
      observe(item)
    })
  }

  walk(data) {//传入的对象
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
}
function dependArray(value) {
  for(let i = 0; i < value.length; i++ ) {
    let current = value[i]
    current.__ob__ && current.__ob__.dep.depend()
    if(Array.isArray(current)) {
      dependArray(current)
    }
  }
}

//vue2会对对象进行遍历,将每个属性用defineProperty重新定义,所以导致性能差
function defineReactive(data, key, value){//value有可能是对象
  let childOb = observe (value)//本身用户默认值是对象套对象,需要递归处理（性能差）
  let dep = new Dep()//每个属性都有一个dep属性
  Object.defineProperty(data, key,{
    get() {
      //取值时将watcher将dep关联起来
      if(Dep.target) {//此值是在模版中取值的
        dep.depend()//让dep记住watcher
        if(childOb) { //可能是数组，也可能是对象
          childOb.dep.depend() //让数组和对象也记录watcher
          if(Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set(newV) {
      // 更新视图
      if (newV !== value) {
        observe (newV)// 如果用户赋值一个新对象,需要将这个对象进行劫持
        value = newV
        dep.notify()//告诉当前的属性存放的watcher执行
      }
    }
  })
}

export function observe (data) {
  //如果是对象类型才观测
  if(!isObject(data)) {
    return
  }
  //判断data有没有被观测
  if(data.__ob__) {
    return data.__ob__
  }
  return new Observer(data)
}