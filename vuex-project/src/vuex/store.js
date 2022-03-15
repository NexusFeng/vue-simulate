import ModuleCollection from '../vuex/module/module-collection'
class Store {
  constructor(options) {
    // 对用户的模块进行整合
    let r = new ModuleCollection(options) //对用户的参数进行格式化操作
  }
}

export default Store