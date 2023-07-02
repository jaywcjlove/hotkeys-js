/**
 * @jest-environment jsdom
 */
const puppeteer = require('puppeteer');
const path = require('path');
const hotkeys = require('../dist/hotkeys');

let browser;
let page;

// expect().toEqual() ：判断结果是否和预期等价。
// expect().toBeFalsy() ：判断结果是否为假。
// expect().toBeTruthy() ：判断结果是否为真。

const isff = navigator.userAgent.toLowerCase().indexOf('firefox') > 0;
// 模拟键盘摁键
// http://output.jsbin.com/awenaq/3
function __triggerKeyboardEvent(el, keyCode, opt) {
  const eventObj = document.createEventObject ? document.createEventObject() : document.createEvent('Events');
  if (eventObj.initEvent) {
    eventObj.initEvent('keydown', true, true);
  }
  if (keyCode) {
    eventObj.keyCode = keyCode;
    eventObj.which = keyCode;
  }
  if (opt) {
    for (const a in opt) {
      if (Object.prototype.hasOwnProperty.call(opt, a)) {
        eventObj[a] = opt[a];
      }
    }
  }
  el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent('onkeydown', eventObj);
}
function __triggerKeyboardUp(el, keyCode, opt) {
  const eventObj = document.createEventObject ? document.createEventObject() : document.createEvent('Events');
  if (eventObj.initEvent) {
    eventObj.initEvent('keyup', true, true);
  }
  if (keyCode) {
    eventObj.keyCode = keyCode;
    eventObj.which = keyCode;
  }
  if (opt) {
    for (const a in opt) {
      if (Object.prototype.hasOwnProperty.call(opt, a)) {
        eventObj[a] = opt[a];
      }
    }
  }
  el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent('onkeyup', eventObj);
}
function __triggerKeyboardFocus(el, keyCode, opt) {
  const eventObj = document.createEventObject ? document.createEventObject() : document.createEvent('Events');
  if (eventObj.initEvent) {
    eventObj.initEvent('focus', true, true);
  }
  if (keyCode) {
    eventObj.keyCode = keyCode;
    eventObj.which = keyCode;
  }
  if (opt) {
    for (const a in opt) {
      if (Object.prototype.hasOwnProperty.call(opt, a)) {
        eventObj[a] = opt[a];
      }
    }
  }
  el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent('onfocus', eventObj);
}

beforeAll(async () => {
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  page = await browser.newPage();
}, 1000 * 120);

describe('\n   Hotkeys.js Test Case222.\n', () => {
  test('HTML loader', async () => {
    await page.goto(`file://${path.resolve('./test/index.html')}`, { waitUntil: 'networkidle2' });
  }, 10000);

  test('Test HTML load', async () => {
    const title = await page.title();
    expect(title).toBe('hotkeys.js');
    const text = await page.$eval('#root', (el) => el.textContent);
    expect(text).toBe('hotkeys');
    expect(window.hotkeys).toBeTruthy();
    expect(hotkeys(() => { })).toBeUndefined();
  });

  test('HotKeys getPressedKeyCodes Test Case', async () => {
    let isExecuteFunction = false;
    await hotkeys('command+ctrl+shift+a', (e) => {
      isExecuteFunction = true;
      expect(e.metaKey).toBeTruthy();
      expect(e.ctrlKey).toBeTruthy();
      expect(e.shiftKey).toBeTruthy();
      expect(hotkeys.getPressedKeyCodes()).toEqual([16, 17, 65, 91]);
    });
    __triggerKeyboardEvent(document.body, 65, {
      metaKey: true,
      ctrlKey: true,
      shiftKey: true,
    });
    expect(isExecuteFunction).toBeTruthy();
    await hotkeys.unbind('command+ctrl+shift+a');
  });

  test('HotKeys getPressedKeyString Test Case', async () => {
    let isExecuteFunction = false;
    await hotkeys('command+ctrl+shift+a', (e) => {
      isExecuteFunction = true;
      expect(e.metaKey).toBeTruthy();
      expect(e.ctrlKey).toBeTruthy();
      expect(e.shiftKey).toBeTruthy();
      expect(hotkeys.getPressedKeyString()).toEqual(['⇧', '⌃', 'A', '⌘']);
    });
    __triggerKeyboardEvent(document.body, 65, {
      metaKey: true,
      ctrlKey: true,
      shiftKey: true,
    });
    expect(isExecuteFunction).toBeTruthy();
    await hotkeys.unbind('command+ctrl+shift+a');
  });

  test('HotKeys modifier scope,setScope,getScope,deleteScope Test Case', () => {
    let isExecuteFunction = false;
    __triggerKeyboardFocus(window);
    hotkeys('⌘+d', 'files', (e) => {
      isExecuteFunction = true;
      expect(e.keyCode).toBe(68);
      expect(e.metaKey).toBeTruthy();
      hotkeys.deleteScope('files');
    });
    hotkeys.setScope('files');
    __triggerKeyboardEvent(document.body, 68, {
      metaKey: true,
    });
    expect(isExecuteFunction).toBeTruthy();
    expect(hotkeys.getScope()).toBe('all');

    hotkeys('⌘+d', { scope: 'files2' }, (e) => {
      isExecuteFunction = false;
      expect(e.keyCode).toBe(68);
      expect(hotkeys.getScope()).toBe('files2');
      expect(e.metaKey).toBeTruthy();
      hotkeys.deleteScope('files2');
    });
    hotkeys.setScope('files2');
    __triggerKeyboardEvent(document.body, 68, {
      metaKey: true,
    });
    expect(isExecuteFunction).toBeFalsy();
    expect(hotkeys.getScope()).toBe('all');

    hotkeys('⌘+d', {
      element: document.body,
      scope: 'scope3',
      keyup: true,
      keydown: false,
    }, (e) => {
      isExecuteFunction = false;
      expect(e.keyCode).toBe(68);
      expect(hotkeys.getScope()).toBe('scope3');
      expect(e.metaKey).toBeTruthy();
      hotkeys.deleteScope('scope3');
    });
    hotkeys.setScope('scope3');
    __triggerKeyboardUp(document.body, 68, {
      metaKey: true,
    });
    expect(isExecuteFunction).toBeFalsy();
    expect(hotkeys.getScope()).toBe('all');
  });

  test('Custom splitKey Test Case', async () => {
    let isExecuteFunction = false;
    await hotkeys('ctrl-a', { splitKey: '-' }, (e) => {
      isExecuteFunction = true;
      expect(e.ctrlKey).toBeTruthy();
      expect(hotkeys.getPressedKeyCodes()).toEqual([17, 65]);
    });
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true,
    });
    await hotkeys.unbind();
    expect(isExecuteFunction).toBeTruthy();
  });

  test('HotKeys unbind Test Case', async () => {
    let isExecuteFunction = false;
    hotkeys('enter', (e) => {
      isExecuteFunction = true;
      expect(e.keyCode).toBe(13);
    });
    __triggerKeyboardEvent(document.body, 13);
    expect(isExecuteFunction).toBeTruthy();

    expect(hotkeys.unbind()).toBe(undefined);
    expect(hotkeys.unbind('enter')).toBe(undefined);
    expect(hotkeys.unbind('enter12')).toBe(undefined);
  });

  test('passing an empty string to unbind does not remove all handlers', () => {
    let isExecuteFunction = false;
    hotkeys('enter', (e) => {
      isExecuteFunction = true;
      expect(e.keyCode).toBe(13);
    });

    hotkeys.unbind('');

    __triggerKeyboardEvent(document.body, 13);
    expect(isExecuteFunction).toBeTruthy();
  });

  test('HotKeys Special keys Test Case', async () => {
    let isExecuteFunction = false;
    hotkeys('enter', (e) => {
      isExecuteFunction = true;
      expect(e.keyCode).toBe(13);
    });
    hotkeys('return', (e) => {
      expect(e.keyCode).toBe(13);
    });
    __triggerKeyboardEvent(document.body, 13);
    __triggerKeyboardUp(document.body, 13);
    hotkeys.unbind('return');
    hotkeys.unbind('enter');
    expect(isExecuteFunction).toBeTruthy();

    hotkeys('space', (e) => {
      expect(e.keyCode).toBe(32);
    });
    __triggerKeyboardEvent(document.body, 32);
    __triggerKeyboardUp(document.body, 32);
    hotkeys.unbind('space');

    hotkeys('insert,ins', (e) => {
      expect(e.keyCode).toBe(45);
    });
    __triggerKeyboardEvent(document.body, 45);
    __triggerKeyboardUp(document.body, 45);
    hotkeys.unbind('insert');
    hotkeys.unbind('ins');

    hotkeys('backspace', (e) => {
      expect(e.keyCode).toBe(8);
    });
    __triggerKeyboardEvent(document.body, 8);
    __triggerKeyboardUp(document.body, 8);
    hotkeys.unbind('backspace');

    hotkeys('tab', (e) => {
      expect(e.keyCode).toBe(9);
    });
    __triggerKeyboardEvent(document.body, 9);
    __triggerKeyboardUp(document.body, 9);
    hotkeys.unbind('tab');

    hotkeys('clear', (e) => {
      expect(e.keyCode).toBe(12);
    });
    __triggerKeyboardEvent(document.body, 12);
    __triggerKeyboardUp(document.body, 12);
    hotkeys.unbind('clear');

    hotkeys(',', (e) => {
      expect(e.keyCode).toBe(188);
    });
    __triggerKeyboardEvent(document.body, 188);
    __triggerKeyboardUp(document.body, 188);
    hotkeys.unbind(',');

    hotkeys('.', (e) => {
      expect(e.keyCode).toBe(190);
    });
    __triggerKeyboardEvent(document.body, 190);
    __triggerKeyboardUp(document.body, 190);
    hotkeys.unbind('.');

    hotkeys('/', (e) => {
      expect(e.keyCode).toBe(191);
    });
    __triggerKeyboardEvent(document.body, 191);
    __triggerKeyboardUp(document.body, 191);
    hotkeys.unbind('/');

    hotkeys('`', (e) => {
      expect(e.keyCode).toBe(192);
    });
    __triggerKeyboardEvent(document.body, 192);
    __triggerKeyboardUp(document.body, 192);
    hotkeys.unbind('`');

    hotkeys('-', (e) => {
      expect(e.keyCode).toBe(isff ? 173 : 189);
    });
    __triggerKeyboardEvent(document.body, isff ? 173 : 189);
    __triggerKeyboardUp(document.body, isff ? 173 : 189);
    hotkeys.unbind('-');

    hotkeys('=', (e) => {
      expect(e.keyCode).toBe(isff ? 61 : 187);
    });
    __triggerKeyboardEvent(document.body, isff ? 61 : 187);
    hotkeys.unbind('=');

    hotkeys(';', (e) => {
      expect(e.keyCode).toBe(isff ? 59 : 186);
    });
    __triggerKeyboardEvent(document.body, isff ? 59 : 186);
    hotkeys.unbind(';');

    hotkeys('\''.toString(), (e) => {
      expect(e.keyCode).toBe(222);
    });
    __triggerKeyboardEvent(document.body, 222);
    hotkeys.unbind('\'');

    hotkeys('\\'.toString(), (e) => {
      expect(e.keyCode).toBe(220);
    });
    __triggerKeyboardEvent(document.body, 220);
    hotkeys.unbind('\\');

    hotkeys('['.toString(), (e) => {
      expect(e.keyCode).toBe(219);
    });
    __triggerKeyboardEvent(document.body, 219);
    hotkeys.unbind('[');

    hotkeys(']'.toString(), (e) => {
      expect(e.keyCode).toBe(221);
    });
    __triggerKeyboardEvent(document.body, 221);
    hotkeys.unbind(']');

    hotkeys('left', (e) => {
      expect(e.keyCode).toBe(37);
    });
    __triggerKeyboardEvent(document.body, 37);
    hotkeys.unbind('left');

    hotkeys('up', (e) => {
      expect(e.keyCode).toBe(38);
    });
    __triggerKeyboardEvent(document.body, 38);
    hotkeys.unbind('up');

    hotkeys('del', (e) => {
      expect(e.keyCode).toBe(46);
    });
    hotkeys('delete', (e) => {
      expect(e.keyCode).toBe(46);
    });
    __triggerKeyboardEvent(document.body, 46);
    hotkeys.unbind('delete');
    hotkeys.unbind('del');

    hotkeys('home', (e) => {
      expect(e.keyCode).toBe(36);
    });
    __triggerKeyboardEvent(document.body, 36);
    hotkeys.unbind('home');

    hotkeys('pageup', (e) => {
      expect(e.keyCode).toBe(33);
    });
    __triggerKeyboardEvent(document.body, 33);
    hotkeys.unbind('pageup');

    hotkeys('pagedown', (e) => {
      expect(e.keyCode).toBe(34);
    });
    __triggerKeyboardEvent(document.body, 34);
    hotkeys.unbind('pagedown');

    hotkeys('end', (e) => {
      expect(e.keyCode).toBe(35);
    });
    __triggerKeyboardEvent(document.body, 35);
    hotkeys.unbind('end');

    hotkeys('right', (e) => {
      expect(e.keyCode).toBe(39);
    });
    __triggerKeyboardEvent(document.body, 39);
    hotkeys.unbind('right');

    hotkeys('down', (e) => {
      expect(e.keyCode).toBe(40);
    });
    __triggerKeyboardEvent(document.body, 40);
    hotkeys.unbind('down');

    hotkeys('esc', (e) => {
      expect(e.keyCode).toBe(27);
    });
    hotkeys('escape', (e) => {
      expect(e.keyCode).toBe(27);
    });
    __triggerKeyboardEvent(document.body, 27);
    hotkeys.unbind('esc');
    hotkeys.unbind('escape');

    hotkeys('CapsLock', (e) => {
      expect(e.keyCode).toBe(20);
    });
    hotkeys('⇪', (e) => {
      expect(e.keyCode).toBe(20);
    });
    __triggerKeyboardEvent(document.body, 20);
    hotkeys.unbind('⇪');
    hotkeys.unbind('CapsLock');
  });

  test('HotKeys Test Case', async () => {
    hotkeys('w', (e) => {
      expect(e.keyCode).toBe(87);
    });
    __triggerKeyboardEvent(document.body, 87);
    hotkeys.unbind('w');

    hotkeys('b', (e) => {
      expect(e.keyCode).toBe(66);
    });
    __triggerKeyboardEvent(document.body, 66);
    hotkeys.unbind('b');

    await hotkeys('a', async () => {
      await expect(hotkeys.isPressed('a')).toBeTruthy();
      await expect(hotkeys.isPressed('A')).toBeTruthy();
      await expect(hotkeys.isPressed(65)).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65);
    hotkeys.unbind('a');
  });

  test('unbind with method test', () => {
    const callbackA = jest.fn();
    const callbackB = jest.fn();

    hotkeys('shift+a', callbackA);

    __triggerKeyboardEvent(document.body, 65, {
      shiftKey: true,
    });
    /**
     * https://github.com/jaywcjlove/hotkeys/issues/55
     * 解决三键组合，实现键值比对，
     * 并不是对象比对，此测试用例无法模拟
     */
    expect(callbackA.mock.calls.length).toBe(1);

    hotkeys.unbind('shift+a', callbackA);

    __triggerKeyboardEvent(document.body, 65, {
      shiftKey: true,
    });

    expect(callbackA.mock.calls.length).toBe(1);

    hotkeys('shift+a', callbackB);

    __triggerKeyboardEvent(document.body, 65, {
      shiftKey: true,
    });

    expect(callbackB.mock.calls.length).toBe(1);

    hotkeys.unbind('shift+a', callbackB);

    __triggerKeyboardEvent(document.body, 65, {
      shiftKey: true,
    });

    expect(callbackB.mock.calls.length).toBe(1);
  });

  test('HotKeys Key combination Test Case', async () => {
    hotkeys('⌘+d', (e) => {
      expect(e.keyCode).toBe(68);
      expect(e.metaKey).toBeTruthy();
      return false;
    });
    __triggerKeyboardEvent(document.body, 68, {
      metaKey: true,
    });

    hotkeys('alt+d', (e) => {
      expect(e.keyCode).toBe(68);
      expect(e.altKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 68, {
      altKey: true,
    });

    hotkeys('shift+a', (e) => {
      expect(e.keyCode).toBe(65);
      expect(e.shiftKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      shiftKey: true,
    });

    hotkeys('⇧+a', (e) => {
      expect(e.keyCode).toBe(65);
      expect(e.shiftKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      shiftKey: true,
    });

    hotkeys('⌘+a', (e) => {
      expect(e.keyCode).toBe(65);
      expect(e.metaKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      metaKey: true,
    });
    hotkeys.unbind('⌘+a');

    hotkeys('⌃+a', (e) => {
      expect(e.keyCode).toBe(65);
      expect(e.ctrlKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true,
    });
    hotkeys.unbind('⌃+a');

    hotkeys('⌥+a', (e) => {
      expect(e.keyCode).toBe(65);
      expect(e.altKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      altKey: true,
    });

    hotkeys('ctrl+,,ctrl+d', (e) => {
      expect(e.keyCode).toBe(188);
      expect(e.ctrlKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 188, {
      ctrlKey: true,
    });
    hotkeys.unbind('ctrl+,,ctrl+d');

    hotkeys('Ctrl+A', (e) => {
      expect(e.keyCode).toBe(65);
      expect(e.ctrlKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true,
    });
    hotkeys.unbind('Ctrl+A');

    hotkeys('CTRL+A', (e) => {
      expect(e.keyCode).toBe(65);
      expect(e.ctrlKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true,
    });
    hotkeys.unbind('CTRL+A');

    hotkeys('⌃+a', (e) => {
      expect(e.keyCode).toBe(65);
      expect(hotkeys.getScope()).toBe('all');
    });
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true,
    });
    hotkeys.unbind('⌃+a');
  });

  // const _modifier = { //修饰键
  //   '⇧': 16, shift: 16,
  //   '⌥': 18, alt: 18, option: 18,
  //   '⌃': 17, ctrl: 17, control: 17,
  //   '⌘': isff ? 224 : 91, cmd: isff ? 224 : 91, command: isff ? 224 : 91
  // };

  test('HotKeys modifier key ⌘,cmd,command Test Case', () => {
    __triggerKeyboardEvent(document.body, 65, {
      shiftKey: true,
    });
    hotkeys.unbind('shift+a');
  });

  test('HotKeys modifier key ⌘,cmd,command Test Case', () => {
    // left key
    hotkeys('*', (e) => {
      expect(e.keyCode).toBe(isff ? 224 : 91);
    });
    __triggerKeyboardEvent(document.body, isff ? 224 : 91);
    hotkeys.unbind('*');
    // right key
    hotkeys('*', (e) => {
      expect(e.keyCode).toBe(isff ? 224 : 93);
    });
    __triggerKeyboardEvent(document.body, isff ? 224 : 93);
    hotkeys.unbind('*');
  });

  test('HotKeys modifier key ⌃,ctrl,control Test Case', async () => {
    hotkeys('*', (e) => {
      expect(e.keyCode).toBe(17);
    });
    __triggerKeyboardEvent(document.body, 17);
    hotkeys.unbind('*');
  });

  test('HotKeys modifier key ⌥,alt,option Test Case', async () => {
    hotkeys('*', (e) => {
      expect(e.keyCode).toBe(18);
    });
    __triggerKeyboardEvent(document.body, 18);
    hotkeys.unbind('*');
  });

  test('HotKeys modifier key ⇧,shift Test Case', () => {
    hotkeys('*', (e) => {
      expect(e.keyCode).toBe(16);
      expect(e.which).toBe(16);
    });
    __triggerKeyboardEvent(document.body, 16);
    hotkeys.unbind('*');
  });

  test('HotKeys modifier scope,setScope,getScope,deleteScope Test Case', () => {
    hotkeys('⌃+a', 'scope2', async (e) => {
      expect(e.keyCode).toBe(65);
      expect(hotkeys.getScope()).toBe('scope2');
      hotkeys.deleteScope('scope2');
    });
    hotkeys.setScope('scope2');
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true,
    });

    hotkeys('⌃+a', 'scope3', async (e) => {
      expect(e.keyCode).toBe(65);
      expect(hotkeys.getScope()).toBe('scope3');
      hotkeys.deleteScope('scope3');
    });
    hotkeys.setScope('scope3');
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true,
    });
    expect(hotkeys.getScope()).toBe('all');
  });

  test('HotKeys modifier noConflict Test Case', async () => {
    const keys = await hotkeys.noConflict(true);
    await keys('a', (e) => {
      expect(e.keyCode).toBe(65);
      expect(e.which).toBe(65);
    });
    __triggerKeyboardEvent(document.body, 65);
  });

  test('Event trigger on readOnly input', async () => {
    const input = document.createElement('input');
    input.setAttribute('readOnly', true);
    await hotkeys('*', (event) => {
      expect(hotkeys.filter.call(null, event)).toBeTruthy();
    });
    __triggerKeyboardEvent(input, 65);
    await hotkeys.unbind('*');
    input.removeAttribute('readOnly');
    await hotkeys('*', (event) => {
      expect(hotkeys.filter.call(null, event)).toBeFalsy();
    });
  });

  test('Hotkey modifier capture', async () => {
    let isExecuteFunction = false;
    const el = document.createElement('div');

    el.addEventListener('keydown', () => {
      isExecuteFunction = true;
    });

    await hotkeys('a', { capture: true, element: el }, (event) => {
      event.stopImmediatePropagation();
    });

    __triggerKeyboardEvent(el, 65);
    expect(isExecuteFunction).toBeFalsy();
    await hotkeys.unbind('a');
  });

  test('Hotkey trigger whith shortcut.', async () => {
    let count = 0;
    hotkeys('a', () => {
      count++;
    });
    hotkeys.trigger('a');
    expect(count).toBe(1);
    hotkeys.unbind('a');
  });

  test('Hotkey trigger whith multi shortcut.', async () => {
    let count = 0;
    for (let i = 0; i < 3; i++) {
      hotkeys('a', () => {
        count++;
      });
    }
    hotkeys.trigger('a');
    expect(count).toBe(3);
    hotkeys.unbind('a');
  });

  afterAll(async () => {
    await browser.close();
  });
});

jest.setTimeout(30000);
