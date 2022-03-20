export default {
  functional: true,  //函数式组件 无状态(无数据data) 纯展示 性能高  会导致render函数中没有this了
  // 正常组件是一个类,如果是函数式组件就是一个普通函数
  props: {
    to: {
      type: [String, Object],
      required: true
    }
  },
  // render函数的第二个参数,是内部自己声明的一个对象
  render(h, {props, slots, data, parent}) {
    const click = () => {
      parent.$router.push(props.to)
    }
    return <a onClick={click}>{slots().default}</a>
  }
}