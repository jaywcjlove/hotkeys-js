# 设置快捷键


## 定义快捷键

```js
// 定义a快捷键
hotkeys('a', function(){ alert('你按下了 a!') });

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

## 修时键判断
可以对下面的修饰键判断 `shift` `alt` `option` `ctrl` `control` `command`

```js
if(hotkeys.shift) console.log('大哥你摁下了shift键！');
```

## 切换快捷键

```js
// 一个快捷键，有可能干的活儿不一样哦
hotkeys('o, enter', 'issues', function(){ /* 干点活儿 */ });
hotkeys('o, enter', 'files', function(){ /* 另一种活儿 */ });

// 设定范围scope 
hotkeys.setScope('issues'); // 默认所有事儿都干哦 
```

## 兼容模式

```js
var k = hotkeys.noConflict();
k('a', function() {
    console.log("这里可以干一些事儿")
});

hotkeys()
// -->Uncaught TypeError: hotkeys is not a function(anonymous function) @ VM2170:2InjectedScript._evaluateOn @ VM2165:883InjectedScript._evaluateAndWrap @ VM2165:816InjectedScript.evaluate @ VM2165:682
```
