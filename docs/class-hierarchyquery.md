[Back to Index](index.md)

### In This Section

* [Class: HierarchyQuery][HierarchyQuery]
    * [new HierarchyQuery(source)](#new-hierarchyquerysource)
    * [new HierarchyQuery(source, hierarchy)](#new-hierarchyquerysource-hierarchy)
    * [query.hierarchy](#queryhierarchypredicate)
    * [query.root(predicate?)](#queryrootpredicate)
    * [query.ancestors(predicate?)](#queryancestorspredicate)
    * [query.ancestorsAndSelf(predicate?)](#queryancestorsandselfpredicate)
    * [query.parents(predicate?)](#queryparentspredicate)
    * [query.self(predicate?)](#queryselfpredicate)
    * [query.siblings(predicate?)](#querysiblingspredicate)
    * [query.siblingsAndSelf(predicate?)](#querysiblingsandselfpredicate)
    * [query.siblingsBeforeSelf(predicate?)](#querysiblingsbeforeself)
    * [query.siblingsAfterSelf(predicate?)](#querysiblingsafterself)
    * [query.children(predicate?)](#querychildrenpredicate)
    * [query.nthChild(offset)](#querynthchildoffset)
    * [query.descendants(predicate?)](#querydescendantspredicate)
    * [query.descendantsAndSelf(predicate?)](#querydescendantsandselfpredicate)

# Class: HierarchyQuery
Represents a sequence of hierarchically organized values.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    ...
}
```

* Type Parameters:
    * <a name="hierarchyquery-tnode"></a><samp>TNode</samp> &mdash; The base type for each element in the hierarchy.
    * <a name="hierarchyquery-t"></a><samp>T</samp> &mdash; The type for each element.

### Inheritance hierarchy
* [Query][]
    * HierarchyQuery



## new HierarchyQuery(source)
Creates a HierarchyQuery from a [HierarchyIterable][] source.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    constructor(source: HierarchyIterable<TNode, T>);
}
```

* Parameters:
  * `source` <samp>[HierarchyIterable][]&lt;[TNode][], [T][]&gt;</samp> &mdash; The source elements.



## new HierarchyQuery(source, hierarchy)
Creates a HierarchyQuery from a [Queryable][] source and a [HierarchyProvider][]

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    constructor(source: Queryable<T>, hierarchy: HierarchyProvider<TNode>);
}
```

* Parameters:
  * `source` <samp>[Queryable][]&lt;[T][]&gt;</samp> &mdash; The source elements.
  * `hierarchy` <samp>[HierarchyProvider][]&lt;[TNode][]&gt;</samp> &mdash; The hierarchy provider.



## query.root(predicate?)
Creates a subquery for the roots of each element in the hierarchy.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    root(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.ancestors(predicate?)
Creates a subquery for the ancestors of each element in the hierarchy.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    ancestors(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.ancestorsAndSelf(predicate?)
Creates a subquery for the ancestors of each element as well as each element in the hierarchy.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    ancestorsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.parents(predicate?)
Creates a subquery for the parents of each element in the hierarchy.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    parents(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.self(predicate?)
Creates a subquery for this query.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    self(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.siblings(predicate?)
Creates a subquery for the siblings of each element in the hierarchy.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    siblings(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.siblingsAndSelf(predicate?)
Creates a subquery for the siblings of each element as well as each element in the hierarchy.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    siblingsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.siblingsBeforeSelf(predicate?)
Creates a subquery for the siblings before each element in the hierarchy.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    siblingsBeforeSelf(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.siblingsAfterSelf(predicate?)
Creates a subquery for the siblings after each element in the hierarchy.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    siblingsAfterSelf(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.children(predicate?)
Creates a subquery for the children of each element in the hierarchy.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    children(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.nthChild(offset)
Creates a subquery for the child of each element at the specified offset. A negative offset
starts from the last child.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    nthChild(offset: number): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `offset` <samp>[Number][]</samp> &mdash; The offset for the child.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.descendants(predicate?)
Creates a subquery for the descendants of each element in the hierarchy.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    descendants(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



## query.descendantsAndSelf(predicate?)
Creates a subquery for the descendants of each element as well as each element in the hierarchy.

```ts
export declare class HierarchyQuery<TNode, T extends TNode = T> extends Query<T> implements HierarchyIterable<TNode, T> {
    descendantsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<TNode, TNode>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;[TNode][], [TNode][]&gt;</samp>



[TNode]: #hierarchyquery-tnode
[T]: #hierarchyquery-t
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