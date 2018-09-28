# iterable-query - Query API for JavaScript Iterables and Async Iterables

```ts
// TypeScript
import { Query } from "iterable-query";

// JavaScript (CommonJS)
const { Query } = require("iterable-query");

let q = Query
  .from(books)
  .filter(book => book.author === "Alice")
  .groupBy(book => book.releaseYear);

// TypeScript (functional style)
import { filter, groupBy } from "iterable-query/fn";

// JavaScript (functional style, CommonJS)
const { filter, groupBy } = require("iterable-query/fn")

let i = groupBy(
  filter(books,
    book => book.author === "Alice"),
    book => book.releaseYear);
```

**iterable-query** is a library that provides a query API for ES6 iterables, adding numerous operations found in other
languages like Haskell, Scala, and C# (.NET).

## Installing
For the latest version:

```cmd
npm install iterable-query
```

## Documentation

* [API Reference](docs/index.md)

## Examples
### Filtering
```ts
let gen = function*() {
  yield 1;
  yield 2;
  yield 3;
};

let evens = Query
  .from(gen())
  .filter(i => i % 2 === 0);

let odds = Query
  .from(gen())
  .where(i => i % 2 === 1); // alias for `filter`
```

### Sorting
```ts
let books = [
  { id: 1, title: "QueryJS a query API for JavaScript", author: "Smith, David" },
  { id: 2, title: "Iterators and You", author: "Smith, Bob" },
  { id: 3, title: "All the Queries", author: "Smith, Frank" }
]

let ordered = Query
  .from(books)
  .orderBy(book => book.title)
  .thenBy(book => book.author);

let result = [...ordered];
```

### Grouping
```ts
let groups = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Standard User" }
];
let users = [
  { id: 1, name: "Bob", groupId: 2 },
  { id: 2, name: "Alice", groupId: 1 },
  { id: 3, name: "Tom", groupId: 2 }
];

let usersByGroup = Query
  .from(groups)
  .groupJoin(users, group => group.id, user => user.id);

for (let groupUsers of usersByGroup) {
  print(groupUsers.key);
  print('======');
  for (let user of groupUsers) {
    print(user.name);
  }
}
```

### Hierarchies
```ts
let doc = Query
  .hierarchy<Node>(document.body, {
    parent(node: Node) { return node.parentNode; },
    children(node: Node) { return node.childNodes; }
  });

// disable all buttons
doc
  .descendants()
  .where((node: Node): node is HTMLButtonElement => node.type === "BUTTON")
  .forEach(node => {
    node.disabled = true;
  });

// get all thumbnails
let thumbnails = doc
  .descendants()
  .filter(node => node.type === "IMG")
  .map(node => <HTMLImageElement>node)
  .filter(img => img.height < 32 && img.width < 32)
  .toArray();
```

## Supported ECMAScript editions

The default implementation requires a host that supports ES2017 at a minimum. This means support for:
- `Symbol` and `Symbol.iterator`
- `Promise`
- `Map`
- `Set`
- `WeakMap`
- `WeakSet`
- `for..of`
- Generator Functions
- Async Functions

The following ES2018 features are polyfilled:
- `Symbol.asyncIterator` (via `Symbol.for("Symbol.asyncIterator")`).

The following ES2018 features are *not* required to use the default (ES2017) version:
- Async Generator Functions (internal use is transpiled)

In addition, we also provide downlevel support for [ES2015](#es2015-support) and [ES5](#es5-support).

### ES2015 Support

The **iterable-query** library can be used in an ES2015-compatible runtime by importing `"iterable-query/es2015"`:

```ts
// TypeScript
import { Query } from "iterable-query/es2015";

// JavaScript
const { Query } = require("iterable-query/es2015");

// TypeScript (functional style)
import { filter, groupBy } from "iterable-query/es2015/fn";

// JavaScript (functional style)
const { filter, groupBy } = require("iterable-query/es2015/fn");
```

The ES2015 implementation requires a host that supports ES2015 at a minimum. This means support for:
- `Symbol` and `Symbol.iterator`
- `Promise`
- `Map`
- `Set`
- `WeakMap`
- `WeakSet`
- `for..of`
- Generator Functions

The following ES2018 features are polyfilled:
- `Symbol.asyncIterator` (via `Symbol.for("Symbol.asyncIterator")`).

The following ES2017 features are *not* required to use the ES2015 version:
- Async Functions (internal use is transpiled)

The ES2015 version of the library has all of the same features as the normal version.

### ES5 Support

The **iterable-query** library can be used in an ES5-compatible runtime by importing `"iterable-query/es5"`:

```ts
// TypeScript
import { Query } from "iterable-query/es5";

// JavaScript
var iq = require("iterable-query/es5"),
    Query = iq.Query;

// TypeScript (functional style)
import { filter, groupBy } from "iterable-query/es2015/fn";

// JavaScript (functional style)
var fn = require("iterable-query/es2015/fn"),
    filter = fn.filter,
    groupBy = fn.groupBy;
```

The ES5 version of the library has all of the same features as the normal version.

The ES5 implementation requires a host that supports ES5 at a minimum. This means support for:
- `Object.create` and `Object.defineProperty`

The following ES2015 features are *not* polyfilled and require you to supply a runtime polyfill:
- `Promise`

The following ES2015 features are polyfilled:
- `Symbol` and `Symbol.iterator` (which produce strings)
- `Map`
- `Set`
- `WeakMap`
- `WeakSet`

The following ES2017 features are polyfilled:
- `Symbol.asyncIterator` (via `Symbol.for("Symbol.asyncIterator")`).

The following ES2015 and ES2017 features are *not* required to use the ES5 version:
- `for..of`
- Generator Functions (internal use is transpiled)
- Async Functions (internal use is transpiled)