/*

 Strategy:

   1. Identifier a scope where `this` has been bound to a local
   variable. Initially I'm just matching (function(_this){
   ... }(this)), but eventually we could also match `var self =
   this;...` if we can also assert that there are not other
   assignments to `self`.

   2. Check the whole scope to make sure it never uses the real
   `this`, so that we can safely rebind it. Bail out otherwise.

   3. When we enter an inner function expression, start testing to see
   if it mentions `this` and if it mentions our local-this-var.

     - if it mentions both, we have to bail on the whole transformation.

     - if it just mentions `this`, we leave it alone but keep working
       on the rest of the transformation.

     - otherwise, we can rewrite it to an arrow function and any use
       of local-this-var rewrites to `this`.

   4. Rewrite the local variable to `this`.

   5. Remove the outer scope (or local variable declaration).


*/
module.exports = function (babel) {
  var t = babel.types;

  var rewriting = 0;
  var doubleDanger = 0;

  // Try to convert a single return statement to an expression.
  function maybeJustExpression(innerFunc) {
    if (innerFunc.body.body.length === 1 && innerFunc.body.body[0].type === 'ReturnStatement') {
      return innerFunc.body.body[0].argument;
    } else {
      return innerFunc.body;
    }
  }

  // Test for `(function(x) { ... })(this)`
  function isThisIIFE(node) {
    return t.isFunctionExpression(node.callee) &&
      node.arguments.length === 1 &&
      t.isThisExpression(node.arguments[0]) &&
      node.callee.params.length === 1 &&
      t.isIdentifier(node.callee.params[0]);
  }

  // Given `(function(x) { ... })(this)`, returns 'x'.
  function localThis(node) {
    return node.callee.params[0].name;
  }

  return new babel.Transformer('fat-arrowize', {
    CallExpression: {
      enter: function (node) {

        if (isThisIIFE(node) &&
            localThis(node) === '_this' &&
            node.callee.body.body.length === 1 &&
            node.callee.body.body[0].type === 'ReturnStatement' &&
            node.callee.body.body[0].argument.type === 'FunctionExpression'
           ) {
             var innerFunc = node.callee.body.body[0].argument;
             node._custom_stuff = {
               params: innerFunc.params,
               innerBody: maybeJustExpression(innerFunc)
             };
             rewriting++;
           }
        return node;
      },
      exit: function (node) {
        if (node._custom_stuff) {
          rewriting--;
          return t.arrowFunctionExpression(node._custom_stuff.params, node._custom_stuff.innerBody);
        }
      }
    },
    Identifier: function (node) {
      if (rewriting && node.name === '_this') {
        var newNode = t.thisExpression();
        newNode._was_underscore_this = true;
        return newNode;
      }
      if (rewriting && node.name === 'arguments') {
        return t.identifier('INVALID_ARGUMENTS');
      }
    },
    FunctionExpression: {
      enter: function () {
        if (rewriting) {
          doubleDanger++;
        }
      },
      exit: function (node) {
        if (rewriting) {
          doubleDanger--;
          return t.arrowFunctionExpression(node.params, maybeJustExpression(node));
        }
      }
    },
    ThisExpression: function (node) {
      if (doubleDanger && !node._was_underscore_this) {
        return t.identifier('INVALID_THIS');
      }
    }
  });
};
