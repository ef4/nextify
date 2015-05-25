/* jshint ignore: start */

// from
this.method.apply(this, a);
// to
this.method(...a);


// from
x.method.apply(x, a);
// to
x.method(...a);


// from
foo.apply(x, a);
//to
foo.apply(x, a);
// end

/* jshint ignore: end */
