/*!
 * hotkeys-js v4.0.2
 * A simple micro-library for defining and dispatching keyboard shortcuts. It has no dependencies.
 * 
 * @author kenny wong <wowohoo@qq.com>
 * @license MIT
 * @homepage https://jaywcjlove.github.io/hotkeys-js
 */
const isff = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase().indexOf("firefox") > 0 : false;
function addEvent(object, event, method, useCapture) {
  if (object.addEventListener) {
    object.addEventListener(event, method, useCapture);
  } else if (object.attachEvent) {
    object.attachEvent(`on${event}`, method);
  }
}
function removeEvent(object, event, method, useCapture) {
  if (!object) return;
  if (object.removeEventListener) {
    object.removeEventListener(event, method, useCapture);
  } else if (object.detachEvent) {
    object.detachEvent(`on${event}`, method);
  }
}
function getMods(modifier, key) {
  const modsKeys = key.slice(0, key.length - 1);
  const modsCodes = [];
  for (let i = 0; i < modsKeys.length; i++) {
    modsCodes.push(modifier[modsKeys[i].toLowerCase()]);
  }
  return modsCodes;
}
function getKeys(key) {
  if (typeof key !== "string") key = "";
  key = key.replace(/\s/g, "");
  const keys = key.split(",");
  let index = keys.lastIndexOf("");
  for (; index >= 0; ) {
    keys[index - 1] += ",";
    keys.splice(index, 1);
    index = keys.lastIndexOf("");
  }
  return keys;
}
function compareArray(a1, a2) {
  const arr1 = a1.length >= a2.length ? a1 : a2;
  const arr2 = a1.length >= a2.length ? a2 : a1;
  let isIndex = true;
  for (let i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) === -1) isIndex = false;
  }
  return isIndex;
}
function getLayoutIndependentKeyCode(event) {
  let key = event.keyCode || event.which || event.charCode;
  if (event.code && /^Key[A-Z]$/.test(event.code)) {
    key = event.code.charCodeAt(3);
  }
  return key;
}
const _keyMap = {
  backspace: 8,
  "⌫": 8,
  tab: 9,
  clear: 12,
  enter: 13,
  "↩": 13,
  return: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  /// https://w3c.github.io/uievents/#events-keyboard-key-location
  arrowup: 38,
  arrowdown: 40,
  arrowleft: 37,
  arrowright: 39,
  del: 46,
  delete: 46,
  ins: 45,
  insert: 45,
  home: 36,
  end: 35,
  pageup: 33,
  pagedown: 34,
  capslock: 20,
  num_0: 96,
  num_1: 97,
  num_2: 98,
  num_3: 99,
  num_4: 100,
  num_5: 101,
  num_6: 102,
  num_7: 103,
  num_8: 104,
  num_9: 105,
  num_multiply: 106,
  num_add: 107,
  num_enter: 108,
  num_subtract: 109,
  num_decimal: 110,
  num_divide: 111,
  "⇪": 20,
  ",": 188,
  ".": 190,
  "/": 191,
  "`": 192,
  "-": isff ? 173 : 189,
  "=": isff ? 61 : 187,
  ";": isff ? 59 : 186,
  "'": 222,
  "{": 219,
  "}": 221,
  "[": 219,
  "]": 221,
  "\\": 220
};
const _modifier = {
  // shiftKey
  "⇧": 16,
  shift: 16,
  // altKey
  "⌥": 18,
  alt: 18,
  option: 18,
  // ctrlKey
  "⌃": 17,
  ctrl: 17,
  control: 17,
  // metaKey
  "⌘": 91,
  cmd: 91,
  meta: 91,
  command: 91
};
const modifierMap = {
  16: "shiftKey",
  18: "altKey",
  17: "ctrlKey",
  91: "metaKey",
  shiftKey: 16,
  ctrlKey: 17,
  altKey: 18,
  metaKey: 91
};
const _mods = {
  16: false,
  18: false,
  17: false,
  91: false
};
const _handlers = {};
for (let k = 1; k < 20; k++) {
  _keyMap[`f${k}`] = 111 + k;
}
let _downKeys = [];
let winListendFocus = null;
let winListendFullscreen = null;
let _scope = "all";
const elementEventMap = /* @__PURE__ */ new Map();
const code = (x) => _keyMap[x.toLowerCase()] || _modifier[x.toLowerCase()] || x.toUpperCase().charCodeAt(0);
const getKey = (x) => Object.keys(_keyMap).find((k) => _keyMap[k] === x);
const getModifier = (x) => Object.keys(_modifier).find((k) => _modifier[k] === x);
const setScope = (scope) => {
  _scope = scope || "all";
};
const getScope = () => {
  return _scope || "all";
};
const getPressedKeyCodes = () => {
  return _downKeys.slice(0);
};
const getPressedKeyString = () => {
  return _downKeys.map(
    (c) => getKey(c) || getModifier(c) || String.fromCharCode(c)
  );
};
const getAllKeyCodes = () => {
  const result = [];
  Object.keys(_handlers).forEach((k) => {
    _handlers[k].forEach(({ key, scope, mods, shortcut }) => {
      result.push({
        scope,
        shortcut,
        mods,
        keys: key.split("+").map((v) => code(v))
      });
    });
  });
  return result;
};
const filter = (event) => {
  const target = event.target || event.srcElement;
  const { tagName } = target;
  let flag = true;
  const isInput = tagName === "INPUT" && ![
    "checkbox",
    "radio",
    "range",
    "button",
    "file",
    "reset",
    "submit",
    "color"
  ].includes(target.type);
  if (target.isContentEditable || (isInput || tagName === "TEXTAREA" || tagName === "SELECT") && !target.readOnly) {
    flag = false;
  }
  return flag;
};
const isPressed = (keyCode) => {
  if (typeof keyCode === "string") {
    keyCode = code(keyCode);
  }
  return _downKeys.indexOf(keyCode) !== -1;
};
const deleteScope = (scope, newScope) => {
  let handlers;
  let i;
  if (!scope) scope = getScope();
  for (const key in _handlers) {
    if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length; ) {
        if (handlers[i].scope === scope) {
          const deleteItems = handlers.splice(i, 1);
          deleteItems.forEach(({ element }) => removeKeyEvent(element));
        } else {
          i++;
        }
      }
    }
  }
  if (getScope() === scope) setScope(newScope || "all");
};
function clearModifier(event) {
  let key = getLayoutIndependentKeyCode(event);
  if (event.key && event.key.toLowerCase() === "capslock") {
    key = code(event.key);
  }
  const i = _downKeys.indexOf(key);
  if (i >= 0) {
    _downKeys.splice(i, 1);
  }
  if (event.key && event.key.toLowerCase() === "meta") {
    _downKeys.splice(0, _downKeys.length);
  }
  if (key === 93 || key === 224) key = 91;
  if (key in _mods) {
    _mods[key] = false;
    for (const k in _modifier)
      if (_modifier[k] === key) hotkeys[k] = false;
  }
}
const unbind = (keysInfo, ...args) => {
  if (typeof keysInfo === "undefined") {
    Object.keys(_handlers).forEach((key) => {
      if (Array.isArray(_handlers[key])) {
        _handlers[key].forEach((info) => eachUnbind(info));
      }
      delete _handlers[key];
    });
    removeKeyEvent(null);
  } else if (Array.isArray(keysInfo)) {
    keysInfo.forEach((info) => {
      if (info.key) eachUnbind(info);
    });
  } else if (typeof keysInfo === "object") {
    if (keysInfo.key) eachUnbind(keysInfo);
  } else if (typeof keysInfo === "string") {
    let [scope, method] = args;
    if (typeof scope === "function") {
      method = scope;
      scope = "";
    }
    eachUnbind({
      key: keysInfo,
      scope,
      method,
      splitKey: "+"
    });
  }
};
const eachUnbind = ({
  key,
  scope,
  method,
  splitKey = "+"
}) => {
  const multipleKeys = getKeys(key);
  multipleKeys.forEach((originKey) => {
    const unbindKeys = originKey.split(splitKey);
    const len = unbindKeys.length;
    const lastKey = unbindKeys[len - 1];
    const keyCode = lastKey === "*" ? "*" : code(lastKey);
    if (!_handlers[keyCode]) return;
    if (!scope) scope = getScope();
    const mods = len > 1 ? getMods(_modifier, unbindKeys) : [];
    const unbindElements = [];
    _handlers[keyCode] = _handlers[keyCode].filter((record) => {
      const isMatchingMethod = method ? record.method === method : true;
      const isUnbind = isMatchingMethod && record.scope === scope && compareArray(record.mods, mods);
      if (isUnbind) unbindElements.push(record.element);
      return !isUnbind;
    });
    unbindElements.forEach((element) => removeKeyEvent(element));
  });
};
function eventHandler(event, handler, scope, element) {
  if (handler.element !== element) {
    return;
  }
  let modifiersMatch;
  if (handler.scope === scope || handler.scope === "all") {
    modifiersMatch = handler.mods.length > 0;
    for (const y in _mods) {
      if (Object.prototype.hasOwnProperty.call(_mods, y)) {
        if (!_mods[y] && handler.mods.indexOf(+y) > -1 || _mods[y] && handler.mods.indexOf(+y) === -1) {
          modifiersMatch = false;
        }
      }
    }
    if (handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch || handler.shortcut === "*") {
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
function dispatch(event, element) {
  const asterisk = _handlers["*"];
  let key = getLayoutIndependentKeyCode(event);
  if (event.key && event.key.toLowerCase() === "capslock") {
    return;
  }
  const filterFn = hotkeys.filter || filter;
  if (!filterFn.call(this, event)) return;
  if (key === 93 || key === 224) key = 91;
  if (_downKeys.indexOf(key) === -1 && key !== 229) _downKeys.push(key);
  ["metaKey", "ctrlKey", "altKey", "shiftKey"].forEach((keyName) => {
    const keyNum = modifierMap[keyName];
    if (event[keyName] && _downKeys.indexOf(keyNum) === -1) {
      _downKeys.push(keyNum);
    } else if (!event[keyName] && _downKeys.indexOf(keyNum) > -1) {
      _downKeys.splice(_downKeys.indexOf(keyNum), 1);
    } else if (keyName === "metaKey" && event[keyName]) {
      _downKeys = _downKeys.filter((k) => k in modifierMap || k === key);
    }
  });
  if (key in _mods) {
    _mods[key] = true;
    for (const k in _modifier) {
      if (Object.prototype.hasOwnProperty.call(_modifier, k)) {
        const eventKey = modifierMap[_modifier[k]];
        hotkeys[k] = event[eventKey];
      }
    }
    if (!asterisk) return;
  }
  for (const e in _mods) {
    if (Object.prototype.hasOwnProperty.call(_mods, e)) {
      _mods[e] = event[modifierMap[e]];
    }
  }
  if (event.getModifierState && !(event.altKey && !event.ctrlKey) && event.getModifierState("AltGraph")) {
    if (_downKeys.indexOf(17) === -1) {
      _downKeys.push(17);
    }
    if (_downKeys.indexOf(18) === -1) {
      _downKeys.push(18);
    }
    _mods[17] = true;
    _mods[18] = true;
  }
  const scope = getScope();
  if (asterisk) {
    for (let i = 0; i < asterisk.length; i++) {
      if (asterisk[i].scope === scope && (event.type === "keydown" && asterisk[i].keydown || event.type === "keyup" && asterisk[i].keyup)) {
        eventHandler(event, asterisk[i], scope, element);
      }
    }
  }
  if (!(key in _handlers)) return;
  const handlerKey = _handlers[key];
  const keyLen = handlerKey.length;
  for (let i = 0; i < keyLen; i++) {
    if (event.type === "keydown" && handlerKey[i].keydown || event.type === "keyup" && handlerKey[i].keyup) {
      if (handlerKey[i].key) {
        const record = handlerKey[i];
        const { splitKey } = record;
        const keyShortcut = record.key.split(splitKey);
        const _downKeysCurrent = [];
        for (let a = 0; a < keyShortcut.length; a++) {
          _downKeysCurrent.push(code(keyShortcut[a]));
        }
        if (_downKeysCurrent.sort().join("") === _downKeys.sort().join("")) {
          eventHandler(event, record, scope, element);
        }
      }
    }
  }
}
const hotkeys = function hotkeys2(key, option, method) {
  _downKeys = [];
  const keys = getKeys(key);
  let mods = [];
  let scope = "all";
  let element = document;
  let i = 0;
  let keyup = false;
  let keydown = true;
  let splitKey = "+";
  let capture = false;
  let single = false;
  if (method === void 0 && typeof option === "function") {
    method = option;
  }
  if (Object.prototype.toString.call(option) === "[object Object]") {
    const opts = option;
    if (opts.scope) scope = opts.scope;
    if (opts.element) element = opts.element;
    if (opts.keyup) keyup = opts.keyup;
    if (opts.keydown !== void 0) keydown = opts.keydown;
    if (opts.capture !== void 0) capture = opts.capture;
    if (typeof opts.splitKey === "string") splitKey = opts.splitKey;
    if (opts.single === true) single = true;
  }
  if (typeof option === "string") scope = option;
  if (single) unbind(key, scope);
  for (; i < keys.length; i++) {
    const currentKey = keys[i].split(splitKey);
    mods = [];
    if (currentKey.length > 1) mods = getMods(_modifier, currentKey);
    let finalKey = currentKey[currentKey.length - 1];
    finalKey = finalKey === "*" ? "*" : code(finalKey);
    if (!(finalKey in _handlers)) _handlers[finalKey] = [];
    _handlers[finalKey].push({
      keyup,
      keydown,
      scope,
      mods,
      shortcut: keys[i],
      method,
      key: keys[i],
      splitKey,
      element
    });
  }
  if (typeof element !== "undefined" && typeof window !== "undefined") {
    if (!elementEventMap.has(element)) {
      const keydownListener = (event = window.event) => dispatch(event, element);
      const keyupListenr = (event = window.event) => {
        dispatch(event, element);
        clearModifier(event);
      };
      elementEventMap.set(element, { keydownListener, keyupListenr, capture });
      addEvent(element, "keydown", keydownListener, capture);
      addEvent(element, "keyup", keyupListenr, capture);
    }
    if (!winListendFocus) {
      const listener = () => {
        _downKeys = [];
      };
      winListendFocus = { listener, capture };
      addEvent(window, "focus", listener, capture);
    }
    if (!winListendFullscreen && typeof document !== "undefined") {
      const onFullscreenChange = () => {
        _downKeys = [];
        for (const k in _mods) _mods[k] = false;
        for (const k in _modifier) hotkeys2[k] = false;
      };
      const fullscreenListener = onFullscreenChange;
      const webkitListener = onFullscreenChange;
      document.addEventListener("fullscreenchange", fullscreenListener);
      document.addEventListener("webkitfullscreenchange", webkitListener);
      winListendFullscreen = { fullscreen: fullscreenListener, webkit: webkitListener };
    }
  }
};
function trigger(shortcut, scope = "all") {
  Object.keys(_handlers).forEach((key) => {
    const dataList = _handlers[key].filter(
      (item) => item.scope === scope && item.shortcut === shortcut
    );
    dataList.forEach((data) => {
      if (data && data.method) {
        data.method({}, data);
      }
    });
  });
}
function removeKeyEvent(element) {
  const values = Object.values(_handlers).flat();
  const findindex = values.findIndex(({ element: el }) => el === element);
  if (findindex < 0 && element) {
    const { keydownListener, keyupListenr, capture } = elementEventMap.get(element) || {};
    if (keydownListener && keyupListenr) {
      removeEvent(element, "keyup", keyupListenr, capture);
      removeEvent(element, "keydown", keydownListener, capture);
      elementEventMap.delete(element);
    }
  }
  if (values.length <= 0 || elementEventMap.size <= 0) {
    const eventKeys = Array.from(elementEventMap.keys());
    eventKeys.forEach((el) => {
      const { keydownListener, keyupListenr, capture } = elementEventMap.get(el) || {};
      if (keydownListener && keyupListenr) {
        removeEvent(el, "keyup", keyupListenr, capture);
        removeEvent(el, "keydown", keydownListener, capture);
        elementEventMap.delete(el);
      }
    });
    elementEventMap.clear();
    Object.keys(_handlers).forEach((key) => delete _handlers[key]);
    if (winListendFocus) {
      const { listener, capture } = winListendFocus;
      removeEvent(window, "focus", listener, capture);
      winListendFocus = null;
    }
    if (winListendFullscreen && typeof document !== "undefined") {
      document.removeEventListener("fullscreenchange", winListendFullscreen.fullscreen);
      document.removeEventListener("webkitfullscreenchange", winListendFullscreen.webkit);
      winListendFullscreen = null;
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
  modifierMap
};
for (const a in _api) {
  const key = a;
  if (Object.prototype.hasOwnProperty.call(_api, key)) {
    hotkeys[key] = _api[key];
  }
}
if (typeof window !== "undefined") {
  const _hotkeys = window.hotkeys;
  hotkeys.noConflict = (deep) => {
    if (deep && window.hotkeys === hotkeys) {
      window.hotkeys = _hotkeys;
    }
    return hotkeys;
  };
  window.hotkeys = hotkeys;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = hotkeys;
  module.exports.default = hotkeys;
}
export {
  hotkeys as default
};
//# sourceMappingURL=hotkeys-js.js.map
