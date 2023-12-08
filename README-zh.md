# Hotkeys

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://jaywcjlove.github.io/#/sponsor)
[![npm dowload](https://img.shields.io/npm/dm/hotkeys-js?logo=npm)](https://www.npmjs.com/package/hotkeys-js)
[![Stargazers](https://img.shields.io/github/stars/jaywcjlove/hotkeys.svg)](https://github.com/jaywcjlove/hotkeys/stargazers)
![no dependencies](http://jaywcjlove.github.io/sb/status/no-dependencies.svg)
[![GitHub Actions CI](https://github.com/jaywcjlove/hotkeys/actions/workflows/ci.yml/badge.svg)](https://github.com/jaywcjlove/hotkeys/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/jaywcjlove/hotkeys/badge.svg?branch=master)](https://coveralls.io/github/jaywcjlove/hotkeys?branch=master)
[![English](https://jaywcjlove.github.io/sb/lang/english.svg)](https://jaywcjlove.github.io/hotkeys-js/)
[![for Gitee](https://jaywcjlove.github.io/sb/ico/gitee.svg)](https://gitee.com/jaywcjlove/hotkeys)

这是一个强健的 Javascript 库用于捕获键盘输入和输入的组合键，它易于使用，没有依赖，压缩只有([~6kB](https://bundlephobia.com/result?p=hotkeys-js))，gzip: **`2.8kB`**。[官方文档DEMO预览](http://jaywcjlove.github.io/hotkeys-js/?lang=cn)，[更多实例](https://github.com/jaywcjlove/hotkeys/issues?q=label%3ADemo+)。


```shell
╭┈┈╮          ╭┈┈╮  ╭┈┈╮
┆  ├┈┈..┈┈┈┈┈.┆  └┈╮┆  ├┈┈..┈┈┈┈┈..┈┈.┈┈..┈┈┈┈┈.
┆     ┆┆  □  ┆┆   ┈┤┆    < ┆  -__┘┆  ┆  ┆┆__ ┈┈┤
╰┈┈┴┈┈╯╰┈┈┈┈┈╯╰┈┈┈┈╯╰┈┈┴┈┈╯╰┈┈┈┈┈╯╰┈┈┈  ┆╰┈┈┈┈┈╯
                                  ╰┈┈┈┈┈╯
```

## 创建

您将需要在您的系统上安装的 Node.js。

```sh
# bower 安装
$ bower install hotkeysjs

# npm 安装
$ npm install hotkeys-js

$ npm run build # 编译
$ npm run watch # 开发模式
```

```js
import hotkeys from 'hotkeys-js';

hotkeys('f5', function(event, handler){
  // Prevent the default refresh event under WINDOWS system
  event.preventDefault() 
  alert('you pressed F5!') 
});
```

或者在您的HTML中手动下载并引入 **hotkeys.js**，你也可以通过 [UNPKG](https://unpkg.com/hotkeys-js/dist/) 进行下载：

CDN: [UNPKG](https://unpkg.com/hotkeys-js/dist/) | [jsDelivr](https://cdn.jsdelivr.net/npm/hotkeys-js@3.7.3/) | [Githack](https://raw.githack.com/jaywcjlove/hotkeys/master/dist/hotkeys.min.js) | [Statically](https://cdn.statically.io/gh/jaywcjlove/hotkeys/master/dist/hotkeys.min.js) | [bundle.run](https://bundle.run/hotkeys-js@3.7.3)

```html
<script src="https://unpkg.com/hotkeys-js/dist/hotkeys.min.js"></script>
<script type="text/javascript">
hotkeys('ctrl+a,ctrl+b,r,f', function(event,handler) {
  switch(handler.key){
    case "ctrl+a":alert('you pressed ctrl+a!');break;
    case "ctrl+b":alert('you pressed ctrl+b!');break;
    case "r":alert('you pressed r!');break;
    case "f":alert('you pressed f!');break;
  }
});
</script>
```

## React中使用

[react-hotkeys](https://github.com/jaywcjlove/react-hotkeys) 是 React 组件，用于侦听 keydown 和 keyup 键盘事件，定义和分配键盘快捷键。 详细的使用方法请参见其文档，详细使用方法请参考文档 [react-hotkeys](https://github.com/jaywcjlove/react-hotkeys)。

[react-hotkeys-hook](https://github.com/JohannesKlauss/react-hotkeys-hook) - React Hook，用于在组件中使用键盘快捷键。确保您至少安装了 16.8 版本的 react 和 react-dom，否则钩子将对您不起作用。

## 使用

传统调用

```html
<script type="text/javascript" src="./js/hotkeys.js"></script>
```

包加载

```js
import hotkeys from 'hotkeys-js';

hotkeys('shift+a,alt+d, w', function(e){
  console.log('干点活儿',e);
  if(hotkeys.shift) console.log('大哥你摁下了 shift 键！');
  if(hotkeys.ctrl) console.log('大哥你摁下了 ctrl 键！');
  if(hotkeys.alt) console.log('大哥你摁下了 alt 键！');
});
```

## 支持的键

`⇧`, `shift`, `option`, `⌥`, `alt`, `ctrl`, `control`, `command`, `⌘`

`⌘` Command()  
`⌃` Control  
`⌥` Option(alt)  
`⇧` Shift  
`⇪` Caps Lock(大写)  
~~`fn` 功能键就是fn(不支持)~~  
`↩︎` return/enter  
`space` 空格键  

## 修饰键判断

可以对下面的修饰键判断 `shift` `alt` `option` `ctrl` `control` `command`，特别注意`+`和`=`键值相同，组合键设置`⌘+=`

```js
hotkeys('shift+a,alt+d, w', function(e){
  console.log('干点活儿',e);
  if(hotkeys.shift) console.log('您摁下了 shift 键!');
  if(hotkeys.ctrl) console.log('您摁下了 ctrl 键!');
  if(hotkeys.alt) console.log('您摁下了 alt 键!');
  if(hotkeys.option) console.log('您摁下了 option 键!');
  if(hotkeys.control) console.log('您摁下了 control 键!');
  if(hotkeys.cmd) console.log('您摁下了 cmd 键!');
  if(hotkeys.command) console.log('您摁下了 command 键!');
});
```

## 定义快捷键

> `hotkeys([keys:<String>], [option:[string|object|function]], [callback:<function>])`

```js
// 定义 F5 快捷键
hotkeys('f5', function(event,handler){
  //event.srcElement: input 
  //event.target: input
  // 阻止WINDOWS系统下的默认刷新事件
  event.preventDefault() 
  alert('你按下了 F5 键!') 
});
// 返回 false 将停止活动，并阻止默认浏览器事件
// Mac OS 系统 定义 `command+r` 为刷新快捷键
hotkeys('ctrl+r, command+r', function(){
  alert('停止刷新!');
  return false;
});

// 定义a快捷键
hotkeys('a', function(event,handler){
  //event.srcElement: input 
  //event.target: input
  if(event.target === "input"){
    alert('你在输入框中按下了 a!')
  }
  alert('你按下了 a!') 
});

// 定义 ctrl+a、ctrl+b、r、f 四组快捷键
hotkeys('ctrl+a,ctrl+b,r,f', function(event,handler){
  switch(handler.key){
    case "ctrl+a": alert('你按下了ctrl+a!'); break;
    case "ctrl+b": alert('你按下了ctrl+b!'); break;
    case "r": alert('你按下了r!'); break;
    case "f": alert('你按下了f!'); break;
  }
  //handler.scope 范围
});


// 多个快捷方式做同样的事情
hotkeys('⌘+r, ctrl+r', function(){ });

// 对所有摁键执行任务
hotkeys('*','wcj', function(e){
  console.log('干点活儿',e);
  console.log("key.getScope()::",hotkeys.getScope());
  if(hotkeys.shift) console.log('大哥你摁下了 shift 键！');
  if(hotkeys.ctrl) console.log('大哥你摁下了 ctrl 键！');
  if(hotkeys.alt) console.log('大哥你摁下了 alt 键！');
});

// 可以设置自定义的分割符
hotkeys('ctrl-y, ctrl-a', {splitKey: '-'}, function(e){
  console.log('you press bind keys')
})
```

#### option 

- `scope<String>`
- `element<HTMLElement>`
- `keyup<Boolean>`
- `keydown<Boolean>`
- `splitKey<string>` (默认值 `+`)
- `capture<Boolean>`
- `single<Boolean>`

```js
hotkeys('o, enter', {
  scope: 'wcj',
  element: document.getElementById('warpper'),
}, function(){ 
  console.log('do something else');
});

hotkeys('ctrl-+', { splitKey: '-' }, function(e) {
  console.log('you pressed ctrl and +');
});

hotkeys('+', { splitKey: '-' }, function(e){
  console.log('you pressed +');
})
```

**keyup**

**key down** 和 **key up** 将都执行回调事件。

```js
hotkeys('ctrl+a,alt+a+s', { keyup: true }, (evn, handler) => {
  if(evn.type === 'keydown') {
    console.log('keydown:', evn.type, handler, handler.key);
  }
  if(evn.type === 'keyup') {
    console.log('keyup:', evn.type, handler, handler.key);
  }
});
```

## API 参考

### 星号 * 

通过修饰符号判断

```js
hotkeys('*', function() {
  if (hotkeys.shift) {
    console.log('shift is pressed!');
  }

  if (hotkeys.ctrl) {
    console.log('ctrl is pressed!');
  }

  if (hotkeys.alt) {
    console.log('alt is pressed!');
  }

  if (hotkeys.option) {
    console.log('option is pressed!');
  }

  if (hotkeys.control) {
    console.log('control is pressed!');
  }

  if (hotkeys.cmd) {
    console.log('cmd is pressed!');
  }

  if (hotkeys.command) {
    console.log('command is pressed!');
  }
});
```

### 切换快捷键

如果在单页面在不同的区域，相同的快捷键，干不同的事儿，之间来回切换。O(∩_∩)O ！

```js
// 一个快捷键，有可能干的活儿不一样哦
hotkeys('ctrl+o, ctrl+alt+enter', 'scope1', function(){
  console.log('你好看');
});

hotkeys('ctrl+o, enter', 'scope2', function(){ 
  console.log('你好丑陋啊！');
});

// 你摁 “ctrl+o”组合键
// 当scope等于 scope1 ，执行 回调事件打印出 “你好看”，
// 当scope等于 scope2 ，执行 回调事件打印出 “你好丑陋啊！”，

// 通过setScope设定范围scope
hotkeys.setScope('scope1'); // 默认所有事儿都干哦
```

### 标记快捷键范围

**删除** 区域范围标记

```js
hotkeys.deleteScope('scope1');
```

**获取** 区域范围标记

```js
hotkeys.getScope();
```

**设置** 区域范围标记

```js
hotkeys.setScope('scope1');
```

### trigger

```js
hotkeys.trigger('ctrl+o')
hotkeys.trigger('ctrl+o', 'scope2')
```

### 解除绑定

`hotkeys.unbind()` 解除绑定的所有快捷键
`hotkeys.unbind("ctrl+o, ctrl+alt+enter")` 解除绑定两组快捷键  
`hotkeys.unbind("ctrl+o","files")` 解除绑定名字叫files的区域范围中的一组快捷键  

```js
// 解除绑定 'a' 程序函数
hotkeys.unbind('a');

// 仅针对单个范围解除绑定快捷键
// 如果未指定范围，则默认为当前范围（hotkeys.getScope()）
hotkeys.unbind('o, enter', 'issues');
hotkeys.unbind('o, enter', 'files');
```

通过函数来解除绑定

```js
function example(){}
hotkeys('a', example);
hotkeys.unbind('a', example);

hotkeys('a', 'issues', example);
hotkeys.unbind('a', 'issues', example);
```

可以通过传入对象解除绑定的快捷键

```js
hotkeys.unbind({
  key: 'ctrl-e,ctrl-u',
  scope: 'issues',
  spitKey: '-'
})
```

传入数组可同时解除多个scope下绑定的快捷键

```js
hotkeys.unbind([
  {
    key: 'a, ctrl+r',
    scope: 'issues',
  },
  {
    key: '+, ctrl-y',
    scope: 'test',
    splitKey: '-'
  }
])
```

### isPressed

判断摁下的键是否为某个键

```js
hotkeys('a', function(){
  console.log(hotkeys.isPressed("a")); //=> true
  console.log(hotkeys.isPressed("A")); //=> true
  console.log(hotkeys.isPressed(65)); //=> true
});
```

### getPressedKeyCodes

获取摁下绑定键的键值 `hotkeys.getPressedKeyCodes()`

```js
hotkeys('command+ctrl+shift+a,f', function(){
  console.log(hotkeys.getPressedKeyCodes()); //=> [17, 65] 或者 [70]
})
```

### getPressedKeyString

获取所有注册代码的列表

```js
hotkeys('command+ctrl+shift+a,f', function() {
  console.log(hotkeys.getPressedKeyString()); //=> ['⌘', '⌃', '⇧', 'A', 'F']
})
```


### getAllKeyCodes

Get a list of all registration codes.

```js
hotkeys('command+ctrl+shift+a,f', function() {
  console.log(hotkeys.getAllKeyCodes());
  // [
  //   { scope: 'all', shortcut: 'command+ctrl+shift+a', mods: [91, 17, 16], keys: [91, 17, 16, 65] },
  //   { scope: 'all', shortcut: 'f', mods: [], keys: [42] }
  // ]
})
```

### filter

`INPUT`  `SELECT` `TEXTAREA` 默认不处理。
`hotkeys.filter` 返回 `true` 快捷键设置才会起作用，`false` 快捷键设置失效。

```javascript
hotkeys.filter = function(event){
  return true;
}
// 如何增加过滤可编辑标签 <div contentEditable="true"></div>
// contentEditable老浏览器不支持滴
hotkeys.filter = function(event) {
  var target = event.target || event.srcElement;
  var tagName = target.tagName;
  return !(target.isContentEditable ||
  tagName == 'INPUT' ||
  tagName == 'SELECT' ||
  tagName == 'TEXTAREA');
}

//
hotkeys.filter = function(event){
  var tagName = (event.target || event.srcElement).tagName;
  hotkeys.setScope(/^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? 'input' : 'other');
  return true;
}
```

## 兼容模式

```js
var k = hotkeys.noConflict();
k('a', function() {
  console.log("这里可以干一些事儿")
});

hotkeys()
// -->Uncaught TypeError: hotkeys is not a function(anonymous function)
// @ VM2170:2InjectedScript._evaluateOn
// @ VM2165:883InjectedScript._evaluateAndWrap
// @ VM2165:816InjectedScript.evaluate @ VM2165:682
```
 
## 开发

安装依赖，运行自重载构建，获取代码：

```shell
$ git https://github.com/jaywcjlove/hotkeys.git
$ cd hotkeys     # 进入目录
$ npm install    # 或者使用 yarn install 安装依赖
```

运行下面命令自动重载构建：

```shell
$ npm run watch
```

运行稳定环境

```shell
$ npm run doc
```

如果要贡献，请 fork `Hotkeys.js`, 并添加您的测试代码(在 test 目录中)，并提交一个 PR。

```shell
$ npm run test
$ npm run test:watch # Development model
```

## Contributors

As always, thanks to our amazing contributors!

<a href="https://github.com/jaywcjlove/hotkeys-js/graphs/contributors">
  <img src="https://jaywcjlove.github.io/hotkeys-js/CONTRIBUTORS.svg" />
</a>

Made with [github-action-contributors](https://github.com/jaywcjlove/github-action-contributors).


## License

[MIT © Kenny Wong](./LICENSE)
