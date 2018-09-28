[Back to Index](index.md)

### In This Section

* [Class: Lookup][Lookup]
    * [new Lookup(entries)](#new-lookupentries)
    * [lookup.size](#lookupsize)
    * [lookup.has(key)](#lookuphaskey)
    * [lookup.get(key)](#lookupgetkey)
    * [lookup.applyResultSelector(selector)](#lookupapplyresultselectorselector)



# Class: Lookup
Represents a collection of [Groupings][Grouping] organized by their keys.

```ts
export declare class Lookup<K, V> implements Iterable<Grouping<K, V>> {
    ...
}
```

* Type Parameters:
    * <a name="lookup-k"></a><samp>K</samp> &mdash; The type for the group's key.
    * <a name="lookup-v"></a><samp>V</samp> &mdash; The type for each element in the group.

### Inheritance hierarchy
* Lookup



## new Lookup(entries)
Creates a new [Lookup][] for the provided groups.

```ts
export declare class Lookup<K, V> implements Iterable<Grouping<K, V>> {
    constructor(entries: Queryable<[K, Queryable<V>]>);
}
```

* Parameters:
  * `entries` <samp>[Queryable][]&lt;[K][], [Queryable][]&lt;[V][]&gt;</samp> &mdash; A map containing the unique groups of values.



## lookup.size
Gets the number of unique keys.

```ts
export declare class Lookup<K, V> implements Iterable<Grouping<K, V>> {
    readonly size: number;
}
```

* Returns: <samp>[Number][]</samp>



## lookup.has(key)
Gets a value indicating whether any group has the provided key.

```ts
export declare class Lookup<K, V> implements Iterable<Grouping<K, V>> {
    has(key: K): boolean;
}
```

* Parameters:
  * `key` <samp>K</samp> &mdash; A key.
* Returns: <samp>[Boolean][]</samp>



## lookup.get(key)
Gets the group for the provided key.

```ts
export declare class Lookup<K, V> implements Iterable<Grouping<K, V>> {
    get(key: K): Query<V>;
}
```

* Parameters:
  * `key` <samp>K</samp> &mdash; A key.
* Returns: <samp>[Query][]&lt;[V][]&gt;</samp>



## lookup.applyResultSelector(selector)
Creates a Query that maps each group in the Lookup.

```ts
export declare class Lookup<K, V> implements Iterable<Grouping<K, V>> {
    applyResultSelector<R>(selector: (key: K, elements: Query<V>) => R): Query<R>;
}
```

* Parameters:
  * `selector` <samp>[Function][]</samp> &mdash; A callback used to select results for each group.
* Returns: <samp>[Query][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>R</samp> &mdash; The type for each element in the result.



[K]: #lookup-k
[V]: #lookup-v
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