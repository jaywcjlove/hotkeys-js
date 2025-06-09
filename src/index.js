import { addEvent, removeEvent, getMods, getKeys, compareArray, isMac } from './utils';
import { _keyMap, _modifier, modifierMap, _mods, _handlers } from './var';

let _downKeys = []; // 记录摁下的绑定键
let winListendFocus = null; // window是否已经监听了focus事件
let _scope = 'all'; // 默认热键范围
const elementEventMap = new Map(); // 已绑定事件的节点记录

// Mac 系统 CapsLock 状态跟踪
let _capsLockState = false; // 当前 CapsLock 状态
let _capsLockPressed = false; // CapsLock 是否被按下
let _capsLockTimer = null; // CapsLock 检测定时器

// 返回键码
const code = (x) => _keyMap[x.toLowerCase()]
  || _modifier[x.toLowerCase()]
  || x.toUpperCase().charCodeAt(0);

const getKey = (x) => Object.keys(_keyMap).find((k) => _keyMap[k] === x);
const getModifier = (x) => Object.keys(_modifier).find((k) => _modifier[k] === x);

// 检测 CapsLock 状态变化
const detectCapsLockState = (event) => {
  if (!isMac()) return;

  // 检查浏览器支持
  if (!event.getModifierState) return;

  try {
    const currentCapsLockState = event.getModifierState('CapsLock');
    // 如果 CapsLock 状态发生变化
    if (currentCapsLockState !== _capsLockState) {
      const previousState = _capsLockState;
      _capsLockState = currentCapsLockState;

      // 如果 CapsLock 从开启变为关闭，且之前有按下记录，触发 keyup
      if (previousState && !currentCapsLockState && _capsLockPressed && _downKeys.indexOf(20) !== -1) {
        // 触发模拟的 keyup 事件
        triggerCapsLockKeyup(event);
        _capsLockPressed = false;
      }
    }
  } catch (error) {
    // 静默处理 getModifierState 可能的异常，避免影响正常功能
    // eslint-disable-next-line no-unused-vars
    const silentError = error;
  }
};

// 触发 CapsLock 模拟 keyup 事件
const triggerCapsLockKeyup = (originalEvent) => {
  // 使用 requestAnimationFrame 而不是 setTimeout 以获得更好的性能
  requestAnimationFrame(() => {
    const syntheticEvent = {
      type: 'keyup',
      keyCode: 20,
      which: 20,
      charCode: 20,
      key: 'CapsLock',
      target: originalEvent.target || document,
      preventDefault: () => {},
      stopPropagation: () => {},
      cancelBubble: false,
      isSynthetic: true, // 标记为模拟事件
      getModifierState: originalEvent.getModifierState ? originalEvent.getModifierState.bind(originalEvent) : null,
    };

    // 清除 CapsLock 键的按下状态
    clearModifier(syntheticEvent);

    // 触发相关的 keyup 处理 - 改进处理逻辑
    if (_handlers[20]) {
      const handlerKey = _handlers[20];
      const targetElement = originalEvent.target || document;
      const currentScope = getScope();
      for (let i = 0; i < handlerKey.length; i++) {
        const handler = handlerKey[i];
        if (handler.keyup && (handler.element === targetElement || handler.element === document)) {
          eventHandler(syntheticEvent, handler, currentScope, targetElement);
        }
      }
    }
  });
};

// 设置获取当前范围（默认为'所有'）
function setScope(scope) {
  _scope = scope || 'all';
}
// 获取当前范围
function getScope() {
  return _scope || 'all';
}
// 获取摁下绑定键的键值
function getPressedKeyCodes() {
  return _downKeys.slice(0);
}

function getPressedKeyString() {
  return _downKeys.map((c) => getKey(c) || getModifier(c) || String.fromCharCode(c));
}

function getAllKeyCodes() {
  const result = [];
  Object.keys(_handlers).forEach((k) => {
    _handlers[k].forEach(({ key, scope, mods, shortcut }) => {
      result.push({
        scope,
        shortcut,
        mods,
        keys: key.split('+').map((v) => code(v)),
      });
    });
  });
  return result;
}

// 表单控件控件判断 返回 Boolean
// hotkey is effective only when filter return true
function filter(event) {
  const target = event.target || event.srcElement;
  const { tagName } = target;
  let flag = true;
  const isInput = tagName === 'INPUT' && !['checkbox', 'radio', 'range', 'button', 'file', 'reset', 'submit', 'color'].includes(target.type);
  // ignore: isContentEditable === 'true', <input> and <textarea> when readOnly state is false, <select>
  if (
    target.isContentEditable
    || ((isInput || tagName === 'TEXTAREA' || tagName === 'SELECT') && !target.readOnly)
  ) {
    flag = false;
  }
  return flag;
}

// 判断摁下的键是否为某个键，返回true或者false
function isPressed(keyCode) {
  if (typeof keyCode === 'string') {
    keyCode = code(keyCode); // 转换成键码
  }
  return _downKeys.indexOf(keyCode) !== -1;
}

// 循环删除handlers中的所有 scope(范围)
function deleteScope(scope, newScope) {
  let handlers;
  let i;

  // 没有指定scope，获取scope
  if (!scope) scope = getScope();

  for (const key in _handlers) {
    if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length;) {
        if (handlers[i].scope === scope) {
          const deleteItems = handlers.splice(i, 1);
          deleteItems.forEach(({ element }) => removeKeyEvent(element));
        } else {
          i++;
        }
      }
    }
  }

  // 如果scope被删除，将scope重置为all
  if (getScope() === scope) setScope(newScope || 'all');
}

// 清除修饰键
function clearModifier(event) {
  let key = event.keyCode || event.which || event.charCode;
  const i = _downKeys.indexOf(key);

  // 从列表中清除按压过的键
  if (i >= 0) {
    _downKeys.splice(i, 1);
  }
  // 特殊处理 cmmand 键，在 cmmand 组合快捷键 keyup 只执行一次的问题
  if (event.key && event.key.toLowerCase() === 'meta') {
    _downKeys.splice(0, _downKeys.length);
  }

  // 修饰键 shiftKey altKey ctrlKey (command||metaKey) 清除
  if (key === 93 || key === 224) key = 91;
  if (key in _mods) {
    _mods[key] = false;

    // 将修饰键重置为false
    for (const k in _modifier) if (_modifier[k] === key) hotkeys[k] = false;

    // 特殊处理 CapsLock 键
    if (key === 20 && isMac()) {
      _capsLockPressed = false;
      // 清除 CapsLock 定时器
      if (_capsLockTimer) {
        clearTimeout(_capsLockTimer);
        _capsLockTimer = null;
      }
    }
  }
}

function unbind(keysInfo, ...args) {
  // unbind(), unbind all keys
  if (typeof keysInfo === 'undefined') {
    Object.keys(_handlers).forEach((key) => {
      Array.isArray(_handlers[key]) && _handlers[key].forEach((info) => eachUnbind(info));
      delete _handlers[key];
    });
    removeKeyEvent(null);
  } else if (Array.isArray(keysInfo)) {
    // support like : unbind([{key: 'ctrl+a', scope: 's1'}, {key: 'ctrl-a', scope: 's2', splitKey: '-'}])
    keysInfo.forEach((info) => {
      if (info.key) eachUnbind(info);
    });
  } else if (typeof keysInfo === 'object') {
    // support like unbind({key: 'ctrl+a, ctrl+b', scope:'abc'})
    if (keysInfo.key) eachUnbind(keysInfo);
  } else if (typeof keysInfo === 'string') {
    // support old method
    // eslint-disable-line
    let [scope, method] = args;
    if (typeof scope === 'function') {
      method = scope;
      scope = '';
    }
    eachUnbind({
      key: keysInfo,
      scope,
      method,
      splitKey: '+',
    });
  }
}

// 解除绑定某个范围的快捷键
const eachUnbind = ({
  key, scope, method, splitKey = '+',
}) => {
  const multipleKeys = getKeys(key);
  multipleKeys.forEach((originKey) => {
    const unbindKeys = originKey.split(splitKey);
    const len = unbindKeys.length;
    const lastKey = unbindKeys[len - 1];
    const keyCode = lastKey === '*' ? '*' : code(lastKey);
    if (!_handlers[keyCode]) return;
    // 判断是否传入范围，没有就获取范围
    if (!scope) scope = getScope();
    const mods = len > 1 ? getMods(_modifier, unbindKeys) : [];
    const unbindElements = [];
    _handlers[keyCode] = _handlers[keyCode].filter((record) => {
      // 通过函数判断，是否解除绑定，函数相等直接返回
      const isMatchingMethod = method ? record.method === method : true;
      const isUnbind = isMatchingMethod && record.scope === scope && compareArray(record.mods, mods);
      if (isUnbind) unbindElements.push(record.element);
      return !isUnbind;
    });
    unbindElements.forEach((element) => removeKeyEvent(element));
  });
};

// 对监听对应快捷键的回调函数进行处理
function eventHandler(event, handler, scope, element) {
  if (handler.element !== element) {
    return;
  }
  let modifiersMatch;

  // 看它是否在当前范围
  if (handler.scope === scope || handler.scope === 'all') {
    // 检查是否匹配修饰符（如果有返回true）
    modifiersMatch = handler.mods.length > 0;

    for (const y in _mods) {
      if (Object.prototype.hasOwnProperty.call(_mods, y)) {
        if (
          (!_mods[y] && handler.mods.indexOf(+y) > -1)
          || (_mods[y] && handler.mods.indexOf(+y) === -1)
        ) {
          modifiersMatch = false;
        }
      }
    }

    // 调用处理程序，如果是修饰键不做处理
    if (
      (handler.mods.length === 0
        && !_mods[16]
        && !_mods[18]
        && !_mods[17]
        && !_mods[91])
      || modifiersMatch
      || handler.shortcut === '*'
    ) {
      handler.keys = [];
      handler.keys = handler.keys.concat(_downKeys);
      if (handler.method(event, handler) === false) {
        if (event.preventDefault) event.preventDefault();
        else event.returnValue = false;
        if (event.stopPropagation) event.stopPropagation();
        if (event.cancelBubble) event.cancelBubble = true;
      }
    }
  }
}

// 处理keydown事件
function dispatch(event, element) {
  const asterisk = _handlers['*'];
  let key = event.keyCode || event.which || event.charCode;

  // 表单控件过滤 默认表单控件不触发快捷键
  if (!hotkeys.filter.call(this, event)) return;

  // Gecko(Firefox)的command键值224，在Webkit(Chrome)中保持一致
  // Webkit左右 command 键值不一样
  if (key === 93 || key === 224) key = 91;

  // 特殊处理 Mac 系统的 CapsLock 键
  if (key === 20 && isMac()) {
    if (event.type === 'keydown') {
      _capsLockPressed = true;
      // 清除之前的定时器
      if (_capsLockTimer) {
        clearTimeout(_capsLockTimer);
      }
      // 设置一个定时器来检测 CapsLock 释放
      // 在 Mac 上，CapsLock 的 keyup 事件可能不会触发，所以我们用定时器来模拟
      _capsLockTimer = setTimeout(() => {
        if (_capsLockPressed && _downKeys.indexOf(20) !== -1) {
          // 使用统一的辅助函数触发 keyup 事件
          triggerCapsLockKeyup(event);
          _capsLockPressed = false;
        }
        _capsLockTimer = null;
      }, 100); // 100ms 后触发 keyup
      // 检测 CapsLock 状态变化
      detectCapsLockState(event);
    } else if (event.type === 'keyup') {
      // 如果收到了真实的 keyup 事件，清除定时器和状态
      _capsLockPressed = false;
      if (_capsLockTimer) {
        clearTimeout(_capsLockTimer);
        _capsLockTimer = null;
      }
    }
  }

  /**
   * Collect bound keys
   * If an Input Method Editor is processing key input and the event is keydown, return 229.
   * https://stackoverflow.com/questions/25043934/is-it-ok-to-ignore-keydown-events-with-keycode-229
   * http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
   */
  if (_downKeys.indexOf(key) === -1 && key !== 229) _downKeys.push(key);
  /**
   * Jest test cases are required.
   * ===============================
   */
  ['metaKey', 'ctrlKey', 'altKey', 'shiftKey'].forEach((keyName) => {
    const keyNum = modifierMap[keyName];
    if (event[keyName] && _downKeys.indexOf(keyNum) === -1) {
      _downKeys.push(keyNum);
    } else if (!event[keyName] && _downKeys.indexOf(keyNum) > -1) {
      _downKeys.splice(_downKeys.indexOf(keyNum), 1);
    } else if (keyName === 'metaKey' && event[keyName]) {
      // 如果command被按下，那就清空所有除event按键外的非装饰键。
      // 因为command被按下的情况下非装饰键的keyup永远都不会触发。这是已知的浏览器限制。
      // If command key is pressed, clear all non-decorating keys except for key in event.
      // This is because keyup for a non-decorating key will NEVER be triggered when command is pressed.
      // This is a known browser limitation.
      _downKeys = _downKeys.filter((k) => k in modifierMap || k === key);
    }
  });
  /**
   * -------------------------------
   */
  if (key in _mods) {
    _mods[key] = true;
    // 将特殊字符的key注册到 hotkeys 上
    for (const k in _modifier) {
      if (Object.prototype.hasOwnProperty.call(_modifier, k)) {
        const eventKey = modifierMap[_modifier[k]];
        hotkeys[k] = event[eventKey];
      }
    }

    if (!asterisk) return;
  }

  // 将 modifierMap 里面的修饰键绑定到 event 中
  for (const e in _mods) {
    if (Object.prototype.hasOwnProperty.call(_mods, e)) {
      _mods[e] = event[modifierMap[e]];
    }
  }
  /**
   * https://github.com/jaywcjlove/hotkeys/pull/129
   * This solves the issue in Firefox on Windows where hotkeys corresponding to special characters would not trigger.
   * An example of this is ctrl+alt+m on a Swedish keyboard which is used to type μ.
   * Browser support: https://caniuse.com/#feat=keyboardevent-getmodifierstate
   */
  if (event.getModifierState && (!(event.altKey && !event.ctrlKey) && event.getModifierState('AltGraph'))) {
    if (_downKeys.indexOf(17) === -1) {
      _downKeys.push(17);
    }

    if (_downKeys.indexOf(18) === -1) {
      _downKeys.push(18);
    }

    _mods[17] = true;
    _mods[18] = true;
  }

  // 获取范围 默认为 `all`
  const scope = getScope();
  // 对任何快捷键都需要做的处理
  if (asterisk) {
    for (let i = 0; i < asterisk.length; i++) {
      if (
        asterisk[i].scope === scope
        && ((event.type === 'keydown' && asterisk[i].keydown)
        || (event.type === 'keyup' && asterisk[i].keyup))
      ) {
        eventHandler(event, asterisk[i], scope, element);
      }
    }
  }
  // key 不在 _handlers 中返回
  if (!(key in _handlers)) return;

  const handlerKey = _handlers[key];
  const keyLen = handlerKey.length;
  for (let i = 0; i < keyLen; i++) {
    if (
      (event.type === 'keydown' && handlerKey[i].keydown)
      || (event.type === 'keyup' && handlerKey[i].keyup)
    ) {
      if (handlerKey[i].key) {
        const record = handlerKey[i];
        const { splitKey } = record;
        const keyShortcut = record.key.split(splitKey);
        const _downKeysCurrent = []; // 记录当前按键键值
        for (let a = 0; a < keyShortcut.length; a++) {
          _downKeysCurrent.push(code(keyShortcut[a]));
        }
        if (_downKeysCurrent.sort().join('') === _downKeys.sort().join('')) {
          // 找到处理内容
          eventHandler(event, record, scope, element);
        }
      }
    }
  }

  // 在每次键盘事件后检测 CapsLock 状态变化（仅在非 CapsLock 键事件时检测）
  if (isMac() && key !== 20) {
    detectCapsLockState(event);
  }
}

function hotkeys(key, option, method) {
  _downKeys = [];
  const keys = getKeys(key); // 需要处理的快捷键列表
  let mods = [];
  let scope = 'all'; // scope默认为all，所有范围都有效
  let element = document; // 快捷键事件绑定节点
  let i = 0;
  let keyup = false;
  let keydown = true;
  let splitKey = '+';
  let capture = false;
  let single = false; // 单个callback

  // 对为设定范围的判断
  if (method === undefined && typeof option === 'function') {
    method = option;
  }

  if (Object.prototype.toString.call(option) === '[object Object]') {
    if (option.scope) scope = option.scope; // eslint-disable-line
    if (option.element) element = option.element; // eslint-disable-line
    if (option.keyup) keyup = option.keyup; // eslint-disable-line
    if (option.keydown !== undefined) keydown = option.keydown; // eslint-disable-line
    if (option.capture !== undefined) capture = option.capture; // eslint-disable-line
    if (typeof option.splitKey === 'string') splitKey = option.splitKey; // eslint-disable-line
    if (option.single === true) single = true; // eslint-disable-line
  }

  if (typeof option === 'string') scope = option;

  // 如果只允许单个callback，先unbind
  if (single) unbind(key, scope);

  // 对于每个快捷键进行处理
  for (; i < keys.length; i++) {
    key = keys[i].split(splitKey); // 按键列表
    mods = [];

    // 如果是组合快捷键取得组合快捷键
    if (key.length > 1) mods = getMods(_modifier, key);

    // 将非修饰键转化为键码
    key = key[key.length - 1];
    key = key === '*' ? '*' : code(key); // *表示匹配所有快捷键

    // 判断key是否在_handlers中，不在就赋一个空数组
    if (!(key in _handlers)) _handlers[key] = [];

    _handlers[key].push({
      keyup,
      keydown,
      scope,
      mods,
      shortcut: keys[i],
      method,
      key: keys[i],
      splitKey,
      element,
    });
  }
  // 在全局document上设置快捷键
  if (typeof element !== 'undefined' && window) {
    if (!elementEventMap.has(element)) {
      const keydownListener = (event = window.event) => dispatch(event, element);
      const keyupListenr = (event = window.event) => {
        dispatch(event, element);
        clearModifier(event);
      };
      elementEventMap.set(element, { keydownListener, keyupListenr, capture });
      addEvent(element, 'keydown', keydownListener, capture);
      addEvent(element, 'keyup', keyupListenr, capture);
    }
    if (!winListendFocus) {
      const listener = () => { _downKeys = []; };
      winListendFocus = { listener, capture };
      addEvent(window, 'focus', listener, capture);
    }
  }
}

function trigger(shortcut, scope = 'all') {
  Object.keys(_handlers).forEach((key) => {
    const dataList = _handlers[key].filter((item) => item.scope === scope && item.shortcut === shortcut);
    dataList.forEach((data) => {
      if (data && data.method) {
        data.method();
      }
    });
  });
}

// 销毁事件,unbind之后判断element上是否还有键盘快捷键，如果没有移除监听
function removeKeyEvent(element) {
  const values = Object.values(_handlers).flat();
  const findindex = values.findIndex(({ element: el }) => el === element);

  if (findindex < 0) {
    const { keydownListener, keyupListenr, capture } = elementEventMap.get(element) || {};
    if (keydownListener && keyupListenr) {
      removeEvent(element, 'keyup', keyupListenr, capture);
      removeEvent(element, 'keydown', keydownListener, capture);
      elementEventMap.delete(element);
    }
  }

  if (values.length <= 0 || elementEventMap.size <= 0) {
    // 移除所有的元素上的监听
    const eventKeys = Object.keys(elementEventMap);
    eventKeys.forEach((el) => {
      const { keydownListener, keyupListenr, capture } = elementEventMap.get(el) || {};
      if (keydownListener && keyupListenr) {
        removeEvent(el, 'keyup', keyupListenr, capture);
        removeEvent(el, 'keydown', keydownListener, capture);
        elementEventMap.delete(el);
      }
    });
    // 清空 elementEventMap
    elementEventMap.clear();
    // 清空 _handlers
    Object.keys(_handlers).forEach((key) => delete _handlers[key]);
    // 移除window上的focus监听
    if (winListendFocus) {
      const { listener, capture } = winListendFocus;
      removeEvent(window, 'focus', listener, capture);
      winListendFocus = null;
    }
  }
}

const _api = {
  getPressedKeyString,
  setScope,
  getScope,
  deleteScope,
  getPressedKeyCodes,
  getAllKeyCodes,
  isPressed,
  filter,
  trigger,
  unbind,
  keyMap: _keyMap,
  modifier: _modifier,
  modifierMap,
};
for (const a in _api) {
  if (Object.prototype.hasOwnProperty.call(_api, a)) {
    hotkeys[a] = _api[a];
  }
}

if (typeof window !== 'undefined') {
  const _hotkeys = window.hotkeys;
  hotkeys.noConflict = (deep) => {
    if (deep && window.hotkeys === hotkeys) {
      window.hotkeys = _hotkeys;
    }
    return hotkeys;
  };
  window.hotkeys = hotkeys;
}

export default hotkeys;
