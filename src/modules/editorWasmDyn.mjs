/* eslint-disable */ 
var Editor = (function() {
  var _scriptDir = '/editor.wasm';
  
  return (
function(Editor) {
  Editor = Editor || {};


var d;
d || (d = typeof Editor !== 'undefined' ? Editor : {});
var aa, q;
d.ready = new Promise(function(a, b) {
  aa = a;
  q = b;
});
var t = {}, v;
for (v in d) {
  d.hasOwnProperty(v) && (t[v] = d[v]);
}
var w = "";
"undefined" !== typeof document && document.currentScript && (w = document.currentScript.src);
_scriptDir && (w = _scriptDir);
0 !== w.indexOf("blob:") ? w = w.substr(0, w.lastIndexOf("/") + 1) : w = "";
var x = d.printErr || console.warn.bind(console);
for (v in t) {
  t.hasOwnProperty(v) && (d[v] = t[v]);
}
t = null;
var y;
d.wasmBinary && (y = d.wasmBinary);
var noExitRuntime = d.noExitRuntime || !0;
"object" !== typeof WebAssembly && z("no native wasm support detected");
var A, ba = !1, ca = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;
function da(a, b, c) {
  var e = B;
  if (0 < c) {
    c = b + c - 1;
    for (var f = 0; f < a.length; ++f) {
      var g = a.charCodeAt(f);
      if (55296 <= g && 57343 >= g) {
        var h = a.charCodeAt(++f);
        g = 65536 + ((g & 1023) << 10) | h & 1023;
      }
      if (127 >= g) {
        if (b >= c) {
          break;
        }
        e[b++] = g;
      } else {
        if (2047 >= g) {
          if (b + 1 >= c) {
            break;
          }
          e[b++] = 192 | g >> 6;
        } else {
          if (65535 >= g) {
            if (b + 2 >= c) {
              break;
            }
            e[b++] = 224 | g >> 12;
          } else {
            if (b + 3 >= c) {
              break;
            }
            e[b++] = 240 | g >> 18;
            e[b++] = 128 | g >> 12 & 63;
          }
          e[b++] = 128 | g >> 6 & 63;
        }
        e[b++] = 128 | g & 63;
      }
    }
    e[b] = 0;
  }
}
var ea = "undefined" !== typeof TextDecoder ? new TextDecoder("utf-16le") : void 0;
function fa(a, b) {
  var c = a >> 1;
  for (var e = c + b / 2; !(c >= e) && C[c];) {
    ++c;
  }
  c <<= 1;
  if (32 < c - a && ea) {
    return ea.decode(B.subarray(a, c));
  }
  c = "";
  for (e = 0; !(e >= b / 2); ++e) {
    var f = E[a + 2 * e >> 1];
    if (0 == f) {
      break;
    }
    c += String.fromCharCode(f);
  }
  return c;
}
function ha(a, b, c) {
  void 0 === c && (c = 2147483647);
  if (2 > c) {
    return 0;
  }
  c -= 2;
  var e = b;
  c = c < 2 * a.length ? c / 2 : a.length;
  for (var f = 0; f < c; ++f) {
    E[b >> 1] = a.charCodeAt(f), b += 2;
  }
  E[b >> 1] = 0;
  return b - e;
}
function ia(a) {
  return 2 * a.length;
}
function ja(a, b) {
  for (var c = 0, e = ""; !(c >= b / 4);) {
    var f = F[a + 4 * c >> 2];
    if (0 == f) {
      break;
    }
    ++c;
    65536 <= f ? (f -= 65536, e += String.fromCharCode(55296 | f >> 10, 56320 | f & 1023)) : e += String.fromCharCode(f);
  }
  return e;
}
function ka(a, b, c) {
  void 0 === c && (c = 2147483647);
  if (4 > c) {
    return 0;
  }
  var e = b;
  c = e + c - 4;
  for (var f = 0; f < a.length; ++f) {
    var g = a.charCodeAt(f);
    if (55296 <= g && 57343 >= g) {
      var h = a.charCodeAt(++f);
      g = 65536 + ((g & 1023) << 10) | h & 1023;
    }
    F[b >> 2] = g;
    b += 4;
    if (b + 4 > c) {
      break;
    }
  }
  F[b >> 2] = 0;
  return b - e;
}
function la(a) {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var e = a.charCodeAt(c);
    55296 <= e && 57343 >= e && ++c;
    b += 4;
  }
  return b;
}
var G, H, B, E, C, F, I, ma, na;
function oa() {
  var a = A.buffer;
  G = a;
  d.HEAP8 = H = new Int8Array(a);
  d.HEAP16 = E = new Int16Array(a);
  d.HEAP32 = F = new Int32Array(a);
  d.HEAPU8 = B = new Uint8Array(a);
  d.HEAPU16 = C = new Uint16Array(a);
  d.HEAPU32 = I = new Uint32Array(a);
  d.HEAPF32 = ma = new Float32Array(a);
  d.HEAPF64 = na = new Float64Array(a);
}
var J, pa = [], qa = [], ra = [], sa = [];
qa.push({C:function() {
  ta();
}});
function ua() {
  var a = d.preRun.shift();
  pa.unshift(a);
}
var K = 0, L = null, M = null;
d.preloadedImages = {};
d.preloadedAudios = {};
function z(a) {
  if (d.onAbort) {
    d.onAbort(a);
  }
  x(a);
  ba = !0;
  a = new WebAssembly.RuntimeError("abort(" + a + "). Build with -s ASSERTIONS=1 for more info.");
  q(a);
  throw a;
}
function va() {
  var a = N;
  return String.prototype.startsWith ? a.startsWith("data:application/octet-stream;base64,") : 0 === a.indexOf("data:application/octet-stream;base64,");
}
var N = "editorDyn.wasm";
if (!va()) {
  var wa = N;
  N = d.locateFile ? d.locateFile(wa, w) : w + wa;
}
function xa() {
  var a = N;
  try {
    if (a == N && y) {
      return new Uint8Array(y);
    }
    throw "both async and sync fetching of the wasm failed";
  } catch (b) {
    z(b);
  }
}
function ya() {
  return y || "function" !== typeof fetch ? Promise.resolve().then(function() {
    return xa();
  }) : fetch(N, {credentials:"same-origin"}).then(function(a) {
    if (!a.ok) {
      throw "failed to load wasm binary file at '" + N + "'";
    }
    return a.arrayBuffer();
  }).catch(function() {
    return xa();
  });
}
function O(a) {
  for (; 0 < a.length;) {
    var b = a.shift();
    if ("function" == typeof b) {
      b(d);
    } else {
      var c = b.C;
      "number" === typeof c ? void 0 === b.B ? J.get(c)() : J.get(c)(b.B) : c(void 0 === b.B ? null : b.B);
    }
  }
}
function P(a) {
  switch(a) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 4:
      return 2;
    case 8:
      return 3;
    default:
      throw new TypeError("Unknown type size: " + a);
  }
}
var za = void 0;
function Q(a) {
  for (var b = ""; B[a];) {
    b += za[B[a++]];
  }
  return b;
}
var R = {}, Aa = {}, Ba = {};
function Ca(a, b) {
  if (void 0 === a) {
    a = "_unknown";
  } else {
    a = a.replace(/[^a-zA-Z0-9_]/g, "$");
    var c = a.charCodeAt(0);
    a = 48 <= c && 57 >= c ? "_" + a : a;
  }
  return (new Function("body", "return function " + a + '() {\n    "use strict";    return body.apply(this, arguments);\n};\n'))(b);
}
function Da(a) {
  var b = Error, c = Ca(a, function(e) {
    this.name = a;
    this.message = e;
    e = Error(e).stack;
    void 0 !== e && (this.stack = this.toString() + "\n" + e.replace(/^Error(:[^\n]*)?\n/, ""));
  });
  c.prototype = Object.create(b.prototype);
  c.prototype.constructor = c;
  c.prototype.toString = function() {
    return void 0 === this.message ? this.name : this.name + ": " + this.message;
  };
  return c;
}
var Ea = void 0;
function S(a) {
  throw new Ea(a);
}
function T(a, b, c) {
  c = c || {};
  if (!("argPackAdvance" in b)) {
    throw new TypeError("registerType registeredInstance requires argPackAdvance");
  }
  var e = b.name;
  a || S('type "' + e + '" must have a positive integer typeid pointer');
  if (Aa.hasOwnProperty(a)) {
    if (c.D) {
      return;
    }
    S("Cannot register type '" + e + "' twice");
  }
  Aa[a] = b;
  delete Ba[a];
  R.hasOwnProperty(a) && (b = R[a], delete R[a], b.forEach(function(f) {
    f();
  }));
}
var U = [], V = [{}, {value:void 0}, {value:null}, {value:!0}, {value:!1}];
function Fa(a) {
  switch(a) {
    case void 0:
      return 1;
    case null:
      return 2;
    case !0:
      return 3;
    case !1:
      return 4;
    default:
      var b = U.length ? U.pop() : V.length;
      V[b] = {F:1, value:a};
      return b;
  }
}
function W(a) {
  return this.fromWireType(I[a >> 2]);
}
function Ga(a) {
  if (null === a) {
    return "null";
  }
  var b = typeof a;
  return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
}
function Ha(a, b) {
  switch(b) {
    case 2:
      return function(c) {
        return this.fromWireType(ma[c >> 2]);
      };
    case 3:
      return function(c) {
        return this.fromWireType(na[c >> 3]);
      };
    default:
      throw new TypeError("Unknown float type: " + a);
  }
}
function Ia(a, b, c) {
  switch(b) {
    case 0:
      return c ? function(e) {
        return H[e];
      } : function(e) {
        return B[e];
      };
    case 1:
      return c ? function(e) {
        return E[e >> 1];
      } : function(e) {
        return C[e >> 1];
      };
    case 2:
      return c ? function(e) {
        return F[e >> 2];
      } : function(e) {
        return I[e >> 2];
      };
    default:
      throw new TypeError("Unknown integer type: " + a);
  }
}
for (var Ja = Array(256), X = 0; 256 > X; ++X) {
  Ja[X] = String.fromCharCode(X);
}
za = Ja;
Ea = d.BindingError = Da("BindingError");
d.InternalError = Da("InternalError");
d.count_emval_handles = function() {
  for (var a = 0, b = 5; b < V.length; ++b) {
    void 0 !== V[b] && ++a;
  }
  return a;
};
d.get_first_emval = function() {
  for (var a = 5; a < V.length; ++a) {
    if (void 0 !== V[a]) {
      return V[a];
    }
  }
  return null;
};
var La = {i:function(a, b, c, e, f) {
  var g = P(c);
  b = Q(b);
  T(a, {name:b, fromWireType:function(h) {
    return !!h;
  }, toWireType:function(h, p) {
    return p ? e : f;
  }, argPackAdvance:8, readValueFromPointer:function(h) {
    if (1 === c) {
      var p = H;
    } else {
      if (2 === c) {
        p = E;
      } else {
        if (4 === c) {
          p = F;
        } else {
          throw new TypeError("Unknown boolean type size: " + b);
        }
      }
    }
    return this.fromWireType(p[h >> g]);
  }, A:null});
}, h:function(a, b) {
  b = Q(b);
  T(a, {name:b, fromWireType:function(c) {
    var e = V[c].value;
    4 < c && 0 === --V[c].F && (V[c] = void 0, U.push(c));
    return e;
  }, toWireType:function(c, e) {
    return Fa(e);
  }, argPackAdvance:8, readValueFromPointer:W, A:null});
}, d:function(a, b, c) {
  c = P(c);
  b = Q(b);
  T(a, {name:b, fromWireType:function(e) {
    return e;
  }, toWireType:function(e, f) {
    if ("number" !== typeof f && "boolean" !== typeof f) {
      throw new TypeError('Cannot convert "' + Ga(f) + '" to ' + this.name);
    }
    return f;
  }, argPackAdvance:8, readValueFromPointer:Ha(b, c), A:null});
}, b:function(a, b, c, e, f) {
  function g(n) {
    return n;
  }
  b = Q(b);
  -1 === f && (f = 4294967295);
  var h = P(c);
  if (0 === e) {
    var p = 32 - 8 * c;
    g = function(n) {
      return n << p >>> p;
    };
  }
  var l = -1 != b.indexOf("unsigned");
  T(a, {name:b, fromWireType:g, toWireType:function(n, m) {
    if ("number" !== typeof m && "boolean" !== typeof m) {
      throw new TypeError('Cannot convert "' + Ga(m) + '" to ' + this.name);
    }
    if (m < e || m > f) {
      throw new TypeError('Passing a number "' + Ga(m) + '" from JS side to C/C++ side to an argument of type "' + b + '", which is outside the valid range [' + e + ", " + f + "]!");
    }
    return l ? m >>> 0 : m | 0;
  }, argPackAdvance:8, readValueFromPointer:Ia(b, h, 0 !== e), A:null});
}, a:function(a, b, c) {
  function e(g) {
    g >>= 2;
    var h = I;
    return new f(G, h[g + 1], h[g]);
  }
  var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][b];
  c = Q(c);
  T(a, {name:c, fromWireType:e, argPackAdvance:8, readValueFromPointer:e}, {D:!0});
}, e:function(a, b) {
  b = Q(b);
  var c = "std::string" === b;
  T(a, {name:b, fromWireType:function(e) {
    var f = I[e >> 2];
    if (c) {
      for (var g = e + 4, h = 0; h <= f; ++h) {
        var p = e + 4 + h;
        if (h == f || 0 == B[p]) {
          if (g) {
            var l = g;
            var n = B, m = l + (p - g);
            for (g = l; n[g] && !(g >= m);) {
              ++g;
            }
            if (16 < g - l && n.subarray && ca) {
              l = ca.decode(n.subarray(l, g));
            } else {
              for (m = ""; l < g;) {
                var k = n[l++];
                if (k & 128) {
                  var u = n[l++] & 63;
                  if (192 == (k & 224)) {
                    m += String.fromCharCode((k & 31) << 6 | u);
                  } else {
                    var D = n[l++] & 63;
                    k = 224 == (k & 240) ? (k & 15) << 12 | u << 6 | D : (k & 7) << 18 | u << 12 | D << 6 | n[l++] & 63;
                    65536 > k ? m += String.fromCharCode(k) : (k -= 65536, m += String.fromCharCode(55296 | k >> 10, 56320 | k & 1023));
                  }
                } else {
                  m += String.fromCharCode(k);
                }
              }
              l = m;
            }
          } else {
            l = "";
          }
          if (void 0 === r) {
            var r = l;
          } else {
            r += String.fromCharCode(0), r += l;
          }
          g = p + 1;
        }
      }
    } else {
      r = Array(f);
      for (h = 0; h < f; ++h) {
        r[h] = String.fromCharCode(B[e + 4 + h]);
      }
      r = r.join("");
    }
    Y(e);
    return r;
  }, toWireType:function(e, f) {
    f instanceof ArrayBuffer && (f = new Uint8Array(f));
    var g = "string" === typeof f;
    g || f instanceof Uint8Array || f instanceof Uint8ClampedArray || f instanceof Int8Array || S("Cannot pass non-string to std::string");
    var h = (c && g ? function() {
      for (var n = 0, m = 0; m < f.length; ++m) {
        var k = f.charCodeAt(m);
        55296 <= k && 57343 >= k && (k = 65536 + ((k & 1023) << 10) | f.charCodeAt(++m) & 1023);
        127 >= k ? ++n : n = 2047 >= k ? n + 2 : 65535 >= k ? n + 3 : n + 4;
      }
      return n;
    } : function() {
      return f.length;
    })(), p = Ka(4 + h + 1);
    I[p >> 2] = h;
    if (c && g) {
      da(f, p + 4, h + 1);
    } else {
      if (g) {
        for (g = 0; g < h; ++g) {
          var l = f.charCodeAt(g);
          255 < l && (Y(p), S("String has UTF-16 code units that do not fit in 8 bits"));
          B[p + 4 + g] = l;
        }
      } else {
        for (g = 0; g < h; ++g) {
          B[p + 4 + g] = f[g];
        }
      }
    }
    null !== e && e.push(Y, p);
    return p;
  }, argPackAdvance:8, readValueFromPointer:W, A:function(e) {
    Y(e);
  }});
}, c:function(a, b, c) {
  c = Q(c);
  if (2 === b) {
    var e = fa;
    var f = ha;
    var g = ia;
    var h = function() {
      return C;
    };
    var p = 1;
  } else {
    4 === b && (e = ja, f = ka, g = la, h = function() {
      return I;
    }, p = 2);
  }
  T(a, {name:c, fromWireType:function(l) {
    for (var n = I[l >> 2], m = h(), k, u = l + 4, D = 0; D <= n; ++D) {
      var r = l + 4 + D * b;
      if (D == n || 0 == m[r >> p]) {
        u = e(u, r - u), void 0 === k ? k = u : (k += String.fromCharCode(0), k += u), u = r + b;
      }
    }
    Y(l);
    return k;
  }, toWireType:function(l, n) {
    "string" !== typeof n && S("Cannot pass non-string to C++ string type " + c);
    var m = g(n), k = Ka(4 + m + b);
    I[k >> 2] = m >> p;
    f(n, k + 4, m + b);
    null !== l && l.push(Y, k);
    return k;
  }, argPackAdvance:8, readValueFromPointer:W, A:function(l) {
    Y(l);
  }});
}, j:function(a, b) {
  b = Q(b);
  T(a, {G:!0, name:b, argPackAdvance:0, fromWireType:function() {
  }, toWireType:function() {
  }});
}, f:function(a, b, c) {
  B.copyWithin(a, b, b + c);
}, g:function(a) {
  var b = B.length;
  if (2147483648 < a) {
    return !1;
  }
  for (var c = 1; 4 >= c; c *= 2) {
    var e = b * (1 + .2 / c);
    e = Math.min(e, a + 100663296);
    e = Math.max(a, e);
    0 < e % 65536 && (e += 65536 - e % 65536);
    a: {
      try {
        A.grow(Math.min(2147483648, e) - G.byteLength + 65535 >>> 16);
        oa();
        var f = 1;
        break a;
      } catch (g) {
      }
      f = void 0;
    }
    if (f) {
      return !0;
    }
  }
  return !1;
}};
(function() {
  function a(f) {
    d.asm = f.exports;
    A = d.asm.k;
    oa();
    J = d.asm.v;
    K--;
    d.monitorRunDependencies && d.monitorRunDependencies(K);
    0 == K && (null !== L && (clearInterval(L), L = null), M && (f = M, M = null, f()));
  }
  function b(f) {
    a(f.instance);
  }
  function c(f) {
    return ya().then(function(g) {
      return WebAssembly.instantiate(g, e);
    }).then(f, function(g) {
      x("failed to asynchronously prepare wasm: " + g);
      z(g);
    });
  }
  var e = {a:La};
  K++;
  d.monitorRunDependencies && d.monitorRunDependencies(K);
  if (d.instantiateWasm) {
    try {
      return d.instantiateWasm(e, a);
    } catch (f) {
      return x("Module.instantiateWasm callback failed with error: " + f), !1;
    }
  }
  (function() {
    return y || "function" !== typeof WebAssembly.instantiateStreaming || va() || "function" !== typeof fetch ? c(b) : fetch(N, {credentials:"same-origin"}).then(function(f) {
      return WebAssembly.instantiateStreaming(f, e).then(b, function(g) {
        x("wasm streaming compile failed: " + g);
        x("falling back to ArrayBuffer instantiation");
        return c(b);
      });
    });
  })().catch(q);
  return {};
})();
var ta = d.___wasm_call_ctors = function() {
  return (ta = d.___wasm_call_ctors = d.asm.l).apply(null, arguments);
};
d._rotate180 = function() {
  return (d._rotate180 = d.asm.m).apply(null, arguments);
};
d._mirror_reflection = function() {
  return (d._mirror_reflection = d.asm.n).apply(null, arguments);
};
d._rotate90 = function() {
  return (d._rotate90 = d.asm.o).apply(null, arguments);
};
d._invert = function() {
  return (d._invert = d.asm.p).apply(null, arguments);
};
d._brighten = function() {
  return (d._brighten = d.asm.q).apply(null, arguments);
};
d._gray_scale = function() {
  return (d._gray_scale = d.asm.r).apply(null, arguments);
};
d._crop = function() {
  return (d._crop = d.asm.s).apply(null, arguments);
};
d.___getTypeName = function() {
  return (d.___getTypeName = d.asm.t).apply(null, arguments);
};
d.___embind_register_native_and_builtin_types = function() {
  return (d.___embind_register_native_and_builtin_types = d.asm.u).apply(null, arguments);
};
var Ka = d._malloc = function() {
  return (Ka = d._malloc = d.asm.w).apply(null, arguments);
}, Y = d._free = function() {
  return (Y = d._free = d.asm.x).apply(null, arguments);
}, Z;
M = function Ma() {
  Z || Na();
  Z || (M = Ma);
};
function Na() {
  function a() {
    if (!Z && (Z = !0, d.calledRun = !0, !ba)) {
      O(qa);
      O(ra);
      aa(d);
      if (d.onRuntimeInitialized) {
        d.onRuntimeInitialized();
      }
      if (d.postRun) {
        for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length;) {
          var b = d.postRun.shift();
          sa.unshift(b);
        }
      }
      O(sa);
    }
  }
  if (!(0 < K)) {
    if (d.preRun) {
      for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length;) {
        ua();
      }
    }
    O(pa);
    0 < K || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {
      setTimeout(function() {
        d.setStatus("");
      }, 1);
      a();
    }, 1)) : a());
  }
}
d.run = Na;
if (d.preInit) {
  for ("function" == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length;) {
    d.preInit.pop()();
  }
}
Na();



  return Editor.ready
}
);
})();
export default Editor;