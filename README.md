# iterable-query - Query API for JavaScript (ES6) Iterables

```ts
// TypeScript
import { Query } from "iterable-query";

// JavaScript (CommonJS)
var Query = require("iterable-query").Query;

var q = Query
  .from(books)
  .filter(book => book.author === "Alice")
  .groupBy(book => book.releaseYear);
```

**iterable-query** is a library that provides a query API for ES6 iterables, adding numerous operations found in other
languages like Haskell, Scala, and C# (.NET).

## Installing
For the latest version:

```cmd
npm install iterable-query
```

## Documentation

* [API Reference](docs/iterable-query.md)

## ES5 Support

The **iterable-query** library can be used in an ES5-compatible runtime by importing `"iterable-query/out/es5"`:

```ts
// TypeScript
import { Query } from "iterable-query/out/es5";

// JavaScript
var Query = require("iterable-query/out/es5").Query;
```

The ES5 version of the library has all of the same features as the ES6 version.

## Examples
### Filtering
```ts
var gen = function*() {
  yield 1;
  yield 2;
  yield 3;
};

var evens = Query
  .from(gen())
  .filter(i => i % 2 === 0);

var odds = Query
  .from(gen())
  .where(i => i % 2 === 1); // alias for `filter`
```

### Sorting
```ts
var books = [
  { id: 1, title: "QueryJS a query API for JavaScript", author: "Smith, David" },
  { id: 2, title: "Iterators and You", author: "Smith, Bob" },
  { id: 3, title: "All the Queries", author: "Smith, Frank" }
]

var ordered = Query
  .from(books)
  .orderBy(book => book.title)
  .thenBy(book => book.author);

var result = [...ordered];
```

### Grouping
```ts
var groups = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Standard User" }
];
var users = [
  { id: 1, name: "Bob", groupId: 2 },
  { id: 2, name: "Alice", groupId: 1 },
  { id: 3, name: "Tom", groupId: 2 }
];

var usersByGroup = Query
  .from(groups)
  .groupJoin(users, group => group.id, user => user.id);

for (var groupUsers of usersByGroup) {
  print(groupUsers.key);
  print('======');
  for (var user of groupUsers) {
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