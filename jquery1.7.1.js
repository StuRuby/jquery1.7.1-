/*!
 * jQuery JavaScript Library v1.7.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Nov 21 21:11:03 2011 -0500
 */
//自调用的匿名函数,当jquery初始化的时候,这个自调用的匿名函数中包含的所有JavaScript代码都将被执行。
(function (window, undefined) {
// Use the correct document accordingly with window argument (sandbox)
    var document = window.document,
        navigator = window.navigator,
        location = window.location;
    //自调用匿名函数返回jquery构造函数并赋值给变量jquery,最后把这个jquery变量暴露给全局作用域window,并定义了别名$。
    var jQuery = (function () {
//这个jquery的值是jquery构造函数,与上面定义的jquery是等价的,都指向jquery构造函数。
// Define a local copy of jQuery
        var jQuery = function (selector, context) {
                // The jQuery object is actually just the init constructor 'enhanced'
                return new jQuery.fn.init(selector, context, rootjQuery);
            },

            // Map over jQuery in case of overwrite
            _jQuery = window.jQuery,

            // Map over the $ in case of overwrite
            _$ = window.$,

            // A central reference to the root jQuery(document)
            rootjQuery,

            // A simple way to check for HTML strings or ID strings
            // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
            //jQuery 源码中的 quickExpr 是用来检测参数 selector 是否是复杂的 HTML 代码（如“abc<div>”）或 #id，匹配结果存放在数组 match 中
            /**
             * 正则quickExpr包含两个分组,依次匹配HTML代码和id,如果匹配成功的话,数组match的第一个元素为参数selector,第二个参数为匹配的HTML代码或者undefined,第三个参数为匹配的id或者undefined。
             * @type {RegExp}
             */
            quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

            // Check if a string has a non-whitespace character in it
            rnotwhite = /\S/,

            // Used for trimming whitespace
            trimLeft = /^\s+/,
            trimRight = /\s+$/,

            // Match a standalone tag 匹配一个单独的tag
            rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

            // JSON RegExp
            rvalidchars = /^[\],:{}\s]*$/,
            rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
            rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

            // Useragent RegExp
            rwebkit = /(webkit)[ \/]([\w.]+)/,
            ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            rmsie = /(msie) ([\w.]+)/,
            rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

            // Matches dashed string for camelizing
            rdashAlpha = /-([a-z]|[0-9])/ig,
            rmsPrefix = /^-ms-/,

            // Used by jQuery.camelCase as callback to replace()
            fcamelCase = function (all, letter) {
                return ( letter + "" ).toUpperCase();
            },

            // Keep a UserAgent string for use with jQuery.browser
            userAgent = navigator.userAgent,

            // For matching the engine and version of the browser
            browserMatch,

            // The deferred used on DOM ready
            readyList,

            // The ready event handler
            DOMContentLoaded,

            // Save a reference to some core methods
            toString = Object.prototype.toString,
            hasOwn = Object.prototype.hasOwnProperty,
            push = Array.prototype.push,
            slice = Array.prototype.slice,
            trim = String.prototype.trim,
            indexOf = Array.prototype.indexOf,

            // [[Class]] -> type pairs
            class2type = {};
        //覆盖了构造函数jquery()的原型对象
        jQuery.fn = jQuery.prototype = {
            //覆盖了原型对象的属性constructor,使他指向jquery构造函数。
            constructor: jQuery,
            /**
             * 定义原型方法init,他负责解析参数selector和context的类型,并进行相应的查找
             * @param selector  可以是任意类型的值,但是只有undefined,DOM元素,字符串,函数,jquery对象,普通的JavaScript对象是有效的。
             * @param context   可以不传入,也可以传入DOM元素,jquery对象,普通的JavaScript对象之一。
             * @param rootjQuery 包含了document对象的jquery对象,用于document.getElementById()查找失败,selector是选择器且未指定context,selector是函数的情况下。
             * @returns {*}
             */
            init: function (selector, context, rootjQuery) {
                var match, elem, ret, doc;

                // Handle $(""), $(null), or $(undefined) ==>参数selector可以转换为false,这种情况下直接返回this(空jquery对象,其属性length是0)
                if (!selector) {
                    return this;
                }

                // Handle $(DOMElement)  ==>手动设置第一个元素和属性context指向该DOM元素。
                if (selector.nodeType) {
                    this.context = this[0] = selector;
                    this.length = 1;
                    return this;
                }

                // The body element only exists once, optimize(优化) finding it  ==>如果selector是body,则手动设置属性context指向document对象。最后返回一个包含了body元素引用的jquery对象
                if (selector === "body" && !context && document.body) {
                    this.context = document;
                    this[0] = document.body;
                    this.selector = selector;
                    this.length = 1;
                    return this;
                }

                // Handle HTML strings
                if (typeof selector === "string") {
                    // Are we dealing with HTML string or an ID?
                    if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
                        // Assume that strings that start and end with <> are HTML and skip the regex check  ==>仅仅是假设,并不代表他一定是合法的字符串。
                        match = [null, selector, null];

                    } else {
                        //否则,则需要对其进行正则表达式检验,匹配结果存放在match数组中。
                        match = quickExpr.exec(selector);

                    }
                    // Verify a match, and that no context was specified for #id
                    //如果match[1]不是undefined,或者match[2]不是undefined,即参数selector是#id,并且未传入参数context  和selector是html代码的情况
                    if (match && (match[1] || !context)) {

                        // HANDLE: $(html) -> $(array)
                        //传入的参数是一串html代码
                        if (match[1]) {
                            //首先修正context,doc
                            context = context instanceof jQuery ? context[0] : context;
                            doc = ( context ? context.ownerDocument || context : document );

                            // If a single string is passed in and it's a single tag
                            // just do a createElement and skip the rest
                            //检验html代码是否是单独的标签,匹配结果存放在ret中。数组不为null,即为单独标签
                            ret = rsingleTag.exec(selector);
                            if (ret) {
                                //参数context是普通对象
                                if (jQuery.isPlainObject(context)) {
                                    selector = [document.createElement(ret[1])];
                                    //调用jquery的attr()方法,将context中的属性,事件设置到新创建的DOM元素上。
                                    jQuery.fn.attr.call(selector, context, true);

                                } else {
                                    //selector是单独标签
                                    selector = [doc.createElement(ret[1])];
                                }
                            }
                            //参数selector是复杂的代码,则利用浏览器内置的innerHTML创建元素。即jquery.buildFragment()和方法jquery.clone()
                            else {
                                /**
                                 * jQuery.buildFragment()的返回值
                                 * @type {{fragment:含有转换后的DOM元素的文档片段, cacheable:HTML代码是否满足缓存条件}}
                                 */
                                ret = jQuery.buildFragment([match[1]], [doc]);
                                //如果html代码满足缓存条件,则在使用转换后的dom元素时,必须先复制一份在使用,否则可以直接使用
                                selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
                            }
                            //将新创建的DOM元素数组合并到当前jquery对象中并返回
                            return jQuery.merge(this, selector);

                            // HANDLE: $("#id")
                        }
                        else {
                            //如果选择器只是指定了一个简单的#id,但是并没有指定上下文,则使用浏览器原生的document.getElementById进行查找
                            elem = document.getElementById(match[2]);

                            // Check parentNode to catch when Blackberry 4.6 returns  Blackberry会返回已经不在文档中的dom节点
                            // nodes that are no longer in the document #6963
                            if (elem && elem.parentNode) {
                                // Handle the case where IE and Opera return items 在IE6,IE7,某些版本的Opera中,可能会按属性name查找,而不是id。
                                // by name instead of ID
                                if (elem.id !== match[2]) {
                                    return rootjQuery.find(selector);
                                }

                                // Otherwise, we inject the element directly into the jQuery object
                                this.length = 1;
                                this[0] = elem;
                            }

                            this.context = document;
                            this.selector = selector;
                            return this;
                        }

                        // HANDLE: $(expr, $(...))
                        //参数selector是选择器表达式
                        //没有指定上下文:执行 rootjQuery.find(selector);
                        //指定了上下文,且上下文都是jquery对象,则执行context.finc(selector)
                    } else if (!context || context.jquery) {
                        return ( context || rootjQuery ).find(selector);

                        // HANDLE: $(expr, context)  指定了上下文,但是上下文不是jquery对象
                        // (which is just equivalent to: $(context).find(expr)
                    } else {
                        //先创建了一个包含了context的jquery对象,然后在该对象上执行.find()方法
                        return this.constructor(context).find(selector);
                    }

                    // HANDLE: $(function)
                    // Shortcut for document ready  如果selector是函数,则认为是绑定ready事件
                } else if (jQuery.isFunction(selector)) {
                    return rootjQuery.ready(selector);
                }
                //如果参数selector含有属性selector,则认为他是jquery对象
                if (selector.selector !== undefined) {
                    this.selector = selector.selector;
                    this.context = selector.context;
                }
                //如果selector是数组或者伪数组(jquery对象)的话,则都添加到当前jquery对象中
                return jQuery.makeArray(selector, this);
            },

            // Start with an empty selector
            selector: "",

            // The current version of jQuery being used
            jquery: "1.7.1",

            // The default length of a jQuery object is 0
            length: 0,

            // The number of elements contained in the matched element set
            size: function () {
                return this.length;
            },

            toArray: function () {
                //array.slice(start,end)返回数组的一部分,不会修改原数组，只会返回一个浅复制了原数组中元素的新数组
                return slice.call(this, 0);
            },

            // Get the Nth element in the matched element set OR
            // Get the whole matched element set as a clean array
            get: function (num) {
                return num == null ?

                    // Return a 'clean' array
                    this.toArray() :

                    // Return just the object
                    ( num < 0 ? this[this.length + num] : this[num] );
            },

            // Take an array of elements and push it onto the stack
            // (returning the new matched element set)
            /**
             * 该原型方法创建一个空的jquery对象，然后把DOM元素集合放入到这个jquery对象中，并保留对当前jquery对象的引用
             * @param elems 将放入新jquery对象的元素数组
             * @param name 产生元素数组elems的jquery方法名
             * @param selector 传给jquery方法的参数，用于修正原型属性.selector
             */
            pushStack: function (elems, name, selector) {
                // Build a new jQuery matched element set
                var ret = this.constructor();//指向构造函数jquery()

                if (jQuery.isArray(elems)) {
                    push.apply(ret, elems);

                } else {
                    jQuery.merge(ret, elems);
                }

                // Add the old object onto the stack (as a reference)
                //形成链式栈，因此.pushStack()方法还可以理解为，构建一个新的jquery对象并入栈，新对象位于栈顶。（入栈）
                ret.prevObject = this;

                ret.context = this.context;

                if (name === "find") {
                    ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
                } else if (name) {
                    ret.selector = this.selector + "." + name + "(" + selector + ")";
                }

                // Return the newly-formed element set
                return ret;
            },

            // Execute a callback for every element in the matched set.
            // (You can seed the arguments with an array of args, but this is
            // only used internally（内部的）.)
            each: function (callback, args) {
                //将当前jQuery对象作为参数object传入，这里返回该参数，以支持链式语法
                return jQuery.each(this, callback, args);
            },
            //通过调用方法jQuery.bindReady()来绑定ready事件，并把传入的监听函数添加到ready事件监听函数列表readyList事件中
            ready: function (fn) {
                // Attach the listeners
                jQuery.bindReady();

                // Add the callback
                readyList.add(fn);
                return this;
            },

            eq: function (i) {
                //如果参数i是字符串，则通过在前面添加一个+号把该参数转换为数字
                i = +i;
                return i === -1 ?
                    this.slice(i) :
                    this.slice(i, i + 1);
            },

            first: function () {
                return this.eq(0);
            },

            last: function () {
                return this.eq(-1);
            },

            slice: function () {
                //先借用数组方法slice()从当前jquery对象中获取指定范围的子集（数组），在调用方法.pushStack（）把子集转换为jquery对象，同时通过属性prevObject保留了对当前jquery对象的引用
                return this.pushStack(slice.apply(this, arguments),
                    "slice", slice.call(arguments).join(","));
            },

            map: function (callback) {
                return this.pushStack(jQuery.map(this, function (elem, i) {
                    return callback.call(elem, i, elem);
                }));
            },
            //结束当前链条中最近的筛选操作，并将匹配元素集合还原为之前的状态（出栈）
            end: function () {
                return this.prevObject || this.constructor(null);
            },

            // For internal use only.
            // Behaves like an Array's method, not like a jQuery method.
            push: push,//向当前jquery对象的末尾添加新元素，并返回新长度 ；
            sort: [].sort, //对当前jquery对象中的元素进行排序，可以传入一个比较函数来指定排布顺序
            splice: [].splice
        };
//使用jquery构造函数的原型对象jquery.fn覆盖了jquery.fn.init()的原型对象。
// Give the init function the jQuery prototype for later instantiation
        jQuery.fn.init.prototype = jQuery.fn;
//用于合并两个或者多个对象的属性到第一个对象。
        //jquery.extend([deep],target,object1,[,objectN])
        jQuery.extend = jQuery.fn.extend = function () {
            var options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                // skip the boolean and the target
                i = 2;
            }

            // Handle case when target is a string or something (possible in deep copy)
            if (typeof target !== "object" && !jQuery.isFunction(target)) {
                target = {};
            }

            // extend jQuery itself if only one argument is passed
            if (length === i) {
                target = this;
                --i;
            }
            //根据i的值，合并之后的所有属性
            for (; i < length; i++) {
                // Only deal with non-null/undefined values
                if ((options = arguments[i]) != null) {
                    // Extend the base object
                    for (name in options) {
                        //变量初始值
                        src = target[name];
                        //复制值
                        copy = options[name];

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        //如果是深度合并，且复制值copy是普通的JavaScript对象，则执行递归合并
                        if (deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) )) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && jQuery.isArray(src) ? src : [];

                            } else {
                                clone = src && jQuery.isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            //递归复制copy合并到原始值副本clone中
                            target[name] = jQuery.extend(deep, clone, copy);

                            // Don't bring in undefined values
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        };
        //在构造jquery对象的模块中，还定义了一些重要的静态属性和方法，他们是其他模块实现的基础
        jQuery.extend({

            noConflict: function (deep) {
                if (window.$ === jQuery) {
                    window.$ = _$;
                }

                if (deep && window.jQuery === jQuery) {
                    window.jQuery = _jQuery;
                }

                return jQuery;
            },

            // Is the DOM ready to be used? Set to true once it occurs.
            isReady: false,

            // A counter to track how many items to wait for before
            // the ready event fires. See #6781
            readyWait: 1,

            // Hold (or release) the ready event
            //用于延迟或恢复ready事件的触发
            holdReady: function (hold) {
                if (hold) {
                    jQuery.readyWait++;
                } else {
                    jQuery.ready(true);
                }
            },

            // Handle when the DOM is ready
            ready: function (wait) {
                // Either a released hold or an DOMready/load event and not yet ready
                if ((wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady)) {
                    // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                    if (!document.body) {
                        return setTimeout(jQuery.ready, 1);
                    }

                    // Remember that the DOM is ready
                    jQuery.isReady = true;

                    // If a normal DOM Ready event fired, decrement, and wait if need be
                    if (wait !== true && --jQuery.readyWait > 0) {
                        return;
                    }

                    // If there are functions bound, to execute
                    readyList.fireWith(document, [jQuery]);

                    // Trigger any bound ready events
                    if (jQuery.fn.trigger) {
                        jQuery(document).trigger("ready").off("ready");
                    }
                }
            },

            bindReady: function () {
                if (readyList) {
                    return;
                }

                readyList = jQuery.Callbacks("once memory");//once确保监听函数列表readyList只能触发一次。memory记录上一次触发监听函数列表readyList时的参数，之后添加的任何监听很少都将用记录的参数值立即调用

                // Catch cases where $(document).ready() is called after the
                // browser event has already occurred.
                if (document.readyState === "complete") {
                    // Handle it asynchronously to allow scripts the opportunity to delay ready
                    return setTimeout(jQuery.ready, 1);
                }

                // Mozilla, Opera and webkit nightlies currently support this event
                if (document.addEventListener) {
                    // Use the handy event callback
                    document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);

                    // A fallback to window.onload, that will always work
                    window.addEventListener("load", jQuery.ready, false);

                    // If IE event model is used
                } else if (document.attachEvent) {
                    // ensure firing before onload,
                    // maybe late but safe also for iframes
                    document.attachEvent("onreadystatechange", DOMContentLoaded);

                    // A fallback to window.onload, that will always work
                    window.attachEvent("onload", jQuery.ready);

                    // If IE and not a frame
                    // continually check to see if the document is ready
                    var toplevel = false;

                    try {
                        toplevel = window.frameElement == null;
                    } catch (e) {
                    }

                    if (document.documentElement.doScroll && toplevel) {
                        doScrollCheck();
                    }
                }
            },

            // See test/unit/core.js for details concerning isFunction.
            // Since version 1.3, DOM methods and functions like alert
            // aren't supported. They return false on IE (#2968).
            isFunction: function (obj) {
                return jQuery.type(obj) === "function";
            },

            isArray: Array.isArray || function (obj) {
                return jQuery.type(obj) === "array";
            },

            // A crude way of determining if an object is a window
            isWindow: function (obj) {
                return obj && typeof obj === "object" && "setInterval" in obj;
            },

            isNumeric: function (obj) {
                return !isNaN(parseFloat(obj)) && isFinite(obj);
            },

            type: function (obj) {
                return obj == null ?
                    //如果obj是undefined或者null，返回undefined,null
                    String(obj) :
                    //如果obj是JavaScript内部对象，则返回其名称，否则其余全部返回object
                class2type[toString.call(obj)] || "object";
            },
//判断传入的参数是否是纯粹的对象，即{}或者new Object()构建出来的
            isPlainObject: function (obj) {
                // Must be an Object.
                // Because of IE, we also have to check the presence of the constructor property.
                // Make sure that DOM nodes and window objects don't pass through, as well
                if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
                    return false;
                }

                try {
                    // Not own constructor property must be Object
                    if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {//对象obj的原型对象中没有isPrototypeOf,说明他不是由原型对象的构造函数直接创建的，而是自定义的构造函数创建的
                        return false;
                    }
                } catch (e) {
                    // IE8,9 Will throw exceptions on certain host objects #9897
                    return false;
                }

                // Own properties are enumerated firstly, so to speed up,
                // if last one is own, then all properties are own.

                var key;
                for (key in obj) {
                }

                return key === undefined || hasOwn.call(obj, key);//如果没有属性或者所有属性都是非继承属性，则返回true，否则，返回false
            },

            isEmptyObject: function (obj) {
                for (var name in obj) {
                    return false;
                }
                return true;
            },

            error: function (msg) {
                throw new Error(msg);
            },

            parseJSON: function (data) {
                if (typeof data !== "string" || !data) {
                    return null;
                }

                // Make sure leading/trailing whitespace is removed (IE can't handle it)
                data = jQuery.trim(data);

                // Attempt to parse using the native JSON parser first
                if (window.JSON && window.JSON.parse) {
                    return window.JSON.parse(data);
                }

                // Make sure the incoming data is actual JSON
                // Logic borrowed from http://json.org/json2.js
                //在不支持jquery.parse()的浏览器中，需要先检测字符串是否合法，如果合法，则执行(new Function("return "+data))；
                if (rvalidchars.test(data.replace(rvalidescape, "@")//将转义字符替换为@
                        .replace(rvalidtokens, "]")//吧字符串，true，false，null，数值替换为】
                        .replace(rvalidbraces, ""))) {//删除正确的左方括号

                    return ( new Function("return " + data) )();

                }
                jQuery.error("Invalid JSON: " + data);
            },

            // Cross-browser xml parsing
            parseXML: function (data) {
                var xml, tmp;
                try {
                    if (window.DOMParser) { // Standard
                        tmp = new DOMParser();
                        xml = tmp.parseFromString(data, "text/xml");
                    } else { // IE
                        xml = new ActiveXObject("Microsoft.XMLDOM");
                        xml.async = "false";
                        xml.loadXML(data);
                    }
                } catch (e) {
                    xml = undefined;
                }
                if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
                    jQuery.error("Invalid XML: " + data);
                }
                return xml;
            },

            noop: function () {
            },

            // Evaluates a script in a global context
            // Workarounds based on findings by Jim Driscoll
            // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
            globalEval: function (data) {
                if (data && rnotwhite.test(data)) {
                    // We use execScript on Internet Explorer
                    // We use an anonymous function so that context is window
                    // rather than jQuery in Firefox
                    //如果是IE的话:Window.execScript(code,language)  ;其他浏览器的话：则执行函数function(){}
                    ( window.execScript || function (data) {
                        window["eval"].call(window, data);
                    } )(data);
                }
            },

            // Convert dashed to camelCase; used by the css and data modules
            // Microsoft forgot to hump their vendor prefix (#9572)
            //转换连字符式的字符串为驼峰式
            camelCase: function (string) {
                return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
            },
            //用于检查DOM元素的节点名称与指定的值是否相等
            nodeName: function (elem, name) {
                return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
            },

            // args is for internal usage only
            each: function (object, callback, args) {
                var name, i = 0,
                    length = object.length,
                    isObj = length === undefined || jQuery.isFunction(object);

                if (args) {
                    if (isObj) {
                        for (name in object) {
                            if (callback.apply(object[name], args) === false) {
                                break;
                            }
                        }
                    } else {
                        for (; i < length;) {
                            if (callback.apply(object[i++], args) === false) {
                                break;
                            }
                        }
                    }

                    // A special, fast, case for the most common use of each
                } else {
                    if (isObj) {
                        for (name in object) {
                            if (callback.call(object[name], name, object[name]) === false) {
                                break;
                            }
                        }
                    } else {
                        for (; i < length;) {
                            if (callback.call(object[i], i, object[i++]) === false) {
                                break;
                            }
                        }
                    }
                }

                return object;
            },

            // Use native String.trim function wherever possible
            trim: trim ?
                function (text) {
                    return text == null ?
                        "" :
                        trim.call(text);
                } :

                // Otherwise use our own trimming functionality
                function (text) {
                    return text == null ?
                        "" :
                        text.toString().replace(trimLeft, "").replace(trimRight, "");
                },

            // results is for internal usage only
            //将一个类数组对象转换为一个真正的数组
            makeArray: function (array, results) {
                var ret = results || [];

                if (array != null) {
                    // The window, strings (and functions) also have 'length'
                    // Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
                    var type = jQuery.type(array);
                    //参数array不是数组也不是类数组对象
                    if (array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow(array)) {
                        push.call(ret, array);
                    } else {
                        jQuery.merge(ret, array);
                    }
                }

                return ret;
            },

            /**
             * 在数组中查找指定的元素并返回其下标，未找到则返回-1
             * @param elem 要查找的值
             * @param array 数组，将遍历这个数组来查找
             * @param i 指定开始查找的位置，默认为0；
             * @returns {*}
             */
            inArray: function (elem, array, i) {
                var len;

                if (array) {
                    if (indexOf) {
                        return indexOf.call(array, elem, i);
                    }

                    len = array.length;
                    //修正参数i
                    i = i ?
                        i < 0 ?
                            Math.max(0, len + i)
                            : i
                        : 0;

                    for (; i < len; i++) {
                        // Skip accessing in sparse arrays
                        if (i in array && array[i] === elem) {
                            return i;
                        }
                    }
                }

                return -1;
            },
            //用于合并两个数组的元素到第一个数组中。
            //这种合并是具有破坏性的，将第二个数组中的元素添加到第一个数组中，第一个数组就被改变了
            merge: function (first, second) {
                var i = first.length,
                    j = 0;

                if (typeof second.length === "number") {
                    for (var l = second.length; j < l; j++) {
                        first[i++] = second[j];
                    }

                } else {
                    //例如{0:'a',1:'b'}
                    while (second[j] !== undefined) {
                        first[i++] = second[j++];
                    }
                }
                //修正改变后的第一个数组的length
                first.length = i;

                return first;
            },
            /**
             * 用于查找数组中满足过滤函数的元素，原数组不受影响
             * @param elems 待遍历查找的数组
             * @param callback  过滤每个元素的函数，执行时被传入两个参数，当前元素和它的下标。返回一个bool值
             * @param inv  如果参数inv是false或者未传入，方法返回一个满足回调函数的元素数组；如果参数是true，则返回一个不满足回调函数的元素数组
             * @returns {Array}
             */
            grep: function (elems, callback, inv) {
                var ret = [], retVal;
                inv = !!inv;

                // Go through the array, only saving the items
                // that pass the validator function
                for (var i = 0, length = elems.length; i < length; i++) {
                    retVal = !!callback(elems[i], i);
                    //方法返回一个满足回调函数的元素数组或者返回一个不满足回调函数的元素数组
                    if (inv !== retVal) {
                        ret.push(elems[i]);
                    }
                }

                return ret;
            },

            // arg is for internal usage only
            map: function (elems, callback, arg) {
                var value, key, ret = [],
                    i = 0,
                    length = elems.length,
                    // jquery objects are treated as arrays
                    isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[0] && elems[length - 1] ) || length === 0 || jQuery.isArray(elems) );

                // Go through the array, translating each of the items to their
                if (isArray) {
                    for (; i < length; i++) {
                        value = callback(elems[i], i, arg);

                        if (value != null) {
                            ret[ret.length] = value;
                        }
                    }

                    // Go through every key on the object,
                } else {
                    for (key in elems) {
                        value = callback(elems[key], key, arg);

                        if (value != null) {
                            ret[ret.length] = value;
                        }
                    }
                }

                // Flatten any nested arrays
                return ret.concat.apply([], ret);
            },

            // A global GUID counter for objects
            guid: 1,

            // Bind a function to a context, optionally partially applying any
            // arguments.
            //该方法有两种参数格式：1.jQuery.proxy(fn,context);    2.jQuery.proxy(context,name);
            proxy: function (fn, context) {
                if (typeof context === "string") {
                    var tmp = fn[context];
                    context = fn;
                    fn = tmp;
                }

                // Quick check to determine if target is callable, in the spec
                // this throws a TypeError, but we will just return undefined.
                if (!jQuery.isFunction(fn)) {
                    return undefined;
                }

                // Simulated bind
                var args = slice.call(arguments, 2),
                    proxy = function () {
                        return fn.apply(context, args.concat(slice.call(arguments)));
                    };

                // Set the guid of unique handler to the same of original handler, so it can be removed
                proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

                return proxy;
            },

            // Mutifunctional method to get and set values to a collection
            // The value/s can optionally be executed if it's a function
            /**
             * 可以为集合中的元素设置一个或者多个属性值，或者读取第一个元素的属性值
             * @param elems 元素集合，通常是jquery对象
             * @param key  属性名或含有键值对的对象
             * @param value  属性名或函数 。当参数key是对象时，该参数为undefined
             * @param exec  布尔值，当属性名为函数时，该参数指示了是否执行函数
             * @param fn  回调函数，同时支持读取和设置属性
             * @param pass  布尔值，该参数在功能上与参数exec重叠，并且方法相当繁琐，可以忽略这个参数
             * @returns {*}
             */
            access: function (elems, key, value, exec, fn, pass) {
                var length = elems.length;

                // Setting many attributes
                if (typeof key === "object") {
                    for (var k in key) {
                        jQuery.access(elems, k, key[k], exec, fn, value);
                    }
                    return elems;
                }

                // Setting one attribute
                if (value !== undefined) {
                    // Optionally, function values get executed if exec is true
                    exec = !pass && exec && jQuery.isFunction(value);
                    //遍历元素集合，为每个元素调用回调函数fn
                    for (var i = 0; i < length; i++) {
                        fn(elems[i], key, exec ? value.call(elems[i], i, fn(elems[i], key)) : value, pass);
                    }

                    return elems;
                }

                // Getting an attribute
                //读取第一个属性。
                return length ? fn(elems[0], key) : undefined;
            },
//返回当前时间的毫秒显示
            now: function () {
                return ( new Date() ).getTime();
            },

            // Use of jQuery.browser is frowned upon.
            // More details: http://docs.jquery.com/Utilities/jQuery.browser
            //浏览器嗅探
            uaMatch: function (ua) {
                ua = ua.toLowerCase();

                var match = rwebkit.exec(ua) ||
                    ropera.exec(ua) ||
                    rmsie.exec(ua) ||
                    ua.indexOf("compatible") < 0 && rmozilla.exec(ua) ||
                    [];

                return {browser: match[1] || "", version: match[2] || "0"};
            },

            sub: function () {
                function jQuerySub(selector, context) {
                    return new jQuerySub.fn.init(selector, context);
                }

                jQuery.extend(true, jQuerySub, this);
                jQuerySub.superclass = this;
                jQuerySub.fn = jQuerySub.prototype = this();
                jQuerySub.fn.constructor = jQuerySub;
                jQuerySub.sub = this.sub;
                jQuerySub.fn.init = function init(selector, context) {
                    if (context && context instanceof jQuery && !(context instanceof jQuerySub)) {
                        context = jQuerySub(context);
                    }

                    return jQuery.fn.init.call(this, selector, context, rootjQuerySub);
                };
                jQuerySub.fn.init.prototype = jQuerySub.fn;
                var rootjQuerySub = jQuerySub(document);
                return jQuerySub;
            },

            browser: {}
        });

// Populate the class2type map
        jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (i, name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });

        browserMatch = jQuery.uaMatch(userAgent);
        if (browserMatch.browser) {
            jQuery.browser[browserMatch.browser] = true;
            jQuery.browser.version = browserMatch.version;
        }

// Deprecated, use jQuery.browser.webkit instead
        if (jQuery.browser.webkit) {
            jQuery.browser.safari = true;
        }

// IE doesn't match non-breaking spaces with \s
        if (rnotwhite.test("\xA0")) {
            trimLeft = /^[\s\xA0]+/;
            trimRight = /[\s\xA0]+$/;
        }

// All jQuery objects should point back to these
        rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
        if (document.addEventListener) {
            DOMContentLoaded = function () {
                document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                jQuery.ready();
            };

        } else if (document.attachEvent) {
            DOMContentLoaded = function () {
                // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                if (document.readyState === "complete") {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                    jQuery.ready();
                }
            };
        }

// The DOM ready check for Internet Explorer
        //每隔1ms模拟点击滚动条，直到不再抛出异常为止
        function doScrollCheck() {
            if (jQuery.isReady) {
                return;
            }

            try {
                // If IE is used, use the trick by Diego Perini
                // http://javascript.nwbox.com/IEContentLoaded/
                document.documentElement.doScroll("left");
            } catch (e) {
                setTimeout(doScrollCheck, 1);
                return;
            }

            // and execute any waiting functions
            jQuery.ready();
        }

        return jQuery;

    })();


// String to Object flags format cache
    var flagsCache = {};

// Convert String-formatted flags into Object-formatted ones and store in cache
    function createFlags(flags) {
        var object = flagsCache[flags] = {},
            i, length;
        //使用空白符对标记字符串进行分割
        flags = flags.split(/\s+/);
        for (i = 0, length = flags.length; i < length; i++) {
            object[flags[i]] = true;
        }
        return object;
    }

    /*
     * Create a callback list using the following parameters:
     *
     *	flags:	an optional list of space-separated flags that will change how
     *			the callback list behaves
     *
     * By default a callback list will act like an event callback list and can be
     * "fired" multiple times.
     *
     * Possible flags:
     *
     *	once:			will ensure the callback list can only be fired once (like a Deferred)
     *
     *	memory:			will keep track of previous values and will call any callback added
     *					after the list has been fired right away with the latest "memorized"
     *					values (like a Deferred)
     *
     *	unique:			will ensure a callback can only be added once (no duplicate in the list)
     *
     *	stopOnFalse:	interrupt callings when a callback returns false
     *
     */
    jQuery.Callbacks = function (flags) {

        // Convert flags from String-formatted to Object-formatted
        // (we check in cache first)
        flags = flags ? ( flagsCache[flags] || createFlags(flags) ) : {};

        var // Actual callback list
            list = [],//存放回调函数的数组
            // Stack of fire calls for repeatable lists
            stack = [],//存放回调函数的上下文和参数
            // Last fire value (for non-forgettable lists)
            memory,//
            // Flag to know if list is currently firing
            firing,//回调函数是否正在执行
            // First callback to fire (used internally by add and fireWith)
            firingStart,//待执行的第一个回调函数的下标
            // End of the loop when firing
            firingLength,//待执行的最后一个回调函数的下标
            // Index of currently firing callback (modified by remove if needed)
            firingIndex,//当前正在执行的回调函数的下标
            // Add one or several callbacks to the list
            /**
             * 添加一个或者多个回调函数到数组list中
             * @param args 回调函数
             */
            add = function (args) {
                var i,
                    length,
                    elem,
                    type,
                    actual;
                for (i = 0, length = args.length; i < length; i++) {
                    elem = args[i];
                    type = jQuery.type(elem);
                    if (type === "array") {
                        // Inspect recursively
                        add(elem);
                    } else if (type === "function") {
                        // Add if not in unique mode and callback is not in
                        if (!flags.unique || !self.has(elem)) {
                            list.push(elem);
                        }
                    }
                }
            },
            // Fire callbacks
            /**
             * 使用指定的上下文和参数调用数组list中的回调函数
             * @param context指定回调函数执行时的上下文，即关键字this所引用的对象
             * @param args用于指定调用回调函数时传入的参数
             */
            fire = function (context, args) {
                args = args || [];
                memory = !flags.memory || [context, args];//表明当前回调函数列表已经被触发过
                firing = true;
                firingIndex = firingStart || 0;//表示正在执行的回调函数的下标
                firingStart = 0;
                firingLength = list.length;
                for (; list && firingIndex < firingLength; firingIndex++) {
                    if (list[firingIndex].apply(context, args) === false && flags.stopOnFalse) {
                        memory = true; // Mark as halted
                        break;
                    }
                }
                firing = false;//表示回调函数列表是否正在执行；
                if (list) {
                    if (!flags.once) {
                        if (stack && stack.length) {
                            memory = stack.shift();
                            self.fireWith(memory[0], memory[1]);
                        }
                    } else if (memory === true) {
                        self.disable();
                    } else {
                        list = [];
                    }
                }
            },
            // Actual Callbacks object回调函数列表，方法jquery.Callbacks(falg)的返回值
            self = {
                // Add a callback or a collection of callbacks to the list
                //用于添加一个或一组回调函数到回调函数列表中
                add: function () {
                    if (list) {
                        var length = list.length;
                        add(arguments);
                        // Do we need to add the callbacks to the
                        // current firing batch?
                        if (firing) {
                            firingLength = list.length;
                            // With memory, if we're not firing then
                            // we should call right away, unless previous
                            // firing was halted (stopOnFalse)
                        } else if (memory && memory !== true) {
                            firingStart = length;
                            fire(memory[0], memory[1]);
                        }
                    }
                    return this;
                },
                // Remove a callback from the list
                //移除前，需要修正结束下标firingLength和当前下标firingIndex，确保移除的同时不会漏执行回调函数
                remove: function () {
                    if (list) {
                        var args = arguments,
                            argIndex = 0,
                            argLength = args.length;
                        for (; argIndex < argLength; argIndex++) {
                            for (var i = 0; i < list.length; i++) {
                                if (args[argIndex] === list[i]) {
                                    // Handle firingIndex and firingLength
                                    if (firing) {
                                        if (i <= firingLength) {
                                            firingLength--;
                                            if (i <= firingIndex) {
                                                firingIndex--;
                                            }
                                        }
                                    }
                                    // Remove the element
                                    list.splice(i--, 1);
                                    // If we have some unicity property then
                                    // we only need to do this once
                                    if (flags.unique) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    return this;
                },
                // Control if a given callback is in the list
                has: function (fn) {
                    if (list) {
                        var i = 0,
                            length = list.length;
                        for (; i < length; i++) {
                            if (fn === list[i]) {
                                return true;
                            }
                        }
                    }
                    return false;
                },
                // Remove all callbacks from the list
                empty: function () {
                    list = [];
                    return this;
                },
                // Have the list do nothing anymore
                disable: function () {
                    list = stack = memory = undefined;
                    return this;
                },
                // Is it disabled?
                disabled: function () {
                    return !list;
                },
                // Lock the list in its current state
                lock: function () {
                    stack = undefined;
                    if (!memory || memory === true) {
                        self.disable();
                    }
                    return this;
                },
                // Is it locked?
                locked: function () {
                    return !stack;
                },
                // Call all callbacks with the given context and arguments
                //使用指定的上下文和参数触发回调函数列表中的所有回调函数。
                fireWith: function (context, args) {
                    if (stack) {
                        if (firing) {
                            if (!flags.once) {
                                stack.push([context, args]);
                            }
                        } else if (!( flags.once && memory )) {
                            fire(context, args);
                        }
                    }
                    return this;
                },
                // Call all the callbacks with the given arguments
                //使用指定的参数触发回调函数列表中的所有回调函数
                fire: function () {
                    self.fireWith(this, arguments);
                    return this;
                },
                // To know if the callbacks have already been called at least once
                //用于判断回调函数列表是否被触发过
                fired: function () {
                    return !!memory;
                }
            };

        return self;
    };


    var // Static reference to slice
        sliceDeferred = [].slice;

    jQuery.extend({

        Deferred: function (func) {
            var doneList = jQuery.Callbacks("once memory"), //once表示回调函数列表只能被触发一次，memory表示会记录上一次触发回调函数列表时的参数，触发后添加的任何回调函数都将用记录的参数值立即调用
                failList = jQuery.Callbacks("once memory"),
                progressList = jQuery.Callbacks("memory"),
                state = "pending",
                lists = {
                    resolve: doneList,
                    reject: failList,
                    notify: progressList //消息回调函数列表
                },
                //创建异步队列的只读副本，promise
                promise = {
                    done: doneList.add,
                    fail: failList.add,
                    progress: progressList.add,

                    state: function () {
                        return state;
                    },

                    // Deprecated
                    isResolved: doneList.fired,
                    isRejected: failList.fired,
                    //用于同时添加成功回调函数，失败回调函数和消息回调函数到对应的回调函数列表
                    then: function (doneCallbacks, failCallbacks, progressCallbacks) {
                        deferred.done(doneCallbacks).fail(failCallbacks).progress(progressCallbacks);
                        return this;
                    },
                    always: function () {
                        deferred.done.apply(deferred, arguments).fail.apply(deferred, arguments);
                        return this;
                    },
                    //用于过滤当前异步队列的状态和参数，并返回一个新的异步队列的只读副本。
                    pipe: function (fnDone, fnFail, fnProgress) {
                        return jQuery.Deferred(function (newDefer) {
                            jQuery.each({
                                done: [fnDone, "resolve"],
                                fail: [fnFail, "reject"],
                                progress: [fnProgress, "notify"]
                            }, function (handler, data) {
                                var fn = data[0],
                                    action = data[1],
                                    returned;
                                if (jQuery.isFunction(fn)) {
                                    deferred[handler](function () {
                                        returned = fn.apply(this, arguments);
                                        if (returned && jQuery.isFunction(returned.promise)) {
                                            returned.promise().then(newDefer.resolve, newDefer.reject, newDefer.notify);
                                        } else {
                                            newDefer[action + "With"](this === deferred ? newDefer : this, [returned]);
                                        }
                                    });
                                } else {
                                    deferred[handler](newDefer[action]);
                                }
                            });
                        }).promise();
                    },
                    // Get a promise for this deferred
                    // If obj is provided, the promise aspect is added to the object
                    promise: function (obj) {
                        if (obj == null) {
                            obj = promise;
                        } else {
                            for (var key in promise) {
                                obj[key] = promise[key];
                            }
                        }
                        return obj;
                    }
                },
                //--------start  创建异步队列
                //异步队列  1.把只读副本promise中的方法添加到异步队列deferred中。
                deferred = promise.promise({}),
                key;
            //添加触发成功，失败，消息回调函数列表的方法
            for (key in lists) {
                deferred[key] = lists[key].fire;
                deferred[key + "With"] = lists[key].fireWith;
            }
            //添加设置状态的回调函数
            // Handle state
            deferred.done(function () {
                state = "resolved";
            }, failList.disable, progressList.lock).fail(function () {
                state = "rejected";
            }, doneList.disable, progressList.lock);
            //------end 创建异步队列结束
            // Call given func if any
            //如果传入函数参数func，则执行
            if (func) {
                func.call(deferred, deferred);
            }

            // All done!
            return deferred;
        },

        // Deferred helper
        //调用方法jQuery.when(deferreds)时传入多个异步队列作为参数，则在内部创建一个"主"异步队列，并维护一个计数器。而传入的异步队列参数则称为"子"异步队列
        when: function (firstParam) {
            var args = sliceDeferred.call(arguments, 0),//用于存放子异步队列的成功参数
                i = 0,
                length = args.length,
                pValues = new Array(length),
                count = length,//用于监听子异步队列的消息参数。
                pCount = length,
                deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise) ?
                    firstParam :
                    jQuery.Deferred(),
                promise = deferred.promise();//主异步队列的只读副本，主要是为了防止执行主异步队列的消息回调函数时，避免在消息回调参数中改变主异步队列的状态
            /**
             * 成功状态监听函数，返回一个用于监听子异步队列成功状态的回调函数。
             * @param i
             * @returns {Function}
             */
            function resolveFunc(i) {
                return function (value) {
                    args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
                    if (!( --count )) {
                        deferred.resolveWith(deferred, args);
                    }
                };
            }

            /**
             * 消息参数收集函数，返回一个用于收集子异步队列消息参数的回调函数
             * @param i
             * @returns {Function}
             */
            function progressFunc(i) {
                return function (value) {
                    pValues[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
                    deferred.notifyWith(promise, pValues);//避免在消息回调函数中改变主异步队列的状态
                };
            }

            if (length > 1) {
                for (; i < length; i++) {//传入的参数是异步队列
                    if (args[i] && args[i].promise && jQuery.isFunction(args[i].promise)) {
                        args[i].promise().then(resolveFunc(i), deferred.reject, progressFunc(i));
                    } else {//传入的参数不是异步队列
                        --count;
                    }
                }
                if (!count) {//count为0了
                    deferred.resolveWith(deferred, args);
                }
            } else if (deferred !== firstParam) {//没有传入参数的情况下
                deferred.resolveWith(deferred, length ? [firstParam] : []);
            }
            return promise;
        }
    });


    jQuery.support = (function () {

        var support,
            all,
            a,
            select,
            opt,
            input,
            marginDiv,
            fragment,
            tds,
            events,
            eventName,
            i,
            isSupported,
            div = document.createElement("div"),
            documentElement = document.documentElement;

        // Preliminary(初步) tests
        //在IE6/7中，设置和读取HTML属性class时，需要传入DOM属性className。
        div.setAttribute("className", "t");
        div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

        all = div.getElementsByTagName("*");
        a = div.getElementsByTagName("a")[0];

        // Can't get basic test support
        if (!all || !all.length || !a) {
            return {};
        }

        // First batch of supports tests
        select = document.createElement("select");
        opt = select.appendChild(document.createElement("option"));
        input = div.getElementsByTagName("input")[0];

        support = {
            // IE strips leading whitespace when .innerHTML is used
            //浏览器使用innerHTML属性插入HTML代码时是否保留前导空白符
            leadingWhitespace: ( div.firstChild.nodeType === 3 ),

            // Make sure that tbody elements aren't automatically inserted
            // IE will insert them into empty tables
            //如果空的table元素可以存在且不包含tbody元素，则该测试项为true。
            tbody: !div.getElementsByTagName("tbody").length,

            // Make sure that link elements get serialized correctly by innerHTML
            // This requires a wrapper element in IE
            //如果浏览器使用innerHTML属性可以正确的序列化link标签，则该测试项为true。
            htmlSerialize: !!div.getElementsByTagName("link").length,

            // Get the style information from getAttribute
            // (IE uses .cssText instead)
            //如果DOM元素的内联样式可以通过DOM属性style直接访问，即测试项style为true。IE6/7/8为false。
            style: /top/.test(a.getAttribute("style")),

            // Make sure that URLs aren't manipulated(操作)
            // (IE normalizes it by default)
            //判断浏览器是否会格式化属性href
            hrefNormalized: ( a.getAttribute("href") === "/a" ),

            // Make sure that element opacity exists
            // (IE uses filter instead)
            // Use a regex(正则) to work around a WebKit issue. See #5145
            //如果浏览器支持样式opacity,则该测试项为true。
            opacity: /^0.55/.test(a.style.opacity),

            // Verify style float existence
            // (IE uses styleFloat instead of cssFloat)
            //如果浏览器支持通过style.cssFloat访问样式float，即该测试项为true； IE6/7/8为false
            cssFloat: !!a.style.cssFloat,

            // Make sure that if no value is specified for a checkbox
            // that it defaults to "on".
            // (WebKit defaults to "" instead)这里指的是safari
            //如果复选框的属性value默认值是"on"，则该测试项为true；
            checkOn: ( input.value === "on" ),

            // Make sure that a selected-by-default option has a working selected property.
            // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
            optSelected: opt.selected,

            // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
            //判断能否使用原生方法getAttribute、setAttribute、removeAttribute正确的设置，读取和移除HTML属性。
            getSetAttribute: div.className !== "t",

            // Tests for enctype support on a form(#6743)
            //测试表单元素是否支持enctype.支持为true。
            //属性enctype用于规定在将表单数据发送到服务器之前应该如何对其进行编码
            enctype: !!document.createElement("form").enctype,

            // Makes sure cloning an html5 element does not cause problems
            // Where outerHTML is undefined, this still works
            //判断浏览器能否正确地复制HTML5元素。能，true
            html5Clone: document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>",//检查副本元素的属性outerHTML是否是非法值

            // Will be defined later
            //如果submit事件沿着DOM树向上冒泡，则该测试项为true；IE6/7/8 submit事件不会冒泡；
            submitBubbles: true,
            //change事件 IE6/7/8 change事件不会冒泡
            changeBubbles: true,
            //如果IE支持focusin事件，该测试项为true；其他浏览器为false；
            focusinBubbles: false,
            //浏览器允许删除DOM元素上的属性
            deleteExpando: true,
            //如果浏览器在复制DOM元素时不复制事件监听函数，则该测试项为true；IE6/7/8会连同事件监听一起复制。==>false
            noCloneEvent: true,
            //为DOM元素设置了样式"display:inline;zoom:1"之后，如果该元素按照inline-block显示，该测试项为true;
            //在IE6/7中显示正确，在IE怪异模式下为false；
            inlineBlockNeedsLayout: false,
            //在IE下，一个元素拥有hasLayout属性和固定的width或height时，如果该元素会被子元素撑大，则该测试项为true； 在IE6和IE6--9的怪异模式下为true；
            shrinkWrapBlocks: false,
            //@盒模型测试：如果浏览器返回正确的计算样式marginRight(右外边距)，该测试项为true；
            reliableMarginRight: true
        };

        // Make sure checked status is properly cloned
        input.checked = true;
        //测试浏览器在复制DOM元素时会复制选中状态(属性checked)，则该测试项为true；在IE中不会复制
        support.noCloneChecked = input.cloneNode(true).checked;

        // Make sure that the options inside disabled selects aren't marked as disabled
        // (WebKit marks them as disabled)
        select.disabled = true;
        //如果已禁用的select元素中的option子元素未被自动禁用，则该测试项为true。
        support.optDisabled = !opt.disabled;

        // Test to see if it's possible to delete an expando from an element
        // Fails in Internet Explorer
        try {
            delete div.test;
        } catch (e) {
            support.deleteExpando = false;
        }

        if (!div.addEventListener && div.attachEvent && div.fireEvent) {
            div.attachEvent("onclick", function () {
                // Cloning a node shouldn't copy over any
                // bound event handlers (IE does this)
                support.noCloneEvent = false;
            });
            div.cloneNode(true).fireEvent("onclick");
        }

        // Check if a radio maintains its value
        // after being appended to the DOM
        input = document.createElement("input");
        input.value = "t";
        input.setAttribute("type", "radio");
        //如果设置input元素的属性type为"radio"，不会导致属性value的丢失，则该测试项为true。
        support.radioValue = input.value === "t";

        input.setAttribute("checked", "checked");
        div.appendChild(input);
        fragment = document.createDocumentFragment();
        fragment.appendChild(div.lastChild);

        // WebKit doesn't clone checked state correctly in fragments
        //如果浏览器在文档片段中能正确复制单选按钮和复选框的选中状态(即属性checked)，则测试项checkClone为true。IE6/7位false。
        support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;

        // Check if a disconnected checkbox will retain its checked
        // value of true after appended to the DOM (IE6/7)
        //已选中的单选按钮和复选框添加到DOM树中后，如果仍然为选中状态，则该测试项为true。
        support.appendChecked = input.checked;

        fragment.removeChild(input);
        fragment.appendChild(div);

        div.innerHTML = "";

        // Check if div with explicit(明确的) width and no margin-right incorrectly
        // gets computed margin-right based on width of container. For more
        // info see bug #3333
        // Fails in WebKit before Feb 2011 nightlies
        // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
        if (window.getComputedStyle) {
            marginDiv = document.createElement("div");
            marginDiv.style.width = "0";
            marginDiv.style.marginRight = "0";
            div.style.width = "2px";
            div.appendChild(marginDiv);
            support.reliableMarginRight =
                ( parseInt(( window.getComputedStyle(marginDiv, null) || {marginRight: 0} ).marginRight, 10) || 0 ) === 0;
        }

        // Technique from Juriy Zaytsev
        // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
        // We only care about the case where non-standard event systems
        // are used, namely in IE. Short-circuiting here helps us to
        // avoid an eval call (in setAttribute) which can cause CSP
        // to go haywire. See: https://developer.mozilla.org/en/Security/CSP
        if (div.attachEvent) {
            for (i in {
                submit: 1,
                change: 1,
                focusin: 1
            }) {
                eventName = "on" + i;
                //检查div上是否有属性onsubmit,onchange,onfocusin，如果有，则表示对应的事件支持冒泡
                isSupported = ( eventName in div );
                if (!isSupported) {
                    div.setAttribute(eventName, "return;");
                    //检查浏览器是否会把设置的字符串转换为函数，如果转换为函数，则说明会冒泡
                    isSupported = ( typeof div[eventName] === "function" );
                }
                support[i + "Bubbles"] = isSupported;
            }
        }

        fragment.removeChild(div);

        // Null elements to avoid leaks in IE
        fragment = select = opt = marginDiv = div = input = null;

        // Run tests that need a body at doc ready
        jQuery(function () {
            var container, outer, inner, table, td, offsetSupport,
                conMarginTop, ptlm, vb, style, html,
                body = document.getElementsByTagName("body")[0];

            if (!body) {
                // Return for frameset docs that don't have a body
                return;
            }

            conMarginTop = 1;
            ptlm = "position:absolute;top:0;left:0;width:1px;height:1px;margin:0;";
            vb = "visibility:hidden;border:0;";
            style = "style='" + ptlm + "border:5px solid #000;padding:0;'";
            html = "<div " + style + "><div></div></div>" +
                "<table " + style + " cellpadding='0' cellspacing='0'>" +
                "<tr><td></td></tr></table>";

            container = document.createElement("div");
            container.style.cssText = vb + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
            body.insertBefore(container, body.firstChild);

            // Construct the test element
            div = document.createElement("div");
            container.appendChild(div);

            // Check if table cells still have offsetWidth/Height when they are set
            // to display:none and there are still other visible table cells in a
            // table row; if so, offsetWidth/Height are not reliable for use when
            // determining if an element has been hidden directly using
            // display:none (it is still safe to use offsets if a parent element is
            // hidden; don safety goggles and see bug #4512 for more information).
            // (only IE 8 fails this test)
            div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
            tds = div.getElementsByTagName("td");
            isSupported = ( tds[0].offsetHeight === 0 );

            tds[0].style.display = "";
            tds[1].style.display = "none";

            // Check if empty table cells still have offsetWidth/Height
            // (IE <= 8 fail this test)
            //如果空单元格的可见高度offsetHeight为0，则该测试项为true；在IE6/7/8中，空单元格的可见高度offsetHeight为1，此时测试项为false
            support.reliableHiddenOffsets = isSupported && ( tds[0].offsetHeight === 0 );

            // Figure out if the W3C box model works as expected
            div.innerHTML = "";
            div.style.width = div.style.paddingLeft = "1px";
            //检测浏览器是否按照W3C标准盒模型解析元素的内容大小
            jQuery.boxModel = support.boxModel = div.offsetWidth === 2;

            if (typeof div.style.zoom !== "undefined") {
                // Check if natively block-level elements act like inline-block
                // elements when setting their display to 'inline' and giving
                // them layout
                // (IE < 8 does this)
                div.style.display = "inline";
                div.style.zoom = 1;
                support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

                // Check if elements with layout shrink-wrap their children
                // (IE 6 does this)
                div.style.display = "";
                div.innerHTML = "<div style='width:4px;'></div>";
                support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
            }

            div.style.cssText = ptlm + vb;
            div.innerHTML = html;

            outer = div.firstChild;
            inner = outer.firstChild;
            td = outer.nextSibling.firstChild.firstChild;

            offsetSupport = {
                //如果子元素距其父元素上边界的距离offsetTop不包括父元素的上边框厚度，则该测试项为true；
                doesNotAddBorder: ( inner.offsetTop !== 5 ),
                //如果td元素距其父元素tr上边界的距离offsetTop包含table元素的上边框厚度，则该测试项为true；
                doesAddBorderForTableAndCells: ( td.offsetTop === 5 )
            };

            inner.style.position = "fixed";
            inner.style.top = "20px";

            // safari subtracts(减去) parent border width here which is 5px
            //如果浏览器可以正确返回fixed元素的窗口坐标，则该测试项为true；
            offsetSupport.fixedPosition = ( inner.offsetTop === 20 || inner.offsetTop === 15 );
            inner.style.position = inner.style.top = "";

            outer.style.overflow = "hidden";
            outer.style.position = "relative";
            //如果父元素的样式overflow为"hidden",子元素距父元素边界的距离会减去父元素的边框厚度，该测试项为true；
            // 在主流的浏览器中，该测试项几乎都为false，即都不会减去父元素的边框厚度；
            offsetSupport.subtractsBorderForOverflowNotVisible = ( inner.offsetTop === -5 );
            //如果body元素距HTML元素边框的距离不包括body元素的外边距margin，则该测试项为true；
            offsetSupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== conMarginTop );

            body.removeChild(container);
            div = container = null;

            jQuery.extend(support, offsetSupport);
        });

        return support;
    })();


    var rbrace = /^(?:\{.*\}|\[.*\])$/,
        rmultiDash = /([A-Z])/g;
    jQuery.extend({
        cache: {},//全局缓存对象

        // Please use with caution
        uuid: 0,//唯一ID种子

        // Unique for each copy of jQuery on the page
        // Non-digits removed to match rinlinejQuery
        expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace(/\D/g, ""),//页面中每个jQuery副本的唯一标识

        // The following elements throw uncatchable exceptions if you
        // attempt to add expando properties to them.
        noData: {
            "embed": true,
            // Ban all objects except for Flash (which handle expandos)
            "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            "applet": true
        },
        //是否有关联的数据
        hasData: function (elem) {
            elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];
            return !!elem && !isEmptyDataObject(elem);
        },
        /**
         * 设置、读取自定义数据或者内部数据
         * @param elem 表示与数据关联的DOM元素
         * @param name 表示要设置或读取的数据名，或者是含有键值对的对象
         * @param data 表示要设置的数据值，或者是任意类型
         * @param pvt pvt为true时，设置或读取内部数据，内部数据存储在关联的数据缓存对象上 || pvt为false时，设置或读取自定义数据，自定义数据存储在关联的数据缓存对象的属性data上。
         * @returns {*}
         */
        data: function (elem, name, data, pvt /* Internal Use Only */) {
            if (!jQuery.acceptData(elem)) {
                return;
            }

            var privateCache, thisCache, ret,
                internalKey = jQuery.expando,//页面中每个jquery副本的唯一标识
                getByName = typeof name === "string",

                // We have to handle DOM nodes and JS objects differently because IE6-7
                // can't GC object references properly across the DOM-JS boundary
                isNode = elem.nodeType,

                // Only DOM nodes need the global jQuery cache; JS object data is
                // attached directly to the object so GC can occur automatically
                cache = isNode ? jQuery.cache : elem,//避免JavaScript与DOM元素之间的循环引用导致的浏览器(IE6/IE7)垃圾回收机制不起作用

                // Only defining an ID for JS objects if its cache already exists allows
                // the code to shortcut on the same path as a DOM node with no cache
                id = isNode ? elem[internalKey] : elem[internalKey] && internalKey,
                isEvents = name === "events";

            // Avoid doing any more work than we need to when trying to get data on an
            // object that has no data at all
            if ((!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined) {
                return;
            }

            if (!id) {
                // Only DOM nodes need a new unique ID for each element since their data
                // ends up in the global cache
                if (isNode) {
                    elem[internalKey] = id = ++jQuery.uuid;//对于DOM元素，jquery.uuid会自动加1，并附加到DOM元素上
                } else {
                    id = internalKey;//对于JavaScript对象，关联ID就是jquery.expando.
                }
            }

            if (!cache[id]) {
                cache[id] = {};

                // Avoids exposing jQuery metadata on plain JS objects when the object
                // is serialized using JSON.stringify
                if (!isNode) {
                    cache[id].toJSON = jQuery.noop;//对于javascript对象，设置toJSON方法为空函数，避免在执行JSON.Stringify时暴露缓存数据
                }
            }

            // An object can be passed to jQuery.data instead of a key/value pair; this gets
            // shallow copied over onto the existing cache
            //如果参数name是object或者函数，则批量设置数据
            if (typeof name === "object" || typeof name === "function") {
                if (pvt) {
                    cache[id] = jQuery.extend(cache[id], name);//内部
                } else {
                    cache[id].data = jQuery.extend(cache[id].data, name);//自定义
                }
            }

            privateCache = thisCache = cache[id];

            // jQuery data() is stored in a separate object inside the object's internal data
            // cache in order to avoid key collisions between internal data and user-defined
            // data.
            if (!pvt) {
                if (!thisCache.data) {
                    thisCache.data = {};
                }

                thisCache = thisCache.data;
            }

            if (data !== undefined) {
                thisCache[jQuery.camelCase(name)] = data;
            }

            // Users should not attempt to inspect the internal events object using jQuery.data,
            // it is undocumented and subject to change. But does anyone listen? No.
            //解释：如果pvt为false的话，说明目的是想读取用户自定义数据，但是如果thisCache[events]不存在的话，则会返回私有数据缓存对象privateCache.events。这就会导致期望结果和实际结果不一致。
            //因此，作者建议，不要使用jQuery.data()设置、读取数据events。
            if (isEvents && !thisCache[name]) {
                return privateCache.events;
            }

            // Check for both converted-to-camel and non-converted data property names
            // If a data property was specified
            //参数name是字符串
            if (getByName) {

                // First Try to find as-is property data
                ret = thisCache[name];//尝试第一次取值

                // Test for null|undefined property data
                if (ret == null) {

                    // Try to find the camelCased property
                    ret = thisCache[jQuery.camelCase(name)];
                }
            } else {
                ret = thisCache;
            }

            return ret;
        },
        /**
         * 移除自定义数据或者内部数据
         * @param elem 待移除数据的DOM元素或者JavaScript对象
         * @param name 待移除数据名，可以是单个数据名，数据名数组，用空格分隔的多个数据
         * @param pvt  指示待移除数据是内部数据还是自定义数据 true：内部数据
         */
        removeData: function (elem, name, pvt /* Internal Use Only */) {
            //检查是否可以设置数据
            if (!jQuery.acceptData(elem)) {
                return;
            }

            var thisCache, i, l,

                // Reference to internal data cache key
                internalKey = jQuery.expando,

                isNode = elem.nodeType,

                // See jQuery.data for more information
                //对于DOM元素，数据存储在jQuery.cache中，对于JavaScript对象，数据直接存储在对象上
                cache = isNode ? jQuery.cache : elem,

                // See jQuery.data for more information
                //取出关联id
                id = isNode ? elem[internalKey] : internalKey;

            // If there is already no cache entry for this object, there is no
            // purpose in continuing
            if (!cache[id]) {
                return;
            }

            if (name) {

                thisCache = pvt ? cache[id] : cache[id].data;

                if (thisCache) {

                    // Support array or space separated string names for data keys
                    //如果name不是一个数组，则将其变为一个数组
                    if (!jQuery.isArray(name)) {

                        // try the string as a key before any manipulation(操作)
                        if (name in thisCache) {
                            name = [name];
                        } else {

                            // split the camel cased version by spaces unless a key with the spaces exists
                            name = jQuery.camelCase(name);
                            if (name in thisCache) {
                                name = [name];
                            } else {
                                name = name.split(" ");
                            }
                        }
                    }

                    for (i = 0, l = name.length; i < l; i++) {
                        delete thisCache[name[i]];
                    }

                    // If there is no data left in the cache, we want to continue
                    // and let the cache object itself get destroyed
                    if (!( pvt ? isEmptyDataObject : jQuery.isEmptyObject )(thisCache)) {
                        return;
                    }
                }
            }

            // See jQuery.data for more information
            if (!pvt) {
                delete cache[id].data;

                // Don't destroy the parent cache unless the internal data object
                // had been the only thing left in it
                if (!isEmptyDataObject(cache[id])) {
                    return;
                }
            }

            // Browsers that fail expando deletion also refuse to delete expandos on
            // the window, but it will allow it on all other JS objects; other browsers
            // don't care
            // Ensure that `cache` is not a window object #10080
            //支持删除DOM元素上的扩展属性            cache不是window对象
            if (jQuery.support.deleteExpando || !cache.setInterval) {//
                delete cache[id];
            } else {
                cache[id] = null;
            }

            // We destroyed the cache and need to eliminate the expando on the node to avoid
            // false lookups in the cache for entries that no longer exist
            //删除DOM元素上扩展的jQuery.expando属性
            if (isNode) {
                // IE does not allow us to delete expando properties from nodes,
                // nor does it have a removeAttribute function on Document nodes;
                // we must handle all of these cases
                if (jQuery.support.deleteExpando) {//删除DOM元素上的扩展属性
                    delete elem[internalKey];
                } else if (elem.removeAttribute) {//移除DOM元素上扩展的jQuery.expando属性
                    elem.removeAttribute(internalKey);
                } else {//设置DOM元素上扩展的jQuery.expando属性为null。
                    elem[internalKey] = null;
                }
            }
        },

        // For internal use only.
        //设置、读取内部数据
        _data: function (elem, name, data) {
            return jQuery.data(elem, name, data, true);
        },

        // A method for determining if a DOM node can handle the data expando
        //是否可以设置数据
        acceptData: function (elem) {
            if (elem.nodeName) {
                var match = jQuery.noData[elem.nodeName.toLowerCase()];

                if (match) {
                    return !(match === true || elem.getAttribute("classid") !== match);//object检查classid是否是flash。当为flash组件的时候，是可以附加扩展属性的。
                }
            }

            return true;
        }
    });

    jQuery.fn.extend({

        /**
         * 设置、读取自定义数据，解析HTML5属性data-
         如果未传入参数，则返回第一个匹配元素关联的自定义数据缓存对象
         如果参数key是对象，则为匹配元素批量设置数据
         如果只传入参数key，则返回第一个匹配元素的指定名称的数据
         如果只传入参数key和value，则为每个匹配元素设置数据
         * @param key  表示要设置或读取的数据名，或者是含有键值对的对象
         * @param value 表示要设置的数据值，可以是任意类型
         * @returns {*}
         */
        data: function (key, value) {
            var parts, attr, name,
                data = null;
            //1.未传入参数的情况
            if (typeof key === "undefined") {
                if (this.length) {
                    //获取第一个匹配元素关联的自定义数据缓存对象
                    data = jQuery.data(this[0]);

                    if (this[0].nodeType === 1 && !jQuery._data(this[0], "parsedAttrs")) {
                        attr = this[0].attributes;
                        for (var i = 0, l = attr.length; i < l; i++) {
                            name = attr[i].name;

                            if (name.indexOf("data-") === 0) {
                                name = jQuery.camelCase(name.substring(5));

                                dataAttr(this[0], name, data[name]);
                            }
                        }
                        jQuery._data(this[0], "parsedAttrs", true);//标记已解析过HTML5属性data-
                    }
                }

                return data;
                //2.参数是对象的情况
            } else if (typeof key === "object") {
                return this.each(function () {
                    jQuery.data(this, key);
                });
            }
            //3.只传入参数key的情况  则返回第一个匹配元素的指定名称的数据
            parts = key.split(".");
            parts[1] = parts[1] ? "." + parts[1] : "";

            if (value === undefined) {
                //首先尝试触发自定义事件getData
                data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

                // Try to fetch any internally stored data first
                //如果data没有值，则再次尝试从自定义数据缓存对象中读取
                if (data === undefined && this.length) {
                    data = jQuery.data(this[0], key);
                    data = dataAttr(this[0], key, data);
                }

                return data === undefined && parts[1] ?
                    this.data(parts[0]) :
                    data;

            } else {//4.传入参数key和value的情况  为每个匹配元素设置任意类型的数据，并触发事件setData,changeData
                return this.each(function () {
                    var self = jQuery(this),
                        args = [parts[0], value];

                    self.triggerHandler("setData" + parts[1] + "!", args);//！表示只执行没有命名空间的事件监听函数
                    jQuery.data(this, key, value);
                    self.triggerHandler("changeData" + parts[1] + "!", args);
                });
            }
        },
        //移除自定义数据
        removeData: function (key) {
            return this.each(function () {
                jQuery.removeData(this, key);
            });
        }
    });
    /**
     * 用于解析HTML5属性data-中含有的数据，并把解析结果放入DOM元素关联的自定义数据缓存对象中
     * @param elem  表示待解析的HTML5属性data-的DOM元素
     * @param key  表示待解析的数据名，不包括前缀data-
     * @param data  表示从DOM元素关联的自定义数据缓存对象中取得的数据，优先读取自定义数据缓存对象中的数据(只有参数data为undefined时，才会解析HTML5属性data-)
     * @returns {*}
     */
    function dataAttr(elem, key, data) {
        // If nothing was found internally, try to fetch any
        // data from the HTML5 data-* attribute
        if (data === undefined && elem.nodeType === 1) {

            var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();

            data = elem.getAttribute(name);

            if (typeof data === "string") {
                try {
                    data = data === "true" ? true :
                        data === "false" ? false :
                            data === "null" ? null :
                                jQuery.isNumeric(data) ? parseFloat(data) :
                                    rbrace.test(data) ? jQuery.parseJSON(data) :
                                        data;
                } catch (e) {
                }

                // Make sure we set the data so it isn't changed later
                jQuery.data(elem, key, data);

            } else {
                data = undefined;
            }
        }

        return data;
    }

// checks a cache object for emptiness
    //检查数据缓存对象是否为空
    function isEmptyDataObject(obj) {
        for (var name in obj) {

            // if the public data object is empty, the private is still empty
            if (name === "data" && jQuery.isEmptyObject(obj[name])) {
                continue;
            }
            if (name !== "toJSON") {
                return false;
            }
        }

        return true;
    }


    //队列Queue
    /**
     * 检测函数队列和计数器是否完成
     * @param elem
     * @param type 关联的队列和计数器的名称
     * @param src  可选值。有"queue","mark"或者不传入。用于加速判断是否有关联的队列和计数器，提高性能
     */
    function handleQueueMarkDefer(elem, type, src) {
        var deferDataKey = type + "defer",//回调函数列表
            queueDataKey = type + "queue",//队列
            markDataKey = type + "mark",//计数器
            defer = jQuery._data(elem, deferDataKey);
        if (defer &&
            ( src === "queue" || !jQuery._data(elem, queueDataKey) ) &&
            ( src === "mark" || !jQuery._data(elem, markDataKey) )) {
            // Give room for hard-coded callbacks to fire first
            // and eventually(最后) mark/queue something else on the element
            setTimeout(function () {
                if (!jQuery._data(elem, queueDataKey) && !jQuery._data(elem, markDataKey)) {
                    jQuery.removeData(elem, deferDataKey, true);
                    defer.fire();
                }
            }, 0);
        }
    }

    jQuery.extend({
        //计数器type+mark加1
        _mark: function (elem, type) {
            if (elem) {
                type = ( type || "fx" ) + "mark";//表明这是一个计数器
                jQuery._data(elem, type, (jQuery._data(elem, type) || 0) + 1);
            }
        },
        /**
         * 计数器type+mark减1
         * @param force  是否强制使计数器归0
         * @param elem
         * @param type
         * @private
         */
        _unmark: function (force, elem, type) {
            if (force !== true) {
                type = elem;
                elem = force;
                force = false;
            }
            if (elem) {
                type = type || "fx";
                var key = type + "mark",
                    count = force ? 0 : ( (jQuery._data(elem, key) || 1) - 1 );
                if (count) {
                    jQuery._data(elem, key, count);
                } else {//计数器的值是0
                    jQuery.removeData(elem, key, true);
                    handleQueueMarkDefer(elem, type, "mark");
                }
            }
        },

        /**
         * 函数入队，并返回队列
         * 用于返回或修改匹配元素关联的函数队列，该方法的功能取决于参数的个数和类型
         * @param elem DOM元素或JavaScript对象，在其上查找或修改队列
         * @param type 字符串，表示队列名称，默认为标准动画fx。
         * @param data 可选的函数或函数数组，不传时返回队列，其为函数时入队，为函数数组时替换队列
         * @returns {*|Array}
         */
        queue: function (elem, type, data) {
            var q;
            if (elem) {
                type = ( type || "fx" ) + "queue";//表明这是一个队列
                //取出参数type对应的队列
                q = jQuery._data(elem, type);

                // Speed up dequeue by getting out quickly if this is just a lookup
                if (data) {
                    if (!q || jQuery.isArray(data)) {
                        q = jQuery._data(elem, type, jQuery.makeArray(data));//替换队列
                    } else {
                        q.push(data);
                    }
                }
                return q || [];
            }
        },
        //函数出队，并执行匹配元素关联的函数队列中的下一个函数
        dequeue: function (elem, type) {
            type = type || "fx";

            var queue = jQuery.queue(elem, type),
                fn = queue.shift(),//出队第一个函数
                hooks = {};//用于存放出队的函数在执行时的数据

            // If the fx queue is dequeued, always remove the progress sentinel
            if (fn === "inprogress") {
                fn = queue.shift();
            }
            //设置动画占位符，表明动画函数正在执行过程中
            if (fn) {
                // Add a progress sentinel(标记) to prevent the fx queue from being
                // automatically(自动的) dequeued
                if (type === "fx") {
                    queue.unshift("inprogress");
                }

                jQuery._data(elem, type + ".run", hooks);
                fn.call(elem, function () {
                    jQuery.dequeue(elem, type);
                }, hooks);//hooks表示type+".run"对应的值
            }
            //当所有函数都已经出队并执行
            if (!queue.length) {
                jQuery.removeData(elem, type + "queue " + type + ".run", true);
                handleQueueMarkDefer(elem, type, "queue");
            }
        }
    });

    jQuery.fn.extend({
        //取出函数队列，或函数入队
        /**
         * 用于返回第一个匹配元素关联的函数队列，或修改所有匹配元素关联的函数队列。该方法的功能取决于函数的个数和类型
         * .queue([queueName]) 返回第一个匹配元素关联的函数队列
         * .queue([queueName],newQueue) 修改匹配元素关联的函数队列，用函数数组newQueue替换当前队列
         * .queue([queueName],callback(next)) 修改匹配元素关联的函数队列，添加callback函数到队列中
         * @param type 字符串，表示队列名称，默认是动画队列fx
         * @param data 可选的函数或函数数组。如果不传入该参数，则会返回当前队列。如果该参数为函数，则会被入队；如果该参数为函数数组，则用它替换当前队列
         * @returns {*}
         */
        queue: function (type, data) {
            if (typeof type !== "string") {
                data = type;
                type = "fx";
            }

            if (data === undefined) {
                return jQuery.queue(this[0], type);//.queue([queueName]) 返回第一个匹配元素关联的函数队列
            }
            return this.each(function () {
                var queue = jQuery.queue(this, type, data);
                //对于动画队列，在动画函数入队后，如果没有动画函数正在执行，则立即出队并执行动画函数。
                if (type === "fx" && queue[0] !== "inprogress") {
                    jQuery.dequeue(this, type);
                }
            });
        },
        //函数出队，并执行匹配元素关联的函数队列中的下一个函数
        dequeue: function (type) {
            return this.each(function () {
                jQuery.dequeue(this, type);
            });
        },
        // Based off of the plugin by Clint Helfers, with permission.
        // http://blindsignals.com/index.php/2009/07/jquery-delay/
        //延迟函数出队执行
        /**
         *
         * @param time 表示延迟时间，单位毫秒。其值可以是数值，也可以是fast==>200,slow==>600
         * @param type
         * @returns {*}
         */
        delay: function (time, type) {
            time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
            type = type || "fx";
            //向关联的函数队列中插入一个新函数
            return this.queue(type, function (next, hooks) {
                var timeout = setTimeout(next, time);
                hooks.stop = function () {
                    clearTimeout(timeout);
                };
            });
        },
        //清空函数队列
        /**
         * 用于移除匹配元素关联的函数队列中的所有未被执行的函数
         * @param type
         * @returns {*}
         */
        clearQueue: function (type) {
            //传入一个空数组来替换当前函数队列
            return this.queue(type || "fx", []);
        },
        // Get a promise resolved when queues of a certain type
        // are emptied (fx is the type by default)
        /**
         * 返回一个异步队列的只读副本，观察每个匹配元素关联的某个类型的队列和计数器是否完成
         * @param type 指定了队列和计数器的类型(即名称)，默认为标准动画fx。
         * @param object 可选的对象，指向异步队列的只读方法附加的对象
         * @returns {*}
         */
        promise: function (type, object) {
            if (typeof type !== "string") {
                object = type;
                type = undefined;
            }
            type = type || "fx";

            var defer = jQuery.Deferred(),//异步队列，用于存放成功回调函数
                elements = this,//当前jquery对象，即匹配的元素集合
                i = elements.length,//当前jquery对象中DOM元素的个数
                count = 1,
                deferDataKey = type + "defer",//DOM元素关联的回调函数列表的名称
                queueDataKey = type + "queue",//DOM元素关联的队列的名称
                markDataKey = type + "mark",//DOM元素关联的计数器的名称
                tmp;//指向DOM元素关联的回调函数列表
            function resolve() {
                if (!( --count )) {
                    defer.resolveWith(elements, [elements]);
                }
            }

            //遍历匹配元素集合，查找需要观察的元素，取出或者创建DOM元素关联的回调函数列表(type+"defer")
            while (i--) {
                if (( tmp = jQuery.data(elements[i], deferDataKey, undefined, true) ||
                        ( jQuery.data(elements[i], queueDataKey, undefined, true) ||
                        jQuery.data(elements[i], markDataKey, undefined, true) ) &&
                        jQuery.data(elements[i], deferDataKey, jQuery.Callbacks("once memory"), true) )) {
                    //找到需要观察的元素，计数器+1
                    count++;
                    //将特殊回调函数添加到关联的回调函数列表中。
                    tmp.add(resolve);
                }
            }
            resolve();
            return defer.promise();
        }
    });


    var rclass = /[\n\t\r]/g,
        rspace = /\s+/,
        rreturn = /\r/g,
        rtype = /^(?:button|input)$/i,
        rfocusable = /^(?:button|input|object|select|textarea)$/i,
        rclickable = /^a(?:rea)?$/i,
        //需要修正的布尔型HTML属性
        rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
        getSetAttribute = jQuery.support.getSetAttribute,
        nodeHook, boolHook, fixSpecified;

    jQuery.fn.extend({
        attr: function (name, value) {
            return jQuery.access(this, name, value, true, jQuery.attr);
        },
        //用于从匹配元素集合中的每个元素上移除一个或多个HTML属性，多个属性之间用空格分隔
        removeAttr: function (name) {
            return this.each(function () {
                jQuery.removeAttr(this, name);
            });
        },
        /**
         * 用于获取元素集合中第一个元素的DOM属性值，或者为匹配元素集合中的每个元素设置一个或者多个DOM属性
         * @param name
         * @param value
         * @returns {*}
         */
        prop: function (name, value) {
            return jQuery.access(this, name, value, true, jQuery.prop);
        },
        //用于从匹配元素集合中的每个元素上移除一个DOM属性
        removeProp: function (name) {
            name = jQuery.propFix[name] || name;
            return this.each(function () {
                // try/catch handles cases where IE balks (such as removing a property on window)
                try {
                    this[name] = undefined;
                    delete this[name];
                } catch (e) {
                }
            });
        },
        /**
         * 用于为匹配元素集合中的每个元素添加一个或多个类样式。
         * @param value
         * @returns {*}
         */
        addClass: function (value) {
            var classNames, i, l, elem,
                setClass, c, cl;
            //如果value是函数，则遍历匹配元素集合，在每个匹配元素上执行函数，并取其返回值作为待参加的类样式。
            if (jQuery.isFunction(value)) {
                return this.each(function (j) {
                    jQuery(this).addClass(value.call(this, j, this.className));
                });
            }

            if (value && typeof value === "string") {
                classNames = value.split(rspace);

                for (i = 0, l = this.length; i < l; i++) {
                    elem = this[i];

                    if (elem.nodeType === 1) {
                        if (!elem.className && classNames.length === 1) {
                            elem.className = value;

                        } else {
                            setClass = " " + elem.className + " ";

                            for (c = 0, cl = classNames.length; c < cl; c++) {
                                if (!~setClass.indexOf(" " + classNames[c] + " ")) {
                                    setClass += classNames[c] + " ";
                                }
                            }
                            elem.className = jQuery.trim(setClass);
                        }
                    }
                }
            }

            return this;
        },

        removeClass: function (value) {
            var classNames, i, l, elem, className, c, cl;

            if (jQuery.isFunction(value)) {
                return this.each(function (j) {
                    jQuery(this).removeClass(value.call(this, j, this.className));
                });
            }

            if ((value && typeof value === "string") || value === undefined) {
                classNames = ( value || "" ).split(rspace);

                for (i = 0, l = this.length; i < l; i++) {
                    elem = this[i];

                    if (elem.nodeType === 1 && elem.className) {
                        if (value) {
                            className = (" " + elem.className + " ").replace(rclass, " ");
                            for (c = 0, cl = classNames.length; c < cl; c++) {
                                className = className.replace(" " + classNames[c] + " ", " ");
                            }
                            elem.className = jQuery.trim(className);

                        } else {
                            elem.className = "";
                        }
                    }
                }
            }

            return this;
        },

        toggleClass: function (value, stateVal) {
            var type = typeof value,
                isBool = typeof stateVal === "boolean";

            if (jQuery.isFunction(value)) {
                return this.each(function (i) {
                    jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
                });
            }

            return this.each(function () {
                if (type === "string") {
                    // toggle individual class names
                    var className,
                        i = 0,
                        self = jQuery(this),
                        state = stateVal,
                        classNames = value.split(rspace);

                    while ((className = classNames[i++])) {
                        // check each className given, space seperated list
                        state = isBool ? state : !self.hasClass(className);
                        self[state ? "addClass" : "removeClass"](className);
                    }

                } else if (type === "undefined" || type === "boolean") {
                    if (this.className) {
                        // store className if set
                        jQuery._data(this, "__className__", this.className);
                    }

                    // toggle whole className
                    //如果当前元素指定了类样式，或者第一个参数是false,则移除所有类样式，否则恢复所有类样式
                    this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") || "";
                }
            });
        },

        hasClass: function (selector) {
            var className = " " + selector + " ",
                i = 0,
                l = this.length;
            for (; i < l; i++) {
                if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) > -1) {
                    return true;
                }
            }

            return false;
        },

        val: function (value) {
            var hooks, ret, isFunction,
                elem = this[0];
            //未传参数的情况，获取第一个匹配元素的当前值
            if (!arguments.length) {
                if (elem) {
                    hooks = jQuery.valHooks[elem.nodeName.toLowerCase()] || jQuery.valHooks[elem.type];

                    if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
                        return ret;
                    }

                    ret = elem.value;

                    return typeof ret === "string" ?
                        // handle most common string cases
                        ret.replace(rreturn, "") :
                        // handle cases where value is null/undef or number
                        ret == null ? "" : ret;
                }

                return;
            }

            isFunction = jQuery.isFunction(value);

            return this.each(function (i) {
                var self = jQuery(this), val;

                if (this.nodeType !== 1) {
                    return;
                }

                if (isFunction) {
                    val = value.call(this, i, self.val());
                } else {
                    val = value;
                }

                // Treat null/undefined as ""; convert numbers to string
                if (val == null) {
                    val = "";
                } else if (typeof val === "number") {
                    val += "";
                } else if (jQuery.isArray(val)) {
                    val = jQuery.map(val, function (value) {
                        return value == null ? "" : value + "";
                    });
                }

                hooks = jQuery.valHooks[this.nodeName.toLowerCase()] || jQuery.valHooks[this.type];

                // If set returns undefined, fall back to normal setting
                if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
                    this.value = val;
                }
            });
        }
    });

    jQuery.extend({
        //值修正对象集 jQuery.valHooks存放了需要修正或扩展的节点名称或节点类型和对应的修正对象
        valHooks: {
            option: {
                get: function (elem) {
                    // attributes.value is undefined in Blackberry 4.7 but
                    // uses .value. See #6932
                    var val = elem.attributes.value;
                    return !val || val.specified ? elem.value : elem.text;
                }
            },
            select: {
                get: function (elem) {
                    var value, i, max, option,
                        index = elem.selectedIndex,
                        values = [],
                        options = elem.options,
                        one = elem.type === "select-one";

                    // Nothing was selected
                    if (index < 0) {
                        return null;
                    }

                    // Loop through all the selected options
                    i = one ? index : 0;
                    max = one ? index + 1 : options.length;
                    for (; i < max; i++) {
                        option = options[i];

                        // Don't return options that are disabled or in a disabled optgroup
                        if (option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
                            (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {

                            // Get the specific value for the option
                            value = jQuery(option).val();

                            // We don't need an array for one selects
                            if (one) {
                                return value;
                            }

                            // Multi-Selects return an array
                            values.push(value);
                        }
                    }

                    // Fixes Bug #2551 -- select.val() broken in IE after form.reset()
                    if (one && !values.length && options.length) {
                        return jQuery(options[index]).val();
                    }

                    return values;
                },

                set: function (elem, value) {
                    var values = jQuery.makeArray(value);

                    jQuery(elem).find("option").each(function () {
                        this.selected = jQuery.inArray(jQuery(this).val(), values) >= 0;
                    });

                    if (!values.length) {
                        elem.selectedIndex = -1;
                    }
                    return values;
                }
            }
        },
        //存放了特殊的jQuery方法名和便捷事件方法名
        attrFn: {
            val: true,
            css: true,
            html: true,
            text: true,
            data: true,
            width: true,
            height: true,
            offset: true
        },
        /**
         * 用于获取DOM元素的HTML属性值，或为DOM元素设置一个HTML属性值
         * 为方法.attr(name,value)提供了基础功能
         * @param elem
         * @param name
         * @param value
         * @param pass 布尔值，指示如果HTML属性与jquery方法重名的话，是否调用同名的jQuery方法。true调用，false不调用；
         * @returns {*}
         */
        attr: function (elem, name, value, pass) {
            var ret, hooks, notxml,
                nType = elem.nodeType;

            // don't get/set attributes on text, comment and attribute nodes
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
                return;
            }
            //调用同名的jQuery方法；
            if (pass && name in jQuery.attrFn) {
                return jQuery(elem)[name](value);
            }

            // Fallback to prop when attributes are not supported
            if (typeof elem.getAttribute === "undefined") {
                return jQuery.prop(elem, name, value);
            }

            notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

            // All attributes are lowercase
            // Grab(抓取) necessary hook if one is defined
            if (notxml) {
                name = name.toLowerCase();
                hooks = jQuery.attrHooks[name] || ( rboolean.test(name) ? boolHook : nodeHook );
            }

            if (value !== undefined) {

                if (value === null) {
                    jQuery.removeAttr(elem, name);
                    return;
                    //优先调用对应的修正对象的修正方法set(),如果存在对应的修正对象，并且修正对象有修正方法set()，则调用该方法
                } else if (hooks && "set" in hooks && notxml && (ret = hooks.set(elem, value, name)) !== undefined) {
                    return ret;

                } else {
                    elem.setAttribute(name, "" + value);
                    return value;
                }
                //如果未传入参数value，则读取HTML属性
            } else if (hooks && "get" in hooks && notxml && (ret = hooks.get(elem, name)) !== null) {
                return ret;

            } else {

                ret = elem.getAttribute(name);

                // Non-existent attributes return null, we normalize to undefined
                return ret === null ?
                    undefined :
                    ret;
            }
        },
        /**
         *
         * @param elem DOM元素
         * @param value html属性
         */
        removeAttr: function (elem, value) {
            var propName, attrNames, name, l,
                i = 0;

            if (value && elem.nodeType === 1) {
                attrNames = value.toLowerCase().split(rspace);
                l = attrNames.length;

                for (; i < l; i++) {
                    name = attrNames[i];

                    if (name) {
                        propName = jQuery.propFix[name] || name;

                        // See #9699 for explanation of this approach (setting first, then removal)
                        jQuery.attr(elem, name, "");
                        elem.removeAttribute(getSetAttribute ? name : propName);

                        // Set corresponding property to false for boolean attributes
                        if (rboolean.test(name) && propName in elem) {
                            elem[propName] = false;
                        }
                    }
                }
            }
        },
        //特殊HTML属性修正对象集jQuery.attrHooks
        attrHooks: {
            type: {
                set: function (elem, value) {
                    // We can't allow the type property to be changed (since it causes problems in IE)
                    if (rtype.test(elem.nodeName) && elem.parentNode) {
                        jQuery.error("type property can't be changed");
                    } else if (!jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
                        // Setting the type on a radio button after the value resets the value in IE6-9
                        // Reset value to it's default in case type is set after value
                        // This is for element creation
                        var val = elem.value;
                        elem.setAttribute("type", value);//设置属性type的值
                        if (val) {
                            elem.value = val;//恢复属性value为备份值
                        }
                        return value;
                    }
                }
            },
            // Use the value property for back compat
            // Use the nodeHook for button elements in IE6/7 (#1954)
            value: {
                get: function (elem, name) {
                    if (nodeHook && jQuery.nodeName(elem, "button")) {
                        return nodeHook.get(elem, name);
                    }
                    return name in elem ?
                        elem.value :
                        null;
                },
                set: function (elem, value, name) {
                    if (nodeHook && jQuery.nodeName(elem, "button")) {
                        return nodeHook.set(elem, value, name);
                    }
                    // Does not return so that setAttribute is also used
                    elem.value = value;
                }
            }
        },

        propFix: {
            tabindex: "tabIndex",
            readonly: "readOnly",
            "for": "htmlFor",
            "class": "className",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            cellpadding: "cellPadding",
            rowspan: "rowSpan",
            colspan: "colSpan",
            usemap: "useMap",
            frameborder: "frameBorder",
            contenteditable: "contentEditable"
        },

        prop: function (elem, name, value) {
            var ret, hooks, notxml,
                nType = elem.nodeType;

            // don't get/set properties on text, comment and attribute nodes
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
                return;
            }

            notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

            if (notxml) {
                // Fix name and attach hooks
                name = jQuery.propFix[name] || name;
                hooks = jQuery.propHooks[name];
            }
            //传入参数的情况下
            if (value !== undefined) {
                if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
                    return ret;

                } else {
                    return ( elem[name] = value );
                }

            } else {
                if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
                    return ret;

                } else {
                    return elem[name];
                }
            }
        },

        propHooks: {
            tabIndex: {
                get: function (elem) {
                    // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly(明确的) set
                    // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                    var attributeNode = elem.getAttributeNode("tabindex");

                    return attributeNode && attributeNode.specified ?
                        parseInt(attributeNode.value, 10) :
                        rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ?
                            0 :
                            undefined;
                }
            }
        }
    });

// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
    jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;

// Hook for boolean attributes
    boolHook = {
        get: function (elem, name) {
            // Align boolean attributes with corresponding properties
            // Fall back to attribute presence where some booleans are not supported
            var attrNode,
                property = jQuery.prop(elem, name);
            //当property为true或者HTML属性值不是false，将name小写输出；否则输出undefined；
            return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
                name.toLowerCase() :
                undefined;
        },
        set: function (elem, value, name) {
            var propName;
            if (value === false) {
                // Remove boolean attributes when set to false
                jQuery.removeAttr(elem, name);
            } else {
                // value is true since we know at this point it's type boolean and not false
                // Set boolean attributes to the same name and set the DOM property
                //取出HTML属性名对应的DOM属性名
                propName = jQuery.propFix[name] || name;
                if (propName in elem) {
                    // Only set the IDL specifically if it already exists on the element
                    elem[propName] = true;
                }

                elem.setAttribute(name, name.toLowerCase());
            }
            return name;
        }
    };

// IE6/7 do not support getting/setting some attributes with get/setAttribute
    if (!getSetAttribute) {

        fixSpecified = {
            name: true,
            id: true
        };

        // Use this for any attribute in IE6/7
        // This fixes almost every IE6/7 issue
        nodeHook = jQuery.valHooks.button = {
            get: function (elem, name) {
                var ret;
                ret = elem.getAttributeNode(name);
                //ret.nodeValue 表示读取到的HTML属性
                //如果属性时空字符串，则返回undefined，否则正常返回
                return ret && ( fixSpecified[name] ? ret.nodeValue !== "" : ret.specified ) ?
                    ret.nodeValue :
                    undefined;
            },
            set: function (elem, value, name) {
                // Set the existing or create a new attribute node
                var ret = elem.getAttributeNode(name);
                if (!ret) {
                    ret = document.createAttribute(name);
                    elem.setAttributeNode(ret);
                }
                return ( ret.nodeValue = value + "" );
            }
        };

        // Apply the nodeHook to tabindex
        jQuery.attrHooks.tabindex.set = nodeHook.set;

        // Set width and height to auto instead of 0 on empty string( Bug #8150 )
        // This is for removals
        jQuery.each(["width", "height"], function (i, name) {
            jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
                set: function (elem, value) {
                    if (value === "") {
                        elem.setAttribute(name, "auto");
                        return value;
                    }
                }
            });
        });

        // Set contenteditable to false on removals(#10429)
        // Setting to empty string throws an error as an invalid value
        jQuery.attrHooks.contenteditable = {
            get: nodeHook.get,
            set: function (elem, value, name) {
                if (value === "") {
                    value = "false";
                }
                nodeHook.set(elem, value, name);
            }
        };
    }


// Some attributes require a special call on IE
    if (!jQuery.support.hrefNormalized) {
        jQuery.each(["href", "src", "width", "height"], function (i, name) {
            jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
                get: function (elem) {
                    var ret = elem.getAttribute(name, 2);//设置getAttribute()的第二个参数值为2，期望该方法严格按照文档中设置的属性值返回。
                    return ret === null ? undefined : ret;
                }
            });
        });
    }

    if (!jQuery.support.style) {
        jQuery.attrHooks.style = {
            get: function (elem) {
                // Return undefined in the case of empty string
                // Normalize to lowercase since IE uppercases css property names
                //返回内联样式
                return elem.style.cssText.toLowerCase() || undefined;
            },
            set: function (elem, value) {
                return ( elem.style.cssText = "" + value );
            }
        };
    }

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
    if (!jQuery.support.optSelected) {
        jQuery.propHooks.selected = jQuery.extend(jQuery.propHooks.selected, {
            //设置get获得的值来修正该属性
            get: function (elem) {
                var parent = elem.parentNode;

                if (parent) {
                    parent.selectedIndex;

                    // Make sure that it also works with optgroups, see #5701
                    if (parent.parentNode) {
                        parent.parentNode.selectedIndex;
                    }
                }
                return null;
            }
        });
    }

// IE6/7 call enctype encoding
    if (!jQuery.support.enctype) {
        jQuery.propFix.enctype = "encoding";
    }

// Radios and checkboxes getter/setter
    if (!jQuery.support.checkOn) {
        jQuery.each(["radio", "checkbox"], function () {
            jQuery.valHooks[this] = {
                get: function (elem) {
                    // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                    return elem.getAttribute("value") === null ? "on" : elem.value;
                }
            };
        });
    }
    jQuery.each(["radio", "checkbox"], function () {
        jQuery.valHooks[this] = jQuery.extend(jQuery.valHooks[this], {
            set: function (elem, value) {
                if (jQuery.isArray(value)) {
                    return ( elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0 );
                }
            }
        });
    });


    var rformElems = /^(?:textarea|input|select)$/i,
        rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
        rhoverHack = /\bhover(\.\S+)?\b/,
        rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|contextmenu)|click/,
        rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
        rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
        quickParse = function (selector) {
            var quick = rquickIs.exec(selector);
            if (quick) {
                //   0  1    2   3
                // [ _, tag, id, class ]
                quick[1] = ( quick[1] || "" ).toLowerCase();
                quick[3] = quick[3] && new RegExp("(?:^|\\s)" + quick[3] + "(?:\\s|$)");
            }
            return quick;
        },
        quickIs = function (elem, m) {
            var attrs = elem.attributes || {};
            return (
                (!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
                (!m[2] || (attrs.id || {}).value === m[2]) &&
                (!m[3] || m[3].test((attrs["class"] || {}).value))
            );
        },
        hoverHack = function (events) {
            return jQuery.event.special.hover ? events : events.replace(rhoverHack, "mouseenter$1 mouseleave$1");
        };

    /*
     * Helper functions for managing events -- not part of the public interface.
     * Props to Dean Edwards' addEvent library for many of the ideas.
     */
    jQuery.event = {
        //绑定一个或多个类型的事件监听函数，为所有的jquery事件绑定方法提供底层支持
        /**
         *
         * @param elem  待绑定事件的DOM元素
         * @param types  事件类型字符串，多个事件类型之间要用空格隔开
         * @param handler  待绑定的事件监听函数
         * @param data  自定义数据，可以是任意类型
         * @param selector 一个选择器表达式
         */
        add: function (elem, types, handler, data, selector) {

            var elemData, eventHandle, events,
                t, tns, type, namespaces, handleObj,//封装了事件函数的监听对象
                handleObjIn,//传入的监听对象
                quick, handlers, special;

            // Don't attach events to noData or text/comment nodes (allow plain objects tho)
            if (elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data(elem))) {
                return;
            }

            // Caller can pass in an object of custom data in lieu of the handler
            if (handler.handler) {
                handleObjIn = handler;
                handler = handleObjIn.handler;
            }

            // Make sure that the handler has a unique ID, used to find/remove it later
            if (!handler.guid) {
                handler.guid = jQuery.guid++;
            }

            // Init the element's event structure and main handler, if this is the first
            events = elemData.events;
            if (!events) {
                elemData.events = events = {};
            }
            eventHandle = elemData.handle;
            if (!eventHandle) {
                elemData.handle = eventHandle = function (e) {
                    // Discard the second event of a jQuery.event.trigger() and
                    // when an event is called after a page has unloaded
                    return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
                        jQuery.event.dispatch.apply(eventHandle.elem, arguments) :
                        undefined;
                };
                // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
                eventHandle.elem = elem;
            }

            // Handle multiple events separated by a space
            // jQuery(...).bind("mouseover mouseout", fn);
            types = jQuery.trim(hoverHack(types)).split(" ");
            //遍历事件类型数组，逐个绑定事件
            for (t = 0; t < types.length; t++) {

                tns = rtypenamespace.exec(types[t]) || [];
                type = tns[1];
                namespaces = ( tns[2] || "" ).split(".").sort();

                // If event changes its type, use the special event handlers for the changed type
                //修正事件类型、获取对应的修正对象
                special = jQuery.event.special[type] || {};

                // If selector defined, determine special event api type, otherwise given type
                type = ( selector ? special.delegateType : special.bindType ) || type;

                // Update special based on newly reset type
                special = jQuery.event.special[type] || {};

                // handleObj is passed to all event handlers
                handleObj = jQuery.extend({
                    type: type,//实际使用的事件类型
                    origType: tns[1],//原始事件类型
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    quick: quickParse(selector),
                    namespace: namespaces.join(".")
                }, handleObjIn);

                // Init the event handler queue if we're the first
                handlers = events[type];
                if (!handlers) {
                    handlers = events[type] = [];
                    handlers.delegateCount = 0;

                    // Only use addEventListener/attachEvent if the special events handler returns false
                    if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                        // Bind the global event handler to the element
                        if (elem.addEventListener) {
                            elem.addEventListener(type, eventHandle, false);

                        } else if (elem.attachEvent) {
                            elem.attachEvent("on" + type, eventHandle);
                        }
                    }
                }
                //将监听对象插入监听对象数组
                if (special.add) {
                    special.add.call(elem, handleObj);

                    if (!handleObj.handler.guid) {
                        handleObj.handler.guid = handler.guid;
                    }
                }

                // Add to the element's handler list, delegates in front
                if (selector) {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                } else {
                    handlers.push(handleObj);
                }

                // Keep track of which events have ever been used, for event optimization
                jQuery.event.global[type] = true;
            }

            // Nullify elem to prevent memory leaks in IE
            elem = null;
        },

        global: {},

        // Detach an event or set of events from an element
        /**
         * 用于移除DOM元素上绑定的一个或多个类型的事件监听函数。该方法为所有的jquery事件移除方法提供了底层支持
         * @param elem 待移除事件的DOM元素
         * @param types 事件类型字符串
         * @param handler 待移除的事件监听函数
         * @param selector 一个选择器表达式字符串
         * @param mappedTypes 布尔值，指示移除事件时是否严格检测事件的类型
         */
        remove: function (elem, types, handler, selector, mappedTypes) {

            var elemData = jQuery.hasData(elem) && jQuery._data(elem),
                t, tns, type, origType, namespaces, origCount,
                j, events, special, handle, eventType, handleObj;
            //过滤没有缓存对象或者事件缓存对象的情况
            if (!elemData || !(events = elemData.events)) {
                return;
            }

            // Once for each type.namespace in types; type may be omitted
            types = jQuery.trim(hoverHack(types || "")).split(" ");
            for (t = 0; t < types.length; t++) {
                //解析事件类型和命名空间
                tns = rtypenamespace.exec(types[t]) || [];
                type = origType = tns[1];
                namespaces = tns[2];

                // Unbind all events (on this namespace, if provided) for the element
                if (!type) {
                    for (type in events) {
                        jQuery.event.remove(elem, type + types[t], handler, selector, true);//true表示在递归移除事件时不需要检测事件的原始类型
                    }
                    continue;
                }
                //修正事件类型，获取对应的监听对象数组
                special = jQuery.event.special[type] || {};
                //判断是代理事件还是普通事件
                type = ( selector ? special.delegateType : special.bindType ) || type;
                eventType = events[type] || [];
                origCount = eventType.length;
                namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

                // Remove matching events
                //遍历监听对象数组，移除匹配的监听对象
                for (j = 0; j < eventType.length; j++) {
                    handleObj = eventType[j];

                    if (( mappedTypes || origType === handleObj.origType ) &&
                        ( !handler || handler.guid === handleObj.guid ) &&
                        ( !namespaces || namespaces.test(handleObj.namespace) ) &&
                        ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector )) {
                        eventType.splice(j--, 1);

                        if (handleObj.selector) {
                            eventType.delegateCount--;
                        }
                        if (special.remove) {
                            special.remove.call(elem, handleObj);
                        }
                    }
                }

                // Remove generic event handler if we removed something and no more handlers exist
                // (avoids potential for endless recursion during removal of special event handlers)
                //如果监听对象数组为空，则移除主监听函数
                if (eventType.length === 0 && origCount !== eventType.length) {
                    if (!special.teardown || special.teardown.call(elem, namespaces) === false) {
                        jQuery.removeEvent(elem, type, elemData.handle);
                    }

                    delete events[type];
                }
            }

            // Remove the expando if it's no longer used
            //如果事件缓存对象为空对象，则从缓存对象上删除属性events,handle
            if (jQuery.isEmptyObject(events)) {
                handle = elemData.handle;
                if (handle) {
                    handle.elem = null;
                }

                // removeData also checks for emptiness and clears the expando if empty
                // so use it instead of delete
                jQuery.removeData(elem, ["events", "handle"], true);
            }
        },

        // Events that are safe to short-circuit if no handlers are attached.
        // Native DOM events should not be added, they may have inline handlers.
        customEvent: {
            "getData": true,
            "setData": true,
            "changeData": true
        },
        /**
         * 负责手动触发事件，执行绑定的事件监听函数和默认行为，并且会模拟冒泡过程
         * @param event 待触发的事件，可以是事件类型，自定义事件对象或者jquery事件对象
         * @param data  将被传给主监听函数的数据
         * @param elem DOM元素，将在该元素上手动触发事件和默认行为
         * @param onlyHandlers 布尔值，指示是否只执行监听函数，而不会触发默认行为
         * @returns {*}
         */
        trigger: function (event, data, elem, onlyHandlers) {
            // Don't do events on text and comment nodes
            if (elem && (elem.nodeType === 3 || elem.nodeType === 8)) {
                return;
            }

            // Event object or event type
            var type = event.type || event,
                namespaces = [],
                cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;

            // focus/blur morphs to focusin/out; ensure we're not firing them right now
            //过滤focus/blur事件的默认行为所触发的focusin/focusout事件
            //IE的表现和其他浏览器不一致，所以这里过滤掉，最后统一模拟
            if (rfocusMorph.test(type + jQuery.event.triggered)) {
                return;
            }
            //检查是否只触发没有命名空间的监听函数
            if (type.indexOf("!") >= 0) {
                // Exclusive(独有的) events trigger only for the exact event (no namespaces)
                type = type.slice(0, -1);
                exclusive = true;//表示是否只触发没有命名空间的事件
            }
            //解析事件类型和命名空间
            if (type.indexOf(".") >= 0) {
                // Namespaced trigger; create a regexp to match event type in handle()
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }
            //不会触发任何事件的情况     下面表明从未绑定过此事件
            if ((!elem || jQuery.event.customEvent[type]) && !jQuery.event.global[type]) {
                // No jQuery handlers for this event type, and it can't have inline handlers
                return;
            }
            //创建jquery事件对象，并修正属性
            // Caller can pass in an Event, Object, or just an event type string
            event = typeof event === "object" ?
                // jQuery.Event object
                event[jQuery.expando] ? event :
                    // Object literal
                    new jQuery.Event(type, event) :
                // Just the event type (string)
                new jQuery.Event(type);

            event.type = type;
            event.isTrigger = true;
            event.exclusive = exclusive;
            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
            ontype = type.indexOf(":") < 0 ? "on" + type : "";
            //全局触发事件
            // Handle a global trigger
            if (!elem) {

                // TODO: Stop taunting the data cache; remove global events and always attach to document
                cache = jQuery.cache;
                for (i in cache) {
                    //为每个绑定过该类型事件的元素迭代调用方法来手动触发事件
                    if (cache[i].events && cache[i].events[type]) {
                        jQuery.event.trigger(event, data, cache[i].handle.elem, true);
                    }
                }
                return;
            }
            //继续修正事件属性和参数
            // Clean up the event in case it is being reused
            event.result = undefined;
            if (!event.target) {
                event.target = elem;
            }

            // Clone any incoming data and prepend the event, creating the handler arg list
            data = data != null ? jQuery.makeArray(data) : [];
            data.unshift(event);

            // Allow special events to draw outside the lines
            special = jQuery.event.special[type] || {};
            if (special.trigger && special.trigger.apply(elem, data) === false) {
                return;
            }
            //构造冒泡路径
            // Determine event propagation path in advance, per W3C events spec (#9951)
            // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
            eventPath = [[elem, special.bindType || type]];//[当前元素，事件类型]
            if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {

                bubbleType = special.delegateType || type;//优先使用修正对象的属性delegateType.delegateType.该属性指定了当前事件类型所对应的冒泡事件类型，例如之前的focus
                cur = rfocusMorph.test(bubbleType + type) ? elem : elem.parentNode;
                old = null;
                for (; cur; cur = cur.parentNode) {
                    eventPath.push([cur, bubbleType]);//[当前元素/父元素/祖先元素,支持冒泡的事件类型]
                    old = cur;
                }

                // Only add window if we got to document (e.g., not plain obj or detached DOM)
                if (old && old === elem.ownerDocument) {
                    eventPath.push([old.defaultView || old.parentWindow || window, bubbleType]);
                }
            }
            //触发冒泡路径上元素的主监听函数和行内监听函数
            // Fire handlers on the event path
            for (i = 0; i < eventPath.length && !event.isPropagationStopped(); i++) {

                cur = eventPath[i][0];
                event.type = eventPath[i][1];

                handle = ( jQuery._data(cur, "events") || {} )[event.type] && jQuery._data(cur, "handle");
                if (handle) {
                    handle.apply(cur, data);
                }
                // Note that this is a bare JS function and not a jQuery handler
                handle = ontype && cur[ontype];
                if (handle && jQuery.acceptData(cur) && handle.apply(cur, data) === false) {
                    event.preventDefault();
                }
            }
            event.type = type;
            //触发默认行为
            // If nobody prevented the default action, do it now
            if (!onlyHandlers && !event.isDefaultPrevented()) {

                if ((!special._default || special._default.apply(elem.ownerDocument, data) === false) && !(type === "click" && jQuery.nodeName(elem, "a")) && jQuery.acceptData(elem)) {

                    // Call a native DOM method on the target with the same name name as the event.
                    // Can't use an .isFunction() check here because IE6/7 fails that test.
                    // Don't do default actions on window, that's where global variables be (#6170)
                    // IE<9 dies on focus/blur to hidden element (#1486)
                    if (ontype && elem[type] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow(elem)) {

                        // Don't re-trigger an onFOO event when we call its FOO() method
                        old = elem[ontype];

                        if (old) {
                            elem[ontype] = null;
                        }

                        // Prevent re-triggering of the same event, since we already bubbled it above
                        jQuery.event.triggered = type;
                        elem[type]();
                        jQuery.event.triggered = undefined;

                        if (old) {
                            elem[ontype] = old;
                        }
                    }
                }
            }

            return event.result;
        },
        //分发事件，执行事件监听函数,为执行监听函数提供了底层支持
        dispatch: function (event) {

            // Make a writable jQuery.Event from the native event object
            event = jQuery.event.fix(event || window.event);

            var handlers = ( (jQuery._data(this, "events") || {} )[event.type] || []),//指向当前事件类型对应的监听对象数组
                delegateCount = handlers.delegateCount,//代理监听对象的位置计数器
                args = [].slice.call(arguments, 0),//吧参数对象arguments转换为真正的数组
                run_all = !event.exclusive && !event.namespace,//指示是否执行当前事件类型的所有监听函数
                handlerQueue = [],
                i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;

            // Use the fix-ed jQuery.Event rather than the (read-only) native event
            args[0] = event;
            event.delegateTarget = this;

            // Determine handlers that should run if there are delegated events
            // Avoid disabled elements in IE (#6911) and non-left-click bubbling in Firefox (#3861)
            if (delegateCount && !event.target.disabled && !(event.button && event.type === "click")) {

                // Pregenerate a single jQuery object for reuse with .is()
                jqcur = jQuery(this);
                jqcur.context = this.ownerDocument || this;
// /               使用两层for循环提取后代元素匹配的代理监听对象数组
                //第一个for循环遍历从触发事件的元素到代理元素这条路径上的所有后代元素
                for (cur = event.target; cur != this; cur = cur.parentNode || this) {
                    selMatch = {};//用于存储后代元素与代理监听对象的选择器表达式的所有匹配结果
                    matches = [];//用于存储后代元素匹配的所有代理监听对象
                    jqcur[0] = cur;
                    //第二个for循环为每个后代元素遍历代理元素的代理监听对象数组，吧后代元素匹配的代理监听对象存储到数组中
                    for (i = 0; i < delegateCount; i++) {
                        handleObj = handlers[i];
                        sel = handleObj.selector;

                        if (selMatch[sel] === undefined) {
                            selMatch[sel] = (
                                handleObj.quick ? quickIs(cur, handleObj.quick) : jqcur.is(sel)
                            );
                        }
                        if (selMatch[sel]) {
                            matches.push(handleObj);
                        }
                    }
                    if (matches.length) {
                        handlerQueue.push({elem: cur, matches: matches});
                    }
                }
            }

            // Add the remaining (directly-bound) handlers
            if (handlers.length > delegateCount) {
                handlerQueue.push({elem: this, matches: handlers.slice(delegateCount)});
            }

            // Run delegates first; they may want to stop propagation beneath us
            //执行后代元素匹配的代理监听对象数组和代理元素上绑定的普通监听对象数组
            for (i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++) {
                matched = handlerQueue[i];
                event.currentTarget = matched.elem;

                for (j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++) {
                    handleObj = matched.matches[j];

                    // Triggered event must either 1) be non-exclusive and have no namespace, or
                    // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
                    if (run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test(handleObj.namespace)) {

                        event.data = handleObj.data;
                        event.handleObj = handleObj;

                        ret = ( (jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler )
                            .apply(matched.elem, args);

                        if (ret !== undefined) {
                            event.result = ret;
                            if (ret === false) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    }
                }
            }

            return event.result;
        },
        //事件对象的公共属性
        // Includes some event props shared by KeyEvent and MouseEvent
        // *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
        props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        //事件属性修正对象集
        fixHooks: {},
        //键盘事件对象的属性和修正方法
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function (event, original) {

                // Add which for key events
                if (event.which == null) {
                    event.which = original.charCode != null ? original.charCode : original.keyCode;
                }

                return event;
            }
        },
        //鼠标事件对象的属性和修正方法
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function (event, original) {
                var eventDoc, doc, body,
                    button = original.button,
                    fromElement = original.fromElement;

                // Calculate pageX/Y if missing and clientX/Y available
                if (event.pageX == null && original.clientX != null) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;
                    //pageX=clientX+水平滚动偏移-文档左边框厚度
                    event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                    event.pageY = original.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && body.clientTop || 0 );
                }

                // Add relatedTarget, if necessary
                if (!event.relatedTarget && fromElement) {
                    event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
                }

                // Add which for click: 1 === left; 2 === middle; 3 === right
                // Note: button is not normalized, so don't use it
                if (!event.which && button !== undefined) {
                    event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
                }

                return event;
            }
        },
        //把原生事件对象封装为jQuery事件对象，并修正不兼容属性
        fix: function (event) {
            if (event[jQuery.expando]) {
                return event;
            }

            // Create a writable copy of the event object and normalize some properties
            var i, prop,
                originalEvent = event,
                //尝试从事件属性修正对象集jQuery.event.fixHooks中获取对应的修正对象
                fixHook = jQuery.event.fixHooks[event.type] || {},
                copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;

            event = jQuery.Event(originalEvent);
            //将合并后的事件属性从原生事件对象复制到jQuery事件对象上
            for (i = copy.length; i;) {
                prop = copy[--i];
                event[prop] = originalEvent[prop];
            }

            // Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
            if (!event.target) {
                event.target = originalEvent.srcElement || document;
            }

            // Target should not be a text node (#504, Safari)
            if (event.target.nodeType === 3) {
                event.target = event.target.parentNode;
            }

            // For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8)
            if (event.metaKey === undefined) {
                event.metaKey = event.ctrlKey;
            }
            //修正键盘事件或鼠标事件的专属属性
            return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
        },
        //用于修正事件的绑定、代理、触发和移除行为。该对象集中存放了事件类型和修正对象的映射
        special: {
            ready: {
                // Make sure the ready event is setup
                setup: jQuery.bindReady
            },

            load: {
                // Prevent triggered image.load events from bubbling to window.load
                noBubble: true
            },

            focus: {
                delegateType: "focusin"
            },
            blur: {
                delegateType: "focusout"
            },

            beforeunload: {
                setup: function (data, namespaces, eventHandle) {
                    // We only want to do this special case on windows
                    if (jQuery.isWindow(this)) {
                        this.onbeforeunload = eventHandle;
                    }
                },

                teardown: function (namespaces, eventHandle) {
                    if (this.onbeforeunload === eventHandle) {
                        this.onbeforeunload = null;
                    }
                }
            }
        },
        //模拟事件
        /**
         * 借助一个原生事件对象或jQuery事件对象，来为不支持冒泡的事件模拟冒泡过程
         * @param type 要模拟的事件类型
         * @param elem 待模拟事件的元素
         * @param event 指向一个原生事件对象或一个以分发的jQuery事件对象
         * @param bubble 布尔值，指示是否模拟冒泡过程
         */
        simulate: function (type, elem, event, bubble) {
            // Piggyback on a donor event to simulate a different one.
            // Fake originalEvent to avoid donor's stopPropagation, but if the
            // simulated event prevents default then we do the same on the donor.
            var e = jQuery.extend(
                new jQuery.Event(),
                event,
                {
                    type: type,
                    isSimulated: true,//表示当前事件是一次模拟事件
                    originalEvent: {}
                }
            );
            if (bubble) {
                jQuery.event.trigger(e, null, elem);
            } else {
                jQuery.event.dispatch.call(elem, e);
            }
            if (e.isDefaultPrevented()) {
                event.preventDefault();
            }
        }
    };

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
    jQuery.event.handle = jQuery.event.dispatch;
    //移除主监听函数
    jQuery.removeEvent = document.removeEventListener ?
        function (elem, type, handle) {
            if (elem.removeEventListener) {
                elem.removeEventListener(type, handle, false);
            }
        } :
        function (elem, type, handle) {
            if (elem.detachEvent) {
                elem.detachEvent("on" + type, handle);
            }
        };
    //jQuery事件对象
    /**
     *
     * @param src 可以是原生事件类型，自定义事件类型，原生事件对象或jQuery事件对象
     * @param props 可选的JavaScript对象，其中的属性将被设置到新创建的jquery事件对象上
     * @returns {jQuery.Event}
     * @constructor
     */
    jQuery.Event = function (src, props) {
        // Allow instantiation without the 'new' keyword
        if (!(this instanceof jQuery.Event)) {
            return new jQuery.Event(src, props);
        }

        // Event object  通过检测是否含有特征属性type来判断
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;

            // Events bubbling up the document may have been marked as prevented
            // by a handler lower down the tree; reflect the correct value.
            this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
            src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

            // Event type
        } else {
            this.type = src;
        }

        // Put explicitly provided properties onto the event object
        if (props) {
            jQuery.extend(this, props);
        }

        // Create a timestamp if incoming event doesn't have one
        this.timeStamp = src && src.timeStamp || jQuery.now();

        // Mark it as fixed
        this[jQuery.expando] = true;
    };

    function returnFalse() {
        return false;
    }

    function returnTrue() {
        return true;
    }

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    jQuery.Event.prototype = {
        preventDefault: function () {
            this.isDefaultPrevented = returnTrue;

            var e = this.originalEvent;
            //说明当前对象是一个自定义事件对象，浏览器不会有默认行为，可以直接返回
            if (!e) {
                return;
            }

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();

                // otherwise set the returnValue property of the original event to false (IE)
            } else {
                e.returnValue = false;
            }
        },
        stopPropagation: function () {
            this.isPropagationStopped = returnTrue;

            var e = this.originalEvent;
            if (!e) {
                return;
            }
            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to true (IE)
            e.cancelBubble = true;
        },
        stopImmediatePropagation: function () {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        },
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse
    };

// Create mouseenter/leave events using mouseover/out and event-time checks
    //初始化事件mouseenter,mouseleave,submit,change,focus,blur对应的修正对象
    jQuery.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function (orig, fix) {
        jQuery.event.special[orig] = {
            delegateType: fix,
            bindType: fix,

            handle: function (event) {
                var target = this,
                    related = event.relatedTarget,
                    handleObj = event.handleObj,
                    selector = handleObj.selector,
                    ret;

                // For mousenter/leave call the handler if related is outside the target.
                // NB: No relatedTarget if the mouse left/entered the browser window
                if (!related || (related !== target && !jQuery.contains(target, related))) {
                    event.type = handleObj.origType;
                    ret = handleObj.handler.apply(this, arguments);
                    event.type = fix;
                }
                return ret;
            }
        };
    });

// IE submit delegation
    if (!jQuery.support.submitBubbles) {

        jQuery.event.special.submit = {
            setup: function () {
                // Only need this for delegated form submit events
                if (jQuery.nodeName(this, "form")) {
                    return false;
                }

                // Lazy-add a submit handler when a descendant form may potentially be submitted
                jQuery.event.add(this, "click._submit keypress._submit", function (e) {
                    // Node name check avoids a VML-related crash in IE (#9807)
                    var elem = e.target,
                        form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : undefined;
                    if (form && !form._submit_attached) {
                        jQuery.event.add(form, "submit._submit", function (event) {
                            // If form was submitted by the user, bubble the event up the tree
                            if (this.parentNode && !event.isTrigger) {
                                jQuery.event.simulate("submit", this.parentNode, event, true);
                            }
                        });
                        form._submit_attached = true;
                    }
                });
                // return undefined since we don't need an event listener
            },

            teardown: function () {
                // Only need this for delegated form submit events
                if (jQuery.nodeName(this, "form")) {
                    return false;
                }

                // Remove delegated handlers; cleanData eventually reaps submit handlers attached above
                jQuery.event.remove(this, "._submit");
            }
        };
    }

// IE change delegation and checkbox/radio fix
    if (!jQuery.support.changeBubbles) {

        jQuery.event.special.change = {
            //负责模拟和监听change事件
            setup: function () {

                if (rformElems.test(this.nodeName)) {
                    // IE doesn't fire change on a check/radio until blur; trigger it on click
                    // after a propertychange. Eat the blur-change in special.change.handle.
                    // This still fires onchange a second time for check/radio after blur.
                    if (this.type === "checkbox" || this.type === "radio") {
                        jQuery.event.add(this, "propertychange._change", function (event) {
                            if (event.originalEvent.propertyName === "checked") {
                                this._just_changed = true;
                            }
                        });
                        jQuery.event.add(this, "click._change", function (event) {
                            if (this._just_changed && !event.isTrigger) {
                                this._just_changed = false;
                                jQuery.event.simulate("change", this, event, true);//模拟change事件的冒泡过程
                            }
                        });
                    }
                    return false;//修正方法返回false将导致继续在表单元素上绑定change事件的主监听函数
                }
                // Delegated event; lazy-add a change handler on descendant inputs
                jQuery.event.add(this, "beforeactivate._change", function (e) {
                    var elem = e.target;

                    if (rformElems.test(elem.nodeName) && !elem._change_attached) {
                        jQuery.event.add(elem, "change._change", function (event) {
                            if (this.parentNode && !event.isSimulated && !event.isTrigger) {
                                jQuery.event.simulate("change", this.parentNode, event, true);
                            }
                        });
                        elem._change_attached = true;
                    }
                });
            },
            //负责执行监听函数
            handle: function (event) {
                var elem = event.target;

                // Swallow native change events from checkbox/radio, we already triggered them above
                //触发监听函数的条件：1.当前事件不是模拟事件  2.当前事件未被手动触发过 3.当前元素不是复选框和单选按钮
                if (this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox")) {
                    return event.handleObj.handler.apply(this, arguments);
                }
            },
            //负责移除为了模拟change事件的冒泡过程而绑定的辅助函数
            teardown: function () {
                jQuery.event.remove(this, "._change");

                return rformElems.test(this.nodeName);
            }
        };
    }

// Create "bubbling" focus and blur events
    if (!jQuery.support.focusinBubbles) {
        jQuery.each({focus: "focusin", blur: "focusout"}, function (orig, fix) {

            // Attach a single capturing(捕捉) handler while someone wants focusin/focusout
            var attaches = 0,//attaches是一个计数器，用于记录绑定focusin/focusout事件的次数，当绑定事件时自动加1，当移除事件时，自动减一
                handler = function (event) {
                    jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);//模拟冒泡过程
                };

            jQuery.event.special[fix] = {
                setup: function () {
                    if (attaches++ === 0) {
                        document.addEventListener(orig, handler, true);
                    }
                },
                teardown: function () {
                    if (--attaches === 0) {
                        document.removeEventListener(orig, handler, true);
                    }
                }
            };
        });
    }
///公开方法
    jQuery.fn.extend({
        /**
         *
         * @param types  事件类型字符串，多个事件类型之间用空格隔开
         * @param selector  一个选择器表达式字符串，用于绑定代理事件
         * @param data  传递给事件监听函数的自定义数据
         * @param fn 待绑定的监听函数
         * @param one 仅仅在内部使用，用于为方法.one(event[,data],handler(eventObject))提供支持
         * @returns {*}
         */
        on: function (types, selector, data, fn, /*INTERNAL*/ one) {
            var origFn, type;

            // Types can be a map of types/handlers
            if (typeof types === "object") {
                // ( types-Object, selector, data )
                if (typeof selector !== "string") {
                    // ( types-Object, data )
                    data = selector;
                    selector = undefined;
                }
                for (type in types) {
                    this.on(type, selector, data, types[type], one);
                }
                return this;
            }
            //根据参数类型修正参数
            //通过对参数顺序和参数类型的巧妙设计和检测，使得该方法的参数格式变得非常灵活和方便
            if (data == null && fn == null) {
                // ( types, fn )
                fn = selector;
                data = selector = undefined;
            } else if (fn == null) {
                if (typeof selector === "string") {
                    // ( types, selector, fn )
                    fn = data;
                    data = undefined;
                } else {
                    // ( types, data, fn )
                    fn = data;
                    data = selector;
                    selector = undefined;
                }
            }
            if (fn === false) {
                fn = returnFalse;
            } else if (!fn) {
                return this;
            }

            if (one === 1) {
                origFn = fn;
                fn = function (event) {
                    // Can use an empty set, since event contains the info
                    jQuery().off(event);
                    return origFn.apply(this, arguments);
                };
                // Use same guid so caller can remove using origFn
                fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
            }
            return this.each(function () {
                jQuery.event.add(this, types, fn, data, selector);
            });
        },
        one: function (types, selector, data, fn) {
            return this.on.call(this, types, selector, data, fn, 1);
        },
        /**
         * 用于移除匹配元素集合每个元素上绑定的一个或多个类型的监听函数
         * @param types 一个或多个空格分隔的事件类型和可选函数
         * @param selector 一个选择器表达式字符串，用于移除事件代理
         * @param fn 待移除的监听函数
         * @returns {*}
         */
        off: function (types, selector, fn) {
            //如果参数events是被分发的jQuery事件对象，则以对应的监听对象的属性作为参数，递归调用.off()来移除事件  ==>通过判断type.preventDefault来说明其是一个事件对象
            if (types && types.preventDefault && types.handleObj) {
                // ( event )  dispatched jQuery.Event
                var handleObj = types.handleObj;
                jQuery(types.delegateTarget).off(
                    handleObj.namespace ? handleObj.type + "." + handleObj.namespace : handleObj.type,
                    handleObj.selector,
                    handleObj.handler
                );
                return this;
            }
            if (typeof types === "object") {
                // ( types-object [, selector] )
                for (var type in types) {
                    this.off(type, selector, types[type]);
                }
                return this;
            }
            //修正参数fn
            if (selector === false || typeof selector === "function") {
                // ( types [, fn] )
                fn = selector;
                selector = undefined;
            }
            if (fn === false) {
                fn = returnFalse;
            }
            //遍历当前匹配元素集合，为每个元素调用方法jQuery.event.remove();
            return this.each(function () {
                jQuery.event.remove(this, types, fn, selector);
            });
        },

        bind: function (types, data, fn) {
            return this.on(types, null, data, fn);
        },
        unbind: function (types, fn) {
            return this.off(types, null, fn);
        },

        live: function (types, data, fn) {
            jQuery(this.context).on(types, this.selector, data, fn);
            return this;
        },
        die: function (types, fn) {
            jQuery(this.context).off(types, this.selector || "**", fn);
            return this;
        },

        delegate: function (selector, types, data, fn) {
            return this.on(types, selector, data, fn);
        },
        undelegate: function (selector, types, fn) {
            // ( namespace ) or ( selector, types [, fn] )
            return arguments.length == 1 ? this.off(selector, "**") : this.off(types, selector, fn);
        },
        //用于执行每个匹配元素上绑定的监听函数和默认行为，并模拟冒泡过程；
        trigger: function (type, data) {
            return this.each(function () {
                jQuery.event.trigger(type, data, this);
            });
        },
        //用于执行第一个匹配元素上绑定的监听函数，并模拟冒泡过程，但不会触发默认行为
        triggerHandler: function (type, data) {
            if (this[0]) {
                return jQuery.event.trigger(type, data, this[0], true);
            }
        },
        /**
         * 用于在匹配元素上绑定两个或更多地事件监听函数，当点击匹配元素时，这些事件监听函数将会轮流执行
         * @param fn
         * @returns {*}
         */
        toggle: function (fn) {
            // Save reference to arguments for access in closure
            var args = arguments,
                guid = fn.guid || jQuery.guid++,
                i = 0,
                toggler = function (event) {
                    // Figure out which function to execute
                    var lastToggle = ( jQuery._data(this, "lastToggle" + fn.guid) || 0 ) % i;
                    jQuery._data(this, "lastToggle" + fn.guid, lastToggle + 1);

                    // Make sure that clicks stop
                    event.preventDefault();

                    // and execute the function
                    return args[lastToggle].apply(this, arguments) || false;
                };

            // link all the functions, so any of them can unbind this click handler
            toggler.guid = guid;
            while (i < args.length) {
                args[i++].guid = guid;
            }

            return this.click(toggler);
        },

        hover: function (fnOver, fnOut) {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
        }
    });

    jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup error contextmenu").split(" "), function (i, name) {

        // Handle event binding
        jQuery.fn[name] = function (data, fn) {
            if (fn == null) {
                fn = data;
                data = null;
            }

            return arguments.length > 0 ?
                this.on(name, null, data, fn) :
                this.trigger(name);
        };
        //记录便捷事件方法名。
        if (jQuery.attrFn) {
            jQuery.attrFn[name] = true;
        }
        //初始化键盘事件和鼠标事件对应的事件属性修正对象
        if (rkeyEvent.test(name)) {
            jQuery.event.fixHooks[name] = jQuery.event.keyHooks;
        }

        if (rmouseEvent.test(name)) {
            jQuery.event.fixHooks[name] = jQuery.event.mouseHooks;
        }
    });


    /*!
     * Sizzle CSS Selector Engine
     *  Copyright 2011, The Dojo Foundation
     *  Released under the MIT, BSD, and GPL Licenses.
     *  More information: http://sizzlejs.com/
     */
    (function () {
//负责从选择器表达式中提取块表达式和块间关系符
        var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
            expando = "sizcache" + (Math.random() + '').replace('.', ''),
            done = 0,
            toString = Object.prototype.toString,
            hasDuplicate = false,
            baseHasDuplicate = true,
            rBackslash = /\\/g,
            rReturn = /\r\n/g,
            rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
        [0, 0].sort(function () {
            //指示了JavaScript引擎在排序时会进行优化；
            baseHasDuplicate = false;
            return 0;
        });

        /**
         * 选择器引擎入口，查找与选择器表达式selector匹配的元素集合
         * @param selector css选择器表达式
         * @param context  DOM元素或者文档对象，作为查找元素的上下文，用于限定查找范围。默认值是当前文档对象
         * @param results  可选的数组或者类数组，函数Sizzle(selector,context,results,seed)将把查找到的元素添加到其中
         * @param seed  可选的元素集合，函数Sizzle(selector,context,results,seed)将从该元素集合中过滤出匹配选择器表达式的元素集合
         * @returns {*}
         * @constructor
         */
        var Sizzle = function (selector, context, results, seed) {
            results = results || [];
            context = context || document;

            var origContext = context;
            //如果context不是元素，也不是document对象
            if (context.nodeType !== 1 && context.nodeType !== 9) {
                return [];
            }
            //如果selector不是字符串或者是空字符串，则直接返回传入的参数results
            if (!selector || typeof selector !== "string") {
                return results;
            }
            /**
             * m：用于存放正则chunker每次匹配选择器表达式的结果
             * set:候选集
             * checkSet:映射集
             * extra:用于存储选择器表达式中第一个逗号之后的其他并列选择器表达式
             * ret：只在从右向左的查找方式中用到，表示单个块表达式
             * parts：存放了正则chunker从选择器表达式中提取的块表达式和块间关系符
             */
            var m, set, checkSet, extra, ret, cur, pop, i,
                prune = true,
                contextXML = Sizzle.isXML(context),
                parts = [],
                soFar = selector;

            // Reset the position of the chunker regexp (start from head)
            do {
                chunker.exec("");
                m = chunker.exec(soFar);

                if (m) {
                    soFar = m[3];
                    parts.push(m[1]);
                    if (m[2]) {
                        extra = m[3];
                        break;
                    }
                }
            } while (m);
            //  伪类
            if (parts.length > 1 && origPOS.exec(selector)) {
//如果数组parts中只有两个元素，并且第一个是块间关系符，则可以直接调用函数posProcess查找匹配的元素集合
                if (parts.length === 2 && Expr.relative[parts[0]]) {
                    set = posProcess(parts[0] + parts[1], context, seed);

                } else {
                    //如果数组parts的第一个元素是块间关系符，则直接将参数context作为第一个上下文集合
                    //否则弹出parts的第一个块表达式，递归使用Sizzle查找匹配元素集合，并将其作为上下文集合
                    set = Expr.relative[parts[0]] ?
                        [context] :
                        Sizzle(parts.shift(), context);

                    while (parts.length) {
                        selector = parts.shift();

                        if (Expr.relative[selector]) {
                            selector += parts.shift();
                        }
//调用时传入的参数selector含有一个块间关系符和一个块表达式，并且指定上下文为前一个块表达式匹配的元素集合set
                        set = posProcess(selector, set, seed);
                    }
                }

            } else {
                //不存在伪类
                // Take a shortcut and set the context if the root selector is an ID
                // (but not if it'll be faster if the inner selector is an ID)
                if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
                    Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {//第一个块选择器是ID类型，但是最后一个不是id类型

                    ret = Sizzle.find(parts.shift(), context, contextXML);
                    context = ret.expr ?
                        Sizzle.filter(ret.expr, ret.set)[0] :
                        ret.set[0];
                }
//查找最后一个块表达式匹配的元素集合，得到候选集set，映射集checkSet
                if (context) {
                    ret = seed ?
                    {expr: parts.pop(), set: makeArray(seed)} :
                        Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);

                    set = ret.expr ?
                        Sizzle.filter(ret.expr, ret.set) :
                        ret.set;

                    if (parts.length > 0) {
                        checkSet = makeArray(set);

                    } else {
                        prune = false;
                    }
//遍历剩余的块表达式和块间关系符，对映射集checkSet执行块间关系过滤
                    while (parts.length) {
                        cur = parts.pop();
                        pop = cur;
                        //从右向左遍历数组parts中剩余的块表达式和块间关系符
                        if (!Expr.relative[cur]) {
                            cur = "";
                        } else {
                            pop = parts.pop();
                        }
                        //说明这时已经到达顶部了
                        if (pop == null) {
                            pop = context;
                        }

                        Expr.relative[cur](checkSet, pop, contextXML);
                    }

                } else {
                    checkSet = parts = [];
                }
            }
//根据映射集checkSet筛选候选集set，将最终的匹配元素放入结果集results中
            if (!checkSet) {
                checkSet = set;
            }

            if (!checkSet) {
                Sizzle.error(cur || selector);
            }

            if (toString.call(checkSet) === "[object Array]") {
                if (!prune) {
                    results.push.apply(results, checkSet);

                } else if (context && context.nodeType === 1) {//上下文是元素，而不是文档对象
                    for (i = 0; checkSet[i] != null; i++) {
                        if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))) {
                            results.push(set[i]);
                        }
                    }

                } else {//上下文是文档对象
                    for (i = 0; checkSet[i] != null; i++) {
                        if (checkSet[i] && checkSet[i].nodeType === 1) {
                            results.push(set[i]);
                        }
                    }
                }

            } else {
                makeArray(checkSet, results);
            }
//如果存在并列选择器表达式，则递归调用Sizzle(selector,context,results,seed)查找匹配的元素集合，并合并，排序，去重
            if (extra) {
                Sizzle(extra, origContext, results, seed);
                Sizzle.uniqueSort(results);
            }

            return results;
        };
//工具方法，排序，去重
        Sizzle.uniqueSort = function (results) {
            if (sortOrder) {
                hasDuplicate = baseHasDuplicate;
                results.sort(sortOrder);
                //存在重复元素
                if (hasDuplicate) {
                    for (var i = 1; i < results.length; i++) {
                        if (results[i] === results[i - 1]) {
                            results.splice(i--, 1);
                        }
                    }
                }
            }

            return results;
        };
//便捷方法，使用指定的选择器表达式expr对元素集合set进行过滤
        Sizzle.matches = function (expr, set) {
            return Sizzle(expr, null, null, set);
        };
//便捷方法，检查某个元素node是否匹配选择器表达式expr
        Sizzle.matchesSelector = function (node, expr) {
            return Sizzle(expr, null, null, [node]).length > 0;
        };

        /**
         * 内部方法，负责查找块表达式匹配的元素集合
         * @param expr 块表达式
         * @param context  DOM元素或者文档对象，作为查找时的上下文
         * @param isXML  布尔值，指示是否运行在一个XML文档中
         * @returns {*}
         */
        Sizzle.find = function (expr, context, isXML) {
            var set, i, len, match, type, left;

            if (!expr) {
                return [];
            }

            for (i = 0, len = Expr.order.length; i < len; i++) {
                type = Expr.order[i];
                //检查每个表达式类型type是否匹配正则表达式
                if ((match = Expr.leftMatch[type].exec(expr))) {
                    left = match[1];
                    match.splice(1, 1);
                    //过滤其中的反斜杠，以支持将某些特殊字符作为普通字符使用
                    if (left.substr(left.length - 1) !== "\\") {
                        match[1] = (match[1] || "").replace(rBackslash, "");
                        set = Expr.find[type](match, context, isXML);
                        //删除块表达式中已经查找过的部分
                        if (set != null) {
                            expr = expr.replace(Expr.match[type], "");
                            break;
                        }
                    }
                }
            }
            //如果没有找到对应类型的查找函数，则读取上下文所有的后代元素
            if (!set) {
                set = typeof context.getElementsByTagName !== "undefined" ?
                    context.getElementsByTagName("*") :
                    [];
            }
            //返回{set:候选集，expr：块表达式剩余部分}
            return {set: set, expr: expr};
        };

        /**
         * 用块表达式过滤元素集合
         * @param expr 块表达式
         * @param set  待过滤的元素集合
         * @param inplace  布尔值，如果为true，将元素集set中与选择器表达式不匹配的元素设置为false，如果不为true，则重新构造一个元素数组并返回，只保留匹配元素
         * @param not  布尔值，如果为true，则去除匹配元素，保留不匹配元素，如果为false，则去除不匹配元素，保留匹配元素
         * @returns {*}
         */
        Sizzle.filter = function (expr, set, inplace, not) {
            var match, anyFound,
                type, found, item, filter, left,
                i, pass,
                old = expr,
                result = [],
                curLoop = set,
                isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

            while (expr && set.length) {
                for (type in Expr.filter) {
                    if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2]) {
                        filter = Expr.filter[type];
                        left = match[1];

                        anyFound = false;

                        match.splice(1, 1);
                        //如果匹配正则的内容以反斜杠开头，表示反斜杠之后的字符被转义了，不是期望的类型，这是会认为类型匹配失败
                        if (left.substr(left.length - 1) === "\\") {
                            continue;
                        }

                        if (curLoop === result) {
                            result = [];
                        }

                        if (Expr.preFilter[type]) {
                            match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);

                            if (!match) {
                                anyFound = found = true;

                            } else if (match === true) {
                                continue;
                            }
                        }

                        if (match) {
                            for (i = 0; (item = curLoop[i]) != null; i++) {
                                if (item) {
                                    found = filter(item, match, i, curLoop);
                                    //表示当前元素item是否可以通过过滤表达式的过滤
                                    pass = not ^ found;

                                    if (inplace && found != null) {
                                        if (pass) {
                                            anyFound = true;

                                        } else {
                                            curLoop[i] = false;
                                        }

                                    } else if (pass) {
                                        //重新构造一个元素数组，只保留匹配元素
                                        result.push(item);
                                        anyFound = true;
                                    }
                                }
                            }
                        }
                        //变量found是过滤函数Sizzle.selectors.filter[type]的返回值，如果不等于undefined，表示至少执行过一次过滤
                        if (found !== undefined) {
                            if (!inplace) {
                                curLoop = result;
                            }
                            //删除表达式中已过滤的部分
                            expr = expr.replace(Expr.match[type], "");
                            //如果没有找到可以通过过滤的元素，则返回一个空数组
                            if (!anyFound) {
                                return [];
                            }

                            break;
                        }
                    }
                }

                // Improper expression
                //如果块表达式没有发生变化，则说明之前的过滤没有生效，此时如果没有找到可以通过过滤的元素，则认为块表达式expr不合法，抛出语法错误的异常
                if (expr === old) {
                    if (anyFound == null) {
                        Sizzle.error(expr);

                    } else {
                        break;
                    }
                }

                old = expr;
            }

            return curLoop;
        };
//工具方法，抛出异常
        Sizzle.error = function (msg) {
            throw new Error("Syntax error, unrecognized expression: " + msg);
        };

        /**
         * 工具方法，获取DOM元素集合的文本内容
         * Utility function for retreiving the text value of an array of DOM nodes
         * @param {Array|Element} elem
         */
        var getText = Sizzle.getText = function (elem) {
            var i, node,
                nodeType = elem.nodeType,
                ret = "";

            if (nodeType) {
                if (nodeType === 1 || nodeType === 9) {
                    // Use textContent || innerText for elements
                    if (typeof elem.textContent === 'string') {
                        return elem.textContent;
                    } else if (typeof elem.innerText === 'string') {
                        // Replace IE's carriage returns
                        return elem.innerText.replace(rReturn, '');
                    } else {
                        // Traverse it's children
                        for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                            ret += getText(elem);
                        }
                    }
                } else if (nodeType === 3 || nodeType === 4) {//如果参数elems是TEXT节点或者CDATASection节点
                    return elem.nodeValue;
                }
            } else {

                // If no nodeType, this is expected to be an array
                for (i = 0; (node = elem[i]); i++) {
                    // Do not traverse comment nodes
                    if (node.nodeType !== 8) {
                        ret += getText(node);
                    }
                }
            }
            return ret;
        };
//扩展方法和属性
        var Expr = Sizzle.selectors = {
            //块表达式查找顺序
            order: ["ID", "NAME", "TAG"],
            //正则表达式集，用于匹配和解析块表达式
            match: {
                ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
                ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
                TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
                CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
                POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
                PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
            },

            leftMatch: {},
            //属性名修正函数集
            attrMap: {
                "class": "className",
                "for": "htmlFor"
            },
            //属性值读取函数集
            attrHandle: {
                href: function (elem) {
                    return elem.getAttribute("href");
                },
                type: function (elem) {
                    return elem.getAttribute("type");
                }
            },
            //块间函数过滤函数集
            //checkSet:映射集，对该元素集合执行过滤操作
            //part:大多数情况下是块间关系符左侧的块表达式，该参数也可以是DOM元素
            //参数isXML:布尔值，指示是否运行在一个XML文档中
            relative: {
                //匹配下一个兄弟元素
                "+": function (checkSet, part) {
                    //isPartStr指示参数part是否是字符串
                    var isPartStr = typeof part === "string",
                        isTag = isPartStr && !rNonWord.test(part),
                        isPartStrNotTag = isPartStr && !isTag;
                    //指示参数part是否是标签字符串
                    if (isTag) {
                        part = part.toLowerCase();
                    }

                    for (var i = 0, l = checkSet.length, elem; i < l; i++) {
                        if ((elem = checkSet[i])) {
                            //在遍历兄弟元素的同时，过滤掉非元素节点，并且只要取到一个兄弟元素就退出while循环
                            while ((elem = elem.previousSibling) && elem.nodeType !== 1) {
                            }

                            checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
                            elem || false :
                            elem === part;
                        }
                    }
                    //指示参数part是否是非标签字符串
                    if (isPartStrNotTag) {
                        Sizzle.filter(part, checkSet, true);
                    }
                },

                ">": function (checkSet, part) {
                    var elem,
                        isPartStr = typeof part === "string",
                        i = 0,
                        l = checkSet.length;
                    //如果参数part是标签
                    if (isPartStr && !rNonWord.test(part)) {
                        part = part.toLowerCase();

                        for (; i < l; i++) {
                            elem = checkSet[i];

                            if (elem) {
                                var parent = elem.parentNode;
                                //查找每一个元素的父元素，并检查父元素节点的nodeName是否与参数part相等，如果相等，则替换映射集checkSet中对应位置的元素为父元素，不相等则替换为false。
                                checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
                            }
                        }

                    } else {
                        for (; i < l; i++) {
                            elem = checkSet[i];

                            if (elem) {

                                checkSet[i] = isPartStr ?
                                    elem.parentNode :
                                elem.parentNode === part;
                            }
                        }

                        if (isPartStr) {
                            Sizzle.filter(part, checkSet, true);
                        }
                    }
                },
                //匹配祖先元素所有的后代元素
                "": function (checkSet, part, isXML) {
                    var nodeCheck,
                        doneName = done++,
                        checkFn = dirCheck;
                    //如果参数part是标签
                    if (typeof part === "string" && !rNonWord.test(part)) {
                        part = part.toLowerCase();
                        nodeCheck = part;
                        checkFn = dirNodeCheck;
                    }

                    checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
                },
                //匹配元素之后的所有兄弟元素siblings
                "~": function (checkSet, part, isXML) {
                    var nodeCheck,
                        doneName = done++,
                        checkFn = dirCheck;

                    if (typeof part === "string" && !rNonWord.test(part)) {
                        part = part.toLowerCase();
                        nodeCheck = part;
                        checkFn = dirNodeCheck;
                    }

                    checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
                }
            },
            //块表达式查找函数集
            find: {
                ID: function (match, context, isXML) {
                    if (typeof context.getElementById !== "undefined" && !isXML) {
                        var m = context.getElementById(match[1]);
                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        return m && m.parentNode ? [m] : [];
                    }
                },

                NAME: function (match, context) {
                    if (typeof context.getElementsByName !== "undefined") {
                        var ret = [],
                            results = context.getElementsByName(match[1]);

                        for (var i = 0, l = results.length; i < l; i++) {
                            if (results[i].getAttribute("name") === match[1]) {
                                ret.push(results[i]);
                            }
                        }

                        return ret.length === 0 ? null : ret;
                    }
                },

                TAG: function (match, context) {
                    if (typeof context.getElementsByTagName !== "undefined") {
                        return context.getElementsByTagName(match[1]);
                    }
                }
            },
            //块表达式预过滤函数集
            preFilter: {
                //负责检查元素集合中的每个元素是否含有指定的类样式
                //inplace为true，将不匹配的元素替换为false；如果为false，则将匹配的元素放入元素集合result中。以此来不断的缩小元素集合
                //如果参数not不是true，则保留匹配元素，并排除不匹配元素；如果参数not是true，则保留不匹配元素，排除匹配元素
                CLASS: function (match, curLoop, inplace, result, not, isXML) {
                    match = " " + match[1].replace(rBackslash, "") + " ";

                    if (isXML) {
                        return match;
                    }

                    for (var i = 0, elem; (elem = curLoop[i]) != null; i++) {
                        //过滤时通过的情况
                        if (elem) {
                            if (not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0)) {
                                if (!inplace) {
                                    result.push(elem);
                                }

                            }
                            //过滤时未通过的情况
                            else if (inplace) {
                                curLoop[i] = false;
                            }
                        }
                    }

                    return false;
                },
                //
                ID: function (match) {
                    return match[1].replace(rBackslash, "");
                },

                TAG: function (match, curLoop) {
                    return match[1].replace(rBackslash, "").toLowerCase();
                },
                //子元素伪类预过滤函数Sizzle.selectors.preFilter.CHILD(match)负责将伪类nth-child的参数格式化为first*n+last
                CHILD: function (match) {
                    if (match[1] === "nth") {
                        if (!match[2]) {
                            Sizzle.error(match[0]);
                        }

                        match[2] = match[2].replace(/^\+|\s*/g, '');

                        // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
                        var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
                            match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
                            !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);

                        // calculate the numbers (first)n+(last) including if they are negative
                        match[2] = (test[1] + (test[2] || 1)) - 0;
                        match[3] = test[3] - 0;
                    }
                    else if (match[2]) {
                        Sizzle.error(match[0]);
                    }

                    // TODO: Move to normal caching system
                    match[0] = done++;

                    return match;
                },
                //负责修正匹配结果match中的属性名和属性值
                ATTR: function (match, curLoop, inplace, result, not, isXML) {
                    var name = match[1] = match[1].replace(rBackslash, "");

                    if (!isXML && Expr.attrMap[name]) {
                        match[1] = Expr.attrMap[name];
                    }

                    // Handle if an un-quoted value was used
                    match[4] = ( match[4] || match[5] || "" ).replace(rBackslash, "");

                    if (match[2] === "~=") {
                        match[4] = " " + match[4] + " ";
                    }

                    return match;
                },
                //主要负责处理伪类表达式是:not(selector)的情况，该函数会将匹配结果match中的分组3（即伪类参数selector）替换为与之匹配的元素集合
                //对于位置伪类和子元素伪类，则返回true，继续执行各自对应的预过滤函数
                PSEUDO: function (match, curLoop, inplace, result, not) {
                    //如果是伪类
                    if (match[1] === "not") {
                        // If we're dealing with a complex expression, or a simple one
                        if (( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3])) {
                            match[3] = Sizzle(match[3], null, null, curLoop);

                        } else {//如果是位置伪类POS或者是子元素伪类child
                            var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

                            if (!inplace) {
                                result.push.apply(result, ret);
                            }

                            return false;
                        }

                    } else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
                        return true;
                    }

                    return match;
                },
                //负责在匹配结果match的头部插入一个新元素true。使得匹配结果match中位置伪类参数的下标变成了3，从而与伪类的匹配结果一致
                POS: function (match) {
                    match.unshift(true);

                    return match;
                }
            },
            //伪类过滤函数集，负责检查元素是否匹配伪类，返回一个布尔值
            filters: {
                //匹配所有可用元素（未禁用的，不隐藏的）
                enabled: function (elem) {
                    return elem.disabled === false && elem.type !== "hidden";
                },
                //匹配所有不可用元素(禁用的)
                disabled: function (elem) {
                    return elem.disabled === true;
                },
                //匹配所有被选中的元素，包括复选框，单选按钮，不包括option元素
                checked: function (elem) {
                    return elem.checked === true;
                },
                //匹配所有选中的option元素
                selected: function (elem) {
                    // Accessing this property makes selected-by-default
                    // options in Safari work properly
                    if (elem.parentNode) {
                        elem.parentNode.selectedIndex;
                    }

                    return elem.selected === true;
                },
                //匹配所有含有子元素或文本的元素
                parent: function (elem) {
                    return !!elem.firstChild;
                },
                //匹配所有不包含子元素或者文本的空元素
                empty: function (elem) {
                    return !elem.firstChild;
                },
                //匹配含有选择器所匹配元素的元素
                has: function (elem, i, match) {
                    return !!Sizzle(match[3], elem).length;
                },
                //匹配诸如h1,h2,h3之类的标题元素
                header: function (elem) {
                    return (/h\d/i).test(elem.nodeName);
                },
                //匹配所有单行文本框
                text: function (elem) {
                    var attr = elem.getAttribute("type"), type = elem.type;
                    // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
                    // use getAttribute instead to test this case
                    return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
                },
                //匹配所有单选按钮
                radio: function (elem) {
                    return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
                },
                //匹配所有复选框
                checkbox: function (elem) {
                    return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
                },
                //匹配所有文本域
                file: function (elem) {
                    return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
                },
                //匹配所有密码框
                password: function (elem) {
                    return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
                },
                //匹配所有提交按钮
                submit: function (elem) {
                    var name = elem.nodeName.toLowerCase();
                    return (name === "input" || name === "button") && "submit" === elem.type;
                },
                //匹配所有图像域
                image: function (elem) {
                    return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
                },
                //匹配所有重置按钮
                reset: function (elem) {
                    var name = elem.nodeName.toLowerCase();
                    return (name === "input" || name === "button") && "reset" === elem.type;
                },
                //匹配所有按钮
                button: function (elem) {
                    var name = elem.nodeName.toLowerCase();
                    return name === "input" && "button" === elem.type || name === "button";
                },
                //匹配所有input,textarea,select ,button元素
                input: function (elem) {
                    return (/input|select|textarea|button/i).test(elem.nodeName);
                },
                //匹配当前焦点元素
                focus: function (elem) {
                    return elem === elem.ownerDocument.activeElement;
                }
            },
            //位置伪类过滤函数集
            setFilters: {
                first: function (elem, i) {
                    return i === 0;
                },

                last: function (elem, i, match, array) {
                    return i === array.length - 1;
                },

                even: function (elem, i) {
                    return i % 2 === 0;
                },

                odd: function (elem, i) {
                    return i % 2 === 1;
                },

                lt: function (elem, i, match) {
                    return i < match[3] - 0;
                },

                gt: function (elem, i, match) {
                    return i > match[3] - 0;
                },

                nth: function (elem, i, match) {
                    return match[3] - 0 === i;
                },

                eq: function (elem, i, match) {
                    return match[3] - 0 === i;
                }
            },
            //块表达式过滤函数集，负责检查元素是否匹配过滤表达式，返回一个布尔值
            filter: {
                //用于检查元素是否匹配伪类，大部分检查通过调用伪类过滤函数集Sizzle.selectors.filter中对应的伪类过滤函数来实现
                PSEUDO: function (elem, match, i, array) {
                    var name = match[1],
                        filter = Expr.filters[name];

                    if (filter) {
                        return filter(elem, i, match, array);

                    } else if (name === "contains") {
                        return (elem.textContent || elem.innerText || getText([elem]) || "").indexOf(match[3]) >= 0;

                    } else if (name === "not") {
                        var not = match[3];

                        for (var j = 0, l = not.length; j < l; j++) {
                            //相等返回false，则不相等的就是not所过滤出来的结果了
                            if (not[j] === elem) {
                                return false;
                            }
                        }

                        return true;

                    } else {
                        Sizzle.error(name);
                    }
                },
                //用于检查元素是否匹配子元素伪类
                CHILD: function (elem, match) {
                    var first, last,
                        doneName, parent, cache,
                        count, diff,
                        type = match[1],
                        node = elem;

                    switch (type) {
                        case "only":
                        case "first":
                            while ((node = node.previousSibling)) {
                                if (node.nodeType === 1) {
                                    return false;
                                }
                            }

                            if (type === "first") {
                                return true;
                            }

                            node = elem;

                        case "last":
                            while ((node = node.nextSibling)) {
                                if (node.nodeType === 1) {
                                    return false;
                                }
                            }

                            return true;
                        //检查当前元素的下标是否匹配伪类参数
                        case "nth":
                            first = match[2];
                            last = match[3];

                            if (first === 1 && last === 0) {
                                return true;
                            }
                            //match[0]是本次过滤的唯一标识
                            doneName = match[0];
                            parent = elem.parentNode;

                            if (parent && (parent[expando] !== doneName || !elem.nodeIndex)) {
                                count = 0;

                                for (node = parent.firstChild; node; node = node.nextSibling) {
                                    if (node.nodeType === 1) {
                                        node.nodeIndex = ++count;
                                    }
                                }

                                parent[expando] = doneName;
                            }

                            diff = elem.nodeIndex - last;

                            if (first === 0) {
                                return diff === 0;

                            } else {
                                return ( diff % first === 0 && diff / first >= 0 );
                            }
                    }
                },

                ID: function (elem, match) {
                    return elem.nodeType === 1 && elem.getAttribute("id") === match;
                },

                TAG: function (elem, match) {
                    return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
                },

                CLASS: function (elem, match) {
                    return (" " + (elem.className || elem.getAttribute("class")) + " ")
                            .indexOf(match) > -1;
                },

                ATTR: function (elem, match) {
                    var name = match[1],
                        //变量result是元素的html属性或者DOM属性值
                        result = Sizzle.attr ?
                            Sizzle.attr(elem, name) :
                            Expr.attrHandle[name] ?
                                Expr.attrHandle[name](elem) :
                                elem[name] != null ?
                                    elem[name] :
                                    elem.getAttribute(name),
                        value = result + "",
                        type = match[2],
                        check = match[4];
                    //
                    return result == null ?
                    type === "!=" :
                        !type && Sizzle.attr ?
                        result != null :
                            type === "=" ?
                            value === check :
                                type === "*=" ?
                                value.indexOf(check) >= 0 :
                                    type === "~=" ?
                                    (" " + value + " ").indexOf(check) >= 0 :
                                        !check ?
                                        value && result !== false :
                                            type === "!=" ?
                                            value !== check :
                                                type === "^=" ?
                                                value.indexOf(check) === 0 :
                                                    type === "$=" ?
                                                    value.substr(value.length - check.length) === check :
                                                        type === "|=" ?
                                                        value === check || value.substr(0, check.length + 1) === check + "-" :
                                                            false;
                },
                //用于检查元素是否匹配位置伪类，该函数通过调用位置过滤函数Sizzle.selector.setFilters中对应的位置伪类过滤函数来实现
                POS: function (elem, match, i, array) {
                    var name = match[2],
                        filter = Expr.setFilters[name];

                    if (filter) {
                        return filter(elem, i, match, array);
                    }
                }
            }
        };

        var origPOS = Expr.match.POS,
            fescape = function (all, num) {
                return "\\" + (num - 0 + 1);
            };
        //为对象Sizzle.sectors.match中的正则添加一段后缀正则，然后再添加一段前缀正则，来构造Sizzle.sectors.leftMatch中的同名正则。
        for (var type in Expr.match) {
            Expr.match[type] = new RegExp(Expr.match[type].source + (/(?![^\[]*\])(?![^\(]*\))/.source));
            Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source.replace(/\\(\d+)/g, fescape));
        }

        var makeArray = function (array, results) {
            array = Array.prototype.slice.call(array, 0);

            if (results) {
                results.push.apply(results, array);
                return results;
            }

            return array;
        };

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
        try {
            Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;

// Provide a fallback method if it does not work
        } catch (e) {
            makeArray = function (array, results) {
                var i = 0,
                    ret = results || [];

                if (toString.call(array) === "[object Array]") {
                    Array.prototype.push.apply(ret, array);

                } else {
                    if (typeof array.length === "number") {
                        for (var l = array.length; i < l; i++) {
                            ret.push(array[i]);
                        }

                    } else {
                        for (; array[i]; i++) {
                            ret.push(array[i]);
                        }
                    }
                }

                return ret;
            };
        }

        var sortOrder, siblingCheck;
        //如果浏览器支持原生方法compareDocumentPosition,则调用该方法进行比较元素的位置
        if (document.documentElement.compareDocumentPosition) {
            sortOrder = function (a, b) {
                if (a === b) {
                    hasDuplicate = true;
                    return 0;
                }

                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            };

        } else {//如果浏览器支持原生属性sourceIndex的情况，则利用该属性比较元素位置
            sortOrder = function (a, b) {
                // The nodes are identical, we can exit early
                if (a === b) {
                    hasDuplicate = true;
                    return 0;

                    // Fallback to using sourceIndex (in IE) if it's available on both nodes
                } else if (a.sourceIndex && b.sourceIndex) {
                    return a.sourceIndex - b.sourceIndex;
                }
//否则比较祖先元素的文档位置

                var al, bl,
                    ap = [],
                    bp = [],
                    aup = a.parentNode,
                    bup = b.parentNode,
                    cur = aup;

                // If the nodes are siblings (or identical) we can do a quick check
                //元素a和b是兄弟元素的情况
                if (aup === bup) {
                    return siblingCheck(a, b);

                    // If no parents were found then the nodes are disconnected
                    //没有找到父元素的情况
                } else if (!aup) {
                    return -1;

                } else if (!bup) {
                    return 1;
                }

                // Otherwise they're somewhere else in the tree so we need
                // to build up a full list of the parentNodes for comparison
                //查找元素a和元素b的祖先元素
                while (cur) {
                    ap.unshift(cur);
                    cur = cur.parentNode;
                }

                cur = bup;

                while (cur) {
                    bp.unshift(cur);
                    cur = cur.parentNode;
                }
                //比较祖先元素的文档位置
                al = ap.length;
                bl = bp.length;

                // Start walking down the tree looking for a discrepancy
                for (var i = 0; i < al && i < bl; i++) {
                    if (ap[i] !== bp[i]) {
                        return siblingCheck(ap[i], bp[i]);
                    }
                }

                // We ended someplace up the tree so do a sibling check
                //元素a和元素b的文档深度不一致的情况
                return i === al ?
                    siblingCheck(a, bp[i], -1) :
                    siblingCheck(ap[i], b, 1);
            };
//负责比较兄弟元素的文档位置。
            siblingCheck = function (a, b, ret) {
                if (a === b) {
                    return ret;
                }

                var cur = a.nextSibling;

                while (cur) {
                    if (cur === b) {
                        return -1;
                    }

                    cur = cur.nextSibling;
                }

                return 1;
            };
        }

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
        (function () {
            // We're going to inject a fake input element with a specified name
            var form = document.createElement("div"),
                id = "script" + (new Date()).getTime(),
                root = document.documentElement;

            form.innerHTML = "<a name='" + id + "'/>";

            // Inject it into the root element, check its status, and remove it quickly
            root.insertBefore(form, root.firstChild);

            // The workaround has to do additional checks after a getElementById
            // Which slows things down for other browsers (hence the branching)
            if (document.getElementById(id)) {
                Expr.find.ID = function (match, context, isXML) {
                    if (typeof context.getElementById !== "undefined" && !isXML) {
                        var m = context.getElementById(match[1]);

                        return m ?
                            m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
                                [m] :
                                undefined :
                            [];
                    }
                };

                Expr.filter.ID = function (elem, match) {
                    var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

                    return elem.nodeType === 1 && node && node.nodeValue === match;
                };
            }

            root.removeChild(form);

            // release memory in IE
            root = form = null;
        })();

        (function () {
            // Check to see if the browser returns only elements
            // when doing getElementsByTagName("*")

            // Create a fake element
            var div = document.createElement("div");
            div.appendChild(document.createComment(""));

            // Make sure no comments are found
            if (div.getElementsByTagName("*").length > 0) {
                Expr.find.TAG = function (match, context) {
                    var results = context.getElementsByTagName(match[1]);

                    // Filter out possible comments
                    if (match[1] === "*") {
                        var tmp = [];

                        for (var i = 0; results[i]; i++) {
                            if (results[i].nodeType === 1) {
                                tmp.push(results[i]);
                            }
                        }

                        results = tmp;
                    }

                    return results;
                };
            }

            // Check to see if an attribute returns normalized href attributes
            div.innerHTML = "<a href='#'></a>";

            if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
                div.firstChild.getAttribute("href") !== "#") {

                Expr.attrHandle.href = function (elem) {
                    return elem.getAttribute("href", 2);
                };
            }

            // release memory in IE
            div = null;
        })();
        //如果支持使用方法querySelectorAll()，则调用该方法查找元素
        if (document.querySelectorAll) {
            (function () {
                var oldSizzle = Sizzle,
                    div = document.createElement("div"),
                    id = "__sizzle__";

                div.innerHTML = "<p class='TEST'></p>";

                // Safari can't handle uppercase or unicode characters when
                // in quirks mode.
                if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
                    return;
                }

                Sizzle = function (query, context, extra, seed) {
                    context = context || document;

                    // Only use querySelectorAll on non-XML documents
                    // (ID selectors don't work in non-HTML documents)
                    if (!seed && !Sizzle.isXML(context)) {
                        // See if we find a selector to speed up
                        var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);

                        if (match && (context.nodeType === 1 || context.nodeType === 9)) {
                            // Speed-up: Sizzle("TAG")
                            if (match[1]) {
                                return makeArray(context.getElementsByTagName(query), extra);

                                // Speed-up: Sizzle(".CLASS")
                            } else if (match[2] && Expr.find.CLASS && context.getElementsByClassName) {
                                return makeArray(context.getElementsByClassName(match[2]), extra);
                            }
                        }

                        if (context.nodeType === 9) {
                            // Speed-up: Sizzle("body")
                            // The body element only exists once, optimize finding it
                            if (query === "body" && context.body) {
                                return makeArray([context.body], extra);

                                // Speed-up: Sizzle("#ID")
                            } else if (match && match[3]) {
                                var elem = context.getElementById(match[3]);

                                // Check parentNode to catch when Blackberry 4.6 returns
                                // nodes that are no longer in the document #6963
                                if (elem && elem.parentNode) {
                                    // Handle the case where IE and Opera return items
                                    // by name instead of ID
                                    if (elem.id === match[3]) {
                                        return makeArray([elem], extra);
                                    }

                                } else {
                                    return makeArray([], extra);
                                }
                            }

                            try {
                                //尝试调用方法querySelectorAll()查找元素，如果上下文是document，则直接调用querySelectorAll()查找元素
                                return makeArray(context.querySelectorAll(query), extra);
                            } catch (qsaError) {
                            }

                            // qSA works strangely on Element-rooted queries
                            // We can work around this by specifying an extra ID on the root
                            // and working up from there (Thanks to Andrew Dupont for the technique)
                            // IE 8 doesn't work on object elements
                        } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                            var oldContext = context,
                                old = context.getAttribute("id"),
                                nid = old || id,
                                hasParent = context.parentNode,
                                relativeHierarchySelector = /^\s*[+~]/.test(query);

                            if (!old) {
                                context.setAttribute("id", nid);
                            } else {
                                nid = nid.replace(/'/g, "\\$&");
                            }
                            if (relativeHierarchySelector && hasParent) {
                                context = context.parentNode;
                            }

                            try {
                                if (!relativeHierarchySelector || hasParent) {
                                    //如果上下文是元素，则为选择器表达式增加上下文，然后调用querySelectorAll()查找元素
                                    return makeArray(context.querySelectorAll("[id='" + nid + "'] " + query), extra);
                                }

                            } catch (pseudoError) {
                            } finally {
                                if (!old) {
                                    oldContext.removeAttribute("id");
                                }
                            }
                        }
                    }
                    //如果查找失败，则仍然调用oldSizzle()
                    return oldSizzle(query, context, extra, seed);
                };

                for (var prop in oldSizzle) {
                    Sizzle[prop] = oldSizzle[prop];
                }

                // release memory in IE
                div = null;
            })();
        }
//如果支持方法matchesSelector()，则调用该方法检查元素是否匹配选择器表达式
        (function () {
            var html = document.documentElement,
                matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;
//如果支持方法matchesSelector()
            if (matches) {
                // Check to see if it's possible to do matchesSelector
                // on a disconnected node (IE 9 fails this)
                var disconnectedMatch = !matches.call(document.createElement("div"), "div"),
                    pseudoWorks = false;

                try {
                    // This should fail with an exception
                    // Gecko does not error, returns false instead
                    matches.call(document.documentElement, "[test!='']:sizzle");

                } catch (pseudoError) {
                    pseudoWorks = true;
                }

                Sizzle.matchesSelector = function (node, expr) {
                    // Make sure that attribute selectors are quoted
                    expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

                    if (!Sizzle.isXML(node)) {
                        try {
                            if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr)) {
                                //尝试调用方法matchesSelector()
                                var ret = matches.call(node, expr);

                                // IE 9's matchesSelector returns false on disconnected nodes
                                if (ret || !disconnectedMatch ||
                                    // As well, disconnected nodes are said to be in a document
                                    // fragment in IE 9, so check for that
                                    node.document && node.document.nodeType !== 11) {
                                    return ret;
                                }
                            }
                        } catch (e) {
                        }
                    }
                    //如果查找失败，则仍然调用Sizzle（）；
                    return Sizzle(expr, null, null, [node]).length > 0;
                };
            }
        })();
//检查浏览器是否支持getElementsByClassName()
        (function () {
            var div = document.createElement("div");

            div.innerHTML = "<div class='test e'></div><div class='test'></div>";

            // Opera can't find a second classname (in 9.6)
            // Also, make sure that getElementsByClassName actually exists
            if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
                return;
            }

            // Safari caches class attributes, doesn't catch changes (in 3.2)
            div.lastChild.className = "e";

            if (div.getElementsByClassName("e").length === 1) {
                return;
            }
            //如果浏览器支持getElementsByClassName()，则插入class
            Expr.order.splice(1, 0, "CLASS");
            Expr.find.CLASS = function (match, context, isXML) {
                if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
                    return context.getElementsByClassName(match[1]);
                }
            };

            // release memory in IE
            div = null;
        })();
        /**
         * 负责遍历候选集checkSet，检查其中每个元素在某个方向dir上是否有与参数cur匹配的元素
         * 如果找到，则将候选集checkSet中对应位置的元素替换为找到的元素，如果未找到，则替换为false。
         * @param dir 表示查找方向的字符串
         * @param cur 标签字符串
         * @param doneName  数值
         * @param checkSet  候选集
         * @param nodeCheck  标签字符串
         * @param isXML  布尔值
         */
        function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
            for (var i = 0, l = checkSet.length; i < l; i++) {
                var elem = checkSet[i];

                if (elem) {
                    var match = false;

                    elem = elem[dir];

                    while (elem) {
                        if (elem[expando] === doneName) {
                            match = checkSet[elem.sizset];
                            break;
                        }

                        if (elem.nodeType === 1 && !isXML) {
                            elem[expando] = doneName;
                            elem.sizset = i;
                        }

                        if (elem.nodeName.toLowerCase() === cur) {
                            match = elem;
                            break;
                        }

                        elem = elem[dir];
                    }

                    checkSet[i] = match;
                }
            }
        }

        /**
         * 负责遍历候选集checkSet，检查其中每个元素在某个方向dir上是否有与参数cur匹配或相等的元素
         * 如果找到，则将候选集checkSet中对应位置的元素替换为找到的元素或true，如果未找到，则替换为false。
         * @param dir 表示查找方向的字符串
         * @param cur 大多数情况下是非标签字符串格式的块表达式，也可能是dom元素
         * @param doneName 数值，本次查找的唯一标识，用于优化查找过程，避免重复查找
         * @param checkSet 候选集，在查找过程中，其中的元素将被替换为父元素，祖先元素，兄弟元素，true或者false。
         * @param nodeCheck undefined。
         * @param isXML 布尔值，指示是否运行在一个XML文档中
         */
        function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
            for (var i = 0, l = checkSet.length; i < l; i++) {
                var elem = checkSet[i];

                if (elem) {
                    var match = false;

                    elem = elem[dir];

                    while (elem) {
                        //如果遇到已经检查过的元素
                        if (elem[expando] === doneName) {
                            match = checkSet[elem.sizset];
                            break;
                        }

                        if (elem.nodeType === 1) {
                            if (!isXML) {
                                elem[expando] = doneName;
                                elem.sizset = i;
                            }
                            //cur是dom元素
                            if (typeof cur !== "string") {
                                if (elem === cur) {
                                    match = true;
                                    break;
                                }
                                //参数cur是非标签字符串
                            } else if (Sizzle.filter(cur, [elem]).length > 0) {
                                match = elem;
                                break;
                            }
                        }

                        elem = elem[dir];
                    }

                    checkSet[i] = match;
                }
            }
        }

        if (document.documentElement.contains) {
            //工具方法，检查元素a是否包含元素b
            Sizzle.contains = function (a, b) {
                return a !== b && (a.contains ? a.contains(b) : true);
            };

        } else if (document.documentElement.compareDocumentPosition) {
            Sizzle.contains = function (a, b) {
                return !!(a.compareDocumentPosition(b) & 16);
            };

        } else {
            Sizzle.contains = function () {
                return false;
            };
        }

        Sizzle.isXML = function (elem) {
            // documentElement is verified for cases where it doesn't yet exist
            // (such as loading iframes in IE - #4833)
            var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

            return documentElement ? documentElement.nodeName !== "HTML" : false;
        };
        /**
         *在指定的上下文数组context下，查找与选择器表达式selector匹配的元素集合，并且支持伪类
         * @param selector 选择器表达式，由一个块间关系符和一个块表达式组成
         * @param context
         * @param seed
         * @returns {*}
         */
        var posProcess = function (selector, context, seed) {
            var match,
                tmpSet = [],
                later = "",
                root = context.nodeType ? [context] : context;

            // Position selectors must be done after the filter
            // And so must :not(positional) so we move all PSEUDOs to the end
            while ((match = Expr.match.PSEUDO.exec(selector))) {
                //删除所有的伪类，并累计在变量later中
                later += match[0];
                selector = selector.replace(Expr.match.PSEUDO, "");
            }
//如果删除伪类后的选择器表达式只剩下一个块间关系符，则追加一个通配符"*"
            selector = Expr.relative[selector] ? selector + "*" : selector;
//遍历上下文数组，调用函数Sizzle（）查找删除伪类后的选择器表达式匹配的元素集合，并将查找结果合并到数组tmpSet中；
            for (var i = 0, l = root.length; i < l; i++) {
                Sizzle(selector, root[i], tmpSet, seed);
            }

            return Sizzle.filter(later, tmpSet);
        };

// EXPOSE
// Override sizzle attribute retrieval
        //将Sizzle的方法和属性暴露给jquery
        Sizzle.attr = jQuery.attr;
        Sizzle.selectors.attrMap = {};
        jQuery.find = Sizzle;
        jQuery.expr = Sizzle.selectors;
        jQuery.expr[":"] = jQuery.expr.filters;
        jQuery.unique = Sizzle.uniqueSort;
        jQuery.text = Sizzle.getText;
        jQuery.isXMLDoc = Sizzle.isXML;
        jQuery.contains = Sizzle.contains;


    })();


    var runtil = /Until$/,
        rparentsprev = /^(?:parents|prevUntil|prevAll)/,
        // Note: This RegExp should be improved, or likely pulled from Sizzle
        rmultiselector = /,/,
        isSimple = /^.[^:#\[\.,]*$/,
        slice = Array.prototype.slice,
        POS = jQuery.expr.match.POS,
        // methods guaranteed to produce a unique set when starting from a unique set
        guaranteedUnique = {
            children: true,
            contents: true,
            next: true,
            prev: true
        };

    jQuery.fn.extend({
        find: function (selector) {
            var self = this,
                i, l;

            if (typeof selector !== "string") {
                //当selector是dom或者jquery对象的时候，将该参数统一封装成一个jquery对象，然后遍历该对象，检查其中的元素是不是当前jquery对象中某个元素的后代元素，如果是则保留；
                //不是则丢弃，最后返回一个含有新jquery对象子集的另一个新jquery对象。
                return jQuery(selector).filter(function () {
                    for (i = 0, l = self.length; i < l; i++) {
                        if (jQuery.contains(self[i], this)) {
                            return true;
                        }
                    }
                });
            }
            //构造一个新的空jquery对象，后面找到的元素都将被添加到该jquery对象中
            var ret = this.pushStack("", "find", selector),
                length, n, r;

            for (i = 0, l = this.length; i < l; i++) {
                length = ret.length;
                jQuery.find(selector, this[i], ret);

                if (i > 0) {
                    // Make sure that the results are unique
                    for (n = length; n < ret.length; n++) {
                        for (r = 0; r < length; r++) {
                            if (ret[r] === ret[n]) {
                                ret.splice(n--, 1);
                                break;
                            }
                        }
                    }
                }
            }

            return ret;
        },
//用当前的jquery对象的子集构造一个新的jquery对象，其中只保留子元素可以匹配参数target的元素。
        has: function (target) {
            var targets = jQuery(target);
            return this.filter(function () {
                for (var i = 0, l = targets.length; i < l; i++) {
                    if (jQuery.contains(this, targets[i])) {
                        return true;
                    }
                }
            });
        },
//用当前jquery对象的子集构造一个新的jquery对象，其中只保留参与selector不匹配的元素
        not: function (selector) {
            return this.pushStack(winnow(this, selector, false), "not", selector);
        },
//用当前的jquery对象的子集构造一个新的jquery对象，其中只保留参与selector匹配的元素
        filter: function (selector) {
            return this.pushStack(winnow(this, selector, true), "filter", selector);
        },
//用选择器表达式，DOM元素，jquery对象或函数来检查当前匹配元素集合，只要其中某个元素可以匹配给定的参数就返回true
        is: function (selector) {
            return !!selector && (
                    typeof selector === "string" ?
                        // If this is a positional selector, check membership in the returned set
                        // so $("p:first").is("p:last") won't return true for a doc with two "p".
                        POS.test(selector) ?
                        jQuery(selector, this.context).index(this[0]) >= 0 :
                        jQuery.filter(selector, this).length > 0 :
                    this.filter(selector).length > 0 );
        },
//用于在当前匹配元素集合和他们的祖先元素中查找与参数selector匹配的最近元素，并用查找结果构造一个新的jquery对象
        closest: function (selectors, context) {
            var ret = [], i, l, cur = this[0];

            // Array (deprecated as of jQuery 1.7)
            if (jQuery.isArray(selectors)) {
                var level = 1;

                while (cur && cur.ownerDocument && cur !== context) {
                    for (i = 0; i < selectors.length; i++) {

                        if (jQuery(cur).is(selectors[i])) {
                            ret.push({selector: selectors[i], elem: cur, level: level});
                        }
                    }

                    cur = cur.parentNode;
                    level++;
                }

                return ret;
            }

            // String
            var pos = POS.test(selectors) || typeof selectors !== "string" ?
                jQuery(selectors, context || this.context) :
                0;

            for (i = 0, l = this.length; i < l; i++) {
                cur = this[i];

                while (cur) {
                    if (pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors)) {
                        ret.push(cur);
                        break;

                    } else {
                        cur = cur.parentNode;
                        if (!cur || !cur.ownerDocument || cur === context || cur.nodeType === 11) {
                            break;
                        }
                    }
                }
            }

            ret = ret.length > 1 ? jQuery.unique(ret) : ret;

            return this.pushStack(ret, "closest", selectors);
        },

        // Determine the position of an element within
        // the matched set of elements
//用于判断元素在元素集合中的下标位置，该方法随参数elem的不同而不同
        index: function (elem) {

            // No argument, return index in parent
            if (!elem) {
                return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
            }

            // index in selector
            if (typeof elem === "string") {
                return jQuery.inArray(this[0], jQuery(elem));
            }

            // Locate the position of the desired element
            return jQuery.inArray(
                // If it receives a jQuery object, the first element is used
                elem.jquery ? elem[0] : elem, this);
        },
//用当前jquery对象中的元素和传入的参数构造一个新的jquery对象。
        add: function (selector, context) {
            var set = typeof selector === "string" ?
                    jQuery(selector, context) :
                    jQuery.makeArray(selector && selector.nodeType ? [selector] : selector),
                all = jQuery.merge(this.get(), set);

            return this.pushStack(isDisconnected(set[0]) || isDisconnected(all[0]) ?
                all :
                jQuery.unique(all));
        },

        andSelf: function () {
            return this.add(this.prevObject);
        }
    });

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
    function isDisconnected(node) {
        return !node || !node.parentNode || node.parentNode.nodeType === 11;
    }

    jQuery.each({
        parent: function (elem) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        },
        parents: function (elem) {
            return jQuery.dir(elem, "parentNode");
        },
        parentsUntil: function (elem, i, until) {
            return jQuery.dir(elem, "parentNode", until);
        },
        next: function (elem) {
            return jQuery.nth(elem, 2, "nextSibling");
        },
        prev: function (elem) {
            return jQuery.nth(elem, 2, "previousSibling");
        },
        nextAll: function (elem) {
            return jQuery.dir(elem, "nextSibling");
        },
        prevAll: function (elem) {
            return jQuery.dir(elem, "previousSibling");
        },
        nextUntil: function (elem, i, until) {
            return jQuery.dir(elem, "nextSibling", until);
        },
        prevUntil: function (elem, i, until) {
            return jQuery.dir(elem, "previousSibling", until);
        },
        siblings: function (elem) {
            return jQuery.sibling(elem.parentNode.firstChild, elem);
        },
        children: function (elem) {
            return jQuery.sibling(elem.firstChild);
        },
        //返回指定DOM元素的子元素，并且包括文本节点和注释节点，或者返回iframe元素的document对象
        contents: function (elem) {
            return jQuery.nodeName(elem, "iframe") ?
            elem.contentDocument || elem.contentWindow.document :
                jQuery.makeArray(elem.childNodes);
        }
    }, function (name, fn) {
        /**
         * 调用对应的遍历函数查找DOM元素，然后执行过滤，排序和去重操作，最后用剩余的DOM元素构造一个新的jQuery对象并返回
         * @param until 选择器表达式，用于指示查找停止的位置
         * @param selector 用于过滤找到的元素
         */
        jQuery.fn[name] = function (until, selector) {
            var ret = jQuery.map(this, fn, until);

            if (!runtil.test(name)) {
                selector = until;
            }

            if (selector && typeof selector === "string") {
                ret = jQuery.filter(selector, ret);
            }

            ret = this.length > 1 && !guaranteedUnique[name] ? jQuery.unique(ret) : ret;

            if ((this.length > 1 || rmultiselector.test(selector)) && rparentsprev.test(name)) {
                ret = ret.reverse();
            }

            return this.pushStack(ret, name, slice.call(arguments).join(","));
        };
    });
//使用指定的选择器表达式expr对元素集合elems进行过滤，并返回过滤结果。如果参数not是true，则保留不匹配元素，否则默认保留匹配元素
    jQuery.extend({
        filter: function (expr, elems, not) {
            if (not) {
                expr = ":not(" + expr + ")";
            }

            return elems.length === 1 ?
                jQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [] :
                jQuery.find.matches(expr, elems);
        },

        /**
         * 负责从一个元素出发，查找某个方向上的所有元素，直到遇到document对象或匹配参数until的元素为止
         * @param elem 表示查找的起始元素
         * @param dir 表示查找的方向，DOM遍历模块用到的可选值后parentNode,nextSibling,previouSibling
         * @param until 可选的选择器表达式，表示终止查找的位置，如果在查找过程中遇到匹配参数until的元素，则查找终止
         * @returns {Array}
         */
        dir: function (elem, dir, until) {
            var matched = [],
                cur = elem[dir];

            while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
                if (cur.nodeType === 1) {
                    matched.push(cur);
                }
                cur = cur[dir];
            }
            return matched;
        },
        /**
         * 负责从一个元素出发，查找某个方向上的第n个元素。
         * @param cur 表示查找的起始元素
         * @param result 表示要查找的元素的序号
         * @param dir 表示查找的方向，DOM遍历模块用到的可选值有nextSibling,previousSibling
         * @param elem 没有用到的冗余参数
         * @returns {*}
         */
        nth: function (cur, result, dir, elem) {
            result = result || 1;
            var num = 0;

            for (; cur; cur = cur[dir]) {
                if (cur.nodeType === 1 && ++num === result) {
                    break;
                }
            }

            return cur;
        },
        /**
         * 负责查找一个元素之后的所有兄弟元素，包括起始元素，但是不包括参数elem。
         * @param n 表示查找的起始元素，包含在返回结果中
         * @param elem 可选的DOM元素，不包含在返回结果中
         * @returns {Array}
         */
        sibling: function (n, elem) {
            var r = [];

            for (; n; n = n.nextSibling) {
                if (n.nodeType === 1 && n !== elem) {
                    r.push(n);
                }
            }

            return r;
        }
    });

// Implement the identical functionality for filter and not
    /**
     * 负责过滤元素集合
     * @param elements 待过滤的元素集合
     * @param qualifier 用于过滤元素集合elements。可选值有函数，DOM元素，选择器表达式，DOM元素数组，jquery对象
     * @param keep  布尔值，true：保留匹配元素   false：保留不匹配元素
     * @returns {*}
     */
    function winnow(elements, qualifier, keep) {

        // Can't pass null or undefined to indexOf in Firefox 4
        // Set to 0 to skip string check
        qualifier = qualifier || 0;

        if (jQuery.isFunction(qualifier)) {
            return jQuery.grep(elements, function (elem, i) {
                var retVal = !!qualifier.call(elem, i, elem);
                return retVal === keep;
            });

        } else if (qualifier.nodeType) {
            return jQuery.grep(elements, function (elem, i) {
                return ( elem === qualifier ) === keep;
            });

        } else if (typeof qualifier === "string") {
            var filtered = jQuery.grep(elements, function (elem) {
                return elem.nodeType === 1;
            });

            if (isSimple.test(qualifier)) {
                return jQuery.filter(qualifier, filtered, !keep);
            } else {
                qualifier = jQuery.filter(qualifier, filtered);
            }
        }

        return jQuery.grep(elements, function (elem, i) {
            return ( jQuery.inArray(elem, qualifier) >= 0 ) === keep;
        });
    }


    function createSafeFragment(document) {
        var list = nodeNames.split("|"),
            safeFrag = document.createDocumentFragment();

        if (safeFrag.createElement) {
            while (list.length) {
                safeFrag.createElement(
                    list.pop()
                );
            }
        }
        return safeFrag;
    }

    var nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|" +
            "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
        rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
        rleadingWhitespace = /^\s+/,
        rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rtagName = /<([\w:]+)/,
        rtbody = /<tbody/i,
        rhtml = /<|&#?\w+;/,
        rnoInnerhtml = /<(?:script|style)/i,
        rnocache = /<(?:script|object|embed|option|style)/i,
        rnoshimcache = new RegExp("<(?:" + nodeNames + ")", "i"),
        // checked="checked" or checked
        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
        rscriptType = /\/(java|ecma)script/i,
        rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
        wrapMap = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            legend: [1, "<fieldset>", "</fieldset>"],
            thead: [1, "<table>", "</table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            area: [1, "<map>", "</map>"],
            _default: [0, "", ""]
        },
        safeFragment = createSafeFragment(document);

    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
    if (!jQuery.support.htmlSerialize) {
        wrapMap._default = [1, "div<div>", "</div>"];
    }
    //DOM操作模块
    jQuery.fn.extend({
        //用于获取匹配元素集合中的所有元素合并后的文本内容，或者设置每个元素的文本内容
        text: function (text) {
            //参数text是函数的情况下
            if (jQuery.isFunction(text)) {
                return this.each(function (i) {
                    var self = jQuery(this);

                    self.text(text.call(this, i, self.text()));
                });
            }
            //传入参数text的情况。如果参数text不是对象，也不是undefined，即可能是字符串，数字或者布尔值，则先清空内容，然后创建文本节点，并插入每个匹配元素中
            if (typeof text !== "object" && text !== undefined) {
                return this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(text));
            }

            return jQuery.text(this);
        },
        /**
         * 用于在匹配元素集合的所有元素前后包裹一段HTML结构
         * @param html
         * @returns {*}
         */
        wrapAll: function (html) {
            if (jQuery.isFunction(html)) {
                return this.each(function (i) {
                    jQuery(this).wrapAll(html.call(this, i));
                });
            }

            if (this[0]) {
                // The elements to wrap the target around
                var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

                if (this[0].parentNode) {
                    wrap.insertBefore(this[0]);
                }
                //找出包裹元素中最内层的元素，然后把当前匹配元素集合插入最内层元素中
                wrap.map(function () {
                    var elem = this;

                    while (elem.firstChild && elem.firstChild.nodeType === 1) {
                        elem = elem.firstChild;
                    }

                    return elem;
                }).append(this);
            }

            return this;
        },
        /**
         * 用于在匹配元素集合中每个元素的内容前后包裹一段HTML结构
         * @param html
         * @returns {*}
         */
        wrapInner: function (html) {
            if (jQuery.isFunction(html)) {
                return this.each(function (i) {
                    jQuery(this).wrapInner(html.call(this, i));
                });
            }

            return this.each(function () {
                var self = jQuery(this),
                    contents = self.contents();

                if (contents.length) {
                    contents.wrapAll(html);

                } else {
                    self.append(html);
                }
            });
        },
        //用于在匹配元素集合的每个元素前后包裹一段HTML结构
        wrap: function (html) {
            var isFunction = jQuery.isFunction(html);

            return this.each(function (i) {
                jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
            });
        },
        //用于移除匹配元素集合中的每个元素的父元素，并把匹配元素留在父元素的位置上。
        unwrap: function () {
            return this.parent().each(function () {
                if (!jQuery.nodeName(this, "body")) {
                    jQuery(this).replaceWith(this.childNodes);
                }
            }).end();
        },

        append: function () {
            return this.domManip(arguments, true, function (elem) {
                if (this.nodeType === 1) {
                    this.appendChild(elem);
                }
            });
        },

        prepend: function () {
            return this.domManip(arguments, true, function (elem) {
                if (this.nodeType === 1) {
                    this.insertBefore(elem, this.firstChild);
                }
            });
        },
        //用于在匹配元素集合的每个元素之前插入参数指定的内容。
        before: function () {
            if (this[0] && this[0].parentNode) {
                return this.domManip(arguments, false, function (elem) {
                    this.parentNode.insertBefore(elem, this);
                });
            } else if (arguments.length) {
                var set = jQuery.clean(arguments);
                set.push.apply(set, this.toArray());
                return this.pushStack(set, "before", arguments);
            }
        },

        after: function () {
            if (this[0] && this[0].parentNode) {
                return this.domManip(arguments, false, function (elem) {
                    this.parentNode.insertBefore(elem, this.nextSibling);
                });
            } else if (arguments.length) {
                var set = this.pushStack(this, "after", arguments);
                set.push.apply(set, jQuery.clean(arguments));
                return set;
            }
        },

        // keepData is for internal use only--do not document
        /**
         * 用于从文档中移除匹配元素集合，该方法会遍历匹配元素集合，先移除后代元素和匹配元素关联的数据和事件，以避免内存泄漏，然后移除匹配元素
         * @param selector 可选的选择器表达式，用于过滤待移除的匹配元素
         * @param keepData 可选的布尔值，指示是否保留匹配元素以及他的后代元素所关联的数据和事件，该参数仅仅在内部使用
         * @returns {jQuery}
         */
        remove: function (selector, keepData) {
            for (var i = 0, elem; (elem = this[i]) != null; i++) {
                if (!selector || jQuery.filter(selector, [elem]).length) {
                    if (!keepData && elem.nodeType === 1) {
                        jQuery.cleanData(elem.getElementsByTagName("*"));
                        jQuery.cleanData([elem]);
                    }

                    if (elem.parentNode) {
                        elem.parentNode.removeChild(elem);
                    }
                }
            }

            return this;
        },
        //移除匹配元素的所有子元素
        empty: function () {
            for (var i = 0, elem; (elem = this[i]) != null; i++) {
                // Remove element nodes and prevent memory leaks
                if (elem.nodeType === 1) {
                    //移除匹配元素的所有子元素
                    //先移除后代元素关联的数据和事件，以避免内存泄漏
                    jQuery.cleanData(elem.getElementsByTagName("*"));
                }

                // Remove any remaining nodes
                //重复移除第一个子元素，直至所有的子元素都被移除
                while (elem.firstChild) {
                    elem.removeChild(elem.firstChild);
                }
            }

            return this;
        },
        /**
         *  用于创建匹配元素集合的深度复制副本。
         * @param dataAndEvents 可选的布尔值，指示是否复制数据和事件，如果参数是true，则吧原始元素关联的数据和事件复制到副本元素上，默认不会复制
         * @param deepDataAndEvents 可选的布尔值，指示是否深度复制数据和事件。
         * @returns {*}
         */
        clone: function (dataAndEvents, deepDataAndEvents) {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

            return this.map(function () {
                return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
            });
        },
        //返回或设置HTML内容
        html: function (value) {
            //如果没有传入参数，则读取第一个匹配元素的HTML内容。
            if (value === undefined) {
                return this[0] && this[0].nodeType === 1 ?
                    this[0].innerHTML.replace(rinlinejQuery, "") :
                    null;

                // See if we can take a shortcut and just use innerHTML
                //参数value必须满足以下条件，才会被认为不需要修正，才会尝试直接设置属性innerHTML
                //参数value是HTML代码，HTML中不含有script标签和style标签，浏览器不会忽略前导空白符或者HTML代码不以空白符开头，HTML代码中的标签不需要包裹父标签就可以正确的被序列化
            } else if (typeof value === "string" && !rnoInnerhtml.test(value) &&
                (jQuery.support.leadingWhitespace || !rleadingWhitespace.test(value)) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {

                value = value.replace(rxhtmlTag, "<$1></$2>");

                try {
                    for (var i = 0, l = this.length; i < l; i++) {
                        // Remove element nodes and prevent memory leaks
                        if (this[i].nodeType === 1) {
                            //移除所有子元素关联的数据和事件
                            jQuery.cleanData(this[i].getElementsByTagName("*"));
                            this[i].innerHTML = value;
                        }
                    }

                    // If using innerHTML throws an exception, use the fallback method
                } catch (e) {
                    //empty()移除后代元素关联的数据和事件，移除子元素，然后调用方法.append()插入HTML内容
                    this.empty().append(value);
                }

            } else if (jQuery.isFunction(value)) {
                this.each(function (i) {
                    var self = jQuery(this);

                    self.html(value.call(this, i, self.html()));
                });

            } else {
                this.empty().append(value);
            }

            return this;
        },
        /**
         * 使用提供的新内容来替换元素集合中的每个元素。
         * @param value
         * @returns {*}
         */
        replaceWith: function (value) {
            if (this[0] && this[0].parentNode) {
                // Make sure that the elements are removed from the DOM before they are inserted
                // this can help fix replacing a parent with child elements
                if (jQuery.isFunction(value)) {
                    return this.each(function (i) {
                        var self = jQuery(this), old = self.html();
                        self.replaceWith(value.call(this, i, old));
                    });
                }
                //如果参数不是字符串的情况下，即可能是DOM元素或者jQuery对象，先调用方法.detach()把参数value从文档中移除，但是会保留关联的数据和事件
                if (typeof value !== "string") {
                    value = jQuery(value).detach();
                }
                //移除匹配元素，插入新内容
                return this.each(function () {
                    var next = this.nextSibling,
                        parent = this.parentNode;

                    jQuery(this).remove();

                    if (next) {
                        jQuery(next).before(value);
                    } else {
                        jQuery(parent).append(value);
                    }
                });
            } else {
                //第一个匹配元素没有父元素的情况下
                return this.length ?
                    this.pushStack(jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value) :
                    this;
            }
        },
        //用于从文档中移除匹配元素集合，但是会保留后代元素和匹配元素关联的数据和事件，常用于移除的元素稍后再次插入文档的场景
        detach: function (selector) {
            return this.remove(selector, true);
        },

        /**
         * 是jQuery插入元素实现的核心，负责转换HTML代码为DOM元素，然后调用传入的回调函数插入DOM元素。
         * @param args 含有待插入内容的数组，内容可以是DOM元素，HTML代码，函数或者jQuery对象
         * @param table 布尔值，指示是否需要修正tbody元素
         * @param callback 实际执行插入操作的回调函数
         * @returns {*}
         */
        domManip: function (args, table, callback) {
            var results, first, fragment, parent,
                value = args[0],
                scripts = [];

            // We can't cloneNode fragments that contain checked, in WebKit
            //复制文档片段会丢失其中复选框和单选按钮的选中状态checked的情况
            if (!jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test(value)) {
                return this.each(function () {
                    jQuery(this).domManip(args, table, callback, true);
                });
            }
            //参数args中的元素是函数的情况
            if (jQuery.isFunction(value)) {
                return this.each(function (i) {
                    var self = jQuery(this);
                    args[0] = value.call(this, i, table ? self.html() : undefined);
                    self.domManip(args, table, callback);
                });
            }
            //转换HTML代码为DOM元素
            if (this[0]) {
                parent = value && value.parentNode;

                // If we're in a fragment, just use that instead of building a new one
                if (jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length) {
                    results = {fragment: parent};

                } else {
                    results = jQuery.buildFragment(args, this, scripts);
                }

                fragment = results.fragment;

                if (fragment.childNodes.length === 1) {
                    first = fragment = fragment.firstChild;
                } else {
                    first = fragment.firstChild;
                }
                //执行回调函数插入元素
                if (first) {
                    table = table && jQuery.nodeName(first, "tr");
                    //遍历匹配元素集合，在每个元素上执行回调函数插入元素
                    for (var i = 0, l = this.length, lastIndex = l - 1; i < l; i++) {
                        callback.call(
                            table ?
                                root(this[i], first) :
                                this[i],
                            // Make sure that we do not leak memory by inadvertently discarding
                            // the original fragment (which might have attached data) instead of
                            // using it; in addition, use the original fragment object for the last
                            // item instead of first because it can end up being emptied incorrectly
                            // in certain situations (Bug #8070).
                            // Fragments from the fragment cache must always be cloned and never used
                            // in place.
                            results.cacheable || ( l > 1 && i < lastIndex ) ?
                                jQuery.clone(fragment, true, true) :
                                fragment
                        );
                    }
                }
                //执行转换后的DOM元素中的script元素
                if (scripts.length) {
                    jQuery.each(scripts, evalScript);
                }
            }

            return this;
        }
    });

    function root(elem, cur) {
        return jQuery.nodeName(elem, "table") ?
            (elem.getElementsByTagName("tbody")[0] ||
            elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
            elem;
    }

    function cloneCopyEvent(src, dest) {

        if (dest.nodeType !== 1 || !jQuery.hasData(src)) {
            return;
        }

        var type, i, l,
            oldData = jQuery._data(src),
            curData = jQuery._data(dest, oldData),
            events = oldData.events;

        if (events) {
            delete curData.handle;
            curData.events = {};

            for (type in events) {
                for (i = 0, l = events[type].length; i < l; i++) {
                    jQuery.event.add(dest, type + ( events[type][i].namespace ? "." : "" ) + events[type][i].namespace, events[type][i], events[type][i].data);
                }
            }
        }

        // make the cloned public data object a copy from the original
        if (curData.data) {
            curData.data = jQuery.extend({}, curData.data);
        }
    }

    /**
     * 用于修正副本元素的不兼容属性，并移除扩展属性jQuery.expando
     * @param src 原始元素
     * @param dest 副本元素
     */
    function cloneFixAttributes(src, dest) {
        var nodeName;

        // We do not need to do anything for non-Elements
        if (dest.nodeType !== 1) {
            return;
        }

        // clearAttributes removes the attributes, which we don't want,
        // but also removes the attachEvent events, which we *do* want
        if (dest.clearAttributes) {
            dest.clearAttributes();
        }

        // mergeAttributes, in contrast(对比), only merges back on the
        // original(原始的) attributes, not the events
        if (dest.mergeAttributes) {
            dest.mergeAttributes(src);
        }

        nodeName = dest.nodeName.toLowerCase();

        // IE6-8 fail to clone children inside object elements that use
        // the proprietary classid attribute value (rather than the type
        // attribute) to identify the type of content to display
        //修正objec元素的属性outerHTML
        if (nodeName === "object") {
            dest.outerHTML = src.outerHTML;
            //修正复选框和单选按钮的属性
        } else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
            // IE6-8 fails to persist the checked state of a cloned checkbox
            // or radio button. Worse, IE6-7 fail to give the cloned element
            // a checked appearance if the defaultChecked value isn't also set
            if (src.checked) {
                dest.defaultChecked = dest.checked = src.checked;
            }

            // IE6-7 get confused and end up setting the value of a cloned
            // checkbox/radio button to an empty string instead of "on"
            if (dest.value !== src.value) {
                dest.value = src.value;
            }

            // IE6-8 fails to return the selected option to the default selected
            // state when cloning options
            //修正option的属性selected
        } else if (nodeName === "option") {
            dest.selected = src.defaultSelected;

            // IE6-8 fails to set the defaultValue to the correct value when
            // cloning other types of input fields
            //修正input和textarea元素的属性defaultValue
        } else if (nodeName === "input" || nodeName === "textarea") {
            dest.defaultValue = src.defaultValue;
        }

        // Event data gets referenced instead of copied if the expando
        // gets copied too
        //移除扩展属性jQuery.expando
        dest.removeAttribute(jQuery.expando);
    }

    /**
     * 先创建一个文档片段DocumentFragment,然后调用方法jquery.clean()将HTML代码转换为DOM元素，并存储在创建的文档片段中。
     * @param args 数组，含有待转换的DOM元素的HTML代码
     * @param nodes 数组，含有文档对象，jquery对象或DOM元素，用于修正创建文档片段DocumentFragment的文档对象。
     * @param scripts 数组，用于存放HTML代码中的script元素。
     * @returns {{fragment: *, cacheable: *}}
     */
    jQuery.buildFragment = function (args, nodes, scripts) {
        //fragment可能指向稍后创建的文档片段Document Fragment
        var fragment, cacheable, cacheresults, doc,
            first = args[0];
        //doc表示创建文档片段的文档对象，修正doc
        // nodes may contain either an explicit(明确的) document object,
        // a jQuery collection or context object.
        // If nodes[0] contains a valid object to assign(指定) to doc
        if (nodes && nodes[0]) {
            doc = nodes[0].ownerDocument || nodes[0];
        }
        //如果调用jquery构造函数时传入的第二个参数是javascript对象，此时doc是传入的javascript对象而不是文档对象。
        //eg：传入的是$('<div></div>',{'class':'test'})；这时doc就是{'class','test'}，就需要进行下面的判断
        // Ensure that an attr object doesn't incorrectly stand in as a document object
        // Chrome and Firefox seem to allow this to occur and will throw exception
        // Fixes #8950
        if (!doc.createDocumentFragment) {
            doc = document;
        }

        // Only cache "small" (1/2 KB) HTML strings that are associated with the main document
        // Cloning options loses the selected state, so don't cache them
        // IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
        // Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
        // Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
        if (args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
            first.charAt(0) === "<" && !rnocache.test(first) &&
            (jQuery.support.checkClone || !rchecked.test(first)) &&
            (jQuery.support.html5Clone || !rnoshimcache.test(first))) {
            //此状态表示，在使用转换后的DOM元素时，如果cacheable为true，则必须先复制一份在使用，否则可以直接使用
            cacheable = true;

            cacheresults = jQuery.fragments[first];
            if (cacheresults && cacheresults !== 1) {
                fragment = cacheresults;
            }
        }
        //转换HTML代码为DOM元素  ！fragment为true可能有三种情况：1.HTML不符合缓存条件，2.符合缓存条件，但是此时是第一次转换，
        //不存在对应的缓存，3.代码符合缓存条件，此时是第二次转换，对应缓存值是1
        if (!fragment) {
            fragment = doc.createDocumentFragment();
            jQuery.clean(args, doc, fragment, scripts);
        }
        //如果HTML代码满足缓存条件，则将其缓存至jquery.fragments中；
        //第一次转换后设置缓存值为1，第二次转换后设置为文档片段，从第三次开始则从缓存中读取。
        if (cacheable) {
            jQuery.fragments[first] = cacheresults ? fragment : 1;
        }
        //最后返回了文档片段和缓存状态cacheable的对象
        return {fragment: fragment, cacheable: cacheable};
    };

    jQuery.fragments = {};


    jQuery.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function (name, original) {
        jQuery.fn[name] = function (selector) {
            var ret = [],
                insert = jQuery(selector),
                parent = this.length === 1 && this[0].parentNode;

            if (parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1) {
                insert[original](this[0]);
                return this;

            } else {
                for (var i = 0, l = insert.length; i < l; i++) {
                    var elems = ( i > 0 ? this.clone(true) : this ).get();
                    jQuery(insert[i])[original](elems);
                    ret = ret.concat(elems);
                }

                return this.pushStack(ret, name, insert.selector);
            }
        };
    });

    function getAll(elem) {
        if (typeof elem.getElementsByTagName !== "undefined") {
            return elem.getElementsByTagName("*");

        } else if (typeof elem.querySelectorAll !== "undefined") {
            return elem.querySelectorAll("*");

        } else {
            return [];
        }
    }

// Used in clean, fixes the defaultChecked property
    function fixDefaultChecked(elem) {
        if (elem.type === "checkbox" || elem.type === "radio") {
            elem.defaultChecked = elem.checked;
        }
    }

// Finds all inputs and passes them to fixDefaultChecked
    function findInputs(elem) {
        var nodeName = ( elem.nodeName || "" ).toLowerCase();
        if (nodeName === "input") {
            fixDefaultChecked(elem);
            // Skip scripts, get other children
        } else if (nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined") {
            jQuery.grep(elem.getElementsByTagName("input"), fixDefaultChecked);
        }
    }

// Derived From: http://www.iecss.com/shimprove/javascript/shimprove.1-0-1.js
    function shimCloneNode(elem) {
        var div = document.createElement("div");
        safeFragment.appendChild(div);

        div.innerHTML = elem.outerHTML;
        return div.firstChild;
    }

    jQuery.extend({
        /**
         * 用于复制DOM元素，并修正不兼容属性.
         * @param elem 被复制的原始元素
         * @param dataAndEvents 如果为true，则复制数据和事件
         * @param deepDataAndEvents 如果为true，则复制后代元素的数据和事件
         * @returns {Node}
         */
        clone: function (elem, dataAndEvents, deepDataAndEvents) {
            var srcElements,//用于存放原始元素的后代元素集合
                destElements, //用于存放副本元素的后代元素集合
                i,
                // IE<=8 does not properly clone detached, unknown element nodes
                clone = jQuery.support.html5Clone || !rnoshimcache.test("<" + elem.nodeName) ?
                    elem.cloneNode(true) :
                    shimCloneNode(elem);
            //修正副本元素的不兼容属性
            if ((!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
                (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
                // IE copies events bound via attachEvent when using cloneNode.
                // Calling detachEvent on the clone will also remove the events
                // from the original. In order to get around this, we use some
                // proprietary methods to clear the events. Thanks to MooTools
                // guys for this hotness.

                cloneFixAttributes(elem, clone);

                // Using Sizzle here is crazy slow, so we use getElementsByTagName instead
                srcElements = getAll(elem);
                destElements = getAll(clone);

                // Weird iteration because IE will replace the length property
                // with an element if you are cloning the body and one of the
                // elements on the page has a name or id of "length"
                for (i = 0; srcElements[i]; ++i) {
                    // Ensure that the destination node is not null; Fixes #9587
                    if (destElements[i]) {
                        cloneFixAttributes(srcElements[i], destElements[i]);
                    }
                }
            }

            // Copy the events from the original to the clone
            //复制数据和事件
            if (dataAndEvents) {
                cloneCopyEvent(elem, clone);

                if (deepDataAndEvents) {
                    srcElements = getAll(elem);
                    destElements = getAll(clone);

                    for (i = 0; srcElements[i]; ++i) {
                        cloneCopyEvent(srcElements[i], destElements[i]);
                    }
                }
            }
            //避免内存泄漏
            srcElements = destElements = null;

            // Return the cloned set
            return clone;
        },
        //elems:数组，包含了待转换的HTML代码；
        //context：文档对象，该参数在方法jquery.buildFragment()中被修正为正确的doc对象
        //fragment：文档片段，作为存放转换后的DOM元素的占位符。
        //scripts：数组，用于存放转换后的DOM元素中的script元素
        clean: function (elems, context, fragment, scripts) {
            var checkScriptType;

            context = context || document;

            // !context.createElement fails in IE with an error but returns typeof 'object'
            if (typeof context.createElement === "undefined") {
                //ownerDocument表示了DOM元素所在的文档对象
                context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
            }

            var ret = [], j;
            //遍历待转换的HTML代码数组elems
            //使用！=可以同时过滤null和undefined,但是又不会过滤掉0
            for (var i = 0, elem; (elem = elems[i]) != null; i++) {
                //如果elem是一个数值型，可以让elem加一个空字符串，吧elem转换为字符串
                if (typeof elem === "number") {
                    elem += "";
                }
                //过滤空字符串
                if (!elem) {
                    continue;
                }

                // Convert html string into DOM nodes
                if (typeof elem === "string") {
                    //HTML代码中不包含标签，字符代码和数字代码
                    if (!rhtml.test(elem)) {
                        elem = context.createTextNode(elem);
                    } else {
                        // Fix "XHTML"-style tags in all browsers ==>修正自关闭标签
                        elem = elem.replace(rxhtmlTag, "<$1></$2>");

                        // Trim whitespace, otherwise indexOf won't work as expected
                        //提取HTML代码中的标签部分，删除了前导空白符和左尖括号，并转换为小写赋值给变量wrap。
                        var tag = ( rtagName.exec(elem) || ["", ""] )[1].toLowerCase(),
                            wrap = wrapMap[tag] || wrapMap._default,
                            depth = wrap[0],
                            div = context.createElement("div");

                        // Append wrapper element to unknown element safe doc fragment
                        if (context === document) {
                            // Use the fragment we've already created for this document
                            safeFragment.appendChild(div);
                        } else {
                            // Use a fragment created with the owner document
                            createSafeFragment(context).appendChild(div);
                        }

                        // Go to html and back, then peel off extra wrappers
                        div.innerHTML = wrap[1] + elem + wrap[2];

                        // Move to the right depth
                        //层层剥去包裹的父元素
                        while (depth--) {
                            div = div.lastChild;
                        }

                        // Remove IE's autoinserted <tbody> from table fragments
                        if (!jQuery.support.tbody) {

                            // String was a <table>, *may* have spurious(欺骗的) <tbody>
                            //rtbody用正则检查HTML代码中是否含有tbody标签
                            var hasBody = rtbody.test(elem),
                                tbody = tag === "table" && !hasBody ?
                                    //表示HTML代码中有table标签，但是没有tbody标签
                                div.firstChild && div.firstChild.childNodes :

                                    // String was a bare <thead> or <tfoot>
                                    wrap[1] === "<table>" && !hasBody ?
                                        div.childNodes :
                                        //HTML代码中含有tbody标签
                                        [];

                            for (j = tbody.length - 1; j >= 0; --j) {
                                if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length) {
                                    tbody[j].parentNode.removeChild(tbody[j]);
                                }
                            }
                        }
                        //插入IE6/7/8自动剔除的前导空白符
                        // IE completely kills leading whitespace when innerHTML is used
                        //rleadingWhitespace==>检测HTML代码中是否含有前导空白符
                        if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem)) {
                            div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild);
                        }
                        //取到转换后的DOM元素集合
                        elem = div.childNodes;
                    }
                }

                // Resets defaultChecked for any radios and checkboxes
                // about to be appended to the DOM in IE 6/7 (#8060)
                var len;
                if (!jQuery.support.appendChecked) {
                    if (elem[0] && typeof (len = elem.length) === "number") {
                        for (j = 0; j < len; j++) {
                            findInputs(elem[j]);
                        }
                    } else {
                        findInputs(elem);
                    }
                }

                if (elem.nodeType) {
                    ret.push(elem);
                } else {
                    ret = jQuery.merge(ret, elem);
                }
            }

            if (fragment) {
                checkScriptType = function (elem) {
                    //检测script元素有无指定type
                    return !elem.type || rscriptType.test(elem.type);
                };
                for (i = 0; ret[i]; i++) {
                    if (scripts && jQuery.nodeName(ret[i], "script") && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript")) {
                        scripts.push(ret[i].parentNode ? ret[i].parentNode.removeChild(ret[i]) : ret[i]);

                    } else {
                        if (ret[i].nodeType === 1) {
                            var jsTags = jQuery.grep(ret[i].getElementsByTagName("script"), checkScriptType);

                            ret.splice.apply(ret, [i + 1, 0].concat(jsTags));
                        }
                        fragment.appendChild(ret[i]);
                    }
                }
            }

            return ret;
        },
        /**
         *
         * 1.移除DOM元素上绑定的所有类型的事件
         * 2.移除DOM元素上扩展的jQuery.expando属性
         * 3.删除DOM元素关联的数据缓存对象jQuery.cache[id]
         * @param elems
         */
        cleanData: function (elems) {
            var data, id,
                cache = jQuery.cache,
                special = jQuery.event.special,
                deleteExpando = jQuery.support.deleteExpando;

            for (var i = 0, elem; (elem = elems[i]) != null; i++) {
                //如果不支持设置数据，则跳过本次循环
                if (elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()]) {
                    continue;
                }

                id = elem[jQuery.expando];

                if (id) {
                    //取出关联的数据缓存对象
                    data = cache[id];
                    //在该元素上绑定过事件，移除该元素上的所有事件
                    if (data && data.events) {
                        for (var type in data.events) {
                            if (special[type]) {
                                jQuery.event.remove(elem, type);//移除所有事件监听函数

                                // This is a shortcut to avoid jQuery.event.remove's overhead
                            } else {
                                jQuery.removeEvent(elem, type, data.handle);//移除主事件监听函数data.handle
                            }
                        }

                        // Null the DOM reference to avoid IE6/7/8 leak (#7054)
                        if (data.handle) {
                            data.handle.elem = null;//jQuery.removeEvent()并不会删除事件缓存对象data.events和data.handle，需要手动移除对该DOM元素的引用
                        }
                    }
                    //支持删除DOM元素上的扩展属性
                    if (deleteExpando) {
                        delete elem[jQuery.expando];
                        //
                    } else if (elem.removeAttribute) {
                        elem.removeAttribute(jQuery.expando);
                    }
                    //最后删除DOM元素关联的数据缓存对象jQuery.cache[id];
                    delete cache[id];
                }
            }
        }
    });
    //负责手动加载和执行script元素
    function evalScript(i, elem) {
        if (elem.src) {
            jQuery.ajax({
                url: elem.src,
                async: false,
                dataType: "script"
            });
        } else {
            jQuery.globalEval(( elem.text || elem.textContent || elem.innerHTML || "" ).replace(rcleanScript, "/*$0*/"));
        }

        if (elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }
    }


    var ralpha = /alpha\([^)]*\)/i,//匹配alpha(XXX)，不区分大小写
        ropacity = /opacity=([^)]*)/,  //匹配opacity=(XXX)
        // fixed for IE9, see #8346
        rupper = /([A-Z]|^ms)/g,
        rnumpx = /^-?\d+(?:px)?$/i,
        rnum = /^-?\d/,
        rrelNum = /^([\-+])=([\-+.\de]+)/,

        cssShow = {position: "absolute", visibility: "hidden", display: "block"},
        cssWidth = ["Left", "Right"],
        cssHeight = ["Top", "Bottom"],
        curCSS,

        getComputedStyle,
        currentStyle;
    //内联样式，计算样式
    jQuery.fn.css = function (name, value) {
        // Setting 'undefined' is a no-op
        if (arguments.length === 2 && value === undefined) {
            return this;
        }

        return jQuery.access(this, name, value, true, function (elem, name, value) {
            return value !== undefined ?
                jQuery.style(elem, name, value) :
                jQuery.css(elem, name);
        });
    };

    jQuery.extend({
        // Add in style property hooks for overriding the default
        // behavior of getting and setting a style property
        //样式修正对象集
        cssHooks: {
            opacity: {
                get: function (elem, computed) {
                    if (computed) {
                        // We should always get a number back from opacity
                        var ret = curCSS(elem, "opacity", "opacity");
                        return ret === "" ? "1" : ret;

                    } else {
                        return elem.style.opacity;
                    }
                }
            }
        },

        // Exclude the following css properties to add px
        //无单位的数值型样式
        cssNumber: {
            "fillOpacity": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
        },

        // Add in properties whose names you wish to fix before
        // setting or getting the value
        //样式名修正
        cssProps: {
            // normalize float css property
            "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
        },

        // Get and set the style property on a DOM Node
        //读取或设置内联样式
        style: function (elem, name, value, extra) {
            // Don't set styles on text and comment nodes
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
                return;
            }

            // Make sure that we're working with the right name
            var ret, type, origName = jQuery.camelCase(name),
                style = elem.style, hooks = jQuery.cssHooks[origName];//hooks指向驼峰式样式名对应的修正对象

            name = jQuery.cssProps[origName] || origName;

            // Check if we're setting a value
            if (value !== undefined) {
                type = typeof value;

                // convert relative number strings (+= or -=) to relative numbers. #7345
                //计算相对值的公式是 ：+1或-1乘以相对值，再加上当前值，从而得出要设置的值
                if (type === "string" && (ret = rrelNum.exec(value))) {
                    value = ( +( ret[1] + 1) * +ret[2] ) + parseFloat(jQuery.css(elem, name));
                    // Fixes bug #9237
                    type = "number";
                }

                // Make sure that NaN and null values aren't set. See: #7116
                if (value == null || type === "number" && isNaN(value)) {
                    return;
                }

                // If a number was passed in, add 'px' to the (except for certain CSS properties)
                if (type === "number" && !jQuery.cssNumber[origName]) {
                    value += "px";
                }

                // If a hook was provided, use that value, otherwise just set the specified value
                //
                if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value)) !== undefined) {
                    // Wrapped to prevent IE from throwing errors when 'invalid' values are provided
                    // Fixes bug #5509
                    try {
                        style[name] = value;
                    } catch (e) {
                    }
                }

            } else {
                // If a hook was provided get the non-computed value from there
                //未传入参数value,则读取内联样式
                if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
                    return ret;
                }

                // Otherwise just get the value from the style object
                return style[name];
            }
        },
        //读取计算样式,负责读取DOM元素的计算样式。
        css: function (elem, name, extra) {
            var ret, hooks;

            // Make sure that we're working with the right name
            name = jQuery.camelCase(name);
            hooks = jQuery.cssHooks[name];
            name = jQuery.cssProps[name] || name;

            // cssFloat needs a special treatment
            if (name === "cssFloat") {
                name = "float";
            }

            // If a hook was provided get the computed value from there
            //优先调用修正对象的修正方法 get()
            if (hooks && "get" in hooks && (ret = hooks.get(elem, true, extra)) !== undefined) {
                return ret;

                // Otherwise, if a way to get the computed value exists, use that
            } else if (curCSS) {
                return curCSS(elem, name);
            }
        },

        // A method for quickly swapping in/out CSS properties to get correct calculations
        //快速换进换出样式
        swap: function (elem, options, callback) {
            var old = {};

            // Remember the old values, and insert the new ones
            for (var name in options) {
                old[name] = elem.style[name];
                elem.style[name] = options[name];
            }

            callback.call(elem);

            // Revert the old values
            for (name in options) {
                elem.style[name] = old[name];
            }
        }
    });

// DEPRECATED, Use jQuery.css() instead
    jQuery.curCSS = jQuery.css;
    //覆盖样式height,width的默认读取和设置行为
    jQuery.each(["height", "width"], function (i, name) {
        jQuery.cssHooks[name] = {
            get: function (elem, computed, extra) {
                var val;

                if (computed) {
                    if (elem.offsetWidth !== 0) {
                        return getWH(elem, name, extra);
                    } else {
                        jQuery.swap(elem, cssShow, function () {
                            val = getWH(elem, name, extra);
                        });
                    }

                    return val;
                }
            },

            set: function (elem, value) {
                if (rnumpx.test(value)) {
                    // ignore negative width and height values #1599
                    value = parseFloat(value);

                    if (value >= 0) {
                        return value + "px";
                    }

                } else {
                    return value;
                }
            }
        };
    });
    //覆盖样式opacity的默认读取和设置行为
    if (!jQuery.support.opacity) {
        jQuery.cssHooks.opacity = {
            get: function (elem, computed) {
                // IE uses filters for opacity
                //ropacity:用于检测滤镜中是否设置了透明度
                return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ?
                ( parseFloat(RegExp.$1) / 100 ) + "" :
                    computed ? "1" : "";
            },
            //用于覆盖样式opacity的默认设置行为
            set: function (elem, value) {
                var style = elem.style,
                    currentStyle = elem.currentStyle,
                    opacity = jQuery.isNumeric(value) ? "alpha(opacity=" + value * 100 + ")" : "",
                    filter = currentStyle && currentStyle.filter || style.filter || "";

                // IE has trouble with opacity if it does not have layout
                // Force it by setting the zoom level
                style.zoom = 1;

                // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
                if (value >= 1 && jQuery.trim(filter.replace(ralpha, "")) === "") {

                    // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
                    // if "filter:" is present at all, clearType is disabled, we want to avoid this
                    // style.removeAttribute is IE Only, but so apparently is this code path...
                    style.removeAttribute("filter");

                    // if there there is no filter style applied in a css rule, we are done
                    if (currentStyle && !currentStyle.filter) {
                        return;
                    }
                }

                // otherwise, set new filter values
                style.filter = ralpha.test(filter) ?
                    filter.replace(ralpha, opacity) :
                filter + " " + opacity;
            }
        };
    }
    //覆盖样式marginRight的默认读取行为
    jQuery(function () {
        // This hook cannot be added until DOM ready because the support test
        // for it is not run until after DOM ready
        if (!jQuery.support.reliableMarginRight) {
            jQuery.cssHooks.marginRight = {
                get: function (elem, computed) {
                    // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                    // Work around by temporarily setting element display to inline-block
                    var ret;
                    //临时设置元素的display为"inline-block"来返回正确的marginRight;
                    jQuery.swap(elem, {"display": "inline-block"}, function () {
                        if (computed) {
                            ret = curCSS(elem, "margin-right", "marginRight");
                        } else {
                            ret = elem.style.marginRight;
                        }
                    });
                    return ret;
                }
            };
        }
    });
    //读取计算样式
    if (document.defaultView && document.defaultView.getComputedStyle) {
        //
        getComputedStyle = function (elem, name) {
            var ret, defaultView, computedStyle;

            name = name.replace(rupper, "-$1").toLowerCase();

            if ((defaultView = elem.ownerDocument.defaultView) &&
                (computedStyle = defaultView.getComputedStyle(elem, null))) {
                ret = computedStyle.getPropertyValue(name);
                if (ret === "" && !jQuery.contains(elem.ownerDocument.documentElement, elem)) {
                    ret = jQuery.style(elem, name);
                }
            }

            return ret;
        };
    }

    if (document.documentElement.currentStyle) {
        currentStyle = function (elem, name) {
            var left, rsLeft, uncomputed,
                ret = elem.currentStyle && elem.currentStyle[name],
                style = elem.style;

            // Avoid setting ret to empty string here
            // so we don't default to auto
            if (ret === null && style && (uncomputed = style[name])) {
                ret = uncomputed;
            }

            // From the awesome hack by Dean Edwards
            // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

            // If we're not dealing with a regular pixel number
            // but a number that has a weird ending, we need to convert it to pixels
            if (!rnumpx.test(ret) && rnum.test(ret)) {

                // Remember the original values
                left = style.left;
                rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

                // Put in the new values to get a computed value out
                if (rsLeft) {
                    elem.runtimeStyle.left = elem.currentStyle.left;
                }
                style.left = name === "fontSize" ? "1em" : ( ret || 0 );
                ret = style.pixelLeft + "px";

                // Revert the changed values
                style.left = left;
                if (rsLeft) {
                    elem.runtimeStyle.left = rsLeft;
                }
            }

            return ret === "" ? "auto" : ret;
        };
    }
    //负责读取DOM元素的计算样式
    curCSS = getComputedStyle || currentStyle;
    //获取内容的高度，宽度，是一个工具函数，它为尺寸方法提供了基础功能；
    function getWH(elem, name, extra) {

        // Start with offset property
        var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            which = name === "width" ? cssWidth : cssHeight,
            i = 0,
            len = which.length;

        if (val > 0) {
            if (extra !== "border") {
                for (; i < len; i++) {
                    if (!extra) {
                        val -= parseFloat(jQuery.css(elem, "padding" + which[i])) || 0;
                    }
                    if (extra === "margin") {
                        val += parseFloat(jQuery.css(elem, extra + which[i])) || 0;
                    } else {
                        val -= parseFloat(jQuery.css(elem, "border" + which[i] + "Width")) || 0;
                    }
                }
            }

            return val + "px";
        }

        // Fall back to computed then uncomputed css if necessary
        val = curCSS(elem, name, name);
        if (val < 0 || val == null) {
            val = elem.style[name] || 0;
        }
        // Normalize "", auto, and prepare for extra
        val = parseFloat(val) || 0;

        // Add padding, border, margin
        if (extra) {
            for (; i < len; i++) {
                val += parseFloat(jQuery.css(elem, "padding" + which[i])) || 0;
                if (extra !== "padding") {
                    val += parseFloat(jQuery.css(elem, "border" + which[i] + "Width")) || 0;
                }
                if (extra === "margin") {
                    val += parseFloat(jQuery.css(elem, extra + which[i])) || 0;
                }
            }
        }

        return val + "px";
    }

    if (jQuery.expr && jQuery.expr.filters) {
        jQuery.expr.filters.hidden = function (elem) {
            var width = elem.offsetWidth,
                height = elem.offsetHeight;

            return ( width === 0 && height === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css(elem, "display")) === "none");
        };

        jQuery.expr.filters.visible = function (elem) {
            return !jQuery.expr.filters.hidden(elem);
        };
    }


    var r20 = /%20/g,
        rbracket = /\[\]$/,
        rCRLF = /\r?\n/g,
        rhash = /#.*$/,
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
        rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
        // #7653, #8125, #8152: local protocol detection
        rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
        rnoContent = /^(?:GET|HEAD)$/,
        rprotocol = /^\/\//,
        rquery = /\?/,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        rselectTextarea = /^(?:select|textarea)/i,
        rspacesAjax = /\s+/,
        rts = /([?&])_=[^&]*/,
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

        // Keep a copy of the old load method
        _load = jQuery.fn.load,

        /* Prefilters
         * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
         * 2) These are called:
         *    - BEFORE asking for a transport
         *    - AFTER param serialization (s.data is a string if s.processData is true)
         * 3) key is the dataType
         * 4) the catchall symbol "*" can be used
         * 5) execution will start with transport dataType and THEN continue down to "*" if needed
         */
        prefilters = {},

        /* Transports bindings
         * 1) key is the dataType
         * 2) the catchall symbol "*" can be used
         * 3) selection will start with transport dataType and THEN go to "*" if needed
         */
        transports = {},//请求发送器工厂函数集，其结构为数据类型与请求发送器工厂函数的映射

        // Document location
        ajaxLocation,

        // Document location segments
        ajaxLocParts,

        // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
        allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
    try {
        ajaxLocation = location.href;
    } catch (e) {
        // Use the href attribute of an A element
        // since IE will modify it given document.location
        ajaxLocation = document.createElement("a");
        ajaxLocation.href = "";
        ajaxLocation = ajaxLocation.href;
    }

// Segment location into parts
    ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
    function addToPrefiltersOrTransports(structure) {

        // dataTypeExpression is optional and defaults to "*"
        /**
         * dataTypeExpression : 字符串，可选的，表示一个或多个空格分隔的数据类型
         * func ： 表示数据类型对应的前置过滤器或请求发送器工厂函数
         */
        return function (dataTypeExpression, func) {

            if (typeof dataTypeExpression !== "string") {
                func = dataTypeExpression;
                dataTypeExpression = "*";
            }

            if (jQuery.isFunction(func)) {
                var dataTypes = dataTypeExpression.toLowerCase().split(rspacesAjax),
                    i = 0,
                    length = dataTypes.length,
                    dataType,
                    list,
                    placeBefore;

                // For each dataType in the dataTypeExpression
                for (; i < length; i++) {
                    dataType = dataTypes[i];
                    // We control if we're asked to add before
                    // any existing element
                    placeBefore = /^\+/.test(dataType);
                    if (placeBefore) {
                        dataType = dataType.substr(1) || "*";
                    }
                    list = structure[dataType] = structure[dataType] || [];
                    // then we add to the structure accordingly
                    list[placeBefore ? "unshift" : "push"](func);
                }
            }
        };
    }

// Base inspection function for prefilters and transports
    //负责应用前置过滤器或获取请求发送器
    /**
     *
     * @param structure 指向前置过滤器集prefilters或请求发送器工厂函数集transports,其值取决于调用该函数时传入的值
     * @param options 当前请求的完整选项集
     * @param originalOptions 传给方法jQuery.ajax(url,options)的原始选项集
     * @param jqXHR
     * @param dataType
     * @param inspected 存放已经执行过的数据类型的对象，仅在递归调用该函数时被传入
     * @returns {*}
     */
    function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR,
                                           dataType /* internal */, inspected /* internal */) {

        dataType = dataType || options.dataTypes[0];
        inspected = inspected || {};

        inspected[dataType] = true;

        var list = structure[dataType],
            i = 0,
            length = list ? list.length : 0,
            executeOnly = ( structure === prefilters ),
            selection;
        //遍历执行数组中的函数
        for (; i < length && ( executeOnly || !selection ); i++) {
            selection = list[i](options, originalOptions, jqXHR);
            // If we got redirected to another dataType
            // we try there if executing only and not done already
            if (typeof selection === "string") {
                if (!executeOnly || inspected[selection]) {//应用前置过滤器，并且重定向的数据类型也已经处理过。
                    selection = undefined;
                } else {//如果是获取请求发送器
                    options.dataTypes.unshift(selection);
                    selection = inspectPrefiltersOrTransports(
                        structure, options, originalOptions, jqXHR, selection, inspected);
                }
            }
        }
        // If we're only executing or nothing was selected
        // we try the catchall dataType if not done already
        //为当前请求应用通配符*对应的前置过滤器，或者在未找到请求发送器的情况下获取通配符*对应的请求发送器
        if (( executeOnly || !selection ) && !inspected["*"]) {
            selection = inspectPrefiltersOrTransports(
                structure, options, originalOptions, jqXHR, "*", inspected);
        }
        // unnecessary when only executing (prefilters)
        // but it'll be ignored by the caller in that case
        return selection;
    }

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
    //负责将源对象src中的属性深度合并到目标对象target中
    function ajaxExtend(target, src) {
        var key, deep,
            flatOptions = jQuery.ajaxSettings.flatOptions || {};
        for (key in src) {
            if (src[key] !== undefined) {
                ( flatOptions[key] ? target : ( deep || ( deep = {} ) ) )[key] = src[key];
            }
        }
        if (deep) {
            jQuery.extend(true, target, deep);
        }
    }

    jQuery.fn.extend({
        //负责从服务端加载数据，并将返回的HTML插入匹配元素中
        load: function (url, params, callback) {
            if (typeof url !== "string" && _load) {
                return _load.apply(this, arguments);

                // Don't do a request if no elements are being requested
            } else if (!this.length) {
                return this;
            }

            var off = url.indexOf(" ");
            if (off >= 0) {
                var selector = url.slice(off, url.length);
                url = url.slice(0, off);
            }

            // Default to a GET request
            var type = "GET";

            // If the second parameter was provided
            if (params) {
                // If it's a function
                if (jQuery.isFunction(params)) {
                    // We assume that it's the callback
                    callback = params;
                    params = undefined;

                    // Otherwise, build a param string
                } else if (typeof params === "object") {
                    params = jQuery.param(params, jQuery.ajaxSettings.traditional);
                    type = "POST";
                }
            }

            var self = this;

            // Request the remote document
            jQuery.ajax({
                url: url,
                type: type,
                dataType: "html",
                data: params,
                // Complete callback (responseText is used internally)
                complete: function (jqXHR, status, responseText) {
                    // Store the response as specified by the jqXHR object
                    responseText = jqXHR.responseText;
                    // If successful, inject the HTML into all the matched elements
                    if (jqXHR.isResolved()) {
                        // #4825: Get the actual response in case
                        // a dataFilter is present in ajaxSettings
                        jqXHR.done(function (r) {
                            responseText = r;
                        });
                        // See if a selector was specified
                        self.html(selector ?
                            // Create a dummy div to hold the results
                            jQuery("<div>")
                            // inject the contents of the document in, removing the scripts
                            // to avoid any 'Permission Denied' errors in IE
                                .append(responseText.replace(rscript, ""))

                                // Locate the specified elements
                                .find(selector) :

                            // If not, just inject the full result
                            responseText);
                    }

                    if (callback) {
                        self.each(callback, [responseText, status, jqXHR]);
                    }
                }
            });

            return this;
        },
        //负责吧一组表单元素序列化为一段url查询串，用于表单提交。
        serialize: function () {
            return jQuery.param(this.serializeArray());
        },
        //负责把一组表单元素编码为一个对象数组，每个对象元素都含有属性name和value。
        serializeArray: function () {
            return this.map(function () {//获取form元素包含的表单元素
                return this.elements ? jQuery.makeArray(this.elements) : this;
            })
                .filter(function () {//过滤不应该编码的表单元素
                    return this.name && !this.disabled &&
                        ( this.checked || rselectTextarea.test(this.nodeName) ||
                        rinput.test(this.type) );
                })
                .map(function (i, elem) {//读取表单元素的属性name或者value。编码为对象数组
                    var val = jQuery(this).val();

                    return val == null ?
                        null :
                        jQuery.isArray(val) ?
                            jQuery.map(val, function (val, i) {
                                return {name: elem.name, value: val.replace(rCRLF, "\r\n")};
                            }) :
                        {name: elem.name, value: val.replace(rCRLF, "\r\n")};
                }).get();
        }
    });

// Attach a bunch of functions for handling common AJAX events
    jQuery.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function (i, o) {
        jQuery.fn[o] = function (f) {
            return this.on(o, f);
        };
    });

    jQuery.each(["get", "post"], function (i, method) {
        jQuery[method] = function (url, data, callback, type) {
            // shift arguments if data argument was omitted
            if (jQuery.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }

            return jQuery.ajax({
                type: method,
                url: url,
                data: data,
                success: callback,
                dataType: type
            });
        };
    });

    jQuery.extend({

        getScript: function (url, callback) {
            return jQuery.get(url, undefined, callback, "script");
        },

        getJSON: function (url, data, callback) {
            return jQuery.get(url, data, callback, "json");
        },

        // Creates a full fledged settings object into target
        // with both ajaxSettings and settings fields.
        // If target is omitted, writes into ajaxSettings.
        //为当前请求构造完整的请求选项集
        ajaxSetup: function (target, settings) {
            if (settings) {
                // Building a settings object
                ajaxExtend(target, jQuery.ajaxSettings);
            } else {
                // Extending ajaxSettings
                settings = target;
                target = jQuery.ajaxSettings;
            }
            ajaxExtend(target, settings);
            return target;
        },

        ajaxSettings: {
            url: ajaxLocation,
            isLocal: rlocalProtocol.test(ajaxLocParts[1]),
            global: true,
            type: "GET",
            contentType: "application/x-www-form-urlencoded",
            processData: true,
            async: true,
            /*
             timeout: 0,
             data: null,
             dataType: null,
             username: null,
             password: null,
             cache: null,
             traditional: false,
             headers: {},
             */

            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": allTypes
            },

            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },

            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },

            // List of data converters
            // 1) key format is "source_type destination_type" (a single space in-between)
            // 2) the catchall symbol "*" can be used for source_type
            converters: {

                // Convert anything to text
                "* text": window.String,

                // Text to html (true = no transformation)
                "text html": true,

                // Evaluate text as a json expression
                "text json": jQuery.parseJSON,

                // Parse text as xml
                "text xml": jQuery.parseXML
            },

            // For options that shouldn't be deep extended:
            // you can add your own custom options here if
            // and when you create one that shouldn't be
            // deep extended (see ajaxExtend)
            flatOptions: {
                context: true,
                url: true
            }
        },

        ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
        ajaxTransport: addToPrefiltersOrTransports(transports),

        // Main method
        ajax: function (url, options) {

            // If url is an object, simulate pre-1.5 signature
            if (typeof url === "object") {
                options = url;
                url = undefined;
            }

            // Force options to be an object
            options = options || {};

            var // Create the final options object
                s = jQuery.ajaxSetup({}, options),
                // Callbacks context
                callbackContext = s.context || s,
                // Context for global events
                // It's the callbackContext if one was provided in the options
                // and if it's a DOM node or a jQuery collection
                globalEventContext = callbackContext !== s &&
                ( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
                    jQuery(callbackContext) : jQuery.event,
                // Deferreds
                deferred = jQuery.Deferred(),
                completeDeferred = jQuery.Callbacks("once memory"),
                // Status-dependent callbacks
                statusCode = s.statusCode || {},
                // ifModified key
                ifModifiedKey,
                // Headers (they are sent all at once)
                requestHeaders = {},
                requestHeadersNames = {},
                // Response headers
                responseHeadersString,
                responseHeaders,
                // transport
                transport,
                // timeout handle
                timeoutTimer,
                // Cross-domain detection vars
                parts,
                // The jqXHR state
                state = 0,
                // To know if global events are to be dispatched
                fireGlobals,
                // Loop variable
                i,
                // Fake xhr
                jqXHR = {

                    readyState: 0,

                    // Caches the header
                    setRequestHeader: function (name, value) {
                        if (!state) {
                            var lname = name.toLowerCase();
                            name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                            requestHeaders[name] = value;
                        }
                        return this;
                    },

                    // Raw string
                    getAllResponseHeaders: function () {
                        return state === 2 ? responseHeadersString : null;
                    },

                    // Builds headers hashtable if needed
                    getResponseHeader: function (key) {
                        var match;
                        if (state === 2) {
                            if (!responseHeaders) {
                                responseHeaders = {};
                                while (( match = rheaders.exec(responseHeadersString) )) {
                                    responseHeaders[match[1].toLowerCase()] = match[2];
                                }
                            }
                            match = responseHeaders[key.toLowerCase()];
                        }
                        return match === undefined ? null : match;
                    },

                    // Overrides response content-type header
                    overrideMimeType: function (type) {
                        if (!state) {
                            s.mimeType = type;
                        }
                        return this;
                    },

                    // Cancel the request
                    abort: function (statusText) {
                        statusText = statusText || "abort";
                        if (transport) {
                            transport.abort(statusText);
                        }
                        //触发失败回调函数
                        done(0, statusText);
                        return this;
                    }
                };

            // Callback for when everything is done
            // It is defined here because jslint complains if it is declared
            // at the end of the function (which would be more logical and readable)
            /**
             *
             * @param status 表示响应的http状态码
             * @param nativeStatusText 表示响应的http状态描述
             * @param responses 对象，含有属性text或者xml。分别对应XMLHttpRequest对象的responseText和responseXML。
             * @param headers
             */
            function done(status, nativeStatusText, responses, headers) {

                // Called once
                if (state === 2) {
                    return;
                }

                // State is "done" now
                state = 2;

                // Clear timeout if it exists
                if (timeoutTimer) {
                    clearTimeout(timeoutTimer);
                }

                // Dereference transport for early garbage collection
                // (no matter how long the jqXHR object will be used)
                transport = undefined;

                // Cache response headers
                responseHeadersString = headers || "";

                // Set readyState
                jqXHR.readyState = status > 0 ? 4 : 0;

                var isSuccess,
                    success,
                    error,
                    statusText = nativeStatusText,
                    response = responses ? ajaxHandleResponses(s, jqXHR, responses) : undefined,
                    lastModified,
                    etag;

                // If successful, handle type chaining
                if (status >= 200 && status < 300 || status === 304) {

                    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                    if (s.ifModified) {

                        if (( lastModified = jqXHR.getResponseHeader("Last-Modified") )) {
                            jQuery.lastModified[ifModifiedKey] = lastModified;//请求资源的最后修改时间
                        }
                        if (( etag = jqXHR.getResponseHeader("Etag") )) {
                            jQuery.etag[ifModifiedKey] = etag;//请求标识
                        }
                    }

                    // If not modified
                    if (status === 304) {

                        statusText = "notmodified";
                        isSuccess = true;

                        // If we have data
                    } else {

                        try {
                            success = ajaxConvert(s, response);
                            statusText = "success";
                            isSuccess = true;
                        } catch (e) {
                            // We have a parsererror
                            statusText = "parsererror";
                            error = e;
                        }
                    }
                } else {
                    // We extract error from statusText
                    // then normalize statusText and status for non-aborts
                    error = statusText;
                    if (!statusText || status) {
                        statusText = "error";
                        if (status < 0) {
                            status = 0;
                        }
                    }
                }

                // Set data for the fake xhr object
                jqXHR.status = status;
                jqXHR.statusText = "" + ( nativeStatusText || statusText );

                // Success/Error
                if (isSuccess) {
                    deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
                } else {
                    deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
                }

                // Status-dependent callbacks
                jqXHR.statusCode(statusCode);
                statusCode = undefined;

                if (fireGlobals) {
                    globalEventContext.trigger("ajax" + ( isSuccess ? "Success" : "Error" ),
                        [jqXHR, s, isSuccess ? success : error]);
                }

                // Complete
                completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

                if (fireGlobals) {
                    globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
                    // Handle the global AJAX counter
                    if (!( --jQuery.active )) {
                        jQuery.event.trigger("ajaxStop");
                    }
                }
            }

            // Attach deferreds
            deferred.promise(jqXHR);
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;
            jqXHR.complete = completeDeferred.add;

            // Status-dependent callbacks
            jqXHR.statusCode = function (map) {
                if (map) {
                    var tmp;
                    if (state < 2) {
                        for (tmp in map) {
                            statusCode[tmp] = [statusCode[tmp], map[tmp]];
                        }
                    } else {
                        tmp = map[jqXHR.status];
                        jqXHR.then(tmp, tmp);
                    }
                }
                return this;
            };

            // Remove hash character (#7531: and string promotion)
            // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
            // We also use the url parameter if available
            s.url = ( ( url || s.url ) + "" ).replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");

            // Extract dataTypes list
            s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().split(rspacesAjax);

            // Determine if a cross-domain request is in order
            if (s.crossDomain == null) {
                parts = rurl.exec(s.url.toLowerCase());
                s.crossDomain = !!( parts &&
                    ( parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] ||
                    ( parts[3] || ( parts[1] === "http:" ? 80 : 443 ) ) !=
                    ( ajaxLocParts[3] || ( ajaxLocParts[1] === "http:" ? 80 : 443 ) ) )
                );
            }

            // Convert data if not already a string
            if (s.data && s.processData && typeof s.data !== "string") {
                s.data = jQuery.param(s.data, s.traditional);
            }

            // Apply prefilters
            //应用前置过滤器，继续修正选项
            inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

            // If request was aborted inside a prefiler, stop there
            if (state === 2) {
                return false;
            }

            // We can fire global events as of now if asked to
            fireGlobals = s.global;

            // Uppercase the type
            s.type = s.type.toUpperCase();

            // Determine if request has content
            s.hasContent = !rnoContent.test(s.type);

            // Watch for a new set of requests
            if (fireGlobals && jQuery.active++ === 0) {
                jQuery.event.trigger("ajaxStart");
            }

            // More options handling for requests with no content
            if (!s.hasContent) {

                // If data is available, append data to url
                if (s.data) {
                    s.url += ( rquery.test(s.url) ? "&" : "?" ) + s.data;
                    // #9682: remove data so that it's not used in an eventual retry
                    delete s.data;
                }

                // Get ifModifiedKey before adding the anti-cache parameter
                ifModifiedKey = s.url;

                // Add anti-cache in url if needed
                //禁用缓存
                if (s.cache === false) {

                    var ts = jQuery.now(),
                        // try replacing _= if it is there
                        ret = s.url.replace(rts, "$1_=" + ts);

                    // if nothing was replaced, add timestamp to the end
                    s.url = ret + ( ( ret === s.url ) ? ( rquery.test(s.url) ? "&" : "?" ) + "_=" + ts : "" );
                }
            }

            // Set the correct header, if data is being sent
            if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
                jqXHR.setRequestHeader("Content-Type", s.contentType);
            }

            // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
            if (s.ifModified) {
                ifModifiedKey = ifModifiedKey || s.url;
                if (jQuery.lastModified[ifModifiedKey]) {
                    jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[ifModifiedKey]);
                }
                if (jQuery.etag[ifModifiedKey]) {
                    jqXHR.setRequestHeader("If-None-Match", jQuery.etag[ifModifiedKey]);
                }
            }

            // Set the Accepts header for the server, depending on the dataType
            jqXHR.setRequestHeader(
                "Accept",
                s.dataTypes[0] && s.accepts[s.dataTypes[0]] ?
                s.accepts[s.dataTypes[0]] + ( s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
                    s.accepts["*"]
            );

            // Check for headers option
            for (i in s.headers) {
                jqXHR.setRequestHeader(i, s.headers[i]);
            }

            // Allow custom headers/mimetypes and early abort
            if (s.beforeSend && ( s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2 )) {
                // Abort if not done already
                jqXHR.abort();
                return false;

            }

            // Install callbacks on deferreds
            for (i in {success: 1, error: 1, complete: 1}) {
                jqXHR[i](s[i]);
            }

            // Get transport
            //获取请求发送器
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

            // If no transport, we auto-abort
            if (!transport) {
                done(-1, "No Transport");
            } else {
                jqXHR.readyState = 1;
                // Send global event
                if (fireGlobals) {
                    globalEventContext.trigger("ajaxSend", [jqXHR, s]);
                }
                // Timeout
                if (s.async && s.timeout > 0) {
                    timeoutTimer = setTimeout(function () {
                        jqXHR.abort("timeout");
                    }, s.timeout);
                }

                try {
                    state = 1;
                    transport.send(requestHeaders, done);
                } catch (e) {
                    // Propagate exception as error if not done
                    if (state < 2) {
                        done(-1, e);
                        // Simply rethrow otherwise
                    } else {
                        throw e;
                    }
                }
            }

            return jqXHR;
        },

        // Serialize an array of form elements or a set of
        // key/values into a query string
        /**
         *
         * @param a  待序列化的数组或者对象
         * @param traditional  布尔值，指示是否执行传统的浅序列化
         * @returns {string}
         */
        param: function (a, traditional) {
            var s = [],
                add = function (key, value) {
                    // If value is a function, invoke it and return its value
                    value = jQuery.isFunction(value) ? value() : value;
                    s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
                };

            // Set traditional to true for jQuery <= 1.3.2 behavior.
            if (traditional === undefined) {
                traditional = jQuery.ajaxSettings.traditional;
            }

            // If an array was passed in, assume that it is an array of form elements.
            if (jQuery.isArray(a) || ( a.jquery && !jQuery.isPlainObject(a) )) {
                // Serialize the form elements
                jQuery.each(a, function () {
                    add(this.name, this.value);
                });

            } else {
                // If traditional, encode the "old" way (the way 1.3.2 or older
                // did it), otherwise encode params recursively.
                for (var prefix in a) {
                    buildParams(prefix, a[prefix], traditional, add);
                }
            }

            // Return the resulting serialization
            return s.join("&").replace(r20, "+");
        }
    });
    /**
     * 负责深度序列化数组和对象
     * @param prefix  属性名
     * @param obj  属性值
     * @param traditional  布尔值，指示是否执行传统的浅序列化
     * @param add
     */
    function buildParams(prefix, obj, traditional, add) {
        if (jQuery.isArray(obj)) {
            // Serialize array item.
            jQuery.each(obj, function (i, v) {
                if (traditional || rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);

                } else {
                    // If array item is non-scalar (array or object), encode its
                    // numeric index to resolve deserialization ambiguity issues.
                    // Note that rack (as of 1.0.0) can't currently deserialize
                    // nested arrays properly, and attempting to do so may cause
                    // a server error. Possible fixes are to modify rack's
                    // deserialization algorithm or to provide an option or flag
                    // to force array serialization to be shallow.
                    buildParams(prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add);
                }
            });

        } else if (!traditional && obj != null && typeof obj === "object") {
            // Serialize object item.
            for (var name in obj) {
                buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
            }

        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
    jQuery.extend({

        // Counter for holding the number of active queries
        active: 0,

        // Last-Modified header cache for next request
        lastModified: {},
        etag: {}
    });

    /* Handles responses to an ajax request:
     * - sets all responseXXX fields accordingly
     * - finds the right dataType (mediates between content-type and expected dataType)
     * - returns the corresponding response
     */
    function ajaxHandleResponses(s, jqXHR, responses) {

        var contents = s.contents,
            dataTypes = s.dataTypes,
            responseFields = s.responseFields,
            ct,
            type,
            finalDataType,
            firstDataType;

        // Fill responseXXX fields
        for (type in responseFields) {
            if (type in responses) {
                jqXHR[responseFields[type]] = responses[type];
            }
        }

        // Remove auto dataType and get content-type in the process
        while (dataTypes[0] === "*") {
            dataTypes.shift();
            if (ct === undefined) {
                ct = s.mimeType || jqXHR.getResponseHeader("content-type");
            }
        }

        // Check if we're dealing with a known content-type
        if (ct) {
            for (type in contents) {
                if (contents[type] && contents[type].test(ct)) {
                    dataTypes.unshift(type);
                    break;
                }
            }
        }

        // Check to see if we have a response for the expected dataType
        if (dataTypes[0] in responses) {
            finalDataType = dataTypes[0];
        } else {
            // Try convertible dataTypes
            for (type in responses) {
                if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                    finalDataType = type;
                    break;
                }
                if (!firstDataType) {
                    firstDataType = type;
                }
            }
            // Or just use first one
            finalDataType = finalDataType || firstDataType;
        }

        // If we found a dataType
        // We add the dataType to the list if needed
        // and return the corresponding response
        if (finalDataType) {
            if (finalDataType !== dataTypes[0]) {
                dataTypes.unshift(finalDataType);
            }
            return responses[finalDataType];
        }
    }

// Chain conversions given the request and the original response
    /**
     *
     * @param s  当前请求的完整选项集
     * @param response  原始响应数据
     * @returns {*}
     */
    function ajaxConvert(s, response) {

        // Apply the dataFilter if provided
        if (s.dataFilter) {
            response = s.dataFilter(response, s.dataType);
        }

        var dataTypes = s.dataTypes,
            converters = {},
            i,
            key,
            length = dataTypes.length,
            tmp,
            // Current and previous dataTypes
            current = dataTypes[0],
            prev,
            // Conversion expression
            conversion,
            // Conversion function
            conv,
            // Conversion functions (transitive conversion)
            conv1,
            conv2;

        // For each dataType in the chain
        for (i = 1; i < length; i++) {

            // Create converters map
            // with lowercased keys
            if (i === 1) {
                for (key in s.converters) {
                    if (typeof key === "string") {
                        converters[key.toLowerCase()] = s.converters[key];
                    }
                }
            }

            // Get the dataTypes
            prev = current;
            current = dataTypes[i];

            // If current is auto dataType, update it to prev
            if (current === "*") {
                current = prev;
                // If no auto and dataTypes are actually different
            } else if (prev !== "*" && prev !== current) {

                // Get the converter
                conversion = prev + " " + current;
                conv = converters[conversion] || converters["* " + current];

                // If there is no direct converter, search transitively
                //如果未找到，则查找可过渡的数据类型
                if (!conv) {
                    conv2 = undefined;
                    for (conv1 in converters) {
                        tmp = conv1.split(" ");
                        if (tmp[0] === prev || tmp[0] === "*") {
                            conv2 = converters[tmp[1] + " " + current];
                            if (conv2) {
                                conv1 = converters[conv1];
                                if (conv1 === true) {
                                    conv = conv2;
                                } else if (conv2 === true) {
                                    conv = conv1;
                                }
                                break;
                            }
                        }
                    }
                }
                // If we found no converter, dispatch an error
                if (!( conv || conv2 )) {
                    jQuery.error("No conversion from " + conversion.replace(" ", " to "));
                }
                // If found converter is not an equivalence
                if (conv !== true) {
                    // Convert with 1 or 2 converters accordingly
                    response = conv ? conv(response) : conv2(conv1(response));
                }
            }
        }
        return response;
    }


    var jsc = jQuery.now(),
        jsre = /(\=)\?(&|$)|\?\?/i;//用于匹配选项url或data中是否含有触发jsonp请求的特征字符"=？&"，"=？$","??"的情况

// Default jsonp settings
    jQuery.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function () {
            return jQuery.expando + "_" + ( jsc++ );
        }
    });

// Detect, normalize options and install callbacks for jsonp requests
    jQuery.ajaxPrefilter("json jsonp", function (s, originalSettings, jqXHR) {

        var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
            ( typeof s.data === "string" );

        if (s.dataTypes[0] === "jsonp" ||
            s.jsonp !== false && ( jsre.test(s.url) ||
            inspectData && jsre.test(s.data) )) {

            var responseContainer,
                jsonpCallback = s.jsonpCallback =
                    jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback,
                previous = window[jsonpCallback],
                url = s.url,
                data = s.data,
                replace = "$1" + jsonpCallback + "$2";

            if (s.jsonp !== false) {
                url = url.replace(jsre, replace);
                if (s.url === url) {
                    if (inspectData) {
                        data = data.replace(jsre, replace);
                    }
                    if (s.data === data) {
                        // Add callback manually
                        url += (/\?/.test(url) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
                    }
                }
            }

            s.url = url;
            s.data = data;

            // Install callback
            window[jsonpCallback] = function (response) {
                responseContainer = [response];
            };

            // Clean-up function
            jqXHR.always(function () {
                // Set callback back to previous value
                window[jsonpCallback] = previous;
                // Call if it was a function and we have a response
                if (responseContainer && jQuery.isFunction(previous)) {
                    window[jsonpCallback](responseContainer[0]);
                }
            });

            // Use data converter to retrieve json after script execution
            s.converters["script json"] = function () {
                if (!responseContainer) {
                    jQuery.error(jsonpCallback + " was not called");
                }
                return responseContainer[0];
            };

            // force json dataType
            s.dataTypes[0] = "json";

            // Delegate to script
            return "script";
        }
    });


// Install script dataType
    jQuery.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /javascript|ecmascript/
        },
        converters: {
            "text script": function (text) {
                jQuery.globalEval(text);
                return text;
            }
        }
    });

// Handle cache's special case and global
    jQuery.ajaxPrefilter("script", function (s) {
        if (s.cache === undefined) {
            s.cache = false;
        }
        if (s.crossDomain) {
            s.type = "GET";
            s.global = false;
        }
    });

// Bind script tag hack transport
    jQuery.ajaxTransport("script", function (s) {

        // This transport only deals with cross domain requests
        if (s.crossDomain) {

            var script,
                head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

            return {

                send: function (_, callback) {

                    script = document.createElement("script");

                    script.async = "async";

                    if (s.scriptCharset) {
                        script.charset = s.scriptCharset;
                    }

                    script.src = s.url;

                    // Attach handlers for all browsers
                    script.onload = script.onreadystatechange = function (_, isAbort) {

                        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {

                            // Handle memory leak in IE
                            script.onload = script.onreadystatechange = null;

                            // Remove the script
                            if (head && script.parentNode) {
                                head.removeChild(script);
                            }

                            // Dereference the script
                            script = undefined;

                            // Callback if not abort
                            if (!isAbort) {
                                callback(200, "success");
                            }
                        }
                    };
                    // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
                    // This arises when a base node is used (#2709 and #4378).
                    //将创建的script元素插入head元素头部，开始加载外部执行文件并执行响应的脚本，即开始发送请求并执行jsonp响应
                    head.insertBefore(script, head.firstChild);
                },

                abort: function () {
                    if (script) {
                        script.onload(0, 1);
                    }
                }
            };
        }
    });


    var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
        xhrOnUnloadAbort = window.ActiveXObject ? function () {
            // Abort all pending requests
            for (var key in xhrCallbacks) {
                xhrCallbacks[key](0, 1);
            }
        } : false,
        xhrId = 0,
        xhrCallbacks;

// Functions to create xhrs
    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest();
        } catch (e) {
        }
    }

    function createActiveXHR() {
        try {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
        }
    }

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility(兼容))
    jQuery.ajaxSettings.xhr = window.ActiveXObject ?
        /* Microsoft failed to properly(正确的)
         * implement(执行) the XMLHttpRequest in IE7 (can't request local files),
         * so we use the ActiveXObject when it is available
         * Additionally(此外) XMLHttpRequest can be disabled in IE7/IE8 so
         * we need a fallback(退却).
         */
        function () {
            return !this.isLocal && createStandardXHR() || createActiveXHR();
        } :
        // For all other browsers, use the standard XMLHttpRequest object
        createStandardXHR;

// Determine support properties
    (function (xhr) {
        jQuery.extend(jQuery.support, {
            ajax: !!xhr,
            //在IE中，测试项cors为false，IE6/7完全不支持跨域共享，IE8/9通过XDomainRequest部分支持跨域资源共享，IE10支持全部
            cors: !!xhr && ( "withCredentials" in xhr )
        });
    })(jQuery.ajaxSettings.xhr());

// Create transport if the browser can provide an xhr
    if (jQuery.support.ajax) {

        jQuery.ajaxTransport(function (s) {
            // Cross domain only allowed if supported through XMLHttpRequest
            if (!s.crossDomain || jQuery.support.cors) {

                var callback;

                return {
                    send: function (headers, complete) {

                        // Get a new xhr
                        var xhr = s.xhr(),
                            handle,
                            i;

                        // Open the socket
                        // Passing null username, generates a login popup on Opera (#2865)
                        if (s.username) {
                            xhr.open(s.type, s.url, s.async, s.username, s.password);
                        } else {
                            xhr.open(s.type, s.url, s.async);
                        }

                        // Apply custom fields if provided
                        if (s.xhrFields) {
                            for (i in s.xhrFields) {
                                xhr[i] = s.xhrFields[i];
                            }
                        }

                        // Override mime type if needed
                        if (s.mimeType && xhr.overrideMimeType) {
                            xhr.overrideMimeType(s.mimeType);
                        }

                        // X-Requested-With header
                        // For cross-domain requests, seeing as conditions for a preflight are
                        // akin to a jigsaw puzzle, we simply never set it to be sure.
                        // (it can always be set on a per-request basis or even using ajaxSetup)
                        // For same-domain requests, won't change header if already provided.
                        if (!s.crossDomain && !headers["X-Requested-With"]) {
                            headers["X-Requested-With"] = "XMLHttpRequest";
                        }

                        // Need an extra try/catch for cross domain requests in Firefox 3
                        try {
                            for (i in headers) {
                                xhr.setRequestHeader(i, headers[i]);
                            }
                        } catch (_) {
                        }

                        // Do send the request
                        // This may raise an exception which is actually
                        // handled in jQuery.ajax (so no try/catch here)
                        xhr.send(( s.hasContent && s.data ) || null);

                        // Listener
                        callback = function (_, isAbort) {

                            var status,
                                statusText,
                                responseHeaders,
                                responses,
                                xml;

                            // Firefox throws exceptions when accessing properties
                            // of an xhr when a network error occured
                            // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                            try {

                                // Was never called and is aborted or complete
                                if (callback && ( isAbort || xhr.readyState === 4 )) {

                                    // Only called once
                                    callback = undefined;

                                    // Do not keep as active anymore
                                    if (handle) {
                                        xhr.onreadystatechange = jQuery.noop;
                                        if (xhrOnUnloadAbort) {
                                            delete xhrCallbacks[handle];
                                        }
                                    }

                                    // If it's an abort
                                    if (isAbort) {
                                        // Abort it manually if needed
                                        if (xhr.readyState !== 4) {
                                            xhr.abort();
                                        }
                                    } else {
                                        status = xhr.status;
                                        responseHeaders = xhr.getAllResponseHeaders();
                                        responses = {};
                                        xml = xhr.responseXML;

                                        // Construct response list
                                        if (xml && xml.documentElement /* #4958 */) {
                                            responses.xml = xml;
                                        }
                                        responses.text = xhr.responseText;

                                        // Firefox throws an exception when accessing
                                        // statusText for faulty cross-domain requests
                                        try {
                                            statusText = xhr.statusText;
                                        } catch (e) {
                                            // We normalize with Webkit giving an empty statusText
                                            statusText = "";
                                        }

                                        // Filter status for non standard behaviors

                                        // If the request is local and we have data: assume a success
                                        // (success with no data won't get notified, that's the best we
                                        // can do given current implementations)
                                        if (!status && s.isLocal && !s.crossDomain) {
                                            status = responses.text ? 200 : 404;
                                            // IE - #1450: sometimes returns 1223 when it should be 204
                                        } else if (status === 1223) {
                                            status = 204;
                                        }
                                    }
                                }
                            } catch (firefoxAccessException) {
                                if (!isAbort) {
                                    complete(-1, firefoxAccessException);
                                }
                            }

                            // Call complete if needed
                            if (responses) {
                                complete(status, statusText, responses, responseHeaders);
                            }
                        };

                        // if we're in sync mode or it's in cache
                        // and has been retrieved directly (IE6 & IE7)
                        // we need to manually fire the callback
                        if (!s.async || xhr.readyState === 4) {
                            callback();
                        } else {
                            handle = ++xhrId;
                            if (xhrOnUnloadAbort) {
                                // Create the active xhrs callbacks list if needed
                                // and attach the unload handler
                                if (!xhrCallbacks) {
                                    xhrCallbacks = {};
                                    jQuery(window).unload(xhrOnUnloadAbort);
                                }
                                // Add to list of active xhrs callbacks
                                xhrCallbacks[handle] = callback;
                            }
                            xhr.onreadystatechange = callback;
                        }
                    },

                    abort: function () {
                        if (callback) {
                            callback(0, 1);
                        }
                    }
                };
            }
        });
    }


    var elemdisplay = {},
        iframe, iframeDoc,
        rfxtypes = /^(?:toggle|show|hide)$/,
        rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
        timerId,
        fxAttrs = [
            // height animations
            ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
            // width animations
            ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
            // opacity animations
            ["opacity"]
        ],
        fxNow;

    jQuery.fn.extend({
        show: function (speed, easing, callback) {
            var elem, display;

            if (speed || speed === 0) {
                return this.animate(genFx("show", 3), speed, easing, callback);

            } else {
                for (var i = 0, j = this.length; i < j; i++) {
                    elem = this[i];

                    if (elem.style) {
                        display = elem.style.display;

                        // Reset the inline display of this element to learn if it is
                        // being hidden by cascaded rules or not
                        if (!jQuery._data(elem, "olddisplay") && display === "none") {
                            display = elem.style.display = "";
                        }

                        // Set elements which have been overridden with display: none
                        // in a stylesheet to whatever the default browser style is
                        // for such an element
                        if (display === "" && jQuery.css(elem, "display") === "none") {
                            jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
                        }
                    }
                }

                // Set the display of most of the elements in a second loop
                // to avoid the constant reflow
                for (i = 0; i < j; i++) {
                    elem = this[i];

                    if (elem.style) {
                        display = elem.style.display;

                        if (display === "" || display === "none") {
                            elem.style.display = jQuery._data(elem, "olddisplay") || "";
                        }
                    }
                }

                return this;
            }
        },

        hide: function (speed, easing, callback) {
            if (speed || speed === 0) {
                return this.animate(genFx("hide", 3), speed, easing, callback);

            } else {
                var elem, display,
                    i = 0,
                    j = this.length;

                for (; i < j; i++) {
                    elem = this[i];
                    if (elem.style) {
                        display = jQuery.css(elem, "display");

                        if (display !== "none" && !jQuery._data(elem, "olddisplay")) {
                            jQuery._data(elem, "olddisplay", display);
                        }
                    }
                }

                // Set the display of the elements in a second loop
                // to avoid the constant reflow
                for (i = 0; i < j; i++) {
                    if (this[i].style) {
                        this[i].style.display = "none";
                    }
                }

                return this;
            }
        },

        // Save the old toggle function
        _toggle: jQuery.fn.toggle,
        /**
         *
         * @param fn
         * @param fn2
         * @param callback
         * @returns {jQuery}
         */
        toggle: function (fn, fn2, callback) {
            var bool = typeof fn === "boolean";

            if (jQuery.isFunction(fn) && jQuery.isFunction(fn2)) {
                this._toggle.apply(this, arguments);

            } else if (fn == null || bool) {
                this.each(function () {
                    var state = bool ? fn : jQuery(this).is(":hidden");
                    jQuery(this)[state ? "show" : "hide"]();
                });

            } else {
                this.animate(genFx("toggle", 3), fn, fn2, callback);
            }

            return this;
        },

        fadeTo: function (speed, to, easing, callback) {
            return this.filter(":hidden").css("opacity", 0).show().end()
                .animate({opacity: to}, speed, easing, callback);
        },
        /**
         * 负责执行一组样式动画，所有动画效果的入口
         * @param prop 必传，对象，含有将要动画的样式
         * @param speed 可选，字符串或数字。表示动画运行持续时间
         * @param easing 可选，字符串，表示正在使用的缓动函数
         * @param callback
         * @returns {*}
         */
        animate: function (prop, speed, easing, callback) {
            //修正运行时间，缓动函数，重写完成回调函数
            var optall = jQuery.speed(speed, easing, callback);

            if (jQuery.isEmptyObject(prop)) {
                return this.each(optall.complete, [false]);
            }

            // Do not change referenced properties as per-property easing will be lost
            prop = jQuery.extend({}, prop);
            //动画函数，负责遍历样式动画集合，先修正，解析，备份样式名，然后为每个样式调用构造函数jQuery.fx(elem,options,prop)构造动画对象，并开始执行动画
            function doAnimation() {
                // XXX 'this' does not always have a nodeName when running the
                // test suite

                if (optall.queue === false) {
                    jQuery._mark(this);
                }

                var opt = jQuery.extend({}, optall),
                    isElement = this.nodeType === 1,
                    hidden = isElement && jQuery(this).is(":hidden"),
                    name, val, p, e,
                    parts, start, end, unit,
                    method;

                // will store per property easing and be used to determine when an animation is complete
                opt.animatedProperties = {};
                //遍历动画样式集合
                for (p in prop) {

                    // property name normalization
                    //将样式名转换为驼峰式
                    name = jQuery.camelCase(p);
                    if (p !== name) {
                        prop[name] = prop[p];
                        delete prop[p];
                    }
                    //解析每个样式的结束值和缓动函数
                    val = prop[name];

                    // easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
                    if (jQuery.isArray(val)) {
                        opt.animatedProperties[name] = val[1];
                        val = prop[name] = val[0];
                    } else {
                        opt.animatedProperties[name] = opt.specialEasing && opt.specialEasing[name] || opt.easing || 'swing';
                    }

                    if (val === "hide" && hidden || val === "show" && !hidden) {
                        return opt.complete.call(this);
                    }
                    //备份或修正可能影响动画效果的样式
                    if (isElement && ( name === "height" || name === "width" )) {
                        // Make sure that nothing sneaks out
                        // Record all 3 overflow attributes because IE does not
                        // change the overflow attribute when overflowX and
                        // overflowY are set to the same value
                        opt.overflow = [this.style.overflow, this.style.overflowX, this.style.overflowY];

                        // Set display property to inline-block for height/width
                        // animations on inline elements that are having width/height animated
                        if (jQuery.css(this, "display") === "inline" &&
                            jQuery.css(this, "float") === "none") {

                            // inline-level elements accept inline-block;
                            // block-level elements need to be inline with layout
                            if (!jQuery.support.inlineBlockNeedsLayout || defaultDisplay(this.nodeName) === "inline") {
                                this.style.display = "inline-block";

                            } else {
                                this.style.zoom = 1;
                            }
                        }
                    }
                }

                if (opt.overflow != null) {
                    this.style.overflow = "hidden";
                }
                //再次遍历动画样式集合
                for (p in prop) {
                    //为每个样式构造标准动画对象
                    e = new jQuery.fx(this, opt, p);
                    val = prop[p];
                    //样式值val是toggle,show,hide之一的情况
                    if (rfxtypes.test(val)) {

                        // Tracks whether to show or hide based on private
                        // data attached to the element
                        method = jQuery._data(this, "toggle" + p) || ( val === "toggle" ? hidden ? "show" : "hide" : 0 );
                        if (method) {
                            jQuery._data(this, "toggle" + p, method === "show" ? "hide" : "show");
                            e[method]();
                        } else {
                            e[val]();
                        }

                    } else {//样式值是数值型的情况
                        parts = rfxnum.exec(val);
                        start = e.cur();

                        if (parts) {
                            end = parseFloat(parts[2]);
                            unit = parts[3] || ( jQuery.cssNumber[p] ? "" : "px" );

                            // We need to compute starting value
                            if (unit !== "px") {
                                jQuery.style(this, p, (end || 1) + unit);
                                start = ( (end || 1) / e.cur() ) * start;
                                jQuery.style(this, p, start + unit);
                            }

                            // If a +=/-= token was provided, we're doing a relative animation
                            if (parts[1]) {
                                end = ( (parts[1] === "-=" ? -1 : 1) * end ) + start;
                            }

                            e.custom(start, end, unit);

                        } else {
                            e.custom(start, val, "");
                        }
                    }
                }

                // For JS strict compliance
                return true;
            }

            return optall.queue === false ?
                this.each(doAnimation) :
                this.queue(optall.queue, doAnimation);
        },
        /**
         *
         * @param type
         * @param clearQueue 指示是否清空动画队列，即是否取消匹配元素上尚未执行的动画
         * @param gotoEnd 指示停止动画时是否直接跳到完成状态
         * @returns {*}
         */
        stop: function (type, clearQueue, gotoEnd) {
            if (typeof type !== "string") {
                gotoEnd = clearQueue;
                clearQueue = type;
                type = undefined;
            }
            //清空动画队列
            if (clearQueue && type !== false) {
                this.queue(type || "fx", []);
            }
            //遍历匹配元素集合
            return this.each(function () {
                var index,
                    hadTimers = false,
                    timers = jQuery.timers,
                    data = jQuery._data(this);

                // clear marker counters if we know they won't be
                if (!gotoEnd) {
                    jQuery._unmark(true, this);
                }

                function stopQueue(elem, data, index) {
                    var hooks = data[index];
                    jQuery.removeData(elem, index, true);
                    hooks.stop(gotoEnd);
                }

                if (type == null) {
                    for (index in data) {
                        if (data[index] && data[index].stop && index.indexOf(".run") === index.length - 4) {
                            stopQueue(this, data, index);
                        }
                    }
                } else if (data[index = type + ".run"] && data[index].stop) {
                    stopQueue(this, data, index);
                }

                for (index = timers.length; index--;) {
                    if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                        //移除单帧闭包函数
                        if (gotoEnd) {

                            // force the next step to be the last
                            timers[index](true);
                        } else {
                            timers[index].saveState();
                        }
                        hadTimers = true;
                        timers.splice(index, 1);
                    }
                }

                // start the next in the queue if the last step wasn't forced
                // timers currently will call their complete callbacks, which will dequeue
                // but only if they were gotoEnd
                //继续执行剩余的动画函数doAnimation()
                if (!( gotoEnd && hadTimers )) {
                    jQuery.dequeue(this, type);
                }
            });
        }

    });

// Animations created synchronously will run synchronously
    function createFxNow() {
        setTimeout(clearFxNow, 0);
        return ( fxNow = jQuery.now() );
    }

    function clearFxNow() {
        fxNow = undefined;
    }

// Generate parameters to create a standard animation
    function genFx(type, num) {
        var obj = {};

        jQuery.each(fxAttrs.concat.apply([], fxAttrs.slice(0, num)), function () {
            obj[this] = type;
        });

        return obj;
    }

// Generate shortcuts for custom animations
    jQuery.each({
        slideDown: genFx("show", 1),
        slideUp: genFx("hide", 1),
        slideToggle: genFx("toggle", 1),
        fadeIn: {opacity: "show"},
        fadeOut: {opacity: "hide"},
        fadeToggle: {opacity: "toggle"}
    }, function (name, props) {
        jQuery.fn[name] = function (speed, easing, callback) {
            return this.animate(props, speed, easing, callback);
        };
    });

    jQuery.extend({
        /**
         * 负责修正运行时间，缓动函数，重写完成回调函数
         * @param speed 字符串或数字，表示动画运行持续时间
         * @param easing 字符串，表示所使用的缓动函数
         * @param fn 回调函数，当动画完成时被调用
         * @returns {{complete: (*|boolean), duration: *, easing: (*|boolean)}}
         */
        speed: function (speed, easing, fn) {
            var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
                complete: fn || !fn && easing ||
                jQuery.isFunction(speed) && speed,
                duration: speed,
                easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
            };

            opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
                opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

            // normalize opt.queue - true/undefined/null -> "fx"
            if (opt.queue == null || opt.queue === true) {
                opt.queue = "fx";
            }

            // Queueing
            opt.old = opt.complete;

            opt.complete = function (noUnmark) {
                if (jQuery.isFunction(opt.old)) {
                    opt.old.call(this);
                }

                if (opt.queue) {
                    jQuery.dequeue(this, opt.queue);
                } else if (noUnmark !== false) {
                    jQuery._unmark(this);
                }
            };

            return opt;
        },
        //缓动函数集合，含有两个内置函数
        easing: {
            //匀速运动
            linear: function (p, n, firstNum, diff) {
                return firstNum + diff * p;
            },
            //慢-->块-->慢
            swing: function (p, n, firstNum, diff) {
                return ( ( -Math.cos(p * Math.PI) / 2 ) + 0.5 ) * diff + firstNum;
            }
        },

        timers: [],

        fx: function (elem, options, prop) {
            this.options = options;
            this.elem = elem;
            this.prop = prop;

            options.orig = options.orig || {};
        }

    });

    jQuery.fx.prototype = {
        // Simple function for setting a style value
        update: function () {
            if (this.options.step) {
                this.options.step.call(this.elem, this.now, this);
            }

            ( jQuery.fx.step[this.prop] || jQuery.fx.step._default )(this);
        },

        // Get the current size
        cur: function () {
            if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) {
                return this.elem[this.prop];
            }

            var parsed,
                r = jQuery.css(this.elem, this.prop);
            // Empty strings, null, undefined and "auto" are converted to 0,
            // complex values such as "rotate(1rad)" are returned as is,
            // simple values such as "10px" are parsed to Float.
            return isNaN(parsed = parseFloat(r)) ? !r || r === "auto" ? 0 : r : parsed;
        },

        // Start an animation from one number to another
        /**
         * 负责开始执行单个样式的动画
         * @param from
         * @param to
         * @param unit
         */
        custom: function (from, to, unit) {
            var self = this,
                fx = jQuery.fx;

            this.startTime = fxNow || createFxNow();
            this.end = to;
            this.now = this.start = from;
            this.pos = this.state = 0;
            this.unit = unit || this.unit || ( jQuery.cssNumber[this.prop] ? "" : "px" );
            //闭包，单帧闭包动画函数
            function t(gotoEnd) {
                return self.step(gotoEnd);
            }

            t.queue = this.options.queue;
            t.elem = this.elem;
            t.saveState = function () {
                if (self.options.hide && jQuery._data(self.elem, "fxshow" + self.prop) === undefined) {
                    jQuery._data(self.elem, "fxshow" + self.prop, self.start);
                }
            };

            if (t() && jQuery.timers.push(t) && !timerId) {
                timerId = setInterval(fx.tick, fx.interval);
            }
        },

        // Simple 'show' function
        show: function () {
            var dataShow = jQuery._data(this.elem, "fxshow" + this.prop);

            // Remember where we started, so that we can go back to it later
            this.options.orig[this.prop] = dataShow || jQuery.style(this.elem, this.prop);
            this.options.show = true;

            // Begin the animation
            // Make sure that we start at a small width/height to avoid any flash of content
            if (dataShow !== undefined) {
                // This show is picking up where a previous hide or show left off
                this.custom(this.cur(), dataShow);
            } else {
                this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
            }

            // Start by showing the element
            jQuery(this.elem).show();
        },

        // Simple 'hide' function
        hide: function () {
            // Remember where we started, so that we can go back to it later
            this.options.orig[this.prop] = jQuery._data(this.elem, "fxshow" + this.prop) || jQuery.style(this.elem, this.prop);
            this.options.hide = true;

            // Begin the animation
            this.custom(this.cur(), 0);
        },

        // Each step of an animation
        step: function (gotoEnd) {
            var p, n, complete,
                t = fxNow || createFxNow(),
                done = true,
                elem = this.elem,
                options = this.options;
            //参数gotoEnd为true或者超过了动画完成时间，则结束当前样式动画。
            if (gotoEnd || t >= options.duration + this.startTime) {
                this.now = this.end;
                this.pos = this.state = 1;
                this.update();
                //如果当前元素的所有样式动画全部完成，则执行完成回调函数。
                options.animatedProperties[this.prop] = true;

                for (p in options.animatedProperties) {
                    if (options.animatedProperties[p] !== true) {
                        done = false;
                    }
                }

                if (done) {
                    // Reset the overflow
                    if (options.overflow != null && !jQuery.support.shrinkWrapBlocks) {

                        jQuery.each(["", "X", "Y"], function (index, value) {
                            elem.style["overflow" + value] = options.overflow[index];
                        });
                    }

                    // Hide the element if the "hide" operation was done
                    if (options.hide) {
                        jQuery(elem).hide();
                    }

                    // Reset the properties, if the item has been hidden or shown
                    if (options.hide || options.show) {
                        for (p in options.animatedProperties) {
                            jQuery.style(elem, p, options.orig[p]);
                            jQuery.removeData(elem, "fxshow" + p, true);
                            // Toggle data is no longer needed
                            jQuery.removeData(elem, "toggle" + p, true);
                        }
                    }

                    // Execute the complete function
                    // in the event that the complete function throws an exception
                    // we must ensure it won't be called twice. #5684

                    complete = options.complete;
                    if (complete) {

                        options.complete = false;
                        complete.call(elem);
                    }
                }

                return false;

            } else {//当前动画样式尚未完成的情况
                // classical easing cannot be used with an Infinity duration
                if (options.duration == Infinity) {
                    this.now = t;
                } else {
                    n = t - this.startTime;
                    this.state = n / options.duration;

                    // Perform the easing function, defaults to swing
                    this.pos = jQuery.easing[options.animatedProperties[this.prop]](this.state, n, 0, 1, options.duration);
                    this.now = this.start + ( (this.end - this.start) * this.pos );
                }
                // Perform the next step of the animation
                this.update();
            }

            return true;
        }
    };

    jQuery.extend(jQuery.fx, {
        //负责遍历执行全局动画函数数组jQuery.timers中的单帧闭包动画函数(gotoEnd)
        tick: function () {
            var timer,
                timers = jQuery.timers,
                i = 0;

            for (; i < timers.length; i++) {
                timer = timers[i];
                // Checks the timer has not already been removed
                //如果某个闭包单帧回调函数返回false，说明该函数代表的动画样式已经完成，应及时从数组中移除
                if (!timer() && timers[i] === timer) {
                    timers.splice(i--, 1);
                }
            }

            if (!timers.length) {
                jQuery.fx.stop();
            }
        },

        interval: 13,

        stop: function () {
            clearInterval(timerId);
            timerId = null;
        },

        speeds: {
            slow: 600,
            fast: 200,
            // Default speed
            _default: 400
        },

        step: {
            opacity: function (fx) {
                jQuery.style(fx.elem, "opacity", fx.now);
            },

            _default: function (fx) {
                if (fx.elem.style && fx.elem.style[fx.prop] != null) {
                    fx.elem.style[fx.prop] = fx.now + fx.unit;
                } else {
                    fx.elem[fx.prop] = fx.now;
                }
            }
        }
    });

// Adds width/height step functions
// Do not set anything below 0
    jQuery.each(["width", "height"], function (i, prop) {
        jQuery.fx.step[prop] = function (fx) {
            jQuery.style(fx.elem, prop, Math.max(0, fx.now) + fx.unit);
        };
    });

    if (jQuery.expr && jQuery.expr.filters) {
        jQuery.expr.filters.animated = function (elem) {
            return jQuery.grep(jQuery.timers, function (fn) {
                return elem === fn.elem;
            }).length;
        };
    }

// Try to restore the default display value of an element
    function defaultDisplay(nodeName) {

        if (!elemdisplay[nodeName]) {

            var body = document.body,
                elem = jQuery("<" + nodeName + ">").appendTo(body),
                display = elem.css("display");
            elem.remove();

            // If the simple way fails,
            // get element's real default display by attaching it to a temp iframe
            if (display === "none" || display === "") {
                // No iframe to use yet, so create it
                if (!iframe) {
                    iframe = document.createElement("iframe");
                    iframe.frameBorder = iframe.width = iframe.height = 0;
                }

                body.appendChild(iframe);

                // Create a cacheable copy of the iframe document on first call.
                // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
                // document to it; WebKit & Firefox won't allow reusing the iframe document.
                if (!iframeDoc || !iframe.createElement) {
                    iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
                    iframeDoc.write(( document.compatMode === "CSS1Compat" ? "<!doctype html>" : "" ) + "<html><body>");
                    iframeDoc.close();
                }

                elem = iframeDoc.createElement(nodeName);

                iframeDoc.body.appendChild(elem);

                display = jQuery.css(elem, "display");
                body.removeChild(iframe);
            }

            // Store the correct default display
            elemdisplay[nodeName] = display;
        }

        return elemdisplay[nodeName];
    }


    var rtable = /^t(?:able|d|h)$/i,
        rroot = /^(?:body|html)$/i;
    //读取或设置文档坐标
    if ("getBoundingClientRect" in document.documentElement) {
        //文档坐标=窗口坐标+滚动偏移-文档边框厚度
        jQuery.fn.offset = function (options) {
            var elem = this[0], box;

            if (options) {
                return this.each(function (i) {
                    jQuery.offset.setOffset(this, options, i);
                });
            }

            if (!elem || !elem.ownerDocument) {
                return null;
            }
            //处理body元素
            if (elem === elem.ownerDocument.body) {
                return jQuery.offset.bodyOffset(elem);
            }

            try {
                box = elem.getBoundingClientRect();
            } catch (e) {
            }

            var doc = elem.ownerDocument,
                docElem = doc.documentElement;

            // Make sure we're not dealing with a disconnected DOM node
            if (!box || !jQuery.contains(docElem, elem)) {
                return box ? {top: box.top, left: box.left} : {top: 0, left: 0};
            }

            var body = doc.body,
                win = getWindow(doc),
                //获取文档边框厚度
                clientTop = docElem.clientTop || body.clientTop || 0,
                clientLeft = docElem.clientLeft || body.clientLeft || 0,
                //首先尝试使用win.pageYOffset,如果不支持，尝试检测盒模型，判断是标准盒模型还是IE盒模型，选取对应的值
                scrollTop = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop || body.scrollTop,
                scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
                top = box.top + scrollTop - clientTop,
                left = box.left + scrollLeft - clientLeft;

            return {top: top, left: left};
        };

    } else {
        jQuery.fn.offset = function (options) {
            var elem = this[0];

            if (options) {
                return this.each(function (i) {
                    jQuery.offset.setOffset(this, options, i);
                });
            }

            if (!elem || !elem.ownerDocument) {
                return null;
            }

            if (elem === elem.ownerDocument.body) {
                return jQuery.offset.bodyOffset(elem);
            }

            var computedStyle,
                offsetParent = elem.offsetParent,
                prevOffsetParent = elem,
                doc = elem.ownerDocument,
                docElem = doc.documentElement,
                body = doc.body,
                defaultView = doc.defaultView,
                prevComputedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle,
                top = elem.offsetTop,
                left = elem.offsetLeft;

            while ((elem = elem.parentNode) && elem !== body && elem !== docElem) {
                if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") {
                    break;
                }

                computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
                top -= elem.scrollTop;
                left -= elem.scrollLeft;

                if (elem === offsetParent) {
                    top += elem.offsetTop;
                    left += elem.offsetLeft;

                    if (jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName))) {
                        top += parseFloat(computedStyle.borderTopWidth) || 0;
                        left += parseFloat(computedStyle.borderLeftWidth) || 0;
                    }

                    prevOffsetParent = offsetParent;
                    offsetParent = elem.offsetParent;
                }

                if (jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible") {
                    top += parseFloat(computedStyle.borderTopWidth) || 0;
                    left += parseFloat(computedStyle.borderLeftWidth) || 0;
                }

                prevComputedStyle = computedStyle;
            }

            if (prevComputedStyle.position === "relative" || prevComputedStyle.position === "static") {
                top += body.offsetTop;
                left += body.offsetLeft;
            }

            if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") {
                top += Math.max(docElem.scrollTop, body.scrollTop);
                left += Math.max(docElem.scrollLeft, body.scrollLeft);
            }

            return {top: top, left: left};
        };
    }
    //
    jQuery.offset = {

        bodyOffset: function (body) {
            var top = body.offsetTop,
                left = body.offsetLeft;
            //如果body元素到html元素上边框的距离不包括body元素的样式marginTop，则加上
            if (jQuery.support.doesNotIncludeMarginInBodyOffset) {
                top += parseFloat(jQuery.css(body, "marginTop")) || 0;
                left += parseFloat(jQuery.css(body, "marginLeft")) || 0;
            }

            return {top: top, left: left};
        },
        /**
         * 用于设置单个元素的文档坐标
         * 最终的内联样式top = 目标文档坐标top-当前文档坐标top+计算样式top
         * 最终的内联样式left=目标文档坐标left-当前文档坐标left+计算样式left
         * @param elem
         * @param options 目标文档坐标对象，含有属性left或者top
         * @param i
         */
        setOffset: function (elem, options, i) {
            var position = jQuery.css(elem, "position");

            // set position first, in-case top/left are set even on static elem
            if (position === "static") {
                elem.style.position = "relative";
            }

            var curElem = jQuery(elem),
                curOffset = curElem.offset(),
                curCSSTop = jQuery.css(elem, "top"),//表示当前元素的计算样式
                curCSSLeft = jQuery.css(elem, "left"),
                calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
                props = {}, curPosition = {}, curTop, curLeft;

            // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
            if (calculatePosition) {
                curPosition = curElem.position();
                curTop = curPosition.top;//表示当前元素修正后的计算样式top,left
                curLeft = curPosition.left;
            } else {//不修正的情况下
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0;
            }

            if (jQuery.isFunction(options)) {
                options = options.call(elem, i, curOffset);
            }

            if (options.top != null) {
                props.top = ( options.top - curOffset.top ) + curTop;
            }
            if (options.left != null) {
                props.left = ( options.left - curOffset.left ) + curLeft;
            }
            //如果参数option中含有回调函数using，则调用。在回调函数中会决定如何使用内联样式top,left
            if ("using" in options) {
                options.using.call(elem, props);
            } else {
                curElem.css(props);
            }
        }
    };


    jQuery.fn.extend({
        //用于获取匹配元素集合中第一个元素相对于其最近定位祖先元素的坐标
        position: function () {
            if (!this[0]) {
                return null;
            }

            var elem = this[0],

                // Get *real* offsetParent
                offsetParent = this.offsetParent(),

                // Get correct offsets
                offset = this.offset(),
                //获取最近定位祖先元素的文档坐标
                parentOffset = rroot.test(offsetParent[0].nodeName) ? {top: 0, left: 0} : offsetParent.offset();

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top -= parseFloat(jQuery.css(elem, "marginTop")) || 0;
            offset.left -= parseFloat(jQuery.css(elem, "marginLeft")) || 0;

            // Add offsetParent borders
            parentOffset.top += parseFloat(jQuery.css(offsetParent[0], "borderTopWidth")) || 0;
            parentOffset.left += parseFloat(jQuery.css(offsetParent[0], "borderLeftWidth")) || 0;

            // Subtract the two offsets
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        },

        offsetParent: function () {
            return this.map(function () {
                var offsetParent = this.offsetParent || document.body;
                //如果找到的定位祖先元素的样式position是static,则继续沿着DOM树向上查找，直到遇到body元素或者html元素为止
                while (offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static")) {
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent;
            });
        }
    });


// Create scrollLeft and scrollTop methods
    jQuery.each(["Left", "Top"], function (i, name) {
        var method = "scroll" + name;

        jQuery.fn[method] = function (val) {
            var elem, win;

            if (val === undefined) {
                elem = this[0];

                if (!elem) {
                    return null;
                }

                win = getWindow(elem);

                // Return the scroll offset
                //用于读取window对象，document对象，元素的滚动偏移
                return win ? ("pageXOffset" in win) ? win[i ? "pageYOffset" : "pageXOffset"] :
                jQuery.support.boxModel && win.document.documentElement[method] ||//标准盒模型，则取html元素
                win.document.body[method] ://IE盒模型，则取body元素
                    elem[method];
            }

            // Set the scroll offset
            return this.each(function () {
                win = getWindow(this);

                if (win) {
                    win.scrollTo(
                        !i ? val : jQuery(win).scrollLeft(),
                        i ? val : jQuery(win).scrollTop()
                    );

                } else {
                    this[method] = val;
                }
            });
        };
    });

    function getWindow(elem) {
        return jQuery.isWindow(elem) ?
            elem :
            elem.nodeType === 9 ?
            elem.defaultView || elem.parentWindow :
                false;
    }


// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
    jQuery.each(["Height", "Width"], function (i, name) {

        var type = name.toLowerCase();

        // innerHeight and innerWidth
        jQuery.fn["inner" + name] = function () {
            var elem = this[0];
            return elem ?
                elem.style ?
                    parseFloat(jQuery.css(elem, type, "padding")) :
                    this[type]() :
                null;
        };

        // outerHeight and outerWidth
        //用于获取匹配元素集合中第一个元素的高度，宽度，包括内容content,内边距padding，边框border和可选的外边框margin
        jQuery.fn["outer" + name] = function (margin) {
            var elem = this[0];
            return elem ?
                elem.style ?
                    parseFloat(jQuery.css(elem, type, margin ? "margin" : "border")) :
                    this[type]() :
                null;
        };

        jQuery.fn[type] = function (size) {
            // Get window width or height
            var elem = this[0];
            if (!elem) {
                return size == null ? null : this;
            }

            if (jQuery.isFunction(size)) {
                return this.each(function (i) {
                    var self = jQuery(this);
                    self[type](size.call(this, i, self[type]()));
                });
            }
            //处理window对象
            if (jQuery.isWindow(elem)) {
                // Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
                // 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
                var docElemProp = elem.document.documentElement["client" + name],
                    body = elem.document.body;
                return elem.document.compatMode === "CSS1Compat" && docElemProp ||
                    body && body["client" + name] || docElemProp;

                // Get document width or height
                //处理document对象
            } else if (elem.nodeType === 9) {
                // Either scroll[Width/Height] or offset[Width/Height], whichever is greater
                return Math.max(
                    elem.documentElement["client" + name],
                    elem.body["scroll" + name], elem.documentElement["scroll" + name],
                    elem.body["offset" + name], elem.documentElement["offset" + name]
                );

                // Get or set width or height on the element
            } else if (size === undefined) {
                var orig = jQuery.css(elem, type),
                    ret = parseFloat(orig);

                return jQuery.isNumeric(ret) ? ret : orig;

                // Set the width or height on the element (default to pixels if value is unitless)
            } else {
                return this.css(type, typeof size === "string" ? size : size + "px");
            }
        };

    });


// Expose jQuery to the global object
    window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
    if (typeof define === "function" && define.amd && define.amd.jQuery) {
        define("jquery", [], function () {
            return jQuery;
        });
    }


})(window);