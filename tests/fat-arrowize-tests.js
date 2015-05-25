var fatArrowize = require('../fat-arrowize');
var path = require('path');
import { loadTestCases, convert } from './helpers';

describe('fat-arrowize', function() {
  var testCases = loadTestCases(path.join(__dirname, 'fat-arrowize-cases.js'));

  for (let {from, to} of testCases) {
    it(`produces ${to}`, () => {
      expect(convert(fatArrowize, from).trim()).to.equal(to.trim());
    });
  }
});
