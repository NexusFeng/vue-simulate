import { generate } from "./generate";
import { parserHTML } from "./parder";


export function compileToFunction(template) {
  
  let root = parserHTML(template)

  //生成代码
  let code = generate(root)


  // render(){
  //   return _c('div', {id: 'app'}, 'hello')
  // }
   
  // 虚拟dom
  // {tag: div, data:{id: 'app', a:1},children: [{text:'hello'}]}

  // html => ast（只能描述语法 语法不存在的属性无法描述） => render函数 => 虚拟dom (增加额外的属性) => 生成真实dom

  
}