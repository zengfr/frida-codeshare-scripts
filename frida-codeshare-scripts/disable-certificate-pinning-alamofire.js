
//https://github.com/zengfr/frida-codeshare-scripts
//338807679 @maltek/disable-certificate-pinning-alamofire
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function e(e) {
  return e && e.__esModule ? e : {
    default: e
  };
}

function r() {
  var e = Process.getCurrentThreadId(), r = d.get(e);
  return d.delete(e), r;
}

function t(e, r, t, a) {
  if (!r && !t && !a) return {
    callAddr: e
  };
  var n = Memory.alloc(Process.pageSize), i = void 0, s = void 0;
  if ("arm64" === Process.arch ? (i = new Arm64Writer(n), s = "putBlImm") : (i = new ThumbWriter(n), 
  s = "putBlxImm"), r && i.putLdrRegAddress(h.errorRegister, ptr(0)), t && i.putLdrRegAddress(h.selfRegister, t), 
  a) {
    if (!h.indirectResultRegister) throw new Error("only provide the indirect result pointer on platforms with a specific register for it!");
    i.putLdrRegAddress(h.indirectResultRegister, a);
  }
  r ? (i[s](e), "arm64" === Process.arch ? i.putTstRegImm(h.errorRegister, ptr(0)) : i.putCmpRegImm(h.errorRegister, ptr(0)), 
  i.putBCondLabel("ne", "err_case"), i.putRet(), i.putLabel("err_case"), i.putMovRegReg(h.firstArgRegister, h.errorRegister), 
  i.putBImm(v)) : "putBranchAddress" in i ? i.putBranchAddress(e) : (i.putLdrRegAddress(h.intraProcedureScratch, e), 
  i.putBxReg(h.intraProcedureScratch)), i.flush(), i.dispose(), Memory.protect(n, Process.pageSize, "r-x");
  var o = void 0;
  return o = "arm64" === Process.arch ? n : n.or(ptr(1)), {
    callAddr: o,
    _buf: n
  };
}

function a(e) {
  function r(e) {
    return "Existential" === e.kind;
  }
  function t(e, a, n, i, s) {
    a || "Tuple" !== e.kind ? (a = a || r(e), i.push({
      type: e,
      indirect: a,
      ownership: n,
      special: s
    })) : e.tupleElements().forEach(function(e) {
      return t(e.type, a, n, i, s);
    });
  }
  for (var a = [], n = e.getArguments(), i = 0; i < n.length; i++) {
    var s = n[i].inout, o = 0 === i && !1;
    t(n[i].type, s, a, s ? "keep" : "transfer", o ? "self" : null);
  }
  var u = [];
  return t(e.returnType, !1, "return_take", u, null), e.flags.doesThrow && t(Swift._typesByName.get("Swift.Error"), !0, "return_take", u, "error"), 
  {
    args: a,
    rets: u
  };
}

function n(e) {
  function r(e) {
    return Math.pow(2, Math.ceil((0, c.default)(e)));
  }
  function t(e) {
    var t = Math.ceil((0, c.default)(e));
    return r(8 + t - t % 8);
  }
  function a(e, r, t) {
    t.push([ "empty", e, r ]);
  }
  function n(e, r, i) {
    switch (void 0 === i && (i = []), e.kind) {
     case "Class":
     case "ObjCClassWrapper":
     case "ForeignClass":
     case "Metatype":
     case "Existential":
      i.push([ pointer, r, r + Process.pointerSize ]);
      break;

     case "Struct":
      var s = r;
      e.fields().forEach(function(e) {
        var t = r + e.offset;
        s < t && a(s, t, i), e.weak ? (i.push([ pointer, t, t + Process.pointerSize ]), 
        s = t + Process.pointerSize) : (n(e.type, t, i), s = t + e.type.canonicalType.valueWitnessTable.size);
      });
      var o = r + e.canonicalType.valueWitnessTable.size;
      s < o && a(s, offs, i);
      break;

     case "Tuple":
      var l = r;
      e.tupleElements().forEach(function(e) {
        var t = r + e.offset;
        l < t && a(l, t, i), n(e.type, t, i), l = t + e.type.canonicalType.valueWitnessTable.size;
      });
      var p = r + e.canonicalType.valueWitnessTable.size;
      l < p && a(l, offs, i);
      break;

     case "ErrorObject":
     case "ExistentialMetatype":
     case "Function":
      throw new Error("conversion to legal type for types of '" + e.kind + "' not yet implemented");

     case "Optional":
     case "Enum":
      var c = e.nominalType.enum_.getNumPayloadCases(), f = e.nominalType.enum_.getNumEmptyCases(), m = e.canonicalType.valueWitnessTable.size;
      if (0 === c) i.push([ "int" + 8 * m, r, r + m ]); else if (1 === c) {
        var d = e.enumCases()[0].type;
        n(d, r, i);
        var v = d.canonicalType.valueWitnessTable, g = v.extraInhabitantFlags.getNumExtraInhabitants();
        if (g < f) {
          var y = t(f + c), x = r + v.size;
          i.push([ "int" + y, x, x + y ]);
        } else i.push([ "opaque", r, r + m ]);
      } else {
        var b = e.enumCases(), I = b.reduce(function(e, r) {
          return r.type ? Math.max(e, r.type.canonicalType.valueWitnessTable.size) : e;
        }, 0);
        m > I && i.push([ "opaque", r + I, r + m ]);
        for (var T = 0; T < b.length; T++) b[T].type && n(b[T].type, r, i);
        if (f > 1) {
          var k = t(f);
          i.push([ "opaque", r, r + k ]);
        }
      }
      break;

     case "Opaque":
      var w = e.getCType();
      if (void 0 === w) throw new Error("the equivalent C type for type '" + e + "' is not known.");
      "pointer" === w && (w = u), w.startsWith("uint") && (w = w.slice(1)), w.startsWith("int") && parseInt(w.slice(3)) > h.maxInt && (w = "opaque"), 
      container.push([ w, r ]);
      break;

     default:
      throw new Error("type '" + e + "' is of unknown kind '" + e.kind + "'");
    }
  }
  function i() {
    for (var e = {
      empty: new m.default(),
      opaque: new m.default()
    }, r = 0; r < s.length; r++) {
      var t = s[r][0], a = e[t];
      if (void 0 !== a) for (var n = s[r][1]; n < s[r][2]; n++) {
        if (a.has(n)) {
          for (var i = a.get(n), o = Math.min(s[r][1], s[i][1]), u = Math.max(s[r][2], s[i][2]), l = s[i][1]; l < s[i][1]; l++) a.delete(l);
          s[i][1] = o, s[i][2] = u, r = i - 1;
          break;
        }
        a.set(n, r);
      }
    }
  }
  for (var s = [], o = [], u = "int" + 8 * Process.pointerSize, p = 0; p < e.length; p++) e[p].special ? o.push(e[p].special) : e[p].indirect ? s.push([ u, 0, Process.pointerSize ]) : s.push(n(e[p].type, 0));
  i();
  for (var f = new m.default(), d = 0; d < s.length; d++) for (var v = s[d][1]; v < s[d][2]; v++) f.has(v) || f.set(v, []), 
  f.get(v).push(d);
  for (var g = f.entries(), y = Array.isArray(g), x = 0, g = y ? g : (0, l.default)(g); ;) {
    var b;
    if (y) {
      if (x >= g.length) break;
      b = g[x++];
    } else {
      if (x = g.next(), x.done) break;
      b = x.value;
    }
    var I = b, T = (I[0], I[1]);
    if (!(T.length <= 1)) for (var k = 1; k < T.length; k++) {
      var w = s[T[k - 1]], R = s[T[k]];
      w[0] !== R[0] && (w[0] = R[0] = "opaque");
    }
  }
  i();
  for (var P = 0; P < s.length; P++) if ("empty" !== s[P][0] && "opaque" !== s[P][0]) {
    var z = void 0, A = s[P][2] - s[P][1];
    z = s[P][0].startsWith("int") ? Math.min(A, h.maxVoluntaryInt) : A, s[P][1] % z != 0 && (s[P][0] = "opaque");
  }
  i();
  for (var S = 0; S < s.length; S++) {
    var C = s[S][2] - s[S][1];
    s[S][0].startsWith("int") && C <= h.maxVoluntaryInt && (s[S][0] = "opaque");
  }
  i(), i = void 0;
  for (var E = 0; E < s.length; E++) if ("opaque" === s[E][0]) {
    for (var q = s[E][1], M = s[E][2], W = q - q % h.maxVoluntaryInt + h.maxVoluntaryInt; W < M - M % h.maxVoluntaryInt; ) s.push([ "opaque", q, W ]), 
    q = W, W += h.maxVoluntaryInt;
    s[E][1] = q;
  }
  for (var N = new m.default(), V = 0, _ = 0; _ < s.length; _++) if ("opaque" === s[_][0]) {
    var B = s[_][1], L = (B - B % h.maxVoluntaryInt) / h.maxVoluntaryInt;
    N.has(L) || N.set(L, []), N.get(L).push(_), V = Math.max(V, L);
  }
  for (var j = [], O = N.values(), F = Array.isArray(O), Y = 0, O = F ? O : (0, l.default)(O); ;) {
    var D;
    if (F) {
      if (Y >= O.length) break;
      D = O[Y++];
    } else {
      if (Y = O.next(), Y.done) break;
      D = Y.value;
    }
    for (var G = D, H = Number.POSITIVE_INFINITY, J = Number.NEGATIVE_INFINITY, K = G, Q = Array.isArray(K), U = 0, K = Q ? K : (0, 
    l.default)(K); ;) {
      var X;
      if (Q) {
        if (U >= K.length) break;
        X = K[U++];
      } else {
        if (U = K.next(), U.done) break;
        X = U.value;
      }
      var Z = X;
      H = Math.min(s[Z][1], H), J = Math.max(s[Z][2], J);
    }
    j = j.concat(G.slice(1));
    var $ = void 0;
    for ($ = 1; H + $ < J; $ *= 2) ;
    var ee = H & ~($ - 1);
    ee != H && ($ *= 2);
    var re = ee + $;
    s[G[0]] = [ "int" + (8 * $).toString(), ee, re ];
  }
  j.sort().reverse();
  for (var te = j, ae = Array.isArray(te), ne = 0, te = ae ? te : (0, l.default)(te); ;) {
    var ie;
    if (ae) {
      if (ne >= te.length) break;
      ie = te[ne++];
    } else {
      if (ne = te.next(), ne.done) break;
      ie = ne.value;
    }
    var se = ie;
    s.splice(se, 1);
  }
  return s.sort(function(e, r) {
    return e[1] - r[1];
  }), s;
}

function i(e) {
  for (var r = a(e), t = r[0], i = r[1], s = [ t, i ].map(n), u = (s[0], s[1], []), l = [], p = 0; p < method.args.length; p++) {
    var c = toCheck.shift();
    "Tuple" === c.kind ? toCheck = c.elements.map(function(e) {
      return e.type;
    }).concat(toCheck) : l.push(c);
  }
  for (var f = 0; f < params.length; f++) {
    var m = method.args[f].type, d = (getLowering(params[f]), m.canonicalType.valueWitnessTable);
    0 !== d.size && (method.args[f].inout || d.flags.IsNonBitwiseTakable || d.size > CC.maxInlineArgument ? u.push({
      size: Process.pointerSize,
      stride: Process.pointerSize,
      indirect: !0
    }) : u.push({
      size: d.size,
      stride: d.stride,
      indirect: !1
    }));
  }
  for (var v = 0; v < u.length; v++) ;
  var g = "void";
  if (method.returnType) {
    var y = method.returnType.valueWitnessTable;
    if (y.size > CC.maxInlineReturn || y.flags.IsNonPOD) !0, u.unshift({
      size: Process.pointerSize,
      stride: Process.pointerSize,
      indirect: !0
    }); else {
      var x = y.size;
      g = [];
      for (var b = [ 8, 4, 2, 1 ], I = 0; I < b.length; I++) for (var T = b[I]; T <= h.maxVoluntaryInt && x > 0 && x % T == 0; ) g.push("uint" + (8 * T).toString()), 
      x -= T;
    }
  }
  for (var k = (new o.default(), 0); k < params.length; k++) ;
  for (var w = [], R = 0; R < params.length; R++) ;
  return {
    cParams: w,
    lowered: u
  };
}

var s = require("babel-runtime/core-js/set"), o = e(s), u = require("babel-runtime/core-js/get-iterator"), l = e(u), p = require("babel-runtime/core-js/math/log2"), c = e(p), f = require("babel-runtime/core-js/map"), m = e(f), h = void 0;

if ("arm64" === Process.arch && "darwin" === Process.platform) h = {
  selfRegister: "x20",
  errorRegister: "x21",
  indirectResultRegister: "x8",
  maxInlineArgument: 128,
  maxInlineReturn: 4 * Process.pointerSize,
  firstArgRegister: "x0",
  intraProcedureScratch: "x16",
  maxVoluntaryInt: Process.pointerSize,
  maxInt: 8,
  maxIntAlignment: 8
}; else {
  if ("arm" !== Process.arch || "darwin" !== Process.platform) throw new Error("unknown platform");
  h = {
    selfRegister: "r10",
    errorRegister: "r8",
    indirectResultRegister: void 0,
    maxInlineArgument: 64,
    maxInlineReturn: 4 * Process.pointerSize,
    firstArgRegister: "r0",
    intraProcedureScratch: "r12",
    maxVoluntaryInt: Process.pointerSize,
    maxInt: 8,
    maxIntAlignment: 4
  };
}

var d = new m.default(), v = new NativeCallback(function(e) {
  d.set(Process.getCurrentThreadId(), e);
}, "void", [ "pointer" ]);

module.exports = {
  convention: h,
  makeCallTrampoline: t,
  checkTrampolineError: r
};

},{"babel-runtime/core-js/get-iterator":7,"babel-runtime/core-js/map":8,"babel-runtime/core-js/math/log2":9,"babel-runtime/core-js/set":20}],2:[function(require,module,exports){
"use strict";

var e = require("../index");

e.enumerateTypesSync().length;

var t = e._typesByName.get("Alamofire.ServerTrustPolicy"), r = e._typesByName.get("Swift.Optional<_T0>").withGenericParams(t), o = Module.findExportByName(null, "_T09Alamofire24ServerTrustPolicyManagerC06servercD0AA0bcD0OSgSS7forHost_tF");

Interceptor.attach(o, {
  onLeave: function(e) {
    var o = Memory.alloc(3 * Process.pointerSize);
    Memory.writePointer(o, this.context.x0), Memory.writePointer(o.add(Process.pointerSize), this.context.x1), 
    Memory.writePointer(o.add(2 * Process.pointerSize), this.context.x2);
    var n = new r(o);
    if ("some" === r.enumCases()[n.$enumCase].name) {
      console.log(n);
      var i = n.$allocCopy().$enumPayloadCopy();
      i.$setTo(t.enumCases().filter(function(e) {
        return "disableEvaluation" === e.name;
      })[0]), n.$setTo(r.enumCases().filter(function(e) {
        return "some" === e.name;
      })[0], i), i.$destroy(), console.log(n), this.context.x0 = Memory.readPointer(o), 
      this.context.x1 = Memory.readPointer(o.add(Process.pointerSize)), this.context.x2 = Memory.readPointer(o.add(2 * Process.pointerSize));
    }
  }
});

},{"../index":3}],3:[function(require,module,exports){
"use strict";

function e(e) {
  return e && e.__esModule ? e : {
    default: e
  };
}

var t = require("babel-runtime/core-js/object/keys"), n = e(t), i = require("babel-runtime/core-js/set"), o = e(i), r = require("babel-runtime/core-js/array/from"), a = e(r), p = require("babel-runtime/core-js/map"), s = e(p), l = require("./metadata"), u = require("./types"), d = require("./mangling"), f = require("./swift-value"), c = require("./calling-convention").convention, g = void 0, m = null, y = [], w = 8 === Process.pointerSize ? "uint64" : 4 === Process.pointerSize ? "uint32" : "unsupported platform";

g = module.exports = {
  get available() {
    return null !== Module.findBaseAddress("libswiftCore.dylib");
  },
  isSwiftName: function(e) {
    return (e.name || e).startsWith(d.MANGLING_PREFIX);
  },
  _mangled: new s.default(),
  getMangled: function(e) {
    return this._mangled.get(e);
  },
  demangle: function(e) {
    if (!g.isSwiftName(e)) throw new Error("function name '" + e + "' is not a mangled Swift function");
    var t = Memory.allocUtf8String(e), n = this._api.swift_demangle(t, e.length, ptr(0), ptr(0), 0), i = Memory.readUtf8String(n);
    return "free" in this._api && this._api.free(n), this._mangled.set(i, e), i;
  },
  _typesByName: null,
  enumerateTypesSync: function() {
    var e = u.findAllTypes(this._api);
    return this._typesByName = e, (0, a.default)(e.values());
  },
  makeTupleType: function(e, t) {
    if (t.length != e.length) throw new Error("labels array and innerTypes array need the same length!");
    for (var n = t.length ? Memory.alloc(Process.pointerSize * t.length) : ptr(0), i = Memory.allocUtf8String(e.join(" ") + " "), o = 0; o < t.length; o++) Memory.writePointer(n.add(o * Process.pointerSize), t[o].canonicalType._ptr);
    var r = ptr(0), a = this._api.swift_getTupleTypeMetadata(t.length, n, i, r), p = new l.TargetMetadata(a);
    return p.labels.toString === i.toString() && y.push(i), new u.Type(null, p);
  },
  makeFunctionType: function(e, t, n) {
    var i = Memory.alloc(Process.pointerSize * (2 + e.length)), o = ptr(e.length).and(l.TargetFunctionTypeFlags.NumArgumentsMask);
    n && n.doesThrow && (o = o.or(ptr(l.TargetFunctionTypeFlags.ThrowsMask))), n && n.convention && (o = o.or(ptr(l.FunctionMetadataConvention[n.convention] << l.TargetFunctionTypeFlags.ConventionShift))), 
    Memory.writePointer(i, o);
    for (var r = 0; r < e.length; r++) {
      var a = void 0;
      "canonicalType" in e[r] ? a = e[r].canonicalType._ptr : (a = e[r].type.canonicalType._ptr, 
      e[r].inout && (a = a.or(1))), Memory.writePointer(i.add((r + 1) * Process.pointerSize), a);
    }
    null === t && (t = this.makeTupleType([], [])), Memory.writePointer(i.add((e.length + 1) * Process.pointerSize), t.canonicalType._ptr);
    var p = this._api.swift_getFunctionTypeMetadata(i);
    return new u.Type(null, new l.TargetMetadata(p));
  },
  _typeFromCanonical: function(e, t) {
    return new u.Type(null, new l.TargetMetadata(e), t);
  },
  get _api() {
    if (null !== m) return m;
    if (!this.available) return null;
    var e = {};
    return [ {
      module: "libsystem_malloc.dylib",
      functions: {
        free: [ "void", [ "pointer" ] ]
      },
      optionals: {
        free: "leaks don't break functionality"
      }
    }, {
      module: "libmacho.dylib",
      functions: {
        getsectiondata: [ "pointer", [ "pointer", "pointer", "pointer", "pointer" ] ]
      }
    }, {
      module: "libswiftFoundation.dylib",
      functions: {
        _T0SS10FoundationE8EncodingV4utf8ACfau: [ "pointer", [] ],
        _T0s14StringProtocolP10FoundationsAARzSS5IndexVADRtzlE01cA0Says4Int8VGSgSSACE8EncodingV5using_tF: [ "pointer", [ "pointer", "pointer", "pointer" ] ]
      }
    }, {
      module: "CoreFoundation",
      functions: {
        CFGetRetainCount: [ "long", [ "pointer" ] ]
      }
    }, {
      module: "Foundation",
      functions: {
        objc_storeStrong: [ "void", [ "pointer", "pointer" ] ]
      }
    }, {
      module: "libswiftCore.dylib",
      variables: new o.default([ "_T0SSs14StringProtocolsWP", "_T0SSs16TextOutputStreamsWP", "_T0s19_emptyStringStorages6UInt32Vv", "_swift_release" ]),
      functions: {
        swift_demangle: [ "pointer", [ "pointer", w, "pointer", "pointer", "int32" ] ],
        swift_unknownRetain: [ "void", [ "pointer" ] ],
        swift_unknownRelease: [ "void", [ "pointer" ] ],
        swift_bridgeObjectRelease: [ "void", [ "pointer" ] ],
        swift_weakLoadStrong: [ "pointer", [ "pointer" ] ],
        swift_weakAssign: [ "void", [ "pointer", "pointer" ] ],
        swift_weakInit: [ "void", [ "pointer", "pointer" ] ],
        swift_release: [ "void", [ "pointer" ] ],
        swift_retain: [ "void", [ "pointer" ] ],
        swift_allocBox: [ [ "pointer", "pointer" ], [ "pointer" ] ],
        swift_projectBox: [ "pointer", [ "pointer" ] ],
        swift_stringFromUTF8InRawMemory: [ "void", [ "pointer", "pointer", w ] ],
        swift_getTupleTypeMetadata: [ "pointer", [ w, "pointer", "pointer", "pointer" ] ],
        swift_getExistentialMetatypeMetadata: [ "pointer", [ "pointer" ] ],
        swift_getExistentialTypeMetadata: [ "pointer", [ "int8", "pointer", w, "pointer" ] ],
        swift_getObjCClassMetadata: [ "pointer", [ "pointer" ] ],
        swift_getFunctionTypeMetadata: [ "pointer", [ "pointer" ] ],
        swift_getForeignTypeMetadata: [ "pointer", [ "pointer" ] ],
        swift_getMetatypeMetadata: [ "pointer", [ "pointer" ] ],
        swift_getEnumCaseSinglePayload: [ "int", [ "pointer", "pointer", "uint" ] ],
        swift_getEnumCaseMultiPayload: [ "uint", [ "pointer", "pointer" ] ],
        swift_conformsToProtocol: [ "pointer", [ "pointer", "pointer" ] ],
        swift_dynamicCast: [ "bool", [ "pointer", "pointer", "pointer", "pointer", w ] ],
        swift_getDynamicType: [ "pointer", [ "pointer", "pointer", "int8" ] ],
        swift_getTypeByName: [ "pointer", [ "pointer", w ] ],
        swift_getTypeName: [ [ "pointer", "pointer" ], [ "pointer", "uchar" ] ],
        _T0s4dumpxx_q_z2toSSSg4nameSi6indentSi8maxDepthSi0E5Itemsts16TextOutputStreamR_r0_lF: void 0 === c.indirectResultRegister ? [ "void", [ "pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "int", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer" ] ] : [ "void", [ "pointer", "pointer", "pointer", "pointer", "pointer", "int", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer" ] ]
      }
    } ].forEach(function(t) {
      var i = t.functions || {}, r = t.variables || new o.default(), a = t.optionals || {}, p = Module.enumerateExportsSync(t.module).reduce(function(e, t) {
        return e[t.name] = t, e;
      }, {});
      (0, n.default)(i).forEach(function(n) {
        var o = p[n];
        if (void 0 !== o && "function" === o.type) {
          var r = i[n];
          "function" == typeof r ? r.call(e, o.address) : e[n] = new NativeFunction(o.address, r[0], r[1], r[2]);
        } else if (!(n in a)) throw new Error("missing function '" + n + "' in module '" + t.module);
      }), r.forEach(function(n) {
        var i = p[n];
        if (void 0 !== i && "variable" === i.type) e[n] = i.address; else if (!(n in a)) throw new Error("missing variable '" + n + "' in module '" + t.module);
      });
    }), m = e;
  }
};

},{"./calling-convention":1,"./mangling":4,"./metadata":5,"./swift-value":136,"./types":137,"babel-runtime/core-js/array/from":6,"babel-runtime/core-js/map":8,"babel-runtime/core-js/object/keys":15,"babel-runtime/core-js/set":20}],4:[function(require,module,exports){
"use strict";

module.exports = {
  MANGLING_PREFIX: "_T"
};

},{}],5:[function(require,module,exports){
"use strict";

function e(e) {
  return e && e.__esModule ? e : {
    default: e
  };
}

function t(e, t) {
  for (var r = {}, n = (0, B.default)(e), i = Array.isArray(n), o = 0, n = i ? n : (0, 
  W.default)(n); ;) {
    var s;
    if (i) {
      if (o >= n.length) break;
      s = n[o++];
    } else {
      if (o = n.next(), o.done) break;
      s = o.value;
    }
    var a = s, u = a[0], c = a[1];
    r[u] = (t & c) === c;
  }
  return r;
}

function r(e) {
  this._ptr = e;
}

function n(e) {
  this._ptr = e;
}

function i(e) {
  r.call(this, e.add(17 * Process.pointerSize)), this._vwt = e;
}

function o(e) {
  i.call(this, e);
}

function s(e) {
  o.call(this, e);
}

function a(e) {
  this._ptr = e;
}

function u(e, t) {
  var r = 1 << t, n = ~r;
  return function(t) {
    return {
      pointer: new e(t.and(n)),
      flag: !t.and(r).isNull()
    };
  };
}

function c(e) {
  var t = Memory.readS32(e);
  return {
    pointer: e.add(-4 & t),
    intVal: 3 & t
  };
}

function p(e) {
  switch (this._ptr = e, this.kind) {
   case "Class":
    return new d(e);

   case "Struct":
    return new l(e);

   case "Enum":
   case "Optional":
    return new f(e);

   case "Tuple":
    return new b(e);

   case "Function":
    return new m(e);

   case "Existential":
    return new j(e);

   case "Metatype":
    return new M(e);

   case "ObjCClassWrapper":
    return new P(e);

   case "ExistentialMetatype":
    return new v(e);

   case "ForeignClass":
    return new g(e);
  }
}

function d(e) {
  if (this._ptr = e, "Class" !== this.kind) throw new Error("type is not a class type");
}

function l(e) {
  switch (this._ptr = e, this.kind) {
   case "Struct":
    break;

   default:
    throw new Error("type is not a value type");
  }
}

function f(e) {
  switch (this._ptr = e, this.kind) {
   case "Enum":
   case "Optional":
    break;

   default:
    throw new Error("type is not an enum type");
  }
}

function h(e) {
  this._ptr = e;
}

function b(e) {
  if (this._ptr = e, "Tuple" != this.kind) throw new Error("type is not a tuple type");
}

function y(e) {
  this._ptr = e;
}

function m(e) {
  if (this._ptr = e, "Function" != this.kind) throw new Error("type is not a function type");
}

function g(e) {
  if (this._ptr = e, "ForeignClass" != this.kind) throw new Error("type is not a foreign class type");
}

function P(e) {
  if (this._ptr = e, "ObjCClassWrapper" !== this.kind) throw new Error("type is not a ObjC class wrapper type");
}

function w(e) {
  this._val = e;
}

function j(e) {
  if (this._ptr = e, "Existential" != this.kind) throw new Error("type is not a existential type");
}

function v(e) {
  if (this._ptr = e, "ExistentialMetatype" !== this.kind) throw new Error("type is not a metatype");
}

function M(e) {
  if (this._ptr = e, "Metatype" !== this.kind) throw new Error("type is not a metatype");
}

function _(e) {
  if (e.isNull()) return [];
  for (var t = Memory.readPointer(e).toInt32(), r = [], n = 0; n < t; n++) r.push(new S(Memory.readPointer(e.add((n + 1) * Process.pointerSize))));
  return r.arrayLocation = e.add(Process.pointerSize), r;
}

function S(e) {
  this._ptr = e;
}

function T(e) {
  var t = Memory.readS32(e), r = -2 & t, n = e.add(r);
  return 0 == (1 & t) ? n : Memory.readPointer(n);
}

function C(e) {
  var t = Memory.readPointer(e);
  return e.add(t);
}

function O(e, t) {
  var r = Memory.readS32(e);
  return t && 0 === r ? null : e.add(r);
}

function z(e) {
  this._ptr = e;
}

function N(e) {
  this._record = e;
}

function E(e) {
  this._ptr = e;
}

function D(e) {
  this._ptr = e;
}

function U(e) {
  this._ptr = e;
}

var k = require("babel-runtime/core-js/math/log2"), q = e(k), F = require("babel-runtime/core-js/object/create"), I = e(F), A = require("babel-runtime/core-js/get-iterator"), W = e(A), K = require("babel-runtime/core-js/object/entries"), B = e(K), x = require("./mangling"), G = {
  AlignmentMask: 65535,
  IsNonPOD: 65536,
  IsNonInline: 131072,
  HasExtraInhabitants: 262144,
  HasSpareBits: 524288,
  IsNonBitwiseTakable: 1048576,
  HasEnumWitnesses: 2097152
};

r.prototype = {
  get size() {
    return Memory.readPointer(this._ptr.add(0));
  },
  get flags() {
    return t(G, Memory.readPointer(this._ptr.add(Process.pointerSize)).toInt32());
  },
  get stride() {
    return Memory.readPointer(this._ptr.add(2 * Process.pointerSize));
  },
  get extraInhabitantFlags() {
    return this.flags.HasExtraInhabitants ? new n(this._ptr.add(3 * Process.pointerSize)) : 0;
  }
}, n.NumExtraInhabitantsMask = 2147483647, n.prototype = {
  get data() {
    return Memory.readPointer(this._ptr);
  },
  getNumExtraInhabitants: function() {
    return this.data & n.NumExtraInhabitantsMask;
  }
}, i.prototype = (0, I.default)(r.prototype, {
  destroyBuffer: {
    value: function(e, t) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(0)), "void", [ "pointer", "pointer" ])(e, t);
    },
    enumerable: !0
  },
  initializeBufferWithCopyOfBuffer: {
    value: function(e, t, r) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(1 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer" ])(e, t, r);
    },
    enumerable: !0
  },
  projectBuffer: {
    value: function(e, t) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(2 * Process.pointerSize)), "pointer", [ "pointer", "pointer" ])(e, t);
    },
    enumerable: !0
  },
  deallocateBuffer: {
    value: function(e, t) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(3 * Process.pointerSize)), "void", [ "pointer", "pointer" ])(e, t);
    },
    enumerable: !0
  },
  destroy: {
    value: function(e, t) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(4 * Process.pointerSize)), "void", [ "pointer", "pointer" ])(e, t);
    },
    enumerable: !0
  },
  initializeBufferWithCopy: {
    value: function(e, t, r) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(5 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer" ])(e, t, r);
    },
    enumerable: !0
  },
  initializeWithCopy: {
    value: function(e, t, r) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(6 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer" ])(e, t, r);
    },
    enumerable: !0
  },
  assignWithCopy: {
    value: function(e, t, r) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(7 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer" ])(e, t, r);
    },
    enumerable: !0
  },
  initializeBufferWithTake: {
    value: function(e, t, r) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(8 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer" ])(e, t, r);
    },
    enumerable: !0
  },
  initializeWithTake: {
    value: function(e, t, r) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(9 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer" ])(e, t, r);
    },
    enumerable: !0
  },
  assignWithTake: {
    value: function(e, t, r) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(10 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer" ])(e, t, r);
    },
    enumerable: !0
  },
  allocateBuffer: {
    value: function(e, t) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(11 * Process.pointerSize)), "pointer", [ "pointer", "pointer" ])(e, t);
    },
    enumerable: !0
  },
  initializeBufferWithTakeOfBuffer: {
    value: function(e, t, r) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(12 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer" ])(e, t, r);
    },
    enumerable: !0
  },
  destroyArray: {
    value: function(e, t, r) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(13 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer" ])(e, t, r);
    },
    enumerable: !0
  },
  initializeArrayWithCopy: {
    value: function(e, t, r, n) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(14 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer", "pointer" ])(e, t, r, n);
    },
    enumerable: !0
  },
  initializeArrayWithTakeFrontToBack: {
    value: function(e, t, r, n) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(15 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer", "pointer" ])(e, t, r, n);
    },
    enumerable: !0
  },
  initializeArrayWithTakeBackToFront: {
    value: function(e, t, r, n) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(16 * Process.pointerSize)), "pointer", [ "pointer", "pointer", "pointer", "pointer" ])(e, t, r, n);
    },
    enumerable: !0
  },
  isValueInline: {
    get: function() {
      return !this.flags.IsNonInline;
    },
    enumerable: !0
  }
}), o.prototype = (0, I.default)(i.prototype, {
  storeExtraInhabitant: {
    value: function(e, t, r) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(21 * Process.pointerSize)), "void", [ "pointer", "int", "pointer" ])(e, t, r);
    },
    enumerable: !0
  },
  getExtraInhabitant: {
    value: function(e, t) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(22 * Process.pointerSize)), "int", [ "pointer", "pointer" ])(e, t);
    },
    enumerable: !0
  }
}), s.prototype = (0, I.default)(o.prototype, {
  getEnumTag: {
    value: function(e, t) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(23 * Process.pointerSize)), "int", [ "pointer", "pointer" ])(e, t);
    },
    enumerable: !0
  },
  destructiveProjectEnumData: {
    value: function(e, t) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(24 * Process.pointerSize)), "void", [ "pointer", "pointer" ])(e, t);
    },
    enumerable: !0
  },
  destructiveInjectEnumTag: {
    value: function(e, t, r) {
      return new NativeFunction(Memory.readPointer(this._vwt.add(25 * Process.pointerSize)), "void", [ "pointer", "int", "pointer" ])(e, t, r);
    },
    enumerable: !0
  }
}), a.prototype = {
  get protocol() {
    return new S(T(this._ptr.add(0)));
  },
  get directType() {
    return T(this._ptr.add(4));
  },
  get indirectClass() {
    return T(this._ptr.add(4));
  },
  get typeDescriptor() {
    return T(this._ptr.add(4));
  },
  get witnessTable() {
    return RelativeDirectPointer(this._ptr.add(8));
  },
  get witnessTableAccessor() {
    return RelativeDirectPointer(this._ptr.add(8));
  },
  get flags() {
    return Memory.readU32(this._ptr.add(12));
  },
  getTypeKind: function() {
    return (15 & this.flags) >>> 0;
  },
  getConformanceKind: function() {
    return (16 & this.flags) >>> 4;
  },
  getDirectType: function() {
    switch (this.getTypeKind()) {
     case V.Universal:
      return null;

     case V.UniqueDirectType:
     case V.NonuniqueDirectType:
      break;

     case V.UniqueDirectClass:
     case V.UniqueIndirectClass:
     case V.UniqueNominalTypeDescriptor:
      throw new Error("not direct type metadata");
    }
    return new p(this.directType);
  },
  getDirectClass: function() {
    switch (this.getTypeKind()) {
     case V.Universal:
      return null;

     case V.UniqueDirectClass:
      break;

     case V.UniqueDirectType:
     case V.NonuniqueDirectType:
     case V.UniqueNominalTypeDescriptor:
     case V.UniqueIndirectClass:
      throw new Error("not direct class object");
    }
    return this.directType;
  },
  getIndirectClass: function() {
    switch (this.getTypeKind()) {
     case V.Universal:
      return null;

     case V.UniqueIndirectClass:
      break;

     case V.UniqueDirectType:
     case V.UniqueDirectClass:
     case V.NonuniqueDirectType:
     case V.UniqueNominalTypeDescriptor:
      throw new Error("not indirect class object");
    }
    return this.indirectClass;
  },
  getNominalTypeDescriptor: function() {
    switch (this.getTypeKind()) {
     case V.Universal:
      return null;

     case V.UniqueNominalTypeDescriptor:
      break;

     case V.UniqueDirectClass:
     case V.UniqueIndirectClass:
     case V.UniqueDirectType:
     case V.NonuniqueDirectType:
      throw new Error("not generic metadata pattern");
    }
    return new z(this.typeDescriptor);
  },
  getStaticWitnessTable: function() {
    switch (this.getConformanceKind()) {
     case R.WitnessTable:
      break;

     case R.WitnessTableAccessor:
      throw new Error("no witness table");
    }
    return this.witnessTable;
  },
  getWitnessTableAccessor: function() {
    switch (this.getConformanceKind()) {
     case R.WitnessTableAccessor:
      break;

     case R.WitnessTable:
      throw new Error("not witness table accessor");
    }
    return new NativeFunction(this.witnessTableAccessor, "pointer", [ "pointer" ]);
  },
  getCanonicalTypeMetadata: function(e) {
    var t = null;
    switch (this.getTypeKind()) {
     case V.UniqueDirectType:
      return this.getDirectType();

     case V.NonuniqueDirectType:
      return new p(e.swift_getForeignTypeMetadata(this.getDirectType()._ptr));

     case V.UniqueIndirectClass:
      t = Memory.readPointer(this.getIndirectClass());
      break;

     case V.UniqueDirectClass:
      t = this.getDirectClass();
      break;

     case V.UniqueNominalTypeDescriptor:
     case V.Universal:
      return null;
    }
    return null === t || t.isNull() ? null : new p(e.swift_getObjCClassMetadata(t));
  },
  getWitnessTable: function(e) {
    switch (this.getConformanceKind()) {
     case R.WitnessTable:
      return this.getStaticWitnessTable();

     case R.WitnessTableAccessor:
      return this.getWitnessTableAccessor()(this.type);
    }
  }
};

var R = {
  WitnessTable: 0,
  WitnessTableAccessor: 1
}, H = {
  Indirect: 1,
  Weak: 2,
  typeMask: 3
}, V = {
  Universal: 0,
  UniqueDirectType: 1,
  NonuniqueDirectType: 2,
  UniqueIndirectClass: 3,
  UniqueNominalTypeDescriptor: 4,
  UniqueDirectClass: 15
}, L = u(p, 0), X = {
  "0": "Class",
  "1": "Struct",
  "2": "Enum",
  "3": "Optional"
}, J = {
  "0": "Class",
  "1": "Struct",
  "2": "Enum",
  "3": "Optional",
  "8": "Opaque",
  "9": "Tuple",
  "10": "Function",
  "12": "Existential",
  "13": "Metatype",
  "14": "ObjCClassWrapper",
  "15": "ExistentialMetatype",
  "16": "ForeignClass",
  "64": "HeapLocalVariable",
  "65": "HeapGenericLocalVariable",
  "128": "ErrorObject"
};

p.prototype = {
  get valueWitnessTable() {
    return new i(Memory.readPointer(this._ptr.sub(Process.pointerSize)));
  },
  get kind() {
    var e = Memory.readPointer(this._ptr);
    return e.compare(ptr(4096)) >= 0 ? "Class" : J[e.toInt32().toString()];
  },
  getNominalTypeDescriptor: function() {
    return null;
  },
  toString: function() {
    return "[TargetMetadata: " + this.kind + "@" + this._ptr + "]";
  }
};

var Q = {
  IsSwift1: 1,
  UsesSwift1Refcounting: 2,
  HasCustomObjCName: 4
};

d.prototype = (0, I.default)(p.prototype, {
  destructor: {
    get: function() {
      if (this.isPureObjC()) throw new Error("destructor not available for ObjC classes");
      return Memory.readPointer(this._ptr.sub(2 * Process.pointerSize));
    },
    enumerable: !0
  },
  valueWitnessTable: {
    get: function() {
      if (this.isPureObjC()) throw new Error("valueWitnessTable not available for ObjC classes");
      return new i(Memory.readPointer(this._ptr.sub(Process.pointerSize)));
    },
    enumerable: !0
  },
  isa: {
    get: function() {
      var e = Memory.readPointer(this._ptr);
      return e.compare(ptr(4096)) <= 0 ? null : e;
    },
    enumerable: !0
  },
  superClass: {
    get: function() {
      if (this.isPureObjC()) return null;
      var e = Memory.readPointer(this._ptr.add(Process.pointerSize));
      return e.isNull() ? null : new d(e);
    },
    enumerable: !0
  },
  cacheData: {
    get: function() {
      return [ Memory.readPointer(this._ptr.add(2 * Process.pointerSize)), Memory.readPointer(this._ptr.add(3 * Process.pointerSize)) ];
    },
    enumerable: !0
  },
  data: {
    get: function() {
      return Memory.readPointer(this._ptr.add(4 * Process.pointerSize));
    },
    enumerable: !0
  },
  flags: {
    get: function() {
      if (this.isPureObjC()) throw new Error("flags not available for ObjC classes");
      return t(Q, Memory.readU32(this._ptr.add(5 * Process.pointerSize)));
    },
    enumerable: !0
  },
  instanceAddressPoint: {
    get: function() {
      if (this.isPureObjC()) throw new Error("instanceAddressPoint not available for ObjC classes");
      return Memory.readU32(this._ptr.add(4 + 5 * Process.pointerSize));
    },
    enumerable: !0
  },
  instanceSize: {
    get: function() {
      if (this.isPureObjC()) throw new Error("instanceSize not available for ObjC classes");
      return Memory.readU32(this._ptr.add(8 + 5 * Process.pointerSize));
    },
    enumerable: !0
  },
  instanceAlignMask: {
    get: function() {
      if (this.isPureObjC()) throw new Error("instanceAlignMask not available for ObjC classes");
      return Memory.readU16(this._ptr.add(12 + 5 * Process.pointerSize));
    },
    enumerable: !0
  },
  classSize: {
    get: function() {
      if (this.isPureObjC()) throw new Error("classSize not available for ObjC classes");
      return Memory.readU32(this._ptr.add(16 + 5 * Process.pointerSize));
    },
    enumerable: !0
  },
  classAddressPoint: {
    get: function() {
      if (this.isPureObjC()) throw new Error("classAddressPoint not available for ObjC classes");
      return Memory.readU32(this._ptr.add(20 + 5 * Process.pointerSize));
    },
    enumerable: !0
  },
  description: {
    get: function() {
      if (this.isPureObjC()) throw new Error("description not available for ObjC classes");
      return C(this._ptr.add(24 + 5 * Process.pointerSize));
    },
    enumerable: !0
  },
  iVarDestroyer: {
    get: function() {
      if (this.isPureObjC()) throw new Error("iVarDestroyer not available for ObjC classes");
      return new NativePointer(Memory.readPointer(this._ptr.add(24 + 6 * Process.pointerSize)), "void", [ "pointer" ]);
    },
    enumerable: !0
  },
  isTypeMetadata: {
    value: function() {
      return this.data.and(ptr(1)).equals(ptr(1));
    },
    enumerable: !0
  },
  isPureObjC: {
    value: function() {
      return !this.isTypeMetadata();
    },
    enumerable: !0
  },
  isArtificialSubclass: {
    value: function() {
      return 0 === this.description.compare(int64(0));
    },
    enumerable: !0
  },
  getDescription: {
    value: function() {
      if (!this.isTypeMetadata()) throw new Error("assertion error");
      if (this.isArtificialSubclass()) throw new Error("assertion error");
      return this.description;
    },
    enumerable: !0
  },
  getNominalTypeDescriptor: {
    value: function() {
      return this.isTypeMetadata() && !this.isArtificialSubclass() ? new z(this.getDescription()) : null;
    },
    enumerable: !0
  },
  getParentType: {
    value: function(e) {
      var t = e.genericParams;
      return t.flags.HasParent ? new p(this._ptr.add((t.offset - 1) * Process.pointerSize)) : null;
    },
    enumerable: !0
  },
  getGenericArgs: {
    value: function() {
      return this.isPureObjC() ? [] : this.getNominalTypeDescriptor().getGenericArgs(this);
    },
    enumerable: !0
  }
}), l.prototype = (0, I.default)(p.prototype, {
  description: {
    get: function() {
      var e = C(this._ptr.add(Process.pointerSize));
      return e.isNull() ? null : e;
    },
    enumerable: !0
  },
  getGenericArgs: {
    value: function() {
      return this.getNominalTypeDescriptor().getGenericArgs(this);
    },
    enumerable: !0
  },
  getNominalTypeDescriptor: {
    value: function() {
      return this.description.isNull() ? null : new z(this.description);
    },
    enumerable: !0
  }
}), f.prototype = (0, I.default)(l.prototype, {
  valueWitnessTable: {
    get: function() {
      return new s(Memory.readPointer(this._ptr.sub(Process.pointerSize)));
    },
    enumerable: !0
  },
  payloadSize: {
    get: function() {
      var e = this.getNominalTypeDescriptor();
      return e.enum_.hasPayloadSizeOffset() ? Memory.readPointer(this._ptr.add(e.enum_.getPayloadSizeOffset() * Process.pointerSize)) : null;
    },
    enumerable: !0
  }
}), h.prototype = {
  get createFunction() {
    return new NativeFunction(Memory.readPointer(this._ptr.add(0)), "pointer", [ "pointer", "pointer" ]);
  },
  get metadataSize() {
    return Memory.readU32(this._ptr.add(0 + Process.pointerSize));
  },
  get numKeyArguments() {
    return Memory.readU16(this._ptr.add(4 + Process.pointerSize));
  },
  get addressPoint() {
    return Memory.readU16(this._ptr.add(6 + Process.pointerSize));
  },
  get privateData() {
    return Memory.readByteArray(this._ptr.add(8 + Process.pointerSize), 16 * Process.pointerSize);
  },
  getMetadataTemplate: function() {
    return this._ptr.add(8 + 17 * Process.pointerSize);
  },
  _getMetadata: function() {
    return new p(this.getMetadataTemplate().add(this.addressPoint));
  },
  getTemplateDescription: function() {
    return new p(this.getMetadataTemplate().add(this.addressPoint)).getNominalTypeDescriptor();
  }
}, b.prototype = (0, I.default)(p.prototype, {
  numElements: {
    get: function() {
      return uint64(Memory.readPointer(this._ptr.add(Process.pointerSize)).toString());
    },
    enumerable: !0
  },
  labels: {
    get: function() {
      return Memory.readPointer(this._ptr.add(2 * Process.pointerSize));
    },
    enumerable: !0
  },
  elements: {
    get: function() {
      for (var e = [], t = 2 * Process.pointerSize, r = 0; r < this.numElements; r++) e.push(new y(this._ptr.add(3 * Process.pointerSize + r * t)));
      return e;
    },
    enumerable: !0
  }
}), y.prototype = {
  get type() {
    return new p(Memory.readPointer(this._ptr));
  },
  get offset() {
    return Memory.readPointer(this._ptr.add(Process.pointerSize)).toInt32();
  }
}, m.prototype = (0, I.default)(p.prototype, {
  flags: {
    get: function() {
      var e = Memory.readPointer(this._ptr.add(Process.pointerSize));
      return {
        numArguments: e.and($.NumArgumentsMask).toInt32(),
        convention: e.and($.ConventionMask).shr($.ConventionShift).toInt32(),
        doesThrow: !e.and($.ThrowsMask).isNull()
      };
    },
    enumerable: !0
  },
  resultType: {
    get: function() {
      return new p(Memory.readPointer(this._ptr.add(2 * Process.pointerSize)));
    },
    enumerable: !0
  },
  getArguments: {
    value: function() {
      for (var e = this.flags.numArguments, t = [], r = this._ptr.add(3 * Process.pointerSize), n = 0; n < e; n++) {
        var i = new L(Memory.readPointer(r.add(n * Process.pointerSize)));
        t.push({
          inout: i.flag,
          type: i.pointer
        });
      }
      return t;
    },
    enumerable: !0
  }
});

var Y = {
  HasInitializationFunction: 1
};

g.prototype = (0, I.default)(p.prototype, {
  flags: {
    get: function() {
      return t(Y, Memory.readPointer(this._ptr.sub(2 * Process.pointerSize)));
    },
    enumerable: !0
  },
  unique: {
    get: function() {
      return Memory.readPointer(this._ptr.sub(3 * Process.pointerSize));
    },
    enumerable: !0
  },
  name: {
    get: function() {
      return Memory.readUtf8String(Memory.readPointer(this._ptr.sub(4 * Process.pointerSize)));
    },
    enumerable: !0
  },
  initializationFunction: {
    get: function() {
      return new NativeFunction(Memory.readPointer(this._ptr.sub(5 * Process.pointerSize)), "void", [ "pointer" ]);
    },
    enumerable: !0
  }
}), P.prototype = (0, I.default)(p.prototype, {
  class_: {
    get: function() {
      return Memory.readPointer(this._ptr.add(Process.pointerSize));
    },
    enumerable: !0
  }
}), w.prototype = {
  NumWitnessTablesMask: 16777215,
  ClassConstraintMask: 2147483648,
  HasSuperclassMask: 1073741824,
  SpecialProtocolMask: 1056964608,
  SpecialProtocolShift: 24,
  getNumWitnessTables: function() {
    return this._val & this.NumWitnessTablesMask;
  },
  getClassConstraint: function() {
    return this._val & this.ClassConstraintMask ? "Any" : "Class";
  },
  hasSuperclassConstraint: function() {
    return !!(this._val & this.HasSuperclassMask);
  },
  getSpecialProtocol: function() {
    return [ "None", "Error" ][(this._val & this.SpecialProtocolMask) >> this.SpecialProtocolShift];
  }
}, j.prototype = (0, I.default)(p.prototype, {
  flags: {
    get: function() {
      return new w(Memory.readPointer(this._ptr.add(Process.pointerSize)));
    },
    enumerable: !0
  },
  protocols: {
    get: function() {
      return new _(this._ptr.add(2 * Process.pointerSize));
    },
    enumerable: !0
  },
  getRepresentation: {
    value: function() {
      switch (this.flags.getSpecialProtocol()) {
       case "Error":
        return "Error";
      }
      return this.isClassBounded() ? "Class" : "Opaque";
    },
    enumerable: !0
  },
  isObjC: {
    value: function() {
      return this.isClassBounded() && 0 == this.flags.getNumWitnessTables();
    },
    enumerable: !0
  },
  isClassBounded: {
    value: function() {
      return "Class" == this.flags.getClassConstraint();
    },
    enumerable: !0
  },
  getSuperclassConstraint: {
    value: function() {
      if (this.isObjC() || !this.flags.hasSuperclassConstraint()) return null;
      var e = this._ptr.add(Process.pointerSize * (3 + this.protocols.length));
      return new p(Memory.readPointer(e));
    },
    enumerable: !0
  }
}), v.prototype = (0, I.default)(p.prototype, {
  instanceType: {
    get: function() {
      return new p(Memory.readPointer(this._ptr.add(Process.pointerSize)));
    },
    enumerable: !0
  },
  flags: {
    get: function() {
      return new w(Memory.readPointer(this._ptr.add(2 * Process.pointerSize)));
    },
    enumerable: !0
  },
  isObjC: {
    value: function() {
      return this.isClassBounded() && 0 == this.flags.getNumWitnessTables();
    },
    enumerable: !0
  },
  isClassBounded: {
    value: function() {
      return "Class" == this.flags.getClassConstraint();
    },
    enumerable: !0
  }
}), M.prototype = (0, I.default)(p.prototype, {
  instanceType: {
    get: function() {
      return new p(Memory.readPointer(this._ptr.add(Process.pointerSize)));
    },
    enumerable: !0
  }
}), S.prototype = {
  get _ObjC_Isa() {
    return Memory.readPointer(this._ptr.add(0));
  },
  get name() {
    return Memory.readUtf8String(Memory.readPointer(this._ptr.add(Process.pointerSize)));
  },
  get inheritedProtocols() {
    return new _(Memory.readPointer(this._ptr.add(2 * Process.pointerSize)));
  },
  get _ObjC_InstanceMethods() {
    return Memory.readPointer(this._ptr.add(3 * Process.pointerSize));
  },
  get _ObjC_ClassMethods() {
    return Memory.readPointer(this._ptr.add(4 * Process.pointerSize));
  },
  get _ObjC_OptionalInstanceMethods() {
    return Memory.readPointer(this._ptr.add(5 * Process.pointerSize));
  },
  get _ObjC_OptionalClassMethods() {
    return Memory.readPointer(this._ptr.add(6 * Process.pointerSize));
  },
  get _ObjC_InstanceProperties() {
    return Memory.readPointer(this._ptr.add(7 * Process.pointerSize));
  },
  get descriptorSize() {
    return Memory.readU32(this._ptr.add(8 * Process.pointerSize));
  },
  get flags() {
    return t(Z, Memory.readU32(this._ptr.add(8 * Process.pointerSize + 4)));
  },
  get minimumWitnessTableSizeInWords() {
    if (!this.flags.IsResilient) throw new Error("minimum witness table size not known!");
    return Memory.readU16(this._ptr.add(8 * Process.pointerSize + 8));
  },
  get defaultWitnessTableSizeInWords() {
    if (!this.flags.IsResilient) throw new Error("default witness table size not known!");
    return Memory.readU16(this._ptr.add(8 * Process.pointerSize + 8));
  },
  get reserved() {
    return Memory.readU32(this._ptr.add(8 * Process.pointerSize + 12));
  },
  getDefaultWitnesses: function() {
    if (!this.flags.IsResilient) throw new Error("default witness table not known!");
    return this._ptr.add(8 * Process.pointerSize + 16);
  }
};

var Z = {
  IsSwift: 1,
  ClassConstraint: 2,
  DispatchStrategyMask: 60,
  DispatchStrategyShift: 2,
  SpecialProtocolMask: 960,
  SpecialProtocolShift: 6,
  IsResilient: 1024,
  _ObjCReserved: 4294901760
}, $ = {
  NumArgumentsMask: 16777215,
  ConventionMask: 251658240,
  ConventionShift: 24,
  ThrowsMask: 268435456
}, ee = {
  Swift: 0,
  Block: 1,
  Thin: 2,
  CFunctionPointer: 3
}, te = [ "swift", "block", "thin", "c" ], re = {
  HasParent: 1,
  HasGenericParent: 2
};

z.prototype = {
  get mangledName() {
    var e = O(this._ptr, !0);
    return x.MANGLING_PREFIX + "0" + Memory.readUtf8String(e);
  },
  get clas() {
    if ("Class" !== this.getKind() && "Struct" !== this.getKind()) throw new Error("this nominal type descriptor has no class or struct metadata");
    var e = this._ptr.add(4);
    return {
      _ptr: e,
      get numFields() {
        return Memory.readU32(e.add(0));
      },
      get fieldOffsetVectorOffset() {
        return Memory.readU32(e.add(4));
      },
      get fieldNames() {
        return O(e.add(8), !0);
      },
      get getFieldTypes() {
        return O(e.add(12), !0);
      },
      hasFieldOffsetVector: function() {
        return 0 !== this.fieldOffsetVectorOffset;
      }
    };
  },
  get struct() {
    if ("Struct" !== this.getKind()) throw new Error("this nominal type descriptor has no enum metadata");
    return this.clas;
  },
  get enum_() {
    var e = this._ptr.add(4);
    if ("Enum" !== this.getKind() && "Optional" !== this.getKind()) throw new Error("this nominal type descriptor has no enum metadata");
    return {
      get numPayloadCasesAndPayloadSizeOffset() {
        return Memory.readU32(e.add(0));
      },
      get numEmptyCases() {
        return Memory.readU32(e.add(4));
      },
      get caseNames() {
        return O(e.add(8), !0);
      },
      get getCaseTypes() {
        return O(e.add(12), !0);
      },
      getNumPayloadCases: function() {
        return 16777215 & this.numPayloadCasesAndPayloadSizeOffset;
      },
      getNumCases: function() {
        return this.getNumPayloadCases() + this.numEmptyCases;
      },
      getPayloadSizeOffset: function() {
        return (4278190080 & this.numPayloadCasesAndPayloadSizeOffset) >> 24;
      },
      hasPayloadSizeOffset: function() {
        return 0 !== this.getPayloadSizeOffset();
      }
    };
  },
  get genericMetadataPatternAndKind() {
    return c(this._ptr.add(20));
  },
  get accessFunction() {
    return O(this._ptr.add(24), !0);
  },
  getGenericMetadataPattern: function() {
    return new h(this.genericMetadataPatternAndKind.pointer);
  },
  getKind: function() {
    return X[this.genericMetadataPatternAndKind.intVal];
  },
  get genericParams() {
    var e = this._ptr.add(28);
    return {
      get offset() {
        if (!this.isGeneric()) throw new Error("not generic!");
        return Memory.readU32(e.add(0));
      },
      get numGenericRequirements() {
        return Memory.readU32(e.add(4));
      },
      get numPrimaryParams() {
        return Memory.readU32(e.add(8));
      },
      get flags() {
        return t(re, Memory.readU32(e.add(12)));
      },
      hasGenericRequirements: function() {
        return this.numGenericRequirements > 0;
      },
      isGeneric: function() {
        return this.hasGenericRequirements() || this.flags.HasGenericParent;
      }
    };
  },
  toString: function() {
    return "[TargetNominalType@" + this._ptr + ": " + this.mangledName + "]";
  },
  getGenericArgs: function(e) {
    var t = this.genericParams, r = [];
    if (t.hasGenericRequirements()) for (var n = t.offset << (0, q.default)(Process.pointerSize), i = 0; i < t.numPrimaryParams; i++) {
      var o = Memory.readPointer(e._ptr.add(n));
      o.isNull() ? r.push(null) : r.push(new p(o)), n += Process.pointerSize;
    }
    return r;
  }
}, N.prototype = {
  get _directType() {
    return O(this._record, !0);
  },
  get _typeDescriptor() {
    return O(this._record, !0);
  },
  get _flags() {
    return Memory.readUInt(this._record.add(4));
  },
  getTypeKind: function() {
    return (15 & this._flags) >>> 0;
  },
  getDirectType: function() {
    switch (this.getTypeKind()) {
     case V.Universal:
      return null;

     case V.UniqueDirectType:
     case V.NonuniqueDirectType:
     case V.UniqueDirectClass:
      break;

     case V.UniqueIndirectClass:
     case V.UniqueNominalTypeDescriptor:
      throw new Error("not direct type metadata");

     default:
      throw new Error("invalid type kind");
    }
    return this._directType;
  },
  getNominalTypeDescriptor: function() {
    switch (this.getTypeKind()) {
     case V.Universal:
      return null;

     case V.UniqueNominalTypeDescriptor:
      break;

     case V.UniqueDirectClass:
     case V.UniqueIndirectClass:
     case V.UniqueDirectType:
     case V.NonuniqueDirectType:
      throw new Error("not generic metadata pattern");

     default:
      throw new Error("invalid type kind");
    }
    return new z(this._typeDescriptor);
  },
  getCanonicalTypeMetadata: function(e) {
    var t = null;
    switch (this.getTypeKind()) {
     case V.UniqueDirectType:
      t = this.getDirectType();
      break;

     case V.NonuniqueDirectType:
      t = e.swift_getForeignTypeMetadata(this.getDirectType());
      break;

     case V.UniqueDirectClass:
      var r = this.getDirectType();
      r && (t = e.swift_getObjCClassMetadata(r));
    }
    return null === t ? null : new p(t);
  }
}, E.prototype = {
  get fixedSizeBuffer0() {
    return Memory.readPointer(this._ptr.add(0));
  },
  set fixedSizeBuffer0(e) {
    Memory.writePointer(this._ptr.add(0), e);
  },
  get heapObject() {
    return new U(this.fixedSizeBuffer0);
  },
  get fixedSizeBuffer1() {
    return Memory.readPointer(this._ptr.add(Process.pointerSize));
  },
  get fixedSizeBuffer2() {
    return Memory.readPointer(this._ptr.add(2 * Process.pointerSize));
  },
  get type() {
    return new p(Memory.readPointer(this._ptr.add(3 * Process.pointerSize)));
  },
  set type(e) {
    Memory.writePointer(this._ptr.add(3 * Process.pointerSize), e._ptr);
  },
  getWitnessTable: function(e) {
    return Memory.readPointer(this._ptr.add((4 + e) * Process.pointerSize));
  },
  setWitnessTable: function(e, t) {
    return Memory.writePointer(this._ptr.add((4 + e) * Process.pointerSize), t);
  }
}, D.prototype = {
  get heapObject() {
    return new U(Memory.readPointer(this._ptr.add(0)));
  },
  getWitnessTable: function(e) {
    return Memory.readPointer(this._ptr.add((1 + e) * Process.pointerSize));
  }
}, U.prototype = {
  get heapMetadata() {
    return new p(Memory.readPointer(this._ptr.add(0)));
  }
};

var ne = {
  Class: 0,
  Any: 1
};

module.exports = {
  TargetMetadata: p,
  TargetClassMetadata: d,
  TargetProtocolConformanceRecord: a,
  TargetTypeMetadataRecord: N,
  TargetNominalTypeDescriptor: z,
  TargetFunctionTypeFlags: $,
  NominalTypeKind: X,
  TypeMetadataRecordKind: V,
  FieldTypeFlags: H,
  FunctionMetadataConvention: ee,
  FunctionConventionStrings: te,
  MetadataKind: J,
  OpaqueExistentialContainer: E,
  ClassExistentialContainer: D,
  ProtocolClassConstraint: ne,
  TargetProtocolDescriptor: S
};

},{"./mangling":4,"babel-runtime/core-js/get-iterator":7,"babel-runtime/core-js/math/log2":9,"babel-runtime/core-js/object/create":10,"babel-runtime/core-js/object/entries":13}],6:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/array/from"),
  __esModule: !0
};

},{"core-js/library/fn/array/from":21}],7:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/get-iterator"),
  __esModule: !0
};
},{"core-js/library/fn/get-iterator":22}],8:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/map"),
  __esModule: !0
};

},{"core-js/library/fn/map":23}],9:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/math/log2"),
  __esModule: !0
};

},{"core-js/library/fn/math/log2":24}],10:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/object/create"),
  __esModule: !0
};

},{"core-js/library/fn/object/create":25}],11:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/object/define-properties"),
  __esModule: !0
};

},{"core-js/library/fn/object/define-properties":26}],12:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/object/define-property"),
  __esModule: !0
};

},{"core-js/library/fn/object/define-property":27}],13:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/object/entries"),
  __esModule: !0
};

},{"core-js/library/fn/object/entries":28}],14:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/object/get-own-property-descriptors"),
  __esModule: !0
};

},{"core-js/library/fn/object/get-own-property-descriptors":29}],15:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/object/keys"),
  __esModule: !0
};

},{"core-js/library/fn/object/keys":30}],16:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/object/prevent-extensions"),
  __esModule: !0
};

},{"core-js/library/fn/object/prevent-extensions":31}],17:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/reflect/define-property"),
  __esModule: !0
};

},{"core-js/library/fn/reflect/define-property":32}],18:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/reflect/delete-property"),
  __esModule: !0
};

},{"core-js/library/fn/reflect/delete-property":33}],19:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/reflect/set-prototype-of"),
  __esModule: !0
};

},{"core-js/library/fn/reflect/set-prototype-of":34}],20:[function(require,module,exports){
module.exports = {
  default: require("core-js/library/fn/set"),
  __esModule: !0
};
},{"core-js/library/fn/set":35}],21:[function(require,module,exports){
require("../../modules/es6.string.iterator"), require("../../modules/es6.array.from"), 
module.exports = require("../../modules/_core").Array.from;

},{"../../modules/_core":50,"../../modules/es6.array.from":112,"../../modules/es6.string.iterator":126}],22:[function(require,module,exports){
require("../modules/web.dom.iterable"), require("../modules/es6.string.iterator"), 
module.exports = require("../modules/core.get-iterator");
},{"../modules/core.get-iterator":111,"../modules/es6.string.iterator":126,"../modules/web.dom.iterable":135}],23:[function(require,module,exports){
require("../modules/es6.object.to-string"), require("../modules/es6.string.iterator"), 
require("../modules/web.dom.iterable"), require("../modules/es6.map"), require("../modules/es7.map.to-json"), 
require("../modules/es7.map.of"), require("../modules/es7.map.from"), module.exports = require("../modules/_core").Map;

},{"../modules/_core":50,"../modules/es6.map":114,"../modules/es6.object.to-string":121,"../modules/es6.string.iterator":126,"../modules/es7.map.from":127,"../modules/es7.map.of":128,"../modules/es7.map.to-json":129,"../modules/web.dom.iterable":135}],24:[function(require,module,exports){
require("../../modules/es6.math.log2"), module.exports = require("../../modules/_core").Math.log2;

},{"../../modules/_core":50,"../../modules/es6.math.log2":115}],25:[function(require,module,exports){
require("../../modules/es6.object.create");

var e = require("../../modules/_core").Object;

module.exports = function(r, o) {
  return e.create(r, o);
};
},{"../../modules/_core":50,"../../modules/es6.object.create":116}],26:[function(require,module,exports){
require("../../modules/es6.object.define-properties");

var e = require("../../modules/_core").Object;

module.exports = function(r, o) {
  return e.defineProperties(r, o);
};

},{"../../modules/_core":50,"../../modules/es6.object.define-properties":117}],27:[function(require,module,exports){
require("../../modules/es6.object.define-property");

var e = require("../../modules/_core").Object;

module.exports = function(r, o, t) {
  return e.defineProperty(r, o, t);
};

},{"../../modules/_core":50,"../../modules/es6.object.define-property":118}],28:[function(require,module,exports){
require("../../modules/es7.object.entries"), module.exports = require("../../modules/_core").Object.entries;

},{"../../modules/_core":50,"../../modules/es7.object.entries":130}],29:[function(require,module,exports){
require("../../modules/es7.object.get-own-property-descriptors"), module.exports = require("../../modules/_core").Object.getOwnPropertyDescriptors;

},{"../../modules/_core":50,"../../modules/es7.object.get-own-property-descriptors":131}],30:[function(require,module,exports){
require("../../modules/es6.object.keys"), module.exports = require("../../modules/_core").Object.keys;
},{"../../modules/_core":50,"../../modules/es6.object.keys":119}],31:[function(require,module,exports){
require("../../modules/es6.object.prevent-extensions"), module.exports = require("../../modules/_core").Object.preventExtensions;

},{"../../modules/_core":50,"../../modules/es6.object.prevent-extensions":120}],32:[function(require,module,exports){
require("../../modules/es6.reflect.define-property"), module.exports = require("../../modules/_core").Reflect.defineProperty;

},{"../../modules/_core":50,"../../modules/es6.reflect.define-property":122}],33:[function(require,module,exports){
require("../../modules/es6.reflect.delete-property"), module.exports = require("../../modules/_core").Reflect.deleteProperty;

},{"../../modules/_core":50,"../../modules/es6.reflect.delete-property":123}],34:[function(require,module,exports){
require("../../modules/es6.reflect.set-prototype-of"), module.exports = require("../../modules/_core").Reflect.setPrototypeOf;

},{"../../modules/_core":50,"../../modules/es6.reflect.set-prototype-of":124}],35:[function(require,module,exports){
require("../modules/es6.object.to-string"), require("../modules/es6.string.iterator"), 
require("../modules/web.dom.iterable"), require("../modules/es6.set"), require("../modules/es7.set.to-json"), 
require("../modules/es7.set.of"), require("../modules/es7.set.from"), module.exports = require("../modules/_core").Set;
},{"../modules/_core":50,"../modules/es6.object.to-string":121,"../modules/es6.set":125,"../modules/es6.string.iterator":126,"../modules/es7.set.from":132,"../modules/es7.set.of":133,"../modules/es7.set.to-json":134,"../modules/web.dom.iterable":135}],36:[function(require,module,exports){
module.exports = function(o) {
  if ("function" != typeof o) throw TypeError(o + " is not a function!");
  return o;
};

},{}],37:[function(require,module,exports){
module.exports = function() {};

},{}],38:[function(require,module,exports){
module.exports = function(o, n, r, i) {
  if (!(o instanceof n) || void 0 !== i && i in o) throw TypeError(r + ": incorrect invocation!");
  return o;
};

},{}],39:[function(require,module,exports){
var r = require("./_is-object");

module.exports = function(e) {
  if (!r(e)) throw TypeError(e + " is not an object!");
  return e;
};
},{"./_is-object":68}],40:[function(require,module,exports){
var r = require("./_for-of");

module.exports = function(e, o) {
  var u = [];
  return r(e, !1, u.push, u, o), u;
};

},{"./_for-of":59}],41:[function(require,module,exports){
var e = require("./_to-iobject"), r = require("./_to-length"), t = require("./_to-absolute-index");

module.exports = function(n) {
  return function(i, o, u) {
    var f, l = e(i), a = r(l.length), c = t(u, a);
    if (n && o != o) {
      for (;a > c; ) if ((f = l[c++]) != f) return !0;
    } else for (;a > c; c++) if ((n || c in l) && l[c] === o) return n || c || 0;
    return !n && -1;
  };
};
},{"./_to-absolute-index":101,"./_to-iobject":103,"./_to-length":104}],42:[function(require,module,exports){
var e = require("./_ctx"), r = require("./_iobject"), t = require("./_to-object"), i = require("./_to-length"), u = require("./_array-species-create");

module.exports = function(n, c) {
  var s = 1 == n, a = 2 == n, o = 3 == n, f = 4 == n, l = 6 == n, q = 5 == n || l, _ = c || u;
  return function(u, c, h) {
    for (var v, p, b = t(u), d = r(b), g = e(c, h, 3), j = i(d.length), x = 0, m = s ? _(u, j) : a ? _(u, 0) : void 0; j > x; x++) if ((q || x in d) && (v = d[x], 
    p = g(v, x, b), n)) if (s) m[x] = p; else if (p) switch (n) {
     case 3:
      return !0;

     case 5:
      return v;

     case 6:
      return x;

     case 2:
      m.push(v);
    } else if (f) return !1;
    return l ? -1 : o || f ? f : m;
  };
};

},{"./_array-species-create":44,"./_ctx":52,"./_iobject":65,"./_to-length":104,"./_to-object":105}],43:[function(require,module,exports){
var r = require("./_is-object"), e = require("./_is-array"), o = require("./_wks")("species");

module.exports = function(i) {
  var t;
  return e(i) && (t = i.constructor, "function" != typeof t || t !== Array && !e(t.prototype) || (t = void 0), 
  r(t) && null === (t = t[o]) && (t = void 0)), void 0 === t ? Array : t;
};

},{"./_is-array":67,"./_is-object":68,"./_wks":109}],44:[function(require,module,exports){
var r = require("./_array-species-constructor");

module.exports = function(e, n) {
  return new (r(e))(n);
};

},{"./_array-species-constructor":43}],45:[function(require,module,exports){
var e = require("./_cof"), t = require("./_wks")("toStringTag"), n = "Arguments" == e(function() {
  return arguments;
}()), r = function(e, t) {
  try {
    return e[t];
  } catch (e) {}
};

module.exports = function(u) {
  var o, c, i;
  return void 0 === u ? "Undefined" : null === u ? "Null" : "string" == typeof (c = r(o = Object(u), t)) ? c : n ? e(o) : "Object" == (i = e(o)) && "function" == typeof o.callee ? "Arguments" : i;
};

},{"./_cof":46,"./_wks":109}],46:[function(require,module,exports){
var r = {}.toString;

module.exports = function(t) {
  return r.call(t).slice(8, -1);
};

},{}],47:[function(require,module,exports){
"use strict";

var e = require("./_object-dp").f, r = require("./_object-create"), t = require("./_redefine-all"), i = require("./_ctx"), n = require("./_an-instance"), _ = require("./_for-of"), o = require("./_iter-define"), f = require("./_iter-step"), u = require("./_set-species"), s = require("./_descriptors"), v = require("./_meta").fastKey, c = require("./_validate-collection"), l = s ? "_s" : "size", a = function(e, r) {
  var t, i = v(r);
  if ("F" !== i) return e._i[i];
  for (t = e._f; t; t = t.n) if (t.k == r) return t;
};

module.exports = {
  getConstructor: function(o, f, u, v) {
    var d = o(function(e, t) {
      n(e, d, f, "_i"), e._t = f, e._i = r(null), e._f = void 0, e._l = void 0, e[l] = 0, 
      void 0 != t && _(t, u, e[v], e);
    });
    return t(d.prototype, {
      clear: function() {
        for (var e = c(this, f), r = e._i, t = e._f; t; t = t.n) t.r = !0, t.p && (t.p = t.p.n = void 0), 
        delete r[t.i];
        e._f = e._l = void 0, e[l] = 0;
      },
      delete: function(e) {
        var r = c(this, f), t = a(r, e);
        if (t) {
          var i = t.n, n = t.p;
          delete r._i[t.i], t.r = !0, n && (n.n = i), i && (i.p = n), r._f == t && (r._f = i), 
          r._l == t && (r._l = n), r[l]--;
        }
        return !!t;
      },
      forEach: function(e) {
        c(this, f);
        for (var r, t = i(e, arguments.length > 1 ? arguments[1] : void 0, 3); r = r ? r.n : this._f; ) for (t(r.v, r.k, this); r && r.r; ) r = r.p;
      },
      has: function(e) {
        return !!a(c(this, f), e);
      }
    }), s && e(d.prototype, "size", {
      get: function() {
        return c(this, f)[l];
      }
    }), d;
  },
  def: function(e, r, t) {
    var i, n, _ = a(e, r);
    return _ ? _.v = t : (e._l = _ = {
      i: n = v(r, !0),
      k: r,
      v: t,
      p: i = e._l,
      n: void 0,
      r: !1
    }, e._f || (e._f = _), i && (i.n = _), e[l]++, "F" !== n && (e._i[n] = _)), e;
  },
  getEntry: a,
  setStrong: function(e, r, t) {
    o(e, r, function(e, t) {
      this._t = c(e, r), this._k = t, this._l = void 0;
    }, function() {
      for (var e = this, r = e._k, t = e._l; t && t.r; ) t = t.p;
      return e._t && (e._l = t = t ? t.n : e._t._f) ? "keys" == r ? f(0, t.k) : "values" == r ? f(0, t.v) : f(0, [ t.k, t.v ]) : (e._t = void 0, 
      f(1));
    }, t ? "entries" : "values", !t, !0), u(r);
  }
};

},{"./_an-instance":38,"./_ctx":52,"./_descriptors":54,"./_for-of":59,"./_iter-define":71,"./_iter-step":73,"./_meta":76,"./_object-create":77,"./_object-dp":78,"./_redefine-all":91,"./_set-species":96,"./_validate-collection":108}],48:[function(require,module,exports){
var r = require("./_classof"), e = require("./_array-from-iterable");

module.exports = function(t) {
  return function() {
    if (r(this) != t) throw TypeError(t + "#toJSON isn't generic");
    return e(this);
  };
};

},{"./_array-from-iterable":40,"./_classof":45}],49:[function(require,module,exports){
"use strict";

var e = require("./_global"), r = require("./_export"), t = require("./_meta"), i = require("./_fails"), o = require("./_hide"), n = require("./_redefine-all"), s = require("./_for-of"), u = require("./_an-instance"), a = require("./_is-object"), c = require("./_set-to-string-tag"), _ = require("./_object-dp").f, f = require("./_array-methods")(0), d = require("./_descriptors");

module.exports = function(p, q, l, h, g, v) {
  var y = e[p], E = y, b = g ? "set" : "add", m = E && E.prototype, x = {};
  return d && "function" == typeof E && (v || m.forEach && !i(function() {
    new E().entries().next();
  })) ? (E = q(function(e, r) {
    u(e, E, p, "_c"), e._c = new y(), void 0 != r && s(r, g, e[b], e);
  }), f("add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON".split(","), function(e) {
    var r = "add" == e || "set" == e;
    e in m && (!v || "clear" != e) && o(E.prototype, e, function(t, i) {
      if (u(this, E, e), !r && v && !a(t)) return "get" == e && void 0;
      var o = this._c[e](0 === t ? 0 : t, i);
      return r ? this : o;
    });
  }), v || _(E.prototype, "size", {
    get: function() {
      return this._c.size;
    }
  })) : (E = h.getConstructor(q, p, g, b), n(E.prototype, l), t.NEED = !0), c(E, p), 
  x[p] = E, r(r.G + r.W + r.F, x), v || h.setStrong(E, p, g), E;
};

},{"./_an-instance":38,"./_array-methods":42,"./_descriptors":54,"./_export":57,"./_fails":58,"./_for-of":59,"./_global":60,"./_hide":62,"./_is-object":68,"./_meta":76,"./_object-dp":78,"./_redefine-all":91,"./_set-to-string-tag":97}],50:[function(require,module,exports){
var e = module.exports = {
  version: "2.5.1"
};

"number" == typeof __e && (__e = e);

},{}],51:[function(require,module,exports){
"use strict";

var e = require("./_object-dp"), r = require("./_property-desc");

module.exports = function(t, i, o) {
  i in t ? e.f(t, i, r(0, o)) : t[i] = o;
};

},{"./_object-dp":78,"./_property-desc":90}],52:[function(require,module,exports){
var r = require("./_a-function");

module.exports = function(n, t, u) {
  if (r(n), void 0 === t) return n;
  switch (u) {
   case 1:
    return function(r) {
      return n.call(t, r);
    };

   case 2:
    return function(r, u) {
      return n.call(t, r, u);
    };

   case 3:
    return function(r, u, e) {
      return n.call(t, r, u, e);
    };
  }
  return function() {
    return n.apply(t, arguments);
  };
};

},{"./_a-function":36}],53:[function(require,module,exports){
module.exports = function(o) {
  if (void 0 == o) throw TypeError("Can't call method on  " + o);
  return o;
};

},{}],54:[function(require,module,exports){
module.exports = !require("./_fails")(function() {
  return 7 != Object.defineProperty({}, "a", {
    get: function() {
      return 7;
    }
  }).a;
});

},{"./_fails":58}],55:[function(require,module,exports){
var e = require("./_is-object"), r = require("./_global").document, t = e(r) && e(r.createElement);

module.exports = function(e) {
  return t ? r.createElement(e) : {};
};

},{"./_global":60,"./_is-object":68}],56:[function(require,module,exports){
module.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");

},{}],57:[function(require,module,exports){
var e = require("./_global"), r = require("./_core"), n = require("./_ctx"), t = require("./_hide"), i = "prototype", u = function(o, c, a) {
  var f, l, s, p = o & u.F, v = o & u.G, h = o & u.S, w = o & u.P, q = o & u.B, y = o & u.W, _ = v ? r : r[c] || (r[c] = {}), d = _[i], F = v ? e : h ? e[c] : (e[c] || {})[i];
  v && (a = c);
  for (f in a) (l = !p && F && void 0 !== F[f]) && f in _ || (s = l ? F[f] : a[f], 
  _[f] = v && "function" != typeof F[f] ? a[f] : q && l ? n(s, e) : y && F[f] == s ? function(e) {
    var r = function(r, n, t) {
      if (this instanceof e) {
        switch (arguments.length) {
         case 0:
          return new e();

         case 1:
          return new e(r);

         case 2:
          return new e(r, n);
        }
        return new e(r, n, t);
      }
      return e.apply(this, arguments);
    };
    return r[i] = e[i], r;
  }(s) : w && "function" == typeof s ? n(Function.call, s) : s, w && ((_.virtual || (_.virtual = {}))[f] = s, 
  o & u.R && d && !d[f] && t(d, f, s)));
};

u.F = 1, u.G = 2, u.S = 4, u.P = 8, u.B = 16, u.W = 32, u.U = 64, u.R = 128, module.exports = u;

},{"./_core":50,"./_ctx":52,"./_global":60,"./_hide":62}],58:[function(require,module,exports){
module.exports = function(r) {
  try {
    return !!r();
  } catch (r) {
    return !0;
  }
};

},{}],59:[function(require,module,exports){
var e = require("./_ctx"), r = require("./_iter-call"), t = require("./_is-array-iter"), i = require("./_an-object"), o = require("./_to-length"), n = require("./core.get-iterator-method"), u = {}, a = {}, f = module.exports = function(f, l, c, q, _) {
  var h, s, d, g, p = _ ? function() {
    return f;
  } : n(f), v = e(c, q, l ? 2 : 1), x = 0;
  if ("function" != typeof p) throw TypeError(f + " is not iterable!");
  if (t(p)) {
    for (h = o(f.length); h > x; x++) if ((g = l ? v(i(s = f[x])[0], s[1]) : v(f[x])) === u || g === a) return g;
  } else for (d = p.call(f); !(s = d.next()).done; ) if ((g = r(d, v, s.value, l)) === u || g === a) return g;
};

f.BREAK = u, f.RETURN = a;

},{"./_an-object":39,"./_ctx":52,"./_is-array-iter":66,"./_iter-call":69,"./_to-length":104,"./core.get-iterator-method":110}],60:[function(require,module,exports){
var e = module.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();

"number" == typeof __g && (__g = e);

},{}],61:[function(require,module,exports){
var r = {}.hasOwnProperty;

module.exports = function(e, n) {
  return r.call(e, n);
};

},{}],62:[function(require,module,exports){
var r = require("./_object-dp"), e = require("./_property-desc");

module.exports = require("./_descriptors") ? function(t, u, o) {
  return r.f(t, u, e(1, o));
} : function(r, e, t) {
  return r[e] = t, r;
};

},{"./_descriptors":54,"./_object-dp":78,"./_property-desc":90}],63:[function(require,module,exports){
var e = require("./_global").document;

module.exports = e && e.documentElement;

},{"./_global":60}],64:[function(require,module,exports){
module.exports = !require("./_descriptors") && !require("./_fails")(function() {
  return 7 != Object.defineProperty(require("./_dom-create")("div"), "a", {
    get: function() {
      return 7;
    }
  }).a;
});

},{"./_descriptors":54,"./_dom-create":55,"./_fails":58}],65:[function(require,module,exports){
var e = require("./_cof");

module.exports = Object("z").propertyIsEnumerable(0) ? Object : function(r) {
  return "String" == e(r) ? r.split("") : Object(r);
};

},{"./_cof":46}],66:[function(require,module,exports){
var r = require("./_iterators"), e = require("./_wks")("iterator"), t = Array.prototype;

module.exports = function(o) {
  return void 0 !== o && (r.Array === o || t[e] === o);
};

},{"./_iterators":74,"./_wks":109}],67:[function(require,module,exports){
var r = require("./_cof");

module.exports = Array.isArray || function(e) {
  return "Array" == r(e);
};

},{"./_cof":46}],68:[function(require,module,exports){
module.exports = function(o) {
  return "object" == typeof o ? null !== o : "function" == typeof o;
};

},{}],69:[function(require,module,exports){
var r = require("./_an-object");

module.exports = function(t, e, o, a) {
  try {
    return a ? e(r(o)[0], o[1]) : e(o);
  } catch (e) {
    var c = t.return;
    throw void 0 !== c && r(c.call(t)), e;
  }
};

},{"./_an-object":39}],70:[function(require,module,exports){
"use strict";

var e = require("./_object-create"), r = require("./_property-desc"), t = require("./_set-to-string-tag"), i = {};

require("./_hide")(i, require("./_wks")("iterator"), function() {
  return this;
}), module.exports = function(o, u, s) {
  o.prototype = e(i, {
    next: r(1, s)
  }), t(o, u + " Iterator");
};

},{"./_hide":62,"./_object-create":77,"./_property-desc":90,"./_set-to-string-tag":97,"./_wks":109}],71:[function(require,module,exports){
"use strict";

var e = require("./_library"), r = require("./_export"), t = require("./_redefine"), i = require("./_hide"), n = require("./_has"), u = require("./_iterators"), s = require("./_iter-create"), o = require("./_set-to-string-tag"), a = require("./_object-gpo"), c = require("./_wks")("iterator"), f = !([].keys && "next" in [].keys()), q = "@@iterator", _ = "keys", l = "values", y = function() {
  return this;
};

module.exports = function(h, p, k, v, w, d, x) {
  s(k, p, v);
  var b, g, j, m = function(e) {
    if (!f && e in O) return O[e];
    switch (e) {
     case _:
     case l:
      return function() {
        return new k(this, e);
      };
    }
    return function() {
      return new k(this, e);
    };
  }, A = p + " Iterator", F = w == l, I = !1, O = h.prototype, P = O[c] || O[q] || w && O[w], z = P || m(w), B = w ? F ? m("entries") : z : void 0, C = "Array" == p ? O.entries || P : P;
  if (C && (j = a(C.call(new h()))) !== Object.prototype && j.next && (o(j, A, !0), 
  e || n(j, c) || i(j, c, y)), F && P && P.name !== l && (I = !0, z = function() {
    return P.call(this);
  }), e && !x || !f && !I && O[c] || i(O, c, z), u[p] = z, u[A] = y, w) if (b = {
    values: F ? z : m(l),
    keys: d ? z : m(_),
    entries: B
  }, x) for (g in b) g in O || t(O, g, b[g]); else r(r.P + r.F * (f || I), p, b);
  return b;
};

},{"./_export":57,"./_has":61,"./_hide":62,"./_iter-create":70,"./_iterators":74,"./_library":75,"./_object-gpo":83,"./_redefine":92,"./_set-to-string-tag":97,"./_wks":109}],72:[function(require,module,exports){
var r = require("./_wks")("iterator"), t = !1;

try {
  var n = [ 7 ][r]();
  n.return = function() {
    t = !0;
  }, Array.from(n, function() {
    throw 2;
  });
} catch (r) {}

module.exports = function(n, e) {
  if (!e && !t) return !1;
  var u = !1;
  try {
    var o = [ 7 ], c = o[r]();
    c.next = function() {
      return {
        done: u = !0
      };
    }, o[r] = function() {
      return c;
    }, n(o);
  } catch (r) {}
  return u;
};

},{"./_wks":109}],73:[function(require,module,exports){
module.exports = function(e, n) {
  return {
    value: n,
    done: !!e
  };
};

},{}],74:[function(require,module,exports){
module.exports = {};

},{}],75:[function(require,module,exports){
module.exports = !0;

},{}],76:[function(require,module,exports){
var e = require("./_uid")("meta"), r = require("./_is-object"), t = require("./_has"), n = require("./_object-dp").f, i = 0, u = Object.isExtensible || function() {
  return !0;
}, f = !require("./_fails")(function() {
  return u(Object.preventExtensions({}));
}), o = function(r) {
  n(r, e, {
    value: {
      i: "O" + ++i,
      w: {}
    }
  });
}, s = function(n, i) {
  if (!r(n)) return "symbol" == typeof n ? n : ("string" == typeof n ? "S" : "P") + n;
  if (!t(n, e)) {
    if (!u(n)) return "F";
    if (!i) return "E";
    o(n);
  }
  return n[e].i;
}, c = function(r, n) {
  if (!t(r, e)) {
    if (!u(r)) return !0;
    if (!n) return !1;
    o(r);
  }
  return r[e].w;
}, E = function(r) {
  return f && a.NEED && u(r) && !t(r, e) && o(r), r;
}, a = module.exports = {
  KEY: e,
  NEED: !1,
  fastKey: s,
  getWeak: c,
  onFreeze: E
};

},{"./_fails":58,"./_has":61,"./_is-object":68,"./_object-dp":78,"./_uid":107}],77:[function(require,module,exports){
var e = require("./_an-object"), r = require("./_object-dps"), t = require("./_enum-bug-keys"), n = require("./_shared-key")("IE_PROTO"), o = function() {}, i = "prototype", u = function() {
  var e, r = require("./_dom-create")("iframe"), n = t.length;
  for (r.style.display = "none", require("./_html").appendChild(r), r.src = "javascript:", 
  e = r.contentWindow.document, e.open(), e.write("<script>document.F=Object<\/script>"), 
  e.close(), u = e.F; n--; ) delete u[i][t[n]];
  return u();
};

module.exports = Object.create || function(t, c) {
  var a;
  return null !== t ? (o[i] = e(t), a = new o(), o[i] = null, a[n] = t) : a = u(), 
  void 0 === c ? a : r(a, c);
};

},{"./_an-object":39,"./_dom-create":55,"./_enum-bug-keys":56,"./_html":63,"./_object-dps":79,"./_shared-key":98}],78:[function(require,module,exports){
var e = require("./_an-object"), r = require("./_ie8-dom-define"), t = require("./_to-primitive"), i = Object.defineProperty;

exports.f = require("./_descriptors") ? Object.defineProperty : function(o, n, u) {
  if (e(o), n = t(n, !0), e(u), r) try {
    return i(o, n, u);
  } catch (e) {}
  if ("get" in u || "set" in u) throw TypeError("Accessors not supported!");
  return "value" in u && (o[n] = u.value), o;
};

},{"./_an-object":39,"./_descriptors":54,"./_ie8-dom-define":64,"./_to-primitive":106}],79:[function(require,module,exports){
var e = require("./_object-dp"), r = require("./_an-object"), t = require("./_object-keys");

module.exports = require("./_descriptors") ? Object.defineProperties : function(o, i) {
  r(o);
  for (var u, c = t(i), n = c.length, s = 0; n > s; ) e.f(o, u = c[s++], i[u]);
  return o;
};

},{"./_an-object":39,"./_descriptors":54,"./_object-dp":78,"./_object-keys":85}],80:[function(require,module,exports){
var e = require("./_object-pie"), r = require("./_property-desc"), i = require("./_to-iobject"), t = require("./_to-primitive"), o = require("./_has"), c = require("./_ie8-dom-define"), u = Object.getOwnPropertyDescriptor;

exports.f = require("./_descriptors") ? u : function(p, q) {
  if (p = i(p), q = t(q, !0), c) try {
    return u(p, q);
  } catch (e) {}
  if (o(p, q)) return r(!e.f.call(p, q), p[q]);
};

},{"./_descriptors":54,"./_has":61,"./_ie8-dom-define":64,"./_object-pie":86,"./_property-desc":90,"./_to-iobject":103,"./_to-primitive":106}],81:[function(require,module,exports){
var e = require("./_object-keys-internal"), r = require("./_enum-bug-keys").concat("length", "prototype");

exports.f = Object.getOwnPropertyNames || function(t) {
  return e(t, r);
};
},{"./_enum-bug-keys":56,"./_object-keys-internal":84}],82:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],83:[function(require,module,exports){
var t = require("./_has"), e = require("./_to-object"), o = require("./_shared-key")("IE_PROTO"), r = Object.prototype;

module.exports = Object.getPrototypeOf || function(c) {
  return c = e(c), t(c, o) ? c[o] : "function" == typeof c.constructor && c instanceof c.constructor ? c.constructor.prototype : c instanceof Object ? r : null;
};

},{"./_has":61,"./_shared-key":98,"./_to-object":105}],84:[function(require,module,exports){
var r = require("./_has"), e = require("./_to-iobject"), u = require("./_array-includes")(!1), i = require("./_shared-key")("IE_PROTO");

module.exports = function(o, a) {
  var n, s = e(o), t = 0, h = [];
  for (n in s) n != i && r(s, n) && h.push(n);
  for (;a.length > t; ) r(s, n = a[t++]) && (~u(h, n) || h.push(n));
  return h;
};
},{"./_array-includes":41,"./_has":61,"./_shared-key":98,"./_to-iobject":103}],85:[function(require,module,exports){
var e = require("./_object-keys-internal"), r = require("./_enum-bug-keys");

module.exports = Object.keys || function(u) {
  return e(u, r);
};
},{"./_enum-bug-keys":56,"./_object-keys-internal":84}],86:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],87:[function(require,module,exports){
var e = require("./_export"), r = require("./_core"), t = require("./_fails");

module.exports = function(c, i) {
  var o = (r.Object || {})[c] || Object[c], u = {};
  u[c] = i(o), e(e.S + e.F * t(function() {
    o(1);
  }), "Object", u);
};

},{"./_core":50,"./_export":57,"./_fails":58}],88:[function(require,module,exports){
var e = require("./_object-keys"), r = require("./_to-iobject"), t = require("./_object-pie").f;

module.exports = function(o) {
  return function(u) {
    for (var i, n = r(u), c = e(n), f = c.length, l = 0, a = []; f > l; ) t.call(n, i = c[l++]) && a.push(o ? [ i, n[i] ] : n[i]);
    return a;
  };
};
},{"./_object-keys":85,"./_object-pie":86,"./_to-iobject":103}],89:[function(require,module,exports){
var e = require("./_object-gopn"), r = require("./_object-gops"), o = require("./_an-object"), t = require("./_global").Reflect;

module.exports = t && t.ownKeys || function(t) {
  var c = e.f(o(t)), n = r.f;
  return n ? c.concat(n(t)) : c;
};

},{"./_an-object":39,"./_global":60,"./_object-gopn":81,"./_object-gops":82}],90:[function(require,module,exports){
module.exports = function(e, r) {
  return {
    enumerable: !(1 & e),
    configurable: !(2 & e),
    writable: !(4 & e),
    value: r
  };
};

},{}],91:[function(require,module,exports){
var r = require("./_hide");

module.exports = function(e, i, n) {
  for (var o in i) n && e[o] ? e[o] = i[o] : r(e, o, i[o]);
  return e;
};

},{"./_hide":62}],92:[function(require,module,exports){
module.exports = require("./_hide");

},{"./_hide":62}],93:[function(require,module,exports){
"use strict";

var r = require("./_export"), e = require("./_a-function"), i = require("./_ctx"), t = require("./_for-of");

module.exports = function(u) {
  r(r.S, u, {
    from: function(r) {
      var u, o, n, s, f = arguments[1];
      return e(this), u = void 0 !== f, u && e(f), void 0 == r ? new this() : (o = [], 
      u ? (n = 0, s = i(f, arguments[2], 2), t(r, !1, function(r) {
        o.push(s(r, n++));
      })) : t(r, !1, o.push, o), new this(o));
    }
  });
};

},{"./_a-function":36,"./_ctx":52,"./_export":57,"./_for-of":59}],94:[function(require,module,exports){
"use strict";

var r = require("./_export");

module.exports = function(e) {
  r(r.S, e, {
    of: function() {
      for (var r = arguments.length, e = Array(r); r--; ) e[r] = arguments[r];
      return new this(e);
    }
  });
};

},{"./_export":57}],95:[function(require,module,exports){
var t = require("./_is-object"), e = require("./_an-object"), r = function(r, o) {
  if (e(r), !t(o) && null !== o) throw TypeError(o + ": can't set as prototype!");
};

module.exports = {
  set: Object.setPrototypeOf || ("__proto__" in {} ? function(t, e, o) {
    try {
      o = require("./_ctx")(Function.call, require("./_object-gopd").f(Object.prototype, "__proto__").set, 2), 
      o(t, []), e = !(t instanceof Array);
    } catch (t) {
      e = !0;
    }
    return function(t, c) {
      return r(t, c), e ? t.__proto__ = c : o(t, c), t;
    };
  }({}, !1) : void 0),
  check: r
};

},{"./_an-object":39,"./_ctx":52,"./_is-object":68,"./_object-gopd":80}],96:[function(require,module,exports){
"use strict";

var e = require("./_global"), r = require("./_core"), i = require("./_object-dp"), t = require("./_descriptors"), u = require("./_wks")("species");

module.exports = function(o) {
  var c = "function" == typeof r[o] ? r[o] : e[o];
  t && c && !c[u] && i.f(c, u, {
    configurable: !0,
    get: function() {
      return this;
    }
  });
};

},{"./_core":50,"./_descriptors":54,"./_global":60,"./_object-dp":78,"./_wks":109}],97:[function(require,module,exports){
var e = require("./_object-dp").f, r = require("./_has"), o = require("./_wks")("toStringTag");

module.exports = function(t, u, i) {
  t && !r(t = i ? t : t.prototype, o) && e(t, o, {
    configurable: !0,
    value: u
  });
};

},{"./_has":61,"./_object-dp":78,"./_wks":109}],98:[function(require,module,exports){
var e = require("./_shared")("keys"), r = require("./_uid");

module.exports = function(u) {
  return e[u] || (e[u] = r(u));
};

},{"./_shared":99,"./_uid":107}],99:[function(require,module,exports){
var r = require("./_global"), e = "__core-js_shared__", _ = r[e] || (r[e] = {});

module.exports = function(r) {
  return _[r] || (_[r] = {});
};

},{"./_global":60}],100:[function(require,module,exports){
var e = require("./_to-integer"), r = require("./_defined");

module.exports = function(t) {
  return function(n, i) {
    var o, u, c = String(r(n)), d = e(i), a = c.length;
    return d < 0 || d >= a ? t ? "" : void 0 : (o = c.charCodeAt(d), o < 55296 || o > 56319 || d + 1 === a || (u = c.charCodeAt(d + 1)) < 56320 || u > 57343 ? t ? c.charAt(d) : o : t ? c.slice(d, d + 2) : u - 56320 + (o - 55296 << 10) + 65536);
  };
};

},{"./_defined":53,"./_to-integer":102}],101:[function(require,module,exports){
var e = require("./_to-integer"), r = Math.max, t = Math.min;

module.exports = function(n, a) {
  return n = e(n), n < 0 ? r(n + a, 0) : t(n, a);
};
},{"./_to-integer":102}],102:[function(require,module,exports){
var o = Math.ceil, r = Math.floor;

module.exports = function(t) {
  return isNaN(t = +t) ? 0 : (t > 0 ? r : o)(t);
};

},{}],103:[function(require,module,exports){
var e = require("./_iobject"), r = require("./_defined");

module.exports = function(i) {
  return e(r(i));
};

},{"./_defined":53,"./_iobject":65}],104:[function(require,module,exports){
var e = require("./_to-integer"), r = Math.min;

module.exports = function(t) {
  return t > 0 ? r(e(t), 9007199254740991) : 0;
};

},{"./_to-integer":102}],105:[function(require,module,exports){
var e = require("./_defined");

module.exports = function(r) {
  return Object(e(r));
};
},{"./_defined":53}],106:[function(require,module,exports){
var t = require("./_is-object");

module.exports = function(r, e) {
  if (!t(r)) return r;
  var o, n;
  if (e && "function" == typeof (o = r.toString) && !t(n = o.call(r))) return n;
  if ("function" == typeof (o = r.valueOf) && !t(n = o.call(r))) return n;
  if (!e && "function" == typeof (o = r.toString) && !t(n = o.call(r))) return n;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":68}],107:[function(require,module,exports){
var o = 0, t = Math.random();

module.exports = function(n) {
  return "Symbol(".concat(void 0 === n ? "" : n, ")_", (++o + t).toString(36));
};

},{}],108:[function(require,module,exports){
var r = require("./_is-object");

module.exports = function(e, i) {
  if (!r(e) || e._t !== i) throw TypeError("Incompatible receiver, " + i + " required!");
  return e;
};

},{"./_is-object":68}],109:[function(require,module,exports){
var e = require("./_shared")("wks"), r = require("./_uid"), o = require("./_global").Symbol, u = "function" == typeof o, i = module.exports = function(i) {
  return e[i] || (e[i] = u && o[i] || (u ? o : r)("Symbol." + i));
};

i.store = e;

},{"./_global":60,"./_shared":99,"./_uid":107}],110:[function(require,module,exports){
var r = require("./_classof"), e = require("./_wks")("iterator"), t = require("./_iterators");

module.exports = require("./_core").getIteratorMethod = function(o) {
  if (void 0 != o) return o[e] || o["@@iterator"] || t[r(o)];
};

},{"./_classof":45,"./_core":50,"./_iterators":74,"./_wks":109}],111:[function(require,module,exports){
var r = require("./_an-object"), e = require("./core.get-iterator-method");

module.exports = require("./_core").getIterator = function(t) {
  var o = e(t);
  if ("function" != typeof o) throw TypeError(t + " is not iterable!");
  return r(o.call(t));
};
},{"./_an-object":39,"./_core":50,"./core.get-iterator-method":110}],112:[function(require,module,exports){
"use strict";

var e = require("./_ctx"), r = require("./_export"), t = require("./_to-object"), i = require("./_iter-call"), o = require("./_is-array-iter"), u = require("./_to-length"), n = require("./_create-property"), a = require("./core.get-iterator-method");

r(r.S + r.F * !require("./_iter-detect")(function(e) {
  Array.from(e);
}), "Array", {
  from: function(r) {
    var c, l, f, q, v = t(r), _ = "function" == typeof this ? this : Array, d = arguments.length, h = d > 1 ? arguments[1] : void 0, y = void 0 !== h, s = 0, g = a(v);
    if (y && (h = e(h, d > 2 ? arguments[2] : void 0, 2)), void 0 == g || _ == Array && o(g)) for (c = u(v.length), 
    l = new _(c); c > s; s++) n(l, s, y ? h(v[s], s) : v[s]); else for (q = g.call(v), 
    l = new _(); !(f = q.next()).done; s++) n(l, s, y ? i(q, h, [ f.value, s ], !0) : f.value);
    return l.length = s, l;
  }
});

},{"./_create-property":51,"./_ctx":52,"./_export":57,"./_is-array-iter":66,"./_iter-call":69,"./_iter-detect":72,"./_to-length":104,"./_to-object":105,"./core.get-iterator-method":110}],113:[function(require,module,exports){
"use strict";

var e = require("./_add-to-unscopables"), r = require("./_iter-step"), t = require("./_iterators"), i = require("./_to-iobject");

module.exports = require("./_iter-define")(Array, "Array", function(e, r) {
  this._t = i(e), this._i = 0, this._k = r;
}, function() {
  var e = this._t, t = this._k, i = this._i++;
  return !e || i >= e.length ? (this._t = void 0, r(1)) : "keys" == t ? r(0, i) : "values" == t ? r(0, e[i]) : r(0, [ i, e[i] ]);
}, "values"), t.Arguments = t.Array, e("keys"), e("values"), e("entries");

},{"./_add-to-unscopables":37,"./_iter-define":71,"./_iter-step":73,"./_iterators":74,"./_to-iobject":103}],114:[function(require,module,exports){
"use strict";

var t = require("./_collection-strong"), e = require("./_validate-collection"), r = "Map";

module.exports = require("./_collection")(r, function(t) {
  return function() {
    return t(this, arguments.length > 0 ? arguments[0] : void 0);
  };
}, {
  get: function(n) {
    var i = t.getEntry(e(this, r), n);
    return i && i.v;
  },
  set: function(n, i) {
    return t.def(e(this, r), 0 === n ? 0 : n, i);
  }
}, t, !0);

},{"./_collection":49,"./_collection-strong":47,"./_validate-collection":108}],115:[function(require,module,exports){
var r = require("./_export");

r(r.S, "Math", {
  log2: function(r) {
    return Math.log(r) / Math.LN2;
  }
});

},{"./_export":57}],116:[function(require,module,exports){
var e = require("./_export");

e(e.S, "Object", {
  create: require("./_object-create")
});
},{"./_export":57,"./_object-create":77}],117:[function(require,module,exports){
var e = require("./_export");

e(e.S + e.F * !require("./_descriptors"), "Object", {
  defineProperties: require("./_object-dps")
});

},{"./_descriptors":54,"./_export":57,"./_object-dps":79}],118:[function(require,module,exports){
var e = require("./_export");

e(e.S + e.F * !require("./_descriptors"), "Object", {
  defineProperty: require("./_object-dp").f
});

},{"./_descriptors":54,"./_export":57,"./_object-dp":78}],119:[function(require,module,exports){
var e = require("./_to-object"), r = require("./_object-keys");

require("./_object-sap")("keys", function() {
  return function(t) {
    return r(e(t));
  };
});

},{"./_object-keys":85,"./_object-sap":87,"./_to-object":105}],120:[function(require,module,exports){
var e = require("./_is-object"), r = require("./_meta").onFreeze;

require("./_object-sap")("preventExtensions", function(n) {
  return function(t) {
    return n && e(t) ? n(r(t)) : t;
  };
});

},{"./_is-object":68,"./_meta":76,"./_object-sap":87}],121:[function(require,module,exports){

},{}],122:[function(require,module,exports){
var e = require("./_object-dp"), r = require("./_export"), t = require("./_an-object"), i = require("./_to-primitive");

r(r.S + r.F * require("./_fails")(function() {
  Reflect.defineProperty(e.f({}, 1, {
    value: 1
  }), 1, {
    value: 2
  });
}), "Reflect", {
  defineProperty: function(r, u, f) {
    t(r), u = i(u, !0), t(f);
    try {
      return e.f(r, u, f), !0;
    } catch (e) {
      return !1;
    }
  }
});

},{"./_an-object":39,"./_export":57,"./_fails":58,"./_object-dp":78,"./_to-primitive":106}],123:[function(require,module,exports){
var e = require("./_export"), r = require("./_object-gopd").f, t = require("./_an-object");

e(e.S, "Reflect", {
  deleteProperty: function(e, o) {
    var u = r(t(e), o);
    return !(u && !u.configurable) && delete e[o];
  }
});

},{"./_an-object":39,"./_export":57,"./_object-gopd":80}],124:[function(require,module,exports){
var e = require("./_export"), r = require("./_set-proto");

r && e(e.S, "Reflect", {
  setPrototypeOf: function(e, t) {
    r.check(e, t);
    try {
      return r.set(e, t), !0;
    } catch (e) {
      return !1;
    }
  }
});

},{"./_export":57,"./_set-proto":95}],125:[function(require,module,exports){
"use strict";

var e = require("./_collection-strong"), t = require("./_validate-collection"), r = "Set";

module.exports = require("./_collection")(r, function(e) {
  return function() {
    return e(this, arguments.length > 0 ? arguments[0] : void 0);
  };
}, {
  add: function(i) {
    return e.def(t(this, r), i = 0 === i ? 0 : i, i);
  }
}, e);

},{"./_collection":49,"./_collection-strong":47,"./_validate-collection":108}],126:[function(require,module,exports){
"use strict";

var i = require("./_string-at")(!0);

require("./_iter-define")(String, "String", function(i) {
  this._t = String(i), this._i = 0;
}, function() {
  var t, e = this._t, n = this._i;
  return n >= e.length ? {
    value: void 0,
    done: !0
  } : (t = i(e, n), this._i += t.length, {
    value: t,
    done: !1
  });
});

},{"./_iter-define":71,"./_string-at":100}],127:[function(require,module,exports){
require("./_set-collection-from")("Map");

},{"./_set-collection-from":93}],128:[function(require,module,exports){
require("./_set-collection-of")("Map");

},{"./_set-collection-of":94}],129:[function(require,module,exports){
var e = require("./_export");

e(e.P + e.R, "Map", {
  toJSON: require("./_collection-to-json")("Map")
});

},{"./_collection-to-json":48,"./_export":57}],130:[function(require,module,exports){
var r = require("./_export"), e = require("./_object-to-array")(!0);

r(r.S, "Object", {
  entries: function(r) {
    return e(r);
  }
});

},{"./_export":57,"./_object-to-array":88}],131:[function(require,module,exports){
var e = require("./_export"), r = require("./_own-keys"), t = require("./_to-iobject"), o = require("./_object-gopd"), i = require("./_create-property");

e(e.S, "Object", {
  getOwnPropertyDescriptors: function(e) {
    for (var u, c, n = t(e), p = o.f, q = r(n), _ = {}, a = 0; q.length > a; ) void 0 !== (c = p(n, u = q[a++])) && i(_, u, c);
    return _;
  }
});

},{"./_create-property":51,"./_export":57,"./_object-gopd":80,"./_own-keys":89,"./_to-iobject":103}],132:[function(require,module,exports){
require("./_set-collection-from")("Set");

},{"./_set-collection-from":93}],133:[function(require,module,exports){
require("./_set-collection-of")("Set");

},{"./_set-collection-of":94}],134:[function(require,module,exports){
var e = require("./_export");

e(e.P + e.R, "Set", {
  toJSON: require("./_collection-to-json")("Set")
});

},{"./_collection-to-json":48,"./_export":57}],135:[function(require,module,exports){
require("./es6.array.iterator");

for (var t = require("./_global"), e = require("./_hide"), i = require("./_iterators"), r = require("./_wks")("toStringTag"), s = "CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","), L = 0; L < s.length; L++) {
  var a = s[L], l = t[a], S = l && l.prototype;
  S && !S[r] && e(S, r, a), i[a] = i.Array;
}

},{"./_global":60,"./_hide":62,"./_iterators":74,"./_wks":109,"./es6.array.iterator":113}],136:[function(require,module,exports){
"use strict";

function e(e) {
  return e && e.__esModule ? e : {
    default: e
  };
}

function t(e) {
  var t = e.$type, n = e.$pointer, i = Swift._typesByName.get("Swift.String");
  i.canonicalType || (i = i.withGenericParams());
  var r = void 0, a = Memory.alloc(4 * Process.pointerSize), o = void 0, s = t.canonicalType.valueWitnessTable;
  "Existential" === t.kind && "Opaque" === t.canonicalType.getRepresentation() ? (r = Swift._api.swift_getDynamicType(n, t.canonicalType._ptr, 1), 
  o = s.initializeBufferWithCopyOfBuffer) : (r = t.canonicalType._ptr, o = s.initializeBufferWithCopy), 
  o.call(s, a, n, r), Memory.writePointer(a.add(3 * Process.pointerSize), r);
  var l = Memory.alloc(3 * Process.pointerSize);
  Memory.writePointer(l, Swift._api._T0s19_emptyStringStorages6UInt32Vv), Memory.writePointer(l.add(Process.pointerSize), ptr(0)), 
  Memory.writePointer(l.add(2 * Process.pointerSize), ptr(0));
  var p = (Process.getCurrentThreadId(), Swift._api._T0SSs16TextOutputStreamsWP), u = Swift._api.swift_getExistentialTypeMetadata(b.ProtocolClassConstraint.Any, ptr(0), 0, ptr(0)), c = Swift._api._T0s4dumpxx_q_z2toSSSg4nameSi6indentSi8maxDepthSi0E5Itemsts16TextOutputStreamR_r0_lF, f = ptr(0).not().shr(1), d = Memory.alloc(4 * Process.pointerSize), y = [ a, l, ptr(0), ptr(0), ptr(0), 1, ptr(0), f, f, u, i.canonicalType._ptr, p ], v = void 0;
  void 0 === P.indirectResultRegister ? y.unshift(d) : (v = k(c, !1, null, d), c = new NativeFunction(v.callAddr, "void", [ "pointer", "pointer", "pointer", "pointer", "pointer", "int", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer" ])), 
  c.apply(null, y), function(e) {
    var t = new b.OpaqueExistentialContainer(e), n = t.type, i = t.type.valueWitnessTable;
    i.flags.IsNonInline ? new NativeFunction(Memory.readPointer(Swift._api._swift_release), "void", [ "pointer" ])(t.fixedSizeBuffer0) : i.destroy(e, n._ptr);
  }(d);
  var m = Memory.readPointer(Swift._api._T0SS10FoundationE8EncodingV4utf8ACfau()), w = Swift._api._T0SSs14StringProtocolsWP, T = Module.findExportByName("libswiftFoundation.dylib", "_T0s14StringProtocolP10FoundationsAARzSS5IndexVADRtzlE01cA0Says4Int8VGSgSSACE8EncodingV5using_tF");
  v = k(T, !1, l, null);
  var S = new NativeFunction(v.callAddr, "pointer", [ "pointer", "pointer", "pointer" ]), h = S(m, i.canonicalType._ptr, w), g = Memory.readUtf8String(h.add(8 + 3 * Process.pointerSize));
  return Swift._api.swift_unknownRelease(Memory.readPointer(l.add(2 * Process.pointerSize))), 
  Swift._api.swift_bridgeObjectRelease(h), g;
}

function n(e) {
  return "Class" === e.kind || "Existential" === e.kind && "Class" === e.canonicalType.getRepresentation();
}

function i(e, t) {
  if ("Function" !== e.kind) throw new TypeError("this value has a non-function type, so it cannot be called");
  return function() {
    for (var n = e.functionFlags, i = arguments.length, r = Array(i), a = 0; a < i; a++) r[a] = arguments[a];
    if (r.length < n.numArguments) throw new TypeError("missing arguments: " + n.numArguments + " arguments required");
    if (r.length > n.numArguments) throw new TypeError("too many arguments: " + n.numArguments + " arguments required");
    if (n.doesThrow) throw new Error("calling a function that can throw is not yet supported");
    switch (n.convention) {
     case b.FunctionMetadataConvention.Swift:
      if (params.length !== method.args.length) throw new Error("wrong number of parameters");
      for (var s = [], l = 0; l < params.length; l++) {
        var p = method.args[l].type, u = p.canonicalType.valueWitnessTable;
        if (0 !== u.size) if (method.args[l].inout || u.flags.IsNonBitwiseTakable || u.size > P.maxInlineArgument) {
          var c = Memory.alloc(Process.pointerSize);
          c.writePointer(method.args[l].$pointer), s.push({
            val: c,
            size: Process.pointerSize,
            stride: Process.pointerSize
          });
        } else {
          var f = Memory.alloc(u.size);
          !("$pointer" in params[l]) && "fromJS" in p && p.fromJS(f, params[l]) || u.initializeWithCopy(f, params[l].$pointer, p.canonicalType._ptr), 
          s.push({
            val: f,
            size: u.size,
            stide: u.stride
          });
        }
      }
      var d = t, y = !1;
      if (method.returnType) {
        var v = method.returnType.valueWitnessTable;
        if (v.size > P.maxInlineReturn || v.flags.IsNonPOD) {
          y = !0;
          var m = Memory.alloc(v.size);
          s.unshift({
            val: m,
            size: Process.pointerSize,
            stride: Process.pointerSize
          });
        } else for (var w = v.size + v.stride, T = [], S = Process.pointerSize, h = [ 8, 4, 2, 1 ], g = 0; g < h.length; g++) for (var _ = h[g]; _ <= S && w > 0 && w % _ == 0; ) T.push("uint" + (8 * _).toString()), 
        w -= _;
      }
      var z = void 0;
      y && P.indirectResultRegister && (z = s.shift()[0]), cParams = $(params);
      var E = k(method.address, method.doesThrow, d, z);
      new NativeFunction(E.callAddr, "void", cArgTypes).apply(void 0, cParams);
      ;
      if (method.doesThrow && void 0 !== C()) throw new Error("handling errors not yet implemented");
      var M = void 0;
      if (method.returnType) {
        var W = method.returnType.valueWitnessTable, I = void 0;
        if (y) I = s[0][0]; else {
          I = Memory.alloc(W.size);
          for (var j = 0; j < W.size; j += Process.pointerSize) Memory.writePointer(I.add(j), registerState[P.returnRegisters[j]]);
        }
        "toJS" in method.returnType && (M = field.type.toJS(I)), void 0 === M ? M = o(method.returnType, I, !0) : W.destroy(I, method.returnType.canonicalType._ptr);
      }
      return M;

     case b.FunctionMetadataConvention.Block:
      var O = new ObjC.Block(t);
      return O.implementation.apply(O, params);

     case b.FunctionMetadataConvention.Thin:
      throw new Error("calling thin functions not yet supported");

     case b.FunctionMetadataConvention.CFunctionPointer:
      for (var A = (function(e, t) {
        var n = void 0, i = void 0;
        switch (i = "toJS" in argType ? argType.toJS(t.$pointer) : t, argType.toString()) {
         case "Builtin.Int8":
         case "Swift.Int8":
          n = "int8";
          break;

         case "Builtin.UInt8":
         case "Swift.UInt8":
          n = "uint8";
          break;

         case "Builtin.Int16":
         case "Swift.Int16":
          n = "int16";
          break;

         case "Builtin.UInt16":
         case "Swift.UInt16":
          n = "uint16";
          break;

         case "Builtin.Int32":
         case "Swift.Int32":
          n = "int32";
          break;

         case "Builtin.UInt32":
         case "Swift.UInt32":
          n = "uint32";
          break;

         case "Builtin.Int64":
         case "Swift.Int64":
          n = "int64";
          break;

         case "Builtin.UInt64":
         case "Swift.UInt64":
          n = "uint64";
          break;

         case "Swift.Double":
          n = "double";
          break;

         case "Swift.Float":
          n = "float";
          break;

         case "()":
          n = "void", i = void 0;
          break;

         default:
          if (!argType.nominalType || "_T0SP" !== argType.nominalType.mangledName) throw new Error("don't know how to convert a '" + argType.toString() + "' to a C value!");
          n = "pointer", swiftOrJsVal instanceof NativePointer ? i = swiftOrJsVal : void 0 !== i && (i = Memory.readPointer(swiftOrJsVal.$pointer));
        }
        return {
          fridaType: n,
          jsVal: i
        };
      }), x = [], F = [], q = e.getArguments(), B = 0; B < n.numArguments; B++) {
        var N = A(q[B], r[B]);
        if (void 0 === N.jsVal && "void" !== N.fridaType) throw new Error("argument " + B + " must not be undefined");
        F.push(N.fridaType), x.push(N.jsVal);
      }
      var J = A(e.returnType, void 0);
      return new NativeFunction(Memory.readPointer(t), J, F).apply(void 0, x);
    }
  };
}

function r(e, t) {
  for (e.startsWith("$") && (e = "$" + e); e in t; ) e.startsWith("$") || (e = "$" + e), 
  e = "$" + e;
  return t;
}

function a(e, t, n, i) {
  (0, g.default)(e, n, {
    enumerable: !0,
    get: function() {
      var e = i(), n = e;
      if (t.weak) {
        var r = Swift._api.swift_weakLoadStrong(e);
        if (r.isNull()) return null;
        Swift._api.swift_release(r), n = r;
      }
      if ("toJS" in t.type) {
        var a = t.type.toJS(n);
        if (void 0 !== a) return a;
      }
      return new t.type(n);
    },
    set: function(e) {
      var n = i();
      if (t.weak) Swift._api.swift_weakAssign(n, e.$pointer); else {
        var r = !1;
        "fromJS" in t.type && !("$pointer" in e) && (r = t.type.fromJS(pointer, e)), r || type.valueWitnessTable.assignWithCopy(n, e.$pointer, e.$type.canonicalType._ptr);
      }
    }
  });
}

function o(e, s, l) {
  if (!s || s.isNull()) throw new Error("value can't be located at NULL");
  var p = e;
  if ("$kind" in e) return ObjC.Object(Memory.readPointer(s));
  var u = {};
  if ("Function" === e.kind) u = i(e, s); else if (n(e)) {
    var f = Memory.readPointer(s), y = ObjC.api.object_getClass(f);
    e = Swift._typeFromCanonical(y);
  }
  if (u.$staticType = p, u.$type = e, u.$pointer = s, u.toString = t.bind(void 0, u), 
  n(e) && (0, S.default)(u, {
    $isa: {
      enumerable: !0,
      get: function() {
        var e = Memory.readPointer(s);
        return Memory.readPointer(e.add(0));
      }
    },
    $retainCounts: {
      enumerable: !0,
      get: function() {
        var e = Memory.readPointer(s);
        return Swift._api.CFGetRetainCount(e);
      }
    }
  }), "enumCases" in e) {
    var m = e.enumCases();
    if (1 === m.length) u.$enumCase = 0; else if (0 !== m.length) {
      var T = e.nominalType.enum_.getNumPayloadCases();
      Object.defineProperty(u, "$enumCase", {
        enumerable: !0,
        get: function() {
          var t = s;
          return e.canonicalType.valueWitnessTable.getEnumTag(t, e.canonicalType._ptr) + T;
        }
      }), T > 0 && Object.defineProperty(u, "$enumPayloadCopy", {
        enumerable: !0,
        value: function() {
          var t = m[this.$enumCase];
          if (null !== t.type) {
            var n = e.canonicalType.valueWitnessTable, i = Memory.alloc(n.size.toInt32());
            n.initializeWithCopy(i, s, e.canonicalType._ptr), n.destructiveProjectEnumData(i, e.canonicalType._ptr);
            var r = !0;
            if (t.indirect) {
              var a = t.type.canonicalType, l = Memory.alloc(a.valueWitnessTable.size.toInt32());
              payloadVwt.initalizeWithTake(l, Memory.readPointer(i), a._ptr), i = l;
            } else if (t.weak) {
              var p = Swift._api.swift_weakLoadStrong(i);
              if (p.isNull()) return null;
              i = buf, r = !1;
            }
            return o(t.type, i, r);
          }
        }
      }), Object.defineProperty(u, "$setTo", {
        enumerable: !0,
        value: function(t, n) {
          if ("number" == typeof t && (t = m[t]), t && -1 === m.indexOf(t)) throw new Error("invalid case tag " + t.name + " for $setTo on " + e);
          var i = t;
          if (i.type && (null === n || void 0 === n)) throw new Error("$setTo called without a payload, but case '" + i.name + "' requires it");
          if (!i.type && null !== n && void 0 !== n) throw new Error("$setTo called with a payload, but case '" + i.name + "' has none");
          var r = e.canonicalType.valueWitnessTable;
          if (r.destroy(s, e.canonicalType._ptr), i.type) {
            var a = i.type.canonicalType;
            if (i.weak) Swift._api.swift_weakInit(payload, n.$pointer); else if (i.indirect) {
              var o = Swift._api.swift_allocBox(i.type.canonicalType._ptr)[1];
              a.valueWitnessTable.initializeWithCopy(o, n.$pointer, a._ptr), Memory.writePointer(s, o);
            } else a.valueWitnessTable.initializeWithCopy(s, n.$pointer, a._ptr);
          }
          r.destructiveInjectEnumTag(s, t.tag, e.canonicalType._ptr);
        }
      });
    }
  }
  if ("fields" in e) for (var h = e.fields(), _ = Array.isArray(h), P = 0, h = _ ? h : (0, 
  w.default)(h); ;) {
    var k, C = function() {
      if (_) {
        if (P >= h.length) return "break";
        k = h[P++];
      } else {
        if (P = h.next(), P.done) return "break";
        k = P.value;
      }
      var t = k, n = function() {
        var n = void 0;
        if ("Struct" === e.kind) n = s.add(t.offset); else {
          n = Memory.readPointer(s).add(t.offset);
        }
        return n;
      }, i = r(t.name, u);
      a(u, t, i, n);
    }();
    if ("break" === C) break;
  }
  if ("Existential" === e.kind && "Opaque" === e.canonicalType.getRepresentation() && Object.defineProperty(u, "$value", {
    enumerable: !0,
    get: function() {
      var e = new b.OpaqueExistentialContainer(s), t = Swift._typeFromCanonical(e.type._ptr);
      return n(t) || !t.canonicalType.valueWitnessTable.isValueInline ? o(t, s, !1) : o(t, e.heapObject, !1);
    },
    set: function(e) {
      for (var t = [], i = p.canonicalType.protocols.protocols, r = 0; r < i.length; r++) {
        var a = i[r], o = Swift._api.swift_conformsToProtocol(e.$type.canonicalType._ptr, a._ptr);
        if (o.isNull()) throw new Error("this value does not implement the required protocol '" + a.name + "'");
        t.push(o);
      }
      var l = new b.OpaqueExistentialContainer(s), u = l.type.canonicalType.valueWitnessTable;
      n(l.type) ? Swift._api.swift_release(l.heapObject) : u.isValueInline ? u.destroy(s) : u.destroy(l.heapObject), 
      e.$type.canonicalType.valueWitnessTable.initializeBufferWithCopy(s, e.$pointer, e.$type.canonicalType._ptr), 
      l.type = e.$type;
      for (var c = 0; c < t.length; c++) l.setWitnessTable(c, t[c]);
    }
  }), "tupleElements" in e) for (var $ = 0, z = e.tupleElements(), E = Array.isArray(z), M = 0, z = E ? z : (0, 
  w.default)(z); ;) {
    var W, I = function() {
      if (E) {
        if (M >= z.length) return "break";
        W = z[M++];
      } else {
        if (M = z.next(), M.done) return "break";
        W = M.value;
      }
      var e = W;
      if (a(u, e, $.toString(), function() {
        return s.add(e.offset);
      }), null !== e.label) {
        var t = $;
        (0, g.default)(u, r(e.label, u), {
          enumerable: !0,
          get: function() {
            return u[t];
          },
          set: function(e) {
            u[t] = e;
          }
        });
      }
      $++;
    }();
    if ("break" === I) break;
  }
  var j = function() {
    (0, v.default)(u).forEach(function(e) {
      return (0, d.default)(u, e);
    }), s = void 0, e = void 0;
  };
  if (l) {
    u.$destroy = function() {
      e.canonicalType.valueWitnessTable._destroy(s, e.canonicalType._ptr), j();
    };
    var O = function() {
      try {
        void 0 !== s && u.$destroy();
      } catch (e) {
        console.log("unhandled error while cleaning up owned Swift value: " + e);
      }
    }, A = Duktape.fin(s);
    Duktape.fin(s, function(e, t) {
      t || O(), A(e, t);
    });
  }
  return u.$assignWithCopy = function(t) {
    if ("$kind" in t) throw new Error("ObjC types not yet supported");
    if ("fromJS" in e && !("$pointer" in t)) return e.fromJS(s, t), this;
    p.canonicalType.valueWitnessTable.assignWithCopy(s, t.$pointer, p.canonicalType._ptr);
    var n = o(t.$type, s, l);
    return j(), n;
  }, u.$allocCopy = function() {
    var t = e.canonicalType.valueWitnessTable, n = Memory.alloc(t.size.toInt32());
    return t.initializeWithCopy(n, s, e.canonicalType._ptr), o(e, n, !0);
  }, (0, c.default)(u), u;
}

function s(e) {
  if (!e.canonicalType) throw new Error("the type of a value must have a canonical type descriptor!");
  var t = void 0;
  return t = function(e) {
    return o(t, e, !1);
  }, (0, p.default)(t, "name", {
    value: e.toString()
  }), t;
}

var l = require("babel-runtime/core-js/reflect/define-property"), p = e(l), u = require("babel-runtime/core-js/object/prevent-extensions"), c = e(u), f = require("babel-runtime/core-js/reflect/delete-property"), d = e(f), y = require("babel-runtime/core-js/object/keys"), v = e(y), m = require("babel-runtime/core-js/get-iterator"), w = e(m), T = require("babel-runtime/core-js/object/define-properties"), S = e(T), h = require("babel-runtime/core-js/object/define-property"), g = e(h), b = require("./metadata"), _ = require("./calling-convention"), P = _.convention, k = _.makeCallTrampoline, C = _.checkTrampolineError, $ = _.convertToCParams;

module.exports = {
  makeSwiftValue: s
};

},{"./calling-convention":1,"./metadata":5,"babel-runtime/core-js/get-iterator":7,"babel-runtime/core-js/object/define-properties":11,"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/keys":15,"babel-runtime/core-js/object/prevent-extensions":16,"babel-runtime/core-js/reflect/define-property":17,"babel-runtime/core-js/reflect/delete-property":18}],137:[function(require,module,exports){
"use strict";

function t(t) {
  return t && t.__esModule ? t : {
    default: t
  };
}

function e(t) {
  var e = void 0;
  for (e = 0; 0 !== Memory.readU8(t.add(e)); e++) ;
  return e;
}

function n(t) {
  var e = T.get(t._ptr.toString());
  if (e) return e;
  var n = Memory.alloc(Process.pointerSize);
  Memory.writePointer(n, t._ptr);
  var r = Swift._api.swift_getExistentialTypeMetadata(y.ProtocolClassConstraint.Any, ptr(0), 1, n);
  r = new y.TargetMetadata(r), r.protocols.arrayLocation.toString() === n.toString() && w.push(n);
  var a = Swift.isSwiftName(t.name) ? Swift.demangle(t.name) : t.name, s = new i(null, r, a);
  return T.set(t._ptr.toString(), s), s;
}

function i(t, r, a, o) {
  var u = this;
  if (r && S.has(r._ptr.toString())) {
    var f = S.get(r._ptr.toString());
    return a && !f.fixedName && (f.fixedName = a), f;
  }
  if (o) {
    if (t || r || !a) throw new Error("type access function must only be provided if the type is not known");
    this.fixedName = a, this.accessFunction = o;
  }
  if (this.nominalType = t, !t && r && (this.nominalType = r.getNominalTypeDescriptor(), 
  "Class" === r.kind)) for (var d = r; null === this.nominalType && d.isTypeMetadata() && d.isArtificialSubclass() && null !== d.superClass; ) d = d.superClass, 
  this.nominalType = d.getNominalTypeDescriptor();
  if (r && ("Class" === r.kind && r.isTypeMetadata() && !r.flags.UsesSwift1Refcounting || "ObjCClassWrapper" === r.kind) && (this.toJS = function(t) {
    return ObjC.Object(Memory.readPointer(t));
  }, this.fromJS = function(t, e) {
    return Swift._api.objc_storeStrong(t, e), !0;
  }, this.getSize = function() {
    return Process.pointerSize;
  }), this.canonicalType = r, this.kind = r ? r.kind : o ? "Unknown" : null, this.nominalType && !r && (o = this.nominalType.accessFunction), 
  o && (this.withGenericParams = function() {
    for (var t = arguments.length, e = Array(t), n = 0; n < t; n++) e[n] = arguments[n];
    if (this.nominalType && !this.nominalType.genericParams.flags.HasGenericParent && e.length != this.nominalType.genericParams.numGenericRequirements) throw new Error("wrong number of generic parameters");
    for (var r = [], a = [], s = e, l = Array.isArray(s), u = 0, s = l ? s : (0, p.default)(s); ;) {
      var c;
      if (l) {
        if (u >= s.length) break;
        c = s[u++];
      } else {
        if (u = s.next(), u.done) break;
        c = u.value;
      }
      var f = c;
      if (f.isGeneric() || !f.canonicalType) throw new Error("generic type parameter needs all own type parameters filled!");
      r.push("pointer"), a.push(f.toString());
    }
    var d = this.toString();
    0 !== a.length && (d += "<" + a.join(", ") + ">");
    var h = new NativeFunction(o, "pointer", r), m = h.apply(null, e.map(function(t) {
      return t.canonicalType._ptr;
    }));
    return new i(this.nominalType, new y.TargetMetadata(m), d);
  }), this.nominalType && r && ("Enum" === this.kind || "Optional" === this.kind)) {
    var h = null;
    this.enumCases = function() {
      if (h) return h;
      for (var t = this.nominalType.enum_, n = t.getNumCases(), a = t.getNumPayloadCases(), s = [], o = t.caseNames, l = new NativeFunction(t.getCaseTypes, "pointer", [ "pointer" ]), u = l(r._ptr), c = 0; c < n; c++) {
        var f = null, p = 0;
        c < a && (f = Memory.readPointer(u.add(c * Process.pointerSize)), p = f.and(y.FieldTypeFlags.typeMask), 
        f = new y.TargetMetadata(f.and(~y.FieldTypeFlags.typeMask))), s.push({
          tag: c - a,
          name: null === o ? null : Memory.readUtf8String(o),
          type: null === f ? null : new i(null, f, "case " + (c - a) + " of " + this),
          indirect: (p & y.FieldTypeFlags.Indirect) === y.FieldTypeFlags.Indirect,
          weak: (p & y.FieldTypeFlags.Weak) === y.FieldTypeFlags.Weak
        }), o = null === o ? null : o.add(e(o) + 1);
      }
      return h = s, s;
    };
  }
  if (-1 !== [ "Class", "Struct" ].indexOf(this.kind) && r && (this.fields = function() {
    for (var t = [], n = [ r ]; n[n.length - 1].superClass; ) n.push(n[n.length - 1].superClass);
    for (var a = ptr(0), s = n.length; s--; ) {
      var o = n[s], l = -1 != [ "Class", "Struct" ].indexOf(o.kind) ? o.getNominalTypeDescriptor() : null;
      if (l) {
        var u = "Class" === l.getKind() ? l.clas : l.struct;
        if (!u.hasFieldOffsetVector()) throw new Error("fields without offset vector not implemented");
        for (var c = new NativeFunction(u.getFieldTypes, "pointer", [ "pointer" ]), f = c(o._ptr), p = u.fieldNames, d = o._ptr.add(u.fieldOffsetVectorOffset * Process.pointerSize), h = 0; h < u.numFields; h++) {
          var m = Memory.readPointer(f.add(h * Process.pointerSize)), g = m.and(y.FieldTypeFlags.typeMask);
          m = new y.TargetMetadata(m.and(ptr(y.FieldTypeFlags.typeMask).not()));
          var w = Memory.readPointer(d.add(h * Process.pointerSize)), S = Memory.readUtf8String(p);
          y.FieldTypeFlags.Weak, y.FieldTypeFlags.Weak, new i(null, m, "?Unknown type of " + this + "." + S);
          t.push({
            name: S,
            offset: a.add(w),
            type: new i(null, m, "?Unknown type of " + this + "." + S),
            weak: (g & y.FieldTypeFlags.Weak) === y.FieldTypeFlags.Weak
          }), p = p.add(e(p) + 1);
        }
      }
    }
    return t;
  }), "Existential" === this.kind && r && (this.protocols = function() {
    return r.protocols.map(n);
  }, this.combineWith = function(t) {
    if ("Existential" !== t.kind) throw new Error("can only combine existential types with each other");
    var e = r.protocols.concat(t.canonicalType.protocols);
    e.sort(function(t, e) {
      return t.name < e.name ? -1 : t.name > e.name ? 1 : t._ptr.compare(e._ptr);
    });
    for (var n = 1; n < e.length; n++) e[n - 1]._ptr.toString() === e[n]._ptr.toString() && (e.splice(n, 1), 
    n--);
    var a = Memory.alloc(e.length * Process.pointerSize);
    w.push(a);
    for (var s = [], o = 0; o < e.length; o++) Memory.writePointer(a.add(o * Process.pointerSize), e[o]._ptr), 
    s.push(e[o].name);
    var l = r.isClassBounded() || t.canonicalType.isClassBounded() ? "Class" : "Any";
    l = y.ProtocolClassConstraint[l];
    var u = r.getSuperclassConstraint();
    u = null === u ? ptr(0) : u._ptr;
    var c = Swift._api.swift_getExistentialTypeMetadata(l, u, e.length, a);
    return new i(null, new y.TargetMetadata(c), s.join(" + "));
  }, r.isClassBounded() ? (this.isClassBounded = !0, this.getSuperclassConstraint = function() {
    var t = r.getSuperclassConstraint();
    return t ? new i(null, t) : null;
  }, this.withoutClassBound = function() {
    var t = r.protocols, e = Swift._api.swift_getExistentialTypeMetadata(y.ProtocolClassConstraint.Any, ptr(0), t.length, t.arrayLocation);
    return new i(null, new y.TargetMetadata(e));
  }) : (this.isClassBounded = !1, this.withClassBound = function() {
    var t = r.protocols, e = Swift._api.swift_getExistentialTypeMetadata(y.ProtocolClassConstraint.Class, ptr(0), t.length, t.arrayLocation);
    return new i(null, new y.TargetMetadata(e));
  }), r.isObjC() ? this.isObjC = !0 : (this.isObjC = !1, "getSuperclassConstraint" in this && this.getSuperclassConstraint() ? this.withoutSuperclassConstraint = function() {
    var t = r.protocols, e = Swift._api.swift_getExistentialTypeMetadata(y.ProtocolClassConstraint.Class, ptr(0), t.length, t.arrayLocation);
    return new i(null, new y.TargetMetadata(e));
  } : this.withSuperclassConstraint = function(t) {
    var e = r.protocols, n = Swift._api.swift_getExistentialTypeMetadata(y.ProtocolClassConstraint.Class, t.canonicalType._ptr, e.length, e.arrayLocation);
    return new i(null, new y.TargetMetadata(n));
  })), "Tuple" === this.kind && (this.tupleElements = function() {
    var t = r.labels;
    t = t.isNull() ? null : Memory.readUtf8String(t).split(" ");
    for (var e = [], n = r.elements, a = 0; a < r.numElements; a++) e.push({
      label: t && t[a] ? t[a] : null,
      type: new i(null, n[a].type),
      offset: n[a].offset
    });
    return e;
  }), "Function" === this.kind && (this.returnType = function() {
    return new i(null, r.resultType);
  }, this.functionFlags = function() {
    return r.flags;
  }, this.getArguments = function() {
    return r.getArguments().map(function(t) {
      return {
        inout: t.inout,
        type: new i(null, t.type)
      };
    });
  }), "Opaque" == this.kind) {
    if (!a) throw new Error("a name is required when creating Opaque types");
    this.fixedName = a, this.getCType = function() {
      return {
        "Builtin.Int8": "int8",
        "Builtin.Int16": "int16",
        "Builtin.Int32": "int32",
        "Builtin.Int64": "int64",
        "Builtin.UInt8": "uint8",
        "Builtin.UInt16": "uint16",
        "Builtin.UInt32": "uint32",
        "Builtin.UInt64": "uint64",
        "Builtin.RawPointer": "pointer"
      }[this.fixedName];
    }, this.getSize = function() {
      return {
        "Builtin.Int8": 1,
        "Builtin.Int16": 2,
        "Builtin.Int32": 4,
        "Builtin.Int64": 8,
        "Builtin.Int128": 16,
        "Builtin.Int256": 32,
        "Builtin.Int512": 64,
        "Builtin.UInt8": 1,
        "Builtin.UInt16": 2,
        "Builtin.UInt32": 4,
        "Builtin.UInt64": 8,
        "Builtin.UInt128": 16,
        "Builtin.UInt256": 32,
        "Builtin.UInt512": 64,
        "Builtin.RawPointer": Process.pointerSize
      }[this.fixedName];
    }, this.toJS = function(t) {
      if ("Builtin.RawPointer" === this.fixedName) return Memory.readPointer(t);
      var e = this.getSize();
      if (!(void 0 === e || e > 8)) return 0 === this.fixedName.indexOf("Builtin.Int") ? Memory["readS" + 8 * e](t) : 0 === this.fixedName.indexOf("Builtin.UInt") ? Memory["readU" + 8 * e](t) : void 0;
    }, this.fromJS = function(t, e) {
      if ("Builtin.RawPointer" === this.fixedName) return Memory.writePointer(t, e), !0;
      var n = this.getSize();
      return !(void 0 === n || n > 8) && (0 === this.fixedName.indexOf("Builtin.Int") ? (Memory["writeS" + 8 * n](t, e), 
      !0) : 0 === this.fixedName.indexOf("Builtin.UInt") && (Memory["writeU" + 8 * n](t, e), 
      !0));
    };
  }
  if (r && "Class" === this.kind && (this.superClass = function() {
    var t = r.superClass;
    return null === t ? null : new i(null, t, "?superClass of " + this);
  }), r && ("Class" !== this.kind || r.isTypeMetadata())) {
    if (!("getSize" in this)) {
      var g = r.valueWitnessTable.size;
      this.getSize = function() {
        return g;
      };
    }
    "getGenericArgs" in r && (this.getGenericParams = function() {
      return r.getGenericArgs().map(function(t) {
        return null === t ? null : new i(null, t);
      });
    });
  }
  if ("ObjCClassWrapper" === this.kind && (this.getObjCObject = function() {
    return ObjC.Object(r.class_);
  }), -1 !== [ "ExistentialMetatype", "Metatype" ].indexOf(this.kind) && (this.instanceType = function() {
    return new i(null, r.instanceType);
  }), r) {
    switch (this.toString()) {
     case "Swift.String":
      this.fromJS = function(t, e) {
        r.valueWitnessTable.destroy(t, r._ptr);
        var n = Memory.allocUtf8String(e);
        return api.swift_stringFromUTF8InRawMemory(t, n, e.length), !0;
      };

     case "Swift.Bool":
      this.toJS = function(t) {
        return 0 !== Memory.readU8(t);
      }, this.fromJS = function(t, e) {
        return Memory.writeU8(t, e ? 1 : 0), !0;
      }, this.getSize = function() {
        return 1;
      };
      break;

     case "Swift.UInt":
      this.toJS = function(t) {
        return Memory.readULong(t);
      }, this.fromJS = function(t, e) {
        return Memory.writeULong(t, e), !0;
      }, this.getSize = function() {
        return Process.pointerSize;
      };
      break;

     case "Swift.Int":
      this.toJS = function(t) {
        return Memory.readLong(t);
      }, this.fromJS = function(t, e) {
        return Memory.writeLong(t, e), !0;
      }, this.getSize = function() {
        return Process.pointerSize;
      };
      break;

     case "Swift.Int8":
     case "Swift.Int16":
     case "Swift.Int32":
     case "Swift.Int64":
     case "Swift.Int128":
     case "Swift.Int256":
     case "Swift.Int512":
     case "Swift.UInt8":
     case "Swift.UInt16":
     case "Swift.UInt32":
     case "Swift.UInt64":
     case "Swift.UInt128":
     case "Swift.UInt256":
     case "Swift.UInt512":
     case "Swift.RawPointer":
      this.toJS = function(t) {
        return u.fields()[0].type.toJS(t);
      }, this.fromJS = function(t, e) {
        return u.fields()[0].type.fromJS(t, e);
      }, this.getSize = function() {
        return u.fields()[0].type.getSize();
      };
    }
    Object.defineProperty(this, "Type", {
      enumerable: !0,
      get: function() {
        var t = void 0;
        return t = "Existential" === this.kind || "ExistentialMetatype" === this.kind ? Swift._api.swift_getExistentialMetatypeMetadata(r._ptr) : Swift._api.swift_getMetatypeMetadata(r._ptr), 
        new i(null, new y.TargetMetadata(t), this.toString() + ".Type");
      }
    });
  }
  if (!this.isGeneric()) {
    if (r) {
      var T = m.makeSwiftValue(this);
      return (0, c.default)(T, (0, l.default)(this)), (0, s.default)(T, i.prototype), 
      S.set(this.canonicalType._ptr.toString(), T), T;
    }
    return this.withGenericParams();
  }
}

function r(t) {
  function e(t) {
    if (t.canonicalType) return 0;
    if (t.nominalType) return 1;
    if (t.accessFunction) return 2;
    throw new Error("invalid state of type object");
  }
  function r(t) {
    if (null !== t) {
      var n = t.toString(), i = u.get(n);
      (!i || e(t) < e(i)) && (u.set(n, t), c.push(t));
    }
  }
  for (var a = Memory.alloc(8), s = Memory.allocUtf8String("__TEXT"), o = [ Memory.allocUtf8String("__swift2_types"), Memory.allocUtf8String("__swift2_proto") ], l = [ 8, 16 ], u = new h.default(), c = [], f = Process.enumerateModulesSync(), d = Array.isArray(f), m = 0, f = d ? f : (0, 
  p.default)(f); ;) {
    var g;
    if (d) {
      if (m >= f.length) break;
      g = f[m++];
    } else {
      if (m = f.next(), m.done) break;
      g = m.value;
    }
    for (var w = g, S = 0; S < o.length; S++) {
      var T = t.getsectiondata(w.base, s, o[S], a);
      if (!T.isNull()) for (var v = Memory.readULong(a), C = 0; C < v; C += l[S]) {
        var _ = void 0, M = null;
        0 === S ? _ = new y.TargetTypeMetadataRecord(T.add(C)) : (_ = new y.TargetProtocolConformanceRecord(T.add(C)), 
        M = n(_.protocol), r(M));
        var b = null;
        _.getTypeKind() === y.TypeMetadataRecordKind.UniqueNominalTypeDescriptor && (b = _.getNominalTypeDescriptor());
        var P = _.getCanonicalTypeMetadata(t);
        b || P ? r(new i(b, P)) : console.log("metadata record without nominal or canonical type?! @" + T.add(C) + " of section " + S + " in " + w.name + " " + _.getTypeKind() + " " + M);
      }
    }
    for (var k = Module.enumerateExportsSync(w.name), I = Array.isArray(k), x = 0, k = I ? k : (0, 
    p.default)(k); ;) {
      var U;
      if (I) {
        if (x >= k.length) break;
        U = k[x++];
      } else {
        if (x = k.next(), x.done) break;
        U = x.value;
      }
      var F = U;
      if (Swift.isSwiftName(F.name)) {
        var B = Swift.demangle(F.name);
        if (B.startsWith("type metadata for ")) for (var E = B.substr("type metadata for ".length), N = 0; N < 2; N++) {
          var j = F.address.add(Process.pointerSize * N);
          if (Memory.readPointer(j).toString(10) in y.MetadataKind) {
            r(new i(null, new y.TargetMetadata(j), E));
            break;
          }
        } else if (B.startsWith("nominal type descriptor for ")) {
          var A = B.substr("nominal type descriptor for ".length);
          r(new i(new y.TargetNominalTypeDescriptor(F.address), null, A));
        } else if (B.startsWith("type metadata accessor for ")) {
          var O = B.substr("type metadata accessor for ".length);
          r(new i(null, null, O, F.address));
        }
      }
    }
  }
  if (!u.has("Any")) {
    var z = Swift._api.swift_getExistentialTypeMetadata(y.ProtocolClassConstraint.Any, ptr(0), 0, ptr(0));
    z = new i(null, new y.TargetMetadata(z), "Any"), u.set("Any", z);
  }
  if (!u.has("Swift.AnyObject")) {
    var G = Swift._api.swift_getExistentialTypeMetadata(y.ProtocolClassConstraint.Class, ptr(0), 0, ptr(0));
    G = new i(null, new y.TargetMetadata(G), "Swift.AnyObject"), u.set("Swift.AnyObject", G);
  }
  if (!u.has("Swift.AnyObject.Type")) {
    var J = u.get("Swift.AnyObject"), W = J.Type;
    u.set("Swift.AnyObject.Type", W), u.set("Swift.AnyClass", W);
  }
  for (u.set("()", Swift.makeTupleType([], [])), u.set("Void", u.get("()")); c.length; ) {
    var q = c.pop();
    if ("enumCases" in q && q.enumCases().forEach(function(t) {
      return r(t.type);
    }), "fields" in q && q.fields().forEach(function(t) {
      return r(t.type);
    }), "tupleElements" in q && q.tupleElements().forEach(function(t) {
      return r(t.type);
    }), "getArguments" in q && q.getArguments().forEach(function(t) {
      return r(t.type);
    }), "returnType" in q && r(q.returnType()), "superClass" in q && r(q.superClass()), 
    "instanceType" in q && r(q.instanceType()), "getGenericParams" in q && q.getGenericParams().forEach(r), 
    "getSuperclassConstraint" in q && r(q.getSuperclassConstraint()), "Existential" === q.kind && q.canonicalType) for (var R = q.canonicalType.protocols, L = Array.isArray(R), D = 0, R = L ? R : (0, 
    p.default)(R); ;) {
      var K;
      if (L) {
        if (D >= R.length) break;
        K = R[D++];
      } else {
        if (D = R.next(), D.done) break;
        K = D.value;
      }
      var V = K;
      r(n(V));
      for (var H = V.inheritedProtocols, X = Array.isArray(H), Q = 0, H = X ? H : (0, 
      p.default)(H); ;) {
        var Y;
        if (X) {
          if (Q >= H.length) break;
          Y = H[Q++];
        } else {
          if (Q = H.next(), Q.done) break;
          Y = Q.value;
        }
        var Z = Y;
        r(n(Z));
      }
    }
  }
  return u;
}

var a = require("babel-runtime/core-js/reflect/set-prototype-of"), s = t(a), o = require("babel-runtime/core-js/object/get-own-property-descriptors"), l = t(o), u = require("babel-runtime/core-js/object/define-properties"), c = t(u), f = require("babel-runtime/core-js/get-iterator"), p = t(f), d = require("babel-runtime/core-js/map"), h = t(d), y = require("./metadata"), m = require("./swift-value"), g = require("./mangling"), w = [], S = new h.default(), T = new h.default();

i.prototype = {
  constructor: i,
  isGeneric: function() {
    return !!this.accessFunction || !(!this.nominalType || this.canonicalType) && this.nominalType.genericParams.isGeneric();
  },
  toString: function() {
    if ("_name" in this) return this._name;
    if (this.canonicalType) {
      var t = Swift._api.swift_getTypeName(this.canonicalType._ptr, 1), e = t[0], n = t[1], r = Memory.readUtf8String(e, n.toInt32());
      if (0 !== r.length && "<<< invalid type >>>" !== r) return this._name = r, r;
      switch (this.kind) {
       case "Tuple":
        return this._name = "(" + this.tupleElements().map(function(t) {
          return (null === t.label ? "" : t.label + ": ") + t.type.toString();
        }).join(", ") + ")", this._name;

       case "Function":
        return this._name = "@convention(" + y.FunctionConventionStrings[this.functionFlags().convention] + ") (" + this.getArguments().map(function(t) {
          return (t.inout ? "inout " : "") + t.type.toString();
        }).join(", ") + ") -> " + this.returnType().toString(), this._name;

       case "ObjCClassWrapper":
        return this._name = Memory.readUtf8String(ObjC.api.class_getName(this.canonicalType.class_)), 
        this._name;

       case "ExistentialMetatype":
       case "Metatype":
        return this._name = this.instanceType().toString() + ".Type", this._name;

       case "ForeignClass":
        return this._name = Swift.demangle(g.MANGLING_PREFIX + "0" + this.canonicalType.name), 
        this._name;

       case "Class":
        if (this.canonicalType.isPureObjC()) return this._name = Memory.readUtf8String(ObjC.api.class_getName(this.canonicalType._ptr)), 
        this._name;
        break;

       case "Existential":
        var a = this.canonicalType.protocols.map(function(t) {
          return Swift.isSwiftName(t.name) ? Swift.demangle(t.name) : t.name;
        });
        this.isClassBounded && a.push("Swift.AnyObject");
        var s = a.length ? a.join(" & ") : "Any";
        return this.canonicalType.getSuperclassConstraint() && (s += " : " + new i(null, this.canonicalType.getSuperclassConstraint()).toString()), 
        this._name = s, s;
      }
    }
    if (this.nominalType) {
      var o = Swift.demangle(this.nominalType.mangledName);
      if (this.nominalType.genericParams.isGeneric()) {
        var l = [];
        if ("getGenericParams" in this) l = this.getGenericParams().map(function(t) {
          return t.toString();
        }); else {
          this.nominalType.genericParams.flags.HasGenericParent && l.push("[inherited generic parameters]");
          for (var u = this.nominalType.genericParams.numPrimaryParams, c = 0; c < u; c++) l.push("_T" + c);
        }
        o += "<" + l.join(", ") + ">";
      }
      return this._name = o, o;
    }
    if (this.fixedName) return this._name = this.fixedName, this.fixedName;
    throw new Error("cannot get string representation for type without nominal or canonical type information");
  }
}, module.exports = {
  findAllTypes: r,
  Type: i
};

},{"./mangling":4,"./metadata":5,"./swift-value":136,"babel-runtime/core-js/get-iterator":7,"babel-runtime/core-js/map":8,"babel-runtime/core-js/object/define-properties":11,"babel-runtime/core-js/object/get-own-property-descriptors":14,"babel-runtime/core-js/reflect/set-prototype-of":19}]},{},[2]);
//https://github.com/zengfr/frida-codeshare-scripts
//338807679 @maltek/disable-certificate-pinning-alamofire
