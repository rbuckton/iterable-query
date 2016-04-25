/*!
  Copyright 2014 Ron Buckton (rbuckton@outlook.com)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */
"use strict";

/**
 * Represents an object that is either iterable or array-like.
 */
export type Queryable<T> = Iterable<T> | ArrayLike<T>;

export interface ObjectLike<T> {
    [key: string]: T;
    [key: number]: T;
}

/**
 * Creates a Query from a Queryable source.
 *
 * @param source The source elements.
 */
export function from<T>(source: Queryable<T>): Query<T> {
    return Query.from(source);
}

/**
 * Creates a Query for a value repeated a provided number of times.
 *
 * @param value The value for each element of the Query.
 * @param count The number of times to repeat the value.
 */
export function repeat<T>(value: T, count: number): Query<T> {
    return Query.repeat(value, count);
}

/**
 * Creates a Query over a range of numbers.
 *
 * @param start The starting number of the range.
 * @param end The ending number of the range.
 * @param increment The amount by which to change between each itereated value.
 */
export function range(start: number, end: number, increment?: number): Query<number> {
    return Query.range(start, end, increment);
}

/**
 * Creates a HierarchyQuery from a root node and a HierarchyProvider.
 *
 * @param root The root node of the hierarchy.
 * @param hierarchy A HierarchyProvider.
 */
export function hierarchy<T>(root: T, hierarchy: HierarchyProvider<T>): HierarchyQuery<T> {
    return Query.hierarchy(root, hierarchy);
}

/**
 * A Query represents a series of operations that act upon an Iterable or ArrayLike. Evaluation of
 * these operations is deferred until the either a scalar value is requested from the Query or the
 * Query is iterated.
 */
export class Query<T> implements Iterable<T> {
    private _source: Iterable<T>;

    /**
     * Creates a Query from a Queryable source.
     *
     * @param source The source elements.
     */
    constructor(source: Queryable<T>) {
        Assert.mustBeQueryable(source, "source");
        this._source = source instanceof Query
            ? source._source
            : ToIterable(source);
    }

    /**
     * Creates a Query from a Queryable source.
     *
     * @param source The Iterable or ArrayLike source.
     */
    public static from<T>(source: Queryable<T>): Query<T> {
        return new Query(source);
    }

    /**
     * Creates a Query for the provided elements.
     *
     * @param elements The elements of the Query.
     */
    public static of<T>(...elements: T[]): Query<T>;

    /**
     * Creates a Query for the provided elements.
     *
     * @param elements The elements of the Query.
     */
    public static of<T>(): Query<T> {
        return new Query(arguments);
    }

    /**
     * Creates a Query with no elements.
     */
    public static empty<T>(): Query<T> {
        return new Query(new EmptyIterable<T>());
    }

    /**
     * Creates a Query over a single element.
     *
     * @param value The only element for the query.
     */
    public static once<T>(value: T): Query<T> {
        return new Query(new OnceIterable(value));
    }

    /**
     * Creates a Query for a value repeated a provided number of times.
     *
     * @param value The value for each element of the Query.
     * @param count The number of times to repeat the value.
     */
    public static repeat<T>(value: T, count: number): Query<T> {
        Assert.mustBePositiveFiniteNumber(count, "count");
        return new Query(new RepeatIterable(value, count));
    }

    /**
     * Creates a Query over a range of numbers.
     *
     * @param start The starting number of the range.
     * @param end The ending number of the range.
     * @param increment The amount by which to change between each itereated value.
     */
    public static range(start: number, end: number, increment?: number): Query<number> {
        if (increment === undefined) increment = 1;
        Assert.mustBeFiniteNumber(start, "start");
        Assert.mustBeFiniteNumber(end, "end");
        Assert.mustBePositiveNonZeroFiniteNumber(increment, "increment");
        if (start < end) {
            return new Query(new RangeIterable(start, end, increment));
        }
        else {
            return new Query(new ReverseRangeIterable(start, end, increment));
        }
    }

    /**
     * Creates a Query that repeats the provided value forever.
     *
     * @param value The value for each element of the Query.
     */
    public static continuous<T>(value: T): Query<T> {
        return new Query(new ContinuousIterable(value));
    }

    /**
     * Creates a Query whose values are provided by a callback executed a provided number of
     * times.
     *
     * @param count The number of times to execute the callback.
     * @param generator The callback to execute.
     */
    public static generate<T>(count: number, generator: (offset: number) => T): Query<T> {
        Assert.mustBePositiveFiniteNumber(count, "count");
        Assert.mustBeFunction(generator, "generator");
        return new Query(new GenerateIterable(count, generator));
    }

    /**
     * Creates a HierarchyQuery from a root node and a HierarchyProvider.
     *
     * @param root The root node of the hierarchy.
     * @param hierarchy A HierarchyProvider.
     */
    public static hierarchy<T>(root: T, hierarchy: HierarchyProvider<T>): HierarchyQuery<T> {
        Assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
        return new HierarchyQuery(new OnceIterable(root), hierarchy);
    }

    /**
     * Creates a Query that when iterated consumes the provided Iterator.
     *
     * @param iterator An Iterator.
     */
    public static consume<T>(iterator: Iterator<T>): Query<T> {
        Assert.mustBeIterator(iterator, "iterator");
        return new Query(new ConsumeIterable(iterator));
    }

    /**
     * Creates a Query that iterates the elements from one of two sources based on the result of a
     * lazily evaluated condition.
     *
     * @param condition A callback used to choose a source.
     * @param thenQueryable The source to use when the callback evaluates to `true`.
     * @param elseQueryable The source to use when the callback evaluates to `false`.
     */
    public static if<T>(condition: () => boolean, thenQueryable: Queryable<T>, elseQueryable: Queryable<T>) {
        Assert.mustBeFunction(condition, "condition");
        Assert.mustBeQueryable(thenQueryable, "thenQueryable");
        Assert.mustBeQueryable(elseQueryable, "elseQueryable");
        return new Query(new IfIterable(condition, ToIterable(thenQueryable), ToIterable(elseQueryable)));
    }

    /**
     * Creates a Query that iterates the elements from sources picked from a list based on the
     * result of a lazily evaluated choice.
     *
     * @param chooser A callback used to choose a source.
     * @param choices A list of sources
     * @param otherwise A default source to use when another choice could not be made.
     */
    public static choose<K, T>(chooser: () => K, choices: Queryable<[K, Queryable<T>]>, otherwise?: Queryable<T>) {
        Assert.mustBeFunction(chooser, "chooser");
        Assert.mustBeQueryable(choices, "choices");
        Assert.mustBeQueryableOrUndefined(otherwise, "otherwise");
        return new Query(new ChooseIterable(chooser, ToIterable(choices), otherwise !== undefined ? ToIterable(otherwise) : undefined));
    }

    /**
     * Creates a Query for the own property keys of an object.
     *
     * @param source An object.
     */
    public static objectKeys<T>(source: ObjectLike<T>): Query<string> {
        Assert.mustBeObject(source, "source");
        const keys = Object.keys(source);
        return new Query(keys);
    }

    /**
     * Creates a Query for the own property values of an object.
     *
     * @param source An object.
     */
    public static objectValues<T>(source: ObjectLike<T>): Query<T> {
        Assert.mustBeObject(source, "source");
        const keys = Object.keys(source);
        return new Query(new MapIterable(keys, key => source[key]));
    }

    /**
     * Creates a Query for the own property key-value pairs of an object.
     *
     * @param source An object.
     */
    public static objectEntries<T>(source: ObjectLike<T>): Query<[string, T]> {
        Assert.mustBeObject(source, "source");
        const keys = Object.keys(source);
        return new Query(new MapIterable(keys, key => MakeTuple(key, source[key])));
    }

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    public filter<U extends T>(predicate: (element: T, offset: number) => element is U): Query<U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    public filter(predicate: (element: T, offset: number) => boolean): Query<T>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    public filter(predicate: (element: T, offset: number) => boolean): Query<T> {
        Assert.mustBeFunction(predicate, "predicate");
        return new Query(new FilterIterable(this, predicate));
    }

    /**
     * Creates a subquery whose elements match the supplied predicate.
     * This is an alias for `filter`.
     *
     * @param predicate A callback used to match each element.
     */
    public where<U extends T>(predicate: (element: T, offset: number) => element is U): Query<U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     * This is an alias for `filter`.
     *
     * @param predicate A callback used to match each element.
     */
    public where(predicate: (element: T, offset: number) => boolean): Query<T>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     * This is an alias for `filter`.
     *
     * @param predicate A callback used to match each element.
     */
    public where(predicate: (element: T, offset: number) => boolean): Query<T> {
        return this.filter(predicate);
    }

    /**
     * Creates a subquery by applying a callback to each element.
     *
     * @param selector A callback used to map each element.
     */
    public map<U>(selector: (element: T, offset: number) => U): Query<U> {
        Assert.mustBeFunction(selector, "selector");
        return new Query(new MapIterable(this, selector));
    }

    /**
     * Creates a subquery by applying a callback to each element.
     * This is an alias for `map`.
     *
     * @param selector A callback used to map each element.
     */
    public select<U>(selector: (element: T, offset: number) => U): Query<U> {
        return this.map(selector);
    }

    /**
     * Creates a subquery that iterates the results of applying a callback to each element.
     *
     * @param projection A callback used to map each element into an iterable.
     */
    public flatMap<U>(projection: (element: T) => Queryable<U>): Query<U> {
        Assert.mustBeFunction(projection, "projection");
        return new Query(new FlatMapIterable(this, projection));
    }

    /**
     * Creates a subquery that iterates the results of applying a callback to each element.
     * This is an alias for `flatMap`.
     *
     * @param projection A callback used to map each element into an iterable.
     */
    public selectMany<U>(projection: (element: T) => Queryable<U>): Query<U> {
        return this.flatMap(projection);
    }

    /**
     * Creates a subquery that iterates the results of recursively expanding the
     * elements of the source.
     *
     * @param projection A callback used to recusively expand each element.
     */
    public expand(projection: (element: T) => Queryable<T>): Query<T> {
        Assert.mustBeFunction(projection, "projection");
        return new Query(new ExpandIterable(this, projection));
    }

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     *
     * @param callback The callback to invoke.
     */
    public do(callback: (element: T, offset: number) => void): Query<T> {
        Assert.mustBeFunction(callback, "callback");
        return new Query(new DoIterable(this, callback));
    }

    /**
     * Creates a subquery whose elements are in the reverse order.
     */
    public reverse(): Query<T> {
        return new Query(new ReverseIterable(this));
    }

    /**
     * Creates a subquery containing all elements except the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     */
    public skip(count: number): Query<T> {
        Assert.mustBePositiveFiniteNumber(count, "count");
        return new Query(new SkipIterable(this, count));
    }

    /**
     * Creates a subquery containing all elements except the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     */
    public skipRight(count: number): Query<T> {
        Assert.mustBePositiveFiniteNumber(count, "count");
        return new Query(new SkipRightIterable(this, count));
    }

    /**
     * Creates a subquery containing all elements except the first elements that match
     * the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    public skipWhile(predicate: (element: T) => boolean): Query<T> {
        Assert.mustBeFunction(predicate, "predicate");
        return new Query(new SkipWhileIterable(this, predicate));
    }

    /**
     * Creates a subquery containing the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     */
    public take(count: number): Query<T> {
        Assert.mustBePositiveFiniteNumber(count, "count");
        return new Query(new TakeIterable(this, count));
    }

    /**
     * Creates a subquery containing the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     */
    public takeRight(count: number): Query<T> {
        Assert.mustBePositiveFiniteNumber(count, "count");
        return new Query(new TakeRightIterable(this, count));
    }

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    public takeWhile(predicate: (element: T) => boolean): Query<T> {
        Assert.mustBeFunction(predicate, "predicate");
        return new Query(new TakeWhileIterable(this, predicate));
    }

    /**
     * Creates a subquery for the set intersection of this Query and another Queryable.
     *
     * @param other A Queryable value.
     */
    public intersect(other: Queryable<T>): Query<T> {
        Assert.mustBeQueryable(other, "other");
        return new Query(new IntersectIterable(this, ToIterable(other)));
    }

    /**
     * Creates a subquery for the set union of this Query and another Queryable.
     *
     * @param other A Queryable value.
     */
    public union(other: Queryable<T>): Query<T> {
        Assert.mustBeQueryable(other, "other");
        return new Query(new UnionIterable(this, ToIterable(other)));
    }

    /**
     * Creates a subquery for the set difference between this and another Queryable.
     *
     * @param other A Queryable value.
     */
    public except(other: Queryable<T>): Query<T> {
        Assert.mustBeQueryable(other, "other");
        return new Query(new ExceptIterable(this, ToIterable(other)));
    }

    /**
     * Creates a subquery that concatenates this Query with another Queryable.
     *
     * @param other A Queryable value.
     */
    public concat(other: Queryable<T>): Query<T> {
        Assert.mustBeQueryable(other, "other");
        return new Query(new ConcatIterable(this, ToIterable(other)));
    }

    /**
     * Creates a subquery for the distinct elements of this Query.
     */
    public distinct(): Query<T> {
        return new Query(new DistinctIterable(this));
    }

    /**
     * Creates a subquery for the elements of this Query with the provided value appended to the end.
     *
     * @param value The value to append.
     */
    public append(value: T): Query<T> {
        return new Query(new AppendIterable(this, value));
    }

    /**
     * Creates a subquery for the elements of this Query with the provided value prepended to the beginning.
     *
     * @param value The value to prepend.
     */
    public prepend(value: T): Query<T> {
        return new Query(new PrependIterable(value, this));
    }

    /**
     * Creates a subquery for the elements of this Query with the provided range
     * patched into the results.
     *
     * @param start The offset at which to patch the range.
     * @param skipCount The number of elements to skip from start.
     * @param range The range to patch into the result.
     */
    public patch(start: number, skipCount: number, range: Queryable<T>): Query<T> {
        Assert.mustBePositiveFiniteNumber(start, "start");
        Assert.mustBePositiveFiniteNumber(skipCount, "skipCount");
        Assert.mustBeQueryable(range, "range");
        return new Query(new PatchIterable(this, start, skipCount, ToIterable(range)));
    }

    /**
     * Creates a subquery that contains the provided default value if this Query
     * contains no elements.
     *
     * @param defaultValue The default value.
     */
    public defaultIfEmpty(defaultValue: T): Query<T> {
        return new Query(new DefaultIfEmptyIterable(this, defaultValue));
    }

    /**
     * Creates a subquery that splits this Query into one or more pages.
     * While advancing from page to page is evaluated lazily, the elements of the page are
     * evaluated eagerly.
     *
     * @param pageSize The number of elements per page.
     */
    public pageBy(pageSize: number): Query<Page<T>> {
        Assert.mustBePositiveNonZeroFiniteNumber(pageSize, "pageSize");
        return new Query(new PageByIterable(this, pageSize));
    }

    /**
     * Creates a subquery that combines this Query with another Queryable by combining elements
     * in tuples.
     *
     * @param right A Queryable.
     */
    public zip<U>(right: Queryable<U>): Query<[T, U]>;

    /**
     * Creates a subquery that combines this Query with another Queryable by combining elements
     * using the supplied callback.
     *
     * @param right A Queryable.
     * @param selector A callback used to combine two elements.
     */
    public zip<U, R>(right: Queryable<U>, selector: (left: T, right: U) => R): Query<R>;

    /**
     * Creates a subquery that combines this Query with another Queryable by combining elements
     * using the supplied callback.
     *
     * @param right A Queryable.
     * @param selector An optional callback used to combine two elements.
     */
    public zip<U, R>(right: Queryable<U>, selector?: (left: T, right: U) => [T, U] | R): Query<[T, U] | R> {
        if (selector === undefined) selector = MakeTuple;
        Assert.mustBeQueryable(right, "right");
        Assert.mustBeFunction(selector, "selector");
        return new Query(new ZipIterable(this, ToIterable(right), selector));
    }

    /**
     * Creates an ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    public orderBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T> {
        if (comparison === undefined) comparison = CompareValues;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(comparison, "comparison");
        return new (<any>OrderedQuery)(new OrderedIterable(this, keySelector, comparison, false, /*parent*/ undefined));
    }

    /**
     * Creates an ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    public orderByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T> {
        if (comparison === undefined) comparison = CompareValues;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(comparison, "comparison");
        return new (<any>OrderedQuery)(new OrderedIterable(this, keySelector, comparison, true, /*parent*/ undefined));
    }

    /**
     * Creates a subquery whose elements are the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     */
    public spanMap<K>(keySelector: (element: T) => K): Query<Grouping<K, T>>;

    /**
     * Creates a subquery whose values are computed from each element of the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     */
    public spanMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Query<Grouping<K, V>>;

    /**
     * Creates a subquery whose values are computed from the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @param resultSelector A callback used to select a result from a contiguous range.
     */
    public spanMap<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R): Query<R>;

    /**
     * Creates a subquery whose values are computed from the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector An optional callback used to select a value for an element.
     * @param resultSelector An optional callback used to select a result from a contiguous range.
     */
    public spanMap<K, V, R>(keySelector: (element: T) => K, elementSelector?: (element: T) => V, spanSelector?: (key: K, span: Query<V>) => Grouping<K, T | V> | R): Query<Grouping<K, T | V> | R> {
        if (elementSelector === undefined) elementSelector = Identity;
        if (spanSelector === undefined) spanSelector = ToGrouping;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(elementSelector, "elementSelector");
        Assert.mustBeFunction(spanSelector, "spanSelector");
        return new Query(new SpanMapIterable(this, keySelector, elementSelector, spanSelector));
    }

    /**
     * Groups each element of this Query by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     */
    public groupBy<K>(keySelector: (element: T) => K): Query<Grouping<K, T>>;

    /**
     * Groups each element by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     */
    public groupBy<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Query<Grouping<K, V>>;

    /**
     * Groups each element by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @param resultSelector A callback used to select a result from a group.
     */
    public groupBy<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R): Query<R>;

    /**
     * Groups each element by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector An optional callback used to select a value for an element.
     * @param resultSelector An optional callback used to select a result from a group.
     */
    public groupBy<K, V, R>(keySelector: (element: T) => K, elementSelector?: (element: T) => V, resultSelector?: (key: K, elements: Query<V>) => Grouping<K, T | V> | R): Query<Grouping<K, T | V> | R> {
        if (elementSelector === undefined) elementSelector = Identity;
        if (resultSelector === undefined) resultSelector = ToGrouping;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(elementSelector, "elementSelector");
        Assert.mustBeFunction(resultSelector, "resultSelector");
        return new Query(new GroupByIterable(this, keySelector, elementSelector, resultSelector));
    }

    /**
     * Creates a grouped subquery for the correlated elements of this Query and another Queryable.
     *
     * @param inner A Queryable.
     * @param outerKeySelector A callback used to select the key for an element in this Query.
     * @param innerKeySelector A callback used to select the key for an element in the other Queryable.
     * @param resultSelector A callback used to select the result for the correlated elements.
     */
    public groupJoin<I, K, R>(inner: Queryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: Query<I>) => R): Query<R> {
        Assert.mustBeQueryable(inner, "inner");
        Assert.mustBeFunction(outerKeySelector, "outerKeySelector");
        Assert.mustBeFunction(innerKeySelector, "innerKeySelector");
        Assert.mustBeFunction(resultSelector, "resultSelector");
        return new Query(new GroupJoinIterable(this, ToIterable(inner), outerKeySelector, innerKeySelector, resultSelector));
    }

    /**
     * Creates a subquery for the correlated elements of this Query and another Queryable.
     *
     * @param inner A Queryable.
     * @param outerKeySelector A callback used to select the key for an element in this Query.
     * @param innerKeySelector A callback used to select the key for an element in the other Queryable.
     * @param resultSelector A callback used to select the result for the correlated elements.
     */
    public join<I, K, R>(inner: Queryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: I) => R): Query<R> {
        Assert.mustBeQueryable(inner, "inner");
        Assert.mustBeFunction(outerKeySelector, "outerKeySelector");
        Assert.mustBeFunction(innerKeySelector, "innerKeySelector");
        Assert.mustBeFunction(resultSelector, "resultSelector");
        return new Query(new JoinIterable(this, ToIterable(inner), outerKeySelector, innerKeySelector, resultSelector));
    }

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element.
     *
     * @param accumulator The callback used to compute each result.
     */
    public scan(accumulator: (current: T, element: T, offset: number) => T): Query<T>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element.
     *
     * @param accumulator The callback used to compute each result.
     * @param seed An optional seed value.
     */
    public scan<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): Query<U>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element.
     *
     * @param accumulator The callback used to compute each result.
     * @param seed An optional seed value.
     */
    public scan<U>(accumulator: (current: T | U, element: T, offset: number) => T | U, seed?: T | U): Query<T | U> {
        Assert.mustBeFunction(accumulator, "accumulator");
        return new Query(new ScanIterable(this, accumulator, /*isSeeded*/ arguments.length >= 2, seed));
    }

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.
     *
     * @param accumulator The callback used to compute each result.
     */
    public scanRight(accumulator: (current: T, element: T, offset: number) => T): Query<T>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.
     *
     * @param accumulator The callback used to compute each result.
     * @param seed An optional seed value.
     */
    public scanRight<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): Query<U>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.
     *
     * @param accumulator The callback used to compute each result.
     * @param seed An optional seed value.
     */
    public scanRight<U>(accumulator: (current: T | U, element: T, offset: number) => T | U, seed?: T | U): Query<T | U> {
        Assert.mustBeFunction(accumulator, "accumulator");
        return new Query(new ScanRightIterable(this, accumulator, /*isSeeded*/ arguments.length >= 2, seed));
    }

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     */
    public reduce(accumulator: (current: T, element: T, offset: number) => T): T;

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     */
    public reduce<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): U;

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @param resultSelector An optional callback used to compute the final result.
     */
    public reduce<U, R>(accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): R;

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @param resultSelector An optional callback used to compute the final result.
     */
    public reduce<U, R>(accumulator: (current: T | U, element: T, offset: number) => T | U, seed?: T | U, resultSelector?: (result: T | U, count: number) => T | U | R): T | U | R {
        if (resultSelector === undefined) resultSelector = Identity;
        Assert.mustBeFunction(accumulator, "accumulator");
        Assert.mustBeFunction(resultSelector, "resultSelector");
        let isSeeded = arguments.length >= 2;
        let iterator = this[Symbol.iterator]();
        let current = seed;
        let offset = 0;
        try {
            while (true) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                    break;
                }

                if (!isSeeded) {
                    current = value;
                    isSeeded = true;
                    offset++;
                    continue;
                }

                current = accumulator(current, value, offset);
                offset++;
            }
        }
        finally {
            IteratorClose(iterator);
        }

        return resultSelector(current, offset);
    }

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     */
    public reduceRight(accumulator: (current: T, element: T, offset: number) => T): T;

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     */
    public reduceRight<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): U;

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @param resultSelector An optional callback used to compute the final result.
     */
    public reduceRight<U, R>(accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): R;

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @param resultSelector An optional callback used to compute the final result.
     */
    public reduceRight<U, R>(accumulator: (current: T | U, element: T, offset: number) => T | U, seed?: T | U, resultSelector?: (result: T | U, count: number) => T | U | R): T | U | R {
        if (resultSelector === undefined) resultSelector = Identity;
        Assert.mustBeFunction(accumulator, "accumulator");
        Assert.mustBeFunction(resultSelector, "resultSelector");
        const source = Array.from<T>(this._source);
        let isSeeded = arguments.length >= 2;
        let current = seed;
        let count = 0;
        for (let offset = source.length - 1; offset >= 0; offset--) {
            const value = source[offset];
            if (!isSeeded) {
                current = value;
                isSeeded = true;
                count++;
                continue;
            }

            current = accumulator(current, value, offset);
            count++;
        }

        return resultSelector(current, count);
    }

    /**
     * Counts the number of elements in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    public count(predicate?: (element: T) => boolean): number {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        let count = 0;
        if (predicate) {
            for (const element of this) {
                if (predicate(element)) {
                    count++;
                }
            }
        }
        else {
            if (Array.isArray(this._source)) {
                return (<T[]>this._source).length;
            }
            else if (this._source instanceof Set || this._source instanceof Map) {
                return (<Set<T> | Map<any, any>>this._source).size;
            }

            for (const element of this) {
                count++;
            }
        }
        return count;
    }

    /**
     * Gets the first element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    public first(predicate?: (element: T) => boolean): T {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        if (predicate) {
            for (const element of this) {
                if (predicate(element)) {
                    return element;
                }
            }
        }
        else {
            for (const element of this) {
                return element;
            }
        }

        return undefined;
    }

    /**
     * Gets the last element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    public last(predicate?: (element: T) => boolean): T {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        let result: T;
        if (predicate) {
            for (const element of this) {
                if (predicate(element)) {
                    result = element;
                }
            }
        }
        else {
            for (const element of this) {
                result = element;
            }
        }

        return result;
    }

    /**
     * Gets the only element in the Query, or returns undefined.
     *
     * @param predicate An optional callback used to match each element.
     */
    public single() {
        let hasElements = false;
        let result: T;
        for (const element of this) {
            if (hasElements) {
                return undefined;
            }

            hasElements = true;
            result = element;
        }

        return hasElements ? result : undefined;
    }

    /**
     * Gets the minimum element in the query, optionally comparing elements using the supplied
     * callback.
     *
     * @param comparison An optional callback used to compare two elements.
     */
    public min(comparison?: (x: T, y: T) => number): T {
        if (comparison === undefined) comparison = CompareValues;
        Assert.mustBeFunctionOrUndefined(comparison, "comparison");
        let hasElements = false;
        let result: T;
        for (const element of this) {
            if (!hasElements) {
                result = element;
                hasElements = true;
            }
            else if (comparison(element, result) < 0) {
                result = element;
            }
        }

        return result;
    }

    /**
     * Gets the maximum element in the query, optionally comparing elements using the supplied
     * callback.
     *
     * @param comparison An optional callback used to compare two elements.
     */
    public max(comparison?: (x: T, y: T) => number): T {
        if (comparison === undefined) comparison = CompareValues;
        Assert.mustBeFunctionOrUndefined(comparison, "comparison");
        let hasElements = false;
        let result: T;
        for (const element of this) {
            if (!hasElements) {
                result = element;
                hasElements = true;
            }
            else if (comparison(element, result) > 0) {
                result = element;
            }
        }

        return result;
    }

    /**
     * Computes a scalar value indicating whether the Query contains any elements,
     * optionally filtering the elements using the supplied callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    public some(predicate?: (element: T) => boolean): boolean {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        if (predicate) {
            for (const element of this) {
                if (predicate(element)) {
                    return true;
                }
            }
        }
        else {
            for (const element of this) {
                return true;
            }
        }
        return false;
    }

    /**
     * Computes a scalar value indicating whether all elements of the Query
     * match the supplied callback.
     *
     * @param predicate A callback used to match each element.
     */
    public every(predicate: (element: T) => boolean): boolean {
        Assert.mustBeFunction(predicate, "predicate");
        let hasMatchingElements = false;
        for (const element of this) {
            if (!predicate(element)) {
                return false;
            }

            hasMatchingElements = true;
        }

        return hasMatchingElements;
    }

    /**
     * Computes a scalar value indicating whether every element in this Query corresponds to a matching element
     * in another Queryable at the same position.
     *
     * @param other A Queryable.
     */
    public corresponds(other: Queryable<T>): boolean;

    /**
     * Computes a scalar value indicating whether every element in this Query corresponds to a matching element
     * in another Queryable at the same position.
     *
     * @param other A Queryable.
     * @param equalityComparison A callback used to compare the equality of two elements.
     */
    public corresponds<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;

    /**
     * Computes a scalar value indicating whether every element in this Query corresponds to a matching element
     * in another Queryable at the same position.
     *
     * @param other A Queryable.
     * @param equalityComparison An optional callback used to compare the equality of two elements.
     */
    public corresponds<U>(other: Queryable<T | U>, equalityComparison?: (left: T, right: T | U) => boolean): boolean {
        if (equalityComparison === undefined) equalityComparison = SameValue;
        Assert.mustBeQueryable(other, "other");
        Assert.mustBeFunction(equalityComparison, "equalityComparison");
        let leftIterator = this[Symbol.iterator]();
        try {
            let rightIterator = ToIterable(other)[Symbol.iterator]();
            try {
                while (true) {
                    const leftResult = leftIterator.next(), leftDone = leftResult.done, leftValue = leftResult.value;
                    const rightResult = rightIterator.next(), rightDone = rightResult.done, rightValue = rightResult.value;
                    if (leftDone) {
                        leftIterator = undefined;
                    }

                    if (rightDone) {
                        rightIterator = undefined;
                    }

                    if (leftDone && rightDone) {
                        return true;
                    }

                    if (Boolean(leftDone) !== Boolean(rightDone) || !equalityComparison(leftValue, rightValue)) {
                        return false;
                    }
                }
            }
            finally {
                IteratorClose(rightIterator);
            }
        }
        finally {
            IteratorClose(leftIterator);
        }
    }

    /**
     * Computes a scalar value indicating whether the provided value is included in the query.
     *
     * @param value A value.
     */
    public includes(value: T): boolean {
        for (const element of this) {
            if (SameValue(value, element)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Computes a scalar value indicating whether the elements of this Query include
     * an exact sequence of elements from another Queryable.
     *
     * @param other A Queryable.
     */
    public includesSequence(other: Queryable<T>): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this Query include
     * an exact sequence of elements from another Queryable.
     *
     * @param other A Queryable.
     * @param equalityComparison A callback used to compare the equality of two elements.
     */
    public includesSequence<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this Query include
     * an exact sequence of elements from another Queryable.
     *
     * @param other A Queryable.
     * @param equalityComparison An optional callback used to compare the equality of two elements.
     */
    public includesSequence<U>(other: Iterable<T | U>, equalityComparison?: (left: T, right: T | U) => boolean): boolean {
        if (equalityComparison === undefined) equalityComparison = SameValue;
        Assert.mustBeQueryable(other, "other");
        Assert.mustBeFunction(equalityComparison, "equalityComparison");

        const right = Array.from(other);
        const numElements = right.length;
        if (numElements <= 0) {
            return true;
        }

        const span: T[] = [];
        let leftIterator = this[Symbol.iterator]();
        try {
            while (true) {
                const leftResult = leftIterator.next(), leftDone = leftResult.done, leftValue = leftResult.value;
                if (leftDone) {
                    leftIterator = undefined;
                    return false;
                }

                while (true) {
                    const rightValue = right[span.length];
                    if (equalityComparison(leftValue, rightValue)) {
                        if (span.length + 1 >= numElements) {
                            return true;
                        }

                        span.push(leftValue);
                    }
                    else if (span.length > 0) {
                        span.shift();
                        continue;
                    }

                    break;
                }
            }
        }
        finally {
            IteratorClose(leftIterator);
        }
    }

    /**
     * Computes a scalar value indicating whether the elements of this Query start
     * with the same sequence of elements in another Queryable.
     *
     * @param other A Queryable.
     */
    public startsWith(other: Queryable<T>): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this Query start
     * with the same sequence of elements in another Queryable.
     *
     * @param other A Queryable.
     * @param equalityComparison A callback used to compare the equality of two elements.
     */
    public startsWith<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this Query start
     * with the same sequence of elements in another Queryable.
     *
     * @param other A Queryable.
     * @param equalityComparison An optional callback used to compare the equality of two elements.
     */
    public startsWith<U>(other: Queryable<T | U>, equalityComparison?: (left: T, right: T | U) => boolean): boolean {
        if (equalityComparison === undefined) equalityComparison = SameValue;
        Assert.mustBeQueryable(other, "other");
        Assert.mustBeFunction(equalityComparison, "equalityComparison");

        let leftIterator = this[Symbol.iterator]();
        try {
            let rightIterator = ToIterable(other)[Symbol.iterator]();
            try {
                while (true) {
                    const leftResult = leftIterator.next(), leftDone = leftResult.done, leftValue = leftResult.value;
                    const rightResult = rightIterator.next(), rightDone = rightResult.done, rightValue = rightResult.value;
                    if (leftDone) {
                        leftIterator = undefined;
                    }

                    if (rightDone) {
                        rightIterator = undefined;
                    }

                    if (rightDone) {
                        return true;
                    }
                    else if (leftDone) {
                        return false;
                    }

                    if (!equalityComparison(leftValue, rightValue)) {
                        return false;
                    }
                }
            }
            finally {
                IteratorClose(rightIterator);
            }
        }
        finally {
            IteratorClose(leftIterator);
        }
    }

    /**
     * Computes a scalar value indicating whether the elements of this Query end
     * with the same sequence of elements in another Queryable.
     *
     * @param other A Queryable.
     */
    public endsWith(other: Queryable<T>): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this Query end
     * with the same sequence of elements in another Queryable.
     *
     * @param other A Queryable.
     * @param equalityComparison A callback used to compare the equality of two elements.
     */
    public endsWith<U>(other: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this Query end
     * with the same sequence of elements in another Queryable.
     *
     * @param other A Queryable.
     * @param equalityComparison An optional callback used to compare the equality of two elements.
     */
    public endsWith<U>(other: Queryable<T | U>, equalityComparison?: (left: T, right: T | U) => boolean): boolean {
        if (equalityComparison === undefined) equalityComparison = SameValue;
        Assert.mustBeQueryable(other, "other");
        Assert.mustBeFunction(equalityComparison, "equalityComparison");

        const right = Array.from(other);
        const numElements = right.length;
        if (numElements <= 0) {
            return true;
        }

        const left = this.takeRight(numElements).toArray();
        if (left.length < numElements) {
            return false;
        }

        for (let i = 0; i < numElements; i++) {
            if (!equalityComparison(left[i], right[i])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Finds the value in the Query at the provided offset. A negative offset starts from the
     * last element.
     *
     * @param offset An offset.
     */
    public elementAt(offset: number): T {
        Assert.mustBeInteger(offset, "offset");

        if (offset === -1) {
            return this.last();
        }

        if (offset < 0) {
            offset = Math.abs(offset);
            const array: T[] = [];
            for (const element of this) {
                if (array.length >= offset) {
                    array.shift();
                }

                array.push(element);
            }

            return array.length - offset >= 0 ? array[array.length - offset] : undefined;
        }

        for (const element of this) {
            if (offset === 0) {
                return element;
            }

            offset--;
        }
    }

    /**
     * Creates a tuple whose first element is a subquery containing the first span of
     * elements that match the supplied predicate, and whose second element is a subquery
     * containing the remaining elements.
     *
     * The first subquery is eagerly evaluated, while the second subquery is lazily
     * evaluated.
     *
     * @param predicate The predicate used to match elements.
     */
    public span(predicate: (element: T) => boolean): [Query<T>, Query<T>] {
        Assert.mustBeFunction(predicate, "predicate");

        const prefix: T[] = [];
        let iterator = this[Symbol.iterator]();
        try {
            while (true) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                    break;
                }

                if (!predicate(value)) {
                    const remaining = new PrependIterable(value, new ConsumeIterable(iterator));
                    iterator = undefined;
                    return [
                        new Query(prefix),
                        new Query(remaining)
                    ];
                }

                prefix.push(value);
            }
        }
        finally {
            IteratorClose(iterator);
        }

        return [
            new Query(prefix),
            new Query(new EmptyIterable<T>())
        ];
    }

    /**
     * Creates a tuple whose first element is a subquery containing the first span of
     * elements that do not match the supplied predicate, and whose second element is a subquery
     * containing the remaining elements.
     *
     * The first subquery is eagerly evaluated, while the second subquery is lazily
     * evaluated.
     *
     * @param predicate The predicate used to match elements.
     */
    public break(predicate: (element: T) => boolean): [Query<T>, Query<T>] {
        Assert.mustBeFunction(predicate, "predicate");

        const prefix: T[] = [];
        let iterator = this[Symbol.iterator]();
        try {
            while (true) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                    break;
                }

                if (predicate(value)) {
                    const remaining = new PrependIterable(value, new ConsumeIterable(iterator));
                    iterator = undefined;
                    return [
                        new Query(prefix),
                        new Query(remaining)
                    ];
                }

                prefix.push(value);
            }
        }
        finally {
            IteratorClose(iterator);
        }

        return [
            new Query(prefix),
            new Query(new EmptyIterable<T>())
        ];
    }

    /**
     * Invokes a callback for each element of the query.
     *
     * @param callback The callback to invoke.
     */
    public forEach(callback: (element: T, offset: number) => void): void {
        Assert.mustBeFunction(callback, "callback");

        let offset = 0;
        for (const element of this) {
            callback(element, offset++);
        }
    }

    /**
     * Iterates over all of the elements in the query, ignoring the results.
     */
    public drain(): void {
        for (const element of this) ;
    }

    /**
     * Creates a HierarchyQuery using the provided HierarchyProvider.
     *
     * @param hierarchy A HierarchyProvider.
     */
    public toHierarchy(hierarchy: HierarchyProvider<T>): HierarchyQuery<T> {
        Assert.mustBeHierarchyProvider(hierarchy, "hierarchy");

        return new HierarchyQuery<T>(this, hierarchy);
    }

    /**
     * Creates an Array for the elements of the Query.
     */
    public toArray(): T[];

    /**
     * Creates an Array for the elements of the Query.
     *
     * @param elementSelector A callback that selects a value for each element.
     */
    public toArray<V>(elementSelector: (element: T) => V): V[];

    /**
     * Creates an Array for the elements of the Query.
     *
     * @param elementSelector An optional callback that selects a value for each element.
     */
    public toArray<V>(elementSelector?: (element: T) => T | V): (T | V)[] {
        Assert.mustBeFunctionOrUndefined(elementSelector, "elementSelector");
        return Array.from<T, T | V>(this, elementSelector);
    }

    /**
     * Creates a Set for the elements of the Query.
     */
    public toSet(): Set<T>;

    /**
     * Creates a Set for the elements of the Query.
     *
     * @param elementSelector A callback that selects a value for each element.
     */
    public toSet<V>(elementSelector: (element: T) => V): Set<V>;

    /**
     * Creates a Set for the elements of the Query.
     *
     * @param elementSelector An optional callback that selects a value for each element.
     */
    public toSet<V>(elementSelector?: (element: T) => T | V): Set<T | V> {
        if (elementSelector === undefined) elementSelector = Identity;
        Assert.mustBeFunction(elementSelector, "elementSelector");

        const set = new Set<T | V>();
        for (const item of this) {
            const element = elementSelector(item);
            set.add(element);
        }
        return set;
    }

    /**
     * Creates a Map for the elements of the Query.
     *
     * @param keySelector A callback used to select a key for each element.
     */
    public toMap<K>(keySelector: (element: T) => K): Map<K, T>;

    /**
     * Creates a Map for the elements of the Query.
     *
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     */
    public toMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Map<K, V>;

    /**
     * Creates a Map for the elements of the Query.
     *
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector An optional callback that selects a value for each element.
     */
    public toMap<K, V>(keySelector: (element: T) => K, elementSelector?: (element: T) => T | V): Map<K, T | V> {
        if (elementSelector === undefined) elementSelector = Identity;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(elementSelector, "elementSelector");

        const map = new Map<K, T | V>();
        for (const item of this) {
            const key = keySelector(item);
            const element = elementSelector(item);
            map.set(key, element);
        }
        return map;
    }

    /**
     * Creates a Lookup for the elements of the Query.
     *
     * @param keySelector A callback used to select a key for each element.
     */
    public toLookup<K>(keySelector: (element: T) => K): Lookup<K, T>;

    /**
     * Creates a Lookup for the elements of the Query.
     *
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     */
    public toLookup<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Lookup<K, V>;

    /**
     * Creates a Lookup for the elements of the Query.
     *
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector An optional callback that selects a value for each element.
     */
    public toLookup<K, V>(keySelector: (element: T) => K, elementSelector?: (element: T) => T | V): Lookup<K, T | V> {
        if (elementSelector === undefined) elementSelector = Identity;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(elementSelector, "elementSelector");

        const map = CreateGroupings(this, keySelector, elementSelector);
        return new Lookup<K, T | V>(map);
    }

    /**
     * Creates an Object for the elements of the Query.
     *
     * @param prototype The prototype for the object.
     * @param keySelector A callback used to select a key for each element.
     */
    public toObject(prototype: any, keySelector: (element: T) => string | symbol): any;

    /**
     * Creates an Object for the elements of the Query.
     *
     * @param prototype The prototype for the object.
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     */
    public toObject<V>(prototype: any, keySelector: (element: T) => string | symbol, elementSelector: (element: T) => V): any;

    /**
     * Creates an Object for the elements of the Query.
     *
     * @param prototype The prototype for the object.
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector An optional callback that selects a value for each element.
     */
    public toObject<V>(prototype: any, keySelector: (element: T) => string | symbol, elementSelector?: (element: T) => T | V): any {
        if (elementSelector === undefined) elementSelector = Identity;
        Assert.mustBeObjectOrNull(prototype, "prototype");
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(elementSelector, "elementSelector");

        const obj = Object.create(prototype);
        for (const item of this) {
            const key = keySelector(item);
            const element = elementSelector(item);
            obj[key] = element;
        }

        return obj;
    }

    public toJSON() : any {
        return this.toArray();
    }

    public *[Symbol.iterator](): Iterator<T> {
        yield* this._source;
    }
}

/**
 * Represents an ordered sequence of elements.
 */
export class OrderedQuery<T> extends Query<T> implements Query<T> {
    /*@internal*/ _ordered: OrderedIterableBase<T>;

    private constructor(source: OrderedIterableBase<T>) {
        Assert.mustBeOrderedIterable(source, "source");
        super(source);
        this._ordered = source;
    }

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    public thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T> {
        if (comparison === undefined) comparison = CompareValues;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(comparison, "comparison");
        return new OrderedQuery(new OrderedIterable(this._ordered._source, keySelector, comparison, /*descending*/ false, this._ordered));
    }

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    public thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T> {
        if (comparison === undefined) comparison = CompareValues;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(comparison, "comparison");
        return new OrderedQuery(new OrderedIterable(this._ordered._source, keySelector, comparison, /*descending*/ true, this._ordered));
    }
}

/**
 * Describes an object that defines the relationships between parents and children of an element.
 */
export interface HierarchyProvider<T> {
    /**
     * Gets the parent element for the supplied element.
     *
     * @param element The current element.
     */
    parent(element: T): T;

    /**
     * Gets the children elements for the supplied element.
     *
     * @param element The current element.
     */
    children(element: T): Queryable<T>;
}

/**
 * Represents a sequence of hierarchically organized values.
 */
export class HierarchyQuery<T> extends Query<T> {
    public readonly hierarchy: HierarchyProvider<T>;
    /*@internal*/ _view: HierarchyProviderView<T>;

    constructor(source: Queryable<T>, hierarchy: HierarchyProvider<T>) {
        Assert.mustBeQueryable(source, "source");
        Assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
        super(source);
        this._view = GetView(hierarchy);
        this.hierarchy = this._view.hierarchy;
    }

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    public filter(predicate: (element: T, offset: number) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new FilterIterable(this, predicate), this._view);
    }

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     *
     * @param callback The callback to invoke.
     */
    public do(callback: (element: T, offset: number) => void): Query<T> {
        Assert.mustBeFunction(callback, "callback");
        return new HierarchyQuery(new DoIterable(this, callback), this._view);
    }

    /**
     * Creates a subquery whose elements are in the reverse order.
     */
    public reverse(): HierarchyQuery<T> {
        return new HierarchyQuery(new ReverseIterable(this), this._view);
    }

    /**
     * Creates a subquery containing all elements except the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     */
    public skip(count: number): HierarchyQuery<T> {
        Assert.mustBePositiveFiniteNumber(count, "count");
        return new HierarchyQuery(new SkipIterable(this, count), this._view);
    }

    /**
     * Creates a subquery containing all elements except the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     */
    public skipRight(count: number): HierarchyQuery<T> {
        Assert.mustBePositiveFiniteNumber(count, "count");
        return new HierarchyQuery(new SkipRightIterable(this, count), this._view);
    }

    /**
     * Creates a subquery containing all elements except the first elements that match
     * the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    public skipWhile(predicate: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new SkipWhileIterable(this, predicate), this._view);
    }

    /**
     * Creates a subquery containing the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     */
    public take(count: number): HierarchyQuery<T> {
        Assert.mustBePositiveFiniteNumber(count, "count");
        return new HierarchyQuery(new TakeIterable(this, count), this._view);
    }

    /**
     * Creates a subquery containing the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     */
    public takeRight(count: number): HierarchyQuery<T> {
        Assert.mustBePositiveFiniteNumber(count, "count");
        return new HierarchyQuery(new TakeRightIterable(this, count), this._view);
    }

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    public takeWhile(predicate: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new TakeWhileIterable(this, predicate), this._view);
    }

    /**
     * Creates a subquery for the set intersection of this Query and another Queryable.
     *
     * @param other A Queryable value.
     */
    public intersect(other: Queryable<T>): HierarchyQuery<T> {
        Assert.mustBeQueryable(other, "other");
        return new HierarchyQuery(new IntersectIterable(this, ToIterable(other)), this._view);
    }

    /**
     * Creates a subquery for the set union of this Query and another Queryable.
     *
     * @param other A Queryable value.
     */
    public union(other: Queryable<T>): HierarchyQuery<T> {
        Assert.mustBeQueryable(other, "other");
        return new HierarchyQuery(new UnionIterable(this, ToIterable(other)), this._view);
    }

    /**
     * Creates a subquery for the set difference between this and another Queryable.
     *
     * @param other A Queryable value.
     */
    public except(other: Queryable<T>): HierarchyQuery<T> {
        Assert.mustBeQueryable(other, "other");
        return new HierarchyQuery(new ExceptIterable(this, ToIterable(other)), this._view);
    }

    /**
     * Creates a subquery that concatenates this Query with another Queryable.
     *
     * @param other A Queryable value.
     */
    public concat(other: Queryable<T>): HierarchyQuery<T> {
        Assert.mustBeQueryable(other, "other");
        return new HierarchyQuery(new ConcatIterable(this, ToIterable(other)), this._view);
    }

    /**
     * Creates a subquery that concatenates this Query with another Queryable.
     *
     * @param other A Queryable value.
     */
    public distinct(): HierarchyQuery<T> {
        return new HierarchyQuery(new DistinctIterable(this), this._view);
    }

    /**
     * Creates a subquery for the elements of this Query with the provided value appended to the end.
     *
     * @param value The value to append.
     */
    public append(value: T): HierarchyQuery<T> {
        return new HierarchyQuery(new AppendIterable(this, value), this._view);
    }

    /**
     * Creates a subquery for the elements of this Query with the provided value prepended to the beginning.
     *
     * @param value The value to prepend.
     */
    public prepend(value: T): HierarchyQuery<T> {
        return new HierarchyQuery(new PrependIterable(value, this), this._view);
    }

    /**
     * Creates a subquery for the elements of this Query with the provided range
     * patched into the results.
     *
     * @param start The offset at which to patch the range.
     * @param skipCount The number of elements to skip from start.
     * @param range The range to patch into the result.
     */
    public patch(start: number, skipCount: number, range: Queryable<T>): HierarchyQuery<T> {
        Assert.mustBePositiveFiniteNumber(start, "start");
        Assert.mustBePositiveFiniteNumber(skipCount, "skipCount");
        Assert.mustBeQueryable(range, "range");
        return new HierarchyQuery(new PatchIterable(this, start, skipCount, ToIterable(range)), this._view);
    }

    /**
     * Creates a subquery that contains the provided default value if this Query
     * contains no elements.
     *
     * @param defaultValue The default value.
     */
    public defaultIfEmpty(defaultValue: T): HierarchyQuery<T> {
        return new HierarchyQuery(new DefaultIfEmptyIterable(this, defaultValue), this._view);
    }

    /**
     * Creates an ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    public orderBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<T> {
        if (comparison === undefined) comparison = CompareValues;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(comparison, "comparison");
        return new (<any>OrderedHierarchyQuery)(new OrderedIterable(this, keySelector, comparison, /*descending*/ false, /*parent*/ undefined), this._view);
    }

    /**
     * Creates an ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    public orderByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<T> {
        if (comparison === undefined) comparison = CompareValues;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(comparison, "comparison");
        return new (<any>OrderedHierarchyQuery)(new OrderedIterable(this, keySelector, comparison, /*descending*/ true, /*parent*/ undefined), this._view);
    }

    /**
     * Creates a subquery for the roots of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public root(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.root), this._view);
    }

    /**
     * Creates a subquery for the ancestors of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public ancestors(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.ancestors), this._view);
    }

    /**
     * Creates a subquery for the ancestors of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public ancestorsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.ancestorsAndSelf), this._view);
    }

    /**
     * Creates a subquery for the parents of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public parents(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.parents), this._view);
    }

    /**
     * Creates a subquery for this query.
     *
     * @param predicate A callback used to filter the results.
     */
    public self(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.self), this._view);
    }

    /**
     * Creates a subquery for the siblings of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public siblings(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.siblings), this._view);
    }

    /**
     * Creates a subquery for the siblings of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public siblingsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.siblingsAndSelf), this._view);
    }

    /**
     * Creates a subquery for the siblings before each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public siblingsBeforeSelf(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.siblingsBeforeSelf), this._view);
    }

    /**
     * Creates a subquery for the siblings after each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public siblingsAfterSelf(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.siblingsAfterSelf), this._view);
    }

    /**
     * Creates a subquery for the children of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public children(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.children), this._view);
    }

    /**
     * Creates a subquery for the child of each element at the specified offset. A negative offset
     * starts from the last child.
     *
     * @param offset The offset for the child.
     */
    public nthChild(offset: number) {
        Assert.mustBeInteger(offset, "offset");
        return new HierarchyQuery(new NthChildIterable(this, this._view, offset), this._view);
    }

    /**
     * Creates a subquery for the descendants of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public descendants(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.descendants), this._view);
    }

    /**
     * Creates a subquery for the descendants of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public descendantsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunctionOrUndefined(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, Axis.descendantsAndSelf), this._view);
    }
}

/**
 * Represents an ordered sequence of hierarchically organized values.
 */
export class OrderedHierarchyQuery<T> extends HierarchyQuery<T> {
    /*@internal*/ _ordered: OrderedIterableBase<T>;

    private constructor(source: OrderedIterableBase<T>, hierarchy: HierarchyProvider<T>) {
        Assert.mustBeOrderedIterable(source, "source");
        Assert.mustBeHierarchyProvider(hierarchy, "hierarchically");
        super(source, hierarchy);
        this._ordered = source;
    }

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    public thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<T> {
        if (comparison === undefined) comparison = CompareValues;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(comparison, "comparison");
        return new OrderedHierarchyQuery(new OrderedIterable(this._ordered._source, keySelector, comparison, false, this._ordered), this._view);
    }

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    public thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<T> {
        if (comparison === undefined) comparison = CompareValues;
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(comparison, "comparison");
        return new OrderedHierarchyQuery(new OrderedIterable(this._ordered._source, keySelector, comparison, true, this._ordered), this._view);
    }
}

/**
 * A group of values related by the same key.
 */
export class Grouping<K, V> extends Query<V> {
    /**
     * The key for the group.
     */
    public readonly key: K;

    /**
     * Creates a new Grouping for the specified key.
     *
     * @param key The key for the group.
     * @param items The elements in the group.
     */
    constructor(key: K, items: Queryable<V>) {
        Assert.mustBeQueryable(items, "items");
        super(items);
        this.key = key;
    }
}

/**
 * Represents a collection of Groupings organized by the keys.
 */
export class Lookup<K, V> extends Query<Grouping<K, V>> {
    private _entries: Map<K, Queryable<V>>;

    /**
     * Creates a new Lookup for the provided groups.
     *
     * @param entries A map containing the unique groups of values.
     */
    constructor(entries: Queryable<[K, Queryable<V>]>) {
        Assert.mustBeQueryable(entries, "entries");
        const map = new Map(ToIterable(entries));
        super(new LookupIterable(map, ToGrouping));
        this._entries = map;
    }

    /**
     * Gets the number of unique keys.
     */
    public get size(): number {
        return this._entries.size;
    }

    /**
     *
     * @param key A key.
     * Gets a value indicating whether any group has the provided key.
     */
    public has(key: K): boolean {
        return this._entries.has(key);
    }

    /**
     * Gets the group for the provided key.
     *
     * @param key A key.
     */
    public get(key: K): Query<V> {
        return new Query<V>(this._entries.get(key) || new EmptyIterable<V>());
    }

    /**
     * Creates a Query that maps each group in the Lookup.
     *
     * @param selector A callback used to select results for each group.
     */
    public applyResultSelector<R>(selector: (key: K, elements: Query<V>) => R): Query<R> {
        Assert.mustBeFunction(selector, "selector");
        return new Query(new LookupIterable(this._entries, selector));
    }
}

/**
 * Represents a page of results.
 */
export class Page<T> extends Query<T> {
    /**
     * Gets the page number (zero-based).
     */
    public readonly page: number;

    /**
     * Gets the offset in the source at which the page begins (zero-based).
     */
    public readonly offset: number;

    /**
     * Creates a new Page for the provided elements.
     *
     * @param page The page number (zero-based).
     * @param offset The offset in the source at which the page begins.
     * @param items The elements in the page.
     */
    constructor(page: number, offset: number, items: Queryable<T>) {
        Assert.mustBePositiveInteger(page, "page");
        Assert.mustBePositiveInteger(offset, "offset");
        Assert.mustBeQueryable(items, "items");
        super(items);
        this.page = page;
        this.offset = offset;
    }
}

// Iterables

class EmptyIterable<T> implements Iterable<T> {
    public *[Symbol.iterator](): Iterator<T> {
    }
}

class ArrayLikeIterable<T> implements Iterable<T> {
    private _source: ArrayLike<T>;

    constructor(source: ArrayLike<T>) {
        this._source = source;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        for (let i = 0; i < source.length; ++i) {
            yield source[i];
        }
    }
}

class OnceIterable<T> implements Iterable<T> {
    private _value: T;

    constructor(value: T) {
        this._value = value;
    }

    public *[Symbol.iterator](): Iterator<T> {
        yield this._value;
    }
}

class RepeatIterable<T> implements Iterable<T> {
    private _value: T;
    private _count: number;

    constructor(value: T, count: number) {
        this._value = value;
        this._count = count;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const value = this._value;
        for (let count = this._count; count > 0; --count) {
            yield value;
        }
    }
}

class RangeIterable implements Iterable<number> {
    private _start: number;
    private _end: number;
    private _increment: number;

    constructor(start: number, end: number, increment: number) {
        this._start = start;
        this._end = end;
        this._increment = increment;
    }

    public *[Symbol.iterator](): Iterator<number> {
        const end = this._end;
        const increment = this._increment;
        for (let i = this._start; i <= end; i += increment) {
            yield i;
        }
    }
}

class ReverseRangeIterable implements Iterable<number> {
    private _start: number;
    private _end: number;
    private _increment: number;

    constructor(start: number, end: number, increment: number) {
        this._start = start;
        this._end = end;
        this._increment = increment;
    }

    public *[Symbol.iterator](): Iterator<number> {
        const end = this._end;
        const increment = this._increment;
        for (let i = this._start; i >= end; i -= increment) {
            yield i;
        }
    }
}

class ContinuousIterable<T> implements Iterable<T> {
    private _value: T;

    constructor(value: T) {
        this._value = value;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const value = this._value;
        while (true) {
            yield value;
        }
    }
}

class GenerateIterable<T> implements Iterable<T> {
    private _count: number;
    private _generator: (offset: number) => T;

    constructor(count: number, generator: (offset: number) => T) {
        this._count = count;
        this._generator = generator;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const count = this._count;
        const generator = this._generator;
        for (let i = 0; i < count; i++) {
            yield generator(i);
        }
    }
}

class AppendIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _value: T;

    constructor(source: Iterable<T>, value: T) {
        this._source = source;
        this._value = value;
    }

    public *[Symbol.iterator](): Iterator<T> {
        yield* this._source;
        yield this._value;
    }
}

class PrependIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _value: T;

    constructor(value: T, source: Iterable<T>) {
        this._value = value;
        this._source = source;
    }

    public *[Symbol.iterator](): Iterator<T> {
        yield this._value;
        yield* this._source;
    }
}

class PatchIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _start: number;
    private _skipCount: number;
    private _range: Iterable<T>;

    constructor(source: Iterable<T>, start: number, skipCount: number, range: Iterable<T>) {
        this._source = source;
        this._start = start;
        this._skipCount = skipCount;
        this._range = range;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const start = this._start;
        const skipCount = this._skipCount;
        const range = this._range;
        let offset = 0;
        let iterator = this._source[Symbol.iterator]();
        try {
            // yield the starting elements
            while (iterator !== undefined && offset < start) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                }
                else {
                    yield value;
                    offset++;
                }
            }

            // skip elements to be removed
            while (iterator !== undefined && offset < start + skipCount) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                }
                else {
                    offset++;
                }
            }

            // yield the patched range
            yield* range;

            // yield the remaining elements
            while (iterator !== undefined) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                }
                else {
                    yield value;
                }
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
}

class ConsumeIterable<T> implements Iterable<T> {
    private _source: Iterator<T>;

    constructor(source: Iterator<T>) {
        this._source = source;
    }

    public *[Symbol.iterator](): Iterator<T> {
        if (this._source === undefined) {
            return;
        }

        try {
            while (this._source !== undefined) {
                const result = this._source.next(), done = result.done, value = result.value;
                if (done) {
                    this._source = undefined;
                    return;
                }

                yield value;
            }
        }
        finally {
            const source = this._source;
            this._source = undefined;
            IteratorClose(source);
        }
    }
}

class IfIterable<T> implements Iterable<T> {
    private _condition: () => boolean;
    private _thenIterable: Iterable<T>;
    private _elseIterable: Iterable<T>;

    constructor(condition: () => boolean, thenIterable: Iterable<T>, elseIterable: Iterable<T>) {
        this._condition = condition;
        this._thenIterable = thenIterable;
        this._elseIterable = elseIterable;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const condition = this._condition;
        const iterable = condition() ? this._thenIterable : this._elseIterable;
        yield* iterable;
    }
}

class ChooseIterable<K, T> implements Iterable<T> {
    private _chooser: () => K;
    private _choices: Lookup<K, T>;
    private _otherwise: Iterable<T>;

    constructor(chooser: () => K, choices: Iterable<[K, Queryable<T>]>, otherwise: Iterable<T>) {
        this._chooser = chooser;
        this._choices = new Lookup(choices);
        this._otherwise = otherwise;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const chooser = this._chooser;
        const choices = this._choices;
        const otherwise = this._otherwise;
        const choice = chooser();
        if (choices.has(choice)) {
            yield* choices.get(choice);
        }
        else if (otherwise) {
            yield* otherwise;
        }
    }
}

class FilterIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _predicate: (element: T, offset: number) => boolean;

    constructor(source: Iterable<T>, predicate: (element: T, offset: number) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const predicate = this._predicate;
        let offset = 0;
        for (const element of source) {
            if (predicate(element, offset++)) {
                yield element;
            }
        }
    }
}

class MapIterable<T, U> implements Iterable<U> {
    private _source: Iterable<T>;
    private _selector: (element: T, offset: number) => U;

    constructor(source: Iterable<T>, selector: (element: T, offset: number) => U) {
        this._source = source;
        this._selector = selector;
    }

    public *[Symbol.iterator](): Iterator<U> {
        const source = this._source;
        const selector = this._selector;
        let offset = 0;
        for (const element of source) {
            yield selector(element, offset++);
        }
    }
}

class FlatMapIterable<T, U> implements Iterable<U> {
    private _source: Iterable<T>;
    private _projection: (element: T) => Queryable<U>;

    constructor(source: Iterable<T>, projection: (element: T) => Queryable<U>) {
        this._source = source;
        this._projection = projection;
    }

    public *[Symbol.iterator](): Iterator<U> {
        const source = this._source;
        const projection = this._projection;
        for (const element of source) {
            yield* ToIterable(projection(element));
        }
    }
}

class ExpandIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _projection: (element: T) => Queryable<T>;

    constructor(source: Iterable<T>, projection: (element: T) => Queryable<T>) {
        this._source = source;
        this._projection = projection;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const projection = this._projection;
        const queue: Iterable<T>[] = [this._source];
        while (queue.length) {
            const source = queue.shift();
            for (const element of source) {
                queue.push(ToIterable(projection(element)));
                yield element;
            }
        }
    }
}

class DoIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _callback: (element: T, offset: number) => void;

    constructor(source: Iterable<T>, callback: (element: T, offset: number) => void) {
        this._source = source;
        this._callback = callback;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const callback = this._callback;
        let offset = 0;
        for (const element of source) {
            callback(element, offset++);
            yield element;
        }
    }
}

class ReverseIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;

    constructor(source: Iterable<T>) {
        this._source = source;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const list = Array.from<T>(this._source);
        for (let i = list.length - 1; i >= 0; --i) {
            yield list[i];
        }
    }
}

class SkipIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _count: number;

    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        let remaining = this._count;
        if (remaining <= 0) {
            yield* source;
        }
        else {
            for (const element of source) {
                if (remaining > 0) {
                    remaining--;
                }
                else {
                    yield element;
                }
            }
        }
    }
}

class SkipRightIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _count: number;

    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const pending: T[] = [];
        const count = this._count;
        if (count <= 0) {
            yield* source;
        }
        else {
            for (const element of source) {
                pending.push(element);
                if (pending.length > count) {
                    yield pending.shift();
                }
            }
        }
    }
}

class SkipWhileIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _predicate: (element: T) => boolean;

    constructor(source: Iterable<T>, predicate: (element: T) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const predicate = this._predicate;
        let skipping = true;
        for (const element of source) {
            if (skipping) {
                skipping = predicate(element);
            }
            if (!skipping) {
                yield element;
            }
        }
    }
}

class TakeIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _count: number;

    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        let remaining = this._count;
        if (remaining > 0) {
            for (const element of source) {
                yield element;
                if (--remaining <= 0) {
                    break;
                }
            }
        }
    }
}

class TakeRightIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _count: number;

    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const pending: T[] = [];
        const count = this._count;
        if (count <= 0) {
            return;
        }
        else {
            for (const element of source) {
                pending.push(element);
                if (pending.length > count) {
                    pending.shift();
                }
            }

            yield* pending;
        }
    }
}

class TakeWhileIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _predicate: (element: T) => boolean;

    constructor(source: Iterable<T>, predicate: (element: T) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const predicate = this._predicate;
        for (const element of source) {
            if (!predicate(element)) {
                break;
            }

            yield element;
        }
    }
}

class IntersectIterable<T> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;

    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const left = this._left;
        const right = this._right;
        const set = new Set(right);
        if (set.size <= 0) {
            return;
        }

        for (const element of left) {
            if (set.delete(element)) {
                yield element;
            }
        }
    }
}

class UnionIterable<T> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;

    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const left = this._left;
        const right = this._right;
        const set = new Set<T>();
        for (const element of left) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }

        for (const element of right) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
    }
}

class ExceptIterable<T> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;

    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const left = this._left;
        const right = this._right;
        const set = new Set<T>(right);
        for (const element of left) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
    }
}

class DistinctIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;

    constructor(source: Iterable<T>) {
        this._source = source;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const set = new Set<T>();
        for (const element of source) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
    }
}

class ConcatIterable<T> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;

    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }

    public *[Symbol.iterator](): Iterator<T> {
        yield* this._left;
        yield* this._right;
    }
}

class ZipIterable<T, U, R> implements Iterable<R> {
    private _left: Iterable<T>;
    private _right: Iterable<U>;
    private _selector: (left: T, right: U) => R;

    constructor(left: Iterable<T>, right: Iterable<U>, selector: (left: T, right: U) => R) {
        this._left = left;
        this._right = right;
        this._selector = selector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const left = this._left;
        const right = this._right;
        const selector = this._selector;
        let leftIterator = left[Symbol.iterator]();
        try {
            let rightIterator = right[Symbol.iterator]();
            try {
                while (true) {
                    const leftResult = leftIterator.next(), leftDone = leftResult.done, leftValue = leftResult.value;
                    const rightResult = rightIterator.next(), rightDone = rightResult.done, rightValue = rightResult.value;
                    if (leftDone) {
                        leftIterator = undefined;
                    }

                    if (rightDone) {
                        rightIterator = undefined;
                    }

                    if (leftDone || rightDone) {
                        break;
                    }

                    yield selector(leftValue, rightValue);
                }
            }
            finally {
                IteratorClose(rightIterator);
            }
        }
        finally {
            IteratorClose(leftIterator);
        }
    }
}

abstract class OrderedIterableBase<T> implements Iterable<T> {
    /*@internal*/ readonly _source: Iterable<T>;

    constructor(source: Iterable<T>) {
        this._source = source;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const array = Array.from<T>(source);
        const sorter = this._getSorter(array);
        const len = array.length;
        const indices = new Array<number>(len);
        for (let i = 0; i < len; ++i) {
            indices[i] = i;
        }

        indices.sort(sorter);
        for (const index of indices) {
            yield array[index];
        }
    }

    /*@internal*/ abstract _getSorter(elements: T[], next?: (x: number, y: number) => number): (x: number, y: number) => number;
}

class OrderedIterable<T, K> extends OrderedIterableBase<T> {
    private _keySelector: (element: T) => K;
    private _comparison: (x: K, y: K) => number;
    private _descending: boolean;
    private _parent: OrderedIterableBase<T>;

    constructor(source: Iterable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean, parent: OrderedIterableBase<T>) {
        super(source);
        this._keySelector = keySelector;
        this._comparison = comparison;
        this._descending = descending;
        this._parent = parent;
    }

    /*@internal*/ _getSorter(elements: T[], next?: (x: number, y: number) => number): (x: number, y: number) => number {
        const keySelector = this._keySelector;
        const comparison = this._comparison;
        const descending = this._descending;
        const parent = this._parent;
        const len = elements.length;
        const keys = elements.map(keySelector);
        const sorter = (x: number, y: number): number => {
            const result = comparison(keys[x], keys[y]);
            if (result === 0) {
                return next ? next(x, y) : x - y;
            }

            return descending ? -result : result;
        };

        return parent ? parent._getSorter(elements, sorter) : sorter;
    }
}

class SpanMapIterable<T, K, V, R> implements Iterable<R> {
    private _source: Iterable<T>;
    private _keySelector: (element: T) => K;
    private _elementSelector: (element: T) => V;
    private _spanSelector: (key: K, elements: Query<V>) => R;

    constructor(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, spanSelector: (key: K, elements: Query<V>) => R) {
        this._source = source;
        this._keySelector = keySelector;
        this._elementSelector = elementSelector;
        this._spanSelector = spanSelector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const source = this._source;
        const keySelector = this._keySelector;
        const elementSelector = this._elementSelector;
        const spanSelector = this._spanSelector;
        let span: V[];
        let hasElements = false;
        let previousKey: K;
        for (const element of source) {
            const key = keySelector(element);
            if (!hasElements) {
                previousKey = key;
                hasElements = true;
                span = [];
            }
            else if (!SameValue(previousKey, key)) {
                yield spanSelector(previousKey, new Query(span));
                span = [];
                previousKey = key;
            }

            span.push(elementSelector(element));
        }

        if (span) {
            yield spanSelector(previousKey, new Query(span));
        }
    }
}

class GroupByIterable<T, K, V, R> implements Iterable<R> {
    private _source: Iterable<T>;
    private _keySelector: (element: T) => K;
    private _elementSelector: (element: T) => V;
    private _resultSelector: (key: K, elements: Query<V>) => R;

    constructor(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R) {
        this._source = source;
        this._keySelector = keySelector;
        this._elementSelector = elementSelector;
        this._resultSelector = resultSelector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const source = this._source;
        const keySelector = this._keySelector;
        const elementSelector = this._elementSelector;
        const resultSelector = this._resultSelector;
        const map = CreateGroupings(source, keySelector, elementSelector);
        for (const element of map) {
            const key = element[0], values = element[1];
            yield resultSelector(key, new Query<V>(values));
        }
    }
}

class GroupJoinIterable<O, I, K, R> implements Iterable<R> {
    private _outer: Iterable<O>;
    private _inner: Iterable<I>;
    private _outerKeySelector: (element: O) => K;
    private _innerKeySelector: (element: I) => K;
    private _resultSelector: (outer: O, inner: Query<I>) => R;

    constructor(outer: Iterable<O>, inner: Iterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: Query<I>) => R) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const outer = this._outer;
        const inner = this._inner;
        const outerKeySelector = this._outerKeySelector;
        const innerKeySelector = this._innerKeySelector;
        const resultSelector = this._resultSelector;
        const map = CreateGroupings(inner, innerKeySelector, Identity);
        for (const outerElement of outer) {
            const outerKey = outerKeySelector(outerElement);
            const innerElements = map.has(outerKey) ? <Iterable<I>>map.get(outerKey) : new EmptyIterable<I>();
            yield resultSelector(outerElement, new Query<I>(innerElements));
        }
    }
}

class JoinIterable<O, I, K, R> implements Iterable<R> {
    private _outer: Iterable<O>;
    private _inner: Iterable<I>;
    private _outerKeySelector: (element: O) => K;
    private _innerKeySelector: (element: I) => K;
    private _resultSelector: (outer: O, inner: I) => R;

    constructor(outer: Iterable<O>, inner: Iterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: I) => R) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const outer = this._outer;
        const inner = this._inner;
        const outerKeySelector = this._outerKeySelector;
        const innerKeySelector = this._innerKeySelector;
        const resultSelector = this._resultSelector;
        const map = CreateGroupings(inner, innerKeySelector, Identity);
        for (const outerElement of outer) {
            const outerKey = outerKeySelector(outerElement);
            const innerElements = map.get(outerKey);
            if (innerElements != undefined) {
                for (const innerElement of innerElements) {
                    yield resultSelector(outerElement, innerElement);
                }
            }
        }
    }
}

class ScanIterable<T, U> implements Iterable<T | U> {
    private _source: Iterable<T>;
    private _aggregator: (aggregate: T | U, element: T, offset: number) => T | U;
    private _isSeeded: boolean;
    private _seed: T | U;

    constructor(source: Iterable<T>, aggregator: (aggregate: T | U, element: T, offset: number) => U, isSeeded: boolean, seed: U) {
        this._source = source;
        this._aggregator = aggregator;
        this._isSeeded = isSeeded;
        this._seed = seed;
    }

    public *[Symbol.iterator](): Iterator<T | U> {
        const aggregator = this._aggregator;
        let isSeeded = this._isSeeded;
        let aggregate = this._seed;
        let iterator = this._source[Symbol.iterator]();
        let offset = 0;
        try {
            while (true) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                    break;
                }

                if (!isSeeded) {
                    aggregate = value;
                    isSeeded = true;
                    offset++;
                    continue;
                }

                aggregate = aggregator(aggregate, value, offset);
                yield aggregate;
                offset++;
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
}

class ScanRightIterable<T, U> implements Iterable<T | U> {
    private _source: Iterable<T>;
    private _aggregator: (aggregate: T | U, element: T, offset: number) => T | U;
    private _isSeeded: boolean;
    private _seed: T | U;

    constructor(source: Iterable<T>, aggregator: (aggregate: T | U, element: T, offset: number) => U, isSeeded: boolean, seed: U) {
        this._source = source;
        this._aggregator = aggregator;
        this._isSeeded = isSeeded;
        this._seed = seed;
    }

    public *[Symbol.iterator](): Iterator<T | U> {
        const source = Array.from(this._source);
        const aggregator = this._aggregator;
        let isSeeded = this._isSeeded;
        let aggregate = this._seed;
        for (let offset = source.length - 1; offset >= 0; offset--) {
            const value = source[offset];
            if (!isSeeded) {
                aggregate = value;
                isSeeded = true;
                continue;
            }

            aggregate = aggregator(aggregate, value, offset);
            yield aggregate;
        }
    }
}

class LookupIterable<K, V, R> implements Iterable<R> {
    private _map: Map<K, Queryable<V>>;
    private _selector: (key: K, elements: Query<V>) => R;

    constructor(map: Map<K, Queryable<V>>, selector: (key: K, elements: Query<V>) => R) {
        this._map = map;
        this._selector = selector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const map = this._map;
        const selector = this._selector;
        for (const element of map) {
            const key = element[0], values = element[1];
            yield selector(key, new Query<V>(values));
        }
    }
}

class DefaultIfEmptyIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _defaultValue: T;

    constructor(source: Iterable<T>, defaultValue: T) {
        this._source = source;
        this._defaultValue = defaultValue;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const defaultValue = this._defaultValue;
        let iterator = source[Symbol.iterator]();
        let hasElements = false;
        try {
            while (true) {
                const iterResult = iterator.next();
                if (iterResult.done) {
                    iterator = undefined;
                    if (!hasElements) {
                        yield defaultValue;
                    }

                    return;
                }
                else {
                    hasElements = true;
                    yield iterResult.value;
                }
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
}

class PageByIterable<T> implements Iterable<Page<T>> {
    private _source: Iterable<T>;
    private _pageSize: number;

    constructor(source: Iterable<T>, pageSize: number) {
        this._source = source;
        this._pageSize = pageSize;
    }

    public *[Symbol.iterator](): Iterator<Page<T>> {
        const pageSize = this._pageSize;
        let iterator = this._source[Symbol.iterator]();
        try {
            let elements: T[] = [];
            let page = 0;
            while (true) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                    break;
                }

                elements.push(value);
                if (elements.length >= pageSize) {
                    yield new Page(page, page * pageSize, elements);
                    elements = [];
                    page++;
                }
            }

            if (elements.length > 0) {
                yield new Page(page, page * pageSize, elements);
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
}

class HierarchyProviderView<T> {
    public hierarchy: HierarchyProvider<T>;

    constructor (hierarchy: HierarchyProvider<T>) {
        Assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
        this.hierarchy = hierarchy;
    }

    public root(element: T) {
        if (element !== undefined) {
            let root: T;
            for (const ancestor of this.ancestors(element, /*self*/ true)) {
                root = ancestor;
            }

            return root;
        }

        return undefined;
    }

    public * ancestors(element: T, self: boolean) {
        Assert.mustBeBoolean(self, "self");
        if (element !== undefined) {
            let ancestor = self ? element : this.parent(element);
            while (ancestor !== undefined) {
                yield ancestor;
                ancestor = this.parent(ancestor);
            }
        }
    }

    public parent(element: T) {
        if (element !== undefined) {
            return this.hierarchy.parent(element);
        }

        return undefined;
    }

    public * children(element: T) {
        if (element !== undefined) {
            const children = this.hierarchy.children(element);
            if (children !== undefined) {
                for (const child of ToIterable(children)) {
                    if (child !== undefined) {
                        yield child;
                    }
                }
            }
        }
    }

    public nthChild(element: T, offset: number) {
        Assert.mustBeInteger(offset, "offset");
        if (element !== undefined) {
            const children = this.children(element);
            return Query.from(children).elementAt(offset);
        }

        return undefined;
    }

    public * siblings(element: T, self: boolean) {
        Assert.mustBeBoolean(self, "self");
        const parent = this.parent(element);
        if (parent !== undefined) {
            for (const child of this.children(parent)) {
                if (self || !SameValue(child, element)) {
                    yield child;
                }
            }
        }
    }

    public * siblingsBeforeSelf(element: T) {
        for (const sibling of this.siblings(element, /*self*/ true)) {
            if (SameValue(sibling, element)) {
                return;
            }

            yield sibling;
        }
    }

    public * siblingsAfterSelf(element: T) {
        let hasSeenSelf: boolean;
        for (const sibling of this.siblings(element, /*self*/ true)) {
            if (hasSeenSelf) {
                yield sibling;
            }
            else {
                hasSeenSelf = SameValue(sibling, element);
            }
        }
    }

    // NOTE: Currently disabled as View is not public and these are inefficient.
    //
    // public firstChild(element: T) {
    //     if (element !== undefined) {
    //         for (const child of this.children(element)) {
    //             return child;
    //         }
    //     }

    //     return undefined;
    // }

    // public lastChild(element: T) {
    //     if (element !== undefined) {
    //         let lastChild: T;
    //         for (const child of this.children(element)) {
    //             lastChild = child;
    //         }

    //         return lastChild;
    //     }

    //     return undefined;
    // }

    // public previousSibling(element: T) {
    //     if (element !== undefined) {
    //         let previousSibling: T;
    //         for (const sibling of this.siblings(element, /*self*/ true)) {
    //             if (SameValue(sibling, element)) {
    //                 return previousSibling;
    //             }

    //             previousSibling = sibling;
    //         }
    //     }

    //     return undefined;
    // }

    // public nextSibling(element: T) {
    //     if (element !== undefined) {
    //         let hasSeenSelf: boolean;
    //         for (const sibling of this.siblings(element, /*self*/ true)) {
    //             if (hasSeenSelf) {
    //                 return sibling;
    //             }

    //             if (SameValue(sibling, element)) {
    //                 hasSeenSelf = true;
    //             }
    //         }
    //     }

    //     return undefined;
    // }

    public * descendants(element: T, self: boolean): IterableIterator<T> {
        Assert.mustBeBoolean(self, "self");
        if (element !== undefined) {
            if (self) {
                yield element;
            }

            for (const child of this.children(element)) {
                yield* this.descendants(child, /*self*/ true);
            }
        }
    }
}

class NthChildIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _hierarchy: HierarchyProviderView<T>;
    private _offset: number;

    constructor(source: Iterable<T>, hierarchy: HierarchyProviderView<T>, offset: number) {
        this._source = source;
        this._hierarchy = hierarchy;
        this._offset = offset;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const hierarchy = this._hierarchy;
        const offset = this._offset;
        for (const element of source) {
            const child = hierarchy.nthChild(element, offset);
            if (child !== undefined) {
                yield child;
            }
        }
    }
}

class HierarchyAxisIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _hierarchy: HierarchyProviderView<T>;
    private _predicate: (element: T) => boolean;
    private _axis: (provider: HierarchyProviderView<T>, element: T) => Iterable<T>;
    constructor(source: Iterable<T>, hierarchy: HierarchyProviderView<T>, predicate: (element: T) => boolean, axis: (provider: HierarchyProviderView<T>, element: T) => Iterable<T>) {
        this._source = source;
        this._hierarchy = hierarchy;
        this._predicate = predicate;
        this._axis = axis;
    }
    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const hierarchy = this._hierarchy;
        const predicate = this._predicate;
        const axis = this._axis;
        for (const element of source) {
            for (const related of axis(hierarchy, element)) {
                if (!predicate || predicate(related)) {
                    yield related;
                }
            }
        }
    }
}

namespace Axis {
    export function* root<T>(provider: HierarchyProviderView<T>, element: T) {
        const root = provider.root(element);
        if (root !== undefined) {
            yield provider.root(element);
        }
    }
    export function ancestors<T>(provider: HierarchyProviderView<T>, element: T) {
        return provider.ancestors(element, false);
    }
    export function ancestorsAndSelf<T>(provider: HierarchyProviderView<T>, element: T) {
        return provider.ancestors(element, true);
    }
    export function* parents<T>(provider: HierarchyProviderView<T>, element: T) {
        const parent = provider.parent(element);
        if (parent !== undefined) {
            yield provider.parent(element);
        }
    }
    export function* self<T>(provider: HierarchyProviderView<T>, element: T) {
        if (element !== undefined) {
            yield element;
        }
    }
    export function siblings<T>(provider: HierarchyProviderView<T>, element: T) {
        return provider.siblings(element, false);
    }
    export function siblingsAndSelf<T>(provider: HierarchyProviderView<T>, element: T) {
        return provider.siblings(element, true);
    }
    export function siblingsBeforeSelf<T>(provider: HierarchyProviderView<T>, element: T) {
        return provider.siblingsBeforeSelf(element);
    }
    export function siblingsAfterSelf<T>(provider: HierarchyProviderView<T>, element: T) {
        return provider.siblingsAfterSelf(element);
    }
    export function children<T>(provider: HierarchyProviderView<T>, element: T) {
        return provider.children(element);
    }
    export function descendants<T>(provider: HierarchyProviderView<T>, element: T) {
        return provider.descendants(element, false);
    }
    export function descendantsAndSelf<T>(provider: HierarchyProviderView<T>, element: T) {
        return provider.descendants(element, true);
    }
}

function Identity<T>(x: T): T {
    return x;
}

function CompareValues<T>(x: T, y: T): number {
    if (x < y) {
        return -1;
    }
    else if (x > y) {
        return +1;
    }
    return 0;
}

function MakeTuple<T, U>(x: T, y: U): [T, U] {
    return [x, y];
}

function IsObject(x: any): boolean {
    return x !== null && (typeof x === "object" || typeof x === "function");
}

function IsArrayLike<T>(x: Queryable<T>): x is ArrayLike<T>;
function IsArrayLike(x: any): x is ArrayLike<any>;
function IsArrayLike(x: any): x is ArrayLike<any> {
    return x !== null && typeof x === "object" && typeof x.length === "number";
}

function IsIterable<T>(x: Queryable<T>): x is Iterable<T>;
function IsIterable(x: any): x is Iterable<any>;
function IsIterable(x: any): x is Iterable<any> {
    return IsObject(x) && Symbol.iterator in x;
}

function IsOrderedIterable<T>(source: Iterable<T>): source is OrderedIterableBase<T> {
    return source instanceof OrderedIterableBase;
}

function IteratorClose<T>(iterator: Iterator<T>): IteratorResult<T> {
    if (iterator !== undefined) {
        const close = iterator.return;
        if (typeof close === "function") {
            return close.call(iterator);
        }
    }
}

function CreateGroupings<T, K, V>(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Map<K, V[]> {
    const map = new Map<K, V[]>();
    for (let item of source) {
        let key = keySelector(item);
        let element = elementSelector(item);
        let grouping = map.get(key);
        if (grouping == null) {
            grouping = [];
            map.set(key, grouping);
        }
        grouping.push(element);
    }
    return map;
}

function ToIterable<T>(queryable: Queryable<T>): Iterable<T> {
    return IsIterable(queryable) ? queryable : new ArrayLikeIterable(queryable);
}

function ToGrouping<K, V>(key: K, elements: Iterable<V>): Grouping<K, V> {
    return new Grouping<K, V>(key, elements);
}

function SameValue(x: any, y: any): boolean {
    return (x === y) ? (x !== 0 || 1 / x === 1 / y) : (x !== x && y !== y);
}

function GetView<T>(hierarchy: HierarchyProvider<T>) {
    return hierarchy instanceof HierarchyProviderView
        ? hierarchy
        : new HierarchyProviderView(hierarchy);
}

namespace Assert {
    interface ErrorConstructorWithStackTraceApi extends ErrorConstructor {
        captureStackTrace(target: any, stackCrawlMark?: Function): void;
    }

    declare const Error: ErrorConstructorWithStackTraceApi;

    function assertType(condition: boolean, paramName: string, message: string, stackCrawlMark: Function) {
        if (!condition) {
            const error = new TypeError();
            if (stackCrawlMark && Error.captureStackTrace) {
                Error.captureStackTrace(error, stackCrawlMark || assertType);
            }

            throw error;
        }
    }

    function assertRange(condition: boolean, paramName: string, message: string, stackCrawlMark: Function) {
        if (!condition) {
            const error = new RangeError();
            if (stackCrawlMark && Error.captureStackTrace) {
                Error.captureStackTrace(error, stackCrawlMark || assertType);
            }

            throw error;
        }
    }

    export function mustBeBoolean(value: boolean, paramName: string, message?: string) {
        assertType(typeof value === "boolean", paramName, message, mustBeBoolean);
    }

    export function mustBeNumber(value: number, paramName: string, message?: string, stackCrawlMark?: Function) {
        assertType(typeof value === "number", paramName, message, stackCrawlMark || mustBeNumber);
    }

    export function mustBeObject(value: any, paramName: string, message?: string, stackCrawlMark?: Function) {
        assertType(IsObject(value), paramName, message, stackCrawlMark || mustBeObject);
    }

    export function mustBeObjectOrNull(value: any, paramName: string, message?: string) {
        assertType(IsObject(value) || value === null, paramName, message, mustBeObjectOrNull);
    }

    export function mustBeFunction(value: Function, paramName: string, message?: string, stackCrawlMark?: Function) {
        assertType(typeof value === "function", paramName, message, stackCrawlMark || mustBeFunction);
    }

    export function mustBeFunctionOrUndefined(value: Function, paramName: string, message?: string, stackCrawlMark?: Function) {
        assertType(typeof value === "function" || typeof value === "undefined", paramName, message, stackCrawlMark || mustBeFunctionOrUndefined);
    }

    export function mustBeFiniteNumber(value: number, paramName: string, message?: string) {
        mustBeNumber(value, paramName, message, mustBeFiniteNumber);
        assertRange(isFinite(value), paramName, message, mustBeFiniteNumber);
    }

    export function mustBePositiveFiniteNumber(value: number, paramName: string, message?: string) {
        mustBeNumber(value, paramName, message, mustBePositiveFiniteNumber);
        assertRange(isFinite(value) && value >= 0, paramName, message, mustBePositiveFiniteNumber);
    }

    export function mustBePositiveNonZeroFiniteNumber(value: number, paramName: string, message?: string) {
        mustBeNumber(value, paramName, message, mustBePositiveNonZeroFiniteNumber);
        assertRange(isFinite(value) && value > 0, paramName, message, mustBePositiveNonZeroFiniteNumber);
    }

    export function mustBeInteger(value: number, paramName: string, message?: string) {
        mustBeNumber(value, paramName, message, mustBeInteger);
        assertType(SameValue(value, value | 0), paramName, message, mustBeInteger);
    }

    export function mustBePositiveInteger(value: number, paramName: string, message?: string) {
        mustBeNumber(value, paramName, message, mustBePositiveInteger);
        assertType(SameValue(value, value | 0), paramName, message, mustBeInteger);
        assertRange(value >= 0, paramName, message, mustBePositiveInteger);
    }

    export function mustBeIterator<T>(value: Iterator<T>, paramName: string, message?: string) {
        mustBeObject(value, paramName, message, mustBeIterator);
        mustBeFunction(value.next, paramName, message, mustBeIterator);
        mustBeFunctionOrUndefined(value.return, paramName, message, mustBeIterator);
    }

    export function mustBeQueryable<T>(value: Queryable<T>, paramName: string, message?: string) {
        mustBeObject(value, paramName, message, mustBeQueryable);
        assertType(IsArrayLike(value) || IsIterable(value), paramName, message, mustBeQueryable);
    }

    export function mustBeQueryableOrUndefined<T>(value: Queryable<T>, paramName: string, message?: string) {
        if (value === undefined) return;
        mustBeObject(value, paramName, message, mustBeQueryableOrUndefined);
        assertType(IsArrayLike(value) || IsIterable(value), paramName, message, mustBeQueryableOrUndefined);
    }

    export function mustBeHierarchyProvider<T>(value: HierarchyProvider<T>, paramName: string, message?: string) {
        mustBeObject(value, paramName, message, mustBeHierarchyProvider);
        mustBeFunction(value.parent, paramName, message, mustBeHierarchyProvider);
        mustBeFunction(value.children, paramName, message, mustBeHierarchyProvider);
    }

    export function mustBeOrderedIterable<T>(value: OrderedIterableBase<T>, paramName: string, message?: string) {
        assertType(IsOrderedIterable(value), paramName, message, mustBeOrderedIterable);
    }
}

declare global {
    interface ArrayConstructor {
        /**
          * Creates an array from an array-like object.
          * @param arrayLike An array-like object to convert to an array.
          */
        from<T>(arrayLike: Queryable<T>): Array<T>;
    }
}