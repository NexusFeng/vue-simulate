export function isFunction (val) {
  return typeof val === 'function'
}

export function isObject(val) {
  return typeof val === 'object' && val !== null
}

const callbacks = []
function flushCallbacks() {
  callbacks.forEach(cb => cb())
  waiting = false
}

let waiting = false
function timer(flushCallbacks) {
  let timerFn = () => {}

  if(Promise) {
    timerFn = () => {
      Promise.resolve().then(flushCallbacks)
    }
  } else if(MutationObserver){
    let textNode = document.createTextNode(1)
    let observe = new MutationObserver(flushCallbacks)
    observe.observe(textNode, {
      characterData: true
    })

    timerFn = () => {
      textNode.textContent = 3
    }

    // 微任务
  } else if (setImmedidate) {
    timerFn = () => {
      setImmedidate(flushCallbacks)
    }
  } else {
    timerFn = () => {
      setTimeout(flushCallbacks)
    }
  }
  timerFn()
  

}


// 微任务是在页面渲染前执行,取得是内存中的dom，不关心是否渲染完
export function nextTick(cb) {
  callbacks.push(cb) // flushSchedulerQueue先执行，用户的$nextTick后执行

  if (!waiting) {
    // Promise.resolve().then(flushCallbacks)//vue2考虑兼容性问题， vue3不考虑
    // 处理兼容性
    timer(flushCallbacks)
    waiting = true
  }
}