(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
        return "_v(".concat(text, ")");
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
    var code = "_c('".concat(el.tag, "', ").concat(el.attrs.length ? genProps(el.attrs) : 'undefined', ")").concat(children ? ",".concat(children) : '');
    return code;
  }

  // 标签名
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 获取标签名 match后的索引为1的

  var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")"; // 匹配开始标签

  var startTagOpen = new RegExp("^<" + qnameCapture); // 匹配标签的关闭 <div/>

  var startTagClose = /^\s*(\/?)>/; // 匹配闭合标签

  var endTag = new RegExp("^<\\/" + qnameCapture + "[^>]*>"); // 匹配属性 aa = "xxx" | 'xxx' | xxx  a=b a="b" a ='b'

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配大括号 {{}}
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

      element.children.push(element);
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
  } // ast (语法层面的描述 js css html) vdom （dom节点）
  // html字符串解析成dom树 解析成对应的脚本  <div id = 'app'> {{name}} </div>


  function parserHTML(html) {
    // <div id="app">111</div>
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

  function patch(oldVnode, vnode) {
    if (oldVnode.nodeType === 1) {
      console.log(oldVnode, 'oldVnode'); //用vnode生成真实dom，替换原本的dom元素

      var parentElm = oldVnode.parentNode; //找到它的父亲

      var elm = createElm(vnode); // 根据虚拟节点 创建元素

      parentElm.insertBefore(elm, oldVnode.nextSibling);
      parentElm.removeChild(oldVnode);
    }
  }

  function createElm(vnode) {
    var tag = vnode.tag;
        vnode.data;
        var children = vnode.children,
        text = vnode.text;
        vnode.vm;

    if (typeof tag === 'string') {
      // 元素
      vnode.el = document.createElement(tag); //虚拟节点会有一个el属性,对应真实节点

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
      patch(vm.$el, vnode);
    };
  }
  function mountComponent(vm, el) {
    // 更新函数 数据变化后 会再次调用此函数
    var updateComponent = function updateComponent() {
      //调用render函数,生成虚拟dom
      vm._update(vm._render()); // 后续更新可以调用updateComponent方法
      // 用虚拟dom,生成真实dom

    };

    updateComponent();
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

  function isFunction(val) {
    return typeof val === 'function';
  }
  function isObject(val) {
    return _typeof(val) === 'object' && val !== null;
  }

  var oldArrayPrototype = Array.prototype; // 继承数组方法

  var arrayMethods = Object.create(oldArrayPrototype); // arrayMethods.__proto__ = Array.prototype 
  //只有这7个可以改变原数组

  var methods = ['push', 'shift', 'unshift', 'pop', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    // 用户调用的如果是以上七个方法,会用重写的,负责调用原来的数组方法
    arrayMethods[method] = function () {
      var _oldArrayPrototypep$m;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 此处this是数组
      (_oldArrayPrototypep$m = oldArrayPrototypep[method]).call.apply(_oldArrayPrototypep$m, [this].concat(args));

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


      if (inserted) ob.observeArray(inserted); // arr.push({a:1}, {b:2})
      // arr.splice(0, 1, xxxx)
    };
  });

  // 2.如果是数组, 会劫持数组的方法 并对数组中不是基本数据类型的进行检测
  //检测数据变化，类有类型,对象无类型

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //对对象中的所有属性进行劫持
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
  }(); //vue2会对对象进行遍历,将每个属性用defineProperty重新定义,所以导致性能差


  function defineReactive(data, key, value) {
    //value有可能是对象
    observe(value); //本身用户默认值是对象套对象,需要递归处理（性能差）

    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newV) {
        observe(newV); // 如果用户赋值一个新对象,需要将这个对象进行劫持

        value = newV;
      }
    });
  }

  function observe(data) {
    //如果是对象类型才观测
    if (!isObject(data)) {
      return;
    } //判断data有没有被观测


    if (data.__ob__) {
      return;
    }

    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; // if (opts.props) {
    //   initProps()
    // }

    if (opts.data) {
      initData(vm);
    } // if (opts.computed) {
    //   initComputed()
    // }
    // if (opts.watch) {
    //   initWatch()
    // }

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

  function initMixin(Vue) {
    //表示在vue的基础上做一次混合操作
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; //后面会对options进行扩展
      // 对数据进行初始化

      initState(vm); //vm.$options.data 数据劫持

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
          var render = compileToFunction(template);
          options.render = render;
        }
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

    return vnode(vm, tag, data, data.key, children, undefined);
  }
  function createTextElement(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, data, key, children, text) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
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
      console.log(vnode, 'vnode');
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

  return Vue;

}));
//# sourceMappingURL=vue.js.map
