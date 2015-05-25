var fatArrowize = require('../fat-arrowize');
var path = require('path');
import { runTestCasesFile } from './helpers';

runTestCasesFile(fatArrowize, path.join(__dirname, 'fat-arrowize-cases.js'));
