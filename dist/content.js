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
    const t2 = THEME_TOKENS[mode];
    return `
    --wg-gradient: ${t2.gradient};
    --wg-bg-soft: ${t2.bgSoft};
    --wg-bg-muted: ${t2.bgMuted};
    --wg-card-bg: ${t2.cardBg};
    --wg-popup-bg: ${t2.popupBg};
    --wg-popup-header-bg: ${t2.popupHeaderBg};
    --wg-section-bg: ${t2.sectionBg};
    --wg-text: ${t2.text};
    --wg-text-secondary: ${t2.textSecondary};
    --wg-text-tertiary: ${t2.textTertiary};
    --wg-accent-strong: ${t2.accentStrong};
    --wg-accent-soft: ${t2.accentSoft};
    --wg-link: ${t2.link};
    --wg-border: ${t2.border};
    --wg-border-soft: ${t2.borderSoft};
    --wg-shadow: ${t2.shadow};
    --wg-shadow-soft: ${t2.shadowSoft};
    --wg-pill-bg: ${t2.pillBg};
    --wg-button-secondary-bg: ${t2.buttonSecondaryBg};
    --wg-button-secondary-hover-bg: ${t2.buttonSecondaryHoverBg};
    --wg-toggle-track: ${t2.toggleTrack};
    --wg-focus-ring: ${t2.focusRing};
    --wg-glass-highlight: ${t2.glassHighlight};
    --wg-surface-raised: ${t2.surfaceRaised};
    --wg-gauge-track: ${t2.gaugeTrack};
    --wg-diff-remove-bg: ${t2.diffRemoveBg};
    --wg-diff-remove-fg: ${t2.diffRemoveFg};
    --wg-diff-add-bg: ${t2.diffAddBg};
    --wg-diff-add-fg: ${t2.diffAddFg};
    --wg-error-bg: ${t2.errorBg};
    --wg-error-border: ${t2.errorBorder};
    --wg-error-fg: ${t2.errorFg};
    --wg-tone-selected-bg: ${t2.toneSelectedBg};
    --wg-tone-selected-border: ${t2.toneSelectedBorder};
    --wg-tone-hover-bg: ${t2.toneHoverBg};
    --wg-icon-shadow: ${t2.iconShadow};
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
  var e = { withStackTrace: false }, t = (t2, n2, r2 = e) => ({
    data: n2.isOk() ? {
      type: "Ok",
      value: n2.value
    } : {
      type: "Err",
      value: n2.error
    },
    message: t2,
    stack: r2.withStackTrace ? (/* @__PURE__ */ Error()).stack : void 0
  });
  function n(e2, t2, n2, r2) {
    function i2(e3) {
      return e3 instanceof n2 ? e3 : new n2(function(t3) {
        t3(e3);
      });
    }
    return new (n2 ||= Promise)(function(n3, a2) {
      function o2(e3) {
        try {
          c2(r2.next(e3));
        } catch (e4) {
          a2(e4);
        }
      }
      function s2(e3) {
        try {
          c2(r2.throw(e3));
        } catch (e4) {
          a2(e4);
        }
      }
      function c2(e3) {
        e3.done ? n3(e3.value) : i2(e3.value).then(o2, s2);
      }
      c2((r2 = r2.apply(e2, [])).next());
    });
  }
  function r(e2) {
    var t2 = typeof Symbol == "function" && Symbol.iterator, n2 = t2 && e2[t2], r2 = 0;
    if (n2) return n2.call(e2);
    if (e2 && typeof e2.length == "number") return { next: function() {
      return e2 && r2 >= e2.length && (e2 = void 0), {
        value: e2 && e2[r2++],
        done: !e2
      };
    } };
    throw TypeError(t2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function i(e2) {
    return this instanceof i ? (this.v = e2, this) : new i(e2);
  }
  function a(e2, t2, n2) {
    if (!Symbol.asyncIterator) throw TypeError("Symbol.asyncIterator is not defined.");
    var r2 = n2.apply(e2, t2 || []), a2, o2 = [];
    return a2 = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), c2("next"), c2("throw"), c2("return", s2), a2[Symbol.asyncIterator] = function() {
      return this;
    }, a2;
    function s2(e3) {
      return function(t3) {
        return Promise.resolve(t3).then(e3, f2);
      };
    }
    function c2(e3, t3) {
      r2[e3] && (a2[e3] = function(t4) {
        return new Promise(function(n3, r3) {
          o2.push([
            e3,
            t4,
            n3,
            r3
          ]) > 1 || l2(e3, t4);
        });
      }, t3 && (a2[e3] = t3(a2[e3])));
    }
    function l2(e3, t3) {
      try {
        u2(r2[e3](t3));
      } catch (e4) {
        p2(o2[0][3], e4);
      }
    }
    function u2(e3) {
      e3.value instanceof i ? Promise.resolve(e3.value.v).then(d2, f2) : p2(o2[0][2], e3);
    }
    function d2(e3) {
      l2("next", e3);
    }
    function f2(e3) {
      l2("throw", e3);
    }
    function p2(e3, t3) {
      e3(t3), o2.shift(), o2.length && l2(o2[0][0], o2[0][1]);
    }
  }
  function o(e2) {
    var t2, n2;
    return t2 = {}, r2("next"), r2("throw", function(e3) {
      throw e3;
    }), r2("return"), t2[Symbol.iterator] = function() {
      return this;
    }, t2;
    function r2(r3, a2) {
      t2[r3] = e2[r3] ? function(t3) {
        return (n2 = !n2) ? {
          value: i(e2[r3](t3)),
          done: false
        } : a2 ? a2(t3) : t3;
      } : a2;
    }
  }
  function s(e2) {
    if (!Symbol.asyncIterator) throw TypeError("Symbol.asyncIterator is not defined.");
    var t2 = e2[Symbol.asyncIterator], n2;
    return t2 ? t2.call(e2) : (e2 = typeof r == "function" ? r(e2) : e2[Symbol.iterator](), n2 = {}, i2("next"), i2("throw"), i2("return"), n2[Symbol.asyncIterator] = function() {
      return this;
    }, n2);
    function i2(t3) {
      n2[t3] = e2[t3] && function(n3) {
        return new Promise(function(r2, i3) {
          n3 = e2[t3](n3), a2(r2, i3, n3.done, n3.value);
        });
      };
    }
    function a2(e3, t3, n3, r2) {
      Promise.resolve(r2).then(function(t4) {
        e3({
          value: t4,
          done: n3
        });
      }, t3);
    }
  }
  var c = class e2 {
    constructor(e3) {
      this._promise = e3;
    }
    static fromSafePromise(t2) {
      return new e2(t2.then((e3) => new _(e3)));
    }
    static fromPromise(t2, n2) {
      return new e2(t2.then((e3) => new _(e3)).catch((e3) => new v(n2(e3))));
    }
    static fromThrowable(t2, r2) {
      return (...i2) => new e2(n(this, void 0, void 0, function* () {
        try {
          return new _(yield t2(...i2));
        } catch (e3) {
          return new v(r2 ? r2(e3) : e3);
        }
      }));
    }
    static combine(e3) {
      return d(e3);
    }
    static combineWithAllErrors(e3) {
      return p(e3);
    }
    map(t2) {
      return new e2(this._promise.then((e3) => n(this, void 0, void 0, function* () {
        return e3.isErr() ? new v(e3.error) : new _(yield t2(e3.value));
      })));
    }
    andThrough(t2) {
      return new e2(this._promise.then((e3) => n(this, void 0, void 0, function* () {
        if (e3.isErr()) return new v(e3.error);
        let n2 = yield t2(e3.value);
        return n2.isErr() ? new v(n2.error) : new _(e3.value);
      })));
    }
    andTee(t2) {
      return new e2(this._promise.then((e3) => n(this, void 0, void 0, function* () {
        if (e3.isErr()) return new v(e3.error);
        try {
          yield t2(e3.value);
        } catch {
        }
        return new _(e3.value);
      })));
    }
    orTee(t2) {
      return new e2(this._promise.then((e3) => n(this, void 0, void 0, function* () {
        if (e3.isOk()) return new _(e3.value);
        try {
          yield t2(e3.error);
        } catch {
        }
        return new v(e3.error);
      })));
    }
    mapErr(t2) {
      return new e2(this._promise.then((e3) => n(this, void 0, void 0, function* () {
        return e3.isOk() ? new _(e3.value) : new v(yield t2(e3.error));
      })));
    }
    andThen(t2) {
      return new e2(this._promise.then((n2) => {
        if (n2.isErr()) return new v(n2.error);
        let r2 = t2(n2.value);
        return r2 instanceof e2 ? r2._promise : r2;
      }));
    }
    orElse(t2) {
      return new e2(this._promise.then((e3) => n(this, void 0, void 0, function* () {
        return e3.isErr() ? t2(e3.error) : new _(e3.value);
      })));
    }
    match(e3, t2) {
      return this._promise.then((n2) => n2.match(e3, t2));
    }
    unwrapOr(e3) {
      return this._promise.then((t2) => t2.unwrapOr(e3));
    }
    safeUnwrap() {
      return a(this, arguments, function* () {
        return yield i(yield i(yield* o(s(yield i(this._promise.then((e3) => e3.safeUnwrap()))))));
      });
    }
    then(e3, t2) {
      return this._promise.then(e3, t2);
    }
    [Symbol.asyncIterator]() {
      return a(this, arguments, function* () {
        let e3 = yield i(this._promise);
        return e3.isErr() && (yield yield i(l(e3.error))), yield i(e3.value);
      });
    }
  };
  function l(e2) {
    return new c(Promise.resolve(new v(e2)));
  }
  var u = (e2) => {
    let t2 = h([]);
    for (let n2 of e2) if (n2.isErr()) {
      t2 = g(n2.error);
      break;
    } else t2.map((e3) => e3.push(n2.value));
    return t2;
  }, d = (e2) => c.fromSafePromise(Promise.all(e2)).andThen(u), f = (e2) => {
    let t2 = h([]);
    for (let n2 of e2) n2.isErr() && t2.isErr() ? t2.error.push(n2.error) : n2.isErr() && t2.isOk() ? t2 = g([n2.error]) : n2.isOk() && t2.isOk() && t2.value.push(n2.value);
    return t2;
  }, p = (e2) => c.fromSafePromise(Promise.all(e2)).andThen(f), m;
  (function(e2) {
    function t2(e3, t3) {
      return (...n3) => {
        try {
          return h(e3(...n3));
        } catch (e4) {
          return g(t3 ? t3(e4) : e4);
        }
      };
    }
    e2.fromThrowable = t2;
    function n2(e3) {
      return u(e3);
    }
    e2.combine = n2;
    function r2(e3) {
      return f(e3);
    }
    e2.combineWithAllErrors = r2;
  })(m ||= {});
  function h(e2) {
    return new _(e2);
  }
  function g(e2) {
    return new v(e2);
  }
  var _ = class {
    constructor(e2) {
      this.value = e2;
    }
    isOk() {
      return true;
    }
    isErr() {
      return !this.isOk();
    }
    map(e2) {
      return h(e2(this.value));
    }
    mapErr(e2) {
      return h(this.value);
    }
    andThen(e2) {
      return e2(this.value);
    }
    andThrough(e2) {
      return e2(this.value).map((e3) => this.value);
    }
    andTee(e2) {
      try {
        e2(this.value);
      } catch {
      }
      return h(this.value);
    }
    orTee(e2) {
      return h(this.value);
    }
    orElse(e2) {
      return h(this.value);
    }
    asyncAndThen(e2) {
      return e2(this.value);
    }
    asyncAndThrough(e2) {
      return e2(this.value).map(() => this.value);
    }
    asyncMap(e2) {
      return c.fromSafePromise(e2(this.value));
    }
    unwrapOr(e2) {
      return this.value;
    }
    match(e2, t2) {
      return e2(this.value);
    }
    safeUnwrap() {
      let e2 = this.value;
      return (function* () {
        return e2;
      })();
    }
    _unsafeUnwrap(e2) {
      return this.value;
    }
    _unsafeUnwrapErr(e2) {
      throw t("Called `_unsafeUnwrapErr` on an Ok", this, e2);
    }
    *[Symbol.iterator]() {
      return this.value;
    }
  }, v = class {
    constructor(e2) {
      this.error = e2;
    }
    isOk() {
      return false;
    }
    isErr() {
      return !this.isOk();
    }
    map(e2) {
      return g(this.error);
    }
    mapErr(e2) {
      return g(e2(this.error));
    }
    andThrough(e2) {
      return g(this.error);
    }
    andTee(e2) {
      return g(this.error);
    }
    orTee(e2) {
      try {
        e2(this.error);
      } catch {
      }
      return g(this.error);
    }
    andThen(e2) {
      return g(this.error);
    }
    orElse(e2) {
      return e2(this.error);
    }
    asyncAndThen(e2) {
      return l(this.error);
    }
    asyncAndThrough(e2) {
      return l(this.error);
    }
    asyncMap(e2) {
      return l(this.error);
    }
    unwrapOr(e2) {
      return e2;
    }
    match(e2, t2) {
      return t2(this.error);
    }
    safeUnwrap() {
      let e2 = this.error;
      return (function* () {
        throw yield g(e2), Error("Do not use this generator out of `safeTry`");
      })();
    }
    _unsafeUnwrap(e2) {
      throw t("Called `_unsafeUnwrap` on an Err", this, e2);
    }
    _unsafeUnwrapErr(e2) {
      return this.error;
    }
    *[Symbol.iterator]() {
      let e2 = this;
      return yield e2, e2;
    }
  };
  m.fromThrowable;
  var y = Symbol.for("@ts-pattern/matcher"), b = Symbol.for("@ts-pattern/isVariadic"), x = "@ts-pattern/anonymous-select-key", S = (e2) => !!(e2 && typeof e2 == "object"), C = (e2) => e2 && !!e2[y], w = (e2, t2, n2) => {
    if (C(e2)) {
      let { matched: r2, selections: i2 } = e2[y]().match(t2);
      return r2 && i2 && Object.keys(i2).forEach((e3) => n2(e3, i2[e3])), r2;
    }
    if (S(e2)) {
      if (!S(t2)) return false;
      if (Array.isArray(e2)) {
        if (!Array.isArray(t2)) return false;
        let r2 = [], i2 = [], a2 = [];
        for (let t3 of e2.keys()) {
          let n3 = e2[t3];
          C(n3) && n3[b] ? a2.push(n3) : a2.length ? i2.push(n3) : r2.push(n3);
        }
        if (a2.length) {
          if (a2.length > 1) throw Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
          if (t2.length < r2.length + i2.length) return false;
          let e3 = t2.slice(0, r2.length), o2 = i2.length === 0 ? [] : t2.slice(-i2.length), s2 = t2.slice(r2.length, i2.length === 0 ? Infinity : -i2.length);
          return r2.every((t3, r3) => w(t3, e3[r3], n2)) && i2.every((e4, t3) => w(e4, o2[t3], n2)) && (a2.length === 0 || w(a2[0], s2, n2));
        }
        return e2.length === t2.length && e2.every((e3, r3) => w(e3, t2[r3], n2));
      }
      return Reflect.ownKeys(e2).every((r2) => {
        let i2 = e2[r2];
        return (r2 in t2 || C(a2 = i2) && a2[y]().matcherType === "optional") && w(i2, t2[r2], n2);
        var a2;
      });
    }
    return Object.is(t2, e2);
  }, T = (e2) => {
    var t2;
    return S(e2) ? C(e2) ? (t2 = e2[y]()).getSelectionKeys?.call(t2) ?? [] : E(Array.isArray(e2) ? e2 : Object.values(e2), T) : [];
  }, E = (e2, t2) => e2.reduce((e3, n2) => e3.concat(t2(n2)), []);
  function D(e2) {
    return Object.assign(e2, {
      optional: () => k(e2),
      and: (t2) => A(e2, t2),
      or: (t2) => ee(e2, t2),
      select: (t2) => t2 === void 0 ? M(e2) : M(t2, e2)
    });
  }
  function k(e2) {
    return D({ [y]: () => ({
      match: (t2) => {
        let n2 = {}, r2 = (e3, t3) => {
          n2[e3] = t3;
        };
        return t2 === void 0 ? (T(e2).forEach((e3) => r2(e3, void 0)), {
          matched: true,
          selections: n2
        }) : {
          matched: w(e2, t2, r2),
          selections: n2
        };
      },
      getSelectionKeys: () => T(e2),
      matcherType: "optional"
    }) });
  }
  function A(...e2) {
    return D({ [y]: () => ({
      match: (t2) => {
        let n2 = {}, r2 = (e3, t3) => {
          n2[e3] = t3;
        };
        return {
          matched: e2.every((e3) => w(e3, t2, r2)),
          selections: n2
        };
      },
      getSelectionKeys: () => E(e2, T),
      matcherType: "and"
    }) });
  }
  function ee(...e2) {
    return D({ [y]: () => ({
      match: (t2) => {
        let n2 = {}, r2 = (e3, t3) => {
          n2[e3] = t3;
        };
        return E(e2, T).forEach((e3) => r2(e3, void 0)), {
          matched: e2.some((e3) => w(e3, t2, r2)),
          selections: n2
        };
      },
      getSelectionKeys: () => E(e2, T),
      matcherType: "or"
    }) });
  }
  function j(e2) {
    return { [y]: () => ({ match: (t2) => ({ matched: !!e2(t2) }) }) };
  }
  function M(...e2) {
    let t2 = typeof e2[0] == "string" ? e2[0] : void 0, n2 = e2.length === 2 ? e2[1] : typeof e2[0] == "string" ? void 0 : e2[0];
    return D({ [y]: () => ({
      match: (e3) => {
        let r2 = { [t2 ?? x]: e3 };
        return {
          matched: n2 === void 0 || w(n2, e3, (e4, t3) => {
            r2[e4] = t3;
          }),
          selections: r2
        };
      },
      getSelectionKeys: () => [t2 ?? x].concat(n2 === void 0 ? [] : T(n2))
    }) });
  }
  function N(e2) {
    return true;
  }
  function P(e2) {
    return typeof e2 == "number";
  }
  function F(e2) {
    return typeof e2 == "string";
  }
  function I(e2) {
    return typeof e2 == "bigint";
  }
  D(j(N)), D(j(N));
  var L = (e2) => Object.assign(D(e2), {
    startsWith: (t2) => {
      return L(A(e2, (n2 = t2, j((e3) => F(e3) && e3.startsWith(n2)))));
      var n2;
    },
    endsWith: (t2) => {
      return L(A(e2, (n2 = t2, j((e3) => F(e3) && e3.endsWith(n2)))));
      var n2;
    },
    minLength: (t2) => L(A(e2, ((e3) => j((t3) => F(t3) && t3.length >= e3))(t2))),
    length: (t2) => L(A(e2, ((e3) => j((t3) => F(t3) && t3.length === e3))(t2))),
    maxLength: (t2) => L(A(e2, ((e3) => j((t3) => F(t3) && t3.length <= e3))(t2))),
    includes: (t2) => {
      return L(A(e2, (n2 = t2, j((e3) => F(e3) && e3.includes(n2)))));
      var n2;
    },
    regex: (t2) => {
      return L(A(e2, (n2 = t2, j((e3) => F(e3) && !!e3.match(n2)))));
      var n2;
    }
  });
  L(j(F));
  var R = (e2) => Object.assign(D(e2), {
    between: (t2, n2) => R(A(e2, ((e3, t3) => j((n3) => P(n3) && e3 <= n3 && t3 >= n3))(t2, n2))),
    lt: (t2) => R(A(e2, ((e3) => j((t3) => P(t3) && t3 < e3))(t2))),
    gt: (t2) => R(A(e2, ((e3) => j((t3) => P(t3) && t3 > e3))(t2))),
    lte: (t2) => R(A(e2, ((e3) => j((t3) => P(t3) && t3 <= e3))(t2))),
    gte: (t2) => R(A(e2, ((e3) => j((t3) => P(t3) && t3 >= e3))(t2))),
    int: () => R(A(e2, j((e3) => P(e3) && Number.isInteger(e3)))),
    finite: () => R(A(e2, j((e3) => P(e3) && Number.isFinite(e3)))),
    positive: () => R(A(e2, j((e3) => P(e3) && e3 > 0))),
    negative: () => R(A(e2, j((e3) => P(e3) && e3 < 0)))
  });
  R(j(P));
  var z = (e2) => Object.assign(D(e2), {
    between: (t2, n2) => z(A(e2, ((e3, t3) => j((n3) => I(n3) && e3 <= n3 && t3 >= n3))(t2, n2))),
    lt: (t2) => z(A(e2, ((e3) => j((t3) => I(t3) && t3 < e3))(t2))),
    gt: (t2) => z(A(e2, ((e3) => j((t3) => I(t3) && t3 > e3))(t2))),
    lte: (t2) => z(A(e2, ((e3) => j((t3) => I(t3) && t3 <= e3))(t2))),
    gte: (t2) => z(A(e2, ((e3) => j((t3) => I(t3) && t3 >= e3))(t2))),
    positive: () => z(A(e2, j((e3) => I(e3) && e3 > 0))),
    negative: () => z(A(e2, j((e3) => I(e3) && e3 < 0)))
  });
  z(j(I)), D(j(function(e2) {
    return typeof e2 == "boolean";
  })), D(j(function(e2) {
    return typeof e2 == "symbol";
  })), D(j(function(e2) {
    return e2 == null;
  })), D(j(function(e2) {
    return e2 != null;
  }));
  var te = class extends Error {
    constructor(e2) {
      let t2;
      try {
        t2 = JSON.stringify(e2);
      } catch {
        t2 = e2;
      }
      super(`Pattern matching error: no pattern matches value ${t2}`), this.input = void 0, this.input = e2;
    }
  }, B = {
    matched: false,
    value: void 0
  };
  function V(e2) {
    return new ne(e2, B);
  }
  var ne = class e2 {
    constructor(e3, t2) {
      this.input = void 0, this.state = void 0, this.input = e3, this.state = t2;
    }
    with(...t2) {
      if (this.state.matched) return this;
      let n2 = t2[t2.length - 1], r2 = [t2[0]], i2;
      t2.length === 3 && typeof t2[1] == "function" ? i2 = t2[1] : t2.length > 2 && r2.push(...t2.slice(1, t2.length - 1));
      let a2 = false, o2 = {}, s2 = (e3, t3) => {
        a2 = true, o2[e3] = t3;
      }, c2 = !r2.some((e3) => w(e3, this.input, s2)) || i2 && !i2(this.input) ? B : {
        matched: true,
        value: n2(a2 ? x in o2 ? o2[x] : o2 : this.input, this.input)
      };
      return new e2(this.input, c2);
    }
    when(t2, n2) {
      if (this.state.matched) return this;
      let r2 = !!t2(this.input);
      return new e2(this.input, r2 ? {
        matched: true,
        value: n2(this.input, this.input)
      } : B);
    }
    otherwise(e3) {
      return this.state.matched ? this.state.value : e3(this.input);
    }
    exhaustive(e3 = re) {
      return this.state.matched ? this.state.value : e3(this.input);
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
  };
  function re(e2) {
    throw new te(e2);
  }
  function H(e2) {
    return e2.match((e3) => e3, (e3) => {
      throw e3;
    });
  }
  function K(e2) {
    let t2 = e2?.expectedInputs ?? [{
      type: "text",
      languages: ["en"]
    }], n2 = e2?.expectedOutputs ?? [{
      type: "text",
      languages: ["en"]
    }];
    return new c((async () => {
      if (typeof LanguageModel > "u") return g(/* @__PURE__ */ Error("LanguageModel API is not available in this browser. Ensure you are using Chrome 148+ or a supported Chromium-based browser."));
      let r2 = V(await LanguageModel.availability({
        expectedInputs: t2,
        expectedOutputs: n2
      })).with("unavailable", () => g(/* @__PURE__ */ Error("LanguageModel API is present but the model is unavailable on this device."))).with("downloadable", "downloading", "available", (e3) => h(e3)).exhaustive();
      if (r2.isErr()) return r2;
      if (r2.value !== "available") try {
        (await LanguageModel.create({
          expectedInputs: t2,
          expectedOutputs: n2,
          monitor: e2?.monitor,
          signal: e2?.signal
        })).destroy();
      } catch (e3) {
        return g(/* @__PURE__ */ Error(`Failed to download LanguageModel: ${e3 instanceof Error ? e3.message : String(e3)}`));
      }
      return h({
        prompt: (e3, r3, i2, a2) => ae(t2, n2, e3, r3, i2, a2),
        createSession: (e3) => q(t2, n2, e3),
        withSession: (e3, r3) => J(t2, n2, e3, r3),
        checkTokenUsage: (e3, r3) => ie(t2, n2, e3, r3)
      });
    })());
  }
  function q(e2, t2, n2) {
    return new c((async () => {
      try {
        let r2 = { ...n2 };
        return !r2.expectedInputs && e2.length > 0 && (r2.expectedInputs = e2), !r2.expectedOutputs && t2.length > 0 && (r2.expectedOutputs = t2), h(await LanguageModel.create(r2));
      } catch (e3) {
        return g(/* @__PURE__ */ Error(`Failed to create AI session: ${e3 instanceof Error ? e3.message : "Unknown error"}`));
      }
    })());
  }
  function J(e2, t2, n2, r2) {
    return q(e2, t2, r2).andThen((e3) => n2(e3).map((t3) => (e3.destroy(), t3)).mapErr((t3) => (e3.destroy(), t3)));
  }
  function ie(e2, t2, n2, r2) {
    return J(e2, t2, (e3) => c.fromSafePromise((async () => {
      let t3 = await e3.measureContextUsage(n2), r3 = e3.contextWindow || 0, i2 = e3.contextUsage || 0, a2 = r3 - i2;
      return {
        promptTokens: t3,
        maxTokens: r3,
        tokensSoFar: i2,
        tokensAvailable: a2,
        willFit: t3 <= a2
      };
    })()), r2);
  }
  function ae(e2, t2, n2, r2, i2, a2) {
    return J(e2, t2, (e3) => {
      let t3 = null;
      return c.fromPromise((async () => {
        try {
          let a3 = i2 || {};
          if (r2 || a3.signal) {
            let e4 = [];
            if (a3.signal && e4.push(a3.signal), r2) {
              let n3 = new AbortController();
              e4.push(n3.signal), t3 = setTimeout(() => n3.abort(), r2);
            }
            e4.length > 1 && AbortSignal.any ? a3 = {
              ...a3,
              signal: AbortSignal.any(e4)
            } : e4.length === 1 && (a3 = {
              ...a3,
              signal: e4[0]
            });
          }
          return await e3.prompt(n2, a3);
        } finally {
          t3 && clearTimeout(t3);
        }
      })(), (e4) => e4 instanceof Error ? e4 : Error(String(e4)));
    }, a2);
  }
  async function $(e2) {
    let t2 = H(await K(e2));
    return {
      prompt: async (e3, n2, r2, i2) => H(await t2.prompt(e3, n2, r2, i2)),
      createSession: async (e3) => H(await t2.createSession(e3)),
      withSession: async (e3, n2) => H(await t2.withSession((t3) => c.fromPromise(e3(t3), (e4) => e4 instanceof Error ? e4 : Error(String(e4))), n2)),
      checkTokenUsage: async (e3, n2) => H(await t2.checkTokenUsage(e3, n2))
    };
  }
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
  let aiInstancePromise = null;
  let testMode = false;
  let dualBaseSessionPromise = null;
  let nextClonePromise = null;
  let downloadProgress = null;
  const progressListeners = /* @__PURE__ */ new Set();
  function emitProgress(p2) {
    downloadProgress = p2;
    for (const fn of progressListeners) {
      try {
        fn(p2);
      } catch (err) {
        logSessionEvent(`Progress listener threw: ${String(err)}`);
      }
    }
  }
  function subscribeDownloadProgress(fn) {
    progressListeners.add(fn);
    fn(downloadProgress);
    return () => progressListeners.delete(fn);
  }
  function logSessionEvent(message) {
    console.debug(`[WriteGooderer AI] ${message}`);
  }
  async function checkTestMode() {
    const result = await chrome.storage.local.get("wgTestMode");
    testMode = !!result.wgTestMode;
  }
  async function ensureModel() {
    if (aiInstance) return aiInstance;
    if (aiInstancePromise) return aiInstancePromise;
    let sawProgress = false;
    aiInstancePromise = $({
      monitor(m2) {
        m2.addEventListener("downloadprogress", (e2) => {
          const loaded = e2.loaded;
          sawProgress = true;
          logSessionEvent(`Model download progress: ${(loaded * 100).toFixed(1)}%`);
          emitProgress(loaded);
        });
      }
    }).then((instance) => {
      aiInstance = instance;
      if (sawProgress) emitProgress(null);
      return instance;
    }).catch((err) => {
      aiInstancePromise = null;
      if (sawProgress) emitProgress(null);
      throw err;
    });
    return aiInstancePromise;
  }
  async function createDualBaseSession() {
    logSessionEvent("Creating dual base session");
    const ai = await ensureModel();
    const session = await ai.createSession({
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
    for (const r2 of result) {
      if (r2.status === "fulfilled" && r2.value) {
        try {
          r2.value.destroy();
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
    function handleFocusIn(e2) {
      const target = e2.target;
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
      this.el.addEventListener("mousedown", (e2) => {
        e2.preventDefault();
        e2.stopPropagation();
      });
      this.el.addEventListener("click", (e2) => {
        e2.preventDefault();
        e2.stopPropagation();
        this.onClick();
      });
      this.el.addEventListener("keydown", (e2) => {
        if (e2.key === "Enter" || e2.key === " ") {
          e2.preventDefault();
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
    for (let i2 = 0; i2 < count; i2++) {
      const piece = document.createElement("i");
      piece.className = "wg-confetto";
      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 60;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 40;
      const rot = (Math.random() * 720 - 360).toFixed(0);
      const color = COLORS[i2 % COLORS.length];
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
    fillEl;
    quipEl;
    intervalId = null;
    unsubscribeProgress = null;
    downloadActive = false;
    constructor() {
      this.el = document.createElement("div");
      this.el.className = "wg-loading-state";
      const bar = document.createElement("div");
      bar.className = "wg-progress-bar";
      this.fillEl = document.createElement("div");
      this.fillEl.className = "wg-progress-fill";
      bar.appendChild(this.fillEl);
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
      this.unsubscribeProgress = subscribeDownloadProgress((p2) => this.onProgress(p2));
    }
    hide() {
      this.el.style.display = "none";
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.unsubscribeProgress?.();
      this.unsubscribeProgress = null;
      this.downloadActive = false;
      this.fillEl.style.width = "";
      this.fillEl.style.animation = "";
    }
    onProgress(p2) {
      if (p2 === null) {
        if (this.downloadActive) {
          this.downloadActive = false;
          this.fillEl.style.width = "";
          this.fillEl.style.animation = "";
          if (!this.intervalId) {
            this.intervalId = setInterval(() => this.rotateQuip(), 2500);
          }
          this.rotateQuip();
        }
        return;
      }
      this.downloadActive = true;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      const pct = Math.max(0, Math.min(1, p2));
      this.fillEl.style.animation = "none";
      this.fillEl.style.width = `${(pct * 100).toFixed(1)}%`;
      this.quipEl.classList.remove("wg-quip-fade");
      this.quipEl.textContent = `Downloading model… ${Math.round(pct * 100)}%`;
    }
    rotateQuip() {
      if (this.downloadActive) return;
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
  function intentsEqual(a2, b2) {
    if (a2.kind !== b2.kind) return false;
    if (a2.kind === "rewrite" && b2.kind === "rewrite") return a2.tone === b2.tone;
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
      const s2 = this.speculative;
      if (!s2) return null;
      if (s2.text !== text || !intentsEqual(s2.intent, intent)) {
        this.abortSpeculative();
        return null;
      }
      this.speculative = null;
      return s2.promise;
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
    const parts = match[1].split(",").map((p2) => parseFloat(p2.trim()));
    if (parts.length < 3 || parts.some((n2) => Number.isNaN(n2))) return null;
    const [r2, g2, b2] = parts;
    const a2 = parts.length >= 4 ? parts[3] : 1;
    return [r2, g2, b2, a2];
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
