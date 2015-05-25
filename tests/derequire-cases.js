// from
require('foo');
// to
import 'foo';

// from
var x = require('foo');
// to
import x from 'foo';

// from
var x;
var y;
x = require('foo');
// to
import x from 'foo';

var y;
