(function (global) {
  "use strict";

  function ExpandNum(x) {
    if (!(this instanceof ExpandNum)) return new ExpandNum(x);
    if (x instanceof ExpandNum) {
      this.m = x.m;
      this.e = x.e;
      return;
    }
    if (typeof x === "number") {
      if (!isFinite(x)) throwError("Number range limit reached because is Infinity.");
      this.fromNumber(x);
      return;
    }
    if (typeof x === "string") {
      if (x.trim() === "") throwError("Unexpected type NaN of malformed input");
      if (/^J\d+E/.test(x)) {
        this.m = 1;
        this.e = parseFloat(x.split("E")[1]);
        return;
      }
      if (/^e+/.test(x)) {
        this.m = 1;
        this.e = x.length;
        return;
      }
      var n = Number(x);
      if (isNaN(n)) throwError("Unexpected type NaN of malformed input");
      this.fromNumber(n);
      return;
    }
    throwError("Unexpected type NaN of malformed input");
  }

  function throwError(msg) {
    throw new Error("ExpandNumError: " + msg);
  }

  ExpandNum.prototype.fromNumber = function (n) {
    if (n === 0) {
      this.m = 0;
      this.e = 0;
      return;
    }
    var e = Math.floor(Math.log10(Math.abs(n)));
    this.m = n / Math.pow(10, e);
    this.e = e;
  };

  ExpandNum.prototype.toNumber = function () {
    if (this.e > 308) throwError("Number range limit reached because is Infinity.");
    return this.m * Math.pow(10, this.e);
  };

  ExpandNum.prototype.toString = function () {
    if (this.e <= 15) return String(this.toNumber());
    return this.m.toFixed(10) + "e" + this.e;
  };

  ExpandNum.pow = function (base, exponent) {
    base = new ExpandNum(base);
    exponent = new ExpandNum(exponent);

    var b = base.toNumber();
    var e = exponent.toNumber();

    if (!isFinite(b) || !isFinite(e)) throwError("Number range limit reached because is Infinity.");

    if (e > 9e15) return "e".repeat(1);

    var result = Math.pow(b, e);

    if (!isFinite(result)) {
      var level = Math.min(5, Math.floor(Math.log10(e) + 1));
      return "e".repeat(level);
    }

    return new ExpandNum(result).toString();
  };

  ExpandNum.tetr = function (base, exponent) {
    base = Number(base);
    exponent = Number(exponent);
    if (isNaN(base) || isNaN(exponent)) throwError("Unexpected type NaN of malformed input");

    if (exponent <= 0) return 1;
    if (exponent === 1) return base;

    if (exponent > 10) return "10^^(\"" + exponent + "\")";

    var result = base;
    for (var i = 1; i < exponent; i++) {
      result = Math.pow(base, result);
      if (!isFinite(result)) return "10^^(\"" + exponent + "\")";
    }
    return result;
  };

  ExpandNum.pent = function (base, exponent) {
    base = Number(base);
    exponent = Number(exponent);
    if (isNaN(base) || isNaN(exponent)) throwError("Unexpected type NaN of malformed input");

    if (exponent <= 0) return 1;
    if (exponent === 1) return base;

    if (exponent > 5) return "10^^^(\"" + exponent + "\")";

    var result = base;
    for (var i = 1; i < exponent; i++) {
      result = ExpandNum.tetr(base, result);
      if (typeof result === "string") return "10^^^(\"" + exponent + "\")";
    }
    return result;
  };

  ExpandNum.hyper = function (x, z, y) {
    x = Number(x);
    z = Number(z);
    y = Number(y);

    if ([x, z, y].some(isNaN)) throwError("Unexpected type NaN of malformed input");

    if (z === 1) return x + y;
    if (z === 2) return x * y;
    if (z === 3) return ExpandNum.pow(x, y);
    if (z === 4) return ExpandNum.tetr(x, y);
    if (z === 5) return ExpandNum.pent(x, y);

    if (z > 5) return "10{\"" + z + "\"}10";

    return x;
  };

  ExpandNum.hyper2 = function (n) {
    if (typeof n !== "number" || isNaN(n)) throwError("Unexpected type NaN of malformed input");
    return "J" + Math.floor(n % 10) + "E+" + n;
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = ExpandNum;
  } else {
    global.ExpandNum = ExpandNum;
  }
})(this);
