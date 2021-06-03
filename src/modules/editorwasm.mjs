/* eslint-disable */ 
var Editor = (function() {
  var _scriptDir = '/editor.wasm';
  
  return (
function(Editor) {
  Editor = Editor || {};


var d;
d || (d = typeof Editor !== 'undefined' ? Editor : {});
var aa, q;
d.ready = new Promise(function(b, a) {
  aa = b;
  q = a;
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
var ba, ca = !1, da = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;
function ea(b, a, c) {
  var f = A;
  if (0 < c) {
    c = a + c - 1;
    for (var e = 0; e < b.length; ++e) {
      var g = b.charCodeAt(e);
      if (55296 <= g && 57343 >= g) {
        var h = b.charCodeAt(++e);
        g = 65536 + ((g & 1023) << 10) | h & 1023;
      }
      if (127 >= g) {
        if (a >= c) {
          break;
        }
        f[a++] = g;
      } else {
        if (2047 >= g) {
          if (a + 1 >= c) {
            break;
          }
          f[a++] = 192 | g >> 6;
        } else {
          if (65535 >= g) {
            if (a + 2 >= c) {
              break;
            }
            f[a++] = 224 | g >> 12;
          } else {
            if (a + 3 >= c) {
              break;
            }
            f[a++] = 240 | g >> 18;
            f[a++] = 128 | g >> 12 & 63;
          }
          f[a++] = 128 | g >> 6 & 63;
        }
        f[a++] = 128 | g & 63;
      }
    }
    f[a] = 0;
  }
}
var fa = "undefined" !== typeof TextDecoder ? new TextDecoder("utf-16le") : void 0;
function ha(b, a) {
  var c = b >> 1;
  for (var f = c + a / 2; !(c >= f) && B[c];) {
    ++c;
  }
  c <<= 1;
  if (32 < c - b && fa) {
    return fa.decode(A.subarray(b, c));
  }
  c = "";
  for (f = 0; !(f >= a / 2); ++f) {
    var e = C[b + 2 * f >> 1];
    if (0 == e) {
      break;
    }
    c += String.fromCharCode(e);
  }
  return c;
}
function ia(b, a, c) {
  void 0 === c && (c = 2147483647);
  if (2 > c) {
    return 0;
  }
  c -= 2;
  var f = a;
  c = c < 2 * b.length ? c / 2 : b.length;
  for (var e = 0; e < c; ++e) {
    C[a >> 1] = b.charCodeAt(e), a += 2;
  }
  C[a >> 1] = 0;
  return a - f;
}
function ja(b) {
  return 2 * b.length;
}
function ka(b, a) {
  for (var c = 0, f = ""; !(c >= a / 4);) {
    var e = E[b + 4 * c >> 2];
    if (0 == e) {
      break;
    }
    ++c;
    65536 <= e ? (e -= 65536, f += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : f += String.fromCharCode(e);
  }
  return f;
}
function la(b, a, c) {
  void 0 === c && (c = 2147483647);
  if (4 > c) {
    return 0;
  }
  var f = a;
  c = f + c - 4;
  for (var e = 0; e < b.length; ++e) {
    var g = b.charCodeAt(e);
    if (55296 <= g && 57343 >= g) {
      var h = b.charCodeAt(++e);
      g = 65536 + ((g & 1023) << 10) | h & 1023;
    }
    E[a >> 2] = g;
    a += 4;
    if (a + 4 > c) {
      break;
    }
  }
  E[a >> 2] = 0;
  return a - f;
}
function ma(b) {
  for (var a = 0, c = 0; c < b.length; ++c) {
    var f = b.charCodeAt(c);
    55296 <= f && 57343 >= f && ++c;
    a += 4;
  }
  return a;
}
var na, F, A, C, B, E, G, oa, pa, H, qa = [], ra = [], sa = [], ta = [];
ra.push({C:function() {
  ua();
}});
function va() {
  var b = d.preRun.shift();
  qa.unshift(b);
}
var I = 0, J = null, K = null;
d.preloadedImages = {};
d.preloadedAudios = {};
function z(b) {
  if (d.onAbort) {
    d.onAbort(b);
  }
  x(b);
  ca = !0;
  b = new WebAssembly.RuntimeError("abort(" + b + "). Build with -s ASSERTIONS=1 for more info.");
  q(b);
  throw b;
}
function wa() {
  var b = L;
  return String.prototype.startsWith ? b.startsWith("data:application/octet-stream;base64,") : 0 === b.indexOf("data:application/octet-stream;base64,");
}
var L = "editor.wasm";
if (!wa()) {
  var xa = L;
  L = d.locateFile ? d.locateFile(xa, w) : w + xa;
}
function ya() {
  var b = L;
  try {
    if (b == L && y) {
      return new Uint8Array(y);
    }
    throw "both async and sync fetching of the wasm failed";
  } catch (a) {
    z(a);
  }
}
function za() {
  return y || "function" !== typeof fetch ? Promise.resolve().then(function() {
    return ya();
  }) : fetch(L, {credentials:"same-origin"}).then(function(b) {
    if (!b.ok) {
      throw "failed to load wasm binary file at '" + L + "'";
    }
    return b.arrayBuffer();
  }).catch(function() {
    return ya();
  });
}
function M(b) {
  for (; 0 < b.length;) {
    var a = b.shift();
    if ("function" == typeof a) {
      a(d);
    } else {
      var c = a.C;
      "number" === typeof c ? void 0 === a.B ? H.get(c)() : H.get(c)(a.B) : c(void 0 === a.B ? null : a.B);
    }
  }
}
function N(b) {
  switch(b) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 4:
      return 2;
    case 8:
      return 3;
    default:
      throw new TypeError("Unknown type size: " + b);
  }
}
var Aa = void 0;
function O(b) {
  for (var a = ""; A[b];) {
    a += Aa[A[b++]];
  }
  return a;
}
var P = {}, Ba = {}, Ca = {};
function Da(b, a) {
  if (void 0 === b) {
    b = "_unknown";
  } else {
    b = b.replace(/[^a-zA-Z0-9_]/g, "$");
    var c = b.charCodeAt(0);
    b = 48 <= c && 57 >= c ? "_" + b : b;
  }
  return (new Function("body", "return function " + b + '() {\n    "use strict";    return body.apply(this, arguments);\n};\n'))(a);
}
function Ea(b) {
  var a = Error, c = Da(b, function(f) {
    this.name = b;
    this.message = f;
    f = Error(f).stack;
    void 0 !== f && (this.stack = this.toString() + "\n" + f.replace(/^Error(:[^\n]*)?\n/, ""));
  });
  c.prototype = Object.create(a.prototype);
  c.prototype.constructor = c;
  c.prototype.toString = function() {
    return void 0 === this.message ? this.name : this.name + ": " + this.message;
  };
  return c;
}
var Fa = void 0;
function Q(b) {
  throw new Fa(b);
}
function R(b, a, c) {
  c = c || {};
  if (!("argPackAdvance" in a)) {
    throw new TypeError("registerType registeredInstance requires argPackAdvance");
  }
  var f = a.name;
  b || Q('type "' + f + '" must have a positive integer typeid pointer');
  if (Ba.hasOwnProperty(b)) {
    if (c.D) {
      return;
    }
    Q("Cannot register type '" + f + "' twice");
  }
  Ba[b] = a;
  delete Ca[b];
  P.hasOwnProperty(b) && (a = P[b], delete P[b], a.forEach(function(e) {
    e();
  }));
}
var S = [], T = [{}, {value:void 0}, {value:null}, {value:!0}, {value:!1}];
function Ga(b) {
  switch(b) {
    case void 0:
      return 1;
    case null:
      return 2;
    case !0:
      return 3;
    case !1:
      return 4;
    default:
      var a = S.length ? S.pop() : T.length;
      T[a] = {F:1, value:b};
      return a;
  }
}
function U(b) {
  return this.fromWireType(G[b >> 2]);
}
function V(b) {
  if (null === b) {
    return "null";
  }
  var a = typeof b;
  return "object" === a || "array" === a || "function" === a ? b.toString() : "" + b;
}
function Ha(b, a) {
  switch(a) {
    case 2:
      return function(c) {
        return this.fromWireType(oa[c >> 2]);
      };
    case 3:
      return function(c) {
        return this.fromWireType(pa[c >> 3]);
      };
    default:
      throw new TypeError("Unknown float type: " + b);
  }
}
function Ia(b, a, c) {
  switch(a) {
    case 0:
      return c ? function(f) {
        return F[f];
      } : function(f) {
        return A[f];
      };
    case 1:
      return c ? function(f) {
        return C[f >> 1];
      } : function(f) {
        return B[f >> 1];
      };
    case 2:
      return c ? function(f) {
        return E[f >> 2];
      } : function(f) {
        return G[f >> 2];
      };
    default:
      throw new TypeError("Unknown integer type: " + b);
  }
}
for (var Ja = Array(256), W = 0; 256 > W; ++W) {
  Ja[W] = String.fromCharCode(W);
}
Aa = Ja;
Fa = d.BindingError = Ea("BindingError");
d.InternalError = Ea("InternalError");
d.count_emval_handles = function() {
  for (var b = 0, a = 5; a < T.length; ++a) {
    void 0 !== T[a] && ++b;
  }
  return b;
};
d.get_first_emval = function() {
  for (var b = 5; b < T.length; ++b) {
    if (void 0 !== T[b]) {
      return T[b];
    }
  }
  return null;
};
var Ka = {i:function(b, a, c, f, e) {
  var g = N(c);
  a = O(a);
  R(b, {name:a, fromWireType:function(h) {
    return !!h;
  }, toWireType:function(h, p) {
    return p ? f : e;
  }, argPackAdvance:8, readValueFromPointer:function(h) {
    if (1 === c) {
      var p = F;
    } else {
      if (2 === c) {
        p = C;
      } else {
        if (4 === c) {
          p = E;
        } else {
          throw new TypeError("Unknown boolean type size: " + a);
        }
      }
    }
    return this.fromWireType(p[h >> g]);
  }, A:null});
}, h:function(b, a) {
  a = O(a);
  R(b, {name:a, fromWireType:function(c) {
    var f = T[c].value;
    4 < c && 0 === --T[c].F && (T[c] = void 0, S.push(c));
    return f;
  }, toWireType:function(c, f) {
    return Ga(f);
  }, argPackAdvance:8, readValueFromPointer:U, A:null});
}, d:function(b, a, c) {
  c = N(c);
  a = O(a);
  R(b, {name:a, fromWireType:function(f) {
    return f;
  }, toWireType:function(f, e) {
    if ("number" !== typeof e && "boolean" !== typeof e) {
      throw new TypeError('Cannot convert "' + V(e) + '" to ' + this.name);
    }
    return e;
  }, argPackAdvance:8, readValueFromPointer:Ha(a, c), A:null});
}, b:function(b, a, c, f, e) {
  function g(n) {
    return n;
  }
  a = O(a);
  -1 === e && (e = 4294967295);
  var h = N(c);
  if (0 === f) {
    var p = 32 - 8 * c;
    g = function(n) {
      return n << p >>> p;
    };
  }
  var l = -1 != a.indexOf("unsigned");
  R(b, {name:a, fromWireType:g, toWireType:function(n, m) {
    if ("number" !== typeof m && "boolean" !== typeof m) {
      throw new TypeError('Cannot convert "' + V(m) + '" to ' + this.name);
    }
    if (m < f || m > e) {
      throw new TypeError('Passing a number "' + V(m) + '" from JS side to C/C++ side to an argument of type "' + a + '", which is outside the valid range [' + f + ", " + e + "]!");
    }
    return l ? m >>> 0 : m | 0;
  }, argPackAdvance:8, readValueFromPointer:Ia(a, h, 0 !== f), A:null});
}, a:function(b, a, c) {
  function f(g) {
    g >>= 2;
    var h = G;
    return new e(na, h[g + 1], h[g]);
  }
  var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][a];
  c = O(c);
  R(b, {name:c, fromWireType:f, argPackAdvance:8, readValueFromPointer:f}, {D:!0});
}, e:function(b, a) {
  a = O(a);
  var c = "std::string" === a;
  R(b, {name:a, fromWireType:function(f) {
    var e = G[f >> 2];
    if (c) {
      for (var g = f + 4, h = 0; h <= e; ++h) {
        var p = f + 4 + h;
        if (h == e || 0 == A[p]) {
          if (g) {
            var l = g;
            var n = A, m = l + (p - g);
            for (g = l; n[g] && !(g >= m);) {
              ++g;
            }
            if (16 < g - l && n.subarray && da) {
              l = da.decode(n.subarray(l, g));
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
      r = Array(e);
      for (h = 0; h < e; ++h) {
        r[h] = String.fromCharCode(A[f + 4 + h]);
      }
      r = r.join("");
    }
    X(f);
    return r;
  }, toWireType:function(f, e) {
    e instanceof ArrayBuffer && (e = new Uint8Array(e));
    var g = "string" === typeof e;
    g || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array || Q("Cannot pass non-string to std::string");
    var h = (c && g ? function() {
      for (var n = 0, m = 0; m < e.length; ++m) {
        var k = e.charCodeAt(m);
        55296 <= k && 57343 >= k && (k = 65536 + ((k & 1023) << 10) | e.charCodeAt(++m) & 1023);
        127 >= k ? ++n : n = 2047 >= k ? n + 2 : 65535 >= k ? n + 3 : n + 4;
      }
      return n;
    } : function() {
      return e.length;
    })(), p = Y(4 + h + 1);
    G[p >> 2] = h;
    if (c && g) {
      ea(e, p + 4, h + 1);
    } else {
      if (g) {
        for (g = 0; g < h; ++g) {
          var l = e.charCodeAt(g);
          255 < l && (X(p), Q("String has UTF-16 code units that do not fit in 8 bits"));
          A[p + 4 + g] = l;
        }
      } else {
        for (g = 0; g < h; ++g) {
          A[p + 4 + g] = e[g];
        }
      }
    }
    null !== f && f.push(X, p);
    return p;
  }, argPackAdvance:8, readValueFromPointer:U, A:function(f) {
    X(f);
  }});
}, c:function(b, a, c) {
  c = O(c);
  if (2 === a) {
    var f = ha;
    var e = ia;
    var g = ja;
    var h = function() {
      return B;
    };
    var p = 1;
  } else {
    4 === a && (f = ka, e = la, g = ma, h = function() {
      return G;
    }, p = 2);
  }
  R(b, {name:c, fromWireType:function(l) {
    for (var n = G[l >> 2], m = h(), k, u = l + 4, D = 0; D <= n; ++D) {
      var r = l + 4 + D * a;
      if (D == n || 0 == m[r >> p]) {
        u = f(u, r - u), void 0 === k ? k = u : (k += String.fromCharCode(0), k += u), u = r + a;
      }
    }
    X(l);
    return k;
  }, toWireType:function(l, n) {
    "string" !== typeof n && Q("Cannot pass non-string to C++ string type " + c);
    var m = g(n), k = Y(4 + m + a);
    G[k >> 2] = m >> p;
    e(n, k + 4, m + a);
    null !== l && l.push(X, k);
    return k;
  }, argPackAdvance:8, readValueFromPointer:U, A:function(l) {
    X(l);
  }});
}, j:function(b, a) {
  a = O(a);
  R(b, {G:!0, name:a, argPackAdvance:0, fromWireType:function() {
  }, toWireType:function() {
  }});
}, f:function(b, a, c) {
  A.copyWithin(b, a, a + c);
}, g:function() {
  z("OOM");
}};
(function() {
  function b(e) {
    d.asm = e.exports;
    ba = d.asm.k;
    na = e = ba.buffer;
    d.HEAP8 = F = new Int8Array(e);
    d.HEAP16 = C = new Int16Array(e);
    d.HEAP32 = E = new Int32Array(e);
    d.HEAPU8 = A = new Uint8Array(e);
    d.HEAPU16 = B = new Uint16Array(e);
    d.HEAPU32 = G = new Uint32Array(e);
    d.HEAPF32 = oa = new Float32Array(e);
    d.HEAPF64 = pa = new Float64Array(e);
    H = d.asm.v;
    I--;
    d.monitorRunDependencies && d.monitorRunDependencies(I);
    0 == I && (null !== J && (clearInterval(J), J = null), K && (e = K, K = null, e()));
  }
  function a(e) {
    b(e.instance);
  }
  function c(e) {
    return za().then(function(g) {
      return WebAssembly.instantiate(g, f);
    }).then(e, function(g) {
      x("failed to asynchronously prepare wasm: " + g);
      z(g);
    });
  }
  var f = {a:Ka};
  I++;
  d.monitorRunDependencies && d.monitorRunDependencies(I);
  if (d.instantiateWasm) {
    try {
      return d.instantiateWasm(f, b);
    } catch (e) {
      return x("Module.instantiateWasm callback failed with error: " + e), !1;
    }
  }
  (function() {
    return y || "function" !== typeof WebAssembly.instantiateStreaming || wa() || "function" !== typeof fetch ? c(a) : fetch(L, {credentials:"same-origin"}).then(function(e) {
      return WebAssembly.instantiateStreaming(e, f).then(a, function(g) {
        x("wasm streaming compile failed: " + g);
        x("falling back to ArrayBuffer instantiation");
        return c(a);
      });
    });
  })().catch(q);
  return {};
})();
var ua = d.___wasm_call_ctors = function() {
  return (ua = d.___wasm_call_ctors = d.asm.l).apply(null, arguments);
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
var Y = d._malloc = function() {
  return (Y = d._malloc = d.asm.w).apply(null, arguments);
}, X = d._free = function() {
  return (X = d._free = d.asm.x).apply(null, arguments);
}, Z;
K = function La() {
  Z || Ma();
  Z || (K = La);
};
function Ma() {
  function b() {
    if (!Z && (Z = !0, d.calledRun = !0, !ca)) {
      M(ra);
      M(sa);
      aa(d);
      if (d.onRuntimeInitialized) {
        d.onRuntimeInitialized();
      }
      if (d.postRun) {
        for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length;) {
          var a = d.postRun.shift();
          ta.unshift(a);
        }
      }
      M(ta);
    }
  }
  if (!(0 < I)) {
    if (d.preRun) {
      for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length;) {
        va();
      }
    }
    M(qa);
    0 < I || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {
      setTimeout(function() {
        d.setStatus("");
      }, 1);
      b();
    }, 1)) : b());
  }
}
d.run = Ma;
if (d.preInit) {
  for ("function" == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length;) {
    d.preInit.pop()();
  }
}
Ma();



  return Editor.ready
}
);
})();
export default Editor;