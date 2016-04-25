# Iterable Query Library (iql) - Query API for JavaScript (ES6) Iterables
[Back to Index](index.md)

### Table of Contents
* [Iterable Query Library](#iterable-query-library)
    * [Type: Queryable][Queryable]
    * [Class: Query][Query]
        * [new Query(source)](#new-querysource)
        * [Query.from(source)](#queryfromsource)
        * [Query.of(...elements)](#queryofelements)
        * [Query.empty()](#queryempty)
        * [Query.once(value)](#queryoncevalue)
        * [Query.repeat(value, count)](#queryrepeatvalue-count)
        * [Query.range(start, end, increment?)](#queryrangestart-end-increment)
        * [Query.continuous(value)](#querycontinuousvalue)
        * [Query.generate(count, generator)](#querygeneratecount-generator)
        * [Query.hierarchy(root, hierarchy)](#queryhierarchyroot-hierarchy)
        * [Query.consume(iterator)](#queryconsumeiterator)
        * [query.filter(predicate)](#queryfilterpredicate)
        * [query.where(predicate)](#querywherepredicate)
        * [query.map(selector)](#querymapselector)
        * [query.select(selector)](#queryselectselector)
        * [query.flatMap(projection)](#queryflatmapprojection)
        * [query.selectMany(projection)](#queryselectmanyprojection)
        * [query.reverse()](#queryreverse)
        * [query.skip(count)](#queryskipcount)
        * [query.skipRight(count)](#queryskiprightcount)
        * [query.skipWhile(predicate)](#queryskipwhilepredicate)
        * [query.take(count)](#querytakecount)
        * [query.takeRight(count)](#querytakerightcount)
        * [query.takeWhile(predicate)](#querytakewhilepredicate)
        * [query.intersect(other)](#queryintersectother)
        * [query.union(other)](#queryunionother)
        * [query.except(other)](#queryexceptother)
        * [query.concat(other)](#queryconcatother)
        * [query.distinct()](#querydistinct)
        * [query.append(value)](#queryappendvalue)
        * [query.prepend(value)](#queryprependvalue)
        * [query.patch(start, skipCount, range)](#querypatchstart-skipcount-range)
        * [query.defaultIfEmpty(defaultValue)](#querydefaultifemptydefaultvalue)
        * [query.pageBy(pageSize)](#querypagebypagesize)
        * [query.zip(right)](#queryzipright)
        * [query.zip(right, selector)](#queryzipright-selector)
        * [query.orderBy(keySelector, comparison?)](#queryorderbykeyselector-comparison)
        * [query.orderByDescending(keySelector, comparison?)](#queryorderbydescendingkeyselector-comparison)
        * [query.spanMap(keySelector)](#queryspanmapkeyselector)
        * [query.spanMap(keySelector, elementSelector)](#queryspanmapkeyselector-elementselector)
        * [query.spanMap(keySelector, elementSelector, resultSelector)](#queryspanmapkeyselector-elementselector-resultselector)
        * [query.groupBy(keySelector)](#querygroupbykeyselector)
        * [query.groupBy(keySelector, elementSelector)](#querygroupbykeyselector-elementselector)
        * [query.groupBy(keySelector, elementSelector, resultSelector)](#querygroupbykeyselector-elementselector-resultselector)
        * [query.groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector)](#querygroupjoininner-outerkeyselector-innerkeyselector-resultselector)
        * [query.join(inner, outerKeySelector, innerKeySelector, resultSelector)](#queryjoininner-outerkeyselector-innerkeyselector-resultselector)
        * [query.scan(accumulator)](#queryscanaccumulator)
        * [query.scan(accumulator, seed?)](#queryscanaccumulator-seed)
        * [query.scanRight(accumulator)](#queryscanrightaccumulator)
        * [query.scanRight(accumulator, seed?)](#queryscanrightaccumulator-seed)
        * [query.reduce(accumulator)](#queryreduceaccumulator)
        * [query.reduce(accumulator, seed?)](#queryreduceaccumulator-seed)
        * [query.reduce(accumulator, seed, resultSelector)](#queryreduceaccumulator-seed-resultselector)
        * [query.reduceRight(accumulator)](#queryreducerightaccumulator)
        * [query.reduceRight(accumulator, seed?)](#queryreducerightaccumulator-seed)
        * [query.reduceRight(accumulator, seed, resultSelector)](#queryreducerightaccumulator-seed-resultselector)
        * [query.count(predicate?)](#querycountpredicate)
        * [query.first(predicate?)](#queryfirstpredicate)
        * [query.last(predicate?)](#querylastpredicate)
        * [query.single()](#querysingle)
        * [query.min(comparison?)](#querymincomparison)
        * [query.max(comparison?)](#querymaxcomparison)
        * [query.some(predicate?)](#querysomepredicate)
        * [query.every(predicate)](#queryeverypredicate)
        * [query.corresponds(other)](#querycorrespondsother)
        * [query.corresponds(other, equalityComparison?)](#querycorrespondsother-equalitycomparison)
        * [query.includes(value)](#queryincludesvalue)
        * [query.includesSequence(other)](#queryincludessequenceother)
        * [query.includesSequence(other, equalityComparison)](#queryincludessequenceother-equalitycomparison)
        * [query.startsWith(other)](#querystartswithother)
        * [query.startsWith(other, equalityComparison)](#querystartswithother-equalitycomparison)
        * [query.endsWith(other)](#queryendswithother)
        * [query.endsWith(other, equalityComparison)](#queryendswithother-equalitycomparison)
        * [query.elementAt(offset)](#queryelementatoffset)
        * [query.span(predicate)](#queryspanpredicate)
        * [query.break(predicate)](#querybreakpredicate)
        * [query.forEach(callback)](#queryforeachcallback)
        * [query.toHierarchy(hierarchy)](#querytohierarchyhierarchy)
        * [query.toArray()](#querytoarray)
        * [query.toArray(selector?)](#querytoarrayselector)
        * [query.toSet()](#querytoset)
        * [query.toSet(elementSelector?)](#querytosetelementselector)
        * [query.toMap(keySelector)](#querytomapkeyselector)
        * [query.toMap(keySelector, elementSelector?)](#querytomapkeyselector-elementselector)
        * [query.toLookup(keySelector)](#querytolookupkeyselector)
        * [query.toLookup(keySelector, elementSelector?)](#querytolookupkeyselector-elementselector)
        * [query.toObject(prototype, keySelector)](#querytoobjectprototype-keyselector)
        * [query.toObject(prototype, keySelector, elementSelector?)](#querytoobjectprototype-keyselector-elementselector)
        * [query\[Symbol.iterator\]()](#querysymboliterator)
    * [Class: OrderedQuery][OrderedQuery]
        * [query.thenBy(keySelector, comparison?)](#querythenbykeyselector-comparison)
        * [query.thenByDescending(keySelector, comparison?)](#querythenbydescendingkeyselector-comparison)
    * [Interface: HierarchyProvider][HierarchyProvider]
        * [provider.parent(element)](#providerparentelement)
        * [provider.children(element)](#providerchildrenelement)
    * [Class: HierarchyQuery][HierarchyQuery]
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
    * [Class: OrderedHierarchyQuery][OrderedHierarchyQuery]
        * [query.thenBy(keySelector, comparison?)](#querythenbykeyselector-comparison-1)
        * [query.thenByDescending(keySelector, comparison?)](#querythenbydescendingkeyselector-comparison-1)
    * [Class: Grouping][Grouping]
        * [new Grouping(key, items)](#new-groupingkey-items)
        * [group.key](#groupkey)
    * [Class: Lookup][Lookup]
        * [new Lookup(entries)](#new-lookupentries)
        * [lookup.size](#lookupsize)
        * [lookup.has(key)](#lookuphaskey)
        * [lookup.get(key)](#lookupgetkey)
        * [lookup.applyResultSelector(selector)](#lookupapplyresultselectorselector)
    * [Class: Page][Page]
        * [new Page(page, offset, items)](#new-pagepage-offset-items)
        * [page.page](#pagepage)
        * [page.offset](#pageoffset)
    * [from(source)](#fromsource)
    * [repeat(value, count)](#repeatvalue-count)
    * [range(start, end, increment?)](#rangestart-end-increment)
    * [hierarchy(root, hierarchy)](#hierarchyroot-hierarchy)



# Iterable Query Library
The `iql` package provides a library of query operations over an ES6 iterable (or non-iterable
array-like). This API is primarily exposed through the [Query][] class:

```ts
import { Query } from "iql";

let odds = Query
    .from([1, 2, 3])
    .filter(x => x % 2 === 1);
```

There are two sets of query operators provided in this package. Some query operators return a
*scalar value* that is evaluated eagerly. Any query operator that returns a *subquery* is not
evaluated immediately. Instead, evaluation is deferred until such a time as a *scalar value* is
requested or the subquery is iterated.



# Type: Queryable
Represents an object that is either iterable or array-like.

```ts
export declare type Queryable<T> = Iterable<T> | ArrayLike<T>;
```

* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



# Class: Query
A Query represents a series of operations that act upon an [Iterable][] or array-like. Evaluation of
these operations is deferred until the either a scalar value is requested from the Query or the
Query is iterated.

```ts
export declare class Query<T> implements Iterable<T> {
    ...
}
```

* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## new Query(source)
Creates a Query from a [Queryable][] source.

```ts
export declare class Query<T> {
    constructor(source: Queryable<T>);
}
```

* Parameters:
  * `source` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; The source elements.
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## Query.from(source)
Creates a Query from a [Queryable][] source.

```ts
export declare class Query<T> {
    public static from<T>(source: Queryable<T>): Query<T>;
}
```

* Parameters:
  * `source` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; The source elements.
* Returns: <samp>[Query][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## Query.of(...elements)
Creates a Query for the provided elements.

```ts
export declare class Query<T> {
    public static of<T>(...elements: T[]): Query<T>;
}
```

* Parameters:
  * `...elements` <samp>T[]</samp> &mdash; The elements of the query.
* Returns: <samp>[Query][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## Query.empty()
Creates a Query with no elements.

```ts
export declare class Query<T> {
    public static empty<T>(): Query<T>;
}
```

* Returns: <samp>[Query][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## Query.once(value)
Creates a Query over a single element.

```ts
export declare class Query<T> {
    public static once<T>(value: T): Query<T>;
}
```

* Parameters:
  * `value` <samp>T</samp> &mdash; The only element for the query.
* Returns: <samp>[Query][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## Query.repeat(value, count)
Creates a Query for a value repeated a provided number of times.

```ts
export declare class Query<T> {
    public static repeat<T>(value: T, count: number): Query<T>;
}
```

* Parameters:
  * `value` <samp>T</samp> &mdash; The value for each element of the Query.
  * `count` <samp>[Number][]</samp> &mdash; The number of times to repeat the value.
* Returns: <samp>[Query][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## Query.range(start, end, increment?)
Creates a Query over a range of numbers.

```ts
export declare class Query<T> {
    public static range(start: number, end: number, increment?: number): Query<number>;
}
```

* Parameters:
  * `start` <samp>[Number][]</samp> &mdash; The starting number of the range.
  * `end` <samp>[Number][]</samp> &mdash; The ending number of the range.
  * `increment` <samp>[Number][]</samp> &mdash; An optional amount by which to change between each value.
* Returns: <samp>[Query][]&lt;[Number][]&gt;</samp>



## Query.continuous(value)
Creates a Query that repeats the provided value forever.

```ts
export declare class Query<T> {
    public static continuous<T>(value: T): Query<T>;
}
```

* Parameters:
  * `value` <samp>T</samp> &mdash; The value for each element of the Query.
* Returns: <samp>[Query][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## Query.generate(count, generator)
Creates a Query whose values are provided by a callback executed a provided number of
times.

```ts
export declare class Query<T> {
    public static generate<T>(count: number, generator: (offset: number) => T): Query<T>;
}
```

* Parameters:
  * `count` <samp>[Number][]</samp> &mdash; The number of times to execute the callback.
  * `generator` <samp>[Function][]</samp> &mdash; The callback to execute.
* Returns: <samp>[Query][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## Query.hierarchy(root, hierarchy)
Creates a [HierarchyQuery][] from a root node and a [HierarchyProvider][].

```ts
export declare class Query<T> {
    public static hierarchy<T>(root: T, hierarchy: HierarchyProvider<T>): HierarchyQuery<T>;
}
```

* Parameters:
  * `root` <samp>T</samp> &mdash; The root node of the hierarchy.
  * `hierarchy` <samp>[HierarchyProvider][]&lt;T&gt;</samp> &mdash; A HierarchyProvider.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## Query.consume(iterator)
Creates a Query that when iterated consumes the provided Iterator.

```ts
export declare class Query<T> {
    public static consume<T>(iterator: Iterator<T>): Query<T>;
}
```

* Parameters:
  * `iterator` <samp>[Iterator][]&lt;T&gt;</samp> &mdash; An Iterator.
* Returns: <samp>[Query][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## query.filter(predicate)
Creates a subquery whose elements match the supplied predicate.

```ts
export declare class Query<T> {
    public filter(predicate: (element: T, offset: number) => boolean): Query<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.where(predicate)
Creates a subquery whose elements match the supplied predicate.
This is an alias for [`filter`](#queryfilterpredicate).

```ts
export declare class Query<T> {
    public where(predicate: (element: T, offset: number) => boolean): Query<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.map(selector)
Creates a subquery by applying a callback to each element.

```ts
export declare class Query<T> {
    public map<U>(selector: (element: T, offset: number) => U): Query<U>;
}
```

* Parameters:
  * `selector` <samp>[Function][]</samp> &mdash; A callback used to map each element.
* Returns: <samp>[Query][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for each mapped element.



## query.select(selector)
Creates a subquery by applying a callback to each element.
This is an alias for [`map`](#querymapselector)

```ts
export declare class Query<T> {
    public select<U>(selector: (element: T, offset: number) => U): Query<U>;
}
```

* Parameters:
  * `selector` <samp>[Function][]</samp> &mdash; A callback used to map each element.
* Returns: <samp>[Query][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for each mapped element.



## query.flatMap(projection)
Creates a subquery that iterates the results of applying a callback to each element.

```ts
export declare class Query<T> {
    public flatMap<U>(projection: (element: T) => Iterable<U>): Query<U>;
}
```

* Parameters:
  * `projection` <samp>[Function][]</samp> &mdash; A callback used to map each element to a [Queryable][]&lt;U&gt;.
* Returns: <samp>[Query][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for each mapped element.



## query.selectMany(projection)
Creates a subquery that iterates the results of applying a callback to each element.
This is an alias for [`flatMap`](#queryflatmapprojection)

```ts
export declare class Query<T> {
    public selectMany<U>(projection: (element: T) => Iterable<U>): Query<U>;
}
```

* Parameters:
  * `projection` <samp>[Function][]</samp> &mdash; A callback used to map each element to a [Queryable][]&lt;U&gt;.
* Returns: <samp>[Query][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for each mapped element.



## query.reverse()
Creates a subquery whose elements are in the reverse order.

```ts
export declare class Query<T> {
    public reverse(): Query<T>;
}
```

* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.skip(count)
Creates a subquery containing all elements except the first elements up to the supplied
count.

```ts
export declare class Query<T> {
    public skip(count: number): Query<T>;
}
```

* Parameters:
  * `count` <samp>[Number][]</samp> &mdash; The number of elements to skip.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.skipRight(count)
Creates a subquery containing all elements except the last elements up to the supplied
count.

```ts
export declare class Query<T> {
    public skipRight(count: number): Query<T>;
}
```

* Parameters:
  * `count` <samp>[Number][]</samp> &mdash; The number of elements to skip.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.skipWhile(predicate)
Creates a subquery containing all elements except the first elements that match
the supplied predicate.

```ts
export declare class Query<T> {
    public skipWhile(predicate: (element: T) => boolean): Query<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.take(count)
Creates a subquery containing the first elements up to the supplied
count.

```ts
export declare class Query<T> {
    public take(count: number): Query<T>;
}
```

* Parameters:
  * `count` <samp>[Number][]</samp> &mdash; The number of elements to take.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.takeRight(count)
Creates a subquery containing the last elements up to the supplied
count.

```ts
export declare class Query<T> {
    public takeRight(count: number): Query<T>;
}
```

* Parameters:
  * `count` <samp>[Number][]</samp> &mdash; The number of elements to take.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.takeWhile(predicate)
Creates a subquery containing the first elements that match the supplied predicate.

```ts
export declare class Query<T> {
    public takeWhile(predicate: (element: T) => boolean): Query<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.intersect(other)
Creates a subquery for the set intersection of this Query and another Queryable.

```ts
export declare class Query<T> {
    public intersect(other: Queryable<T>): Query<T>;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; A Queryable value.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.union(other)
Creates a subquery for the set union of this Query and another Queryable.

```ts
export declare class Query<T> {
    public union(other: Queryable<T>): Query<T>;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; A Queryable value.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.except(other)
Creates a subquery for the set difference between this and another Queryable.

```ts
export declare class Query<T> {
    public except(other: Queryable<T>): Query<T>;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; A Queryable value.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.concat(other)
Creates a subquery that concatenates this Query with another Queryable.

```ts
export declare class Query<T> {
    public concat(other: Queryable<T>): Query<T>;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; A Queryable value.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.distinct()
Creates a subquery for the distinct elements of this Query.

```ts
export declare class Query<T> {
    public distinct(): Query<T>;
}
```

* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.append(value)
Creates a subquery for the elements of this Query with the provided value appended to the end.

```ts
export declare class Query<T> {
    public append(value: T): Query<T>;
}
```

* Parameters:
  * `value` <samp>T</samp> &mdash; The value to append.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.prepend(value)
Creates a subquery for the elements of this Query with the provided value prepended to the beginning.

```ts
export declare class Query<T> {
    public prepend(value: T): Query<T>;
}
```

* Parameters:
  * `value` <samp>T</samp> &mdash; The value to prepend.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.patch(start, skipCount, range)
Creates a subquery for the elements of this Query with the provided range
patched into the results.

```ts
export declare class Query<T> {
    public patch(start: number, skipCount: number, range: Queryable<T>): Query<T>;
}
```

* Parameters:
  * `start` <samp>[Number][]</samp> &mdash; The offset at which to patch the range.
  * `skipCount` <samp>[Number][]</samp> &mdash; The number of elements to skip from start.
  * `range` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; The range to patch into the result.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.defaultIfEmpty(defaultValue)
Creates a subquery that contains the provided default value if this Query
contains no elements.

```ts
export declare class Query<T> {
    public defaultIfEmpty(defaultValue: T): Query<T>;
}
```

* Parameters:
  * `defaultValue` <samp>T</samp> &mdash; The default value.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.pageBy(pageSize)
Creates a subquery that splits this Query into one or more pages.

> NOTE: While advancing from page to page is evaluated lazily, the elements of the page are
> evaluated eagerly.

```ts
export declare class Query<T> {
    public pageBy(pageSize: number): Query<Page<T>>;
}
```

* Parameters:
  * `pageSize` <samp>[Number][]</samp> &mdash; The number of elements per page.
* Returns: <samp>[Query][]&lt;[Page][]&lt;T&gt;&gt;</samp>



## query.zip(right)
Creates a subquery that combines this Query with another Queryable by combining elements
either in tuples.

```ts
export declare class Query<T> {
    public zip<U>(right: Queryable<U>): Query<[T, U]>;
}
```

* Parameters:
  * `right` <samp>[Queryable][]&lt;U&gt;</samp> &mdash; A Queryable.
* Returns: <samp>[Query][]&lt;\[T, U\]&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for elements from the other queryable.



## query.zip(right, selector)
Creates a subquery that combines this Query with another Queryable by combining elements
using the supplied callback.

```ts
export declare class Query<T> {
    public zip<U, R>(right: Queryable<U>, selector: (left: T, right: U) => R): Query<R>;
}
```

* Parameters:
  * `right` <samp>[Queryable][]&lt;U&gt;</samp> &mdash; A Queryable.
  * `selector` <samp>[Function][]</samp> &mdash; A callback used to combine two elements.
* Returns: <samp>[Query][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for elements from the other queryable.
    * <samp>R</samp> &mdash; The type for elements in the resulting sequence.



## query.orderBy(keySelector, comparison?)
Creates an ordered subquery whose elements are sorted in ascending order by the provided key.

```ts
export declare class Query<T> {
    public orderBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[OrderedQuery][]&lt;T&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.orderByDescending(keySelector, comparison?)
Creates an ordered subquery whose elements are sorted in descending order by the provided key.

```ts
export declare class Query<T> {
    public orderByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[OrderedQuery][]&lt;T&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.spanMap(keySelector)
Creates a subquery whose elements are the contiguous ranges of elements that share the same key.

```ts
export declare class Query<T> {
    public spanMap<K>(keySelector: (element: T) => K): Query<Grouping<K, T>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
* Returns: <samp>[Query][]&lt;[Grouping][]&lt;K, T&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.spanMap(keySelector, elementSelector)
Creates a subquery whose elements are the contiguous ranges of elements that share the same key.

```ts
export declare class Query<T> {
    public spanMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Query<Grouping<K, V>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback used to select a value for an element.
* Returns: <samp>[Query][]&lt;[Grouping][]&lt;K, V&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for each element in the group.



## query.spanMap(keySelector, elementSelector, resultSelector)
Creates a subquery whose elements are the contiguous ranges of elements that share the same key.

```ts
export declare class Query<T> {
    public spanMap<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R): Query<R>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback used to select a value for an element.
  * `resultSelector` <samp>[Function][]</samp> &mdash; A callback used to select a result from a contiguous range.
* Returns: <samp>[Query][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for each element in the group.
    * <samp>R</samp> &mdash; The type for each element in the result.



## query.groupBy(keySelector)
Groups each element by its key.

```ts
export declare class Query<T> {
    public groupBy<K>(keySelector: (element: T) => K): Query<Grouping<K, T>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
* Returns: <samp>[Query][]&lt;[Grouping][]&lt;K, T&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.groupBy(keySelector, elementSelector)
Groups each element by its key.

```ts
export declare class Query<T> {
    public groupBy<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Query<Grouping<K, V>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; An optional callback used to select a value for an element.
* Returns: <samp>[Query][]&lt;[Grouping][]&lt;K, V&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for each element in the group.



## query.groupBy(keySelector, elementSelector, resultSelector)
Groups each element by its key.

```ts
export declare class Query<T> {
    public groupBy<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R): Query<R>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; An optional callback used to select a value for an element.
  * `resultSelector` <samp>[Function][]</samp> &mdash; An optional callback used to select a result from a group.
* Returns: <samp>[Query][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for each element in the group.
    * <samp>R</samp> &mdash; The type for each element in the result.



## query.groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector)
Creates a grouped subquery for the correlated elements of this Query and another Queryable.

```ts
export declare class Query<T> {
    public groupJoin<I, K, R>(inner: Queryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: Query<I>) => R): Query<R>;
}
```

* Parameters:
  * `inner` <samp>[Queryable][]&lt;I&gt;</samp> &mdash; A Queryable.
  * `outerKeySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element in this Query.
  * `innerKeySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element in the other Queryable.
  * `resultSelector` <samp>[Function][]</samp> &mdash; A callback used to select the result for the correlated elements.
* Returns: <samp>[Query][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>I</samp> &mdash; The type for each element in `inner`.
    * <samp>K</samp> &mdash; The type for the key for each element of `q` or `inner`.
    * <samp>R</samp> &mdash; The type for each element in the result.



## query.join(inner, outerKeySelector, innerKeySelector, resultSelector)
Creates a subquery for the correlated elements of this Query and another Queryable.

```ts
export declare class Query<T> {
    public join<I, K, R>(inner: Queryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: I) => R): Query<R>;
}
```

* Parameters:
  * `inner` <samp>[Queryable][]&lt;I&gt;</samp> &mdash; A Queryable.
  * `outerKeySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element in this Query.
  * `innerKeySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element in the other Queryable.
  * `resultSelector` <samp>[Function][]</samp> &mdash; A callback used to select the result for the correlated elements.
* Returns: <samp>[Query][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>I</samp> &mdash; The type for each element in `inner`.
    * <samp>K</samp> &mdash; The type for the key for each element of `q` or `inner`.
    * <samp>R</samp> &mdash; The type for each element in the result.



## query.scan(accumulator)
Creates a subquery containing the cumulative results of applying the provided callback to each element.

```ts
export declare class Query<T> {
    public scan(accumulator: (current: T, element: T, offset: number) => T): Query<T>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.scan(accumulator, seed?)
Creates a subquery containing the cumulative results of applying the provided callback to each element.

```ts
export declare class Query<T> {
    public scan<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): Query<U>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; An optional seed value.
* Returns: <samp>[Query][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.



## query.scanRight(accumulator)
Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.

```ts
export declare class Query<T> {
    public scanRight(accumulator: (current: T, element: T, offset: number) => T): Query<T>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
* Returns: <samp>[Query][]&lt;T&gt;</samp>



## query.scanRight(accumulator, seed?)
Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.

```ts
export declare class Query<T> {
    public scanRight<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): Query<U>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; An optional seed value.
* Returns: <samp>[Query][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.



## query.reduce(accumulator)
Computes a scalar value by applying an accumulator callback over each element.

```ts
export declare class Query<T> {
    public reduce(aggregator: (aggregate: T, element: T, offset: number) => T): T;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
* Returns: <samp>T</samp>



## query.reduce(accumulator, seed?)
Computes a scalar value by applying an accumulator callback over each element.

```ts
export declare class Query<T> {
    public reduce<U>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U): U;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; An optional seed value.
* Returns: <samp>U</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.



## query.reduce(accumulator, seed, resultSelector)
Computes a scalar value by applying an accumulator callback over each element.

```ts
export declare class Query<T> {
    public reduce<U, R>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): R;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; A seed value.
  * `resultSelector` <samp>[Function][]</samp> &mdash; A callback used to compute the final result.
* Returns: <samp>R</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.
    * <samp>R</samp> &mdash; The type for the final result.



## query.reduceRight(accumulator)
Computes a scalar value by applying an accumulator callback over each element in reverse.

```ts
export declare class Query<T> {
    public reduceRight(aggregator: (aggregate: T, element: T, offset: number) => T): T;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
* Returns: <samp>T</samp>



## query.reduceRight(accumulator, seed?)
Computes a scalar value by applying an accumulator callback over each element in reverse.

```ts
export declare class Query<T> {
    public reduceRight<U>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U): U;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; An optional seed value.
* Returns: <samp>U</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.



## query.reduceRight(accumulator, seed, resultSelector)
Computes a scalar value by applying an accumulator callback over each element in reverse.

```ts
export declare class Query<T> {
    public reduceRight<U, R>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): R;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; A seed value.
  * `resultSelector` <samp>[Function][]</samp> &mdash; A callback used to compute the final result.
* Returns: <samp>R</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.
    * <samp>R</samp> &mdash; The type for the final result.



## query.count(predicate?)
Counts the number of elements in the Query, optionally filtering elements using the supplied
callback.

```ts
export declare class Query<T> {
    public count(predicate?: (element: T) => boolean): number;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; An optional callback used to match each element.
* Returns: <samp>[Number][]</samp>



## query.first(predicate?)
Gets the first element in the Query, optionally filtering elements using the supplied
callback.

```ts
export declare class Query<T> {
    public first(predicate?: (element: T) => boolean): T;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; An optional callback used to match each element.
* Returns: <samp>T</samp>



## query.last(predicate?)
Gets the last element in the Query, optionally filtering elements using the supplied
callback.

```ts
export declare class Query<T> {
    public last(predicate?: (element: T) => boolean): T;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; An optional callback used to match each element.
* Returns: <samp>T</samp>



## query.single()
Gets the only element in the Query, or returns undefined.

```ts
export declare class Query<T> {
    public single(): T;
}
```

* Returns: <samp>T</samp>



## query.min(comparison?)
Gets the minimum element in the query, optionally comparing elements using the supplied
callback.

```ts
export declare class Query<T> {
    public min(comparison?: (x: T, y: T) => number): T;
}
```

* Parameters:
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two elements.
* Returns: <samp>T</samp>



## query.max(comparison?)
Gets the maximum element in the query, optionally comparing elements using the supplied
callback.

```ts
export declare class Query<T> {
    public max(comparison?: (x: T, y: T) => number): T;
}
```

* Parameters:
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two elements.
* Returns: <samp>T</samp>



## query.some(predicate?)
Computes a scalar value indicating whether the Query contains any elements,
optionally filtering the elements using the supplied callback.

```ts
export declare class Query<T> {
    public some(predicate?: (element: T) => boolean): boolean;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; An optional callback used to match each element.
* Returns: <samp>[Boolean][]</samp>



## query.every(predicate)
Computes a scalar value indicating whether all elements of the Query
match the supplied callback.

```ts
export declare class Query<T> {
    public every(predicate: (element: T) => boolean): boolean;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>[Boolean][]</samp>



## query.corresponds(other)
Computes a scalar value indicating whether all elements of the Query
match the supplied callback.

```ts
export declare class Query<T> {
    public corresponds(other: Queryable<T>): boolean;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; A Queryable.
* Returns: <samp>[Boolean][]</samp>



## query.corresponds(other, equalityComparison?)
Computes a scalar value indicating whether all elements of the Query
match the supplied callback.

```ts
export declare class Query<T> {
    public corresponds<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;U&gt;</samp> &mdash; A Queryable.
  * `equalityComparison` <samp>[Function][]</samp> &mdash; A callback used to compare the equality of two elements.
* Returns: <samp>[Boolean][]</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type of each element in `other`.



## query.includes(value)
Computes a scalar value indicating whether the provided value is included in the query.

```ts
export declare class Query<T> {
    public includes(value: T): boolean;
}
```

* Parameters:
  * `value` <samp>T</samp> &mdash; A value.
* Returns: <samp>[Boolean][]</samp>



## query.includesSequence(other)
Computes a scalar value indicating whether the elements of this Query include
an exact sequence of elements from another Queryable.

```ts
export declare class Query<T> {
    public includesSequence(other: Queryable<T>): boolean;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; A Queryable.
* Returns: <samp>[Boolean][]</samp>



## query.includesSequence(other, equalityComparison)
Computes a scalar value indicating whether the elements of this Query include
an exact sequence of elements from another Queryable.

```ts
export declare class Query<T> {
    public includesSequence<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;U&gt;</samp> &mdash; A Queryable.
  * `equalityComparison` <samp>[Function][]</samp> &mdash; A callback used to compare the equality of two elements.
* Returns: <samp>[Boolean][]</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type of each element in `other`.



## query.startsWith(other)
Computes a scalar value indicating whether the elements of this Query start
with the same sequence of elements in another Queryable.

```ts
export declare class Query<T> {
    public startsWith(other: Queryable<T>): boolean;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; A Queryable.
* Returns: <samp>[Boolean][]</samp>



## query.startsWith(other, equalityComparison)
Computes a scalar value indicating whether the elements of this Query start
with the same sequence of elements in another Queryable.

```ts
export declare class Query<T> {
    public startsWith<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;U&gt;</samp> &mdash; A Queryable.
  * `equalityComparison` <samp>[Function][]</samp> &mdash; A callback used to compare the equality of two elements.
* Returns: <samp>[Boolean][]</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type of each element in `other`.



## query.endsWith(other)
Computes a scalar value indicating whether the elements of this Query end
with the same sequence of elements in another Queryable.

```ts
export declare class Query<T> {
    public endsWith(other: Queryable<T>): boolean;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; A Queryable.
* Returns: <samp>[Boolean][]</samp>



## query.endsWith(other, equalityComparison)
Computes a scalar value indicating whether the elements of this Query end
with the same sequence of elements in another Queryable.

```ts
export declare class Query<T> {
    public endsWith(other: Queryable<T>): boolean;
    public endsWith<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;
}
```

* Parameters:
  * `other` <samp>[Queryable][]&lt;U&gt;</samp> &mdash; A Queryable.
  * `equalityComparison` <samp>[Function][]</samp> &mdash; A callback used to compare the equality of two elements.
* Returns: <samp>[Boolean][]</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type of each element in `other`.



## query.elementAt(offset)
Finds the value in the Query at the provided offset. A negative offset starts from the
last element.

```ts
export declare class Query<T> {
    public elementAt(offset: number): T;
}
```

* Parameters:
  * `offset` <samp>[Number][]</samp> &mdash; The offset from the start of the sequence.
* Returns: <samp>T</samp>



## query.span(predicate)
Creates a tuple whose first element is a subquery containing the first span of
elements that match the supplied predicate, and whose second element is a subquery
containing the remaining elements.

> NOTE: The first subquery is eagerly evaluated, while the second subquery is lazily
> evaluated.

```ts
export declare class Query<T> {
    public span(predicate: (element: T) => boolean): [Query<T>, Query<T>];
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>\[[Query][]&lt;T&gt;, [Query][]&lt;T&gt;\]</samp>



## query.break(predicate)
Creates a tuple whose first element is a subquery containing the first span of
elements that do not match the supplied predicate, and whose second element is a subquery
containing the remaining elements.

> NOTE: The first subquery is eagerly evaluated, while the second subquery is lazily
> evaluated.

```ts
export declare class Query<T> {
    public break(predicate: (element: T) => boolean): [Query<T>, Query<T>];
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>\[[Query][]&lt;T&gt;, [Query][]&lt;T&gt;\]</samp>



## query.forEach(callback)
Invokes a callback for each element of the query.

```ts
export declare class Query<T> {
    public forEach(callback: (element: T, offset: number) => void): void;
}
```

* Parameters:
  * `callback` <samp>[Function][]</samp> &mdash; The callback to invoke.



## query.toHierarchy(hierarchy)
Creates a HierarchyQuery using the provided HierarchyProvider.

```ts
export declare class Query<T> {
    public toHierarchy(hierarchy: HierarchyProvider<T>): HierarchyQuery<T>;
}
```

* Parameters:
  * `hierarchy` <samp>[HierarchyProvider][]&lt;T&gt;</samp> &mdash; A [HierarchyProvider][]
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.toArray()
Creates an Array for the elements of the Query.

```ts
export declare class Query<T> {
    public toArray(): T[];
}
```

* Returns: <samp>T\[\]</samp>



## query.toArray(selector)
Creates an Array for the elements of the Query.

```ts
export declare class Query<T> {
    public toArray<V>(selector: (element: T) => V): V[];
}

```

* Parameters:
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback that selects a value for each element.
* Returns: <samp>V\[\]</samp>
* Type Parameters:
    * <samp>V</samp> &mdash; The type for each element in the resulting array.



## query.toSet()
Creates a [Set][] for the elements of the Query.

```ts
export declare class Query<T> {
    public toSet(): Set<T>;
}
```

* Returns: <samp>[Set][]&lt;T&gt;</samp>



## query.toSet(elementSelector)
Creates a [Set][] for the elements of the Query.

```ts
export declare class Query<T> {
    public toSet<V>(elementSelector: (element: T) => V): Set<V>;
}
```

* Parameters:
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback that selects a value for each element.
* Returns: <samp>[Set][]&lt;V&gt;</samp>
* Type Parameters:
    * <samp>V</samp> &mdash; The type for the value for each element.



## query.toMap(keySelector)
Creates a [Map][] for the elements of the Query.

```ts
export declare class Query<T> {
    public toMap<K>(keySelector: (element: T) => K): Map<K, T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
* Returns: <samp>[Map][]&lt;K, T&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.toMap(keySelector, elementSelector)
Creates a [Map][] for the elements of the Query.

```ts
export declare class Query<T> {
    public toMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Map<K, V>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback that selects a value for each element.
* Returns: <samp>[Map][]&lt;K, V&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for the value for each element.



## query.toLookup(keySelector)
Creates a [Lookup][] for the elements of the Query.

```ts
export declare class Query<T> {
    public toLookup<K>(keySelector: (element: T) => K): Lookup<K, T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
* Returns: <samp>[Lookup][]&lt;K, T&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.toLookup(keySelector, elementSelector)
Creates a [Lookup][] for the elements of the Query.

```ts
export declare class Query<T> {
    public toLookup<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Lookup<K, V>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback that selects a value for each element.
* Returns: <samp>[Lookup][]&lt;K, V&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for the value for each element.



## query.toObject(prototype, keySelector)
Creates an [Object][] for the elements of the Query.

```ts
export declare class Query<T> {
    public toObject(prototype: any, keySelector: (element: T) => string | symbol): any;
}
```

* Parameters:
  * `prototype` <samp>[Object][]</samp> &mdash; The prototype for the object.
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
* Returns: <samp>any</samp>



## query.toObject(prototype, keySelector, elementSelector)
Creates an [Object][] for the elements of the Query.

```ts
export declare class Query<T> {
    public toObject<V>(prototype: any, keySelector: (element: T) => string | symbol, elementSelector: (element: T) => V): any;
}
```

* Parameters:
  * `prototype` <samp>[Object][]</samp> &mdash; The prototype for the object.
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback that selects a value for each element.
* Returns: <samp>any</samp>
* Type Parameters:
    * <samp>V</samp> &mdash; The type for the value for each element.



## query\[Symbol.iterator\]()
Returns the default [Iterator][] for this object.

```ts
export declare class Query<T> {
    public [Symbol.iterator](): Iterator<T>;
}
```

* Returns: <samp>[Iterator][]&lt;T&gt;</samp>



# Class: OrderedQuery
Represents an ordered sequence of elements.

```ts
export declare class OrderedQuery<T> extends Query<T> {
    private constructor();
    ...
}
```

* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.

### Inheritance hierarchy
* [Query][Query]
    * OrderedQuery



## query.thenBy(keySelector, comparison?)
Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.

```ts
export declare class OrderedQuery<T> extends Query<T> {
    public thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[OrderedQuery][]&lt;T&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.thenByDescending(keySelector, comparison?)
Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.

```ts
export declare class OrderedQuery<T> extends Query<T> {
    public thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[OrderedQuery][]&lt;T&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



# Interface: HierarchyProvider
Describes an object that defines the relationships between parents and children of an element.

```ts
export interface HierarchyProvider<T> {
    parent(element: T): T;
    children(element: T): Queryable<T>;
}
```

* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## provider.parent(element)
Gets the parent element for the supplied element.

```ts
export interface HierarchyProvider<T> {
    parent(element: T): T;
}
```

* Parameters:
  * `element` <samp>T</samp> &mdash; The current element.
* Returns: <samp>T</samp> &mdash; The parent of `element` if present, or `undefined`.



## provider.children(element)
Gets the children elements for the supplied element.

```ts
export interface HierarchyProvider<T> {
    children(element: T): Queryable<T>;
}
```

* Parameters:
  * `element` <samp>T</samp> &mdash; The current element.
* Returns: <samp>[Queryable][]&lt;T&gt;</samp> &mdash; The children of `element` if present, or an empty sequence.



# Class: HierarchyQuery
Represents a sequence of hierarchically organized values.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    ...
}
```

* Type Parameters:
    * <samp>T</samp> &mdash; The type for each element.

### Inheritance hierarchy
* [Query][Query]
  * HierarchyQuery



## new HierarchyQuery(source, hierarchy)
Creates a HierarchyQuery from a [Queryable][] source and a [HierarchyProvider][]

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    constructor(source: Queryable<T>, hierarchy: HierarchyProvider<T>);
}
```

* Parameters:
  * `source` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; The source elements.
  * `hierarchy` <samp>[HierarchyProvider][]&lt;T&gt;</samp> &mdash; The hierarchy provider.
* Type Parameters:
    * <samp>T</samp> &mdash; The type for each element.



## query.hierarchy
Gets the [HierarchyProvider][] for the query.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    public readonly hierarchy: HierarchyProvider<T>;
}
```

* Returns: <samp>[HierarchyProvider][]&lt;T&gt;</samp>



## query.root(predicate?)
Creates a subquery for the roots of each element in the hierarchy.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    root(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.ancestors(predicate?)
Creates a subquery for the ancestors of each element in the hierarchy.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    ancestors(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.ancestorsAndSelf(predicate?)
Creates a subquery for the ancestors of each element as well as each element in the hierarchy.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    ancestorsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.parents(predicate?)
Creates a subquery for the parents of each element in the hierarchy.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    parents(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.self(predicate?)
Creates a subquery for this query.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    self(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.siblings(predicate?)
Creates a subquery for the siblings of each element in the hierarchy.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    siblings(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.siblingsAndSelf(predicate?)
Creates a subquery for the siblings of each element as well as each element in the hierarchy.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    siblingsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.siblingsBeforeSelf(predicate?)
Creates a subquery for the siblings before each element in the hierarchy.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    siblingsBeforeSelf(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.siblingsAfterSelf(predicate?)
Creates a subquery for the siblings after each element in the hierarchy.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    siblingsAfterSelf(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.children(predicate?)
Creates a subquery for the children of each element in the hierarchy.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    children(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.nthChild(offset)
Creates a subquery for the child of each element at the specified offset. A negative offset
starts from the last child.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    nthChild(offset: number): HierarchyQuery<T>;
}
```

* Parameters:
  * `offset` <samp>[Number][]</samp> &mdash; The offset for the child.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.descendants(predicate?)
Creates a subquery for the descendants of each element in the hierarchy.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    descendants(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



## query.descendantsAndSelf(predicate?)
Creates a subquery for the descendants of each element as well as each element in the hierarchy.

```ts
export declare class HierarchyQuery<T> extends Query<T> {
    descendantsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to filter the results.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>



# Class: OrderedHierarchyQuery
Represents an ordered sequence of hierarchically organized values.

### Inheritance hierarchy
* [Query][Query]
  * [HierarchyQuery][HierarchyQuery]
    * OrderedHierarchyQuery

```ts
export declare class OrderedHierarchyQuery<T> extends HierarchyQuery<T> {
    private constructor();
    ...
}
```



## query.thenBy(keySelector, comparison?)
Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.

```ts
export declare class OrderedHierarchyQuery<T> extends HierarchyQuery<T> {
    public thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[OrderedQuery][]&lt;T&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.thenByDescending(keySelector, comparison?)
Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.

```ts
export declare class OrderedHierarchyQuery<T> extends HierarchyQuery<T> {
    public thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[OrderedQuery][]&lt;T&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



# Class: Grouping
A group of values related by the same key.

```ts
export declare class Grouping<K, V> extends Query<V> {
    ...
}
```

* Type Parameters:
    * <samp>K</samp> &mdash; The type for the group's key.
    * <samp>V</samp> &mdash; The type for each element in the group.

### Inheritance hierarchy
* [Query][Query]
  * Grouping



## new Grouping(key, items)
Creates a new [Grouping][] for the specified key.

```ts
export declare class Grouping<K, V> extends Query<V> {
    constructor(key: K, items: Queryable<V>);
}
```

* Parameters:
  * `key` <samp>K</samp> &mdash; The key for the group.
  * `items` <samp>[Queryable][]&lt;V&gt;</samp> &mdash; The elements in the group.
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the group's key.
    * <samp>V</samp> &mdash; The type for each element in the group.



## group.key
Gets the key for the group.

```ts
export declare class Grouping<K, V> extends Query<V> {
    public readonly key: K;
}
```

* Returns: <samp>K</samp>



# Class: Lookup
Represents a collection of [Groupings][Grouping] organized by their keys.

```ts
export declare class Lookup<K, V> extends Query<Grouping<K, V>> {
    ...
}
```

* Type Parameters:
    * <samp>K</samp> &mdash; The type for the group's key.
    * <samp>V</samp> &mdash; The type for each element in the group.

### Inheritance hierarchy
* [Query][Query]
  * Lookup



## new Lookup(entries)
Creates a new [Lookup][] for the provided groups.

```ts
export declare class Lookup<K, V> extends Query<Grouping<K, V>> {
    constructor(entries: Map<K, Queryable<V>>);
}
```

* Parameters:
  * `entries` <samp>[Map][]&lt;K, [Queryable][]&lt;V&gt;</samp> &mdash; A map containing the unique groups of values.
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the group's key.
    * <samp>V</samp> &mdash; The type for each element in the group.



## lookup.size
Gets the number of unique keys.

```ts
export declare class Lookup<K, V> extends Query<Grouping<K, V>> {
    public readonly size: number;
}
```

* Returns: <samp>[Number][]</samp>



## lookup.has(key)
Gets a value indicating whether any group has the provided key.

```ts
export declare class Lookup<K, V> extends Query<Grouping<K, V>> {
    public has(key: K): boolean;
}
```

* Parameters:
  * `key` <samp>K</samp> &mdash; A key.
* Returns: <samp>[Boolean][]</samp>



## lookup.get(key)
Gets the group for the provided key.

```ts
export declare class Lookup<K, V> extends Query<Grouping<K, V>> {
    public get(key: K): Query<V>;
}
```

* Parameters:
  * `key` <samp>K</samp> &mdash; A key.
* Returns: <samp>[Query][]&lt;V&gt;</samp>



## lookup.applyResultSelector(selector)
Creates a Query that maps each group in the Lookup.

```ts
export declare class Lookup<K, V> extends Query<Grouping<K, V>> {
    public applyResultSelector<R>(selector: (key: K, elements: Query<V>) => R): Query<R>;
}
```

* Parameters:
  * `selector` <samp>[Function][]</samp> &mdash; A callback used to select results for each group.
* Returns: <samp>[Query][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>R</samp> &mdash; The type for each element in the result.



# Class: Page
Represents a page of results.

```ts
export declare class Page<T> extends Query<T> {
    ...
}
```

* Type Parameters:
    * <samp>T</samp> &mdash; The type for each element in the page.

### Inheritance hierarchy
* [Query][Query]
  * Page



## new Page(page, offset, items)
Creates a new [Page][] for the provided elements.

```ts
export declare class Page<T> extends Query<T> {
    constructor(page: number, offset: number, items: Queryable<T>);
}
```

* Parameters:
  * `page` <samp>[Number][]</samp> &mdash; The page number (zero-based).
  * `offset` <samp>[Number][]</samp> &mdash; The offset in the source at which the page begins (zero-based).
  * `items` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; The elements in the page.
* Type Parameters:
    * <samp>T</samp> &mdash; The type for each element in the page.



## page.page
Gets the page number (zero-based).

```ts
export declare class Page<T> extends Query<T> {
    public readonly page: number;
}
```

* Returns: <samp>[Number][]</samp>



## page.offset
Gets the offset in the source at which the page begins (zero-based).

```ts
export declare class Page<T> extends Query<T> {
    public readonly offset: number;
}
```

* Returns: <samp>[Number][]</samp>



## from(source)
Creates a Query from a [Queryable][] source.
> NOTE: This is an alias for [Query.from](#queryfromsource).

```ts
export declare function from<T>(source: Queryable<T>): Query<T>;
```

* Parameters:
  * `source` <samp>[Queryable][]&lt;T&gt;</samp> &mdash; The source elements.
* Returns: <samp>[Query][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## repeat(value, count)
Creates a Query for a value repeated a provided number of times.
> NOTE: This is an alias for [Query.repeat](#queryrepeatvalue-count).

```ts
export declare function repeat<T>(value: T, count: number): Query<T>;
```

* Parameters:
  * `value` <samp>T</samp> &mdash; The value for each element of the Query.
  * `count` <samp>[Number][]</samp> &mdash; The number of times to repeat the value.
* Returns: <samp>[Query][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## range(start, end, increment?)
Creates a Query over a range of numbers.
> NOTE: This is an alias for [Query.range](#queryrangestart-end-increment).

```ts
export declare function range(start: number, end: number, increment?: number): Query<number>;
```

* Parameters:
  * `start` <samp>[Number][]</samp> &mdash; The starting number of the range.
  * `end` <samp>[Number][]</samp> &mdash; The ending number of the range.
  * `increment` <samp>[Number][]</samp> &mdash; An optional amount by which to change between each value.
* Returns: <samp>[Query][]&lt;[Number][]&gt;</samp>



## hierarchy(root, hierarchy)
Creates a [HierarchyQuery][] from a root node and a [HierarchyProvider][].
> NOTE: This is an alias for [Query.hierarchy](#queryhierarchyroot-hierarchy).

```ts
export declare function hierarchy<T>(root: T, hierarchy: HierarchyProvider<T>): HierarchyQuery<T>;
```

* Parameters:
  * `root` <samp>T</samp> &mdash; The root node of the hierarchy.
  * `hierarchy` <samp>[HierarchyProvider][]&lt;T&gt;</samp> &mdash; A HierarchyProvider.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.


[Queryable]: #type-queryable
[Query]: #class-query
[OrderedQuery]: #class-orderedquery
[HierarchyProvider]: #interface-hierarchyprovider
[HierarchyQuery]: #class-hierarchyquery
[OrderedHierarchyQuery]: #class-orderedhierarchyquery
[Grouping]: #class-grouping
[Lookup]: #class-lookup
[Page]: #class-page
[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator
[Iterator]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator
[Number]: http://ecma-international.org/ecma-262/6.0/index.html#sec-number-constructor
[Boolean]: http://ecma-international.org/ecma-262/6.0/index.html#sec-boolean-constructor
[Object]: http://ecma-international.org/ecma-262/6.0/index.html#sec-object-constructor
[Function]: http://ecma-international.org/ecma-262/6.0/index.html#sec-function-constructor
[Error]: http://ecma-international.org/ecma-262/6.0/index.html#sec-error-constructor
[Map]: http://ecma-international.org/ecma-262/6.0/index.html#sec-map-constructor
[Set]: http://ecma-international.org/ecma-262/6.0/index.html#sec-set-constructor