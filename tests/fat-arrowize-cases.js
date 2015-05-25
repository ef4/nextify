/* jshint ignore:start */

// from
(function(_this){ return function(a){ return _this.foo(a); }})(this)

// to
a => this.foo(a);


// from
(function(_this){ return function(a,b){ return _this.foo(a+b); }})(this)

// to
(a, b) => this.foo(a + b);


// from
(function(_this){ return function(){ return _this.foo(); }})(this)

// to
() => this.foo();


// from
(function(_this){
  return function(a){
    var b = a + 1;
    return _this.foo(b);
  };
})(this)

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
})(this)

// to
(b, c) => ({ b, c });

// end

/* jshint ignore:end */
