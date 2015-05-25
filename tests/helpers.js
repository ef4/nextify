var babel = require('babel');
var fs = require('fs');


export function convert(transformer, source) {
  return babel.transform(source, {
    plugins: [transformer],

    // babel doesn't accept an empty whitelist to disable all built-in
    // transforms, so we just pick one that won't apply to our test
    // cases.
    whitelist: ['react']
  }).code;
}

// Lifted from https://github.com/eventualbuddha/decaffeinate.git, MIT Licensed.
const WHITESPACE = /^\s*$/;
export function stripSharedIndent(source) {
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

export function loadTestCases(filename) {
  var lines = fs.readFileSync(filename, 'utf8').split("\n");
  var current;
  var output = [];
  for (var line of lines) {
    if (/^\s*\/\/\s*from/.test(line)) {
      if (current) {
        output.push(current);
      }
      current = {
        from: []
      };
    } else if (/^\s*\/\/\s*to/.test(line) && current) {
      current.to = [];
    } else if (/^\s*\/\/\s*end/.test(line) && current) {
      output.push(current);
      current = null;
    } else if (current && current.to) {
      current.to.push(line);
    } else if (current) {
      current.from.push(line);
    }
  }
  if (current) {
    output.push(current);
  }
  return output.map(testCase => ({
    from: testCase.from.join("\n"),
    to: testCase.to.join("\n")
  }));
}
