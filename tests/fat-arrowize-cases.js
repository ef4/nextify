/* jshint ignore:start */

// from
(function(_this){ return function(a){ return _this.foo(a); }})(this);

// to
a => this.foo(a);


// from
(function(_this){ return function(a,b){ return _this.foo(a+b); }})(this);

// to
(a, b) => this.foo(a + b);


// from
(function(_this){ return function(){ return _this.foo(); }})(this);

// to
() => this.foo();


// from
(function(_this){
  return function(a){
    var b = a + 1;
    return _this.foo(b);
  };
})(this);

// to
a => {
  var b = a + 1;
  return this.foo(b);
};


// from
(function(_this){
  return function(b,c) {
    return { b, c };
  };
})(this);

// to
(b, c) => ({ b, c });


// from
foo.map(function(elt){ return elt + 1; });

// to
foo.map(elt => elt + 1);


// from
foo.map(function(elt){
  var x = elt + 1;
  return go(x);
});

// to
foo.map(elt => {
  var x = elt + 1;
  return go(x);
});


// from
foo.map(function (elt) {
  return this.go(elt);
});

// to
foo.map(function (elt) {
  return this.go(elt);
});


// from
foo.map(
  (function(_this){
    return function(elt){
      return _this.go(elt);
    }
  })(this)
);

// to
foo.map(elt => this.go(elt));
// end

// from:
(function(_this) {
  _this.go();
  return function(a) {
    return _this.do(a);
  };
})(this);
// to
() => {
  this.go();
  return a => this.do(a);
}();


// from
(function (_this) {
  this.go();
  return function(a) {
    return _this.do(a);
  };
})(this);
// to
(function (_this) {
  this.go();
  return a => _this.do(a);
})(this);


// from
(function (_this) {
  this.go();
  return function (a) {
    return this.do(a);
  };
})(this);
// to
(function (_this) {
  this.go();
  return function (a) {
    return this.do(a);
  };
})(this);


// from
(function (_this) {
  _this.go();
  return function (a) {
    return this.do(a);
  };
})(this);
// to
() => {
  this.go();
  return function (a) {
    return this.do(a);
  };
}();


// from
(function (_this) {
  _this.go();
  return function (a) {
    return this.do(a) + _this.do(b);
  };
})(this);
// to
(function (_this) {
  _this.go();
  return function (a) {
    return this.do(a) + _this.do(b);
  };
})(this);


// end

/* jshint ignore:end */
