/*!
* home page (https://github.com/jaywcjlove/hotkeys)
*/
window&&!window.getComputedStyle&&(window.getComputedStyle=function(a){return this.el=a,this.getPropertyValue=function(b){var c=/(\-([a-z]){1})/g;return"float"==b&&(b="styleFloat"),c.test(b)&&(b=b.replace(c,function(){return arguments[2].toUpperCase()})),a.currentStyle[b]?a.currentStyle[b]:null},this}),Array.prototype.filter||(Array.prototype.filter=function(a){"use strict";if(void 0===this||null===this)throw new TypeError;var b=Object(this),c=b.length>>>0;if("function"!=typeof a)throw new TypeError;for(var d=[],e=arguments.length>=2?arguments[1]:void 0,f=0;c>f;f++)if(f in b){var g=b[f];a.call(e,g,f,b)&&d.push(g)}return d}),Array.indexOf||(Array.prototype.indexOf=function(a){for(var b=0;b<this.length;b++)if(this[b]==a)return b;return-1}),Array.prototype.forEach||(Array.prototype.forEach=function(a){var b=this.length;if("function"!=typeof a)throw new TypeError;for(var c=arguments[1],d=0;b>d;d++)d in this&&a.call(c,this[d],d,this)}),Array.prototype.remove||(Array.prototype.remove=function(a){var b=this.indexOf(a);return b>-1&&this.splice(b,1),this}),function(a,b){"use strict";function c(a){return a=a?null!=a&&a.nodeType?a.nodeType==a.DOCUMENT_NODE:!1:b}function d(a){return"[object Function]"=={}.toString.call(a)}function e(a){return a instanceof Object}function f(a){return a instanceof Array}function g(a){return"string"==typeof a}function h(a){return null!=a&&a==a.window}function i(a){return e(a)&&!h(a)&&Object.getPrototypeOf(a)==Object.prototype}function j(a){var b="object"==typeof a&&"[object object]"==Object.prototype.toString.call(a).toLowerCase()&&!a.length;return b}function k(a){if(!a)return b;var c="";return u.each("Boolean Number HTMLDivElement String Function Array Date RegExp Object Error".split(" "),function(b,d){Object.prototype.toString.call(a).indexOf(d)>-1&&(c="HTMLDivElement"==d?"Object":d)}),c}function l(a){return a?"number"==typeof a.length:null}function m(a,c){var d,e;return s.singleTagRE.test(a)&&(d=u(document.createElement(RegExp.$1))),d||(a.replace&&(a=a.replace(s.tagExpanderRE,"<$1></$2>")),c===b&&(c=s.fragmentRE.test(a)&&RegExp.$1),c in s.containers||(c="*"),e=s.containers[c],e.innerHTML=""+a,d=u.each(p.call(e.childNodes),function(){e.removeChild(this)})),d}function n(a,b,c,e){return d(b)?b.call(a,c,e):b}var o=[],p=o.slice,q=o.filter,r=(o.some,[1,9,11]),s={},t={tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},u=function(){var c=function(a){return new c.fn.init(a)};return c.fn=c.prototype={init:function(b){var g;if(b)if("string"==typeof b&&(b=b.trim())&&"<"==b[0]&&/^\s*<(\w+|!)[^>]*>/.test(b))g=m(b),b=null;else{if(d(b))return c(document).ready(b);f(b)?g=b:e(b)?(g=[b],b=null):r.indexOf(b.nodeType)>=0||b===a?(g=[b],b=null):g=function(){var a;return document&&/^#([\w-]+)$/.test(b)?(a=document.getElementById(RegExp.$1))?[a]:[]:p.call(/^\.([\w-]+)$/.test(b)?document.getElementsByClassName(RegExp.$1):/^[\w-]+$/.test(b)?document.getElementsByTagName(b):document.querySelectorAll(b))}()}else g=o,g.selector=b||"",g.__proto__=c.fn.init.prototype;return g=g||o,c.extend(g,c.fn),g.selector=b||"",g},size:function(){return this.length}},c.fn.init.prototype=c.fn,c.extend=c.fn.extend=function(){var a,c,e,f,g=arguments[0],h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[1]||{},h=2),"object"==typeof g||d(g)||(g={}),i===h&&(g=this,--h);i>h;h++)if(null!=(a=arguments[h]))for(c in a)e=g[c],f=a[c],g!==f&&f!==b&&(g[c]=f);return g},c}();u.fn.extend({forEach:o.forEach,concat:o.concat,indexOf:o.indexOf,ready:function(a){return/complete|loaded|interactive/.test(document.readyState)&&document.body?a(u):document.addEventListener("DOMContentLoaded",function(){a(u)},!1),this},each:function(a){return u.each(this,a)},map:function(a){return u(u.map(this,function(b,c){return a.call(b,c,b)}))},get:function(a){return a===b?p.call(this):this[a>=0?a:a+this.length]},index:function(a){return a?this.indexOf(u(a)[0]):this.parent().children().indexOf(this[0])},empty:function(){return this.each(function(){this.innerHTML=""})},detach:function(){return this.remove()},remove:function(){return this.each(function(){null!=this.parentNode&&this.parentNode.removeChild(this)})},replaceWith:function(a){return this.before(a).remove()},unwrap:function(){return this.parent().each(function(){u(this).replaceWith(u(this).children())}),this},text:function(a){return a===b?this.length>0?this[0].textContent:null:this.each(function(){this.textContent=n(this,a)})},html:function(a){return 0 in arguments?this.each(function(){u(this).empty().append(n(this,a))}):0 in this?this[0].innerHTML:null},val:function(a){return 0 in arguments?this.each(function(b){this.value=n(this,a,b,this.value)}):this[0]&&(this[0].multiple?u(this[0]).find("option").filter(function(){return this.selected}).pluck("value"):this[0].value)},data:function(a,b){var c,d,e="data-"+a;if(!a)return this[0].dataset;if(a&&j(a)){for(d in a)this.attr("data-"+d,a[d]);return this}b&&(f(b)||j(b))&&(b=JSON.stringify(b)),c=1 in arguments?this.attr(e,b):this.attr(e);try{c=JSON.parse(c)}catch(g){}return c},css:function(a,c){if(!this[0])return[];var d=getComputedStyle(this[0],"");if(c===b&&"string"==typeof a)return d.getPropertyValue(a);var e,f="";for(e in a)f+=e+":"+a[e]+";";return"string"==typeof a&&(f=a+":"+c),this.each(function(){f?this.style.cssText+=";"+f:""})},hide:function(){return this.css("display","none")},show:function(){return this.each(function(){function a(a){var c,d=document.createElement(a);return u("body").append(u(d)),c=b(d).display,d.parentNode.removeChild(d),c}"none"==this.style.display&&(this.style.display="");var b=function(a){return a.currentStyle||document.defaultView.getComputedStyle(a,null)};"none"==b(this).display&&(this.style.display=a(this.nodeName))})},toggle:function(a){return this.each(function(){var c=u(this);(a===b?"none"==c.css("display"):a)?c.show():c.hide()})},offset:function(){if(0==this.length)return null;var b=this[0].getBoundingClientRect();return{left:b.left+a.pageXOffset,top:b.top+a.pageYOffset,width:b.width,height:b.height}},prop:function(a,b){return a=t[a]||a,1 in arguments?this.each(function(c){this[a]=n(this,b,c,this[a])}):this[0]&&this[0][a]},removeProp:function(a){return a=t[a]||a,this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},attr:function(a,c){var d,f;return"string"!=typeof a||1 in arguments?this.each(function(){if(e(a))for(f in a)this.setAttribute(f,a[f]);else this.setAttribute(a,n(this,c))}):this.length&&1===this[0].nodeType?!(d=this[0].getAttribute(a))&&a in this[0]?this[0][a]:d:b},removeAttr:function(a){return this.each(function(){1===this.nodeType&&this.removeAttribute(a)})},hasClass:function(a){return a?o.some.call(this,function(a){return this.test(a.className)},new RegExp("(^|\\s)"+a+"(\\s|$)")):!1},addClass:function(a){if(!a)return this;var b,c,d;return this.each(function(){return b=[],c=this.className,d=n(this,a).trim(),d.split(/\s+/).forEach(function(a){u(this).hasClass(a)||b.push(a)},this),d?void(b.length?this.className=c+(c?" ":"")+b.join(" "):null):this})},removeClass:function(a){var c;return a===b?this.removeAttr("class"):this.each(function(b){c=this.className,n(this,a,b,c).split(/\s+/).forEach(function(a){c=c.replace(new RegExp("(^|\\s)"+a+"(\\s|$)")," ").trim()},this),this.className=c?c:""})},toggleClass:function(a){return a?this.each(function(){var b=u(this),c=n(this,a);c.split(/\s+/g).forEach(function(a){b.hasClass(a)?b.removeClass(a):b.addClass(a)})}):this},filter:function(a){return d(a)?this.not(this.not(a)):u(q.call(this,function(b){return u.matches(b,a)}))},is:function(a){return this.length>0&&e(a)?this.indexOf(a)>-1?!0:!1:this.length>0&&u.matches(this[0],a)},not:function(a){var c=[];if(d(a)&&a.call!==b)this.each(function(b){a.call(this,b)||c.push(this)});else{var e="string"==typeof a?this.filter(a):l(a)&&d(a.item)?p.call(a):u(a);this.forEach(function(a){e.indexOf(a)<0&&c.push(a)})}return u(c)},pluck:function(a){return u.map(this,function(b){return b[a]})},find:function(a){for(var b=this.children(),c=[];b.length>0;)b=u.map(b,function(a){return c.indexOf(a)<0&&c.push(a),(b=u(a).children())&&b.length>0?b:void 0});return u(c).filter(a||"*")},clone:function(){return this.map(function(){return this.cloneNode(!0)})},add:function(a){return u.unique(this.concat(u(a)))},eq:function(a){return u(-1===a?this.slice(a):this.slice(a,+a+1))},first:function(){var a=this[0];return a&&!e(a)?a:u(a)},children:function(a){var b=[];return q.call(this.pluck("children"),function(a){u.map(a,function(a){a&&1==a.nodeType&&b.push(a)})}),u(b).filter(a||"*")},contents:function(){return this.map(function(){return this.contentDocument||p.call(this.childNodes)})},parent:function(a){return u(u.unique(this.pluck("parentNode"))).filter(a||"*")},parents:function(a){var b=u.sibling(this,"parentNode");return null==a?u(b):u(b).filter(a)},closest:function(a,b){var d=this[0],e=!1;for("object"==typeof a&&(e=u(a));d&&!(e?e.indexOf(d)>=0:u.matches(d,a));)d=d!==b&&!c(d)&&d.parentNode;return u(d)},slice:function(){return u(p.apply(this,arguments))},prev:function(a){return u(this.pluck("previousElementSibling")).filter(a||"*")},next:function(a){return u(this.pluck("nextElementSibling")).filter(a||"*")},nextAll:function(a){return u(u.sibling(this,"nextElementSibling")).filter(a||"*")},prevAll:function(a){return u(u.sibling(this,"previousElementSibling")).filter(a||"*")},siblings:function(a){var b=[];return this.map(function(a,c){q.call(c.parentNode.children,function(a){a&&1==a.nodeType&&a!=c&&b.push(a)})}),u(b).filter(a||"*")},scrollTop:function(a){if(this.length){var c="scrollTop"in this[0];return a===b?c?this[0].scrollTop:this[0].pageYOffset:this.each(c?function(){this.scrollTop=a}:function(){this.scrollTo(this.scrollX,a)})}},scrollLeft:function(a){if(this.length){var c="scrollLeft"in this[0];return a===b?c?this[0].scrollLeft:this[0].pageXOffset:this.each(c?function(){this.scrollLeft=a}:function(){this.scrollTo(a,this.scrollY)})}}}),u.extend({isDocument:c,isFunction:d,isObject:e,isArray:f,isString:g,isWindow:h,isPlainObject:i,isJson:j,parseJSON:JSON.parse,type:k,likeArray:l,trim:function(a){return a?a.trim():void 0},intersect:function(a,b){var c=[];return a.forEach(function(a){b.indexOf(a)>-1&&c.push(a)}),c},error:function(a){throw a},getUrlParam:function(b){var c=new RegExp("(^|&)"+b+"=([^&]*)(&|$)","i"),d=a.location.search.substr(1).match(c);return null!=d?unescape(d[2]):null},each:function(a,b){var c,d;if(l(a)){for(c=0;c<a.length;c++)if(b.call(a[c],c,a[c])===!1)return a}else for(d in a)if(b.call(a[d],d,a[d])===!1)return a;return a},map:function(a,b){var c,d,e,f=[];if(l(a))for(d=0;d<a.length;d++)c=b(a[d],d),null!=c&&f.push(c);else for(e in a)c=b(a[e],e),null!=c&&f.push(c);return f.length>0?u.fn.concat.apply([],f):f},grep:function(a,b){return q.call(a,b)},matches:function(a,b){if(!b||!a||1!==a.nodeType)return!1;var c=a.webkitMatchesSelector||a.mozMatchesSelector||a.oMatchesSelector||a.msMatchesSelector||a.matchesSelector;return c?c.call(a,b):void 0},unique:function(a){return q.call(a,function(b,c){return a.indexOf(b)==c})},inArray:function(a,b,c){return o.indexOf.call(b,a,c)},sibling:function(a,b){for(var d=[];a.length>0;)a=u.map(a,function(a){return(a=a[b])&&!c(a)&&d.indexOf(a)<0&&d.push(a),a});return d},contains:function(a,b){return a&&!b?document.documentElement.contains(a):a!==b&&a.contains(b)}}),s={singleTagRE:/^<(\w+)\s*\/?>(?:<\/\1>|)$/,fragmentRE:/^\s*<(\w+|!)[^>]*>/,tagExpanderRE:/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,table:document.createElement("table"),tableRow:document.createElement("tr"),containers:{"*":document.createElement("div"),tr:document.createElement("tbody"),tbody:s.table,thead:s.table,tfoot:s.table,td:s.tableRow,th:s.tableRow}},["width","height"].forEach(function(a){var d=a.replace(/./,a[0].toUpperCase());u.fn[a]=function(e){var f,g=this[0];return e===b?h(g)?g["inner"+d]:c(g)?g.documentElement["scroll"+d]:(f=this.offset())&&f[a]:this.each(function(b){g=$(this),g.css(a,n(this,e,b,g[a]()))})}}),["after","prepend","before","append"].forEach(function(c,d){var e=d%2;u.fn[c]=function(){var c,f,g,h=u.map(arguments,function(a){return c=k(a),"Function"==c&&(a=n(this,a)),"Object"==c||"Array"==c||null==a?a:m(a)}),i=this.length>1;return h.length<1?this:this.each(function(c,j){f=e?j:j.parentNode,j=0==d?j.nextSibling:1==d?j.firstChild:2==d?j:null;var k=u.contains(document.documentElement,f);h.forEach(function(c){var d;i&&(c=c.cloneNode(!0)),f.insertBefore(c,j),!k||null==c.nodeName||"SCRIPT"!==c.nodeName.toUpperCase()||c.type&&"text/javascript"!==c.type||c.src?k&&c.children&&c.children.length>0&&u(c)&&(g=u(c).find("script"))&&g.length>0&&g.each(function(a,b){d=b.innerHTML}):d=c.innerHTML,d?a.eval.call(a,d):b})})},u.fn[e?c+"To":"insert"+(d?"Before":"After")]=function(a){return u(a)[c](this),this}}),u.extend(String.prototype,{trim:function(){return this.replace(/(^\s*)|(\s*$)/g,"")},leftTrim:function(){return this.replace(/(^\s*)/g,"")}});var v=a.JSLite,w=a.$;u.noConflict=function(b){return b&&a.JSLite===u&&(a.JSLite=v),a.$===u&&(a.$=w),u},a.JSLite=a.$=u}(window),function(a){a.fn.extend({serializeArray:function(){var b,c,d=[],e=this.get(0);return e&&e.elements?(a([].slice.call(this.get(0).elements)).each(function(){b=a(this),c=b.attr("type"),"fieldset"!=this.nodeName.toLowerCase()&&!this.disabled&&"submit"!=c&&"reset"!=c&&"button"!=c&&("radio"!=c&&"checkbox"!=c||this.checked)&&d.push({name:b.attr("name"),value:b.val()})}),d):d},serialize:function(a){return a=[],this.serializeArray().forEach(function(b){a.push(encodeURIComponent(b.name)+"="+encodeURIComponent(b.value))}),a.join("&")}})}(JSLite),function(a){function b(b,c,f,h,i){var j=d(b),k=g[j]||(g[j]=[]);c.split(/\s/).forEach(function(c){var d=a.extend(e(c),{fn:f,sel:i,i:k.length}),g=d.proxy=function(c){if(i){var d=a(b).find(i),e=[].some.call(d,function(b){return b===c.target||a.contains(b,c.target)});if(!e)return!1}c.data=h;var g=f.apply(b,void 0==c._data?[c]:[c].concat(c._data));return g===!1&&(c.preventDefault(),c.stopPropagation()),g};k.push(d),b.addEventListener&&b.addEventListener(d.e,g,!1)})}function c(b,c,h,i){(c||"").split(/\s/).forEach(function(c){a.event=e(c),f(b,c,h,i).forEach(function(a){delete g[d(b)][a.i],b.removeEventListener&&b.removeEventListener(a.e,a.proxy,!1)})})}function d(a){return a._jid||(a._jid=h++)}function e(a){var b=(""+a).split(".");return{e:b[0],ns:b.slice(1).sort().join(" ")}}function f(a,b,c,f){d(a);return b=e(b),(g[d(a)]||[]).filter(function(a){return!(!a||b.e&&a.e!=b.e||c&&a.fn.toString()!==c.toString()||f&&a.sel!=f)})}var g={},h=1;a.fn.extend({bind:function(a,c){return this.each(function(){b(this,a,c)})},unbind:function(a,b){return this.each(function(){c(this,a,b)})},on:function(c,d,e,f){var g=this;return c&&!a.isString(c)?(a.each(c,function(a,b){g.on(a,d,e,b)}),g):(a.isString(d)||a.isFunction(f)||f===!1||(f=e,e=d,d=void 0),(a.isFunction(e)||e===!1)&&(f=e,e=void 0),f===!1&&(f=function(){return!1}),this.each(function(){b(this,c,f,e,d)}))},off:function(b,d,e){var f=this;return b&&!a.isString(b)?(a.each(b,function(a,b){f.off(a,d,b)}),f):(a.isString(d)||a.isFunction(e)||e===!1||(e=d,d=void 0),e===!1&&(e=function(){return!1}),f.each(function(){c(this,b,e,d)}))},delegate:function(a,b,c){return this.on(b,a,c)},trigger:function(a,b){var c=a,d={};return d.click=d.mousedown=d.mouseup=d.mousemove="MouseEvents","string"==typeof c?(a=document.createEvent(d[c]||"Events"),a.initEvent(c,!0,!0),a._data=b,this.each(function(){"dispatchEvent"in this&&this.dispatchEvent(a)})):void 0}}),a.event={add:b,remove:c},"blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error paste drop dragstart dragover beforeunload".split(" ").forEach(function(b){a.fn[b]=function(a){return a?this.bind(b,a):this.trigger(b)}})}(JSLite),function(a){function b(b,c,d,e){return a.isFunction(c)&&(e=d,d=c,c=void 0),a.isFunction(d)||(e=d,d=void 0),{url:b,data:c,success:d,dataType:e}}var c=0;a.extend({ajaxSettings:{type:"GET",success:function(){},error:function(){},xhr:function(){return new window.XMLHttpRequest},processData:!0,async:!0,complete:function(){},accepts:{script:"text/javascript, application/javascript",json:"application/json",xml:"application/xml, text/xml",html:"text/html",text:"text/plain"},cache:!0},param:function(b,c,d){if("String"==a.type(b))return b;var e=[],f="";if(e.add=function(a,b){this.push(encodeURIComponent(a)+"="+encodeURIComponent(null==b?"":b))},1==d&&"Object"==a.type(b))e.add(c,b);else for(var g in b){var h=b[g],f="",i=function(){return c?1==c?g:d&&"Array"==a.type(b)?c:c+"["+("Array"==a.type(b)?"":g)+"]":g}();f="object"==typeof h?this.param(h,i,c):e.add(i,h),f&&e.push(f)}return e.join("&")},get:function(){return a.ajax(b.apply(null,arguments))},post:function(){var c=b.apply(null,arguments);return c.type="POST",a.ajax(c)},getJSON:function(){var a=b.apply(null,arguments),c=arguments[0];return a.dataType=c&&c==document.location.host?"json":"jsonp",this.ajax(a)},ajaxJSONP:function(b){var d,e=b.jsonpCallback,f=(a.isFunction(e)?e():e)||"jsonp"+ ++c,g=document.createElement("script"),h=window[f],i={};return a(g).on("load error",function(c,e){a(g).off().remove(),"error"!=c.type&&d?b.success(d[0],i,b):b.error(c,e||"error",b),window[f]=h,d&&a.isFunction(h)&&h(d[0]),h=d=void 0}),window[f]=function(){d=arguments},g.src=b.url.replace(/\?(.+)=\?/,"?$1="+f),document.head.appendChild(g),b.xhr()},ajax:function(b){var c,d,e=function(a,b){r[a.toLowerCase()]=[a,b]},f=function(a,b){return""==b?a:(a+"&"+b).replace(/[&?]{1,2}/,"?")},g=function(b){b.processData&&b.data&&"string"!=a.type(b.data)&&(b.data=a.param(b.data,b.traditional)),!b.data||b.type&&"GET"!=b.type.toUpperCase()||(b.url=f(b.url,b.data),b.data=void 0)};if(b=b||{},a.isString(b))if("GET"==arguments[0]){var h=arguments[1];arguments[2]&&a.isFunction(arguments[2])?a.get(h,arguments[2]):arguments[2]&&a.isJson(arguments[2])&&a.get(h.indexOf("?")>-1?h+"&"+this.param(arguments[2]):h+"?"+this.param(arguments[2]),arguments[3])}else"POST"==arguments[0]&&a.post(arguments[1],arguments[2],arguments[3],arguments[4]);else{d=a.extend({},b||{});for(c in a.ajaxSettings)void 0===d[c]&&(d[c]=a.ajaxSettings[c]);g(d);var i=d.dataType,j=/\?.+=\?/.test(d.url);if(j&&(i="jsonp"),d.cache!==!1&&(b&&b.cache===!0||"script"!=i&&"jsonp"!=i)||(d.url=f(d.url,"_="+Date.now())),"jsonp"==i)return j||(d.url=f(d.url,d.jsonp?d.jsonp+"=?":d.jsonp===!1?"":"callback=?")),a.ajaxJSONP(d);var k=d.data,l=d.success||function(){},m=d.error||function(){},n=a.ajaxSettings.accepts[d.dataType],o=d.contentType,p=new XMLHttpRequest,q=p.setRequestHeader,r={};if(d.crossDomain||(e("X-Requested-With","XMLHttpRequest"),e("Accept",n||"*/*")),d.headers)for(name in d.headers)e(name,d.headers[name]);(d.contentType||d.contentType!==!1&&d.data&&"GET"!=d.type.toUpperCase())&&e("Content-Type",d.contentType||"application/x-www-form-urlencoded"),p.onreadystatechange=function(){if(4==p.readyState)if(p.status>=200&&p.status<300||0==p.status)if("application/json"!=n||/^\s*$/.test(p.responseText))l(p.responseText,"success",p);else{var a,b=!1;a=p.responseText;try{"script"==d.dataType?(1,eval)(a):"xml"==d.dataType?a=p.responseXML:"json"==d.dataType&&(a=/^\s*$/.test(a)?null:JSON.parse(a))}catch(c){b=c}b?m(b,"parsererror",p,d):l(a,"success",p)}else d.complete(p,b?"error":"success")},k&&k instanceof Object&&"GET"==d.type&&(k?d.url=d.url.indexOf("?")>-1?d.url+"&"+k:d.url+"?"+k:null),p.open(d.type,d.url,!0),n&&p.setRequestHeader("Accept",n),k instanceof Object&&"application/json"==n&&(k=JSON.stringify(k),o=o||"application/json");for(name in r)q.apply(p,r[name]);p.send(k?k:null)}}}),a.fn.extend({load:function(){if(!this.length||0===arguments.length)return this;var c,d=this,e=arguments[0].split(/\s/),f=b.apply(null,arguments);return callback=f.success,e.length>1&&(f.url=e[0],c=e[1]),f.success=function(b){b=b.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,""),d.html(c?a("<div>").html(b).find(c):b),callback&&callback.apply(d,arguments)},a.ajax(f),this}})}(JSLite);
/*
Syntax highlighting with language autodetection.
https://highlightjs.org/
*/

(function(factory) {

  // Setup highlight.js for different environments. First is Node.js or
  // CommonJS.
  if(typeof exports !== 'undefined') {
    factory(exports);
  } else {
    // Export hljs globally even when using AMD for cases when this script
    // is loaded with others that may still expect a global hljs.
    window.hljs = factory({});

    // Finally register the global hljs with AMD.
    if(typeof define === 'function' && define.amd) {
      define('hljs', [], function() {
        return window.hljs;
      });
    }
  }

}(function(hljs) {

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
  }

  function tag(node) {
    return node.nodeName.toLowerCase();
  }

  function testRe(re, lexeme) {
    var match = re && re.exec(lexeme);
    return match && match.index == 0;
  }

  function isNotHighlighted(language) {
    return (/^(no-?highlight|plain|text)$/i).test(language);
  }

  function blockLanguage(block) {
    var i, match, length,
        classes = block.className + ' ';

    classes += block.parentNode ? block.parentNode.className : '';

    // language-* takes precedence over non-prefixed class names
    match = (/\blang(?:uage)?-([\w-]+)\b/i).exec(classes);
    if (match) {
      return getLanguage(match[1]) ? match[1] : 'no-highlight';
    }

    classes = classes.split(/\s+/);
    for (i = 0, length = classes.length; i < length; i++) {
      if (getLanguage(classes[i]) || isNotHighlighted(classes[i])) {
        return classes[i];
      }
    }
  }

  function inherit(parent, obj) {
    var result = {}, key;
    for (key in parent)
      result[key] = parent[key];
    if (obj)
      for (key in obj)
        result[key] = obj[key];
    return result;
  }

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == 3)
          offset += child.nodeValue.length;
        else if (child.nodeType == 1) {
          result.push({
            event: 'start',
            offset: offset,
            node: child
          });
          offset = _nodeStream(child, offset);
          // Prevent void elements from having an end tag that would actually
          // double them in the output. There are more void elements in HTML
          // but we list only those realistically expected in code display.
          if (!tag(child).match(/br|hr|img|input/)) {
            result.push({
              event: 'stop',
              offset: offset,
              node: child
            });
          }
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(original, highlighted, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (!original.length || !highlighted.length) {
        return original.length ? original : highlighted;
      }
      if (original[0].offset != highlighted[0].offset) {
        return (original[0].offset < highlighted[0].offset) ? original : highlighted;
      }

      /*
      To avoid starting the stream just before it should stop the order is
      ensured that original always starts first and closes last:

      if (event1 == 'start' && event2 == 'start')
        return original;
      if (event1 == 'start' && event2 == 'stop')
        return highlighted;
      if (event1 == 'stop' && event2 == 'start')
        return original;
      if (event1 == 'stop' && event2 == 'stop')
        return highlighted;

      ... which is collapsed to:
      */
      return highlighted[0].event == 'start' ? original : highlighted;
    }

    function open(node) {
      function attr_str(a) {return ' ' + a.nodeName + '="' + escape(a.value) + '"';}
      result += '<' + tag(node) + Array.prototype.map.call(node.attributes, attr_str).join('') + '>';
    }

    function close(node) {
      result += '</' + tag(node) + '>';
    }

    function render(event) {
      (event.event == 'start' ? open : close)(event.node);
    }

    while (original.length || highlighted.length) {
      var stream = selectStream();
      result += escape(value.substr(processed, stream[0].offset - processed));
      processed = stream[0].offset;
      if (stream == original) {
        /*
        On any opening or closing tag of the original markup we first close
        the entire highlighted node stack, then render the original tag along
        with all the following original tags at the same offset and then
        reopen all the tags on the highlighted stack.
        */
        nodeStack.reverse().forEach(close);
        do {
          render(stream.splice(0, 1)[0]);
          stream = selectStream();
        } while (stream == original && stream.length && stream[0].offset == processed);
        nodeStack.reverse().forEach(open);
      } else {
        if (stream[0].event == 'start') {
          nodeStack.push(stream[0].node);
        } else {
          nodeStack.pop();
        }
        render(stream.splice(0, 1)[0]);
      }
    }
    return result + escape(value.substr(processed));
  }

  /* Initialization */

  function compileLanguage(language) {

    function reStr(re) {
        return (re && re.source) || re;
    }

    function langRe(value, global) {
      return new RegExp(
        reStr(value),
        'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
      );
    }

    function compileMode(mode, parent) {
      if (mode.compiled)
        return;
      mode.compiled = true;

      mode.keywords = mode.keywords || mode.beginKeywords;
      if (mode.keywords) {
        var compiled_keywords = {};

        var flatten = function(className, str) {
          if (language.case_insensitive) {
            str = str.toLowerCase();
          }
          str.split(' ').forEach(function(kw) {
            var pair = kw.split('|');
            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
          });
        };

        if (typeof mode.keywords == 'string') { // string
          flatten('keyword', mode.keywords);
        } else {
          Object.keys(mode.keywords).forEach(function (className) {
            flatten(className, mode.keywords[className]);
          });
        }
        mode.keywords = compiled_keywords;
      }
      mode.lexemesRe = langRe(mode.lexemes || /\b\w+\b/, true);

      if (parent) {
        if (mode.beginKeywords) {
          mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')\\b';
        }
        if (!mode.begin)
          mode.begin = /\B|\b/;
        mode.beginRe = langRe(mode.begin);
        if (!mode.end && !mode.endsWithParent)
          mode.end = /\B|\b/;
        if (mode.end)
          mode.endRe = langRe(mode.end);
        mode.terminator_end = reStr(mode.end) || '';
        if (mode.endsWithParent && parent.terminator_end)
          mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;
      }
      if (mode.illegal)
        mode.illegalRe = langRe(mode.illegal);
      if (mode.relevance === undefined)
        mode.relevance = 1;
      if (!mode.contains) {
        mode.contains = [];
      }
      var expanded_contains = [];
      mode.contains.forEach(function(c) {
        if (c.variants) {
          c.variants.forEach(function(v) {expanded_contains.push(inherit(c, v));});
        } else {
          expanded_contains.push(c == 'self' ? mode : c);
        }
      });
      mode.contains = expanded_contains;
      mode.contains.forEach(function(c) {compileMode(c, mode);});

      if (mode.starts) {
        compileMode(mode.starts, parent);
      }

      var terminators =
        mode.contains.map(function(c) {
          return c.beginKeywords ? '\\.?(' + c.begin + ')\\.?' : c.begin;
        })
        .concat([mode.terminator_end, mode.illegal])
        .map(reStr)
        .filter(Boolean);
      mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : {exec: function(/*s*/) {return null;}};
    }

    compileMode(language);
  }

  /*
  Core highlighting function. Accepts a language name, or an alias, and a
  string with the code to highlight. Returns an object with the following
  properties:

  - relevance (int)
  - value (an HTML string with highlighting markup)

  */
  function highlight(name, value, ignore_illegals, continuation) {

    function subMode(lexeme, mode) {
      for (var i = 0; i < mode.contains.length; i++) {
        if (testRe(mode.contains[i].beginRe, lexeme)) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode, lexeme) {
      if (testRe(mode.endRe, lexeme)) {
        while (mode.endsParent && mode.parent) {
          mode = mode.parent;
        }
        return mode;
      }
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, lexeme);
      }
    }

    function isIllegal(lexeme, mode) {
      return !ignore_illegals && testRe(mode.illegalRe, lexeme);
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
      return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];
    }

    function buildSpan(classname, insideSpan, leaveOpen, noPrefix) {
      var classPrefix = noPrefix ? '' : options.classPrefix,
          openSpan    = '<span class="' + classPrefix,
          closeSpan   = leaveOpen ? '' : '</span>';

      openSpan += classname + '">';

      return openSpan + insideSpan + closeSpan;
    }

    function processKeywords() {
      if (!top.keywords)
        return escape(mode_buffer);
      var result = '';
      var last_index = 0;
      top.lexemesRe.lastIndex = 0;
      var match = top.lexemesRe.exec(mode_buffer);
      while (match) {
        result += escape(mode_buffer.substr(last_index, match.index - last_index));
        var keyword_match = keywordMatch(top, match);
        if (keyword_match) {
          relevance += keyword_match[1];
          result += buildSpan(keyword_match[0], escape(match[0]));
        } else {
          result += escape(match[0]);
        }
        last_index = top.lexemesRe.lastIndex;
        match = top.lexemesRe.exec(mode_buffer);
      }
      return result + escape(mode_buffer.substr(last_index));
    }

    function processSubLanguage() {
      var explicit = typeof top.subLanguage == 'string';
      if (explicit && !languages[top.subLanguage]) {
        return escape(mode_buffer);
      }

      var result = explicit ?
                   highlight(top.subLanguage, mode_buffer, true, continuations[top.subLanguage]) :
                   highlightAuto(mode_buffer, top.subLanguage.length ? top.subLanguage : undefined);

      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Usecase in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        relevance += result.relevance;
      }
      if (explicit) {
        continuations[top.subLanguage] = result.top;
      }
      return buildSpan(result.language, result.value, false, true);
    }

    function processBuffer() {
      return top.subLanguage !== undefined ? processSubLanguage() : processKeywords();
    }

    function startNewMode(mode, lexeme) {
      var markup = mode.className? buildSpan(mode.className, '', true): '';
      if (mode.returnBegin) {
        result += markup;
        mode_buffer = '';
      } else if (mode.excludeBegin) {
        result += escape(lexeme) + markup;
        mode_buffer = '';
      } else {
        result += markup;
        mode_buffer = lexeme;
      }
      top = Object.create(mode, {parent: {value: top}});
    }

    function processLexeme(buffer, lexeme) {

      mode_buffer += buffer;
      if (lexeme === undefined) {
        result += processBuffer();
        return 0;
      }

      var new_mode = subMode(lexeme, top);
      if (new_mode) {
        result += processBuffer();
        startNewMode(new_mode, lexeme);
        return new_mode.returnBegin ? 0 : lexeme.length;
      }

      var end_mode = endOfMode(top, lexeme);
      if (end_mode) {
        var origin = top;
        if (!(origin.returnEnd || origin.excludeEnd)) {
          mode_buffer += lexeme;
        }
        result += processBuffer();
        do {
          if (top.className) {
            result += '</span>';
          }
          relevance += top.relevance;
          top = top.parent;
        } while (top != end_mode.parent);
        if (origin.excludeEnd) {
          result += escape(lexeme);
        }
        mode_buffer = '';
        if (end_mode.starts) {
          startNewMode(end_mode.starts, '');
        }
        return origin.returnEnd ? 0 : lexeme.length;
      }

      if (isIllegal(lexeme, top))
        throw new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.className || '<unnamed>') + '"');

      /*
      Parser should not reach this point as all types of lexemes should be caught
      earlier, but if it does due to some bug make sure it advances at least one
      character forward to prevent infinite looping.
      */
      mode_buffer += lexeme;
      return lexeme.length || 1;
    }

    var language = getLanguage(name);
    if (!language) {
      throw new Error('Unknown language: "' + name + '"');
    }

    compileLanguage(language);
    var top = continuation || language;
    var continuations = {}; // keep continuations for sub-languages
    var result = '', current;
    for(current = top; current != language; current = current.parent) {
      if (current.className) {
        result = buildSpan(current.className, '', true) + result;
      }
    }
    var mode_buffer = '';
    var relevance = 0;
    try {
      var match, count, index = 0;
      while (true) {
        top.terminators.lastIndex = index;
        match = top.terminators.exec(value);
        if (!match)
          break;
        count = processLexeme(value.substr(index, match.index - index), match[0]);
        index = match.index + count;
      }
      processLexeme(value.substr(index));
      for(current = top; current.parent; current = current.parent) { // close dangling modes
        if (current.className) {
          result += '</span>';
        }
      }
      return {
        relevance: relevance,
        value: result,
        language: name,
        top: top
      };
    } catch (e) {
      if (e.message.indexOf('Illegal') != -1) {
        return {
          relevance: 0,
          value: escape(value)
        };
      } else {
        throw e;
      }
    }
  }

  /*
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - value (an HTML string with highlighting markup)
  - second_best (object with the same structure for second-best heuristically
    detected language, may be absent)

  */
  function highlightAuto(text, languageSubset) {
    languageSubset = languageSubset || options.languages || Object.keys(languages);
    var result = {
      relevance: 0,
      value: escape(text)
    };
    var second_best = result;
    languageSubset.forEach(function(name) {
      if (!getLanguage(name)) {
        return;
      }
      var current = highlight(name, text, false);
      current.language = name;
      if (current.relevance > second_best.relevance) {
        second_best = current;
      }
      if (current.relevance > result.relevance) {
        second_best = result;
        result = current;
      }
    });
    if (second_best.language) {
      result.second_best = second_best;
    }
    return result;
  }

  /*
  Post-processing of the highlighted markup:

  - replace TABs with something more useful
  - replace real line-breaks with '<br>' for non-pre containers

  */
  function fixMarkup(value) {
    if (options.tabReplace) {
      value = value.replace(/^((<[^>]+>|\t)+)/gm, function(match, p1 /*..., offset, s*/) {
        return p1.replace(/\t/g, options.tabReplace);
      });
    }
    if (options.useBR) {
      value = value.replace(/\n/g, '<br>');
    }
    return value;
  }

  function buildClassName(prevClassName, currentLang, resultLang) {
    var language = currentLang ? aliases[currentLang] : resultLang,
        result   = [prevClassName.trim()];

    if (!prevClassName.match(/\bhljs\b/)) {
      result.push('hljs');
    }

    if (prevClassName.indexOf(language) === -1) {
      result.push(language);
    }

    return result.join(' ').trim();
  }

  /*
  Applies highlighting to a DOM node containing code. Accepts a DOM node and
  two optional parameters for fixMarkup.
  */
  function highlightBlock(block) {
    var language = blockLanguage(block);
    if (isNotHighlighted(language))
        return;

    var node;
    if (options.useBR) {
      node = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      node.innerHTML = block.innerHTML.replace(/\n/g, '').replace(/<br[ \/]*>/g, '\n');
    } else {
      node = block;
    }
    var text = node.textContent;
    var result = language ? highlight(language, text, true) : highlightAuto(text);

    var originalStream = nodeStream(node);
    if (originalStream.length) {
      var resultNode = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      resultNode.innerHTML = result.value;
      result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
    }
    result.value = fixMarkup(result.value);

    block.innerHTML = result.value;
    block.className = buildClassName(block.className, language, result.language);
    block.result = {
      language: result.language,
      re: result.relevance
    };
    if (result.second_best) {
      block.second_best = {
        language: result.second_best.language,
        re: result.second_best.relevance
      };
    }
  }

  var options = {
    classPrefix: 'hljs-',
    tabReplace: null,
    useBR: false,
    languages: undefined
  };

  /*
  Updates highlight.js global options with values passed in the form of an object
  */
  function configure(user_options) {
    options = inherit(options, user_options);
  }

  /*
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
  */
  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;

    var blocks = document.querySelectorAll('pre code');
    Array.prototype.forEach.call(blocks, highlightBlock);
  }

  /*
  Attaches highlighting to the page load event.
  */
  function initHighlightingOnLoad() {
    addEventListener('DOMContentLoaded', initHighlighting, false);
    addEventListener('load', initHighlighting, false);
  }

  var languages = {};
  var aliases = {};

  function registerLanguage(name, language) {
    var lang = languages[name] = language(hljs);
    if (lang.aliases) {
      lang.aliases.forEach(function(alias) {aliases[alias] = name;});
    }
  }

  function listLanguages() {
    return Object.keys(languages);
  }

  function getLanguage(name) {
    name = name.toLowerCase();
    return languages[name] || languages[aliases[name]];
  }

  /* Interface definition */

  hljs.highlight = highlight;
  hljs.highlightAuto = highlightAuto;
  hljs.fixMarkup = fixMarkup;
  hljs.highlightBlock = highlightBlock;
  hljs.configure = configure;
  hljs.initHighlighting = initHighlighting;
  hljs.initHighlightingOnLoad = initHighlightingOnLoad;
  hljs.registerLanguage = registerLanguage;
  hljs.listLanguages = listLanguages;
  hljs.getLanguage = getLanguage;
  hljs.inherit = inherit;

  // Common regexps
  hljs.IDENT_RE = '[a-zA-Z]\\w*';
  hljs.UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
  hljs.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  hljs.C_NUMBER_RE = '(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
  hljs.BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
  hljs.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  hljs.BACKSLASH_ESCAPE = {
    begin: '\\\\[\\s\\S]', relevance: 0
  };
  hljs.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  hljs.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  hljs.PHRASAL_WORDS_MODE = {
    begin: /\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/
  };
  hljs.COMMENT = function (begin, end, inherits) {
    var mode = hljs.inherit(
      {
        className: 'comment',
        begin: begin, end: end,
        contains: []
      },
      inherits || {}
    );
    mode.contains.push(hljs.PHRASAL_WORDS_MODE);
    mode.contains.push({
      className: 'doctag',
      begin: "(?:TODO|FIXME|NOTE|BUG|XXX):",
      relevance: 0
    });
    return mode;
  };
  hljs.C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$');
  hljs.C_BLOCK_COMMENT_MODE = hljs.COMMENT('/\\*', '\\*/');
  hljs.HASH_COMMENT_MODE = hljs.COMMENT('#', '$');
  hljs.NUMBER_MODE = {
    className: 'number',
    begin: hljs.NUMBER_RE,
    relevance: 0
  };
  hljs.C_NUMBER_MODE = {
    className: 'number',
    begin: hljs.C_NUMBER_RE,
    relevance: 0
  };
  hljs.BINARY_NUMBER_MODE = {
    className: 'number',
    begin: hljs.BINARY_NUMBER_RE,
    relevance: 0
  };
  hljs.CSS_NUMBER_MODE = {
    className: 'number',
    begin: hljs.NUMBER_RE + '(' +
      '%|em|ex|ch|rem'  +
      '|vw|vh|vmin|vmax' +
      '|cm|mm|in|pt|pc|px' +
      '|deg|grad|rad|turn' +
      '|s|ms' +
      '|Hz|kHz' +
      '|dpi|dpcm|dppx' +
      ')?',
    relevance: 0
  };
  hljs.REGEXP_MODE = {
    className: 'regexp',
    begin: /\//, end: /\/[gimuy]*/,
    illegal: /\n/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      {
        begin: /\[/, end: /\]/,
        relevance: 0,
        contains: [hljs.BACKSLASH_ESCAPE]
      }
    ]
  };
  hljs.TITLE_MODE = {
    className: 'title',
    begin: hljs.IDENT_RE,
    relevance: 0
  };
  hljs.UNDERSCORE_TITLE_MODE = {
    className: 'title',
    begin: hljs.UNDERSCORE_IDENT_RE,
    relevance: 0
  };

  return hljs;
}));

;(function($){

    var $li_all = $('#keyboard li')

    hotkeys('*', function(evn){
        var key_num = evn.keyCode,str = '';

        str = 'keyCode:' + key_num; 

        if(hotkeys.shift)   str += ', shift';
        if(hotkeys.ctrl)    str += ', ctrl';
        if(hotkeys.alt)     str += ', alt';
        if(hotkeys.control) str += ', control';
        if(hotkeys.command) str += ', command';


        $('#key_info').html(str);

        console.log("evn1",evn,String.fromCharCode(evn.keyCode));

        $li_all.each(function(index, el) {

            var kc = $(el).data('keycode');

            if(kc === key_num) $(el).addClass('pressed');

        });

        return false
    });


    $li_all.on('click',function(){
        var key_num = $(this).data('keycode');

        $('#key_info').html(key_num > -1 ? 'keyCode:' + $(this).data('keycode') : '');

    })

    $(document).on('keyup',function(){
        $li_all.removeClass('pressed');
    })


})(JSLite);


