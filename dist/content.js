(function() {
  "use strict";
  const DEFAULTS = {
    lastTone: "professional",
    disabledSites: []
  };
  async function getPreferences() {
    const keys = Object.keys(DEFAULTS);
    const result = await chrome.storage.local.get(keys);
    return { ...DEFAULTS, ...result };
  }
  async function setLastTone(tone) {
    await chrome.storage.local.set({ lastTone: tone });
  }
  async function isSiteDisabled(hostname) {
    const prefs = await getPreferences();
    return prefs.disabledSites.includes(hostname);
  }
  const FONT_DISPLAY = `"Fraunces", Georgia, "Iowan Old Style", serif`;
  const FONT_BODY = `"Inter", "Segoe UI", system-ui, -apple-system, sans-serif`;
  const LIGHT_TOKENS = {
    gradient: "linear-gradient(135deg, #ff7a3e 0%, #ffab5c 100%)",
    bgSoft: "linear-gradient(145deg, #ffe9d6 0%, #fffaf4 100%)",
    bgMuted: "#fffaf6",
    cardBg: "rgba(255, 252, 248, 0.97)",
    popupBg: "radial-gradient(circle at top right, rgba(255, 196, 145, 0.38), transparent 42%), linear-gradient(180deg, #fffaf6 0%, #fff4ea 100%)",
    popupHeaderBg: "radial-gradient(circle at top right, rgba(255, 255, 255, 0.85), transparent 32%), linear-gradient(135deg, #ffede0 0%, #fff7f1 100%)",
    sectionBg: "rgba(255, 255, 255, 0.82)",
    text: "#2a1a11",
    textSecondary: "#5c3f2e",
    textTertiary: "#7a5a46",
    accentStrong: "#8a4a1f",
    accentSoft: "#73431a",
    link: "#7a3d10",
    border: "rgba(170, 118, 82, 0.28)",
    borderSoft: "rgba(190, 141, 109, 0.22)",
    shadow: "0 24px 54px rgba(110, 70, 43, 0.18)",
    shadowSoft: "0 12px 26px rgba(133, 86, 45, 0.08)",
    pillBg: "rgba(255, 255, 255, 0.82)",
    buttonSecondaryBg: "rgba(255, 255, 255, 0.86)",
    buttonSecondaryHoverBg: "rgba(255, 244, 235, 0.96)",
    toggleTrack: "#d5c1b0",
    focusRing: "rgba(138, 74, 31, 0.38)",
    glassHighlight: "rgba(255, 255, 255, 0.9)",
    surfaceRaised: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,247,241,0.92) 100%)",
    gaugeTrack: "#f3e7dc",
    diffRemoveBg: "#ffe0e0",
    diffRemoveFg: "#b02020",
    diffAddBg: "#dcf7dc",
    diffAddFg: "#1f6f1f",
    errorBg: "linear-gradient(180deg, #fff5f3 0%, #fff0ed 100%)",
    errorBorder: "#ffd8d2",
    errorFg: "#b02222",
    toneSelectedBg: "linear-gradient(135deg, #fff0e3 0%, #fff9f2 100%)",
    toneSelectedBorder: "#ff9c66",
    toneHoverBg: "rgba(255, 241, 230, 0.98)",
    iconShadow: "0 14px 24px rgba(163, 97, 38, 0.28)"
  };
  const DARK_TOKENS = {
    gradient: "linear-gradient(135deg, #ff9259 0%, #ffb97a 100%)",
    bgSoft: "linear-gradient(145deg, #2e2016 0%, #221611 100%)",
    bgMuted: "#1f1510",
    cardBg: "rgba(28, 20, 16, 0.96)",
    popupBg: "radial-gradient(circle at top right, rgba(255, 154, 92, 0.22), transparent 42%), linear-gradient(180deg, #1c140f 0%, #241a13 100%)",
    popupHeaderBg: "radial-gradient(circle at top right, rgba(255, 180, 130, 0.2), transparent 34%), linear-gradient(135deg, #2d1e15 0%, #241812 100%)",
    sectionBg: "rgba(50, 34, 24, 0.72)",
    text: "#f5e8dc",
    textSecondary: "#d9bfa7",
    textTertiary: "#a88a72",
    accentStrong: "#ffb386",
    accentSoft: "#f0a060",
    link: "#ffb98a",
    border: "rgba(255, 180, 130, 0.22)",
    borderSoft: "rgba(255, 180, 130, 0.14)",
    shadow: "0 24px 54px rgba(0, 0, 0, 0.55)",
    shadowSoft: "0 12px 26px rgba(0, 0, 0, 0.32)",
    pillBg: "rgba(70, 48, 34, 0.7)",
    buttonSecondaryBg: "rgba(70, 48, 34, 0.6)",
    buttonSecondaryHoverBg: "rgba(90, 62, 44, 0.75)",
    toggleTrack: "#4a3526",
    focusRing: "rgba(255, 179, 134, 0.55)",
    glassHighlight: "rgba(255, 255, 255, 0.08)",
    surfaceRaised: "linear-gradient(180deg, rgba(58, 40, 28, 0.72) 0%, rgba(44, 30, 22, 0.78) 100%)",
    gaugeTrack: "#3a2a1f",
    diffRemoveBg: "rgba(255, 90, 90, 0.22)",
    diffRemoveFg: "#ffb3b3",
    diffAddBg: "rgba(80, 200, 120, 0.2)",
    diffAddFg: "#9ce0a8",
    errorBg: "linear-gradient(180deg, rgba(80, 30, 30, 0.58) 0%, rgba(70, 25, 25, 0.68) 100%)",
    errorBorder: "rgba(255, 120, 110, 0.32)",
    errorFg: "#ffb3b3",
    toneSelectedBg: "linear-gradient(135deg, rgba(255, 156, 102, 0.22) 0%, rgba(255, 180, 130, 0.12) 100%)",
    toneSelectedBorder: "#ff9c66",
    toneHoverBg: "rgba(70, 48, 34, 0.85)",
    iconShadow: "0 14px 24px rgba(0, 0, 0, 0.48)"
  };
  const THEME_TOKENS = {
    light: LIGHT_TOKENS,
    dark: DARK_TOKENS
  };
  function tokensToCssVars(mode) {
    const t = THEME_TOKENS[mode];
    return `
    --wg-gradient: ${t.gradient};
    --wg-bg-soft: ${t.bgSoft};
    --wg-bg-muted: ${t.bgMuted};
    --wg-card-bg: ${t.cardBg};
    --wg-popup-bg: ${t.popupBg};
    --wg-popup-header-bg: ${t.popupHeaderBg};
    --wg-section-bg: ${t.sectionBg};
    --wg-text: ${t.text};
    --wg-text-secondary: ${t.textSecondary};
    --wg-text-tertiary: ${t.textTertiary};
    --wg-accent-strong: ${t.accentStrong};
    --wg-accent-soft: ${t.accentSoft};
    --wg-link: ${t.link};
    --wg-border: ${t.border};
    --wg-border-soft: ${t.borderSoft};
    --wg-shadow: ${t.shadow};
    --wg-shadow-soft: ${t.shadowSoft};
    --wg-pill-bg: ${t.pillBg};
    --wg-button-secondary-bg: ${t.buttonSecondaryBg};
    --wg-button-secondary-hover-bg: ${t.buttonSecondaryHoverBg};
    --wg-toggle-track: ${t.toggleTrack};
    --wg-focus-ring: ${t.focusRing};
    --wg-glass-highlight: ${t.glassHighlight};
    --wg-surface-raised: ${t.surfaceRaised};
    --wg-gauge-track: ${t.gaugeTrack};
    --wg-diff-remove-bg: ${t.diffRemoveBg};
    --wg-diff-remove-fg: ${t.diffRemoveFg};
    --wg-diff-add-bg: ${t.diffAddBg};
    --wg-diff-add-fg: ${t.diffAddFg};
    --wg-error-bg: ${t.errorBg};
    --wg-error-border: ${t.errorBorder};
    --wg-error-fg: ${t.errorFg};
    --wg-tone-selected-bg: ${t.toneSelectedBg};
    --wg-tone-selected-border: ${t.toneSelectedBorder};
    --wg-tone-hover-bg: ${t.toneHoverBg};
    --wg-icon-shadow: ${t.iconShadow};
  `.trim();
  }
  const FONT_TOKENS_CSS = `
  --wg-font-display: ${FONT_DISPLAY};
  --wg-font-body: ${FONT_BODY};
  --wg-font: ${FONT_BODY};
`.trim();
  const SCORE_BADGE_COLORS = {
    "#FFD93D": "#c88a00"
  };
  function getReadableBadgeBg(color) {
    return SCORE_BADGE_COLORS[color] ?? color;
  }
  const ir = {
    withStackTrace: false
  }, Y = (t, r, e = ir) => {
    const n = r.isOk() ? { type: "Ok", value: r.value } : { type: "Err", value: r.error }, i = e.withStackTrace ? new Error().stack : void 0;
    return {
      data: n,
      message: t,
      stack: i
    };
  };
  function x(t, r, e, n) {
    function i(o) {
      return o instanceof e ? o : new e(function(s) {
        s(o);
      });
    }
    return new (e || (e = Promise))(function(o, s) {
      function a(m) {
        try {
          h(n.next(m));
        } catch (j) {
          s(j);
        }
      }
      function p(m) {
        try {
          h(n.throw(m));
        } catch (j) {
          s(j);
        }
      }
      function h(m) {
        m.done ? o(m.value) : i(m.value).then(a, p);
      }
      h((n = n.apply(t, [])).next());
    });
  }
  function J(t) {
    var r = typeof Symbol == "function" && Symbol.iterator, e = r && t[r], n = 0;
    if (e) return e.call(t);
    if (t && typeof t.length == "number") return {
      next: function() {
        return t && n >= t.length && (t = void 0), { value: t && t[n++], done: !t };
      }
    };
    throw new TypeError(r ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function E(t) {
    return this instanceof E ? (this.v = t, this) : new E(t);
  }
  function q(t, r, e) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var n = e.apply(t, r || []), i, o = [];
    return i = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), a("next"), a("throw"), a("return", s), i[Symbol.asyncIterator] = function() {
      return this;
    }, i;
    function s(f) {
      return function(k) {
        return Promise.resolve(k).then(f, j);
      };
    }
    function a(f, k) {
      n[f] && (i[f] = function(W) {
        return new Promise(function(tr, nr) {
          o.push([f, W, tr, nr]) > 1 || p(f, W);
        });
      }, k && (i[f] = k(i[f])));
    }
    function p(f, k) {
      try {
        h(n[f](k));
      } catch (W) {
        V(o[0][3], W);
      }
    }
    function h(f) {
      f.value instanceof E ? Promise.resolve(f.value.v).then(m, j) : V(o[0][2], f);
    }
    function m(f) {
      p("next", f);
    }
    function j(f) {
      p("throw", f);
    }
    function V(f, k) {
      f(k), o.shift(), o.length && p(o[0][0], o[0][1]);
    }
  }
  function or(t) {
    var r, e;
    return r = {}, n("next"), n("throw", function(i) {
      throw i;
    }), n("return"), r[Symbol.iterator] = function() {
      return this;
    }, r;
    function n(i, o) {
      r[i] = t[i] ? function(s) {
        return (e = !e) ? { value: E(t[i](s)), done: false } : o ? o(s) : s;
      } : o;
    }
  }
  function sr(t) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var r = t[Symbol.asyncIterator], e;
    return r ? r.call(t) : (t = typeof J == "function" ? J(t) : t[Symbol.iterator](), e = {}, n("next"), n("throw"), n("return"), e[Symbol.asyncIterator] = function() {
      return this;
    }, e);
    function n(o) {
      e[o] = t[o] && function(s) {
        return new Promise(function(a, p) {
          s = t[o](s), i(a, p, s.done, s.value);
        });
      };
    }
    function i(o, s, a, p) {
      Promise.resolve(p).then(function(h) {
        o({ value: h, done: a });
      }, s);
    }
  }
  class c {
    constructor(r) {
      this._promise = r;
    }
    static fromSafePromise(r) {
      const e = r.then((n) => new v(n));
      return new c(e);
    }
    static fromPromise(r, e) {
      const n = r.then((i) => new v(i)).catch((i) => new w(e(i)));
      return new c(n);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromThrowable(r, e) {
      return (...n) => new c(x(this, void 0, void 0, function* () {
        try {
          return new v(yield r(...n));
        } catch (i) {
          return new w(e ? e(i) : i);
        }
      }));
    }
    static combine(r) {
      return ar(r);
    }
    static combineWithAllErrors(r) {
      return ur(r);
    }
    map(r) {
      return new c(this._promise.then((e) => x(this, void 0, void 0, function* () {
        return e.isErr() ? new w(e.error) : new v(yield r(e.value));
      })));
    }
    andThrough(r) {
      return new c(this._promise.then((e) => x(this, void 0, void 0, function* () {
        if (e.isErr())
          return new w(e.error);
        const n = yield r(e.value);
        return n.isErr() ? new w(n.error) : new v(e.value);
      })));
    }
    andTee(r) {
      return new c(this._promise.then((e) => x(this, void 0, void 0, function* () {
        if (e.isErr())
          return new w(e.error);
        try {
          yield r(e.value);
        } catch {
        }
        return new v(e.value);
      })));
    }
    orTee(r) {
      return new c(this._promise.then((e) => x(this, void 0, void 0, function* () {
        if (e.isOk())
          return new v(e.value);
        try {
          yield r(e.error);
        } catch {
        }
        return new w(e.error);
      })));
    }
    mapErr(r) {
      return new c(this._promise.then((e) => x(this, void 0, void 0, function* () {
        return e.isOk() ? new v(e.value) : new w(yield r(e.error));
      })));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    andThen(r) {
      return new c(this._promise.then((e) => {
        if (e.isErr())
          return new w(e.error);
        const n = r(e.value);
        return n instanceof c ? n._promise : n;
      }));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    orElse(r) {
      return new c(this._promise.then((e) => x(this, void 0, void 0, function* () {
        return e.isErr() ? r(e.error) : new v(e.value);
      })));
    }
    match(r, e) {
      return this._promise.then((n) => n.match(r, e));
    }
    unwrapOr(r) {
      return this._promise.then((e) => e.unwrapOr(r));
    }
    /**
     * @deprecated will be removed in 9.0.0.
     *
     * You can use `safeTry` without this method.
     * @example
     * ```typescript
     * safeTry(async function* () {
     *   const okValue = yield* yourResult
     * })
     * ```
     * Emulates Rust's `?` operator in `safeTry`'s body. See also `safeTry`.
     */
    safeUnwrap() {
      return q(this, arguments, function* () {
        return yield E(yield E(yield* or(sr(yield E(this._promise.then((e) => e.safeUnwrap()))))));
      });
    }
    // Makes ResultAsync implement PromiseLike<Result>
    then(r, e) {
      return this._promise.then(r, e);
    }
    [Symbol.asyncIterator]() {
      return q(this, arguments, function* () {
        const e = yield E(this._promise);
        return e.isErr() && (yield yield E(M(e.error))), yield E(e.value);
      });
    }
  }
  function M(t) {
    return new c(Promise.resolve(new w(t)));
  }
  const H = (t) => {
    let r = S([]);
    for (const e of t)
      if (e.isErr()) {
        r = d(e.error);
        break;
      } else
        r.map((n) => n.push(e.value));
    return r;
  }, ar = (t) => c.fromSafePromise(Promise.all(t)).andThen(H), X = (t) => {
    let r = S([]);
    for (const e of t)
      e.isErr() && r.isErr() ? r.error.push(e.error) : e.isErr() && r.isOk() ? r = d([e.error]) : e.isOk() && r.isOk() && r.value.push(e.value);
    return r;
  }, ur = (t) => c.fromSafePromise(Promise.all(t)).andThen(X);
  var z;
  (function(t) {
    function r(i, o) {
      return (...s) => {
        try {
          const a = i(...s);
          return S(a);
        } catch (a) {
          return d(o ? o(a) : a);
        }
      };
    }
    t.fromThrowable = r;
    function e(i) {
      return H(i);
    }
    t.combine = e;
    function n(i) {
      return X(i);
    }
    t.combineWithAllErrors = n;
  })(z || (z = {}));
  function S(t) {
    return new v(t);
  }
  function d(t) {
    return new w(t);
  }
  class v {
    constructor(r) {
      this.value = r;
    }
    isOk() {
      return true;
    }
    isErr() {
      return !this.isOk();
    }
    map(r) {
      return S(r(this.value));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mapErr(r) {
      return S(this.value);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    andThen(r) {
      return r(this.value);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    andThrough(r) {
      return r(this.value).map((e) => this.value);
    }
    andTee(r) {
      try {
        r(this.value);
      } catch {
      }
      return S(this.value);
    }
    orTee(r) {
      return S(this.value);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    orElse(r) {
      return S(this.value);
    }
    asyncAndThen(r) {
      return r(this.value);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    asyncAndThrough(r) {
      return r(this.value).map(() => this.value);
    }
    asyncMap(r) {
      return c.fromSafePromise(r(this.value));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unwrapOr(r) {
      return this.value;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    match(r, e) {
      return r(this.value);
    }
    safeUnwrap() {
      const r = this.value;
      return (function* () {
        return r;
      })();
    }
    _unsafeUnwrap(r) {
      return this.value;
    }
    _unsafeUnwrapErr(r) {
      throw Y("Called `_unsafeUnwrapErr` on an Ok", this, r);
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias, require-yield
    *[Symbol.iterator]() {
      return this.value;
    }
  }
  class w {
    constructor(r) {
      this.error = r;
    }
    isOk() {
      return false;
    }
    isErr() {
      return !this.isOk();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    map(r) {
      return d(this.error);
    }
    mapErr(r) {
      return d(r(this.error));
    }
    andThrough(r) {
      return d(this.error);
    }
    andTee(r) {
      return d(this.error);
    }
    orTee(r) {
      try {
        r(this.error);
      } catch {
      }
      return d(this.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    andThen(r) {
      return d(this.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    orElse(r) {
      return r(this.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asyncAndThen(r) {
      return M(this.error);
    }
    asyncAndThrough(r) {
      return M(this.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asyncMap(r) {
      return M(this.error);
    }
    unwrapOr(r) {
      return r;
    }
    match(r, e) {
      return e(this.error);
    }
    safeUnwrap() {
      const r = this.error;
      return (function* () {
        throw yield d(r), new Error("Do not use this generator out of `safeTry`");
      })();
    }
    _unsafeUnwrap(r) {
      throw Y("Called `_unsafeUnwrap` on an Err", this, r);
    }
    _unsafeUnwrapErr(r) {
      return this.error;
    }
    *[Symbol.iterator]() {
      const r = this;
      return yield r, r;
    }
  }
  z.fromThrowable;
  const _ = /* @__PURE__ */ Symbol.for("@ts-pattern/matcher"), cr = /* @__PURE__ */ Symbol.for("@ts-pattern/isVariadic"), B = "@ts-pattern/anonymous-select-key", D = (t) => !!(t && typeof t == "object"), $ = (t) => t && !!t[_], T = (t, r, e) => {
    if ($(t)) {
      const n = t[_](), { matched: i, selections: o } = n.match(r);
      return i && o && Object.keys(o).forEach((s) => e(s, o[s])), i;
    }
    if (D(t)) {
      if (!D(r)) return false;
      if (Array.isArray(t)) {
        if (!Array.isArray(r)) return false;
        let n = [], i = [], o = [];
        for (const s of t.keys()) {
          const a = t[s];
          $(a) && a[cr] ? o.push(a) : o.length ? i.push(a) : n.push(a);
        }
        if (o.length) {
          if (o.length > 1) throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
          if (r.length < n.length + i.length) return false;
          const s = r.slice(0, n.length), a = i.length === 0 ? [] : r.slice(-i.length), p = r.slice(n.length, i.length === 0 ? 1 / 0 : -i.length);
          return n.every((h, m) => T(h, s[m], e)) && i.every((h, m) => T(h, a[m], e)) && (o.length === 0 || T(o[0], p, e));
        }
        return t.length === r.length && t.every((s, a) => T(s, r[a], e));
      }
      return Reflect.ownKeys(t).every((n) => {
        const i = t[n];
        return (n in r || $(o = i) && o[_]().matcherType === "optional") && T(i, r[n], e);
        var o;
      });
    }
    return Object.is(r, t);
  }, A = (t) => {
    var r, e, n;
    return D(t) ? $(t) ? (r = (e = (n = t[_]()).getSelectionKeys) == null ? void 0 : e.call(n)) != null ? r : [] : Array.isArray(t) ? C(t, A) : C(Object.values(t), A) : [];
  }, C = (t, r) => t.reduce((e, n) => e.concat(r(n)), []);
  function y(t) {
    return Object.assign(t, { optional: () => lr(t), and: (r) => l(t, r), or: (r) => hr(t, r), select: (r) => r === void 0 ? Q(t) : Q(r, t) });
  }
  function lr(t) {
    return y({ [_]: () => ({ match: (r) => {
      let e = {};
      const n = (i, o) => {
        e[i] = o;
      };
      return r === void 0 ? (A(t).forEach((i) => n(i, void 0)), { matched: true, selections: e }) : { matched: T(t, r, n), selections: e };
    }, getSelectionKeys: () => A(t), matcherType: "optional" }) });
  }
  function l(...t) {
    return y({ [_]: () => ({ match: (r) => {
      let e = {};
      const n = (i, o) => {
        e[i] = o;
      };
      return { matched: t.every((i) => T(i, r, n)), selections: e };
    }, getSelectionKeys: () => C(t, A), matcherType: "and" }) });
  }
  function hr(...t) {
    return y({ [_]: () => ({ match: (r) => {
      let e = {};
      const n = (i, o) => {
        e[i] = o;
      };
      return C(t, A).forEach((i) => n(i, void 0)), { matched: t.some((i) => T(i, r, n)), selections: e };
    }, getSelectionKeys: () => C(t, A), matcherType: "or" }) });
  }
  function u(t) {
    return { [_]: () => ({ match: (r) => ({ matched: !!t(r) }) }) };
  }
  function Q(...t) {
    const r = typeof t[0] == "string" ? t[0] : void 0, e = t.length === 2 ? t[1] : typeof t[0] == "string" ? void 0 : t[0];
    return y({ [_]: () => ({ match: (n) => {
      let i = { [r ?? B]: n };
      return { matched: e === void 0 || T(e, n, (o, s) => {
        i[o] = s;
      }), selections: i };
    }, getSelectionKeys: () => [r ?? B].concat(e === void 0 ? [] : A(e)) }) });
  }
  function Z(t) {
    return true;
  }
  function g(t) {
    return typeof t == "number";
  }
  function O(t) {
    return typeof t == "string";
  }
  function P(t) {
    return typeof t == "bigint";
  }
  y(u(Z));
  y(u(Z));
  const I = (t) => Object.assign(y(t), { startsWith: (r) => {
    return I(l(t, (e = r, u((n) => O(n) && n.startsWith(e)))));
    var e;
  }, endsWith: (r) => {
    return I(l(t, (e = r, u((n) => O(n) && n.endsWith(e)))));
    var e;
  }, minLength: (r) => I(l(t, ((e) => u((n) => O(n) && n.length >= e))(r))), length: (r) => I(l(t, ((e) => u((n) => O(n) && n.length === e))(r))), maxLength: (r) => I(l(t, ((e) => u((n) => O(n) && n.length <= e))(r))), includes: (r) => {
    return I(l(t, (e = r, u((n) => O(n) && n.includes(e)))));
    var e;
  }, regex: (r) => {
    return I(l(t, (e = r, u((n) => O(n) && !!n.match(e)))));
    var e;
  } });
  I(u(O));
  const b = (t) => Object.assign(y(t), { between: (r, e) => b(l(t, ((n, i) => u((o) => g(o) && n <= o && i >= o))(r, e))), lt: (r) => b(l(t, ((e) => u((n) => g(n) && n < e))(r))), gt: (r) => b(l(t, ((e) => u((n) => g(n) && n > e))(r))), lte: (r) => b(l(t, ((e) => u((n) => g(n) && n <= e))(r))), gte: (r) => b(l(t, ((e) => u((n) => g(n) && n >= e))(r))), int: () => b(l(t, u((r) => g(r) && Number.isInteger(r)))), finite: () => b(l(t, u((r) => g(r) && Number.isFinite(r)))), positive: () => b(l(t, u((r) => g(r) && r > 0))), negative: () => b(l(t, u((r) => g(r) && r < 0))) });
  b(u(g));
  const U = (t) => Object.assign(y(t), { between: (r, e) => U(l(t, ((n, i) => u((o) => P(o) && n <= o && i >= o))(r, e))), lt: (r) => U(l(t, ((e) => u((n) => P(n) && n < e))(r))), gt: (r) => U(l(t, ((e) => u((n) => P(n) && n > e))(r))), lte: (r) => U(l(t, ((e) => u((n) => P(n) && n <= e))(r))), gte: (r) => U(l(t, ((e) => u((n) => P(n) && n >= e))(r))), positive: () => U(l(t, u((r) => P(r) && r > 0))), negative: () => U(l(t, u((r) => P(r) && r < 0))) });
  U(u(P));
  y(u(function(t) {
    return typeof t == "boolean";
  }));
  y(u(function(t) {
    return typeof t == "symbol";
  }));
  y(u(function(t) {
    return t == null;
  }));
  y(u(function(t) {
    return t != null;
  }));
  class fr extends Error {
    constructor(r) {
      let e;
      try {
        e = JSON.stringify(r);
      } catch {
        e = r;
      }
      super(`Pattern matching error: no pattern matches value ${e}`), this.input = void 0, this.input = r;
    }
  }
  const G = { matched: false, value: void 0 };
  function mr(t) {
    return new K(t, G);
  }
  class K {
    constructor(r, e) {
      this.input = void 0, this.state = void 0, this.input = r, this.state = e;
    }
    with(...r) {
      if (this.state.matched) return this;
      const e = r[r.length - 1], n = [r[0]];
      let i;
      r.length === 3 && typeof r[1] == "function" ? i = r[1] : r.length > 2 && n.push(...r.slice(1, r.length - 1));
      let o = false, s = {};
      const a = (h, m) => {
        o = true, s[h] = m;
      }, p = !n.some((h) => T(h, this.input, a)) || i && !i(this.input) ? G : { matched: true, value: e(o ? B in s ? s[B] : s : this.input, this.input) };
      return new K(this.input, p);
    }
    when(r, e) {
      if (this.state.matched) return this;
      const n = !!r(this.input);
      return new K(this.input, n ? { matched: true, value: e(this.input, this.input) } : G);
    }
    otherwise(r) {
      return this.state.matched ? this.state.value : r(this.input);
    }
    exhaustive(r = pr) {
      return this.state.matched ? this.state.value : r(this.input);
    }
    run() {
      return this.exhaustive();
    }
    returnType() {
      return this;
    }
    narrow() {
      return this;
    }
  }
  function pr(t) {
    throw new fr(t);
  }
  function R(t) {
    const r = new Error(
      `Chromium AI API is not available. To use Chrome AI:
1. You must call this from a browser extension
2. Use Chrome 138+ or supported Chromium browser
3. Enable 'Prompt API for Gemini Nano' in chrome://flags
4. Update 'Optimization Guide On Device Model' in chrome://components (Warning: This will download ~4GB)
5. Join Chrome EPP for web: https://developer.chrome.com/docs/ai/join-epp`
    );
    return new c(
      (async () => {
        if (typeof LanguageModel > "u")
          return d(r);
        const e = await LanguageModel.availability();
        return mr(e).with(
          "unavailable",
          "downloadable",
          "downloading",
          () => d(r)
        ).with(
          "available",
          () => S({
            systemPrompt: t,
            instanceId: crypto.randomUUID()
          })
        ).exhaustive();
      })()
    );
  }
  function F(t, r) {
    return new c(
      (async () => {
        try {
          const e = {
            ...r
          };
          r?.initialPrompts && r.initialPrompts.length > 0 ? e.initialPrompts = r.initialPrompts : t.systemPrompt && (e.initialPrompts = [
            {
              role: "system",
              content: t.systemPrompt
            }
          ]);
          const n = await LanguageModel.create(e);
          return S(n);
        } catch (e) {
          return d(
            new Error(
              `Failed to create AI session: ${e instanceof Error ? e.message : "Unknown error"}. This might be due to rate limiting or resource constraints.`
            )
          );
        }
      })()
    );
  }
  function N(t, r, e) {
    return F(t, e).andThen((n) => r(n).map((i) => (n.destroy(), i)).mapErr((i) => (n.destroy(), i)));
  }
  function rr(t, r, e) {
    return N(
      t,
      (n) => c.fromSafePromise(
        (async () => {
          const i = await n.measureInputUsage(r), o = n.inputQuota || 0, s = n.inputUsage || 0, a = o - s;
          return {
            promptTokens: i,
            maxTokens: o,
            tokensSoFar: s,
            tokensAvailable: a,
            willFit: i <= a
          };
        })()
      ),
      e
    );
  }
  function er(t, r, e, n, i) {
    return N(
      t,
      (o) => {
        let s = null;
        return c.fromPromise(
          (async () => {
            try {
              let a = n || {};
              if (e || a.signal) {
                const h = [];
                if (a.signal && h.push(a.signal), e) {
                  const m = new AbortController();
                  h.push(m.signal), s = setTimeout(
                    () => m.abort(),
                    e
                  );
                }
                h.length > 1 && AbortSignal.any ? a = {
                  ...a,
                  signal: AbortSignal.any(h)
                } : h.length === 1 && (a = {
                  ...a,
                  signal: h[0]
                });
              }
              return await o.prompt(r, a);
            } finally {
              s && clearTimeout(s);
            }
          })(),
          (a) => a instanceof Error ? a : new Error(String(a))
        );
      },
      i
    );
  }
  const dr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    checkTokenUsage: rr,
    createSession: F,
    initialize: R,
    prompt: er,
    withSession: N
  }, Symbol.toStringTag, { value: "Module" }));
  function L(t) {
    return t.match(
      (r) => r,
      (r) => {
        throw r;
      }
    );
  }
  async function yr(t) {
    const r = await R(t);
    return L(r);
  }
  async function wr(t, r) {
    const e = await F(t, r);
    return L(e);
  }
  async function vr(t, r, e) {
    const n = await N(
      t,
      (i) => c.fromPromise(
        r(i),
        (o) => o instanceof Error ? o : new Error(String(o))
      ),
      e
    );
    return L(n);
  }
  async function gr(t, r, e) {
    const n = await rr(t, r, e);
    return L(n);
  }
  async function br(t, r, e, n, i) {
    const o = await er(
      t,
      r,
      e,
      n,
      i
    );
    return L(o);
  }
  const Er = {
    // Safe API namespace
    Safe: dr,
    // Default API (throws errors)
    initialize: yr,
    prompt: br,
    createSession: wr,
    withSession: vr,
    checkTokenUsage: gr
  };
  const TONES = {
    professional: {
      name: "Professional",
      description: "Formal, clear, and business-appropriate. No slang or contractions.",
      subtitle: "Boardroom ready",
      emoji: "💼"
    },
    casual: {
      name: "Casual",
      description: "Relaxed, conversational, like texting a friend.",
      subtitle: "Chill vibes",
      emoji: "🛋️"
    },
    friendly: {
      name: "Friendly",
      description: "Warm, approachable, with positive energy.",
      subtitle: "Good neighbor",
      emoji: "🤗"
    },
    confident: {
      name: "Confident",
      description: "Assertive, decisive, no hedging or qualifiers.",
      subtitle: "No doubts",
      emoji: "💪"
    },
    "linkedin-influencer": {
      name: "LinkedIn Influencer",
      description: 'Inspirational, uses lots of line breaks, starts with a hook, ends with "Agree?"',
      subtitle: "Thought leader",
      emoji: "📈"
    },
    "passive-aggressive": {
      name: "Passive Aggressive",
      description: 'Polite on the surface with underlying tension. "Per my last email" energy.',
      subtitle: "Per my last email",
      emoji: "😒"
    },
    "overly-enthusiastic": {
      name: "Overly Enthusiastic",
      description: "EXCITED about EVERYTHING!!! Liberal use of exclamation marks!!!",
      subtitle: "SO EXCITED!!!",
      emoji: "🤩"
    },
    "corporate-buzzword": {
      name: "Corporate Buzzword",
      description: "Leverage synergies, move the needle, circle back, paradigm shift.",
      subtitle: "Synergy unlocked",
      emoji: "📊"
    }
  };
  const PERFECT_SCORE_THRESHOLD = 96;
  const SCORE_TIERS = [
    { name: "Caveman", min: 0, max: 20, color: "#FF6B6B", emoji: "🪨" },
    { name: "Txt Msg Veteran", min: 21, max: 40, color: "#FFA07A", emoji: "📱" },
    { name: "Functional Adult", min: 41, max: 60, color: "#FFD93D", emoji: "☕" },
    { name: "Word Wizard", min: 61, max: 80, color: "#4ECDC4", emoji: "🧙" },
    { name: "Shakespeare Who?", min: 81, max: 95, color: "#2ECC71", emoji: "🎭" },
    { name: "WriteGooderer", min: 96, max: 100, color: "#27AE60", emoji: "👑" }
  ];
  function getTierForScore(score) {
    for (const tier of SCORE_TIERS) {
      if (score >= tier.min && score <= tier.max) {
        return tier;
      }
    }
    return SCORE_TIERS[0];
  }
  const LOADING_QUIPS = [
    "Consulting the AI overlord...",
    "Making your words gooderer...",
    "Judging your grammar silently...",
    "Downloading more vocabulary...",
    "Asking Gemini Nano nicely...",
    "Crunching linguistic algorithms...",
    "Your CPU is working harder than you did on this text...",
    "Teaching electrons to spell...",
    "Bribing the language model...",
    "Reticulating splines... wait, wrong program...",
    "Channeling the spirit of your English teacher...",
    "Googling 'how to grammar'... just kidding...",
    "Running 4 billion parameters for your 12 words...",
    "Thinking really hard on your behalf...",
    "Pretending to be a $30/month writing tool..."
  ];
  const PROOFREAD_SCHEMA = {
    type: "object",
    properties: {
      corrected: { type: "string" },
      changes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            original: { type: "string" },
            replacement: { type: "string" },
            reason: { type: "string" }
          },
          required: ["original", "replacement", "reason"]
        }
      },
      score: { type: "number", minimum: 0, maximum: 100 },
      tier: {
        type: "string",
        enum: [
          "Caveman",
          "Txt Msg Veteran",
          "Functional Adult",
          "Word Wizard",
          "Shakespeare Who?",
          "WriteGooderer"
        ]
      }
    },
    required: ["corrected", "changes", "score", "tier"]
  };
  const TONE_REWRITE_SCHEMA = {
    type: "object",
    properties: {
      rewritten: { type: "string" }
    },
    required: ["rewritten"]
  };
  const DUAL_SYSTEM_PROMPT = "You are WriteGooderer. You handle two tasks on user text: (a) proofread — return corrections, a 0-100 quality score, and a tier name; (b) rewrite in a specified tone — preserve meaning, commit fully to the tone. Respond only with JSON matching the requested schema. Honest scoring: perfect text 90+, minor issues 60-80, significant issues below 50.";
  const DUAL_INITIAL_PROMPTS = [
    { role: "system", content: DUAL_SYSTEM_PROMPT },
    {
      role: "user",
      content: "Proofread this paragraph:\n\nI has went to the stor yesterday and buyed some mik."
    },
    {
      role: "assistant",
      content: JSON.stringify({
        corrected: "I went to the store yesterday and bought some milk.",
        changes: [
          {
            original: "has went",
            replacement: "went",
            reason: "Incorrect auxiliary verb"
          },
          { original: "stor", replacement: "store", reason: "Spelling" },
          {
            original: "buyed",
            replacement: "bought",
            reason: "Irregular past tense"
          },
          { original: "mik", replacement: "milk", reason: "Spelling" }
        ],
        score: 18,
        tier: "Caveman"
      })
    },
    {
      role: "user",
      content: "Rewrite this paragraph in this tone: LinkedIn Influencer (performative self-help hustle energy).\n\nParagraph:\n\nI got promoted at work today."
    },
    {
      role: "assistant",
      content: JSON.stringify({
        rewritten: "I'm thrilled to announce that after years of dedication, countless late nights, and unwavering belief in myself...\n\nI got a promotion.\n\nBut this isn't about the title. It's about the JOURNEY.\n\nHere are 3 lessons I learned along the way:\n\n1. Show up every day\n2. Be authentic\n3. Never stop grinding\n\nAgree? 👇"
      })
    }
  ];
  function buildProofreadInstruction(text) {
    return `Proofread this paragraph:

${text}`;
  }
  function buildRewriteInstruction(tone, text) {
    const config = TONES[tone];
    return `Rewrite this paragraph in this tone: ${config.name} (${config.description}).

Paragraph:

${text}`;
  }
  let aiInstance = null;
  let testMode = false;
  let dualBaseSessionPromise = null;
  let nextClonePromise = null;
  function logSessionEvent(message) {
    console.debug(`[WriteGooderer AI] ${message}`);
  }
  async function checkTestMode() {
    const result = await chrome.storage.local.get("wgTestMode");
    testMode = !!result.wgTestMode;
  }
  async function ensureModel() {
    if (testMode) return { systemPrompt: "test", instanceId: "test" };
    if (aiInstance) return aiInstance;
    aiInstance = await Er.initialize();
    return aiInstance;
  }
  async function createDualBaseSession() {
    logSessionEvent("Creating dual base session");
    const ai = await ensureModel();
    const session = await Er.createSession(ai, {
      initialPrompts: DUAL_INITIAL_PROMPTS
    });
    logSessionEvent("Created dual base session");
    return session;
  }
  function getDualBaseSessionPromise() {
    if (dualBaseSessionPromise) return dualBaseSessionPromise;
    const sessionPromise = createDualBaseSession().catch((error) => {
      logSessionEvent(`Dual base session creation failed: ${String(error)}`);
      dualBaseSessionPromise = null;
      throw error;
    });
    dualBaseSessionPromise = sessionPromise;
    return sessionPromise;
  }
  async function cloneDualSession() {
    try {
      const baseSession = await getDualBaseSessionPromise();
      logSessionEvent("Cloning dual session");
      const clonedSession = await baseSession.clone();
      logSessionEvent("Cloned dual session");
      return clonedSession;
    } catch (error) {
      logSessionEvent(`Clone failed, rebuilding dual base session: ${String(error)}`);
      dualBaseSessionPromise = null;
      const rebuiltSession = await getDualBaseSessionPromise();
      const clonedSession = await rebuiltSession.clone();
      logSessionEvent("Rebuilt and cloned dual session");
      return clonedSession;
    }
  }
  function refillClonePool() {
    if (nextClonePromise) return;
    nextClonePromise = cloneDualSession().catch((err) => {
      logSessionEvent(`Clone pool refill failed: ${String(err)}`);
      nextClonePromise = null;
      throw err;
    });
  }
  async function takeClone() {
    if (nextClonePromise) {
      const pending = nextClonePromise;
      nextClonePromise = null;
      try {
        const session2 = await pending;
        refillClonePool();
        return session2;
      } catch {
      }
    }
    const session = await cloneDualSession();
    refillClonePool();
    return session;
  }
  async function prewarmSessions() {
    if (testMode) return;
    logSessionEvent("Prewarming dual base session");
    await getDualBaseSessionPromise();
    logSessionEvent("Prewarmed dual base session");
    refillClonePool();
  }
  async function destroySessions() {
    logSessionEvent("Destroying cached base session");
    const pending = [dualBaseSessionPromise, nextClonePromise];
    dualBaseSessionPromise = null;
    nextClonePromise = null;
    const result = await Promise.allSettled(pending);
    for (const r of result) {
      if (r.status === "fulfilled" && r.value) {
        try {
          r.value.destroy();
        } catch (err) {
          logSessionEvent(`Session destroy failed: ${String(err)}`);
        }
      }
    }
    logSessionEvent("Destroyed cached base session");
  }
  function mockProofread(text) {
    const changes = [];
    if (text.includes("has went")) {
      changes.push({ original: "has went", replacement: "went", reason: "Incorrect auxiliary verb" });
    }
    if (text.includes("buyed")) {
      changes.push({ original: "buyed", replacement: "bought", reason: "Irregular past tense" });
    }
    if (text.includes("stor ")) {
      changes.push({ original: "stor", replacement: "store", reason: "Spelling" });
    }
    if (text.includes("mik")) {
      changes.push({ original: "mik", replacement: "milk", reason: "Spelling" });
    }
    let corrected = text;
    for (const c2 of changes) {
      corrected = corrected.replace(c2.original, c2.replacement);
    }
    const score = changes.length === 0 ? 92 : Math.max(5, 80 - changes.length * 15);
    const tier = getTierForScore(score);
    return { corrected, changes, score, tier: tier.name };
  }
  function mockRewrite(text, tone) {
    return { rewritten: `[${tone.toUpperCase()}] ${text}` };
  }
  async function proofread(text, opts = {}) {
    if (testMode) return mockProofread(text);
    const session = await takeClone();
    try {
      logSessionEvent("Proofread: running instruction");
      const raw = await session.prompt(buildProofreadInstruction(text), {
        responseConstraint: PROOFREAD_SCHEMA,
        signal: opts.signal
      });
      return JSON.parse(raw);
    } finally {
      try {
        session.destroy();
      } catch (err) {
        logSessionEvent(`Proofread session destroy failed: ${String(err)}`);
      }
    }
  }
  async function rewrite(text, tone, opts = {}) {
    if (testMode) return mockRewrite(text, tone);
    const session = await takeClone();
    try {
      logSessionEvent(`Rewrite: running instruction for ${tone}`);
      const raw = await session.prompt(buildRewriteInstruction(tone, text), {
        responseConstraint: TONE_REWRITE_SCHEMA,
        signal: opts.signal
      });
      return JSON.parse(raw);
    } finally {
      try {
        session.destroy();
      } catch (err) {
        logSessionEvent(`Rewrite session destroy failed: ${String(err)}`);
      }
    }
  }
  const IGNORED_TYPES = /* @__PURE__ */ new Set(["search", "password", "email", "number", "tel", "url", "date"]);
  const MIN_FIELD_HEIGHT = 24;
  const MIN_FIELD_WIDTH = 100;
  const EDITABLE_HOST_SELECTOR = '[contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]';
  const FIELD_SELECTOR = `textarea, input, ${EDITABLE_HOST_SELECTOR}`;
  function findEditableHost(el) {
    if (!el) return null;
    if (!(el instanceof HTMLElement)) {
      const parent = el.parentElement;
      return parent ? findEditableHost(parent) : null;
    }
    return el.closest(EDITABLE_HOST_SELECTOR);
  }
  let nextFieldId = 1;
  function isValidField(el) {
    if (el instanceof HTMLTextAreaElement) {
      const rect = el.getBoundingClientRect();
      return rect.height >= MIN_FIELD_HEIGHT && rect.width >= MIN_FIELD_WIDTH;
    }
    if (el instanceof HTMLInputElement) {
      if (IGNORED_TYPES.has(el.type)) return false;
      if (el.type === "text") {
        const rect = el.getBoundingClientRect();
        return rect.height >= MIN_FIELD_HEIGHT && rect.width >= MIN_FIELD_WIDTH;
      }
      return false;
    }
    if (el instanceof HTMLElement && el.isContentEditable) {
      if (el.closest('[role="search"]')) return false;
      const rect = el.getBoundingClientRect();
      return rect.height >= MIN_FIELD_HEIGHT && rect.width >= MIN_FIELD_WIDTH;
    }
    return false;
  }
  function ensureFieldId(field) {
    const existingId = field.dataset.wgFieldId;
    if (existingId) return existingId;
    const fieldId = `wg-field-${nextFieldId++}`;
    field.dataset.wgFieldId = fieldId;
    return fieldId;
  }
  function tagFieldIfValid(el) {
    if (!isValidField(el)) return;
    ensureFieldId(el);
  }
  function tagFieldsInSubtree(root) {
    if (root instanceof Element) {
      tagFieldIfValid(root);
    }
    if (!("querySelectorAll" in root)) return;
    for (const el of root.querySelectorAll(FIELD_SELECTOR)) {
      tagFieldIfValid(el);
    }
  }
  function initFieldDetector(onFieldChange, onValidFieldDetected = () => {
  }) {
    let activeField = null;
    let hideTimeout = null;
    let hasReportedValidField = false;
    function reportValidField() {
      if (hasReportedValidField) return;
      hasReportedValidField = true;
      onValidFieldDetected();
    }
    function registerValidField(field) {
      ensureFieldId(field);
      reportValidField();
    }
    function handleFocusIn(e) {
      const target = e.target;
      let field = null;
      if (target && isValidField(target)) {
        field = target;
      } else {
        const host = findEditableHost(target);
        if (host && isValidField(host)) field = host;
      }
      if (!field) return;
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      registerValidField(field);
      activeField = field;
      onFieldChange(activeField);
    }
    function handleFocusOut(_e) {
      hideTimeout = setTimeout(() => {
        activeField = null;
        onFieldChange(null);
      }, 200);
    }
    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("focusout", handleFocusOut, true);
    tagFieldsInSubtree(document);
    if (hasValidFieldsInSubtree(document)) {
      reportValidField();
    }
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element || node instanceof DocumentFragment) {
            tagFieldsInSubtree(node);
            if (hasValidFieldsInSubtree(node)) {
              reportValidField();
            }
          }
          if (node instanceof HTMLElement) {
            if (isValidField(node) && document.activeElement === node) {
              registerValidField(node);
              activeField = node;
              onFieldChange(activeField);
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  function hasValidFieldsInSubtree(root) {
    if (root instanceof Element && isValidField(root)) {
      return true;
    }
    if (!("querySelectorAll" in root)) return false;
    for (const el of root.querySelectorAll(FIELD_SELECTOR)) {
      if (isValidField(el)) {
        return true;
      }
    }
    return false;
  }
  class FloatingIcon {
    el;
    scoreEl;
    currentField = null;
    repositionRAF = null;
    onClick;
    constructor(shadowRoot, onClick) {
      this.onClick = onClick;
      this.el = document.createElement("div");
      this.el.className = "wg-floating-icon";
      this.el.setAttribute("role", "button");
      this.el.setAttribute("tabindex", "0");
      this.el.setAttribute("aria-label", "Open WriteGooderer");
      this.el.textContent = "W";
      this.el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      this.el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onClick();
      });
      this.el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.onClick();
        }
      });
      this.scoreEl = document.createElement("span");
      this.scoreEl.className = "wg-floating-score";
      this.scoreEl.style.display = "none";
      this.el.appendChild(this.scoreEl);
      shadowRoot.appendChild(this.el);
    }
    show(field) {
      this.currentField = field;
      this.el.classList.add("wg-visible");
      this.position();
      this.startTracking();
    }
    hide() {
      this.currentField = null;
      this.el.classList.remove("wg-visible");
      this.stopTracking();
    }
    setLoading(loading) {
      this.el.classList.toggle("wg-loading", loading);
    }
    showScore(score, color) {
      this.scoreEl.textContent = String(score);
      this.scoreEl.style.backgroundColor = getReadableBadgeBg(color);
      this.scoreEl.style.display = "flex";
    }
    hideScore() {
      this.scoreEl.style.display = "none";
    }
    position() {
      if (!this.currentField) return;
      if (!this.currentField.isConnected) {
        this.hide();
        return;
      }
      const rect = this.currentField.getBoundingClientRect();
      this.el.style.top = `${rect.bottom + window.scrollY - 46}px`;
      this.el.style.left = `${rect.right + window.scrollX - 46}px`;
    }
    startTracking() {
      this.stopTracking();
      const track = () => {
        this.position();
        this.repositionRAF = requestAnimationFrame(track);
      };
      this.repositionRAF = requestAnimationFrame(track);
    }
    stopTracking() {
      if (this.repositionRAF !== null) {
        cancelAnimationFrame(this.repositionRAF);
        this.repositionRAF = null;
      }
    }
  }
  const COLORS = ["#FE6B8B", "#FF8E53", "#FFD93D", "#4ECDC4", "#2ECC71"];
  function prefersReducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  }
  function burstConfetti(host, count = 22) {
    if (prefersReducedMotion()) return;
    const root = document.createElement("div");
    root.className = "wg-confetti-root";
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("i");
      piece.className = "wg-confetto";
      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 60;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 40;
      const rot = (Math.random() * 720 - 360).toFixed(0);
      const color = COLORS[i % COLORS.length];
      const delay = (Math.random() * 120).toFixed(0);
      piece.style.setProperty("--wg-tx", `${tx.toFixed(0)}px`);
      piece.style.setProperty("--wg-ty", `${ty.toFixed(0)}px`);
      piece.style.setProperty("--wg-r", `${rot}deg`);
      piece.style.setProperty("--wg-c", color);
      piece.style.animationDelay = `${delay}ms`;
      root.appendChild(piece);
    }
    host.appendChild(root);
    window.setTimeout(() => {
      root.remove();
    }, 1400);
  }
  class ScoreDisplay {
    el;
    gaugeWrap;
    gaugeCircle;
    scoreText;
    tierLabel;
    currentScore = 0;
    constructor() {
      this.el = document.createElement("div");
      this.el.className = "wg-score-display";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 120 120");
      svg.setAttribute("class", "wg-gauge");
      const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      bgCircle.setAttribute("cx", "60");
      bgCircle.setAttribute("cy", "60");
      bgCircle.setAttribute("r", "50");
      bgCircle.setAttribute("class", "wg-gauge-bg");
      this.gaugeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      this.gaugeCircle.setAttribute("cx", "60");
      this.gaugeCircle.setAttribute("cy", "60");
      this.gaugeCircle.setAttribute("r", "50");
      this.gaugeCircle.setAttribute("class", "wg-gauge-fill");
      svg.appendChild(bgCircle);
      svg.appendChild(this.gaugeCircle);
      this.scoreText = document.createElement("span");
      this.scoreText.className = "wg-score-number";
      const gaugeInner = document.createElement("div");
      gaugeInner.className = "wg-gauge-inner";
      gaugeInner.appendChild(this.scoreText);
      this.gaugeWrap = document.createElement("div");
      this.gaugeWrap.className = "wg-gauge-wrap";
      this.gaugeWrap.appendChild(svg);
      this.gaugeWrap.appendChild(gaugeInner);
      this.tierLabel = document.createElement("span");
      this.tierLabel.className = "wg-tier-label";
      this.el.appendChild(this.gaugeWrap);
      this.el.appendChild(this.tierLabel);
    }
    get element() {
      return this.el;
    }
    setScore(score) {
      const tier = getTierForScore(score);
      this.el.style.setProperty("--wg-tier-color", tier.color);
      this.animateScore(score, tier);
    }
    animateScore(target, tier) {
      const circumference = 2 * Math.PI * 50;
      const start = this.currentScore;
      const duration = 600;
      const startTime = performance.now();
      this.gaugeWrap.classList.remove("wg-bump");
      void this.gaugeWrap.offsetWidth;
      this.gaugeWrap.classList.add("wg-bump");
      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);
        this.scoreText.textContent = String(current);
        const offset = circumference - current / 100 * circumference;
        this.gaugeCircle.style.strokeDasharray = `${circumference}`;
        this.gaugeCircle.style.strokeDashoffset = `${offset}`;
        this.gaugeCircle.style.stroke = tier.color;
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.currentScore = target;
          this.tierLabel.textContent = tier.name;
          this.tierLabel.style.color = tier.color;
          this.el.classList.toggle("is-perfect", target >= PERFECT_SCORE_THRESHOLD);
          if (target >= PERFECT_SCORE_THRESHOLD) {
            burstConfetti(this.gaugeWrap);
          }
        }
      };
      requestAnimationFrame(animate);
    }
  }
  class LoadingState {
    el;
    quipEl;
    intervalId = null;
    constructor() {
      this.el = document.createElement("div");
      this.el.className = "wg-loading-state";
      const bar = document.createElement("div");
      bar.className = "wg-progress-bar";
      const fill = document.createElement("div");
      fill.className = "wg-progress-fill";
      bar.appendChild(fill);
      this.quipEl = document.createElement("p");
      this.quipEl.className = "wg-quip";
      this.el.appendChild(bar);
      this.el.appendChild(this.quipEl);
    }
    get element() {
      return this.el;
    }
    show() {
      this.el.style.display = "block";
      this.rotateQuip();
      this.intervalId = setInterval(() => this.rotateQuip(), 2500);
    }
    hide() {
      this.el.style.display = "none";
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
    rotateQuip() {
      const quip = LOADING_QUIPS[Math.floor(Math.random() * LOADING_QUIPS.length)];
      this.quipEl.classList.remove("wg-quip-fade");
      void this.quipEl.offsetWidth;
      this.quipEl.textContent = quip;
      this.quipEl.classList.add("wg-quip-fade");
    }
  }
  class DiffView {
    el;
    listEl;
    summaryEl;
    applyBtn;
    actionsEl;
    onApply;
    correctedText = "";
    constructor(onApply) {
      this.onApply = onApply;
      this.el = document.createElement("div");
      this.el.className = "wg-diff-view";
      this.summaryEl = document.createElement("div");
      this.summaryEl.className = "wg-diff-summary";
      this.listEl = document.createElement("div");
      this.listEl.className = "wg-diff-content";
      this.applyBtn = document.createElement("button");
      this.applyBtn.className = "wg-btn wg-btn-primary";
      this.applyBtn.textContent = "Apply Changes";
      this.applyBtn.addEventListener("click", () => this.apply());
      this.actionsEl = document.createElement("div");
      this.actionsEl.className = "wg-diff-actions";
      this.actionsEl.appendChild(this.applyBtn);
      this.el.appendChild(this.summaryEl);
      this.el.appendChild(this.listEl);
      this.el.appendChild(this.actionsEl);
    }
    get element() {
      return this.el;
    }
    show(original, corrected, changes) {
      this.correctedText = corrected;
      this.listEl.innerHTML = "";
      this.summaryEl.innerHTML = "";
      this.el.style.display = "block";
      this.actionsEl.style.display = "flex";
      if (changes.length === 0) {
        this.renderEmptyCelebration();
        this.actionsEl.style.display = "none";
        return;
      }
      const counts = { spelling: 0, grammar: 0, style: 0 };
      for (const change of changes) {
        counts[this.inferCategory(change)]++;
      }
      this.renderSummary(counts);
      const fragment = document.createDocumentFragment();
      let remaining = original;
      for (const change of changes) {
        const idx = remaining.indexOf(change.original);
        if (idx === -1) continue;
        if (idx > 0) {
          fragment.appendChild(document.createTextNode(remaining.substring(0, idx)));
        }
        const del = document.createElement("span");
        del.className = "wg-diff-remove";
        del.textContent = change.original;
        if (change.reason) del.title = change.reason;
        fragment.appendChild(del);
        const ins = document.createElement("span");
        ins.className = "wg-diff-add";
        ins.textContent = change.replacement;
        if (change.reason) ins.title = change.reason;
        fragment.appendChild(ins);
        remaining = remaining.substring(idx + change.original.length);
      }
      if (remaining) {
        fragment.appendChild(document.createTextNode(remaining));
      }
      this.listEl.appendChild(fragment);
    }
    hide() {
      this.el.style.display = "none";
    }
    renderSummary(counts) {
      this.summaryEl.innerHTML = "";
      const total = counts.spelling + counts.grammar + counts.style;
      const title = document.createElement("div");
      title.className = "wg-diff-summary-title";
      title.textContent = total === 1 ? "1 suggestion" : `${total} suggestions`;
      this.summaryEl.appendChild(title);
      const chips = document.createElement("div");
      chips.className = "wg-diff-summary-chips";
      const entries = [
        ["spelling", "spelling"],
        ["grammar", "grammar"],
        ["style", "style"]
      ];
      for (const [cat, label] of entries) {
        if (counts[cat] === 0) continue;
        const chip = document.createElement("span");
        chip.className = `wg-chip wg-chip-${cat}`;
        chip.textContent = `${counts[cat]} ${label}`;
        chips.appendChild(chip);
      }
      this.summaryEl.appendChild(chips);
    }
    inferCategory(change) {
      const reason = (change.reason || "").toLowerCase();
      if (reason.includes("spell") || reason.includes("typo")) return "spelling";
      if (reason.includes("grammar") || reason.includes("punctuation") || reason.includes("capital") || reason.includes("tense") || reason.includes("agreement")) {
        return "grammar";
      }
      if (reason.includes("style") || reason.includes("word choice") || reason.includes("clarity")) {
        return "style";
      }
      const orig = change.original || "";
      const repl = change.replacement || "";
      const isSingleToken = !/\s/.test(orig);
      if (isSingleToken && Math.abs(orig.length - repl.length) <= 2) {
        return "spelling";
      }
      if (/[.,!?;:]/.test(orig) !== /[.,!?;:]/.test(repl)) return "grammar";
      if (orig.toLowerCase() === repl.toLowerCase()) return "grammar";
      return "style";
    }
    apply() {
      this.onApply(this.correctedText);
    }
    renderEmptyCelebration(text) {
      const wrap = document.createElement("div");
      wrap.className = "wg-empty-celebrate";
      const emoji = document.createElement("div");
      emoji.className = "wg-empty-emoji";
      emoji.textContent = "🎉";
      const msg = document.createElement("p");
      msg.className = "wg-diff-perfect";
      msg.textContent = text || "Your writing is already gooderer! No changes needed.";
      wrap.appendChild(emoji);
      wrap.appendChild(msg);
      this.listEl.appendChild(wrap);
      requestAnimationFrame(() => burstConfetti(wrap));
    }
  }
  class ToneSelector {
    el;
    selected = "professional";
    onSelect;
    onArm;
    buttons = /* @__PURE__ */ new Map();
    constructor(onSelect, onArm) {
      this.onSelect = onSelect;
      this.onArm = onArm;
      this.el = document.createElement("div");
      this.el.className = "wg-tone-selector";
      const grid = document.createElement("div");
      grid.className = "wg-tone-grid";
      for (const [key, config] of Object.entries(TONES)) {
        const tone = key;
        const btn = document.createElement("button");
        btn.className = "wg-tone-btn";
        btn.innerHTML = `<span class="wg-tone-emoji">${config.emoji}</span><span class="wg-tone-text"><span class="wg-tone-name">${config.name}</span><span class="wg-tone-sub">${config.subtitle}</span></span>`;
        btn.addEventListener("click", () => this.selectTone(tone));
        if (this.onArm) {
          btn.addEventListener("pointerdown", () => this.onArm?.(tone));
        }
        grid.appendChild(btn);
        this.buttons.set(tone, btn);
      }
      this.el.appendChild(grid);
      getPreferences().then((prefs) => {
        this.selected = prefs.lastTone;
        this.updateSelection();
      });
    }
    get element() {
      return this.el;
    }
    selectTone(tone) {
      this.selected = tone;
      this.updateSelection();
      setLastTone(tone);
      this.onSelect(tone);
    }
    updateSelection() {
      for (const [tone, btn] of this.buttons) {
        btn.classList.toggle("wg-tone-selected", tone === this.selected);
      }
    }
  }
  function intentsEqual(a, b2) {
    if (a.kind !== b2.kind) return false;
    if (a.kind === "rewrite" && b2.kind === "rewrite") return a.tone === b2.tone;
    return true;
  }
  const POPUP_WIDTH = 520;
  const POPUP_MAX_HEIGHT = 520;
  const POPUP_GAP = 8;
  const VIEWPORT_PADDING = 8;
  const MIN_BODY_HEIGHT = 120;
  class PopupCard {
    el;
    headerEl;
    bodyEl;
    actionSurfaceEl;
    scoreDisplay;
    loadingState;
    diffView;
    toneSelector;
    rewriteResult;
    activeField = null;
    repositionRAF = null;
    speculative = null;
    onLoadingChange;
    onScoreReady;
    constructor(shadowRoot, onLoadingChange, onScoreReady) {
      this.onLoadingChange = onLoadingChange;
      this.onScoreReady = onScoreReady;
      this.el = document.createElement("div");
      this.el.className = "wg-popup-card";
      this.headerEl = document.createElement("div");
      this.headerEl.className = "wg-popup-header";
      this.headerEl.innerHTML = `
      <div class="wg-popup-heading">
        <span class="wg-popup-title">WriteGooderer</span>
      </div>
      <button class="wg-close-btn" aria-label="Close WriteGooderer">&times;</button>
    `;
      this.headerEl.querySelector(".wg-close-btn").addEventListener("click", () => this.hide());
      const headingEl = this.headerEl.querySelector(".wg-popup-heading");
      this.bodyEl = document.createElement("div");
      this.bodyEl.className = "wg-popup-body";
      this.scoreDisplay = new ScoreDisplay();
      this.loadingState = new LoadingState();
      this.loadingState.hide();
      this.diffView = new DiffView((text) => this.applyText(text));
      this.diffView.hide();
      this.toneSelector = new ToneSelector(
        (tone) => this.handleToneSelect(tone),
        (tone) => this.speculateFor({ kind: "rewrite", tone })
      );
      this.rewriteResult = document.createElement("div");
      this.rewriteResult.className = "wg-rewrite-result";
      this.rewriteResult.style.display = "none";
      headingEl.appendChild(this.scoreDisplay.element);
      this.actionSurfaceEl = document.createElement("div");
      this.actionSurfaceEl.className = "wg-action-surface";
      const proofreadBtn = document.createElement("button");
      proofreadBtn.className = "wg-btn wg-btn-primary wg-proofread-btn";
      proofreadBtn.innerHTML = `<span class="wg-proofread-emoji">✨</span><span>Proofread</span>`;
      proofreadBtn.addEventListener("click", () => this.handleProofread());
      proofreadBtn.addEventListener(
        "pointerdown",
        () => this.speculateFor({ kind: "proofread" })
      );
      const toneLabel = document.createElement("div");
      toneLabel.className = "wg-tone-label";
      toneLabel.textContent = "or rewrite in a tone";
      this.actionSurfaceEl.appendChild(proofreadBtn);
      this.actionSurfaceEl.appendChild(toneLabel);
      this.actionSurfaceEl.appendChild(this.toneSelector.element);
      this.bodyEl.appendChild(this.actionSurfaceEl);
      this.bodyEl.appendChild(this.loadingState.element);
      this.bodyEl.appendChild(this.diffView.element);
      this.bodyEl.appendChild(this.rewriteResult);
      this.el.appendChild(this.headerEl);
      this.el.appendChild(this.bodyEl);
      shadowRoot.appendChild(this.el);
    }
    show(field) {
      this.resetContent();
      this.el.classList.add("wg-visible");
      this.attachToField(field);
      this.speculateFor({ kind: "proofread" });
      this.startTracking();
    }
    attachToField(field) {
      const changedField = this.activeField !== field;
      this.activeField = field;
      if (changedField) {
        this.abortSpeculative();
        this.resetContent();
      }
      this.position();
    }
    hide() {
      this.el.classList.remove("wg-visible");
      this.stopTracking();
      this.abortSpeculative();
      this.resetContent();
    }
    abortSpeculative() {
      if (this.speculative) {
        this.speculative.abort.abort();
        this.speculative = null;
      }
    }
    speculateFor(intent) {
      const text = this.getFieldText();
      if (!text.trim()) return;
      if (this.speculative && this.speculative.text === text && intentsEqual(this.speculative.intent, intent)) {
        return;
      }
      this.abortSpeculative();
      const abort = new AbortController();
      const promise = intent.kind === "proofread" ? proofread(text, { signal: abort.signal }) : rewrite(text, intent.tone, { signal: abort.signal });
      promise.catch(() => {
      });
      this.speculative = { intent, text, promise, abort };
    }
    takeSpeculative(intent, text) {
      const s = this.speculative;
      if (!s) return null;
      if (s.text !== text || !intentsEqual(s.intent, intent)) {
        this.abortSpeculative();
        return null;
      }
      this.speculative = null;
      return s.promise;
    }
    get isVisible() {
      return this.el.classList.contains("wg-visible");
    }
    get currentField() {
      return this.activeField;
    }
    position() {
      if (!this.activeField) return;
      if (!this.activeField.isConnected) {
        this.hide();
        return;
      }
      const rect = this.activeField.getBoundingClientRect();
      const availableBelow = Math.max(0, window.innerHeight - rect.bottom - VIEWPORT_PADDING - POPUP_GAP);
      const availableAbove = Math.max(0, rect.top - VIEWPORT_PADDING - POPUP_GAP);
      const chromeHeight = this.headerEl.offsetHeight + 2;
      const minNeeded = chromeHeight + MIN_BODY_HEIGHT;
      const placeAbove = availableBelow < minNeeded && availableAbove > availableBelow;
      const space = placeAbove ? availableAbove : availableBelow;
      const popupMaxHeight = Math.max(minNeeded, Math.min(POPUP_MAX_HEIGHT, space));
      const top = placeAbove ? rect.top + window.scrollY - POPUP_GAP - popupMaxHeight : rect.bottom + window.scrollY + POPUP_GAP;
      this.el.style.top = `${top}px`;
      this.el.style.maxHeight = `${popupMaxHeight}px`;
      this.bodyEl.style.maxHeight = `${Math.max(MIN_BODY_HEIGHT, popupMaxHeight - chromeHeight)}px`;
      const minLeft = window.scrollX + VIEWPORT_PADDING;
      const maxLeft = window.scrollX + window.innerWidth - POPUP_WIDTH - VIEWPORT_PADDING;
      const desiredLeft = rect.right + window.scrollX - POPUP_WIDTH;
      const clampedLeft = Math.max(minLeft, Math.min(desiredLeft, maxLeft));
      this.el.style.left = `${clampedLeft}px`;
    }
    startTracking() {
      this.stopTracking();
      const track = () => {
        if (!this.isVisible) return;
        this.position();
        this.repositionRAF = requestAnimationFrame(track);
      };
      this.repositionRAF = requestAnimationFrame(track);
    }
    stopTracking() {
      if (this.repositionRAF !== null) {
        cancelAnimationFrame(this.repositionRAF);
        this.repositionRAF = null;
      }
    }
    resetContent() {
      this.actionSurfaceEl.style.display = "";
      this.loadingState.hide();
      this.scoreDisplay.element.style.display = "none";
      this.diffView.hide();
      this.rewriteResult.style.display = "none";
    }
    getFieldText(field = this.activeField) {
      if (!field) return "";
      if (field instanceof HTMLTextAreaElement) {
        const start = field.selectionStart;
        const end = field.selectionEnd;
        if (start !== end) {
          return field.value.substring(start, end);
        }
        return field.value;
      }
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return selection.toString();
      }
      return field.innerText || field.textContent || "";
    }
    async handleProofread() {
      const requestField = this.activeField;
      const text = this.getFieldText(requestField);
      if (!text.trim()) return;
      this.actionSurfaceEl.style.display = "none";
      this.showLoading(true);
      this.diffView.hide();
      this.rewriteResult.style.display = "none";
      try {
        const speculative = this.takeSpeculative({ kind: "proofread" }, text);
        const result = speculative ? await speculative : await proofread(text);
        const tier = getTierForScore(result.score);
        if (requestField) {
          this.onScoreReady(requestField, result.score, tier.color);
        }
        if (!requestField || this.activeField !== requestField) {
          return;
        }
        this.scoreDisplay.element.style.display = "inline-flex";
        this.scoreDisplay.setScore(result.score);
        this.diffView.show(text, result.corrected, result.changes);
      } catch (err) {
        if (!requestField || this.activeField !== requestField) {
          return;
        }
        this.showError(
          err instanceof Error ? err.message : "Failed to connect to the AI. Try again."
        );
      } finally {
        this.showLoading(false);
      }
    }
    async handleToneSelect(tone) {
      const requestField = this.activeField;
      const text = this.getFieldText(requestField);
      if (!text.trim()) return;
      this.actionSurfaceEl.style.display = "none";
      this.showLoading(true);
      this.diffView.hide();
      this.rewriteResult.style.display = "none";
      try {
        const speculative = this.takeSpeculative({ kind: "rewrite", tone }, text);
        const result = speculative ? await speculative : await rewrite(text, tone);
        if (!requestField || this.activeField !== requestField) {
          return;
        }
        this.showRewriteResult(result.rewritten);
      } catch (err) {
        if (!requestField || this.activeField !== requestField) {
          return;
        }
        this.showError(
          err instanceof Error ? err.message : "Failed to connect to the AI. Try again."
        );
      } finally {
        this.showLoading(false);
      }
    }
    showRewriteResult(text) {
      this.rewriteResult.innerHTML = "";
      this.actionSurfaceEl.style.display = "none";
      this.rewriteResult.style.display = "block";
      const pre = document.createElement("div");
      pre.className = "wg-rewrite-text";
      pre.textContent = text;
      const applyBtn = document.createElement("button");
      applyBtn.className = "wg-btn wg-btn-primary";
      applyBtn.textContent = "Apply";
      applyBtn.addEventListener("click", () => this.applyText(text));
      const copyBtn = document.createElement("button");
      copyBtn.className = "wg-btn wg-btn-secondary";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied!";
        setTimeout(() => copyBtn.textContent = "Copy", 1500);
      });
      const actions = document.createElement("div");
      actions.className = "wg-diff-actions";
      actions.appendChild(applyBtn);
      actions.appendChild(copyBtn);
      this.rewriteResult.appendChild(pre);
      this.rewriteResult.appendChild(actions);
    }
    applyText(text) {
      if (!this.activeField) return;
      if (this.activeField instanceof HTMLTextAreaElement || this.activeField instanceof HTMLInputElement) {
        this.activeField.value = text;
        this.activeField.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        this.activeField.focus();
        document.execCommand("selectAll", false);
        document.execCommand("insertText", false, text);
      }
      this.hide();
    }
    showLoading(loading) {
      this.onLoadingChange(loading);
      if (loading) {
        this.loadingState.show();
      } else {
        this.loadingState.hide();
      }
    }
    showError(message) {
      this.rewriteResult.innerHTML = "";
      this.actionSurfaceEl.style.display = "none";
      this.rewriteResult.style.display = "block";
      const errEl = document.createElement("div");
      errEl.className = "wg-error";
      errEl.textContent = message;
      this.rewriteResult.appendChild(errEl);
    }
  }
  const INIT_FLAG = "__writegoodererInitialized";
  const FONT_STYLE_ID = "writegooderer-fonts";
  function logDebug(message) {
    console.debug(`[WriteGooderer] ${message}`);
  }
  function parseRgb(input) {
    const match = input.match(/rgba?\(([^)]+)\)/i);
    if (!match) return null;
    const parts = match[1].split(",").map((p) => parseFloat(p.trim()));
    if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
    const [r, g2, b2] = parts;
    const a = parts.length >= 4 ? parts[3] : 1;
    return [r, g2, b2, a];
  }
  function detectHostTheme() {
    try {
      const candidates = [document.body, document.documentElement].filter(
        (el) => !!el
      );
      for (const el of candidates) {
        const bg = getComputedStyle(el).backgroundColor;
        const rgb = parseRgb(bg);
        if (rgb && rgb[3] > 0.1) {
          const luma = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
          return luma < 0.4 ? "dark" : "light";
        }
      }
    } catch {
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function injectFontFaces() {
    if (document.getElementById(FONT_STYLE_ID)) return;
    const interUrl = chrome.runtime.getURL("fonts/Inter-VariableFont.woff2");
    const frauncesUrl = chrome.runtime.getURL(
      "fonts/Fraunces-VariableFont.woff2"
    );
    const style = document.createElement("style");
    style.id = FONT_STYLE_ID;
    style.textContent = `
    @font-face {
      font-family: "Inter";
      src: url("${interUrl}") format("woff2");
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "Fraunces";
      src: url("${frauncesUrl}") format("woff2");
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
  `;
    (document.head || document.documentElement).appendChild(style);
  }
  async function main() {
    if (await isSiteDisabled(window.location.hostname)) return;
    const globalWindow = window;
    if (globalWindow[INIT_FLAG] || document.getElementById("writegooderer-root")) {
      logDebug("Skipping duplicate content-script initialization");
      return;
    }
    globalWindow[INIT_FLAG] = true;
    await checkTestMode();
    injectFontFaces();
    const host = document.createElement("div");
    host.id = "writegooderer-root";
    host.style.cssText = "position:absolute;top:0;left:0;z-index:2147483647;pointer-events:none;";
    host.setAttribute("data-wg-theme", detectHostTheme());
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = CSS_TEXT;
    shadow.appendChild(style);
    const darkMq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSchemeChange = () => {
      host.setAttribute("data-wg-theme", detectHostTheme());
    };
    darkMq.addEventListener?.("change", onSchemeChange);
    let activeField = null;
    const fieldScores = /* @__PURE__ */ new Map();
    const icon = new FloatingIcon(shadow, () => {
      if (activeField) {
        if (popup.isVisible) {
          popup.hide();
        } else {
          popup.show(activeField);
        }
      }
    });
    const popup = new PopupCard(
      shadow,
      (loading) => icon.setLoading(loading),
      (field, score, color) => {
        const fieldId = ensureFieldId(field);
        fieldScores.set(fieldId, { score, color });
        if (activeField === field) {
          icon.showScore(score, color);
        }
      }
    );
    initFieldDetector(
      (field) => {
        activeField = field;
        if (field) {
          const fieldId = ensureFieldId(field);
          icon.show(field);
          const scoreState = fieldScores.get(fieldId);
          if (scoreState) {
            icon.showScore(scoreState.score, scoreState.color);
          } else {
            icon.hideScore();
          }
          if (popup.isVisible && popup.currentField !== field) {
            popup.hide();
          }
        } else if (!popup.isVisible) {
          icon.hide();
          icon.hideScore();
        } else {
          icon.hideScore();
        }
      },
      () => {
        logDebug("Valid field detected, prewarming AI sessions");
        void prewarmSessions().catch(() => {
        });
      }
    );
    window.addEventListener(
      "pagehide",
      () => {
        globalWindow[INIT_FLAG] = false;
        darkMq.removeEventListener?.("change", onSchemeChange);
        void destroySessions().catch(() => {
        });
      },
      { once: true }
    );
  }
  const CSS_TEXT = `
/* ===== Design Tokens ===== */
:host {
  ${FONT_TOKENS_CSS}
  ${tokensToCssVars("light")}
  --wg-radius: 18px;
  --wg-radius-sm: 10px;
  --wg-spring: cubic-bezier(.5, 1.6, .4, 1);
  --wg-tier-color: #4ECDC4;
}

:host([data-wg-theme="dark"]) {
  ${tokensToCssVars("dark")}
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ===== Floating Icon ===== */
.wg-floating-icon {
  position: absolute;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--wg-gradient);
  color: white;
  font-family: var(--wg-font-display);
  font-size: 18px;
  font-weight: 700;
  font-variation-settings: "opsz" 48, "SOFT" 60, "WONK" 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  pointer-events: none;
  box-shadow: 0 4px 10px rgba(163, 97, 38, 0.22);
  z-index: 2147483647;
  user-select: none;
  border: none;
  line-height: 1;
}

.wg-floating-icon.wg-visible {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.wg-floating-icon:hover {
  transform: scale(1.06);
  box-shadow: 0 8px 16px rgba(163, 97, 38, 0.28);
  animation: wg-wobble 0.5s var(--wg-spring);
}

@keyframes wg-wobble {
  0% { transform: scale(1.06) rotate(0deg); }
  25% { transform: scale(1.06) rotate(-5deg); }
  50% { transform: scale(1.06) rotate(5deg); }
  75% { transform: scale(1.06) rotate(-2deg); }
  100% { transform: scale(1.06) rotate(0deg); }
}

.wg-floating-icon.wg-loading {
  animation: wg-pulse 1s ease-in-out infinite;
}

@keyframes wg-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.wg-floating-score {
  position: absolute;
  top: -7px;
  right: -7px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  color: white;
  font-family: var(--wg-font-body);
  font-size: 10px;
  font-weight: 700;
  font-feature-settings: "tnum" 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 14px rgba(0,0,0,0.22);
  border: 2px solid var(--wg-bg-muted);
}

/* ===== Popup Card ===== */
.wg-popup-card {
  position: absolute;
  width: 520px;
  max-height: 520px;
  background: var(--wg-card-bg);
  border-radius: var(--wg-radius);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--wg-border);
  font-family: var(--wg-font-body);
  color: var(--wg-text);
  overflow: hidden;
  opacity: 0;
  transform: translateY(10px) scale(0.98);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  z-index: 2147483647;
  -webkit-font-smoothing: antialiased;
}

.wg-popup-card.wg-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.wg-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  background: var(--wg-bg-soft);
  border-bottom: 1px solid var(--wg-border-soft);
}

.wg-popup-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.wg-popup-title {
  font-family: var(--wg-font-display);
  font-size: 17px;
  font-weight: 700;
  font-variation-settings: "opsz" 36, "SOFT" 50, "WONK" 1;
  color: var(--wg-text);
  letter-spacing: -0.01em;
  line-height: 1.1;
}

.wg-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: var(--wg-button-secondary-bg);
  border: none;
  font-size: 18px;
  color: var(--wg-text-secondary);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
}
.wg-close-btn:hover {
  color: var(--wg-text);
  background: var(--wg-button-secondary-hover-bg);
  transform: rotate(90deg);
}
.wg-close-btn:focus-visible {
  outline: 2px solid var(--wg-focus-ring);
  outline-offset: 2px;
}

.wg-popup-body {
  padding: 16px;
  overflow-y: auto;
}

.wg-action-surface {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wg-proofread-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
}

.wg-proofread-emoji {
  font-size: 15px;
  line-height: 1;
}

.wg-tone-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--wg-text-secondary);
  margin-top: 2px;
}

/* ===== Buttons ===== */
.wg-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 12px;
  font-family: var(--wg-font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.wg-btn:focus-visible {
  outline: 2px solid var(--wg-focus-ring);
  outline-offset: 2px;
}

.wg-btn-primary {
  background: var(--wg-gradient);
  color: white;
  font-weight: 700;
}
.wg-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(163, 97, 38, 0.2);
}

.wg-btn-secondary {
  background: var(--wg-button-secondary-bg);
  color: var(--wg-text);
  border-color: var(--wg-border);
}
.wg-btn-secondary:hover {
  background: var(--wg-button-secondary-hover-bg);
  border-color: var(--wg-border);
}

/* ===== Score Display ===== */
.wg-score-display {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 4px;
  background: var(--wg-surface-raised);
  border: 1px solid var(--wg-border-soft);
  border-radius: 999px;
  transition: opacity 0.3s ease;
}

.wg-score-display.is-perfect .wg-gauge-fill {
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--wg-tier-color) 60%, transparent));
}

.wg-gauge-wrap {
  position: relative;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  display: block;
}

.wg-gauge-wrap.wg-bump {
  animation: wg-bump 0.5s var(--wg-spring);
}

@keyframes wg-bump {
  0% { transform: scale(0.94); }
  60% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

.wg-gauge {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.wg-gauge-bg {
  fill: none;
  stroke: var(--wg-gauge-track);
  stroke-width: 8;
}

.wg-gauge-fill {
  fill: none;
  stroke: #4ECDC4;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 314;
  stroke-dashoffset: 314;
  transition: stroke 0.3s ease, stroke-dashoffset 0.6s ease;
}

.wg-gauge-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
  text-align: center;
}

.wg-score-number {
  font-family: var(--wg-font-display);
  font-size: 11px;
  font-weight: 700;
  font-variation-settings: "opsz" 18, "SOFT" 50, "WONK" 1;
  font-feature-settings: "tnum" 1;
  color: var(--wg-text);
  letter-spacing: -0.02em;
  line-height: 1;
}

.wg-tier-label {
  font-family: var(--wg-font-display);
  font-size: 12px;
  font-weight: 700;
  font-variation-settings: "opsz" 18, "SOFT" 60, "WONK" 1;
  letter-spacing: -0.005em;
  line-height: 1;
  white-space: nowrap;
}

/* ===== Loading ===== */
.wg-loading-state {
  text-align: center;
  padding: 18px 14px;
  border-radius: 16px;
  background: var(--wg-surface-raised);
  border: 1px solid var(--wg-border-soft);
}

.wg-progress-bar {
  height: 6px;
  background: var(--wg-gauge-track);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 12px;
}

.wg-progress-fill {
  height: 100%;
  width: 30%;
  background: var(--wg-gradient);
  border-radius: 2px;
  animation: wg-progress 1.5s ease-in-out infinite;
}

@keyframes wg-progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

.wg-quip {
  font-size: 13px;
  color: var(--wg-text-secondary);
  font-style: italic;
  min-height: 20px;
}

.wg-quip-fade {
  animation: wg-fade-in 0.3s ease;
}

@keyframes wg-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== Diff View ===== */
.wg-diff-view {
  margin-top: 12px;
}

.wg-diff-content {
  font-size: 13px;
  line-height: 1.6;
  padding: 12px;
  max-height: 280px;
  overflow-y: auto;
  color: var(--wg-text);
  background: var(--wg-surface-raised);
  border: 1px solid var(--wg-border-soft);
  border-radius: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.wg-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: var(--wg-font-body);
}

.wg-chip-spelling {
  background: rgba(255, 107, 107, 0.15);
  color: #c0392b;
}
.wg-chip-grammar {
  background: rgba(78, 205, 196, 0.18);
  color: #138a80;
}
.wg-chip-style {
  background: rgba(255, 138, 87, 0.16);
  color: var(--wg-accent-strong);
}

.wg-diff-remove {
  background: var(--wg-diff-remove-bg);
  color: var(--wg-diff-remove-fg);
  text-decoration: line-through;
  border-radius: 4px;
  padding: 1px 5px;
}

.wg-diff-add {
  background: var(--wg-diff-add-bg);
  color: var(--wg-diff-add-fg);
  border-radius: 4px;
  padding: 1px 5px;
  font-weight: 600;
}

.wg-diff-perfect,
.wg-empty-celebrate {
  color: var(--wg-diff-add-fg);
  font-size: 14px;
  text-align: center;
  padding: 18px 12px;
  font-weight: 600;
  background: var(--wg-surface-raised);
  border-radius: 14px;
  border: 1px solid var(--wg-border-soft);
  position: relative;
  overflow: hidden;
}

.wg-empty-emoji {
  font-size: 32px;
  margin-bottom: 6px;
  line-height: 1;
}

.wg-diff-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 6px 2px 10px;
  flex-wrap: wrap;
}

.wg-diff-summary-title {
  font-family: var(--wg-font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--wg-text);
  letter-spacing: -0.01em;
}

.wg-diff-summary-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.wg-diff-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

/* ===== Tone Selector ===== */
.wg-tone-selector {
  display: block;
}

.wg-tone-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.wg-tone-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 10px 12px;
  border: 1px solid var(--wg-border-soft);
  border-radius: 14px;
  background: var(--wg-pill-bg);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, transform 0.2s var(--wg-spring);
  font-family: var(--wg-font-body);
  text-align: left;
}

.wg-tone-btn:hover {
  border-color: var(--wg-tone-selected-border);
  background: var(--wg-tone-hover-bg);
  transform: translateY(-1px) rotate(-0.4deg);
}

.wg-tone-emoji {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.wg-tone-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.wg-tone-btn:focus-visible {
  outline: 2px solid var(--wg-focus-ring);
  outline-offset: 2px;
}

.wg-tone-btn.wg-tone-selected {
  border-color: var(--wg-tone-selected-border);
  background: var(--wg-tone-selected-bg);
}

.wg-tone-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--wg-text);
}

.wg-tone-sub {
  font-size: 10.5px;
  color: var(--wg-text-secondary);
  margin-top: 2px;
}

/* ===== Rewrite Result ===== */
.wg-rewrite-result {
  margin-top: 12px;
}

.wg-rewrite-text {
  font-size: 13px;
  line-height: 1.6;
  padding: 14px;
  background: var(--wg-surface-raised);
  border-radius: 14px;
  border: 1px solid var(--wg-border-soft);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  color: var(--wg-text);
}

/* ===== Error ===== */
.wg-error {
  color: var(--wg-error-fg);
  font-size: 13px;
  text-align: center;
  padding: 14px;
  background: var(--wg-error-bg);
  border-radius: 14px;
  border: 1px solid var(--wg-error-border);
}

/* ===== Confetti ===== */
.wg-confetto {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: var(--wg-c, #ff8a57);
  border-radius: 2px;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, -50%);
  animation: wg-confetto 900ms var(--wg-spring) forwards;
  z-index: 2;
}

@keyframes wg-confetto {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--wg-tx, 40px)), calc(-50% + var(--wg-ty, 40px))) rotate(var(--wg-r, 180deg));
  }
}

/* ===== Reduced Motion ===== */
@media (prefers-reduced-motion: reduce) {
  .wg-floating-icon,
  .wg-popup-card,
  .wg-gauge-fill,
  .wg-tone-btn,
  .wg-score-display {
    transition: none;
  }
  .wg-floating-icon.wg-loading,
  .wg-progress-fill,
  .wg-quip-fade,
  .wg-gauge-wrap.wg-bump,
  .wg-confetto {
    animation: none;
  }
  .wg-floating-icon:hover {
    animation: none;
  }
  .wg-tone-btn:hover {
    transform: none;
  }
}
`;
  main();
})();
