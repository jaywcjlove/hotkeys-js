# 设置快捷键

[![](https://img.shields.io/github/issues/jaywcjlove/hotkeys.svg)](https://github.com/jaywcjlove/hotkeys/issues) [![](https://img.shields.io/github/forks/jaywcjlove/hotkeys.svg)](https://github.com/jaywcjlove/hotkeys/network) [![](https://img.shields.io/github/stars/jaywcjlove/hotkeys.svg)](https://github.com/jaywcjlove/hotkeys/stargazers) [![](https://img.shields.io/github/release/jaywcjlove/hotkeys.svg)](https://github.com/jaywcjlove/hotkeys/releases)

这又是在重复造轮子，呵呵~！！

## 下载

### bower
Run `bower info hotkeysjs` to list the available versions.  
下载 `bower install hotkeysjs`  

### npm

下载 `npm install hotkeys-js`


## 定义快捷键

```js
// 定义a快捷键
hotkeys('a', function(event){
    //event.srcElement: input 
    //event.target: input
    if(event.target === "input"){
        alert('你在输入框中按下了 a!')
    }
    alert('你按下了 a!') 
 });

// 返回false将停止活动，并阻止默认浏览器事件
hotkeys('ctrl+r', function(){ alert('停止刷新!'); return false });

// 多个快捷方式做同样的事情
hotkeys('⌘+r, ctrl+r', function(){ });
```


## 支持的键

`⇧`, `shift`, `option`, `⌥`, `alt`, `ctrl`, `control`, `command`, `⌘`。

`⌘` Command()  
`⌃` Control  
`⌥` Option(alt)  
`⇧` Shift  
`⇪` Caps Lock(大写)   
`fn` 功能键就是fn  
`↩︎` return/Enter

## 修饰键判断
可以对下面的修饰键判断 `shift` `alt` `option` `ctrl` `control` `command`

```js
if(hotkeys.shift) console.log('大哥你摁下了shift键！');
```

## 切换快捷键

```js
// 一个快捷键，有可能干的活儿不一样哦
hotkeys('ctrl+o, ctrl+alt+enter', 'issues', function(){
    console.log('干点活儿');
});
hotkeys('o, enter', 'files', function(){ 
    console.log('另一种活儿');
});

// 设定范围scope 
hotkeys.setScope('issues'); // 默认所有事儿都干哦 
```

## 解除绑定

`hotkeys.unbind("ctrl+o, ctrl+alt+enter")` 解除绑定两组快捷键  
`hotkeys.unbind("ctrl+o","files")` 解除绑定名字叫files钟的一组快捷键  


## 键判断
判断摁下的键是否为某个键

```js
hotkeys('a', function(){
    console.log(hotkeys.isPressed("A")); //=> true
    console.log(hotkeys.isPressed(65)); //=> true
});
```

## 获取摁下键值
获取摁下绑定键的键值

```js
hotkeys('command+ctrl+shift+a,f', function(){
    console.log(hotkeys.getPressedKeyCodes()); //=> [17, 65] 或者 [70]
})
```


## 过滤
`INPUT`  `SELECT` `TEXTAREA` 默认不处理。  
`key.filter` 返回 `true` 快捷键设置才会起作用，`flase` 快捷键设置失效。   

```javascript
key.filter = function(event){
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
