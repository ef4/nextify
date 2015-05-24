require('babel/register');
global.chai = require('chai');
global.chai.use(require('dirty-chai'));
global.expect = global.chai.expect;
