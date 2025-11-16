/*!
 * hotkeys-js v4.0.0-beta.2
 * A simple micro-library for defining and dispatching keyboard shortcuts. It has no dependencies.
 * 
 * @author kenny wong <wowohoo@qq.com>
 * @license MIT
 * @homepage https://jaywcjlove.github.io/hotkeys-js
 */
const P = typeof navigator != "undefined" ? navigator.userAgent.toLowerCase().indexOf("firefox") > 0 : !1;
function j(e, t, n, o) {
  e.addEventListener ? e.addEventListener(t, n, o) : e.attachEvent && e.attachEvent(`on${t}`, n);
}
function b(e, t, n, o) {
  e && (e.removeEventListener ? e.removeEventListener(t, n, o) : e.detachEvent && e.detachEvent(`on${t}`, n));
}
function B(e, t) {
  const n = t.slice(0, t.length - 1), o = [];
  for (let s = 0; s < n.length; s++)
    o.push(e[n[s].toLowerCase()]);
  return o;
}
function D(e) {
  typeof e != "string" && (e = ""), e = e.replace(/\s/g, "");
  const t = e.split(",");
  let n = t.lastIndexOf("");
  for (; n >= 0; )
    t[n - 1] += ",", t.splice(n, 1), n = t.lastIndexOf("");
  return t;
}
function R(e, t) {
  const n = e.length >= t.length ? e : t, o = e.length >= t.length ? t : e;
  let s = !0;
  for (let r = 0; r < n.length; r++)
    o.indexOf(n[r]) === -1 && (s = !1);
  return s;
}
const C = {
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
  "-": P ? 173 : 189,
  "=": P ? 61 : 187,
  ";": P ? 59 : 186,
  "'": 222,
  "{": 219,
  "}": 221,
  "[": 219,
  "]": 221,
  "\\": 220
}, h = {
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
}, _ = {
  16: "shiftKey",
  18: "altKey",
  17: "ctrlKey",
  91: "metaKey",
  shiftKey: 16,
  ctrlKey: 17,
  altKey: 18,
  metaKey: 91
}, d = {
  16: !1,
  18: !1,
  17: !1,
  91: !1
}, l = {};
for (let e = 1; e < 20; e++)
  C[`f${e}`] = 111 + e;
let c = [], L = null, $ = "all";
const k = /* @__PURE__ */ new Map(), E = (e) => C[e.toLowerCase()] || h[e.toLowerCase()] || e.toUpperCase().charCodeAt(0), V = (e) => Object.keys(C).find((t) => C[t] === e), X = (e) => Object.keys(h).find((t) => h[t] === e), G = (e) => {
  $ = e || "all";
}, x = () => $ || "all", z = () => c.slice(0), J = () => c.map(
  (e) => V(e) || X(e) || String.fromCharCode(e)
), Q = () => {
  const e = [];
  return Object.keys(l).forEach((t) => {
    l[t].forEach(({ key: n, scope: o, mods: s, shortcut: r }) => {
      e.push({
        scope: o,
        shortcut: r,
        mods: s,
        keys: n.split("+").map((y) => E(y))
      });
    });
  }), e;
}, H = (e) => {
  const t = e.target || e.srcElement, { tagName: n } = t;
  let o = !0;
  const s = n === "INPUT" && ![
    "checkbox",
    "radio",
    "range",
    "button",
    "file",
    "reset",
    "submit",
    "color"
  ].includes(t.type);
  return (t.isContentEditable || (s || n === "TEXTAREA" || n === "SELECT") && !t.readOnly) && (o = !1), o;
}, W = (e) => (typeof e == "string" && (e = E(e)), c.indexOf(e) !== -1), Y = (e, t) => {
  let n, o;
  e || (e = x());
  for (const s in l)
    if (Object.prototype.hasOwnProperty.call(l, s))
      for (n = l[s], o = 0; o < n.length; )
        n[o].scope === e ? n.splice(o, 1).forEach(({ element: y }) => T(y)) : o++;
  x() === e && G(t || "all");
};
function Z(e) {
  let t = e.keyCode || e.which || e.charCode;
  e.key && e.key.toLowerCase() === "capslock" && (t = E(e.key));
  const n = c.indexOf(t);
  if (n >= 0 && c.splice(n, 1), e.key && e.key.toLowerCase() === "meta" && c.splice(0, c.length), (t === 93 || t === 224) && (t = 91), t in d) {
    d[t] = !1;
    for (const o in h)
      h[o] === t && (m[o] = !1);
  }
}
const I = (e, ...t) => {
  if (typeof e == "undefined")
    Object.keys(l).forEach((n) => {
      Array.isArray(l[n]) && l[n].forEach((o) => A(o)), delete l[n];
    }), T(null);
  else if (Array.isArray(e))
    e.forEach((n) => {
      n.key && A(n);
    });
  else if (typeof e == "object")
    e.key && A(e);
  else if (typeof e == "string") {
    let [n, o] = t;
    typeof n == "function" && (o = n, n = ""), A({
      key: e,
      scope: n,
      method: o,
      splitKey: "+"
    });
  }
}, A = ({
  key: e,
  scope: t,
  method: n,
  splitKey: o = "+"
}) => {
  D(e).forEach((r) => {
    const y = r.split(o), a = y.length, i = y[a - 1], u = i === "*" ? "*" : E(i);
    if (!l[u]) return;
    t || (t = x());
    const K = a > 1 ? B(h, y) : [], g = [];
    l[u] = l[u].filter((p) => {
      const f = (n ? p.method === n : !0) && p.scope === t && R(p.mods, K);
      return f && g.push(p.element), !f;
    }), g.forEach((p) => T(p));
  });
};
function U(e, t, n, o) {
  if (t.element !== o)
    return;
  let s;
  if (t.scope === n || t.scope === "all") {
    s = t.mods.length > 0;
    for (const r in d)
      Object.prototype.hasOwnProperty.call(d, r) && (!d[r] && t.mods.indexOf(+r) > -1 || d[r] && t.mods.indexOf(+r) === -1) && (s = !1);
    (t.mods.length === 0 && !d[16] && !d[18] && !d[17] && !d[91] || s || t.shortcut === "*") && (t.keys = [], t.keys = t.keys.concat(c), t.method(e, t) === !1 && (e.preventDefault ? e.preventDefault() : e.returnValue = !1, e.stopPropagation && e.stopPropagation(), e.cancelBubble && (e.cancelBubble = !0)));
  }
}
function F(e, t) {
  const n = l["*"];
  let o = e.keyCode || e.which || e.charCode;
  if (e.code) {
    const i = {
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
    i[e.code] && (o = i[e.code]);
  }
  if (e.key && e.key.toLowerCase() === "capslock" || !(m.filter || H).call(this, e)) return;
  if ((o === 93 || o === 224) && (o = 91), c.indexOf(o) === -1 && o !== 229 && c.push(o), ["metaKey", "ctrlKey", "altKey", "shiftKey"].forEach((i) => {
    const u = _[i];
    e[i] && c.indexOf(u) === -1 ? c.push(u) : !e[i] && c.indexOf(u) > -1 ? c.splice(c.indexOf(u), 1) : i === "metaKey" && e[i] && (c = c.filter((K) => K in _ || K === o));
  }), o in d) {
    d[o] = !0;
    for (const i in h)
      if (Object.prototype.hasOwnProperty.call(h, i)) {
        const u = _[h[i]];
        m[i] = e[u];
      }
    if (!n) return;
  }
  for (const i in d)
    Object.prototype.hasOwnProperty.call(d, i) && (d[i] = e[_[i]]);
  e.getModifierState && !(e.altKey && !e.ctrlKey) && e.getModifierState("AltGraph") && (c.indexOf(17) === -1 && c.push(17), c.indexOf(18) === -1 && c.push(18), d[17] = !0, d[18] = !0);
  const r = x();
  if (n)
    for (let i = 0; i < n.length; i++)
      n[i].scope === r && (e.type === "keydown" && n[i].keydown || e.type === "keyup" && n[i].keyup) && U(e, n[i], r, t);
  if (!(o in l)) return;
  const y = l[o], a = y.length;
  for (let i = 0; i < a; i++)
    if ((e.type === "keydown" && y[i].keydown || e.type === "keyup" && y[i].keyup) && y[i].key) {
      const u = y[i], { splitKey: K } = u, g = u.key.split(K), p = [];
      for (let O = 0; O < g.length; O++)
        p.push(E(g[O]));
      p.sort().join("") === c.sort().join("") && U(e, u, r, t);
    }
}
const m = function(t, n, o) {
  c = [];
  const s = D(t);
  let r = [], y = "all", a = document, i = 0, u = !1, K = !0, g = "+", p = !1, O = !1;
  if (o === void 0 && typeof n == "function" && (o = n), Object.prototype.toString.call(n) === "[object Object]") {
    const f = n;
    f.scope && (y = f.scope), f.element && (a = f.element), f.keyup && (u = f.keyup), f.keydown !== void 0 && (K = f.keydown), f.capture !== void 0 && (p = f.capture), typeof f.splitKey == "string" && (g = f.splitKey), f.single === !0 && (O = !0);
  }
  for (typeof n == "string" && (y = n), O && I(t, y); i < s.length; i++) {
    const f = s[i].split(g);
    r = [], f.length > 1 && (r = B(h, f));
    let w = f[f.length - 1];
    w = w === "*" ? "*" : E(w), w in l || (l[w] = []), l[w].push({
      keyup: u,
      keydown: K,
      scope: y,
      mods: r,
      shortcut: s[i],
      method: o,
      key: s[i],
      splitKey: g,
      element: a
    });
  }
  if (typeof a != "undefined" && typeof window != "undefined") {
    if (!k.has(a)) {
      const f = (M = window.event) => F(M, a), w = (M = window.event) => {
        F(M, a), Z(M);
      };
      k.set(a, { keydownListener: f, keyupListenr: w, capture: p }), j(a, "keydown", f, p), j(a, "keyup", w, p);
    }
    if (!L) {
      const f = () => {
        c = [];
      };
      L = { listener: f, capture: p }, j(window, "focus", f, p);
    }
  }
};
function q(e, t = "all") {
  Object.keys(l).forEach((n) => {
    l[n].filter(
      (s) => s.scope === t && s.shortcut === e
    ).forEach((s) => {
      s && s.method && s.method({}, s);
    });
  });
}
function T(e) {
  const t = Object.values(l).flat();
  if (t.findIndex(({ element: o }) => o === e) < 0 && e) {
    const { keydownListener: o, keyupListenr: s, capture: r } = k.get(e) || {};
    o && s && (b(e, "keyup", s, r), b(e, "keydown", o, r), k.delete(e));
  }
  if ((t.length <= 0 || k.size <= 0) && (Array.from(k.keys()).forEach((s) => {
    const { keydownListener: r, keyupListenr: y, capture: a } = k.get(s) || {};
    r && y && (b(s, "keyup", y, a), b(s, "keydown", r, a), k.delete(s));
  }), k.clear(), Object.keys(l).forEach((s) => delete l[s]), L)) {
    const { listener: s, capture: r } = L;
    b(window, "focus", s, r), L = null;
  }
}
const S = {
  getPressedKeyString: J,
  setScope: G,
  getScope: x,
  deleteScope: Y,
  getPressedKeyCodes: z,
  getAllKeyCodes: Q,
  isPressed: W,
  filter: H,
  trigger: q,
  unbind: I,
  keyMap: C,
  modifier: h,
  modifierMap: _
};
for (const e in S) {
  const t = e;
  Object.prototype.hasOwnProperty.call(S, t) && (m[t] = S[t]);
}
if (typeof window != "undefined") {
  const e = window.hotkeys;
  m.noConflict = (t) => (t && window.hotkeys === m && (window.hotkeys = e), m), window.hotkeys = m;
}
export {
  m as default
};
//# sourceMappingURL=hotkeys-js.js.map
