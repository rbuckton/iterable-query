[Back to Index](index.md)

### In This Section

* [Class: AsyncQuery](#class-asyncquery)
    * [new AsyncQuery(source)](#new-asyncquerysource)
    * [AsyncQuery.from(source)](#asyncqueryfromsource)
    * [AsyncQuery.of(...elements)](#asyncqueryofelements)
    * [AsyncQuery.empty()](#asyncqueryempty)
    * [AsyncQuery.once(value)](#asyncqueryoncevalue)
    * [AsyncQuery.repeat(value, count)](#asyncqueryrepeatvalue-count)
    * [AsyncQuery.range(start, end, increment?)](#asyncqueryrangestart-end-increment)
    * [AsyncQuery.continuous(value)](#asyncquerycontinuousvalue)
    * [AsyncQuery.generate(count, generator)](#asyncquerygeneratecount-generator)
    * [AsyncQuery.hierarchy(root, hierarchy)](#asyncqueryhierarchyroot-hierarchy)
    * [AsyncQuery.consume(iterator)](#asyncqueryconsumeiterator)
    * [query.filter(predicate)](#queryfilterpredicate)
    * [query.where(predicate)](#queryfilterpredicate)
    * [query.map(selector)](#querymapselector)
    * [query.select(selector)](#querymapselector)
    * [query.flatMap(projection)](#queryflatmapprojection)
    * [query.selectMany(projection)](#queryflatmapprojection)
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



# Class: AsyncQuery
An AsyncQuery represents a series of operations that act upon an [AsyncIterable][], [Iterable][] or array-like. Evaluation of
these operations is deferred until the either a scalar value is requested from the AsyncQuery or the
AsyncQuery is iterated.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    ...
}
```

* Type Parameters:
  * <a name="asyncquery-t"></a><samp>T</samp> &mdash; The type for each element.



## new AsyncQuery(source)
Creates an AsyncQuery from an [AsyncQueryable][] source.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    constructor(source: AsyncQueryable<T>);
}
```

* Parameters:
  * `source` <samp>[AsyncQueryable][]&lt;[T][]&gt;</samp> &mdash; The source elements.



## AsyncQuery.from(source)
Creates an AsyncQuery from an [AsyncQueryable][] source.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    static from<T>(source: AsyncQueryable<T>): AsyncQuery<T>;
}
```

* Parameters:
  * `source` <samp>[AsyncQueryable][]&lt;T&gt;</samp> &mdash; The source elements.
* Returns: <samp>[AsyncQuery][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## AsyncQuery.of(...elements)
Creates an AsyncQuery for the provided elements.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    static of<T>(...elements: (PromiseLike<T> | T)[]): AsyncQuery<T>;
}
```

* Parameters:
  * `...elements` <samp>(PromiseLike<T> | T)[]</samp> &mdash; The elements of the Asyncquery.
* Returns: <samp>[AsyncQuery][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## AsyncQuery.empty()
Creates an AsyncQuery with no elements.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    static empty<T>(): AsyncQuery<T>;
}
```

* Returns: <samp>[AsyncQuery][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## AsyncQuery.once(value)
Creates an AsyncQuery over a single element.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    static once<T>(value: PromiseLike<T> | T): AsyncQuery<T>;
}
```

* Parameters:
  * `value` <samp>PromiseLike<T> | T</samp> &mdash; The only element for the query.
* Returns: <samp>[AsyncQuery][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## AsyncQuery.repeat(value, count)
Creates an AsyncQuery for a value repeated a provided number of times.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    static repeat<T>(value: PromiseLike<T> | T, count: number): AsyncQuery<T>;
}
```

* Parameters:
  * `value` <samp>PromiseLike<T> | T</samp> &mdash; The value for each element of the AsyncQuery.
  * `count` <samp>[Number][]</samp> &mdash; The number of times to repeat the value.
* Returns: <samp>[AsyncQuery][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## AsyncQuery.continuous(value)
Creates an AsyncQuery that repeats the provided value forever.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    static continuous<T>(value: PromiseLike<T> | T): AsyncQuery<T>;
}
```

* Parameters:
  * `value` <samp>PromiseLike<T> | T</samp> &mdash; The value for each element of the AsyncQuery.
* Returns: <samp>[AsyncQuery][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## AsyncQuery.generate(count, generator)
Creates an AsyncQuery whose values are provided by a callback executed a provided number of
times.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    static generate<T>(count: number, generator: (offset: number) => PromiseLike<T> | T): AsyncQuery<T>;
}
```

* Parameters:
  * `count` <samp>[Number][]</samp> &mdash; The number of times to execute the callback.
  * `generator` <samp>[Function][]</samp> &mdash; The callback to execute.
* Returns: <samp>[AsyncQuery][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## AsyncQuery.hierarchy(root, hierarchy)
Creates an [AsyncHierarchyQuery][] from a root node and a [HierarchyProvider][].

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    static hierarchy<T>(root: PromiseLike<T> | T, hierarchy: HierarchyProvider<T>): HierarchyQuery<T>;
}
```

* Parameters:
  * `root` <samp>PromiseLike<T> | T</samp> &mdash; The root node of the hierarchy.
  * `hierarchy` <samp>[HierarchyProvider][]&lt;T&gt;</samp> &mdash; A HierarchyProvider.
* Returns: <samp>[HierarchyQuery][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.



## AsyncQuery.consume(iterator)
Creates an AsyncQuery that when iterated consumes the provided Iterator.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    static consume<T>(iterator: AsyncIterator<T>): AsyncQuery<T>;
}
```

* Parameters:
  * `iterator` <samp>[AsyncIterator][]&lt;T&gt;</samp> &mdash; An Iterator.
* Returns: <samp>[AsyncQuery][]&lt;T&gt;</samp>
* Type Parameters:
  * <samp>T</samp> &mdash; The type for each element.


## query.filter(predicate)
Creates a subquery whose elements match the supplied predicate.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    filter(predicate: (element: T, offset: number) => boolean): AsyncQuery<T>;
    where(predicate: (element: T, offset: number) => boolean): AsyncQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.map(selector)
Creates a subquery by applying a callback to each element.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    map<U>(selector: (element: T, offset: number) => U): Query<U>;
    select<U>(selector: (element: T, offset: number) => U): Query<U>;
}
```

* Parameters:
  * `selector` <samp>[Function][]</samp> &mdash; A callback used to map each element.
* Returns: <samp>[AsyncQuery][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for each mapped element.



## query.flatMap(projection)
Creates a subquery that iterates the results of applying a callback to each element.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    flatMap<U>(projection: (element: T) => Iterable<U>): Query<U>;
    selectMany<U>(projection: (element: T) => Iterable<U>): Query<U>;
}
```

* Parameters:
  * `projection` <samp>[Function][]</samp> &mdash; A callback used to map each element to an [AsyncQueryable][]&lt;U&gt;.
* Returns: <samp>[AsyncQuery][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for each mapped element.



## query.reverse()
Creates a subquery whose elements are in the reverse order.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    reverse(): AsyncQuery<T>;
}
```

* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.skip(count)
Creates a subquery containing all elements except the first elements up to the supplied
count.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    skip(count: number): AsyncQuery<T>;
}
```

* Parameters:
  * `count` <samp>[Number][]</samp> &mdash; The number of elements to skip.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.skipRight(count)
Creates a subquery containing all elements except the last elements up to the supplied
count.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    skipRight(count: number): AsyncQuery<T>;
}
```

* Parameters:
  * `count` <samp>[Number][]</samp> &mdash; The number of elements to skip.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.skipWhile(predicate)
Creates a subquery containing all elements except the first elements that match
the supplied predicate.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    skipWhile(predicate: (element: T) => boolean): AsyncQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.take(count)
Creates a subquery containing the first elements up to the supplied
count.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    take(count: number): AsyncQuery<T>;
}
```

* Parameters:
  * `count` <samp>[Number][]</samp> &mdash; The number of elements to take.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.takeRight(count)
Creates a subquery containing the last elements up to the supplied
count.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    takeRight(count: number): AsyncQuery<T>;
}
```

* Parameters:
  * `count` <samp>[Number][]</samp> &mdash; The number of elements to take.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.takeWhile(predicate)
Creates a subquery containing the first elements that match the supplied predicate.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    takeWhile(predicate: (element: T) => boolean): AsyncQuery<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.intersect(other)
Creates a subquery for the set intersection of this Query and another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    intersect(other: AsyncQueryable<T>): AsyncQuery<T>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;[T][]&gt;</samp> &mdash; A Queryable value.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.union(other)
Creates a subquery for the set union of this Query and another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    union(other: AsyncQueryable<T>): AsyncQuery<T>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;[T][]&gt;</samp> &mdash; A Queryable value.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.except(other)
Creates a subquery for the set difference between this and another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    except(other: AsyncQueryable<T>): AsyncQuery<T>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;[T][]&gt;</samp> &mdash; A Queryable value.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.concat(other)
Creates a subquery that concatenates this Query with another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    concat(other: AsyncQueryable<T>): AsyncQuery<T>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;[T][]&gt;</samp> &mdash; A Queryable value.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.distinct()
Creates a subquery for the distinct elements of this Query.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    distinct(): AsyncQuery<T>;
}
```

* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.append(value)
Creates a subquery for the elements of this Query with the provided value appended to the end.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    append(value: PromiseLike<T> | T): AsyncQuery<T>;
}
```

* Parameters:
  * `value` <samp>PromiseLike<T> | T</samp> &mdash; The value to append.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.prepend(value)
Creates a subquery for the elements of this Query with the provided value prepended to the beginning.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    prepend(value: PromiseLike<T> | T): AsyncQuery<T>;
}
```

* Parameters:
  * `value` <samp>PromiseLike<T> | T</samp> &mdash; The value to prepend.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.patch(start, skipCount, range)
Creates a subquery for the elements of this Query with the provided range
patched into the results.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    patch(start: number, skipCount: number, range: AsyncQueryable<T>): AsyncQuery<T>;
}
```

* Parameters:
  * `start` <samp>[Number][]</samp> &mdash; The offset at which to patch the range.
  * `skipCount` <samp>[Number][]</samp> &mdash; The number of elements to skip from start.
  * `range` <samp>[AsyncQueryable][]&lt;[T][]&gt;</samp> &mdash; The range to patch into the result.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.defaultIfEmpty(defaultValue)
Creates a subquery that contains the provided default value if this Query
contains no elements.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    defaultIfEmpty(defaultValue: PromiseLike<T> | T): AsyncQuery<T>;
}
```

* Parameters:
  * `defaultValue` <samp>PromiseLike<T> | T</samp> &mdash; The default value.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.pageBy(pageSize)
Creates a subquery that splits this Query into one or more pages.

> NOTE: While advancing from page to page is evaluated lazily, the elements of the page are
> evaluated eagerly.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    pageBy(pageSize: number): AsyncQuery<Page<T>>;
}
```

* Parameters:
  * `pageSize` <samp>[Number][]</samp> &mdash; The number of elements per page.
* Returns: <samp>[AsyncQuery][]&lt;[Page][]&lt;[T][]&gt;&gt;</samp>



## query.zip(right)
Creates a subquery that combines this Query with another Queryable by combining elements
either in tuples.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    zip<U>(right: AsyncQueryable<U>): AsyncQuery<[T, U]>;
}
```

* Parameters:
  * `right` <samp>[AsyncQueryable][]&lt;U&gt;</samp> &mdash; A Queryable.
* Returns: <samp>[AsyncQuery][]&lt;\[[T][], U\]&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for elements from the other queryable.



## query.zip(right, selector)
Creates a subquery that combines this Query with another Queryable by combining elements
using the supplied callback.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    zip<U, R>(right: AsyncQueryable<U>, selector: (left: T, right: U) => R): AsyncQuery<R>;
}
```

* Parameters:
  * `right` <samp>[AsyncQueryable][]&lt;U&gt;</samp> &mdash; A Queryable.
  * `selector` <samp>[Function][]</samp> &mdash; A callback used to combine two elements.
* Returns: <samp>[AsyncQuery][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for elements from the other queryable.
    * <samp>R</samp> &mdash; The type for elements in the resulting sequence.



## query.orderBy(keySelector, comparison?)
Creates an ordered subquery whose elements are sorted in ascending order by the provided key.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    orderBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedQuery<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[AsyncOrderedQuery][]&lt;[T][]&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.orderByDescending(keySelector, comparison?)
Creates an ordered subquery whose elements are sorted in descending order by the provided key.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    orderByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedQuery<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two keys.
* Returns: <samp>[AsyncOrderedQuery][]&lt;[T][]&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.spanMap(keySelector)
Creates a subquery whose elements are the contiguous ranges of elements that share the same key.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    spanMap<K>(keySelector: (element: T) => K): AsyncQuery<Grouping<K, T>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
* Returns: <samp>[AsyncQuery][]&lt;[Grouping][]&lt;K, [T][]&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.spanMap(keySelector, elementSelector)
Creates a subquery whose elements are the contiguous ranges of elements that share the same key.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    spanMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): AsyncQuery<Grouping<K, V>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback used to select a value for an element.
* Returns: <samp>[AsyncQuery][]&lt;[Grouping][]&lt;K, V&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for each element in the group.



## query.spanMap(keySelector, elementSelector, resultSelector)
Creates a subquery whose elements are the contiguous ranges of elements that share the same key.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    spanMap<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R): AsyncQuery<R>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback used to select a value for an element.
  * `resultSelector` <samp>[Function][]</samp> &mdash; A callback used to select a result from a contiguous range.
* Returns: <samp>[AsyncQuery][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for each element in the group.
    * <samp>R</samp> &mdash; The type for each element in the result.



## query.groupBy(keySelector)
Groups each element by its key.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    groupBy<K>(keySelector: (element: T) => K): AsyncQuery<Grouping<K, T>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
* Returns: <samp>[AsyncQuery][]&lt;[Grouping][]&lt;K, [T][]&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.groupBy(keySelector, elementSelector)
Groups each element by its key.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    groupBy<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): AsyncQuery<Grouping<K, V>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; An optional callback used to select a value for an element.
* Returns: <samp>[AsyncQuery][]&lt;[Grouping][]&lt;K, V&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for each element in the group.



## query.groupBy(keySelector, elementSelector, resultSelector)
Groups each element by its key.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    groupBy<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R): AsyncQuery<R>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; An optional callback used to select a value for an element.
  * `resultSelector` <samp>[Function][]</samp> &mdash; An optional callback used to select a result from a group.
* Returns: <samp>[AsyncQuery][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for each element in the group.
    * <samp>R</samp> &mdash; The type for each element in the result.



## query.groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector)
Creates a grouped subquery for the correlated elements of this Query and another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    groupJoin<I, K, R>(inner: AsyncQueryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: Query<I>) => R): AsyncQuery<R>;
}
```

* Parameters:
  * `inner` <samp>[AsyncQueryable][]&lt;I&gt;</samp> &mdash; An AsyncQueryable.
  * `outerKeySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element in this AsyncQuery.
  * `innerKeySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element in the other AsyncQueryable.
  * `resultSelector` <samp>[Function][]</samp> &mdash; A callback used to select the result for the correlated elements.
* Returns: <samp>[AsyncQuery][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>I</samp> &mdash; The type for each element in `inner`.
    * <samp>K</samp> &mdash; The type for the key for each element of `q` or `inner`.
    * <samp>R</samp> &mdash; The type for each element in the result.



## query.join(inner, outerKeySelector, innerKeySelector, resultSelector)
Creates a subquery for the correlated elements of this Query and another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    join<I, K, R>(inner: AsyncQueryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: I) => R): AsyncQuery<R>;
}
```

* Parameters:
  * `inner` <samp>[AsyncQueryable][]&lt;I&gt;</samp> &mdash; An AsyncQueryable.
  * `outerKeySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element in this AsyncQuery.
  * `innerKeySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element in the other AsyncQueryable.
  * `resultSelector` <samp>[Function][]</samp> &mdash; A callback used to select the result for the correlated elements.
* Returns: <samp>[AsyncQuery][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>I</samp> &mdash; The type for each element in `inner`.
    * <samp>K</samp> &mdash; The type for the key for each element of `q` or `inner`.
    * <samp>R</samp> &mdash; The type for each element in the result.



## query.scan(accumulator)
Creates a subquery containing the cumulative results of applying the provided callback to each element.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    scan(accumulator: (current: T, element: T, offset: number) => T): AsyncQuery<T>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.scan(accumulator, seed?)
Creates a subquery containing the cumulative results of applying the provided callback to each element.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    scan<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): AsyncQuery<U>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; An optional seed value.
* Returns: <samp>[AsyncQuery][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.



## query.scanRight(accumulator)
Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    scanRight(accumulator: (current: T, element: T, offset: number) => T): AsyncQuery<T>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
* Returns: <samp>[AsyncQuery][]&lt;[T][]&gt;</samp>



## query.scanRight(accumulator, seed?)
Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    scanRight<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): AsyncQuery<U>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; An optional seed value.
* Returns: <samp>[AsyncQuery][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.



## query.reduce(accumulator)
Computes a scalar value by applying an accumulator callback over each element.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    reduce(aggregator: (aggregate: T, element: T, offset: number) => T): Promise<T>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
* Returns: <samp>[Promise][]&lt;[T][]&gt;</samp>



## query.reduce(accumulator, seed?)
Computes a scalar value by applying an accumulator callback over each element.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    reduce<U>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U): Promise<U>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; An optional seed value.
* Returns: <samp>[Promise][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.



## query.reduce(accumulator, seed, resultSelector)
Computes a scalar value by applying an accumulator callback over each element.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    reduce<U, R>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): Promise<R>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; A seed value.
  * `resultSelector` <samp>[Function][]</samp> &mdash; A callback used to compute the final result.
* Returns: <samp>[Promise][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.
    * <samp>R</samp> &mdash; The type for the final result.



## query.reduceRight(accumulator)
Computes a scalar value by applying an accumulator callback over each element in reverse.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    reduceRight(aggregator: (aggregate: T, element: T, offset: number) => T): Promise<T>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
* Returns: <samp>[Promise][]&lt;[T][]&gt;</samp>



## query.reduceRight(accumulator, seed?)
Computes a scalar value by applying an accumulator callback over each element in reverse.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    reduceRight<U>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U): Promise<U>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; An optional seed value.
* Returns: <samp>[Promise][]&lt;U&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.



## query.reduceRight(accumulator, seed, resultSelector)
Computes a scalar value by applying an accumulator callback over each element in reverse.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    reduceRight<U, R>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): Promise<R>;
}
```

* Parameters:
  * `accumulator` <samp>[Function][]</samp> &mdash; The callback used to compute each result.
  * `seed` <samp>U</samp> &mdash; A seed value.
  * `resultSelector` <samp>[Function][]</samp> &mdash; A callback used to compute the final result.
* Returns: <samp>[Promise][]&lt;R&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type for the result of each evaluation of `accumulator`.
    * <samp>R</samp> &mdash; The type for the final result.



## query.count(predicate?)
Counts the number of elements in the Query, optionally filtering elements using the supplied
callback.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    count(predicate?: (element: T) => boolean): Promise<number>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; An optional callback used to match each element.
* Returns: <samp>[Promise][]&lt;[Number][]&gt;</samp>



## query.first(predicate?)
Gets the first element in the Query, optionally filtering elements using the supplied
callback.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    first(predicate?: (element: T) => boolean): Promise<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; An optional callback used to match each element.
* Returns: <samp>[Promise][]&lt;[T][]&gt;</samp>



## query.last(predicate?)
Gets the last element in the Query, optionally filtering elements using the supplied
callback.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    last(predicate?: (element: T) => boolean): Promise<T>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; An optional callback used to match each element.
* Returns: <samp>[Promise][]&lt;[T][]&gt;</samp>



## query.single()
Gets the only element in the Query, or returns undefined.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    single(): Promise<T>;
}
```

* Returns: <samp>[Promise][]&lt;[T][]&gt;</samp>



## query.min(comparison?)
Gets the minimum element in the query, optionally comparing elements using the supplied
callback.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    min(comparison?: (x: T, y: T) => number): Promise<T>;
}
```

* Parameters:
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two elements.
* Returns: <samp>[Promise][]&lt;[T][]&gt;</samp>



## query.max(comparison?)
Gets the maximum element in the query, optionally comparing elements using the supplied
callback.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    max(comparison?: (x: T, y: T) => number): Promise<T>;
}
```

* Parameters:
  * `comparison` <samp>[Function][]</samp> &mdash; An optional callback used to compare two elements.
* Returns: <samp>[Promise][]&lt;[T][]&gt;</samp>



## query.some(predicate?)
Computes a scalar value indicating whether the Query contains any elements,
optionally filtering the elements using the supplied callback.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    some(predicate?: (element: T) => boolean): Promise<boolean>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; An optional callback used to match each element.
* Returns: <samp>[Promise][]&lt;[Boolean][]&gt;</samp>



## query.every(predicate)
Computes a scalar value indicating whether all elements of the Query
match the supplied callback.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    every(predicate: (element: T) => boolean): Promise<boolean>;
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>[Promise][]&lt;[Boolean][]&gt;</samp>



## query.corresponds(other)
Computes a scalar value indicating whether all elements of the Query
match the supplied callback.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    corresponds(other: AsyncQueryable<T>): Promise<boolean>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;[T][]&gt;</samp> &mdash; A Queryable.
* Returns: <samp>[Promise][]&lt;[Boolean][]&gt;</samp>



## query.corresponds(other, equalityComparison?)
Computes a scalar value indicating whether all elements of the Query
match the supplied callback.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    corresponds<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;U&gt;</samp> &mdash; A Queryable.
  * `equalityComparison` <samp>[Function][]</samp> &mdash; A callback used to compare the equality of two elements.
* Returns: <samp>[Promise][]&lt;[Boolean][]&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type of each element in `other`.



## query.includes(value)
Computes a scalar value indicating whether the provided value is included in the query.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    includes(value: T): Promise<boolean>;
}
```

* Parameters:
  * `value` <samp>T</samp> &mdash; A value.
* Returns: <samp>[Promise][]&lt;[Boolean][]&gt;</samp>



## query.includesSequence(other)
Computes a scalar value indicating whether the elements of this Query include
an exact sequence of elements from another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    includesSequence(other: AsyncQueryable<T>): Promise<boolean>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;[T][]&gt;</samp> &mdash; A Queryable.
* Returns: <samp>[Promise][]&lt;[Boolean][]&gt;</samp>



## query.includesSequence(other, equalityComparison)
Computes a scalar value indicating whether the elements of this Query include
an exact sequence of elements from another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    includesSequence<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;U&gt;</samp> &mdash; A Queryable.
  * `equalityComparison` <samp>[Function][]</samp> &mdash; A callback used to compare the equality of two elements.
* Returns: <samp>[Promise][]&lt;[Boolean][]&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type of each element in `other`.



## query.startsWith(other)
Computes a scalar value indicating whether the elements of this Query start
with the same sequence of elements in another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    startsWith(other: AsyncQueryable<T>): Promise<boolean>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;[T][]&gt;</samp> &mdash; A Queryable.
* Returns: <samp>[Promise][]&lt;[Boolean][]&gt;</samp>



## query.startsWith(other, equalityComparison)
Computes a scalar value indicating whether the elements of this Query start
with the same sequence of elements in another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    startsWith<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;U&gt;</samp> &mdash; A Queryable.
  * `equalityComparison` <samp>[Function][]</samp> &mdash; A callback used to compare the equality of two elements.
* Returns: <samp>[Promise][]&lt;[Boolean][]&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type of each element in `other`.



## query.endsWith(other)
Computes a scalar value indicating whether the elements of this Query end
with the same sequence of elements in another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    endsWith(other: AsyncQueryable<T>): Promise<boolean>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;[T][]&gt;</samp> &mdash; A Queryable.
* Returns: <samp>[Promise][]&lt;[Boolean][]&gt;</samp>



## query.endsWith(other, equalityComparison)
Computes a scalar value indicating whether the elements of this Query end
with the same sequence of elements in another Queryable.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    endsWith(other: AsyncQueryable<T>): Promise<boolean>;
    endsWith<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;
}
```

* Parameters:
  * `other` <samp>[AsyncQueryable][]&lt;U&gt;</samp> &mdash; A Queryable.
  * `equalityComparison` <samp>[Function][]</samp> &mdash; A callback used to compare the equality of two elements.
* Returns: <samp>[Promise][]&lt;[Boolean][]&gt;</samp>
* Type Parameters:
    * <samp>U</samp> &mdash; The type of each element in `other`.



## query.elementAt(offset)
Finds the value in the Query at the provided offset. A negative offset starts from the
last element.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    elementAt(offset: number): Promise<T>;
}
```

* Parameters:
  * `offset` <samp>[Number][]</samp> &mdash; The offset from the start of the sequence.
* Returns: <samp>[Promise][]&lt;[T][]&gt;</samp>



## query.span(predicate)
Creates a tuple whose first element is a subquery containing the first span of
elements that match the supplied predicate, and whose second element is a subquery
containing the remaining elements.

> NOTE: The first subquery is eagerly evaluated, while the second subquery is lazily
> evaluated.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    span(predicate: (element: T) => boolean): [Query<T>, AsyncQuery<T>];
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>\[[Query][]&lt;[T][]&gt;, [AsyncQuery][]&lt;[T][]&gt;\]</samp>



## query.break(predicate)
Creates a tuple whose first element is a subquery containing the first span of
elements that do not match the supplied predicate, and whose second element is a subquery
containing the remaining elements.

> NOTE: The first subquery is eagerly evaluated, while the second subquery is lazily
> evaluated.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    break(predicate: (element: T) => boolean): [Query<T>, AsyncQuery<T>];
}
```

* Parameters:
  * `predicate` <samp>[Function][]</samp> &mdash; A callback used to match each element.
* Returns: <samp>\[[Query][]&lt;[T][]&gt;, [AsyncQuery][]&lt;[T][]&gt;\]</samp>



## query.forEach(callback)
Invokes a callback for each element of the Asyncquery.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    forEach(callback: (element: T, offset: number) => void): Promise<void>;
}
```

* Parameters:
  * `callback` <samp>[Function][]</samp> &mdash; The callback to invoke.
* Returns: <samp>[Promise][]&lt;`void`&gt;</samp>



## query.toHierarchy(hierarchy)
Creates a HierarchyQuery using the provided HierarchyProvider.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    toHierarchy(hierarchy: HierarchyProvider<T>): AsyncHierarchyQuery<T>;
}
```

* Parameters:
  * `hierarchy` <samp>[HierarchyProvider][]&lt;[T][]&gt;</samp> &mdash; A [HierarchyProvider][]
* Returns: <samp>[AsyncHierarchyQuery][]&lt;[T][]&gt;</samp>



## query.toArray()
Creates an Array for the elements of the AsyncQuery.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    toArray(): Promise<T[]>;
}
```

* Returns: <samp>[Promise][]&lt;[T][]\[\]&gt;</samp>



## query.toArray(selector)
Creates an Array for the elements of the AsyncQuery.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    toArray<V>(selector: (element: T) => V): Promise<V[]>;
}

```

* Parameters:
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback that selects a value for each element.
* Returns: <samp>[Promise][]&lt;V\[\]&gt;</samp>
* Type Parameters:
    * <samp>V</samp> &mdash; The type for each element in the resulting array.



## query.toSet()
Creates a [Set][] for the elements of the AsyncQuery.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    toSet(): Promise<Set<T>>;
}
```

* Returns: <samp>[Promise][]&lt;[Set][]&lt;[T][]&gt;&gt;</samp>



## query.toSet(elementSelector)
Creates a [Set][] for the elements of the AsyncQuery.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    toSet<V>(elementSelector: (element: T) => V): Promise<Set<V>>;
}
```

* Parameters:
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback that selects a value for each element.
* Returns: <samp>[Promise][]&lt;[Set][]&lt;V&gt;&gt;</samp>
* Type Parameters:
    * <samp>V</samp> &mdash; The type for the value for each element.



## query.toMap(keySelector)
Creates a [Map][] for the elements of the AsyncQuery.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    toMap<K>(keySelector: (element: T) => K): Promise<Map<K, T>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
* Returns: <samp>[Promise][]&lt;[Map][]&lt;K, [T][]&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.toMap(keySelector, elementSelector)
Creates a [Map][] for the elements of the AsyncQuery.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    toMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Promise<Map<K, V>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback that selects a value for each element.
* Returns: <samp>[Promise][]&lt;[Map][]&lt;K, V&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for the value for each element.



## query.toLookup(keySelector)
Creates a [Lookup][] for the elements of the AsyncQuery.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    toLookup<K>(keySelector: (element: T) => K): Promise<Lookup<K, T>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
* Returns: <samp>[Promise][]&lt;[Lookup][]&lt;K, [T][]&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



## query.toLookup(keySelector, elementSelector)
Creates a [Lookup][] for the elements of the AsyncQuery.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    toLookup<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Promise<Lookup<K, V>>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback that selects a value for each element.
* Returns: <samp>[Promise][]&lt;[Lookup][]&lt;K, V&gt;&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.
    * <samp>V</samp> &mdash; The type for the value for each element.



## query.toObject(prototype, keySelector)
Creates an [Object][] for the elements of the AsyncQuery.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    toObject(prototype: object | null, keySelector: (element: T) => string | symbol): Promise<object>;
}
```

* Parameters:
  * `prototype` <samp>[Object][]</samp> &mdash; The prototype for the object.
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
* Returns: <samp>[Promise][]&lt;`object`&gt;</samp>



## query.toObject(prototype, keySelector, elementSelector)
Creates an [Object][] for the elements of the AsyncQuery.

```ts
export declare class AsyncQuery<T> implements AsyncIterable<T> {
    toObject<V>(prototype: object | null, keySelector: (element: T) => string | symbol, elementSelector: (element: T) => V): Promise<object>;
}
```

* Parameters:
  * `prototype` <samp>[Object][]</samp> &mdash; The prototype for the object.
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select a key for each element.
  * `elementSelector` <samp>[Function][]</samp> &mdash; A callback that selects a value for each element.
* Returns: <samp>[Promise][]&lt;`object`&gt;</samp>
* Type Parameters:
    * <samp>V</samp> &mdash; The type for the value for each element.



[T]: #asyncquery-t
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