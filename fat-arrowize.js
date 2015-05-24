/*
 I didn't see an easy way to disable all of babel's built in
 transforms, so I just whitelisted one I'm not using:

   babel --plugins fat-arrowize --whitelist "react" app --out-dir app2
   rsync -r app2/ app

 Next step here is to detect whether each inner function actually uses
 "_this" vs "this". If they only use "_this" we should rewrite them as
 arrows. If they only use "this" they should keep their context. If
 they use both we should punt on rewriting anything at all.

*/
module.exports = function (babel) {
  var t = babel.types;

  var rewriting = 0;
  var doubleDanger = 0;

  function maybeJustExpression(innerFunc) {
    if (innerFunc.body.body.length === 1 && innerFunc.body.body[0].type === 'ReturnStatement') {
      return innerFunc.body.body[0].argument;
    } else {
      return innerFunc.body;
    }
  }

  return new babel.Transformer('fat-arrowize', {
    CallExpression: {
      enter: function (node) {
        debugger;
        if (node.callee.type === 'FunctionExpression' &&
            node.arguments.length === 1 &&
            node.arguments[0].type === 'ThisExpression' &&
            node.callee.params.length === 1 &&
            node.callee.params[0].type === 'Identifier' &&
            node.callee.params[0].name === '_this' &&
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
