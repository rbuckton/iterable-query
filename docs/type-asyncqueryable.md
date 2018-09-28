[Back to Index](index.md)

### In This Section

* [Type: AsyncQueryable](#type-asyncqueryable)

# Type: AsyncQueryable
Represents an object that is either [AsyncIterable][], [Iterable][] or array-like.

```ts
export declare type AsyncQueryable<T> = AsyncIterable<T> | Queryable<PromiseLike<T> | T>;
```

* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



[AsyncIterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.asynciterator
[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator