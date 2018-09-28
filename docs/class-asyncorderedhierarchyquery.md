[Back to Index](index.md)

### In This Section

* [Class: AsyncOrderedHierarchyQuery][AsyncOrderedHierarchyQuery]
    * [new AsyncOrderedHierarchyQuery(source)](#new-asyncorderedhierarchyquerysource)
    * [query.thenBy(keySelector, comparison?)](#querythenbykeyselector-comparison)
    * [query.thenByDescending(keySelector, comparison?)](#querythenbydescendingkeyselector-comparison)

# Class: AsyncOrderedHierarchyQuery
Represents an ordered asynchronous sequence of hierarchically organized values.

```ts
export declare class AsyncOrderedHierarchyQuery<TNode, T extends TNode = TNode> extends AsyncHierarchyQuery<TNode, T> implements AsyncOrderedIterable<T> {
    ...
}
```

* Type Parameters:
  * <a name="asyncorderedhierarchyquery-tnode"></a><samp>TNode</samp> &mdash; The base type for each element in the hierarchy.
  * <a name="asyncorderedhierarchyquery-t"></a><samp>T</samp> &mdash; The type for each element in the iterable.

### Inheritance hierarchy
* [AsyncQuery][]
  * [AsyncHierarchyQuery][]
    * AsyncOrderedHierarchyQuery



## new AsyncOrderedHierarchyQuery(source)
Creates an AsyncOrderedHierarchyQuery from an [AsyncOrderedHierarchyIterable][] or [OrderedHierarchyIterable][] source.

```ts
export declare class AsyncOrderedHierarchyQuery<TNode, T extends TNode = TNode> extends AsyncHierarchyQuery<TNode, T> implements AsyncOrderedIterable<T> {
    constructor(source: PossiblyAsyncOrderedHierarchyIterable<TNode, T>);
}
```

* Parameters:
  * `source` <samp>[AsyncOrderedHierarchyIterable][]&lt;[TNode][], [T][]&gt; | [OrderedHierarchyIterable][]&lt;[TNode][], [T][]&gt;</samp> &mdash; The source elements.



## query.thenBy(keySelector, comparison?)
Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.

```ts
export declare class AsyncOrderedHierarchyQuery<TNode, T extends TNode = TNode> extends AsyncHierarchyQuery<TNode, T> implements AsyncOrderedIterable<T> {
    thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyQuery<TNode, T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[AsyncOrderedHierarchyQuery][]&lt;[TNode][], [T][]&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.thenByDescending(keySelector, comparison?)
Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.

```ts
export declare class AsyncOrderedHierarchyQuery<TNode, T extends TNode = TNode> extends AsyncHierarchyQuery<TNode, T> implements AsyncOrderedIterable<T> {
    thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyQuery<TNode, T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[AsyncOrderedHierarchyQuery][]&lt;[TNode][], [T][]&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



[TNode]: #asyncorderedhierarchyquery-tnode
[T]: #asyncorderedhierarchyquery-t
[Queryable]: type-queryable.md#type-queryable
[AsyncQueryable]: type-queryable.md#type-asyncqueryable
[HierarchyProvider]: interface-hierarchyprovider.md#interface-hierarchyprovider
[Hierarchical]: interface-hierarchical.md#interface-hierarchical
[HierarchyIterable]: interface-hierarchyiterable.md#interface-hierarchyiterable
[OrderedIterable]: interface-orderediterable.md#interface-orderediterable
[OrderedHierarchyIterable]: interface-orderedhierarchyiterable.md#interface-orderedhierarchyiterable
[AsyncHierarchyIterable]: interface-asynchierarchyiterable.md#interface-asynchierarchyiterable
[AsyncOrderedIterable]: interface-asyncorderediterable.md#interface-asyncorderediterable
[AsyncOrderedHierarchyIterable]: interface-asyncorderedhierarchyiterable.md#interface-asyncorderedhierarchyiterable
[Grouping]: interface-grouping.md#interface-grouping
[Page]: interface-page.md#interface-page
[Lookup]: class-lookup.md#class-lookup
[Query]: class-query.md#class-query
[HierarchyQuery]: class-hierarchyquery.md#class-hierarchyquery
[OrderedQuery]: class-orderedquery.md#class-orderedquery
[OrderedHierarchyQuery]: class-orderedhierarchyquery.md#class-orderedhierarchyquery
[AsyncQuery]: class-asyncquery.md#class-asyncquery
[AsyncOrderedQuery]: class-asyncorderedquery.md#class-asyncorderedquery
[AsyncHierarchyQuery]: class-asynchierarchyquery.md#class-asynchierarchyquery
[AsyncOrderedHierarchyQuery]: class-asyncorderedhierarchyquery.md#class-asyncorderedhierarchyquery
[AsyncIterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.asynciterator
[AsyncIterator]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.asynciterator
[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator
[Iterator]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator
[Number]: http://ecma-international.org/ecma-262/6.0/index.html#sec-number-constructor
[Boolean]: http://ecma-international.org/ecma-262/6.0/index.html#sec-boolean-constructor
[Object]: http://ecma-international.org/ecma-262/6.0/index.html#sec-object-constructor
[Function]: http://ecma-international.org/ecma-262/6.0/index.html#sec-function-constructor
[Error]: http://ecma-international.org/ecma-262/6.0/index.html#sec-error-constructor
[Promise]: http://ecma-international.org/ecma-262/6.0/index.html#sec-promise-constructor
[Map]: http://ecma-international.org/ecma-262/6.0/index.html#sec-map-constructor
[Set]: http://ecma-international.org/ecma-262/6.0/index.html#sec-set-constructor