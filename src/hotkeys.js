;(function(root, factory) {
    var hotkeys = factory(root);
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('hotkeys', function() { return hotkeys; });
    } else if (typeof exports === 'object') {
        // Node.js
        module.exports = hotkeys;
    } else {
        // Browser globals
        // previousKey存储先前定义的关键字
        var previousKey = root.hotkeys;
        hotkeys.noConflict = function() {
            var k = root.hotkeys;
            root.hotkeys = previousKey;
            return k;
        };
        root.hotkeys = hotkeys;
    }
}(this, function(root, undefined) {
    var _api,//对外API
    _keyMap = {//特殊键
        backspace: 8, tab: 9, clear: 12,
        enter: 13, 'return': 13,
        esc: 27, escape: 27, space: 32,
        left: 37, up: 38, right: 39, down: 40,
        del: 46, 'delete': 46,
        home: 36, end: 35,
        pageup: 33, pagedown: 34,
        ',': 188, '.': 190, '/': 191,
        '`': 192, '-': 189, '=': 187,
        ';': 186, '\'': 222,
        '[': 219, ']': 221, '\\': 220
    },
    _scope = 'all',//默认热键范围
    _modifier = {//修饰键
        '⇧': 16, shift: 16,
        '⌥': 18, alt: 18, option: 18,
        '⌃': 17, ctrl: 17, control: 17,
        '⌘': 91, command: 91
    },
    _downKeys=[],//记录绑定的键
    modifierMap = {
        16:'shiftKey',
        18:'altKey',
        17:'ctrlKey',
        91:'metaKey'
    },
    _mods = { 16: false, 18: false, 17: false, 91: false },
    //返回键码
    code = function(x){ 
      return _keyMap[x] || x.toUpperCase().charCodeAt(0);
    },
    _handlers={};
    // F1~F12 特殊键
    for(k=1;k<20;k++) {
        _keyMap['f'+k] = 111+k;
    }

    //设置获取当前范围（默认为'所有'）
    function setScope(scope){ _scope = scope || 'all';}
    function getScope(){ return _scope || 'all';}
    //绑定事件
    function addEvent(object, event, method) {
        if (object.addEventListener){
            object.addEventListener(event, method, false);
        }else if(object.attachEvent){
            object.attachEvent('on'+event, function(){ method(window.event); });
        }
    }
    //判断摁下的键是否为某个键，返回true或者false
    function isPressed(keyCode) {
        if(typeof(keyCode) === 'string'){
            keyCode = code(keyCode);//转换成键码
        }
        return _downKeys.indexOf(keyCode) !==-1;
    }
    //处理keydown事件
    function dispatch (event) {
        var key = event.keyCode,modifiersMatch,scope,handler;

        //搜集绑定的键
        if(_downKeys.indexOf(key)===-1) _downKeys.push(key);

        //Gecko(Friefox)的command键值224，在Webkit(Chrome)中保持一致
        //Webkit左右command键值不一样
        if(key === 93 || key === 224) key = 91;
        if(key in _mods) {
            _mods[key] = true;
            // 将特殊字符的key注册到 hotkeys 上
            for(var k in _modifier)if(_modifier[k] === key) hotkeys[k] = true; 
            return;
        }
        //将modifierMap里面的修饰键绑定到event中
        for(var e in _mods) _mods[e] = event[modifierMap[e]];
        // key 不在_handlers中返回
        if (!(key in _handlers)) return;
        //获取范围 默认为all
        scope = getScope();
        for (i = 0; i < _handlers[key].length; i++) {
            //找到处理内容
            handler = _handlers[key][i];
            //看它是否在当前范围
            if(handler.scope === scope || handler.scope === 'all'){
                modifiersMatch = handler.mods.length > 0;
                for(var y in _mods){
                    if((!_mods[y] && handler.mods.indexOf(+y) > -1) ||
                        (_mods[y] && handler.mods.indexOf(+y) === -1)) modifiersMatch = false;
                }
                // 调用处理程序，如果是修饰键不做处理
                if((handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch){
                    if(handler.method(event, handler)===false){
                        if(event.preventDefault) event.preventDefault();
                        else event.returnValue = false;
                        if(event.stopPropagation) event.stopPropagation();
                        if(event.cancelBubble) event.cancelBubble = true;
                    }
                }
            }
        }
    }
    addEvent(document, 'keydown', function(event) {
         dispatch(event);
    });
    //修饰键转换成对应的键码
    function getMods (key) {
        var mods = key.slice(0, key.length - 1);
        for (var i = 0; i < mods.length; i++) mods[i] = _modifier[mods[i]];
        return mods;
    }
    //处理传的key字符串转换成数组
    function getKeys(key) {
        var keys;
        key = key.replace(/\s/g, '');//匹配任何空白字符,包括空格、制表符、换页符等等
        keys = key.split(',');
        if ((keys[keys.length - 1]) === '') keys[keys.length - 2] += ',';
        return keys;
    }
    //主体hotkeys函数
    function hotkeys(key,scope,method){
        var keys = getKeys(key), mods=[],i=0;
        //对为设定范围的判断
        if (method === undefined) {
            method = scope;
            scope = 'all';
        }
        //对于每个快捷键处理
        for(;i < keys.length; i++){
            key = keys[i].split('+');
            mods = [];
            //如果是组合快捷键取得组合快捷键
            if (key.length > 1){
                mods = getMods(key);
                key = [key[key.length-1]];
            }
            //转换成键码
            key = key[0];
            key = code(key);
            //判断key是否在_handlers中，不在就赋一个空数组
            if (!(key in _handlers)) _handlers[key] = [];
            _handlers[key].push({shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods});
        }
    }
    _api = {
        setScope:setScope,
        getScope:getScope,
        isPressed:isPressed
    };
    for (var a in _api) hotkeys[a] = _api[a];
    return hotkeys;
}));