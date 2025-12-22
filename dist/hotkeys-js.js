/*!
 * hotkeys-js v4.0.0
 * A simple micro-library for defining and dispatching keyboard shortcuts. It has no dependencies.
 * 
 * @author kenny wong <wowohoo@qq.com>
 * @license MIT
 * @homepage https://jaywcjlove.github.io/hotkeys-js
 */
const j = typeof navigator != "undefined" ? navigator.userAgent.toLowerCase().indexOf("firefox") > 0 : !1;
function P(e, t, n, o) {
  e.addEventListener ? e.addEventListener(t, n, o) : e.attachEvent && e.attachEvent(`on${t}`, n);
}
function b(e, t, n, o) {
  e && (e.removeEventListener ? e.removeEventListener(t, n, o) : e.detachEvent && e.detachEvent(`on${t}`, n));
}
function F(e, t) {
  const n = t.slice(0, t.length - 1), o = [];
  for (let s = 0; s < n.length; s++)
    o.push(e[n[s].toLowerCase()]);
  return o;
}
function B(e) {
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
function D(e) {
  let t = e.keyCode || e.which || e.charCode;
  return e.code && /^Key[A-Z]$/.test(e.code) && (t = e.code.charCodeAt(3)), t;
}
const x = {
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
  "-": j ? 173 : 189,
  "=": j ? 61 : 187,
  ";": j ? 59 : 186,
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
}, y = {
  16: !1,
  18: !1,
  17: !1,
  91: !1
}, l = {};
for (let e = 1; e < 20; e++)
  x[`f${e}`] = 111 + e;
let c = [], L = null, I = "all";
const w = /* @__PURE__ */ new Map(), E = (e) => x[e.toLowerCase()] || h[e.toLowerCase()] || e.toUpperCase().charCodeAt(0), V = (e) => Object.keys(x).find((t) => x[t] === e), X = (e) => Object.keys(h).find((t) => h[t] === e), z = (e) => {
  I = e || "all";
}, C = () => I || "all", Z = () => c.slice(0), q = () => c.map(
  (e) => V(e) || X(e) || String.fromCharCode(e)
), J = () => {
  const e = [];
  return Object.keys(l).forEach((t) => {
    l[t].forEach(({ key: n, scope: o, mods: s, shortcut: r }) => {
      e.push({
        scope: o,
        shortcut: r,
        mods: s,
        keys: n.split("+").map((a) => E(a))
      });
    });
  }), e;
}, G = (e) => {
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
}, Q = (e) => (typeof e == "string" && (e = E(e)), c.indexOf(e) !== -1), W = (e, t) => {
  let n, o;
  e || (e = C());
  for (const s in l)
    if (Object.prototype.hasOwnProperty.call(l, s))
      for (n = l[s], o = 0; o < n.length; )
        n[o].scope === e ? n.splice(o, 1).forEach(({ element: a }) => T(a)) : o++;
  C() === e && z(t || "all");
};
function Y(e) {
  let t = D(e);
  e.key && e.key.toLowerCase() === "capslock" && (t = E(e.key));
  const n = c.indexOf(t);
  if (n >= 0 && c.splice(n, 1), e.key && e.key.toLowerCase() === "meta" && c.splice(0, c.length), (t === 93 || t === 224) && (t = 91), t in y) {
    y[t] = !1;
    for (const o in h)
      h[o] === t && (K[o] = !1);
  }
}
const H = (e, ...t) => {
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
  B(e).forEach((r) => {
    const a = r.split(o), u = a.length, i = a[u - 1], d = i === "*" ? "*" : E(i);
    if (!l[d]) return;
    t || (t = C());
    const g = u > 1 ? F(h, a) : [], k = [];
    l[d] = l[d].filter((p) => {
      const f = (n ? p.method === n : !0) && p.scope === t && R(p.mods, g);
      return f && k.push(p.element), !f;
    }), k.forEach((p) => T(p));
  });
};
function U(e, t, n, o) {
  if (t.element !== o)
    return;
  let s;
  if (t.scope === n || t.scope === "all") {
    s = t.mods.length > 0;
    for (const r in y)
      Object.prototype.hasOwnProperty.call(y, r) && (!y[r] && t.mods.indexOf(+r) > -1 || y[r] && t.mods.indexOf(+r) === -1) && (s = !1);
    (t.mods.length === 0 && !y[16] && !y[18] && !y[17] && !y[91] || s || t.shortcut === "*") && (t.keys = [], t.keys = t.keys.concat(c), t.method(e, t) === !1 && (e.preventDefault ? e.preventDefault() : e.returnValue = !1, e.stopPropagation && e.stopPropagation(), e.cancelBubble && (e.cancelBubble = !0)));
  }
}
function $(e, t) {
  const n = l["*"];
  let o = D(e);
  if (e.key && e.key.toLowerCase() === "capslock" || !(K.filter || G).call(this, e)) return;
  if ((o === 93 || o === 224) && (o = 91), c.indexOf(o) === -1 && o !== 229 && c.push(o), ["metaKey", "ctrlKey", "altKey", "shiftKey"].forEach((i) => {
    const d = _[i];
    e[i] && c.indexOf(d) === -1 ? c.push(d) : !e[i] && c.indexOf(d) > -1 ? c.splice(c.indexOf(d), 1) : i === "metaKey" && e[i] && (c = c.filter((g) => g in _ || g === o));
  }), o in y) {
    y[o] = !0;
    for (const i in h)
      if (Object.prototype.hasOwnProperty.call(h, i)) {
        const d = _[h[i]];
        K[i] = e[d];
      }
    if (!n) return;
  }
  for (const i in y)
    Object.prototype.hasOwnProperty.call(y, i) && (y[i] = e[_[i]]);
  e.getModifierState && !(e.altKey && !e.ctrlKey) && e.getModifierState("AltGraph") && (c.indexOf(17) === -1 && c.push(17), c.indexOf(18) === -1 && c.push(18), y[17] = !0, y[18] = !0);
  const r = C();
  if (n)
    for (let i = 0; i < n.length; i++)
      n[i].scope === r && (e.type === "keydown" && n[i].keydown || e.type === "keyup" && n[i].keyup) && U(e, n[i], r, t);
  if (!(o in l)) return;
  const a = l[o], u = a.length;
  for (let i = 0; i < u; i++)
    if ((e.type === "keydown" && a[i].keydown || e.type === "keyup" && a[i].keyup) && a[i].key) {
      const d = a[i], { splitKey: g } = d, k = d.key.split(g), p = [];
      for (let O = 0; O < k.length; O++)
        p.push(E(k[O]));
      p.sort().join("") === c.sort().join("") && U(e, d, r, t);
    }
}
const K = function(t, n, o) {
  c = [];
  const s = B(t);
  let r = [], a = "all", u = document, i = 0, d = !1, g = !0, k = "+", p = !1, O = !1;
  if (o === void 0 && typeof n == "function" && (o = n), Object.prototype.toString.call(n) === "[object Object]") {
    const f = n;
    f.scope && (a = f.scope), f.element && (u = f.element), f.keyup && (d = f.keyup), f.keydown !== void 0 && (g = f.keydown), f.capture !== void 0 && (p = f.capture), typeof f.splitKey == "string" && (k = f.splitKey), f.single === !0 && (O = !0);
  }
  for (typeof n == "string" && (a = n), O && H(t, a); i < s.length; i++) {
    const f = s[i].split(k);
    r = [], f.length > 1 && (r = F(h, f));
    let m = f[f.length - 1];
    m = m === "*" ? "*" : E(m), m in l || (l[m] = []), l[m].push({
      keyup: d,
      keydown: g,
      scope: a,
      mods: r,
      shortcut: s[i],
      method: o,
      key: s[i],
      splitKey: k,
      element: u
    });
  }
  if (typeof u != "undefined" && typeof window != "undefined") {
    if (!w.has(u)) {
      const f = (M = window.event) => $(M, u), m = (M = window.event) => {
        $(M, u), Y(M);
      };
      w.set(u, { keydownListener: f, keyupListenr: m, capture: p }), P(u, "keydown", f, p), P(u, "keyup", m, p);
    }
    if (!L) {
      const f = () => {
        c = [];
      };
      L = { listener: f, capture: p }, P(window, "focus", f, p);
    }
  }
};
function N(e, t = "all") {
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
    const { keydownListener: o, keyupListenr: s, capture: r } = w.get(e) || {};
    o && s && (b(e, "keyup", s, r), b(e, "keydown", o, r), w.delete(e));
  }
  if ((t.length <= 0 || w.size <= 0) && (Array.from(w.keys()).forEach((s) => {
    const { keydownListener: r, keyupListenr: a, capture: u } = w.get(s) || {};
    r && a && (b(s, "keyup", a, u), b(s, "keydown", r, u), w.delete(s));
  }), w.clear(), Object.keys(l).forEach((s) => delete l[s]), L)) {
    const { listener: s, capture: r } = L;
    b(window, "focus", s, r), L = null;
  }
}
const S = {
  getPressedKeyString: q,
  setScope: z,
  getScope: C,
  deleteScope: W,
  getPressedKeyCodes: Z,
  getAllKeyCodes: J,
  isPressed: Q,
  filter: G,
  trigger: N,
  unbind: H,
  keyMap: x,
  modifier: h,
  modifierMap: _
};
for (const e in S) {
  const t = e;
  Object.prototype.hasOwnProperty.call(S, t) && (K[t] = S[t]);
}
if (typeof window != "undefined") {
  const e = window.hotkeys;
  K.noConflict = (t) => (t && window.hotkeys === K && (window.hotkeys = e), K), window.hotkeys = K;
}
export {
  K as default
};
//# sourceMappingURL=hotkeys-js.js.map
