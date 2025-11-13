import { addEvent, removeEvent, getMods, getKeys, compareArray } from './utils';
import {
  _keyMap,
  _modifier,
  modifierMap,
  _mods,
  _handlers,
  Handler,
  KeyHandler,
} from './var';

/** Record the pressed keys */
let _downKeys: number[] = [];
/** Whether the window has already listened to the focus event */
let winListendFocus: { listener: EventListener; capture: boolean } | null = null;
/** Default hotkey scope */
let _scope: string = 'all';
/** Map to record elements with bound events */
const elementEventMap = new Map<
  HTMLElement | Document,
  {
    keydownListener: EventListener;
    keyupListenr: EventListener;
    capture: boolean;
  }
>();

/** Return key code */
const code = (x: string): number => _keyMap[x.toLowerCase()]
  || _modifier[x.toLowerCase()]
  || x.toUpperCase().charCodeAt(0);

const getKey = (x: number): string | undefined => Object.keys(_keyMap).find((k) => _keyMap[k] === x);
const getModifier = (x: number): string | undefined => Object.keys(_modifier).find((k) => _modifier[k] === x);

/** Set or get the current scope (defaults to 'all') */
function setScope(scope: string): void {
  _scope = scope || 'all';
}
/** Get the current scope */
function getScope(): string {
  return _scope || 'all';
}
/** Get the key codes of the currently pressed keys */
function getPressedKeyCodes(): number[] {
  return _downKeys.slice(0);
}

function getPressedKeyString(): string[] {
  return _downKeys.map(
    (c) => getKey(c) || getModifier(c) || String.fromCharCode(c)
  );
}

interface KeyCodeInfo {
  scope: string;
  shortcut: string;
  mods: number[];
  keys: number[];
}

function getAllKeyCodes(): KeyCodeInfo[] {
  const result: KeyCodeInfo[] = [];
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

/** hotkey is effective only when filter return true */
function filter(event: KeyboardEvent): boolean {
  const target = (event.target || event.srcElement) as HTMLElement;
  const { tagName } = target;
  let flag = true;
  const isInput = tagName === 'INPUT'
    && ![
      'checkbox',
      'radio',
      'range',
      'button',
      'file',
      'reset',
      'submit',
      'color',
    ].includes((target as HTMLInputElement).type);
  // ignore: isContentEditable === 'true', <input> and <textarea> when readOnly state is false, <select>
  if (
    (target as any).isContentEditable
    || ((isInput || tagName === 'TEXTAREA' || tagName === 'SELECT')
      && !(target as HTMLInputElement | HTMLTextAreaElement).readOnly)
  ) {
    flag = false;
  }
  return flag;
}

/** Determine whether the pressed key matches a specific key, returns true or false */
function isPressed(keyCode: number | string): boolean {
  if (typeof keyCode === 'string') {
    keyCode = code(keyCode); // Convert to key code
  }
  return _downKeys.indexOf(keyCode) !== -1;
}

/** Loop through and delete all handlers with the specified scope */
function deleteScope(scope?: string, newScope?: string): void {
  let handlers: Handler[];
  let i: number;

  // If no scope is specified, get the current scope
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

  // If the current scope has been deleted, reset the scope to 'all'
  if (getScope() === scope) setScope(newScope || 'all');
}

/** Clear modifier keys */
function clearModifier(event: KeyboardEvent): void {
  let key = event.keyCode || event.which || (event as any).charCode;
  if (event.key && event.key.toLowerCase() === 'capslock') {
    // Ensure that when capturing keystrokes in modern browsers,
    // uppercase and lowercase letters (such as R and r) return the same key value.
    // https://github.com/jaywcjlove/hotkeys-js/pull/514
    // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
    key = code(event.key);
  }
  const i = _downKeys.indexOf(key);

  // Remove the pressed key from the list
  if (i >= 0) {
    _downKeys.splice(i, 1);
  }
  // Special handling for the command key: fix the issue where keyup only triggers once for command combos
  if (event.key && event.key.toLowerCase() === 'meta') {
    _downKeys.splice(0, _downKeys.length);
  }

  // Clear modifier keys: shiftKey, altKey, ctrlKey, (command || metaKey)
  if (key === 93 || key === 224) key = 91;
  if (key in _mods) {
    _mods[key] = false;

    // Reset the modifier key status to false
    for (const k in _modifier) if (_modifier[k] === key) (hotkeys as any)[k] = false;
  }
}

interface UnbindInfo {
  key: string;
  scope?: string;
  method?: KeyHandler;
  splitKey?: string;
}

function unbind(
  keysInfo?: string | UnbindInfo | UnbindInfo[],
  ...args: any[]
): void {
  // unbind(), unbind all keys
  if (typeof keysInfo === 'undefined') {
    Object.keys(_handlers).forEach((key) => {
      if (Array.isArray(_handlers[key])) {
        _handlers[key].forEach((info) => eachUnbind(info));
      }
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

/** Unbind hotkeys for a specific scope */
const eachUnbind = ({
  key,
  scope,
  method,
  splitKey = '+',
}: UnbindInfo): void => {
  const multipleKeys = getKeys(key);
  multipleKeys.forEach((originKey) => {
    const unbindKeys = originKey.split(splitKey);
    const len = unbindKeys.length;
    const lastKey = unbindKeys[len - 1];
    const keyCode = lastKey === '*' ? '*' : code(lastKey);
    if (!_handlers[keyCode]) return;
    // If scope is not provided, get the current scope
    if (!scope) scope = getScope();
    const mods = len > 1 ? getMods(_modifier, unbindKeys) : [];
    const unbindElements: (HTMLElement | Document)[] = [];
    _handlers[keyCode] = _handlers[keyCode].filter((record) => {
      // Check if the method matches; if method is provided, must be equal to unbind
      const isMatchingMethod = method ? record.method === method : true;
      const isUnbind = isMatchingMethod
        && record.scope === scope
        && compareArray(record.mods, mods);
      if (isUnbind) unbindElements.push(record.element);
      return !isUnbind;
    });
    unbindElements.forEach((element) => removeKeyEvent(element));
  });
};

/** Handle the callback function for the corresponding hotkey */
function eventHandler(
  event: KeyboardEvent,
  handler: Handler,
  scope: string,
  element: HTMLElement | Document
): void {
  if (handler.element !== element) {
    return;
  }
  let modifiersMatch: boolean;

  // Check if it is within the current scope
  if (handler.scope === scope || handler.scope === 'all') {
    // Check whether modifier keys match (returns true if they do)
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

    // Call the handler function; ignore if it's only a modifier key
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
        else (event as any).returnValue = false;
        if (event.stopPropagation) event.stopPropagation();
        if ((event as any).cancelBubble) (event as any).cancelBubble = true;
      }
    }
  }
}

/** Handle the keydown event */
function dispatch(
  this: any,
  event: KeyboardEvent,
  element: HTMLElement | Document
): void {
  const asterisk = _handlers['*'];
  let key = event.keyCode || event.which || (event as any).charCode;

  // LAYOUT INDEPENDENCE: Convert event.code to keyCode for layout-independent hotkeys
  // This makes 'ctrl+a' work on Russian/German/any keyboard layout
  if (event.code) {
    const codeMap = {
      KeyA: 65,
      KeyB: 66,
      KeyC: 67,
      KeyD: 68,
      KeyE: 69,
      KeyF: 70,
      KeyG: 71,
      KeyH: 72,
      KeyI: 73,
      KeyJ: 74,
      KeyK: 75,
      KeyL: 76,
      KeyM: 77,
      KeyN: 78,
      KeyO: 79,
      KeyP: 80,
      KeyQ: 81,
      KeyR: 82,
      KeyS: 83,
      KeyT: 84,
      KeyU: 85,
      KeyV: 86,
      KeyW: 87,
      KeyX: 88,
      KeyY: 89,
      KeyZ: 90,
    };
    if (codeMap[event.code as keyof typeof codeMap]) {
      key = codeMap[event.code as keyof typeof codeMap];
    }
  }

  // Ensure that when capturing keystrokes in modern browsers,
  // uppercase and lowercase letters (such as R and r) return the same key value.
  // https://github.com/jaywcjlove/hotkeys-js/pull/514
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
  // CapsLock key
  // There's an issue where `keydown` and `keyup` events are not triggered after CapsLock is enabled to activate uppercase.
  if (event.key && event.key.toLowerCase() === 'capslock') {
    return;
  }
  // Form control filter: by default, shortcut keys are not triggered in form elements
  const filterFn = (hotkeys as any).filter || filter;
  if (!filterFn.call(this, event)) return;

  // In Gecko (Firefox), the command key code is 224; unify it with WebKit (Chrome)
  // In WebKit, left and right command keys have different codes
  if (key === 93 || key === 224) key = 91;

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
    const keyNum = (modifierMap as any)[keyName] as number;
    if ((event as any)[keyName] && _downKeys.indexOf(keyNum) === -1) {
      _downKeys.push(keyNum);
    } else if (!(event as any)[keyName] && _downKeys.indexOf(keyNum) > -1) {
      _downKeys.splice(_downKeys.indexOf(keyNum), 1);
    } else if (keyName === 'metaKey' && (event as any)[keyName]) {
      // If the command key is pressed, clear all non-modifier keys except the current event key.
      // This is because keyup for non-modifier keys will NEVER be triggered when command is pressed.
      // This is a known browser limitation.
      _downKeys = _downKeys.filter((k) => k in modifierMap || k === key);
    }
  });
  /**
   * -------------------------------
   */
  if (key in _mods) {
    _mods[key] = true;
    // Register special modifier keys to the `hotkeys` object
    for (const k in _modifier) {
      if (Object.prototype.hasOwnProperty.call(_modifier, k)) {
        const eventKey = (modifierMap as any)[_modifier[k]] as string;
        (hotkeys as any)[k] = (event as any)[eventKey];
      }
    }

    if (!asterisk) return;
  }

  // Bind the modifier keys in modifierMap to the event
  for (const e in _mods) {
    if (Object.prototype.hasOwnProperty.call(_mods, e)) {
      _mods[e] = (event as any)[(modifierMap as any)[e]];
    }
  }
  /**
   * https://github.com/jaywcjlove/hotkeys/pull/129
   * This solves the issue in Firefox on Windows where hotkeys corresponding to special characters would not trigger.
   * An example of this is ctrl+alt+m on a Swedish keyboard which is used to type μ.
   * Browser support: https://caniuse.com/#feat=keyboardevent-getmodifierstate
   */
  if (
    event.getModifierState
    && !(event.altKey && !event.ctrlKey)
    && event.getModifierState('AltGraph')
  ) {
    if (_downKeys.indexOf(17) === -1) {
      _downKeys.push(17);
    }

    if (_downKeys.indexOf(18) === -1) {
      _downKeys.push(18);
    }

    _mods[17] = true;
    _mods[18] = true;
  }

  // Get the current scope (defaults to 'all')
  const scope = getScope();
  // Handle any hotkeys registered as '*'
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
  // If the key is not registered, return
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
        const _downKeysCurrent: number[] = []; // Store the current key codes
        for (let a = 0; a < keyShortcut.length; a++) {
          _downKeysCurrent.push(code(keyShortcut[a]));
        }
        if (_downKeysCurrent.sort().join('') === _downKeys.sort().join('')) {
          // Match found, call the handler
          eventHandler(event, record, scope, element);
        }
      }
    }
  }
}

interface HotkeysOptions {
  scope?: string;
  element?: HTMLElement | Document;
  keyup?: boolean;
  keydown?: boolean;
  capture?: boolean;
  splitKey?: string;
  single?: boolean;
}

interface HotkeysInterface {
  (key: string, method: KeyHandler): void;
  (key: string, scope: string, method: KeyHandler): void;
  (key: string, option: HotkeysOptions, method: KeyHandler): void;

  shift?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  option?: boolean;
  control?: boolean;
  cmd?: boolean;
  command?: boolean;

  setScope: typeof setScope;
  getScope: typeof getScope;
  deleteScope: typeof deleteScope;
  getPressedKeyCodes: typeof getPressedKeyCodes;
  getPressedKeyString: typeof getPressedKeyString;
  getAllKeyCodes: typeof getAllKeyCodes;
  isPressed: typeof isPressed;
  filter: typeof filter;
  trigger: typeof trigger;
  unbind: typeof unbind;
  noConflict?: (deep?: boolean) => HotkeysInterface;
  keyMap: Record<string, number>;
  modifier: Record<string, number>;
  modifierMap: Record<string | number, number | string>;
}

function hotkeys(
  key: string,
  option?: string | HotkeysOptions | KeyHandler,
  method?: KeyHandler
): void {
  _downKeys = [];
  /** List of hotkeys to handle */
  const keys = getKeys(key);
  let mods: number[] = [];
  /** Default scope is 'all', meaning effective in all scopes */
  let scope: string = 'all';
  /** Element to which the hotkey events are bound */
  let element: HTMLElement | Document = document;
  let i = 0;
  let keyup = false;
  let keydown = true;
  let splitKey = '+';
  let capture = false;
  /** Allow only a single callback */
  let single = false;

  // Determine if the second argument is a function (no options provided)
  if (method === undefined && typeof option === 'function') {
    method = option;
  }

  // Parse options object
  if (Object.prototype.toString.call(option) === '[object Object]') {
    const opts = option as HotkeysOptions;
    if (opts.scope) scope = opts.scope; // Set scope
    if (opts.element) element = opts.element; // Set binding element
    if (opts.keyup) keyup = opts.keyup;
    if (opts.keydown !== undefined) keydown = opts.keydown;
    if (opts.capture !== undefined) capture = opts.capture;
    if (typeof opts.splitKey === 'string') splitKey = opts.splitKey;
    if (opts.single === true) single = true;
  }

  if (typeof option === 'string') scope = option;

  // If only one callback is allowed, unbind the existing one first
  if (single) unbind(key, scope);

  // Handle each hotkey
  for (; i < keys.length; i++) {
    const currentKey = keys[i].split(splitKey); // Split into individual keys
    mods = [];

    // If it's a combination, extract modifier keys
    if (currentKey.length > 1) mods = getMods(_modifier, currentKey);

    // Convert non-modifier key to key code
    let finalKey: string | number = currentKey[currentKey.length - 1];
    finalKey = finalKey === '*' ? '*' : code(finalKey); // '*' means match all hotkeys

    // Initialize handler array if this key has no handlers yet
    if (!(finalKey in _handlers)) _handlers[finalKey] = [];

    _handlers[finalKey].push({
      keyup,
      keydown,
      scope,
      mods,
      shortcut: keys[i],
      method: method!,
      key: keys[i],
      splitKey,
      element,
    });
  }
  // Register hotkey event listeners on the global document
  if (typeof element !== 'undefined' && typeof window !== 'undefined') {
    if (!elementEventMap.has(element)) {
      const keydownListener = (event: Event = (window as any).event) => dispatch(event as KeyboardEvent, element);
      const keyupListenr = (event: Event = (window as any).event) => {
        dispatch(event as KeyboardEvent, element);
        clearModifier(event as KeyboardEvent);
      };
      elementEventMap.set(element, { keydownListener, keyupListenr, capture });
      addEvent(element, 'keydown', keydownListener, capture);
      addEvent(element, 'keyup', keyupListenr, capture);
    }
    // Register focus event listener once to clear pressed keys on window focus
    if (!winListendFocus) {
      const listener = () => {
        _downKeys = [];
      };
      winListendFocus = { listener, capture };
      addEvent(window, 'focus', listener, capture);
    }
  }
}

function trigger(shortcut: string, scope: string = 'all'): void {
  Object.keys(_handlers).forEach((key) => {
    const dataList = _handlers[key].filter(
      (item) => item.scope === scope && item.shortcut === shortcut
    );
    dataList.forEach((data) => {
      if (data && data.method) {
        data.method({} as KeyboardEvent, data);
      }
    });
  });
}

/** Clean up event listeners. After unbinding, check whether the element still has any hotkeys bound. If not, remove its event listeners. */
function removeKeyEvent(element: HTMLElement | Document | null): void {
  const values = Object.values(_handlers).flat();
  const findindex = values.findIndex(({ element: el }) => el === element);

  if (findindex < 0 && element) {
    const { keydownListener, keyupListenr, capture } = elementEventMap.get(element) || ({} as any);
    if (keydownListener && keyupListenr) {
      removeEvent(element, 'keyup', keyupListenr, capture);
      removeEvent(element, 'keydown', keydownListener, capture);
      elementEventMap.delete(element);
    }
  }

  if (values.length <= 0 || elementEventMap.size <= 0) {
    // Remove all event listeners from all elements
    const eventKeys = Array.from(elementEventMap.keys());
    eventKeys.forEach((el) => {
      const { keydownListener, keyupListenr, capture } = elementEventMap.get(el) || ({} as any);
      if (keydownListener && keyupListenr) {
        removeEvent(el, 'keyup', keyupListenr, capture);
        removeEvent(el, 'keydown', keydownListener, capture);
        elementEventMap.delete(el);
      }
    });
    // Clear the elementEventMap
    elementEventMap.clear();
    // Clear all handlers
    Object.keys(_handlers).forEach((key) => delete _handlers[key]);
    // Remove the global window focus event listener
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
    (hotkeys as any)[a] = (_api as any)[a];
  }
}

if (typeof window !== 'undefined') {
  const _hotkeys = (window as any).hotkeys;
  (hotkeys as HotkeysInterface).noConflict = (deep?: boolean) => {
    if (deep && (window as any).hotkeys === hotkeys) {
      (window as any).hotkeys = _hotkeys;
    }
    return hotkeys as HotkeysInterface;
  };
  (window as any).hotkeys = hotkeys;
}

export default hotkeys as HotkeysInterface;
