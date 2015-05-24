var babel = require('babel');
var fatArrowize = require('../fat-arrowize');

describe('fat-arrowize', function() {
  let testCases = [
    [
      `(function(_this){ return function(a){ return _this.foo(a); }})(this)`,
      `a => this.foo(a);`
    ],[
      `
       (function(_this){
         return function(a){
           var b = a + 1;
           return _this.foo(b);
         };
       })(this)
      `,`
       a => {
         var b = a + 1;
         return this.foo(b);
       };
      `
    ],[
      `
       (function(_this){
         return function(b,c) {
           return { b, c };
         };
       })(this)
      `,
      `
       (b, c) => ({ b, c });
      `
    ]
  ];
  for (let [input, output] of testCases) {
    it(`produces ${output}`, () => {
      expect(stripSharedIndent(convert(input))).to.equal(stripSharedIndent(output));
    });
  }
});

function convert(source) {
  return babel.transform(source, {
    plugins: [fatArrowize],

    // babel doesn't accept an empty whitelist to disable all built-in
    // transforms, so we just pick one that won't apply to our test
    // cases.
    whitelist: ['react']
  }).code;
}

// Lifted from https://github.com/eventualbuddha/decaffeinate.git, MIT Licensed.
const WHITESPACE = /^\s*$/;
function stripSharedIndent(source) {
  const lines = source.split('\n');

  while (lines.length > 0 && WHITESPACE.test(lines[0])) {
    lines.shift();
  }
  while (lines.length > 0 && WHITESPACE.test(lines[lines.length - 1])) {
    lines.pop();
  }

  const minimumIndent = lines.reduce((indent, line) => {
    if (line.length === 0) {
      return indent;
    } else {
      return Math.min(getIndent(line), indent);
    }
  }, Infinity);

  return lines.map(line => line.slice(minimumIndent)).join('\n');
}
function getIndent(line) {
  let index = 0;
  while (line[index] === ' ') {
    index++;
  }
  return index;
}
