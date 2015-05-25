var fatArrowize = require('../fat-arrowize');
var spreadify = require('../spreadify');
var path = require('path');
import { runTestCasesFile } from './helpers';

runTestCasesFile(fatArrowize, path.join(__dirname, 'fat-arrowize-cases.js'));
runTestCasesFile(spreadify, path.join(__dirname, 'spreadify-cases.js'));
