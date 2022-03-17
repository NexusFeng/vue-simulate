import { forEach } from "../utils"
import Module from "./module"

class ModuleCollection {
  constructor(options){
    //对数据进行格式化
    this.root = null
    this.register([], options)// 为了记录父子关系
  }
  getNamespace(path) {
    let root = this.root
    let ns =  path.reduce((ns, key) => {
      let module = root.getChild(key)
      root = module
      return module.namespaced ? ns + key + '/' : ns
    }, '')
    return ns
  }
  register(path, rawModule) {
    let newModule = new Module(rawModule)
    
    if(path.length == 0) {
      this.root = newModule
    } else {
      //根据当前注册的key, 将它注册到对应的模块的儿子处
      let parent = path.slice(0, -1).reduce((memo, currrent) => {
        return memo.getChild(currrent)
      }, this.root)
      parent.addChild(path[path.length - 1], newModule)
    }
    // 注册完当前模块，再进行注册根模块
    if (rawModule.modules) {
      forEach(rawModule.modules, (module, key) => {
        this.register(path.concat(key), module)
      })
    }
  }
}
export default ModuleCollection

// 格式化后的树
// this.root = {
//   _raw: 用户定义的模块,
//   state: 当前模块自己的状态,
//   _children: {// 孩子列表
//     a: {
//       _raw: 用户定义的模块,
//       state: 当前模块自己的状态,
//       _children: {// 孩子列表

//       }
//     }
//   }
// }