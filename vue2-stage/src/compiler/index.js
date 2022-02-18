import { generate } from "./generate";
import { parserHTML } from "./parser";


export function compileToFunction(template) {
  
  let root = parserHTML(template)
  //生成代码
  let code = generate(root)
  console.log(code, 'code')
  let render = new Function(`with(this){return ${code}}`) //code中会用到数据,数据在vm上

  return render

  // render(){
  //   return _c('div', {id: 'app'}, 'hello')
  // }
   
  // 虚拟dom
  // {tag: div, data:{id: 'app', a:1},children: [{text:'hello'}]}

  // html => ast（只能描述语法 语法不存在的属性无法描述） => render函数 (with + new Function) => 虚拟dom (增加额外的属性) => 生成真实dom

  
}

// with用法
// let vm = {arr: 1}
// with(vm) {
//   console.log(arr) // 1
// }