import Vue from 'vue'
// import Vuex from '@/vuex'
import Vuex from '../vuex/index'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    name: 'feng',
    age: 18
  },
  mutations: {
    changeAge(state, payload) {
      state.age += payload
    }
  },
  actions: {
    changeAge({commit}, payload) {
      setTimeout(() => {
        commit('changeAge', payload)
      }, 1000)
    }
  },
  getters: {
    myAge(state) {
      return state.age + 10
    }
  },
  modules: {
    namespaced: true,//能解决子模块和父模块的命名空间，相当于增加了一个命名空间
    // 如果没有namespaced 默认getters都会被定义到父模块上
    // mutations会被合并到一起 最终一起调用,有了命名模块避免了这个问题
    // 子模块的名字不能和父模块中的状态重名
    a: {
      state: {
        name: 't1',
        age: 10
      },
      // 所有的getters都会合并
      getters: {
        aAge() {

        }
      },
      mutations: {

      }
    },
    b: {
      state: {
        name: 't2',
        age: 20
      }
    }
  }
})
