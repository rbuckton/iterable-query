[Back to Index](index.md)

### In This Section

* [Class: OrderedHierarchyQuery][OrderedHierarchyQuery]
    * [new OrderedHierarchyQuery(source)](#new-orderedhierarchyquerysource)
    * [query.thenBy(keySelector, comparison?)](#querythenbykeyselector-comparison)
    * [query.thenByDescending(keySelector, comparison?)](#querythenbydescendingkeyselector-comparison)

# Class: OrderedHierarchyQuery
Represents an ordered sequence of hierarchically organized values.

```ts
export declare class OrderedHierarchyQuery<TNode, T extends TNode = TNode> extends HierarchyQuery<TNode, T> implements OrderedIterable<T> {
    ...
}
```

### Inheritance hierarchy
* [Query][]
  * [HierarchyQuery][]
    * OrderedHierarchyQuery



## new OrderedHierarchyQuery(source)
Creates an OrderedHierarchyQuery from an [OrderedHierarchyIterable][] source.

```ts
export declare class OrderedHierarchyQuery<TNode, T extends TNode = TNode> extends HierarchyQuery<TNode, T> implements OrderedIterable<T> {
    constructor(source: OrderedHierarchyIterable<TNode, T>);
}
```

* Parameters:
  * `source` <samp>[OrderedHierarchyIterable][]&lt;[TNode][], [T][]&gt;</samp> &mdash; The source elements.



## query.thenBy(keySelector, comparison?)
Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.

```ts
export declare class OrderedHierarchyQuery<TNode, T extends TNode = TNode> extends HierarchyQuery<TNode, T> implements OrderedIterable<T> {
    thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<TNode, T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[OrderedHierarchyQuery][]&lt;[TNode][], [T][]&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.thenByDescending(keySelector, comparison?)
Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.

```ts
export declare class OrderedHierarchyQuery<TNode, T extends TNode = TNode> extends HierarchyQuery<TNode, T> implements OrderedIterable<T> {
    thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<TNode, T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[OrderedHierarchyQuery][]&lt;[TNode][], [T][]&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



[TNode]: #orderedhierarchyquery-tnode
[T]: #orderedhierarchyquery-t
[Queryable]: type-queryable.md#type-queryable
[HierarchyProvider]: interface-hierarchyprovider.md#interface-hierarchyprovider
[HierarchyIterable]: interface-hierarchyiterable.md#interface-hierarchyiterable
[OrderedIterable]: interface-orderediterable.md#interface-orderediterable
[OrderedHierarchyIterable]: interface-orderedhierarchyiterable.md#interface-orderedhierarchyiterable
[Grouping]: interface-grouping.md#interface-grouping
[Page]: interface-page.md#interface-page
[Lookup]: class-lookup.md#class-lookup
[HierarchyQuery]: class-hierarchyquery.md#class-hierarchyquery
[OrderedQuery]: class-orderedquery.md#class-orderedquery
[Query]: class-query.md#class-query
[OrderedHierarchyQuery]: class-orderedhierarchyquery.md#class-orderedhierarchyquery
[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator
[Iterator]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator
[Number]: http://ecma-international.org/ecma-262/6.0/index.html#sec-number-constructor
[Boolean]: http://ecma-international.org/ecma-262/6.0/index.html#sec-boolean-constructor
[Object]: http://ecma-international.org/ecma-262/6.0/index.html#sec-object-constructor
[Function]: http://ecma-international.org/ecma-262/6.0/index.html#sec-function-constructor
[Error]: http://ecma-international.org/ecma-262/6.0/index.html#sec-error-constructor
[Map]: http://ecma-international.org/ecma-262/6.0/index.html#sec-map-constructor
[Set]: http://ecma-international.org/ecma-262/6.0/index.html#sec-set-constructor