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
  var stack = [];

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
        if (isThisIIFE(node)) {
          stack.unshift({
            node,
            localThis: localThis(node),
            sharesLocalThis: [],
            needsRealThis: false,
            localThisNodes: [],
            ownFunctionExpression: node.callee,
            ownThisExpression: node.arguments[0]
          });
        }
      },
      exit: function (node) {
        if (stack[0] && stack[0].node === node) {
          var state = stack.shift();
          if (
            !state.needsRealThis &&
              state.sharesLocalThis.every(shared => !shared.needsRealThis)
          ) {
            for (var localThisNode of state.localThisNodes) {
              localThisNode.replaceWith(t.thisExpression());
            }

            let callee = maybeJustExpression(node.callee);
            if (t.isExpression(callee)) {
              return callee;
            }
            return t.callExpression(t.arrowFunctionExpression([], callee), []);
          }
        }
      }
    },
    Identifier: function (node) {
      for (var state of stack) {
        if (node.name === state.localThis) {
          state.localThisNodes.push(this);
          if (stack[0].node !== state.node) {
            state.sharesLocalThis.push(stack[0]);
          }
        }
      }
    },
    FunctionExpression: {
      enter: function(node) {
        if (stack[0] && stack[0].ownFunctionExpression === node) {
          return;
        }
        stack.unshift({
          node,
          needsRealThis: false
        });
      },
      exit: function(node) {
        if (stack[0].node === node) {
          var state = stack.shift();
          if (!state.needsRealThis) {
            return t.arrowFunctionExpression(node.params, maybeJustExpression(node));
          }
        }
      }
    },
    ThisExpression: function(node) {
      if (stack[0] && stack[0].ownThisExpression !== node) {
        stack[0].needsRealThis = true;
      }
    }
  });
};
