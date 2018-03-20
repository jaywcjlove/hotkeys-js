const puppeteer = require('puppeteer')
const path = require('path')
const hotkeys = require('../dist/hotkeys');
let browser
let page

// expect().toEqual() ：判断结果是否和预期等价。
// expect().toBeFalsy() ：判断结果是否为假。
// expect().toBeTruthy() ：判断结果是否为真。

var isff = navigator.userAgent.toLowerCase().indexOf('firefox') > 0;
// 模拟键盘摁键
// http://output.jsbin.com/awenaq/3
function __triggerKeyboardEvent(el, keyCode, opt) {
  var eventObj = document.createEventObject ?
    document.createEventObject() : document.createEvent("Events");
  if (eventObj.initEvent) {
    eventObj.initEvent("keydown", true, true);
  }
  eventObj.keyCode = keyCode;
  eventObj.which = keyCode;
  if (opt) {
    for (var a in opt) {
      eventObj[a] = opt[a];
    }
  }
  el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("onkeydown", eventObj);
}

beforeAll(async () => {
  browser = await puppeteer.launch()
  page = await browser.newPage()
})

describe('Alibaba Search', () => {
  test('HTML loader', async () => {
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('file://' + path.resolve('./test/index.html'), { waitUntil: 'networkidle2' });
  }, 10000);

  test('Test HTML load', async () => {
    const title = await page.title();
    expect(title).toBe('hotkeys.js');
    const text = await page.$eval('#root', el => el.textContent);
    expect(text).toBe('hotkeys');
  })

  test('HotKeys Test Case', async () => {
    hotkeys('w',  (e) => {
      expect(e.keyCode).toBe(87);
    });
    __triggerKeyboardEvent(document.body, 87);

    hotkeys('enter', function (e) {
      expect(e.keyCode).toBe(13);
    });
    hotkeys('return', function (e) {
      expect(e.keyCode).toBe(13);
    });
    __triggerKeyboardEvent(document.body, 13);

    hotkeys('space', function (e) {
      expect(e.keyCode).toBe(32);
    });
    __triggerKeyboardEvent(document.body, 32);

    hotkeys('backspace', function (e) {
      expect(e.keyCode).toBe(8);
    });
    __triggerKeyboardEvent(document.body, 8);

    hotkeys('tab', function (e) {
      expect(e.keyCode).toBe(9);
    });
    __triggerKeyboardEvent(document.body, 9);

    hotkeys('clear', function (e) {
      expect(e.keyCode).toBe(12);
    });
    __triggerKeyboardEvent(document.body, 12);

    hotkeys(',', function (e) {
      expect(e.keyCode).toBe(188);
    });
    __triggerKeyboardEvent(document.body, 188);

    hotkeys('.', function (e) {
      expect(e.keyCode).toBe(190);
    });
    __triggerKeyboardEvent(document.body, 190);

    hotkeys('/', function (e) {
      expect(e.keyCode).toBe(191);
    });
    __triggerKeyboardEvent(document.body, 191);

    hotkeys('`', function (e) {
      expect(e.keyCode).toBe(192);
    });
    __triggerKeyboardEvent(document.body, 192);

    hotkeys('-', function (e) {
      expect(e.keyCode).toBe(isff ? 173 : 189);
    });
    __triggerKeyboardEvent(document.body, isff ? 173 : 189);

    hotkeys('=', function (e) {
      expect(e.keyCode).toBe(isff ? 61 : 187);
    });
    __triggerKeyboardEvent(document.body, isff ? 61 : 187);

    hotkeys(';', function (e) {
      expect(e.keyCode).toBe(isff ? 59 : 186);
    });
    __triggerKeyboardEvent(document.body, isff ? 59 : 186);

    hotkeys("\'".toString(), function (e) {
      expect(e.keyCode).toBe(222);
    });
    __triggerKeyboardEvent(document.body, 222);

    hotkeys("\\".toString(), function (e) {
      expect(e.keyCode).toBe(220);
    });
    __triggerKeyboardEvent(document.body, 220);

    hotkeys("[".toString(), function (e) {
      expect(e.keyCode).toBe(219);
    });
    __triggerKeyboardEvent(document.body, 219);

    hotkeys("]".toString(), function (e) {
      expect(e.keyCode).toBe(221);
    });
    __triggerKeyboardEvent(document.body, 221);

    hotkeys('left', function (e) {
      expect(e.keyCode).toBe(37);
    });
    __triggerKeyboardEvent(document.body, 37);

    hotkeys('up', function (e) {
      expect(e.keyCode).toBe(38);
    });
    __triggerKeyboardEvent(document.body, 38);

    hotkeys('del', function (e) {
      expect(e.keyCode).toBe(46);
    });
    hotkeys('delete', function (e) {
      expect(e.keyCode).toBe(46);
    });
    __triggerKeyboardEvent(document.body, 46);

    hotkeys('home', function (e) {
      expect(e.keyCode).toBe(36);
    });
    __triggerKeyboardEvent(document.body, 36);

    hotkeys('pageup', function (e) {
      expect(e.keyCode).toBe(33);
    });
    __triggerKeyboardEvent(document.body, 33);

    hotkeys('pagedown', function (e) {
      expect(e.keyCode).toBe(34);
    });
    __triggerKeyboardEvent(document.body, 34);

    hotkeys('end', function (e) {
      expect(e.keyCode).toBe(35);
    });
    __triggerKeyboardEvent(document.body, 35);

    hotkeys('right', function (e) {
      expect(e.keyCode).toBe(39);
    });
    __triggerKeyboardEvent(document.body, 39);

    hotkeys('down', function (e) {
      expect(e.keyCode).toBe(40);
    });
    __triggerKeyboardEvent(document.body, 40);

    hotkeys('esc', function (e) {
      expect(e.keyCode).toBe(27);
    });
    hotkeys('escape', function (e) {
      expect(e.keyCode).toBe(27);
    });
    __triggerKeyboardEvent(document.body, 27);


    hotkeys('CapsLock', function (e) {
      expect(e.keyCode).toBe(20);
    });
    hotkeys('⇪', function (e) {
      expect(e.keyCode).toBe(20);
    });
    __triggerKeyboardEvent(document.body, 20);

  })


  test('HotKeys Key combination Test Case', async () => {

    hotkeys('⌘+d', function (e) {
      expect(e.keyCode).toBe(82);
      expect(e.metaKey).toBeTruthy();
      return false;
    });
    __triggerKeyboardEvent(document.body, 82, {
      metaKey: true
    });

    hotkeys('alt+d', function (e) {
      expect(e.keyCode).toBe(68);
      expect(e.altKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 68, {
      altKey: true
    });

    hotkeys('shift+a', function (e) {
      expect(e.keyCode).toBe(65);
      expect(e.shiftKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      shiftKey: true
    });

    hotkeys('⇧+a', function (e) {
      expect(e.keyCode).toBe(65);
      expect(e.shiftKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      shiftKey: true
    });

    hotkeys('⌘+a', function (e) {
      expect(e.keyCode).toBe(65);
      expect(e.metaKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      metaKey: true
    });

    hotkeys('⌃+a', function (e) {
      expect(e.keyCode).toBe(65);
      expect(e.ctrlKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true
    });
    hotkeys.unbind("⌃+a")

    hotkeys('⌥+a', function (e) {
      expect(e.keyCode).toBe(65);
      expect(e.altKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      altKey: true
    });

    hotkeys('ctrl+,,ctrl+d', function (e) {
      expect(e.keyCode).toBe(188);
      expect(e.ctrlKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 188, {
      ctrlKey: true
    });
    hotkeys.unbind("ctrl+,,ctrl+d")

    hotkeys('Ctrl+A', function (e) {
      expect(e.keyCode).toBe(65);
      expect(e.ctrlKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true
    });
    hotkeys.unbind("Ctrl+A")

    hotkeys('CTRL+A', function (e) {
      expect(e.keyCode).toBe(65);
      expect(e.ctrlKey).toBeTruthy();
    });
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true
    });
    hotkeys.unbind("CTRL+A")

    hotkeys('⌃+a', function (e) {
      expect(e.keyCode).toBe(65);
      expect(hotkeys.getScope()).toBe('all');
    });
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true
    });
    hotkeys.unbind("⌃+a")

    hotkeys('⌃+a', 'scope1', function (e) {
      expect(e.keyCode).toBe(65);
      expect(hotkeys.getScope()).toBe('scope1');
    });
    hotkeys.setScope('scope1');
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true
    });

    hotkeys('⌃+a', 'scope2', function (e) {
      expect(e.keyCode).toBe(65);
      expect(hotkeys.getScope()).toBe('scope2');
    });
    hotkeys.setScope('scope2');
    __triggerKeyboardEvent(document.body, 65, {
      ctrlKey: true
    });
  })

  afterAll(async () => {
    await browser.close()
  })
})