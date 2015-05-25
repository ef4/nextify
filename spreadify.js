module.exports = function (babel) {
  var t = babel.types;

  return new babel.Transformer('spreadify', {
    CallExpression: function (node) {
      if (t.isMemberExpression(node.callee) &&
          t.isIdentifier(node.callee.property, { name: 'apply' }) &&
          node.arguments.length === 2 &&
          t.isMemberExpression(node.callee.object)) {

        var firstArg = node.arguments[0];
        var rootObject = node.callee.object.object;
        if (t.isThisExpression(firstArg) && t.isThisExpression(rootObject)) {
          return t.callExpression(node.callee.object, [t.spreadElement(node.arguments[1])]);
        }
        if (t.isIdentifier(firstArg) && t.isIdentifier(rootObject) && firstArg.name === rootObject.name) {
          return t.callExpression(node.callee.object, [t.spreadElement(node.arguments[1])]);
        }
      }
    }
  });
};
