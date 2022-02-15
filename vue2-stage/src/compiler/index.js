// 标签名
var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + (unicodeRegExp.source) + "]*";
// 获取标签名 match后的索引为1的
var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
// 匹配开始标签
var startTagOpen = new RegExp(("^<" + qnameCapture));
// 匹配标签的关闭 <div/>
var startTagClose = /^\s*(\/?)>/;
// 匹配闭合标签
var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
// 匹配属性
var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// 匹配大括号 {{}}
var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

// html字符串解析成dom树 解析成对应的脚本  <div id = 'app'> {{name}} </div>

function parserHTML(html) { // <div id="app">111</div>

  function start (tagName, attributes) {

  }

  function end (tagName) {

  }

  function chars(text) {

  }

  function parseStartTag(html) {
    const start = html.match(startTagOpen)
    if(start){
        
    }
    return false
  }

  while (html) { // 看解析的内容是否存在，如果存在就不停的解析
    let textEnd = html.indexOf('<') // 当前解析的开头
    if (textEnd == 0) {

      const startTagMatch = parseStartTag(html) // 解析开始标签
      if (startTagMatch) {
      }

      const endTagMatch = parseEndTag()
      if(endTagMatch) {

      }
    }
  }
}

export function compileToFunction(template) {
  
  parserHTML(template)
}