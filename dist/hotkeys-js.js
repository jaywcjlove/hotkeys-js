/*!
 * hotkeys-js v3.13.15
 * A simple micro-library for defining and dispatching keyboard shortcuts. It has no dependencies.
 * 
 * @author kenny wong <wowohoo@qq.com>
 * @license MIT
 * @homepage https://jaywcjlove.github.io/hotkeys-js
 */
const A = typeof navigator != "undefined" ? navigator.userAgent.toLowerCase().indexOf("firefox") > 0 : !1;
function P(e, t, n, i) {
  e.addEventListener ? e.addEventListener(t, n, i) : e.attachEvent && e.attachEvent(`on${t}`, n);
}
function E(e, t, n, i) {
  e && (e.removeEventListener ? e.removeEventListener(t, n, i) : e.detachEvent && e.detachEvent(`on${t}`, n));
}
function F(e, t) {
  const n = t.slice(0, t.length - 1);
  for (let i = 0; i < n.length; i++)
    n[i] = e[n[i].toLowerCase()];
  return n;
}
function B(e) {
  typeof e != "string" && (e = ""), e = e.replace(/\s/g, "");
  const t = e.split(",");
  let n = t.lastIndexOf("");
  for (; n >= 0; )
    t[n - 1] += ",", t.splice(n, 1), n = t.lastIndexOf("");
  return t;
}
function I(e, t) {
  const n = e.length >= t.length ? e : t, i = e.length >= t.length ? t : e;
  let o = !0;
  for (let r = 0; r < n.length; r++)
    i.indexOf(n[r]) === -1 && (o = !1);
  return o;
}
const L = {
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
  "-": A ? 173 : 189,
  "=": A ? 61 : 187,
  ";": A ? 59 : 186,
  "'": 222,
  "{": 219,
  "}": 221,
  "[": 219,
  "]": 221,
  "\\": 220
}, g = {
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
}, b = {
  16: "shiftKey",
  18: "altKey",
  17: "ctrlKey",
  91: "metaKey",
  shiftKey: 16,
  ctrlKey: 17,
  altKey: 18,
  metaKey: 91
}, u = {
  16: !1,
  18: !1,
  17: !1,
  91: !1
}, a = {};
for (let e = 1; e < 20; e++)
  L[`f${e}`] = 111 + e;
let l = [], _ = null, D = "all";
const m = /* @__PURE__ */ new Map(), O = (e) => L[e.toLowerCase()] || g[e.toLowerCase()] || e.toUpperCase().charCodeAt(0), R = (e) => Object.keys(L).find((t) => L[t] === e), V = (e) => Object.keys(g).find((t) => g[t] === e), $ = (e) => {
  D = e || "all";
}, x = () => D || "all", X = () => l.slice(0), z = () => l.map(
  (e) => R(e) || V(e) || String.fromCharCode(e)
), J = () => {
  const e = [];
  return Object.keys(a).forEach((t) => {
    a[t].forEach(({ key: n, scope: i, mods: o, shortcut: r }) => {
      e.push({
        scope: i,
        shortcut: r,
        mods: o,
        keys: n.split("+").map((c) => O(c))
      });
    });
  }), e;
}, G = (e) => {
  const t = e.target || e.srcElement, { tagName: n } = t;
  let i = !0;
  const o = n === "INPUT" && ![
    "checkbox",
    "radio",
    "range",
    "button",
    "file",
    "reset",
    "submit",
    "color"
  ].includes(t.type);
  return (t.isContentEditable || (o || n === "TEXTAREA" || n === "SELECT") && !t.readOnly) && (i = !1), i;
}, Q = (e) => (typeof e == "string" && (e = O(e)), l.indexOf(e) !== -1), W = (e, t) => {
  let n, i;
  e || (e = x());
  for (const o in a)
    if (Object.prototype.hasOwnProperty.call(a, o))
      for (n = a[o], i = 0; i < n.length; )
        n[i].scope === e ? n.splice(i, 1).forEach(({ element: c }) => S(c)) : i++;
  x() === e && $(t || "all");
};
function Y(e) {
  let t = e.keyCode || e.which || e.charCode;
  e.key && e.key.toLowerCase() === "capslock" && (t = O(e.key));
  const n = l.indexOf(t);
  if (n >= 0 && l.splice(n, 1), e.key && e.key.toLowerCase() === "meta" && l.splice(0, l.length), (t === 93 || t === 224) && (t = 91), t in u) {
    u[t] = !1;
    for (const i in g)
      g[i] === t && (k[i] = !1);
  }
}
const H = (e, ...t) => {
  if (typeof e == "undefined")
    Object.keys(a).forEach((n) => {
      Array.isArray(a[n]) && a[n].forEach((i) => M(i)), delete a[n];
    }), S(null);
  else if (Array.isArray(e))
    e.forEach((n) => {
      n.key && M(n);
    });
  else if (typeof e == "object")
    e.key && M(e);
  else if (typeof e == "string") {
    let [n, i] = t;
    typeof n == "function" && (i = n, n = ""), M({
      key: e,
      scope: n,
      method: i,
      splitKey: "+"
    });
  }
}, M = ({
  key: e,
  scope: t,
  method: n,
  splitKey: i = "+"
}) => {
  B(e).forEach((r) => {
    const c = r.split(i), d = c.length, s = c[d - 1], y = s === "*" ? "*" : O(s);
    if (!a[y]) return;
    t || (t = x());
    const w = d > 1 ? F(g, c) : [], p = [];
    a[y] = a[y].filter((h) => {
      const K = (n ? h.method === n : !0) && h.scope === t && I(h.mods, w);
      return K && p.push(h.element), !K;
    }), p.forEach((h) => S(h));
  });
};
function T(e, t, n, i) {
  if (t.element !== i)
    return;
  let o;
  if (t.scope === n || t.scope === "all") {
    o = t.mods.length > 0;
    for (const r in u)
      Object.prototype.hasOwnProperty.call(u, r) && (!u[r] && t.mods.indexOf(+r) > -1 || u[r] && t.mods.indexOf(+r) === -1) && (o = !1);
    (t.mods.length === 0 && !u[16] && !u[18] && !u[17] && !u[91] || o || t.shortcut === "*") && (t.keys = [], t.keys = t.keys.concat(l), t.method(e, t) === !1 && (e.preventDefault ? e.preventDefault() : e.returnValue = !1, e.stopPropagation && e.stopPropagation(), e.cancelBubble && (e.cancelBubble = !0)));
  }
}
function U(e, t) {
  const n = a["*"];
  let i = e.keyCode || e.which || e.charCode;
  if (e.code) {
    const s = {
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
      KeyZ: 90
    };
    s[e.code] && (i = s[e.code]);
  }
  if (e.key && e.key.toLowerCase() === "capslock" || !(k.filter || G).call(this, e)) return;
  if ((i === 93 || i === 224) && (i = 91), l.indexOf(i) === -1 && i !== 229 && l.push(i), ["metaKey", "ctrlKey", "altKey", "shiftKey"].forEach((s) => {
    const y = b[s];
    e[s] && l.indexOf(y) === -1 ? l.push(y) : !e[s] && l.indexOf(y) > -1 ? l.splice(l.indexOf(y), 1) : s === "metaKey" && e[s] && (l = l.filter((w) => w in b || w === i));
  }), i in u) {
    u[i] = !0;
    for (const s in g)
      if (Object.prototype.hasOwnProperty.call(g, s)) {
        const y = b[g[s]];
        k[s] = e[y];
      }
    if (!n) return;
  }
  for (const s in u)
    Object.prototype.hasOwnProperty.call(u, s) && (u[s] = e[b[s]]);
  e.getModifierState && !(e.altKey && !e.ctrlKey) && e.getModifierState("AltGraph") && (l.indexOf(17) === -1 && l.push(17), l.indexOf(18) === -1 && l.push(18), u[17] = !0, u[18] = !0);
  const r = x();
  if (n)
    for (let s = 0; s < n.length; s++)
      n[s].scope === r && (e.type === "keydown" && n[s].keydown || e.type === "keyup" && n[s].keyup) && T(e, n[s], r, t);
  if (!(i in a)) return;
  const c = a[i], d = c.length;
  for (let s = 0; s < d; s++)
    if ((e.type === "keydown" && c[s].keydown || e.type === "keyup" && c[s].keyup) && c[s].key) {
      const y = c[s], { splitKey: w } = y, p = y.key.split(w), h = [];
      for (let f = 0; f < p.length; f++)
        h.push(O(p[f]));
      h.sort().join("") === l.sort().join("") && T(e, y, r, t);
    }
}
function k(e, t, n) {
  l = [];
  const i = B(e);
  let o = [], r = "all", c = document, d = 0, s = !1, y = !0, w = "+", p = !1, h = !1;
  if (n === void 0 && typeof t == "function" && (n = t), Object.prototype.toString.call(t) === "[object Object]") {
    const f = t;
    f.scope && (r = f.scope), f.element && (c = f.element), f.keyup && (s = f.keyup), f.keydown !== void 0 && (y = f.keydown), f.capture !== void 0 && (p = f.capture), typeof f.splitKey == "string" && (w = f.splitKey), f.single === !0 && (h = !0);
  }
  for (typeof t == "string" && (r = t), h && H(e, r); d < i.length; d++) {
    const f = i[d].split(w);
    o = [], f.length > 1 && (o = F(g, f));
    let K = f[f.length - 1];
    K = K === "*" ? "*" : O(K), K in a || (a[K] = []), a[K].push({
      keyup: s,
      keydown: y,
      scope: r,
      mods: o,
      shortcut: i[d],
      method: n,
      key: i[d],
      splitKey: w,
      element: c
    });
  }
  if (typeof c != "undefined" && typeof window != "undefined") {
    if (!m.has(c)) {
      const f = (C = window.event) => U(C, c), K = (C = window.event) => {
        U(C, c), Y(C);
      };
      m.set(c, { keydownListener: f, keyupListenr: K, capture: p }), P(c, "keydown", f, p), P(c, "keyup", K, p);
    }
    if (!_) {
      const f = () => {
        l = [];
      };
      _ = { listener: f, capture: p }, P(window, "focus", f, p);
    }
  }
}
function Z(e, t = "all") {
  Object.keys(a).forEach((n) => {
    a[n].filter(
      (o) => o.scope === t && o.shortcut === e
    ).forEach((o) => {
      o && o.method && o.method({}, o);
    });
  });
}
function S(e) {
  const t = Object.values(a).flat();
  if (t.findIndex(({ element: i }) => i === e) < 0 && e) {
    const { keydownListener: i, keyupListenr: o, capture: r } = m.get(e) || {};
    i && o && (E(e, "keyup", o, r), E(e, "keydown", i, r), m.delete(e));
  }
  if ((t.length <= 0 || m.size <= 0) && (Array.from(m.keys()).forEach((o) => {
    const { keydownListener: r, keyupListenr: c, capture: d } = m.get(o) || {};
    r && c && (E(o, "keyup", c, d), E(o, "keydown", r, d), m.delete(o));
  }), m.clear(), Object.keys(a).forEach((o) => delete a[o]), _)) {
    const { listener: o, capture: r } = _;
    E(window, "focus", o, r), _ = null;
  }
}
const j = {
  getPressedKeyString: z,
  setScope: $,
  getScope: x,
  deleteScope: W,
  getPressedKeyCodes: X,
  getAllKeyCodes: J,
  isPressed: Q,
  filter: G,
  trigger: Z,
  unbind: H,
  keyMap: L,
  modifier: g,
  modifierMap: b
};
for (const e in j)
  Object.prototype.hasOwnProperty.call(j, e) && (k[e] = j[e]);
if (typeof window != "undefined") {
  const e = window.hotkeys;
  k.noConflict = (t) => (t && window.hotkeys === k && (window.hotkeys = e), k), window.hotkeys = k;
}
export {
  k as default
};
//# sourceMappingURL=hotkeys-js.js.map
