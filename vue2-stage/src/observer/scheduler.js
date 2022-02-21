import { nextTick } from "../util"

//用于watcher的调度工作
let queue = []
let has = {}//做列表 列表存放了哪些watcher

function flushSchedulerQueue() {
  for(let i = 0; i < queue.length; i++) {
    queue[i].run()
  }
  queue = []
  has = {}
  pending = false
}

let pending = false

// 等待同步代码执行完后 才执行逻辑(event loop)
export function queueWatcher(watcher) {// 同步代码执行完毕后先清空微任务,再清空宏任务,想尽早更新页面
  const id = watcher.id
  if(has[id] == null) {
    queue.push(watcher)
    has[id] = true

    // 开启一次更新操作 批处理（防抖）
    if(!pending) {
      // 定时器会开启新的线程
      // setTimeout(flushSchedulerQueue, 0)
      nextTick(flushSchedulerQueue)
      pending = true
    }
  }
}