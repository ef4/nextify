These are experimental babel transforms for cleaning up your codebase
with nice ES6+ idioms.

Babel is usually used for turning nice source code into runnable
source code. But in this case we can take advantage of its
infrastructure to do the reverse: take an old codebase and make it
nicer.

For example, we can turn CoffeeScript into ES6 by first compilng it
with our usual coffescript compiler, and then running it through these
transforms to opportunistically clean up the resulting messes.

# Using them

**These are still experimental, good luck.**

# Transformations

## Fat-Arrowize

This transform looks for opportunities to rewrite functions as arrow
expressions, based on the use of `this`. Function expressions that
don't access `this` are safe to rewrite, so:

```js
myList.map(function(x){ return x + 1; })
```

becomes:

```js
myList.map(x => x + 1)
```

We can also detect common patterns for binding `this` and greatly
simplify them. For example, this is how CoffeeScript's fat arrow
compiles:

```js
myList.map((function(_this) {
  return function(elt) {
    this.handle(elt);
  };
})(this));
```

which we can automatically convert to:

```js
myList.map(elt => this.handle(elt));
```

## Spreadify

Turns `a.b.apply(a, c)` into `a.b(...c)`, *which is not always
safe*. So you'll want to manually review this one.
