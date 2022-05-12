(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function isFunction(val) {
    return typeof val === 'function';
  }
  function isObject(val) {
    return _typeof(val) === 'object' && val !== null;
  }
  var callbacks = [];

  function flushCallbacks() {
    callbacks.forEach(function (cb) {
      return cb();
    });
    waiting = false;
  }

  var waiting = false;

  function timer(flushCallbacks) {
    var timerFn = function timerFn() {};

    if (Promise) {
      timerFn = function timerFn() {
        Promise.resolve().then(flushCallbacks);
      };
    } else if (MutationObserver) {
      var textNode = document.createTextNode(1);
      var observe = new MutationObserver(flushCallbacks);
      observe.observe(textNode, {
        characterData: true
      });

      timerFn = function timerFn() {
        textNode.textContent = 3;
      }; // 微任务

    } else if (setImmedidate) {
      timerFn = function timerFn() {
        setImmedidate(flushCallbacks);
      };
    } else {
      timerFn = function timerFn() {
        setTimeout(flushCallbacks);
      };
    }

    timerFn();
  } // 微任务是在页面渲染前执行,取得是内存中的dom，不关心是否渲染完


  function nextTick(cb) {
    callbacks.push(cb); // flushSchedulerQueue先执行，用户的$nextTick后执行

    if (!waiting) {
      // Promise.resolve().then(flushCallbacks)//vue2考虑兼容性问题， vue3不考虑
      // 处理兼容性
      timer(flushCallbacks);
      waiting = true;
    }
  }
  var lifecycleHooks = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed']; // 第一次调用                     {}         {beforeCreate: Fn} => {beforeCreate: [fn]}
  // 第二次调用        {beforeCreate: [fn]} {beforeCreate: Fn2} => {beforeCreate: [fn,fn2]}

  function mergeHook(parentVal, childVal) {
    if (childVal) {
      if (parentVal) {
        return parentVal.concat(childVal);
      } else {
        return [childVal];
      }
    } else {
      return parentVal;
    }
  }

  var strats = {}; //存放各种策略

  lifecycleHooks.forEach(function (hook) {
    strats[hook] = mergeHook;
  }); // strats.data = function () {
  // }

  strats.components = function (parentVal, childVal) {
    var options = Object.create(parentVal); //根据父对象构造一个新对象 options.__proto__

    if (childVal) {
      for (var key in childVal) {
        options[key] = childVal[key];
      }
    }

    return options;
  };

  function mergeOptions(parent, child) {
    var options = {}; //合并后的结果

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (parent.hasOwnProperty(_key)) {
        continue;
      }

      mergeField(_key);
    }

    function mergeField(key) {
      var parentVal = parent[key];
      var childVal = child[key]; // 策略模式

      if (strats[key]) {
        //如果有对应的策略就调用对应的策略即可
        options[key] = strats[key](parentVal, childVal);
      } else {
        if (isObject(parentVal) && isObject(childVal)) {
          options[key] = _objectSpread2(_objectSpread2({}, parentVal), childVal);
        } else {
          options[key] = child[key] || parent[key];
        }
      }
    }

    return options;
  }
  function isReservedTag(str) {
    var reservedTag = 'a,div,span,p,img,button,ul,li'; // 源码更具“，”生成映射表 => {a: true, div:true,p:true}

    return reservedTag.includes(str);
  }

  function initGlobalApi(Vue) {
    // Vue.component
    // Vue.filter
    // Vue.directive
    Vue.options = {}; // 用来存放全局的配置,每个组件初始化时,都会和options选项进行合并

    Vue.mixin = function (options) {
      // 第一次调用                     {}         {beforeCreate: Fn} => {beforeCreate: [fn]}
      // 第二次调用        {beforeCreate: [fn]} {beforeCreate: Fn2} => {beforeCreate: [fn,fn2]}
      this.options = mergeOptions(this.options, options);
      return this;
    };

    Vue.options._base = Vue; //无论后续创建多少个子类,都可以通过_base找到Vue

    Vue.options.components = {};

    Vue.component = function (id, definition) {
      // 保证组件的隔离，每个组件都会产生一个新的类,去继承父类
      definition = this.options._base.extend(definition);
      this.options.components[id] = definition;
    }; // 给个对象返回一个类


    Vue.extend = function (opts) {
      // extend方法就是产生一个继承于Vue的类
      // 并且身上应该有父类的所有功能
      var Super = this;

      var Sub = function VueComponent(options) {
        this._init(options);
      }; //原型继承


      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.options = mergeOptions(Super.options, opts); //只和Vue.options合并

      return Sub;
    };
  }

  // 匹配大括号 {{}}
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{aaaa}}

  function genProps(attrs) {
    // [{name: 'xxxx', value: 'hello'}]
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          //style="border: 1px;font-size: 18px;"
          var styleObj = {};
          attr.value.replace(/([^;:]+)\:([^;:]+)/g, function () {
            styleObj[arguments[1]] = arguments[2];
          });
          attr.value = styleObj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    } // a: 1, b:2, slice去掉最后的逗号


    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(el) {
    if (el.type == 1) {
      return generate(el);
    } else {
      var text = el.text;

      if (!defaultTagRE.test(text)) {
        return "_v('".concat(text, "')");
      } else {
        // 'hello'+ arr + 'world'   hello {{arr}} world
        var tokens = [];
        var match;
        var lastIndex = defaultTagRE.lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          // 看有没有匹配到
          var index = match.index; //开始索引

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")")); // JSON.stringify

          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(el) {
    var children = el.children; //获取儿子

    if (children) {
      return children.map(function (c) {
        return gen(c);
      }).join(',');
    }
  }

  function generate(el) {
    // _c('div', {id: 'app'},_c('span', {}, 'world'), _v('hello'))
    //遍历树,将树拼接成字符串
    var children = genChildren(el);
    var code = "_c('".concat(el.tag, "', ").concat(el.attrs.length ? genProps(el.attrs) : 'undefined').concat(children ? ",".concat(children) : '', ")");
    return code;
  }

  // 标签名
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 获取标签名 match后的索引为1的

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // 匹配开始标签

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配标签的关闭 <div/>

  var startTagClose = /^\s*(\/?)>/; // 匹配闭合标签

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配属性 aa = "xxx" | 'xxx' | xxx  a=b a="b" a ='b'

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配大括号 {{}}
  // ast (语法层面的描述 js css html) vdom （dom节点）
  // html字符串解析成dom树 解析成对应的脚本  <div id = 'app'> {{name}} </div>

  function parserHTML(html) {
    // <div id="app">111</div>
    //将解析后的结果 组装成一个树结构 ast树 栈
    function createAstElement(tagName, attrs) {
      return {
        tag: tagName,
        type: 1,
        children: [],
        parent: null,
        attrs: attrs
      };
    }

    var root = null;
    var stack = [];

    function start(tagName, attributes) {
      var parent = stack[stack.length - 1];
      var element = createAstElement(tagName, attributes);

      if (!root) {
        root = element;
      }

      if (parent) {
        element.parent = parent; //当放入栈中时,记录父亲是谁

        parent.children.push(element);
      }

      stack.push(element);
    }

    function end(tagName) {
      var last = stack.pop();

      if (last.tag !== tagName) {
        throw new Error('标签有误');
      }
    }

    function chars(text) {
      text = text.replace(/\s/g, "");
      var parent = stack[stack.length - 1];

      if (text) {
        parent.children.push({
          type: 3,
          text: text
        });
      }
    }

    function advance(len) {
      html = html.substring(len);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        }; // 去掉匹配到的开始标签

        advance(start[0].length);

        var _end; // 如果没有遇到标签结尾就不停的解析


        var attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length);
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false; // 不是开始标签
    }

    while (html) {
      // 看解析的内容是否存在，如果存在就不停的解析
      var textEnd = html.indexOf('<'); // 当前解析的开头

      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); // 解析开始标签

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
      }

      var text = void 0; // 123123</div>

      if (textEnd > 0) {
        text = html.substring(0, textEnd);
      }

      if (text) {
        chars(text);
        advance(text.length);
      }
    }

    return root;
  } // 看一下用户是否传入了render，没传入可能传入的事template，template如果也没传就解析
  // html => 词法解析（开始标签 ，结束标签， 属性， 文本） => ast语法树 用来描述html语法的 stack = []
  // codegen函数将<div>hello</div> => _c('div', {}, 'hello') => 让字符串执行
  // 字符串转为代码  eval 耗性能 会有作用域问题
  // 模版引擎 通过new Function + with 来实现

  function compileToFunction(template) {
    var root = parserHTML(template); //生成代码

    console.log(root, 'root');
    var code = generate(root);
    console.log(code, 'code');
    var render = new Function("with(this){return ".concat(code, "}")); //code中会用到数据,数据在vm上

    return render; // render(){
    //   return _c('div', {id: 'app'}, 'hello')
    // }
    // 虚拟dom
    // {tag: div, data:{id: 'app', a:1},children: [{text:'hello'}]}
    // html => ast（只能描述语法 语法不存在的属性无法描述） => render函数 (with + new Function) => 虚拟dom (增加额外的属性) => 生成真实dom
  } // with用法
  // let vm = {arr: 1}
  // with(vm) {
  //   console.log(arr) // 1
  // }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    //每个属性都分配一个dep，dep可以来存放watcher，watcher中还要存放dep
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = []; //用来存放watcher
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // Dep.target dep里要存放watcher ， watcher要存放dep  多对多的关系
        if (Dep.target) {
          Dep.target.addDep(this);
        }
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null; //所有组件公用

  var stack = [];
  function pushTarget(watcher) {
    Dep.target = watcher;
    stack.push(watcher);
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var queue = [];
  var has = {}; //做列表 列表存放了哪些watcher

  function flushSchedulerQueue() {
    for (var i = 0; i < queue.length; i++) {
      queue[i].run();
    }

    queue = [];
    has = {};
    pending = false;
  }

  var pending = false; // 等待同步代码执行完后 才执行逻辑(event loop)

  function queueWatcher(watcher) {
    // 同步代码执行完毕后先清空微任务,再清空宏任务,想尽早更新页面
    var id = watcher.id;

    if (has[id] == null) {
      queue.push(watcher);
      has[id] = true; // 开启一次更新操作 批处理（防抖）

      if (!pending) {
        // 定时器会开启新的线程
        // setTimeout(flushSchedulerQueue, 0)
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  var id = 0;

  var Watcher = /*#__PURE__*/function () {
    // vm, updateComponent, () => {回调}, true
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.exprOrFn = exprOrFn; // exprOrFn

      this.user = !!options.user; //是不是用户watcher

      this.cb = cb;
      this.dirty = options.lazy; // 如果是计算属性, 那麽默认值lazy: true, dirty: true

      this.lazy = !!options.lazy;
      this.options = options;
      this.id = id++;
      this.deps = [];
      this.depsId = new Set();

      if (typeof exprOrFn == 'string') {
        this.getter = function () {
          //需要将表达式转成函数
          //当数据取值时会进行依赖收集 age.n => vm['age]['n']
          var path = exprOrFn.split('.'); // [age, n]

          var obj = vm;

          for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]];
          }

          return obj;
        };
      } else {
        // 默认应该执行exprOrFn， render(去vm上取值)
        this.getter = exprOrFn;
      } // 第一次的value


      this.value = this.lazy ? undefined : this.get(); // 默认初始化要取值
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        //用户更新时可以重新调用get
        // 取值时会调defineProperty.get方法， 每个属性都可以收集自己的watcher，一个属性对应多个watcher，一个watcher可以对应多个属性
        pushTarget(this);
        var value = this.getter.call(this.vm);
        popTarget(); // Dep.target = null, 如果Dep.target有值说明这个变量在模板中使用了

        return value;
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.depsId.add(id);
          this.deps.push(dep);
          dep.addSub(this);
        }
      }
    }, {
      key: "update",
      value: function update() {
        // vue中的更新操作是异步的
        // this.get()
        if (this.lazy) {
          this.dirty = true;
        } else {
          // 每次更新时 this=> watcher
          queueWatcher(this); //多次调用update 先将watcher缓存下来,等一会一起更新
        }
      }
    }, {
      key: "run",
      value: function run() {
        var newValue = this.get();
        var oldValue = this.value;
        this.value = newValue; //为了保证下一次更新时 上一次的最新值时下一次的旧值

        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.dirty = false; //false表示取过值了 

        this.value = this.get(); //用户的getter执行
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend(); //name friends收集watcher
        }
      }
    }]);

    return Watcher;
  }(); // watcher 和dep

  function patch(oldVnode, vnode) {
    if (!oldVnode) {
      return createElm(vnode); // 如果没有el元素，那就直接根据虚拟节点返回真实节点
    }

    if (oldVnode.nodeType == 1) {
      //用vnode生成真实dom，替换原本的dom元素
      var parentElm = oldVnode.parentNode; //找到它的父亲

      var elm = createElm(vnode); // 根据虚拟节点 创建元素

      parentElm.insertBefore(elm, oldVnode.nextSibling); // 第一次渲染删除节点，下次再使用无法获取

      parentElm.removeChild(oldVnode);
      return elm;
    } else {
      // 如果标签名称不一样 直接删掉老的换成新的即可
      if (oldVnode.tag !== vnode.tag) {
        // 可以通过vnode.el属性获取现在的真实dom
        return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
      }

      var el = vnode.el = oldVnode.el; //表示当新节点复用老节点
      // 如果两个虚拟节点是文本节点 比较文本内容

      if (vnode.tag == undefined) {
        //新老都是文本
        if (oldVnode.text !== vnode.text) {
          el.textContent = vnode.text;
        }

        return;
      } //如果标签一样 比较属性,传入新的虚拟节点,和老的属性，用新的属性更新老的


      patchProps(vnode, oldVnode.data); // 属性可能有删除的情况
      // 一方有儿子 一方没儿子

      var oldChildren = oldVnode.children || [];
      var newChildren = vnode.children || [];

      if (oldChildren.length > 0 && newChildren.length > 0) {
        // 双方都有儿子
        // vue用了双指针方法比对 同层比对
        patchChildren(el, oldChildren, newChildren);
      } else if (newChildren.length > 0) {
        // 老的没儿子,但是新的有儿子
        for (var i = 0; i < newChildren.length; i++) {
          var child = createElm(newChildren[i]);
          el.appendChild(child); // 循环创建新节点
        }
      } else if (oldChildren.length > 0) {
        // 老的有儿子 新的没儿子
        el.innerHTML = ""; //直接删除老节点
      } // vue的特点是每个组件都有一个watcher，当前数组中的数据变化 只需要更新当前组件


      return el;
    }
  }

  function isSameVnode(oldVnode, newVnode) {
    return oldVnode.tag == newVnode.tag && oldVnode.key == newVnode.key;
  } //dom的生成 ast => render方法 => 虚拟节点 => 真实dom
  //更新时需要重新创建ast语法树吗？
  //如果动态添加了节点(绕过vue添加的vue监控不到)
  // 后续数据遍历,只会操作自己管理的dom元素
  //如果直接操作dom和vue无关,不需要重新创建ast语法树 ast语法树只创建了一次


  function patchChildren(el, oldChildren, newChildren) {
    var oldStartIndex = 0;
    var oldStartVnode = oldChildren[0];
    var oldEndIndex = oldChildren.length - 1;
    var oldEndVnode = oldChildren[oldEndIndex];
    var newStartIndex = 0;
    var newStartVnode = newChildren[0];
    var newEndIndex = newChildren.length - 1;
    var newEndVnode = newChildren[newEndIndex]; //做映射表

    var makeIndexByKey = function makeIndexByKey(children) {
      return children.reduce(function (memo, current, index) {
        if (current.key) {
          memo[current.key] = index;
        }

        return memo;
      }, {});
    };

    var keysMap = makeIndexByKey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // 头头比较 尾尾比较 头尾比较 尾头比较
      // 优化了 向后添加 向前添加 尾部移动到头部 头部移动到尾部 反转
      if (!oldStartVnode) {
        // 已经被移走了
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } // 同时循环新的节点和老的节点，有一方循环完毕就结束了


      if (isSameVnode(oldStartVnode, newStartVnode)) {
        //头头比较，标签一致，
        patch(oldStartVnode, newStartVnode);
        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        // 从尾部开始比较
        patch(oldStartVnode, newStartVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
      } // 头尾比较=> reverse
      else if (isSameVnode(oldStartVnode, newEndVnode)) {
        patch(oldStartVnode, newEndVnode);
        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 移动老的元素，老的元素就会被移走不用删除

        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } // 尾头比较
      else if (isSameVnode(oldEndVnode, newStartVnode)) {
        patch(oldEndVnode, newStartVnode);
        el.insertBefore(oldEndVnode.el, oldStartVnode.el);
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else {
        //乱序比对  核心diff
        // 1.需要根据key和对应的索引将老的内容生成映射表
        var moveIndex = keysMap[newStartVnode.key];

        if (moveIndex == undefined) {
          // 如果不能复用直接创建新的插入到老的节点开头处
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        } else {
          var moveNode = oldChildren[moveIndex];
          oldChildren[moveIndex] = null;
          el.insertBefore(moveNode.el, oldStartVnode.el);
          patch(moveNode, newStartVnode); //比较两个节点的属性
        }

        newStartVnode = newChildren[++newStartIndex];
      }
    } // 用户追加一个元素
    // 尾部追加


    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        // el.appendChild(createElm(newChildren[i]))
        // insertBefore方法可以实现appendChild功能
        // 判断尾指针的下一个元素是否存在
        var anchor = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el; // node.insertBefore(newnode,existingnode) newnode:必需。需要插入的节点对象。existingnode 可选。在其之前插入新节点的子节点。如果未规定，则 insertBefore 方法会在结尾插入 newnode。

        el.insertBefore(createElm(newChildren[i]), anchor);
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        // 如果老的多 将老节点删除  但是可能里边有null的情况
        if (oldChildren[_i] !== null) el.removeChild(oldChildren[_i].el);
      }
    }
  } // 创建真实节点


  function patchProps(vnode) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // 初次渲染时可以调用此方法,后续更新也可以调用此方法
    var newProps = vnode.data || {};
    var el = vnode.el; // 如果老的属性有,新的属性没有 直接删除

    var newStyle = newProps.style || {};
    var oldStyle = oldProps.style || {};

    for (var key in oldStyle) {
      if (!newStyle[key]) {
        //新的里边不存在这个样式
        el.style[key] = '';
      }
    }

    for (var _key in oldProps) {

      if (!newProps[_key]) {
        el.removeAttribute(_key);
      }
    }

    for (var _key2 in newProps) {
      if (_key2 === 'style') {
        for (var styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
      } else {
        el.setAttribute(_key2, newProps[_key2]);
      }
    }
  }

  function createComponent$1(vnode) {
    var i = vnode.data;

    if ((i = i.hook) && (i = i.init)) {
      i(vnode); //调用init方法
    }

    if (vnode.componentInstance) {
      //有属性说明子组件new完毕了，并且组件对应的真实dom挂载到了vnode.componentInstance.$el上
      return true;
    }
  } //创建真实节点


  function createElm(vnode) {
    var tag = vnode.tag;
        vnode.data;
        var children = vnode.children,
        text = vnode.text;
        vnode.vm;

    if (typeof tag === 'string') {
      // 元素
      if (createComponent$1(vnode)) {
        //返回组件对应的真实节点
        return vnode.componentInstance.$el;
      }

      vnode.el = document.createElement(tag); //虚拟节点会有一个el属性,对应真实节点

      patchProps(vnode);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      // 既有初始化,又有更新
      var vm = this;
      var prevVnode = vm._vnode; // 表示将当前的虚拟节点保存起来

      if (!prevVnode) {
        // 初次渲染
        vm.$el = patch(vm.$el, vnode);
        console.log(vm.$el, vnode, '111');
      } else {
        vm.$el = patch(prevVnode, vnode);
      }

      vm._vnode = vnode;
    };

    Vue.prototype.$nextTick = nextTick;
  } // 后续每个组件渲染的时候都会有一个watcher

  function mountComponent(vm, el) {
    // 更新函数 数据变化后 会再次调用此函数
    var updateComponent = function updateComponent() {
      //调用render函数,生成虚拟dom
      vm._update(vm._render()); // 后续更新可以调用updateComponent方法
      // 用虚拟dom,生成真实dom

    };

    callHook(vm, 'beforeMount'); //观察者模式：属性是被观察者 观察者：刷新页面 
    // updateComponent()

    new Watcher(vm, updateComponent, function () {// 回调
    }, true); //true表示是一个渲染watcher 还有其他watcher

    callHook(vm, 'mounted');
  }
  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i].call(vm);
      }
    }
  }

  var oldArrayPrototype = Array.prototype; // 继承数组方法（保留原有数组功能）

  var arrayMethods = Object.create(oldArrayPrototype); // arrayMethods.__proto__ = Array.prototype 
  //只有这7个可以改变原数组

  var methods = ['push', 'shift', 'unshift', 'pop', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    // 用户调用的如果是以上七个方法,会用重写的,负责调用原来的数组方法
    arrayMethods[method] = function () {
      var _oldArrayPrototype$me;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 此处this是数组
      (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args));

      var inserted;
      var ob = this.__ob__; //根据当前数组获取observe实例

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args; // 就是新增的内容

          break;

        case 'splice':
          inserted = args.slice(2);
          break;
      } // 如果有新增的内容要继续劫持 需要观测数组每一项,而不是数组


      if (inserted) ob.observeArray(inserted); // 数组的observer.dep属性

      ob.dep.notify(); // arr.push({a:1}, {b:2})
      // arr.splice(0, 1, xxxx)
    };
  }); // vue中的嵌套数据不能太深
  // vue中对象通过的是defineProperty实现的响应式,拦截了get和set,如果不存在的属性不会拦截，也不会响应。可以使用$set =>让对象自己去notify，或者赋一个新对象
  // vue中的数组改索引和长度,是不会影响更新的,通过变异方法更新视图，7个方法，数组中如果修改对象类型,修改对象也可以更新视图

  // 2.如果是数组, 会劫持数组的方法 并对数组中不是基本数据类型的进行检测
  //检测数据变化，类有类型,对象无类型
  // 如果给对象新增一个属性不会触发视图更新（给对象本身也增加一个dep，dep中存watcher，如果增加一个属性后，就手动触发watcher的更新）

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //对对象中的所有属性进行劫持
      this.dep = new Dep(); //数据可能是数组或者对象

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false //不可枚举

      }); // data.__ob__ = this //所有被劫持过的属性都有__ob__

      if (Array.isArray(data)) {
        //数组劫持，对数组原来方法改写,切片编程
        data.__proto__ = arrayMethods; //如果数组中的数据是对象类型,需要监控对象的变化

        this.observeArray(data);
      } else {
        this.walk(data); //对象劫持
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        //对数组中的数组和数组中的对象再次劫持
        //如果数组里放的是对象类型，也做了观测，JSON.stringify()也做了收集依赖
        data.forEach(function (item) {
          observe(item);
        });
      }
    }, {
      key: "walk",
      value: function walk(data) {
        //传入的对象
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }();

  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  } //vue2会对对象进行遍历,将每个属性用defineProperty重新定义,所以导致性能差


  function defineReactive(data, key, value) {
    //value有可能是对象
    var childOb = observe(value); //本身用户默认值是对象套对象,需要递归处理（性能差）

    var dep = new Dep(); //每个属性都有一个dep属性

    Object.defineProperty(data, key, {
      get: function get() {
        //取值时将watcher将dep关联起来
        if (Dep.target) {
          //此值是在模版中取值的
          dep.depend(); //让dep记住watcher

          if (childOb) {
            //可能是数组，也可能是对象
            childOb.dep.depend(); //让数组和对象也记录watcher

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newV) {
        // 更新视图
        if (newV !== value) {
          observe(newV); // 如果用户赋值一个新对象,需要将这个对象进行劫持

          value = newV;
          dep.notify(); //告诉当前的属性存放的watcher执行
        }
      }
    });
  }

  function observe(data) {
    //如果是对象类型才观测
    if (!isObject(data)) {
      return;
    } //判断data有没有被观测


    if (data.__ob__) {
      return data.__ob__;
    }

    return new Observer(data);
  }

  function stateMixin(Vue) {
    Vue.prototype.$watch = function (key, handler) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      options.user = true; //是一个用户写的watcher

      var watcher = new Watcher(this, key, handler, options);

      if (options.immediate) {
        handler(watcher.value);
      }
    };
  } // 状态初始化

  function initState(vm) {
    var opts = vm.$options; // if (opts.props) {
    //   initProps()
    // }

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) {
      initComputed(vm, opts.computed);
    }

    if (opts.watch) {
      // 初始化watch
      initWatch(vm, opts.watch);
    }
  } // 代理

  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newVal) {
        vm[source][key] = newVal;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; // vm.$el vue内部会对属性检测如果以$开头 不会进行代理
    // vue2会将data中的所有数据进行劫持 Object.defineProperty
    //这个时候data和vm没有任何关系,通过_data进行关联

    data = vm._data = isFunction(data) ? data.call(vm) : data;

    for (var key in data) {
      //取name时直接可以写vm.name vm.xxx => vm._data.xxx
      proxy(vm, '_data', key);
    }

    observe(data);
  }

  function initWatch(vm, watch) {
    for (var key in watch) {
      console.log(key, watch, 'watch');
      var handler = watch[key];

      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher(vm, key, handler) {
    return vm.$watch(key, handler);
  }

  function initComputed(vm, computed) {
    var watchers = vm._computedWatchers = {};

    for (var key in computed) {
      var userDef = computed[key]; // 依赖的属性变化就重新赋值 get

      var getter = typeof userDef == 'function' ? userDef : userDef.get; // 每个计算属性本质就是watcher
      //将watcher和属性做一个映射

      watchers[key] = new Watcher(vm, getter, function () {}, {
        lazy: true
      }); // 默认不执行
      // 将key定义在vm上

      defineComputed(vm, key, userDef);
    }
  }

  function createComputedGetter(key) {
    return function computedGetter() {
      // 取计算属性的值执行这个函数
      //this._computedWatchers包含所有的计算属性
      // 通过key可以拿到对应的watcher,这个watcher中包含了getter
      var watcher = this._computedWatchers[key]; //脏需要调用用户getter

      if (watcher.dirty) {
        //根据dirty属性判断是否重新求值
        watcher.evaluate();
      } // 如果当前取完值后,Dep.target还有值需要继续向上收集


      if (Dep.target) {
        // 计算属性watcher内部有两个dep
        watcher.depend(); // watcher里对应了多个dep
      }

      return watcher.value;
    };
  }

  function defineComputed(vm, key, userDef) {
    var sharedProperty = {};

    if (typeof userDef == 'function') {
      sharedProperty.get = userDef;
    } else {
      sharedProperty.get = createComputedGetter(key);
      sharedProperty.set = userDef.set;
    }

    Object.defineProperty(vm, key, sharedProperty);
  }

  function initMixin(Vue) {
    //表示在vue的基础上做一次混合操作
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = mergeOptions(vm.constructor.options, options); //后面会对options进行扩展
      // 对数据进行初始化

      callHook(vm, 'beforeCreate');
      initState(vm); //vm.$options.data 数据劫持

      callHook(vm, 'created');

      if (vm.$options.el) {
        // 将数据挂载到这个模板上
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el);
      vm.$el = el;
      console.log(el, 'el'); // 把模版转换成 对应的渲染函数 =》 虚拟dom vnode diff算法 更新虚拟dom => 真实dom

      if (!options.render) {
        // 没有render用template
        var template = options.template;

        if (!template && el) {
          // 没有template就取el的内容作为模板
          template = el.outerHTML;
        }

        var render = compileToFunction(template);
        options.render = render;
      } // options.render就是渲染函数
      // 调用render方法 渲染成真实dom 替换掉页面的内容


      mountComponent(vm); // 组件挂载过程
    };
  }

  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    // 如果tag是组件 应该渲染一个组件的vnode
    if (isReservedTag(tag)) {
      return vnode(vm, tag, data, data.key, children, undefined);
    } else {
      var Ctor = vm.$options.components[tag];
      return createComponent(vm, tag, data, data.key, children, Ctor);
    }
  } //创建组件的虚拟节点 为了区分组件和元素 data.hook componentOptions

  function createComponent(vm, tag, data, key, children, Ctor) {
    // 组件的构造函数
    if (isObject(Ctor)) {
      Ctor = vm.$options._base.extend(Ctor); // Vue.extend
    }

    data.hook = {
      //渲染组件时，需要调用此初始化方法
      init: function init(vnode) {
        var vm = vnode.componentInstance = new Ctor({
          _isComponent: true
        }); //new Sub 会用此选项和组件的配置进行合并

        vm.$mount(); //组件挂载完成后 会在vm.$el赋值 vnode.componentInstance.$el => button
      }
    };
    return vnode(vm, "vue-component-".concat(tag), data, key, undefined, undefined, {
      Ctor: Ctor,
      children: children
    });
  }

  function createTextElement(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, data, key, children, text, componentOptions) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text,
      componentOptions: componentOptions
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      //createElement
      return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function (text) {
      //createTextElement
      return createTextElement(this, text);
    };

    Vue.prototype._s = function (val) {
      // stringify
      if (_typeof(val) === 'object') return JSON.stringify(val);
      return val;
    };

    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render; // 解析出来的render方法,同时也可能是用户写的

      var vnode = render.call(vm);
      return vnode;
    };
  }

  //用class类写vue不好拆封,所以采用构造函数方式写

  function Vue(options) {
    // options用户传入选项
    //构造函数中的this指向new的实例
    this._init(options); // 初始化操作

  } // 扩展原型


  initMixin(Vue);
  renderMixin(Vue); // _render

  lifecycleMixin(Vue); // _update

  stateMixin(Vue); // 在类上扩展

  initGlobalApi(Vue); //初始化全局api

  return Vue;

}));
//# sourceMappingURL=vue.js.map
