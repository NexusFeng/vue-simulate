// 标签名
var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
// 获取标签名 match后的索引为1的
var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
// 匹配开始标签
var startTagOpen = new RegExp(("^<" + qnameCapture));
// 匹配标签的关闭 <div/>
var startTagClose = /^\s*(\/?)>/;
// 匹配闭合标签
var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
// 匹配属性 aa = "xxx" | 'xxx' | xxx  a=b a="b" a ='b'
var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// 匹配大括号 {{}}
var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

//将解析后的结果 组装成一个树结构 ast树 栈

function createAstElement(tagName, attrs) {
  return {
    tag: tagName,
    type: 1,
    children: [],
    parent: null,
    attrs
  }
} 

let root = null
let stack = []
function start (tagName, attributes) {
  let parent = stack[stack.length - 1]
  let element = createAstElement(tagName, attributes)
  if (!root) {
    root = element
  }
  element.parent = parent //当放入栈中时,记录父亲是谁
  if (parent) {
    element.children.push(element)
  }
  stack.push(element)
}

function end (tagName) {
  console.log(tagName, 'end')
  let last = stack.pop()
  if (last.tag !== tagName) {
    throw new Error('标签有误')
  }
}

function chars(text) {
  text = text.replace(/\s/g, "")
  let parent = stack[stack.length - 1]
  if (text) {
    parent.children.push({
      type: 3,
      text
    })
  }

}

// html字符串解析成dom树 解析成对应的脚本  <div id = 'app'> {{name}} </div>

function parserHTML(html) { // <div id="app">111</div>
  

  function advance(len){
    html = html.substring(len)
  }

  function parseStartTag() {
    const start = html.match(startTagOpen)
    if(start){
      const match = {
        tagName: start[1],
        attrs: []
      }
      // 去掉匹配到的开始标签
      advance(start[0].length)
      let end
      // 如果没有遇到标签结尾就不停的解析
      let attr
      while (!(end  = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({name: attr[1], value:attr[3] || attr[4] || attr[5]})
        advance(attr[0].length)
      } 
      if (end) {
        advance(end[0].length)
      } 
      return match
    }
    return false // 不是开始标签
  }

  while (html) { // 看解析的内容是否存在，如果存在就不停的解析
    let textEnd = html.indexOf('<') // 当前解析的开头
    if (textEnd == 0) {

      const startTagMatch = parseStartTag() // 解析开始标签
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }

      const endTagMatch = html.match(endTag)
      if(endTagMatch) {
        end(endTagMatch[1])
        advance(endTagMatch[0].length)
        continue
      }
    }
    let text // 123123</div>
    if(textEnd > 0) {
      text = html.substring(0, textEnd)
    }
    if(text) {
      chars(text)
      advance(text.length)
    }
  }
}

export function compileToFunction(template) {
  
  parserHTML(template)
  console.log(root)
}