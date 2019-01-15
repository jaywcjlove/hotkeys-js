/*!
* home page (https://github.com/jaywcjlove/hotkeys)
*/
var keyboards = document.getElementById('keyboard').getElementsByTagName('li');
var keyinfo = document.getElementById('key_info')
// var $li_all = $('#keyboard li')

hotkeys('*', function (evn) {
  var key_num = evn.keyCode, str = '';

  str = 'keyCode:' + key_num;
  if (hotkeys.shift) str += ', shift';
  if (hotkeys.ctrl) str += ', ctrl';
  if (hotkeys.alt) str += ', alt';
  if (hotkeys.control) str += ', control';
  if (hotkeys.command) str += ', command';

  keyinfo.innerHTML = str;

  console.log("evn1", evn, String.fromCharCode(evn.keyCode));

  for(var i =0;i < keyboards.length; i++){
    var kc = parseInt(keyboards[i].dataset.keycode,10);
    if (kc === key_num) keyboards[i].className = 'pressed';
  }
  return false
});


function addEvent(elem, event, fn) {
  if (elem.addEventListener) {
    elem.addEventListener(event, fn, false);
  } else if (elem.attachEvent) {
    elem.attachEvent('on' + event, fn);
  } else {
    elem['on' + event] = fn;
  }
}

for(var i =0;i < keyboards.length; i++){
  keyboards[i].onclick = function (params) {
    var kc = parseInt(this.dataset.keycode, 10);
    keyinfo.innerHTML = 'keyCode:' + kc;
  }
}
addEvent(document,'keyup',function(){
  for (var i = 0; i < keyboards.length; i++) {
    var kc = parseInt(keyboards[i].dataset.keycode, 10);
    keyboards[i].className = '';
  }
})

var tran = new Translater();