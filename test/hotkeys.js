var tape = require('tape');
require('tape-dom')(tape);
var hotkeys = require('../dist/hotkeys.js');
var isff = navigator.userAgent.toLowerCase().indexOf('firefox') > 0

// 模拟键盘摁键
// http://output.jsbin.com/awenaq/3
function __triggerKeyboardEvent(el, keyCode, opt){
  var eventObj = document.createEventObject ?
      document.createEventObject() : document.createEvent("Events");

  if(eventObj.initEvent){
    eventObj.initEvent("keydown", true, true);
  }

  eventObj.keyCode = keyCode;
  eventObj.which = keyCode;
  if(opt){
    for(var a in opt){
      eventObj[a] = opt[a];
    }
  }
  el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("onkeydown", eventObj); 
} 


tape('hotkeys 单元测试', function (t) {

  hotkeys('w', function(e){
      t.equal(e.keyCode, 87,'单个按键 w keyCode == 87');
  });
  __triggerKeyboardEvent(document.body, 87);

  hotkeys('enter', function(e){
    t.equal(e.keyCode, 13,'单个特殊键按键 enter，enter验证 keyCode == 13');
  });
  hotkeys('return', function(e){
    t.equal(e.keyCode, 13,'单个特殊键按键 return，return验证 keyCode == 13');
  });
  __triggerKeyboardEvent(document.body, 13);


  hotkeys('space', function(e){
    t.equal(e.keyCode, 32,'单个特殊键按键 space，space验证 keyCode == 32');
  });
  __triggerKeyboardEvent(document.body, 32);

  hotkeys('backspace', function(e){
    t.equal(e.keyCode, 8,'单个特殊键按键 backspace，backspace 验证 keyCode == 8');
  });
  __triggerKeyboardEvent(document.body, 8);

  hotkeys('tab', function(e){
    t.equal(e.keyCode, 9,'单个特殊键按键 tab，tab 验证 keyCode == 9');
  });
  __triggerKeyboardEvent(document.body, 9);

  hotkeys('clear', function(e){
    t.equal(e.keyCode, 12,'单个特殊键按键 clear，clear 验证 keyCode == 12');
  });
  __triggerKeyboardEvent(document.body, 12);

  hotkeys(',', function(e){
    t.equal(e.keyCode, 188,'单个特殊键按键 , ，, 验证 keyCode == 188');
  });
  __triggerKeyboardEvent(document.body, 188);

  hotkeys('.', function(e){
    t.equal(e.keyCode, 190,'单个特殊键按键 . ，. 验证 keyCode == 190');
  });
  __triggerKeyboardEvent(document.body, 190);

  hotkeys('.', function(e){
    t.equal(e.keyCode, 190,'单个特殊键按键 . ，. 验证 keyCode == 190');
  });
  __triggerKeyboardEvent(document.body, 190);

  hotkeys('/', function(e){
    t.equal(e.keyCode, 191,'单个特殊键按键 / ，/ 验证 keyCode == 191');
  });
  __triggerKeyboardEvent(document.body, 191);

  hotkeys('`', function(e){
    t.equal(e.keyCode, 192,'单个特殊键按键 ` ，` 验证 keyCode == 192');
  });
  __triggerKeyboardEvent(document.body, 192);

  hotkeys('-', function(e){
    t.equal(e.keyCode, isff?173:189,'单个特殊键按键 -，- 验证 keyCode == 火狐?173:189');
  });
  __triggerKeyboardEvent(document.body, isff?173:189);

  hotkeys('=', function(e){
    t.equal(e.keyCode, isff?61:187,'单个特殊键按键 =，= 验证 keyCode == 火狐?61:187');
  });
  __triggerKeyboardEvent(document.body, isff?61:187);

  hotkeys(';', function(e){
    t.equal(e.keyCode, isff?59:186,'单个特殊键按键 ; ，; 验证 keyCode == 火狐?59:186');
  });
  __triggerKeyboardEvent(document.body, isff?59:186);

  hotkeys("\'".toString(), function(e){
    t.equal(e.keyCode, 222,"单个特殊键按键 \' ，\' 验证 keyCode == 222 ");
  });
  __triggerKeyboardEvent(document.body, 222);

  hotkeys("\\".toString(), function(e){
    t.equal(e.keyCode, 220,"单个特殊键按键 \\ ，\\ 验证 keyCode == 220 ");
  });
  __triggerKeyboardEvent(document.body, 220);

  hotkeys("[".toString(), function(e){
    t.equal(e.keyCode, 219,"单个特殊键按键 [ ，[ 验证 keyCode == 219 ");
  });
  __triggerKeyboardEvent(document.body, 219);

  hotkeys("]".toString(), function(e){
    t.equal(e.keyCode, 221,"单个特殊键按键 ] ，] 验证 keyCode == 221 ");
  });
  __triggerKeyboardEvent(document.body, 221);

  hotkeys('left', function(e){
    t.equal(e.keyCode, 37,'单个特殊键按键 left，left 验证 keyCode == 37');
  });
  __triggerKeyboardEvent(document.body, 37);

  hotkeys('up', function(e){
    t.equal(e.keyCode, 38,'单个特殊键按键 up，up 验证 keyCode == 38');
  });
  __triggerKeyboardEvent(document.body, 38);
  
  hotkeys('del', function(e){
    t.equal(e.keyCode, 46,'单个特殊键按键 del，del 验证 keyCode == 46');
  });
  hotkeys('delete', function(e){
    t.equal(e.keyCode, 46,'单个特殊键按键 delete，delete 验证 keyCode == 46');
  });
  __triggerKeyboardEvent(document.body, 46);

  hotkeys('home', function(e){
    t.equal(e.keyCode, 36,'单个特殊键按键 home，home 验证 keyCode == 36');
  });
  __triggerKeyboardEvent(document.body, 36);

  hotkeys('pageup', function(e){
    t.equal(e.keyCode, 33,'单个特殊键按键 pageup，pageup 验证 keyCode == 33');
  });
  __triggerKeyboardEvent(document.body, 33);

  hotkeys('pagedown', function(e){
    t.equal(e.keyCode, 34,'单个特殊键按键 pagedown，pagedown 验证 keyCode == 34');
  });
  __triggerKeyboardEvent(document.body, 34);


  hotkeys('end', function(e){
    t.equal(e.keyCode, 35,'单个特殊键按键 end，end 验证 keyCode == 35');
  });
  __triggerKeyboardEvent(document.body, 35);


  hotkeys('right', function(e){
    t.equal(e.keyCode, 39,'单个特殊键按键 right，right 验证 keyCode == 39');
  });
  __triggerKeyboardEvent(document.body, 39);

  hotkeys('down', function(e){
    t.equal(e.keyCode, 40,'单个特殊键按键 down，down 验证 keyCode == 40');
  });
  __triggerKeyboardEvent(document.body, 40);

  hotkeys('esc', function(e){
    t.equal(e.keyCode, 27,'单个特殊键按键 esc，esc 验证 keyCode == 27');
  });
  hotkeys('escape', function(e){
    t.equal(e.keyCode, 27,'单个特殊键按键 escape，escape 验证 keyCode == 27');
  });
  __triggerKeyboardEvent(document.body, 27);


  hotkeys('CapsLock', function(e){
    t.equal(e.keyCode, 20,'单个特殊键按键 CapsLock，CapsLock验证 keyCode == 20');
  });
  hotkeys('⇪', function(e){
    t.equal(e.keyCode, 20,'单个特殊键按键 ⇪，⇪验证 keyCode == 20');
  });
  __triggerKeyboardEvent(document.body, 20);


  hotkeys('⌘+r', function(e){
    t.equal(e.keyCode, 82,'组合键 ⌘+d，d验证 keyCode == 82');
    t.equal(e.metaKey, true,'组合键 ⌘+d，alt验证 metaKey == true');
    return false;
  });
  __triggerKeyboardEvent(document.body, 82,{
    metaKey:true
  });

  hotkeys('alt+d', function(e){
    t.equal(e.keyCode, 68,'组合键 alt+d，d验证 keyCode == 68');
    t.equal(e.altKey, true,'组合键 alt+d，alt验证 altKey == true');
  });
  __triggerKeyboardEvent(document.body, 68,{
    altKey:true
  });

  hotkeys('shift+a', function(e){
    t.equal(e.keyCode, 65,'组合键 shift+a，a验证 keyCode == 65');
    t.equal(e.shiftKey, true,'组合键 shift+a，shift验证 shiftKey == true');
  });
  __triggerKeyboardEvent(document.body, 65,{
    shiftKey:true
  });

  hotkeys('⇧+a', function(e){
    t.equal(e.keyCode, 65,'组合键 ⇧+a，a验证 keyCode == 65');
    t.equal(e.shiftKey, true,'组合键 ⇧+a，⇧验证 shiftKey == true');
  });
  __triggerKeyboardEvent(document.body, 65,{
    shiftKey:true
  });

  hotkeys('⌘+a', function(e){
    t.equal(e.keyCode, 65,'组合键 ⌘+a，a验证 keyCode == 65');
    t.equal(e.metaKey, true,'组合键 ⌘+a，⌘验证 metaKey == true');
  });
  __triggerKeyboardEvent(document.body, 65,{
    metaKey:true
  });

  hotkeys('⌃+a', function(e){
    t.equal(e.keyCode, 65,'组合键 ⌃+a，a验证 keyCode == 65');
    t.equal(e.ctrlKey, true,'组合键 ⌃+a，⌃验证 ctrlKey == true');
  });
  __triggerKeyboardEvent(document.body, 65,{
    ctrlKey:true
  });

  hotkeys('⌥+a', function(e){
    t.equal(e.keyCode, 65,'组合键 ⌥+a，a验证 keyCode == 65');
    t.equal(e.altKey, true,'组合键 ⌥+a，⌥验证 altKey == true');
  });
  __triggerKeyboardEvent(document.body, 65,{
    altKey:true
  });


})
