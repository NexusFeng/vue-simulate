import Store from "./src/vuex/store"

// router.js

// Object.values(hooks).forEach(hook => {
//   router.beforeEach(hook)
// })


export default{
  'clear_token': (to, from, next) => {
    Store.commit('clearToken') //清空token
    next()
  }
}