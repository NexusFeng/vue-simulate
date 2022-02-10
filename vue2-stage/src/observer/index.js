import { isObject } from "../util";

//检测数据变化，类有类型,对象无类型
class Observer{
  constructor(data) {//对对象中的所有属性进行劫持
    this.walk(data)
  }
  walk(data) {//传入的对象
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
}

//vue2会对对象进行遍历,将每个属性用defineProperty重新定义,所以导致性能差
function defineReactive(data, key, value){//value有可能是对象
  observe (data)//本身用户默认值是对象套对象,需要递归处理（性能差）
  Object.defineProperty(data, key,{
    get() {
      return value
    },
    set(newV) {
      observe (newV)// 如果用户赋值一个新对象,需要将这个对象进行劫持
      value = newV
    }
  })
}

export function observe (data) {
  //如果是对象才观测
  if(!isObject(data)) {
    return
  }
  return new Observer(data)
}