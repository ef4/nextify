var fatArrowize = require('../fat-arrowize');
var spreadify = require('../spreadify');
var derequire = require('../derequire');
var path = require('path');
import { runTestCasesFile } from './helpers';

runTestCasesFile(fatArrowize, path.join(__dirname, 'fat-arrowize-cases.js'));
runTestCasesFile(spreadify, path.join(__dirname, 'spreadify-cases.js'));
runTestCasesFile(derequire, path.join(__dirname, 'derequire-cases.js'));
