export function createElement(vm, tag, data={}, ...children) {
  return vnode(vm, tag, data, data.key, children, undefined)
}

export function createTextElement(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

function vnode(tag, data, key, children, text){

  return {
    tag,
    data,
    key,
    children,
    text
  }

}