import { forEach } from "../utils"

class ModuleCollection {
  constructor(options){
    //对数据进行格式化
    this.root = null
    this.register([], options)
  }
  register(path, rootModule) {
    let newModule = {
      _raw: rootModule,
      _children: {},
      state: rootModule.state
    }
    if(path.length == 0) {
      this.root = newModule
    }
    if (rootModule.modules) {
      forEach(rootModule.modules, (module, key) => {
        
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