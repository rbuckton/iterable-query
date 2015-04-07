QueryJS
=======

Query API over JavaScript (ES6) Iterators

## Examples
### Filtering
```js
var gen = function*() {
  yield 1
  yield 2
  yield 3
}

var evens = Query
  .from(gen)
  .filter(i => i % 2 === 0);
  
var odds = Query
  .from(gen)
  .filter(i => i % 2 === 1);
```

### Sorting
```js
var books = [
  { id: 1, title: "QueryJS a query API for JavaScript", author: "Vance, David" },
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
```js
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

## API Reference

```ts
interface Iterator<T> extends Iterable<T> {
  next(): { value?: T, done: boolean };
}

interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

interface GeneratorFunction<T> {
  (): Iterator<T>;
}

interface Grouping<TKey, TValue> extends Query<TValue> {
  key: TKey;
}

interface Lookup<TKey, TValue> extends Query<Grouping<TKey, TValue>> {
  has(key: TKey): boolean;
  get(key: TKey): Query<TValue>;
  applyResultSelector<TResult>(selector: (key: TKey, values: Query<TValue>) => TResult): Query<TResult>;
}

class Query<T> extends Iterable<T> {
  /**
   *  Initializes a new Query
   *  @param source - An object that implements the iterator protocol (has a callable System.iterator property)
   */
  constructor(source: Iterable<T>);

  /**
   *  Initializes a new Query
   *  @param source - A generator function
   */
  constructor(source: GeneratorFunction<T>);

  /**
   *  Initializes a new Query
   *  @param source - An object that implements the iterator protocol (has a callable System.iterator property)
   *  @returns The source if it is a Query instance, otherwise a new Query for the source
   */
  static from(source: Iterator<T>);

  /**
   *  Initializes a new Query
   *  @param source - A generator function
   *  @returns The source if it is a Query instance, otherwise a new Query for the source
   */
  static from(source: GeneratorFunction<T>);

  static empty<T>(): Query<T>;
  
  static once<T>(value: T): Query<T>;
  
  static repeat<T>(value: T, count: number): Query<T>;
  
  static range(start: number, end: number): Query<number>;
  
  filter(predicate: (value: T, index: number) => boolean): Query<T>;
  
  map<TResult>(projection: (value: T, index: number) => TResult): Query<TResult>;
  
  flatMap<TResult>(projection: (value: T, index: number) => Iterator<TResult>): Query<TResult>;
  
  skip(count: number): Query<T>;
  
  take(count: number): Query<T>;
  
  skipWhile(condition: (value: T, index: number) => boolean): Query<T>;
  
  takeWhile(condition: (value: T, index: number) => boolean): Query<T>;
  
  reverse(): Query<T>;
  
  intersect(other: Iterable<T>): Query<T>;
  
  intersect(other: GeneratorFunction<T>): Query<T>;
  
  union(other: Iterable<T>): Query<T>;
  
  union(other: GeneratorFunction<T>): Query<T>;
  
  except(other: Iterable<T>): Query<T>;
  
  except(other: GeneratorFunction<T>): Query<T>;
  
  distinct(): Query<T>;
  
  concat(other: Iterable<T>): Query<T>;
  
  concat(other: GeneratorFunction<T>): Query<T>;
  
  zip<TOther, TResult>(other: Iterable<TOther>, selector: (x: T, y: TOther) => TResult): Query<TResult>;
  
  zip<TOther, TResult>(other: GeneratorFunction<TOther>, selector: (x: T, y: TOther) => TResult): Query<TResult>;
  
  orderBy<TKey>(keySelector: (value: T) => TKey, comparison?: (x: TKey, y: TKey) => number): OrderedQuery<T>;
  
  orderByDescending<TKey>(keySelector: (value: T) => TKey, comparison?: (x: TKey, y: TKey) => number): OrderedQuery<T>;
  
  groupBy<TKey>(keySelector: (value: T) => TKey): Query<Grouping<TKey, T>>;
  
  groupBy<TKey, TElement>(keySelector: (value: T) => TKey, elementSelector: (value: T) => TElement): Query<Grouping<TKey, TElement>>;
  
  groupBy<TKey, TElement, TResult>(keySelector: (value: T) => TKey, elementSelector: (value: T) => TElement, resultSelector: (key: TKey, values: Query<TElement>) => TResult): Query<TResult>;
  
  groupJoin<TInner, TKey, TResult>(inner: Iterable<TInner>, outerKeySelector: (value: T) => TKey, innerKeySelector: (value: TInner) => TKey, resultSelector: (outer: T, inner: Query<TInner>) => TResult): Query<TResult>;

  groupJoin<TInner, TKey, TResult>(inner: GeneratorFunction<TInner>, outerKeySelector: (value: T) => TKey, innerKeySelector: (value: TInner) => TKey, resultSelector: (outer: T, inner: Query<TInner>) => TResult): Query<TResult>;
  
  join<TInner, TKey, TResult>(inner: Iterable<TInner>, outerKeySelector: (value: T) => TKey, innerKeySelector: (value: TInner) => TKey, resultSelector: (outer: T, inner: TInner) => TResult): Query<TResult>;

  join<TInner, TKey, TResult>(inner: GeneratorFunction<TInner>, outerKeySelector: (value: T) => TKey, innerKeySelector: (value: TInner) => TKey, resultSelector: (outer: T, inner: TInner) => TResult): Query<TResult>;
  
  min(): T;
  
  min<TElement>(selector: (value: T) => TElement): TElement;
  
  max(): T;
  
  max<TElement>(selector: (value: T) => TElement): TElement;
  
  sum(selector?: (value: T) => number): number;
  
  average(selector?: (value: T) => number): number;
  
  has(value: T): boolean;
  
  sequenceEquals(other: Iterable<T>): boolean;
  
  reduce(accumulator: (accumulator: T, value: T) => T): T;
  
  reduce<TAccumulator>(accumulator: (accumulator: TAccumulator, value: T) => TAccumulator, seed: TAccumulator): TAccumulator;
  
  reduceRight(accumulator: (accumulator: T, value: T) => T): T;
  
  reduceRight<TAccumulator>(accumulator: (accumulator: TAccumulator, value: T) => TAccumulator, seed: TAccumulator): TAccumulator;
  
  forEach(callback: (value: T, index: number) => void);
  
  first(filter?: (value: T) => boolean): T;
  
  last(filter?: (value: T) => boolean): T;
  
  item(index: number): T;
  
  single(filter?: (value: T) => boolean): T;
  
  count(filter?: (value: T) => boolean): number;
  
  some(filter?: (value: T) => boolean): boolean;
  
  every(filter: (value: T) => boolean): boolean;
  
  toArray(): T[];
  
  toArray<TElement>(selector: (value: T) => TElement): TElement[];
  
  toLookup<TKey>(keySelector: (value: T) => TKey): Lookup<TKey, T>;
  
  toLookup<TKey, TElement>(keySelector: (value: T) => TKey, elementSelector: (value: T) => TElement): Lookup<TKey, TElement>;
  
  toSet(): Set<T>;
  
  toSet<TElement>(selector: (value: T) => TElement): TElement;
  
  toMap<TKey>(keySelector: (value: T) => TKey): Map<TKey, T>;
  
  toMap<TKey, TValue>(keySelector: (value: T) => TKey, valueSelector: (value: T) => TValue): Map<TKey, TValue>;
  
  toString(): string;
  
  [Symbol.iterator](): Iterator<T>;
}

interface OrderedQuery<T> extends Query<T> {
  thenBy<TKey>(keySelector: (value: T) => TKey, comparison?: (x: TKey, y: TKey) => number): OrderedQuery<T>;
  
  thenByDescending<TKey>(keySelector: (value: T) => TKey, comparison?: (x: TKey, y: TKey) => number): OrderedQuery<T>;
}
```
