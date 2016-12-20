/*!
 * hotkeys-js v2.0.1
 * A simple micro-library for defining and dispatching keyboard shortcuts. It has no dependencies.
 * 
 * Copyright (c) 2016 undefined
 * https://github.com/jaywcjlove/hotkeys.git
 * 
 * Licensed under the  license.
 */
(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f();
    } else if (typeof define === "function" && define.amd) {
        define([], f);
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window;
        } else if (typeof global !== "undefined") {
            g = global;
        } else if (typeof self !== "undefined") {
            g = self;
        } else {
            g = this;
        }
        g.hotkeys = f();
    }
})(function() {
    var define, module, exports;
    //IE对indexOf方法的支持
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj) {
            for (var i = 0; i < this.length; i++) if (this[i] === obj) return i;
            return -1;
        };
    }
    var _api, //对外API
    isff = navigator.userAgent.toLowerCase().indexOf("firefox") > 0, _keyMap = {
        //特殊键
        backspace: 8,
        tab: 9,
        clear: 12,
        enter: 13,
        return: 13,
        esc: 27,
        escape: 27,
        space: 32,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        del: 46,
        delete: 46,
        home: 36,
        end: 35,
        pageup: 33,
        pagedown: 34,
        ",": 188,
        ".": 190,
        "/": 191,
        "`": 192,
        "-": isff ? 173 : 189,
        "=": isff ? 61 : 187,
        ";": isff ? 59 : 186,
        "'": 222,
        "[": 219,
        "]": 221,
        "\\": 220
    }, _scope = "all", //默认热键范围
    _modifier = {
        //修饰键
        "⇧": 16,
        shift: 16,
        "⌥": 18,
        alt: 18,
        option: 18,
        "⌃": 17,
        ctrl: 17,
        control: 17,
        "⌘": isff ? 224 : 91,
        command: isff ? 224 : 91
    }, _downKeys = [], //记录摁下的绑定键
    modifierMap = {
        16: "shiftKey",
        18: "altKey",
        17: "ctrlKey"
    }, _mods = {
        16: false,
        18: false,
        17: false
    }, //返回键码
    code = function(x) {
        return _keyMap[x] || x.toUpperCase().charCodeAt(0);
    }, _handlers = {};
    // F1~F12 特殊键
    for (var k = 1; k < 20; k++) {
        _keyMap["f" + k] = 111 + k;
    }
    // 兼容Firefox处理
    modifierMap[isff ? 224 : 91] = "metaKey";
    _mods[isff ? 224 : 91] = false;
    //设置获取当前范围（默认为'所有'）
    function setScope(scope) {
        _scope = scope || "all";
    }
    function getScope() {
        return _scope || "all";
    }
    //绑定事件
    function addEvent(object, event, method) {
        if (object.addEventListener) {
            object.addEventListener(event, method, false);
        } else if (object.attachEvent) {
            object.attachEvent("on" + event, function() {
                method(window.event);
            });
        }
    }
    //判断摁下的键是否为某个键，返回true或者false
    function isPressed(keyCode) {
        if (typeof keyCode === "string") {
            keyCode = code(keyCode);
        }
        return _downKeys.indexOf(keyCode) !== -1;
    }
    //获取摁下绑定键的键值
    function getPressedKeyCodes(argument) {
        return _downKeys.slice(0);
    }
    //处理keydown事件
    function dispatch(event) {
        var key = event.keyCode || e.which || e.charCode, scope, asterisk = _handlers["*"];
        //搜集绑定的键
        if (_downKeys.indexOf(key) === -1) _downKeys.push(key);
        //Gecko(Friefox)的command键值224，在Webkit(Chrome)中保持一致
        //Webkit左右command键值不一样
        if (key === 93 || key === 224) key = 91;
        if (key in _mods) {
            _mods[key] = true;
            // 将特殊字符的key注册到 hotkeys 上
            for (var k in _modifier) if (_modifier[k] === key) hotkeys[k] = true;
            if (!asterisk) return;
        }
        //将modifierMap里面的修饰键绑定到event中
        for (var e in _mods) _mods[e] = event[modifierMap[e]];
        //表单控件控件过滤 默认表单控件不触发快捷键
        if (!hotkeys.filter.call(this, event)) return;
        //获取范围 默认为all
        scope = getScope();
        //对任何按键做处理
        if (asterisk) for (i = 0; i < asterisk.length; i++) {
            if (asterisk[i].scope === scope) eventHandler(event, asterisk[i], scope);
        }
        // key 不在_handlers中返回
        if (!(key in _handlers)) return;
        for (var i = 0; i < _handlers[key].length; i++) {
            //找到处理内容
            eventHandler(event, _handlers[key][i], scope);
        }
    }
    function eventHandler(event, handler, scope) {
        var modifiersMatch;
        //看它是否在当前范围
        if (handler.scope === scope || handler.scope === "all") {
            //检查是否匹配修饰符（如果有返回true）
            modifiersMatch = handler.mods.length > 0;
            for (var y in _mods) {
                if (!_mods[y] && handler.mods.indexOf(+y) > -1 || _mods[y] && handler.mods.indexOf(+y) === -1) modifiersMatch = false;
            }
            // 调用处理程序，如果是修饰键不做处理
            if (handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch || handler.shortcut === "*") {
                if (handler.method(event, handler) === false) {
                    if (event.preventDefault) event.preventDefault(); else event.returnValue = false;
                    if (event.stopPropagation) event.stopPropagation();
                    if (event.cancelBubble) event.cancelBubble = true;
                }
            }
        }
    }
    //解除绑定某个范围的快捷键
    function unbind(key, scope) {
        var multipleKeys = getKeys(key), keys, mods = [], obj;
        for (var i = 0; i < multipleKeys.length; i++) {
            //将组合快捷键拆分为数组
            keys = multipleKeys[i].split("+");
            //记录每个组合键中的修饰键的键码 返回数组
            if (keys.length > 1) mods = getMods(keys);
            //获取除修饰键外的键值key
            key = keys[keys.length - 1];
            key = code(key);
            //判断是否传入范围，没有就获取范围
            if (scope === undefined) scope = getScope();
            //如何key不在 _handlers 中返回不做处理
            if (!_handlers[key]) return;
            //清空 handlers 中数据，
            //让触发快捷键键之后没有事件执行到达解除快捷键绑定的目的
            for (var r = 0; r < _handlers[key].length; r++) {
                obj = _handlers[key][r];
                //判断是否在范围内并且键值相同
                if (obj.scope === scope && compareArray(obj.mods, mods)) {
                    _handlers[key][r] = {};
                }
            }
        }
    }
    //循环删除handlers中的所有 scope(范围)
    function deleteScope(scope) {
        var key, handlers, i;
        for (key in _handlers) {
            handlers = _handlers[key];
            for (i = 0; i < handlers.length; ) {
                if (handlers[i].scope === scope) handlers.splice(i, 1); else i++;
            }
        }
    }
    //比较修饰键的数组
    function compareArray(a1, a2) {
        if (a1.length !== a2.length) return false;
        for (var i = 0; i < a1.length; i++) {
            if (a1[i] !== a2[i]) return false;
        }
        return true;
    }
    //表单控件控件判断 返回 Boolean
    function filter(event) {
        var tagName = (event.target || event.srcElement).tagName;
        //忽略这些标签情况下快捷键无效
        return !(tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA");
    }
    //修饰键转换成对应的键码
    function getMods(key) {
        var mods = key.slice(0, key.length - 1);
        for (var i = 0; i < mods.length; i++) mods[i] = _modifier[mods[i]];
        return mods;
    }
    //处理传的key字符串转换成数组
    function getKeys(key) {
        var keys;
        key = key.replace(/\s/g, "");
        //匹配任何空白字符,包括空格、制表符、换页符等等
        keys = key.split(",");
        if (keys[keys.length - 1] === "") keys[keys.length - 2] += ",";
        return keys;
    }
    //在全局document上设置快捷键
    addEvent(document, "keydown", function(event) {
        dispatch(event);
    });
    addEvent(document, "keyup", function(event) {
        clearModifier(event);
    });
    //清除修饰键
    function clearModifier(event) {
        var key = event.keyCode || e.which || e.charCode, i = _downKeys.indexOf(key);
        if (i >= 0) _downKeys.splice(i, 1);
        //修饰键 shiftKey altKey ctrlKey (command||metaKey) 清除
        if (key === 93 || key === 224) key = 91;
        if (key in _mods) {
            _mods[key] = false;
            for (var k in _modifier) if (_modifier[k] === key) hotkeys[k] = false;
        }
    }
    //主体hotkeys函数
    function hotkeys(key, scope, method) {
        var keys = getKeys(key), mods = [], i = 0;
        //对为设定范围的判断
        if (method === undefined) {
            method = scope;
            scope = "all";
        }
        //对于每个快捷键处理
        for (;i < keys.length; i++) {
            key = keys[i].split("+");
            mods = [];
            //如果是组合快捷键取得组合快捷键
            if (key.length > 1) {
                mods = getMods(key);
                key = [ key[key.length - 1] ];
            }
            //转换成键码
            key = key[0];
            key = key === "*" ? "*" : code(key);
            //判断key是否在_handlers中，不在就赋一个空数组
            if (!(key in _handlers)) _handlers[key] = [];
            _handlers[key].push({
                shortcut: keys[i],
                scope: scope,
                method: method,
                key: keys[i],
                mods: mods
            });
        }
    }
    _api = {
        setScope: setScope,
        getScope: getScope,
        deleteScope: deleteScope,
        getPressedKeyCodes: getPressedKeyCodes,
        isPressed: isPressed,
        filter: filter,
        unbind: unbind
    };
    for (var a in _api) hotkeys[a] = _api[a];
    var _hotkeys = window.hotkeys;
    hotkeys.noConflict = function(deep) {
        if (deep && window.hotkeys === hotkeys) {
            window.hotkeys = _hotkeys;
        }
        return hotkeys;
    };
    window.hotkeys = hotkeys;
    return hotkeys;
});
