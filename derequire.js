module.exports = function (babel) {
  var t = babel.types;

  function isRequireDefault(node) {
    return t.isCallExpression(node) &&
      t.isIdentifier(node.callee) &&
      node.callee.name === 'require' &&
      node.arguments.length === 1 &&
      t.isLiteral(node.arguments[0]);
  }


  return new babel.Transformer('derequire', {
    AssignmentExpression: function (node, parent, scope) {
      if (isRequireDefault(node.right)) {
        var binding = scope.getBinding(node.left.name);
        if (binding) {
          binding.path.remove();
          this.parentPath.replaceWith(t.importDeclaration([t.importDefaultSpecifier(node.left)], node.right.arguments[0]));
        }
      }
    },
    VariableDeclaration: function (node) {
      if (node.declarations.length !== 1) {
        return;
      }
      node = node.declarations[0];
      if (node.init && isRequireDefault(node.init)) {
        return t.importDeclaration([t.importDefaultSpecifier(node.id)], node.init.arguments[0]);
      }
    },
    ExpressionStatement: function(node) {
      if (isRequireDefault(node.expression)) {
        return t.importDeclaration([], node.expression.arguments[0]);
      }
    }
  });
};
