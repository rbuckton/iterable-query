[Back to Index](index.md)

### In This Section

* [Class: OrderedQuery][OrderedQuery]
    * [new OrderedQuery(source)](#new-orderedquerysource)
    * [query.thenBy(keySelector, comparison?)](#querythenbykeyselector-comparison)
    * [query.thenByDescending(keySelector, comparison?)](#querythenbydescendingkeyselector-comparison)

# Class: OrderedQuery
Represents an ordered sequence of elements.

```ts
export declare class OrderedQuery<T> extends Query<T> implements OrderedIterable<T> {
    ...
}
```

* Type Parameters:
  * <a name="orderedquery-t"></a><samp>T</samp> &mdash; The type for each element.

### Inheritance hierarchy
* [Query][]
    * OrderedQuery



## new OrderedQuery(source)
Creates an OrderedQuery from an [OrderedIterable][] source.

```ts
export declare class OrderedQuery<T> extends Query<T> implements OrderedIterable<T> {
    constructor(source: OrderedIterable<T>);
}
```

* Parameters:
  * `source` <samp>[OrderedIterable][]&lt;[T][]&gt;</samp> &mdash; The source elements.



## query.thenBy(keySelector, comparison?)
Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.

```ts
export declare class OrderedQuery<T> extends Query<T> implements OrderedIterable<T> {
    thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[OrderedQuery][]&lt;[T][]&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.thenByDescending(keySelector, comparison?)
Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.

```ts
export declare class OrderedQuery<T> extends Query<T> implements OrderedIterable<T> {
    thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[OrderedQuery][]&lt;[T][]&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



[T]: #orderedquery-t
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