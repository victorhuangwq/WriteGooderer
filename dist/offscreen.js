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
function n(e4, t2, n2, r2) {
  function i2(e5) {
    return e5 instanceof n2 ? e5 : new n2(function(t3) {
      t3(e5);
    });
  }
  return new (n2 ||= Promise)(function(n3, a2) {
    function o2(e5) {
      try {
        c2(r2.next(e5));
      } catch (e6) {
        a2(e6);
      }
    }
    function s2(e5) {
      try {
        c2(r2.throw(e5));
      } catch (e6) {
        a2(e6);
      }
    }
    function c2(e5) {
      e5.done ? n3(e5.value) : i2(e5.value).then(o2, s2);
    }
    c2((r2 = r2.apply(e4, [])).next());
  });
}
function r(e4) {
  var t2 = typeof Symbol == "function" && Symbol.iterator, n2 = t2 && e4[t2], r2 = 0;
  if (n2) return n2.call(e4);
  if (e4 && typeof e4.length == "number") return { next: function() {
    return e4 && r2 >= e4.length && (e4 = void 0), {
      value: e4 && e4[r2++],
      done: !e4
    };
  } };
  throw TypeError(t2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function i(e4) {
  return this instanceof i ? (this.v = e4, this) : new i(e4);
}
function a(e4, t2, n2) {
  if (!Symbol.asyncIterator) throw TypeError("Symbol.asyncIterator is not defined.");
  var r2 = n2.apply(e4, t2 || []), a2, o2 = [];
  return a2 = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), c2("next"), c2("throw"), c2("return", s2), a2[Symbol.asyncIterator] = function() {
    return this;
  }, a2;
  function s2(e5) {
    return function(t3) {
      return Promise.resolve(t3).then(e5, f2);
    };
  }
  function c2(e5, t3) {
    r2[e5] && (a2[e5] = function(t4) {
      return new Promise(function(n3, r3) {
        o2.push([
          e5,
          t4,
          n3,
          r3
        ]) > 1 || l2(e5, t4);
      });
    }, t3 && (a2[e5] = t3(a2[e5])));
  }
  function l2(e5, t3) {
    try {
      u2(r2[e5](t3));
    } catch (e6) {
      p2(o2[0][3], e6);
    }
  }
  function u2(e5) {
    e5.value instanceof i ? Promise.resolve(e5.value.v).then(d2, f2) : p2(o2[0][2], e5);
  }
  function d2(e5) {
    l2("next", e5);
  }
  function f2(e5) {
    l2("throw", e5);
  }
  function p2(e5, t3) {
    e5(t3), o2.shift(), o2.length && l2(o2[0][0], o2[0][1]);
  }
}
function o(e4) {
  var t2, n2;
  return t2 = {}, r2("next"), r2("throw", function(e5) {
    throw e5;
  }), r2("return"), t2[Symbol.iterator] = function() {
    return this;
  }, t2;
  function r2(r3, a2) {
    t2[r3] = e4[r3] ? function(t3) {
      return (n2 = !n2) ? {
        value: i(e4[r3](t3)),
        done: false
      } : a2 ? a2(t3) : t3;
    } : a2;
  }
}
function s(e4) {
  if (!Symbol.asyncIterator) throw TypeError("Symbol.asyncIterator is not defined.");
  var t2 = e4[Symbol.asyncIterator], n2;
  return t2 ? t2.call(e4) : (e4 = typeof r == "function" ? r(e4) : e4[Symbol.iterator](), n2 = {}, i2("next"), i2("throw"), i2("return"), n2[Symbol.asyncIterator] = function() {
    return this;
  }, n2);
  function i2(t3) {
    n2[t3] = e4[t3] && function(n3) {
      return new Promise(function(r2, i3) {
        n3 = e4[t3](n3), a2(r2, i3, n3.done, n3.value);
      });
    };
  }
  function a2(e5, t3, n3, r2) {
    Promise.resolve(r2).then(function(t4) {
      e5({
        value: t4,
        done: n3
      });
    }, t3);
  }
}
var c = class e2 {
  constructor(e4) {
    this._promise = e4;
  }
  static fromSafePromise(t2) {
    return new e2(t2.then((e4) => new _(e4)));
  }
  static fromPromise(t2, n2) {
    return new e2(t2.then((e4) => new _(e4)).catch((e4) => new v(n2(e4))));
  }
  static fromThrowable(t2, r2) {
    return (...i2) => new e2(n(this, void 0, void 0, function* () {
      try {
        return new _(yield t2(...i2));
      } catch (e4) {
        return new v(r2 ? r2(e4) : e4);
      }
    }));
  }
  static combine(e4) {
    return d(e4);
  }
  static combineWithAllErrors(e4) {
    return p(e4);
  }
  map(t2) {
    return new e2(this._promise.then((e4) => n(this, void 0, void 0, function* () {
      return e4.isErr() ? new v(e4.error) : new _(yield t2(e4.value));
    })));
  }
  andThrough(t2) {
    return new e2(this._promise.then((e4) => n(this, void 0, void 0, function* () {
      if (e4.isErr()) return new v(e4.error);
      let n2 = yield t2(e4.value);
      return n2.isErr() ? new v(n2.error) : new _(e4.value);
    })));
  }
  andTee(t2) {
    return new e2(this._promise.then((e4) => n(this, void 0, void 0, function* () {
      if (e4.isErr()) return new v(e4.error);
      try {
        yield t2(e4.value);
      } catch {
      }
      return new _(e4.value);
    })));
  }
  orTee(t2) {
    return new e2(this._promise.then((e4) => n(this, void 0, void 0, function* () {
      if (e4.isOk()) return new _(e4.value);
      try {
        yield t2(e4.error);
      } catch {
      }
      return new v(e4.error);
    })));
  }
  mapErr(t2) {
    return new e2(this._promise.then((e4) => n(this, void 0, void 0, function* () {
      return e4.isOk() ? new _(e4.value) : new v(yield t2(e4.error));
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
    return new e2(this._promise.then((e4) => n(this, void 0, void 0, function* () {
      return e4.isErr() ? t2(e4.error) : new _(e4.value);
    })));
  }
  match(e4, t2) {
    return this._promise.then((n2) => n2.match(e4, t2));
  }
  unwrapOr(e4) {
    return this._promise.then((t2) => t2.unwrapOr(e4));
  }
  safeUnwrap() {
    return a(this, arguments, function* () {
      return yield i(yield i(yield* o(s(yield i(this._promise.then((e4) => e4.safeUnwrap()))))));
    });
  }
  then(e4, t2) {
    return this._promise.then(e4, t2);
  }
  [Symbol.asyncIterator]() {
    return a(this, arguments, function* () {
      let e4 = yield i(this._promise);
      return e4.isErr() && (yield yield i(l(e4.error))), yield i(e4.value);
    });
  }
};
function l(e4) {
  return new c(Promise.resolve(new v(e4)));
}
var u = (e4) => {
  let t2 = h([]);
  for (let n2 of e4) if (n2.isErr()) {
    t2 = g(n2.error);
    break;
  } else t2.map((e5) => e5.push(n2.value));
  return t2;
}, d = (e4) => c.fromSafePromise(Promise.all(e4)).andThen(u), f = (e4) => {
  let t2 = h([]);
  for (let n2 of e4) n2.isErr() && t2.isErr() ? t2.error.push(n2.error) : n2.isErr() && t2.isOk() ? t2 = g([n2.error]) : n2.isOk() && t2.isOk() && t2.value.push(n2.value);
  return t2;
}, p = (e4) => c.fromSafePromise(Promise.all(e4)).andThen(f), m;
(function(e4) {
  function t2(e5, t3) {
    return (...n3) => {
      try {
        return h(e5(...n3));
      } catch (e6) {
        return g(t3 ? t3(e6) : e6);
      }
    };
  }
  e4.fromThrowable = t2;
  function n2(e5) {
    return u(e5);
  }
  e4.combine = n2;
  function r2(e5) {
    return f(e5);
  }
  e4.combineWithAllErrors = r2;
})(m ||= {});
function h(e4) {
  return new _(e4);
}
function g(e4) {
  return new v(e4);
}
var _ = class {
  constructor(e4) {
    this.value = e4;
  }
  isOk() {
    return true;
  }
  isErr() {
    return !this.isOk();
  }
  map(e4) {
    return h(e4(this.value));
  }
  mapErr(e4) {
    return h(this.value);
  }
  andThen(e4) {
    return e4(this.value);
  }
  andThrough(e4) {
    return e4(this.value).map((e5) => this.value);
  }
  andTee(e4) {
    try {
      e4(this.value);
    } catch {
    }
    return h(this.value);
  }
  orTee(e4) {
    return h(this.value);
  }
  orElse(e4) {
    return h(this.value);
  }
  asyncAndThen(e4) {
    return e4(this.value);
  }
  asyncAndThrough(e4) {
    return e4(this.value).map(() => this.value);
  }
  asyncMap(e4) {
    return c.fromSafePromise(e4(this.value));
  }
  unwrapOr(e4) {
    return this.value;
  }
  match(e4, t2) {
    return e4(this.value);
  }
  safeUnwrap() {
    let e4 = this.value;
    return (function* () {
      return e4;
    })();
  }
  _unsafeUnwrap(e4) {
    return this.value;
  }
  _unsafeUnwrapErr(e4) {
    throw t("Called `_unsafeUnwrapErr` on an Ok", this, e4);
  }
  *[Symbol.iterator]() {
    return this.value;
  }
}, v = class {
  constructor(e4) {
    this.error = e4;
  }
  isOk() {
    return false;
  }
  isErr() {
    return !this.isOk();
  }
  map(e4) {
    return g(this.error);
  }
  mapErr(e4) {
    return g(e4(this.error));
  }
  andThrough(e4) {
    return g(this.error);
  }
  andTee(e4) {
    return g(this.error);
  }
  orTee(e4) {
    try {
      e4(this.error);
    } catch {
    }
    return g(this.error);
  }
  andThen(e4) {
    return g(this.error);
  }
  orElse(e4) {
    return e4(this.error);
  }
  asyncAndThen(e4) {
    return l(this.error);
  }
  asyncAndThrough(e4) {
    return l(this.error);
  }
  asyncMap(e4) {
    return l(this.error);
  }
  unwrapOr(e4) {
    return e4;
  }
  match(e4, t2) {
    return t2(this.error);
  }
  safeUnwrap() {
    let e4 = this.error;
    return (function* () {
      throw yield g(e4), Error("Do not use this generator out of `safeTry`");
    })();
  }
  _unsafeUnwrap(e4) {
    throw t("Called `_unsafeUnwrap` on an Err", this, e4);
  }
  _unsafeUnwrapErr(e4) {
    return this.error;
  }
  *[Symbol.iterator]() {
    let e4 = this;
    return yield e4, e4;
  }
};
m.fromThrowable;
var y = Symbol.for("@ts-pattern/matcher"), b = Symbol.for("@ts-pattern/isVariadic"), x = "@ts-pattern/anonymous-select-key", S = (e4) => !!(e4 && typeof e4 == "object"), C = (e4) => e4 && !!e4[y], w = (e4, t2, n2) => {
  if (C(e4)) {
    let { matched: r2, selections: i2 } = e4[y]().match(t2);
    return r2 && i2 && Object.keys(i2).forEach((e5) => n2(e5, i2[e5])), r2;
  }
  if (S(e4)) {
    if (!S(t2)) return false;
    if (Array.isArray(e4)) {
      if (!Array.isArray(t2)) return false;
      let r2 = [], i2 = [], a2 = [];
      for (let t3 of e4.keys()) {
        let n3 = e4[t3];
        C(n3) && n3[b] ? a2.push(n3) : a2.length ? i2.push(n3) : r2.push(n3);
      }
      if (a2.length) {
        if (a2.length > 1) throw Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
        if (t2.length < r2.length + i2.length) return false;
        let e5 = t2.slice(0, r2.length), o2 = i2.length === 0 ? [] : t2.slice(-i2.length), s2 = t2.slice(r2.length, i2.length === 0 ? Infinity : -i2.length);
        return r2.every((t3, r3) => w(t3, e5[r3], n2)) && i2.every((e6, t3) => w(e6, o2[t3], n2)) && (a2.length === 0 || w(a2[0], s2, n2));
      }
      return e4.length === t2.length && e4.every((e5, r3) => w(e5, t2[r3], n2));
    }
    return Reflect.ownKeys(e4).every((r2) => {
      let i2 = e4[r2];
      return (r2 in t2 || C(a2 = i2) && a2[y]().matcherType === "optional") && w(i2, t2[r2], n2);
      var a2;
    });
  }
  return Object.is(t2, e4);
}, T = (e4) => {
  var t2;
  return S(e4) ? C(e4) ? (t2 = e4[y]()).getSelectionKeys?.call(t2) ?? [] : E(Array.isArray(e4) ? e4 : Object.values(e4), T) : [];
}, E = (e4, t2) => e4.reduce((e5, n2) => e5.concat(t2(n2)), []);
function D(e4) {
  return Object.assign(e4, {
    optional: () => k(e4),
    and: (t2) => A(e4, t2),
    or: (t2) => ee(e4, t2),
    select: (t2) => t2 === void 0 ? M(e4) : M(t2, e4)
  });
}
function k(e4) {
  return D({ [y]: () => ({
    match: (t2) => {
      let n2 = {}, r2 = (e5, t3) => {
        n2[e5] = t3;
      };
      return t2 === void 0 ? (T(e4).forEach((e5) => r2(e5, void 0)), {
        matched: true,
        selections: n2
      }) : {
        matched: w(e4, t2, r2),
        selections: n2
      };
    },
    getSelectionKeys: () => T(e4),
    matcherType: "optional"
  }) });
}
function A(...e4) {
  return D({ [y]: () => ({
    match: (t2) => {
      let n2 = {}, r2 = (e5, t3) => {
        n2[e5] = t3;
      };
      return {
        matched: e4.every((e5) => w(e5, t2, r2)),
        selections: n2
      };
    },
    getSelectionKeys: () => E(e4, T),
    matcherType: "and"
  }) });
}
function ee(...e4) {
  return D({ [y]: () => ({
    match: (t2) => {
      let n2 = {}, r2 = (e5, t3) => {
        n2[e5] = t3;
      };
      return E(e4, T).forEach((e5) => r2(e5, void 0)), {
        matched: e4.some((e5) => w(e5, t2, r2)),
        selections: n2
      };
    },
    getSelectionKeys: () => E(e4, T),
    matcherType: "or"
  }) });
}
function j(e4) {
  return { [y]: () => ({ match: (t2) => ({ matched: !!e4(t2) }) }) };
}
function M(...e4) {
  let t2 = typeof e4[0] == "string" ? e4[0] : void 0, n2 = e4.length === 2 ? e4[1] : typeof e4[0] == "string" ? void 0 : e4[0];
  return D({ [y]: () => ({
    match: (e5) => {
      let r2 = { [t2 ?? x]: e5 };
      return {
        matched: n2 === void 0 || w(n2, e5, (e6, t3) => {
          r2[e6] = t3;
        }),
        selections: r2
      };
    },
    getSelectionKeys: () => [t2 ?? x].concat(n2 === void 0 ? [] : T(n2))
  }) });
}
function N(e4) {
  return true;
}
function P(e4) {
  return typeof e4 == "number";
}
function F(e4) {
  return typeof e4 == "string";
}
function I(e4) {
  return typeof e4 == "bigint";
}
D(j(N)), D(j(N));
var L = (e4) => Object.assign(D(e4), {
  startsWith: (t2) => {
    return L(A(e4, (n2 = t2, j((e5) => F(e5) && e5.startsWith(n2)))));
    var n2;
  },
  endsWith: (t2) => {
    return L(A(e4, (n2 = t2, j((e5) => F(e5) && e5.endsWith(n2)))));
    var n2;
  },
  minLength: (t2) => L(A(e4, ((e5) => j((t3) => F(t3) && t3.length >= e5))(t2))),
  length: (t2) => L(A(e4, ((e5) => j((t3) => F(t3) && t3.length === e5))(t2))),
  maxLength: (t2) => L(A(e4, ((e5) => j((t3) => F(t3) && t3.length <= e5))(t2))),
  includes: (t2) => {
    return L(A(e4, (n2 = t2, j((e5) => F(e5) && e5.includes(n2)))));
    var n2;
  },
  regex: (t2) => {
    return L(A(e4, (n2 = t2, j((e5) => F(e5) && !!e5.match(n2)))));
    var n2;
  }
});
L(j(F));
var R = (e4) => Object.assign(D(e4), {
  between: (t2, n2) => R(A(e4, ((e5, t3) => j((n3) => P(n3) && e5 <= n3 && t3 >= n3))(t2, n2))),
  lt: (t2) => R(A(e4, ((e5) => j((t3) => P(t3) && t3 < e5))(t2))),
  gt: (t2) => R(A(e4, ((e5) => j((t3) => P(t3) && t3 > e5))(t2))),
  lte: (t2) => R(A(e4, ((e5) => j((t3) => P(t3) && t3 <= e5))(t2))),
  gte: (t2) => R(A(e4, ((e5) => j((t3) => P(t3) && t3 >= e5))(t2))),
  int: () => R(A(e4, j((e5) => P(e5) && Number.isInteger(e5)))),
  finite: () => R(A(e4, j((e5) => P(e5) && Number.isFinite(e5)))),
  positive: () => R(A(e4, j((e5) => P(e5) && e5 > 0))),
  negative: () => R(A(e4, j((e5) => P(e5) && e5 < 0)))
});
R(j(P));
var z = (e4) => Object.assign(D(e4), {
  between: (t2, n2) => z(A(e4, ((e5, t3) => j((n3) => I(n3) && e5 <= n3 && t3 >= n3))(t2, n2))),
  lt: (t2) => z(A(e4, ((e5) => j((t3) => I(t3) && t3 < e5))(t2))),
  gt: (t2) => z(A(e4, ((e5) => j((t3) => I(t3) && t3 > e5))(t2))),
  lte: (t2) => z(A(e4, ((e5) => j((t3) => I(t3) && t3 <= e5))(t2))),
  gte: (t2) => z(A(e4, ((e5) => j((t3) => I(t3) && t3 >= e5))(t2))),
  positive: () => z(A(e4, j((e5) => I(e5) && e5 > 0))),
  negative: () => z(A(e4, j((e5) => I(e5) && e5 < 0)))
});
z(j(I)), D(j(function(e4) {
  return typeof e4 == "boolean";
})), D(j(function(e4) {
  return typeof e4 == "symbol";
})), D(j(function(e4) {
  return e4 == null;
})), D(j(function(e4) {
  return e4 != null;
}));
var te = class extends Error {
  constructor(e4) {
    let t2;
    try {
      t2 = JSON.stringify(e4);
    } catch {
      t2 = e4;
    }
    super(`Pattern matching error: no pattern matches value ${t2}`), this.input = void 0, this.input = e4;
  }
}, B = {
  matched: false,
  value: void 0
};
function V(e4) {
  return new ne(e4, B);
}
var ne = class e3 {
  constructor(e4, t2) {
    this.input = void 0, this.state = void 0, this.input = e4, this.state = t2;
  }
  with(...t2) {
    if (this.state.matched) return this;
    let n2 = t2[t2.length - 1], r2 = [t2[0]], i2;
    t2.length === 3 && typeof t2[1] == "function" ? i2 = t2[1] : t2.length > 2 && r2.push(...t2.slice(1, t2.length - 1));
    let a2 = false, o2 = {}, s2 = (e4, t3) => {
      a2 = true, o2[e4] = t3;
    }, c2 = !r2.some((e4) => w(e4, this.input, s2)) || i2 && !i2(this.input) ? B : {
      matched: true,
      value: n2(a2 ? x in o2 ? o2[x] : o2 : this.input, this.input)
    };
    return new e3(this.input, c2);
  }
  when(t2, n2) {
    if (this.state.matched) return this;
    let r2 = !!t2(this.input);
    return new e3(this.input, r2 ? {
      matched: true,
      value: n2(this.input, this.input)
    } : B);
  }
  otherwise(e4) {
    return this.state.matched ? this.state.value : e4(this.input);
  }
  exhaustive(e4 = re) {
    return this.state.matched ? this.state.value : e4(this.input);
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
function re(e4) {
  throw new te(e4);
}
function H(e4) {
  return e4.match((e5) => e5, (e5) => {
    throw e5;
  });
}
function K(e4) {
  let t2 = e4?.expectedInputs ?? [{
    type: "text",
    languages: ["en"]
  }], n2 = e4?.expectedOutputs ?? [{
    type: "text",
    languages: ["en"]
  }];
  return new c((async () => {
    if (typeof LanguageModel > "u") return g(/* @__PURE__ */ Error("LanguageModel API is not available in this browser. Ensure you are using Chrome 148+ or a supported Chromium-based browser."));
    let r2 = V(await LanguageModel.availability({
      expectedInputs: t2,
      expectedOutputs: n2
    })).with("unavailable", () => g(/* @__PURE__ */ Error("LanguageModel API is present but the model is unavailable on this device."))).with("downloadable", "downloading", "available", (e5) => h(e5)).exhaustive();
    if (r2.isErr()) return r2;
    if (r2.value !== "available") try {
      (await LanguageModel.create({
        expectedInputs: t2,
        expectedOutputs: n2,
        monitor: e4?.monitor,
        signal: e4?.signal
      })).destroy();
    } catch (e5) {
      return g(/* @__PURE__ */ Error(`Failed to download LanguageModel: ${e5 instanceof Error ? e5.message : String(e5)}`));
    }
    return h({
      prompt: (e5, r3, i2, a2) => ae(t2, n2, e5, r3, i2, a2),
      createSession: (e5) => q(t2, n2, e5),
      withSession: (e5, r3) => J(t2, n2, e5, r3),
      checkTokenUsage: (e5, r3) => ie(t2, n2, e5, r3)
    });
  })());
}
function q(e4, t2, n2) {
  return new c((async () => {
    try {
      let r2 = { ...n2 };
      return !r2.expectedInputs && e4.length > 0 && (r2.expectedInputs = e4), !r2.expectedOutputs && t2.length > 0 && (r2.expectedOutputs = t2), h(await LanguageModel.create(r2));
    } catch (e5) {
      return g(/* @__PURE__ */ Error(`Failed to create AI session: ${e5 instanceof Error ? e5.message : "Unknown error"}`));
    }
  })());
}
function J(e4, t2, n2, r2) {
  return q(e4, t2, r2).andThen((e5) => n2(e5).map((t3) => (e5.destroy(), t3)).mapErr((t3) => (e5.destroy(), t3)));
}
function ie(e4, t2, n2, r2) {
  return J(e4, t2, (e5) => c.fromSafePromise((async () => {
    let t3 = await e5.measureContextUsage(n2), r3 = e5.contextWindow || 0, i2 = e5.contextUsage || 0, a2 = r3 - i2;
    return {
      promptTokens: t3,
      maxTokens: r3,
      tokensSoFar: i2,
      tokensAvailable: a2,
      willFit: t3 <= a2
    };
  })()), r2);
}
function ae(e4, t2, n2, r2, i2, a2) {
  return J(e4, t2, (e5) => {
    let t3 = null;
    return c.fromPromise((async () => {
      try {
        let a3 = i2 || {};
        if (r2 || a3.signal) {
          let e6 = [];
          if (a3.signal && e6.push(a3.signal), r2) {
            let n3 = new AbortController();
            e6.push(n3.signal), t3 = setTimeout(() => n3.abort(), r2);
          }
          e6.length > 1 && AbortSignal.any ? a3 = {
            ...a3,
            signal: AbortSignal.any(e6)
          } : e6.length === 1 && (a3 = {
            ...a3,
            signal: e6[0]
          });
        }
        return await e5.prompt(n2, a3);
      } finally {
        t3 && clearTimeout(t3);
      }
    })(), (e6) => e6 instanceof Error ? e6 : Error(String(e6)));
  }, a2);
}
async function $(e4) {
  let t2 = H(await K(e4));
  return {
    prompt: async (e5, n2, r2, i2) => H(await t2.prompt(e5, n2, r2, i2)),
    createSession: async (e5) => H(await t2.createSession(e5)),
    withSession: async (e5, n2) => H(await t2.withSession((t3) => c.fromPromise(e5(t3), (e6) => e6 instanceof Error ? e6 : Error(String(e6))), n2)),
    checkTokenUsage: async (e5, n2) => H(await t2.checkTokenUsage(e5, n2))
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
let dualBaseSessionPromise = null;
let nextClonePromise = null;
let downloadProgress = null;
const progressPorts = /* @__PURE__ */ new Set();
function logSessionEvent(message) {
  console.debug(`[WriteGooderer offscreen] ${message}`);
}
function emitProgress(p2) {
  downloadProgress = p2;
  for (const port of progressPorts) {
    try {
      port.postMessage({ progress: p2 });
    } catch (err) {
      logSessionEvent(`Progress post failed: ${String(err)}`);
    }
  }
}
async function ensureModel() {
  if (aiInstance) return aiInstance;
  if (aiInstancePromise) return aiInstancePromise;
  let sawProgress = false;
  aiInstancePromise = $({
    monitor(m2) {
      m2.addEventListener("downloadprogress", (e4) => {
        const loaded = e4.loaded;
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
  logSessionEvent("Prewarming dual base session");
  await getDualBaseSessionPromise();
  logSessionEvent("Prewarmed dual base session");
  refillClonePool();
}
function bailIfAborted(session, signal) {
  if (!signal.aborted) return;
  try {
    session.destroy();
  } catch (err) {
    logSessionEvent(`Aborted-clone destroy failed: ${String(err)}`);
  }
  throw new DOMException("Aborted", "AbortError");
}
async function proofread(text, signal) {
  const session = await takeClone();
  bailIfAborted(session, signal);
  try {
    logSessionEvent("Proofread: running instruction");
    const raw = await session.prompt(buildProofreadInstruction(text), {
      responseConstraint: PROOFREAD_SCHEMA,
      signal
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
async function rewrite(text, tone, signal) {
  const session = await takeClone();
  bailIfAborted(session, signal);
  try {
    logSessionEvent(`Rewrite: running instruction for ${tone}`);
    const raw = await session.prompt(buildRewriteInstruction(tone, text), {
      responseConstraint: TONE_REWRITE_SCHEMA,
      signal
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
function handleProofreadPort(port) {
  const abort = new AbortController();
  port.onDisconnect.addListener(() => abort.abort());
  port.onMessage.addListener(async (msg) => {
    if (typeof msg?.text !== "string") return;
    try {
      const result = await proofread(msg.text, abort.signal);
      try {
        port.postMessage({ ok: true, result });
      } catch {
      }
    } catch (err) {
      try {
        port.postMessage({
          ok: false,
          error: err instanceof Error ? err.message : String(err)
        });
      } catch {
      }
    }
  });
}
function handleRewritePort(port) {
  const abort = new AbortController();
  port.onDisconnect.addListener(() => abort.abort());
  port.onMessage.addListener(
    async (msg) => {
      if (typeof msg?.text !== "string" || !msg.tone) return;
      try {
        const result = await rewrite(msg.text, msg.tone, abort.signal);
        try {
          port.postMessage({ ok: true, result });
        } catch {
        }
      } catch (err) {
        try {
          port.postMessage({
            ok: false,
            error: err instanceof Error ? err.message : String(err)
          });
        } catch {
        }
      }
    }
  );
}
function handleProgressPort(port) {
  progressPorts.add(port);
  port.onDisconnect.addListener(() => progressPorts.delete(port));
  try {
    port.postMessage({ progress: downloadProgress });
  } catch {
    progressPorts.delete(port);
  }
}
chrome.runtime.onConnect.addListener((port) => {
  switch (port.name) {
    case "wg/proofread":
      handleProofreadPort(port);
      return;
    case "wg/rewrite":
      handleRewritePort(port);
      return;
    case "wg/download-progress":
      handleProgressPort(port);
      return;
    default:
      return;
  }
});
void prewarmSessions().catch((err) => {
  logSessionEvent(`Initial prewarm failed: ${String(err)}`);
});
