# Iterable Query Library (iterable-query) - Query API for JavaScript (ES6) Iterables

The `iterable-query` package provides a library of query operations over an ES6 iterable (or non-iterable
array-like). This API is primarily exposed through the [Query][] class:

```ts
import { Query } from "iterable-query";

let odds = Query
    .from([1, 2, 3])
    .filter(x => x % 2 === 1);
```

There are two sets of query operators provided in this package. Some query operators return a
*scalar value* that is evaluated eagerly. Any query operator that returns a *subquery* is not
evaluated immediately. Instead, evaluation is deferred until such a time as a *scalar value* is
requested or the subquery is iterated.

### Table of Contents

* [Type: Queryable][Queryable]
* [Type: AsyncQueryable][AsyncQueryable]
* [Interface: OrderedIterable][OrderedIterable]
* [Interface: Hierarchical][Hierarchical]
* [Interface: HierarchyProvider][HierarchyProvider]
* [Interface: HierarchyIterable][HierarchyIterable]
* [Interface: OrderedHierarchyIterable][OrderedHierarchyIterable]
* [Interface: AsyncOrderedIterable][AsyncOrderedIterable]
* [Interface: AsyncHierarchyIterable][AsyncHierarchyIterable]
* [Interface: AsyncOrderedHierarchyIterable][AsyncOrderedHierarchyIterable]
* [Interface: Grouping][Grouping]
* [Interface: Page][Page]
* [Class: Lookup][Lookup]
* [Class: Query][Query]
* [Class: HierarchyQuery][HierarchyQuery]
* [Class: OrderedQuery][OrderedQuery]
* [Class: OrderedHierarchyQuery][OrderedHierarchyQuery]
* [Class: AsyncQuery][AsyncQuery]
* [Class: AsyncOrderedQuery][AsyncOrderedQuery]
* [Class: AsyncHierarchyQuery][AsyncHierarchyQuery]
* [Class: AsyncOrderedHierarchyQuery][AsyncOrderedHierarchyQuery]

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
