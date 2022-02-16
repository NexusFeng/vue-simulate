// 匹配大括号 {{}}
var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;// {{aaaa}}

function genProps(attrs) {// [{name: 'xxxx', value: 'hello'}]
  let str = ''
  for(let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    if (attr.name === 'style') {//style="border: 1px;font-size: 18px;"
      let styleObj = {}
      attr.value.replace(/([^;:])\:([^;:])/g, () => {
        styleObj[arguments[1]] = arguments[2]
      })
      attr.value = styleObj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)}`
  }
  // a: 1, b:2, slice去掉最后的逗号
  return `{${str.slice(0, -1)}}`
}

function gen(el) {
  if(el.type == 1) {
    return generate(el)
  } else {
    let text = el.text
    if(!defaultTagRE.test(text)) {
      return `_v(${text})`
    } else {
      // 'hello'+ arr + 'world'   hello {{arr}} world
      let tokens = []
      let match
      let lastIndex = defaultTagRE.lastIndex = 0
      while(match = defaultTagRE.exec(text)) {// 看有没有匹配到
        let index = match.index; //开始索引
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        tokens.push(`_s(${match[1].trim()})`) // JSON.stringify
        let lastIndex = index + match[0].length
      }
      if(lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }

      return `_v(${tokens.join('+')})`
    }
    
  }
}

function genChildren(el) {
  let children = el.children//获取儿子
  if(children) {
    return children.map(c=>gen(c)).join(',')
  }
}

export function generate(el) {// _c('div', {id: 'app'},_c('span', {}, 'world'), _v('hello'))
  //遍历树,将树拼接成字符串
  let children = genChildren(el)
  let code = `_c('${el.tag}', ${
      el.attrs.length? genProps(el.attrs) : 'undefined' 
    })${children? `,${children}`:'' 
  }`

  return code
}