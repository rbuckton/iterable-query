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

import { iterator, GetIterator, NextResult, DoneResult, IteratorClose, IsObject, IsArrayLike, IsIterable, IsIterableShim, SameValue } from "./utils";
import { Map, Set, WeakMap } from "./collections";

declare var Symbol: any;

export interface Iterable<T> {
    __iterator__(): Iterator<T>;
}

export interface Iterator<T> {
    next(value?: any): IteratorResult<T>;
    throw?(value?: any): IteratorResult<T>;
    return?(value?: any): IteratorResult<T>;
}

export interface IterableIterator<T> extends Iterator<T> {
    __iterator__(): IterableIterator<T>;
}

export interface IteratorResult<T> {
    value?: T;
    done: boolean;
}

export interface ES6ShimIterable<T> {
    "_es6-shim iterator_"(): Iterator<T>;
}

/**
 * Represents an object that is either iterable or array-like.
 */
export type Queryable<T> = Iterable<T> | ES6ShimIterable<T> | ArrayLike<T>;

/**
 * Creates a Query from a Queryable source.
 *
 * @param source The source elements.
 */
export function from<T>(source: OrderedHierarchyQuery<T>): OrderedHierarchyQuery<T>;

/**
 * Creates a Query from a Queryable source.
 *
 * @param source The source elements.
 */
export function from<T>(source: HierarchyQuery<T>): HierarchyQuery<T>;

/**
 * Creates a Query from a Queryable source.
 *
 * @param source The source elements.
 */
export function from<T>(source: OrderedQuery<T>): OrderedQuery<T>;

/**
 * Creates a Query from a Queryable source.
 *
 * @param source The source elements.
 */
export function from<T>(source: Queryable<T>): Query<T>;

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

    public static from<T>(source: OrderedHierarchyQuery<T>): OrderedHierarchyQuery<T>;

    /**
     * Creates a Query from a Queryable source.
     *
     * @param source The Iterable or ArrayLike source.
     */
    public static from<T>(source: HierarchyQuery<T>): HierarchyQuery<T>;

    /**
     * Creates a Query from a Queryable source.
     *
     * @param source The Iterable or ArrayLike source.
     */
    public static from<T>(source: OrderedQuery<T>): OrderedQuery<T>;

    /**
     * Creates a Query from a Queryable source.
     *
     * @param source The Iterable or ArrayLike source.
     */
    public static from<T>(source: Queryable<T>): Query<T>;

    /**
     * Creates a Query from a Queryable source.
     *
     * @param source The Iterable or ArrayLike source.
     */
    public static from<T>(source: Queryable<T>): Query<T> {
        if (source instanceof Query) {
            return source;
        }
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
            return new Query(new RangeIterable(start, end, increment, /*reverse*/ false));
        }
        else {
            return new Query(new RangeIterable(start, end, increment, /*reverse*/ true));
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
    public static objectKeys<T>(source: { [key: string]: T }): Query<string> {
        Assert.mustBeObject(source, "source");
        const keys = Object.keys(source);
        return new Query(keys);
    }

    /**
     * Creates a Query for the own property values of an object.
     *
     * @param source An object.
     */
    public static objectValues<T>(source: { [key: string]: T }): Query<T> {
        Assert.mustBeObject(source, "source");
        const keys = Object.keys(source);
        return new Query(new MapIterable(ToIterable(keys), key => source[key]));
    }

    /**
     * Creates a Query for the own property key-value pairs of an object.
     *
     * @param source An object.
     */
    public static objectEntries<T>(source: { [key: string]: T }): Query<[string, T]> {
        Assert.mustBeObject(source, "source");
        const keys = Object.keys(source);
        return new Query(new MapIterable(ToIterable(keys), key => MakeTuple(key, source[key])));
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
     * Lazily invokes a callback as each element of the query is iterated.
     * This is an alias for `do`.
     *
     * @param callback The callback to invoke.
     */
    public tap(callback: (element: T, offset: number) => void): Query<T> {
        return this.do(callback);
    }

    /**
     * Pass the entire query to the provided callback, creating a new query from the result.
     *
     * @param callback A callback function.
     */
    public through<U>(callback: (query: Query<T>) => Iterable<U>): Query<U> {
        Assert.mustBeFunction(callback, "callback");
        return new Query(callback(this));
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
     * Creates a subquery for the correlated elements of this Query and another Queryable.
     *
     * @param inner A Queryable.
     * @param outerKeySelector A callback used to select the key for an element in this Query.
     * @param innerKeySelector A callback used to select the key for an element in the other Queryable.
     * @param resultSelector A callback used to select the result for the correlated elements.
     */
    public fullJoin<I, K, R>(inner: Queryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T | undefined, inner: I | undefined) => R): Query<R> {
        Assert.mustBeQueryable(inner, "inner");
        Assert.mustBeFunction(outerKeySelector, "outerKeySelector");
        Assert.mustBeFunction(innerKeySelector, "innerKeySelector");
        Assert.mustBeFunction(resultSelector, "resultSelector");
        return new Query(new FullOuterJoinIterable(this, ToIterable(inner), outerKeySelector, innerKeySelector, resultSelector));
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
        let iterator = GetIterator(this);
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
        if (typeof accumulator !== "function") throw new TypeError();
        if (typeof resultSelector !== "function") throw new TypeError();
        const source = ToArray<T>(this._source);
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
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");

        if (predicate === True) {
            if (this._source instanceof ArrayLikeIterable) {
                return (<ArrayLikeIterable<any>>this._source)._source.length;
            }
            if (this._source instanceof Set || this._source instanceof Map) {
                return (<Set<T> | Map<any, any>>this._source).size;
            }
        }

        let count = 0;
        ForOf(this, element => {
            if (predicate(element)) {
                count++;
            }
        });
        return count;
    }

    /**
     * Gets the first element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    public first(predicate?: (element: T) => boolean): T {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");

        const state = ForOf(this, element => {
            if (predicate(element)) {
                return Return(element);
            }
        });

        if (IsReturn(state)) return state.return;
        return undefined;
    }

    /**
     * Gets the last element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    public last(predicate?: (element: T) => boolean): T {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");

        let result: T;
        ForOf(this, element => {
            if (predicate(element)) {
                result = element;
            }
        });

        return result;
    }

    /**
     * Gets the only element in the Query, or returns undefined.
     *
     * @param predicate An optional callback used to match each element.
     */
    public single(predicate?: (element: T) => boolean) {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");

        let hasElements = false;
        let result: T;
        const state = ForOf(this, element => {
            if (predicate(element)) {
                if (hasElements) {
                    return Return(undefined);
                }

                hasElements = true;
                result = element;
            }
        });
        if (IsReturn(state)) return state.return;
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
        Assert.mustBeFunction(comparison, "comparison");

        let hasElements = false;
        let result: T;
        ForOf(this, element => {
            if (!hasElements) {
                result = element;
                hasElements = true;
            }
            else if (comparison(element, result) < 0) {
                result = element;
            }
        });

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
        Assert.mustBeFunction(comparison, "comparison");

        let hasElements = false;
        let result: T;
        ForOf(this, element => {
            if (!hasElements) {
                result = element;
                hasElements = true;
            }
            else if (comparison(element, result) > 0) {
                result = element;
            }
        });
        return result;
    }

    /**
     * Computes a scalar value indicating whether the Query contains any elements,
     * optionally filtering the elements using the supplied callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    public some(predicate?: (element: T) => boolean): boolean {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");

        const state = ForOf(this, element => {
            if (predicate(element)) {
                return Return(true);
            }
        });

        if (IsReturn(state)) return state.return;
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
        const state = ForOf(this, element => {
            if (!predicate(element)) {
                return Return(false);
            }

            hasMatchingElements = true;
        });
        if (IsReturn(state)) return state.return;
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

        let leftIterator = GetIterator(this);
        try {
            let rightIterator = GetIterator(ToIterable(other));
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
        const state = ForOf(this, element => {
            if (SameValue(value, element)) {
                return Return(true);
            }
        })
        if (IsReturn(state)) return state.return;
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

        const right = ToArray(other);
        const numElements = right.length;
        if (numElements <= 0) {
            return true;
        }

        const span: T[] = [];
        let leftIterator = GetIterator(this);
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

        let leftIterator = GetIterator(this);
        try {
            let rightIterator = GetIterator(ToIterable(other));
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

        const right = ToArray(other);
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
            ForOf(this, element => {
                if (array.length >= offset) {
                    array.shift();
                }

                array.push(element);
            });

            return array.length - offset >= 0 ? array[array.length - offset] : undefined;
        }

        const state = ForOf(this, element => {
            if (offset === 0) {
                return Return(element);
            }

            offset--;
        });

        if (IsReturn(state)) return state.return;
        return undefined;
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
        let iterator = GetIterator(this);
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
        let iterator = GetIterator(this);
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
        ForOf(this, element => {
            callback(element, offset++);
        });
    }

    /**
     * Iterates over all of the elements in the query, ignoring the results.
     */
    public drain(): void {
        ForOf(this, element => { });
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
        if (elementSelector === undefined) elementSelector = Identity;
        Assert.mustBeFunction(elementSelector, "elementSelector");
        return ToArray<T, T | V>(this, elementSelector);
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
        ForOf(this, item => {
            const element = elementSelector(item);
            set.add(element);
        });
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
        ForOf(this, item => {
            const key = keySelector(item);
            const element = elementSelector(item);
            map.set(key, element);
        });
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
        Assert.mustBeFunction(keySelector, "keySelector");
        Assert.mustBeFunction(elementSelector, "elementSelector");

        const obj = Object.create(prototype);
        ForOf(this, item => {
            const key = keySelector(item);
            const element = elementSelector(item);
            obj[key] = element;
        });
        return obj;
    }

    public toJSON() : any {
        return this.toArray();
    }

    @iterator
    public __iterator__(): Iterator<T> {
        let iterator: Iterator<T> = null;
        return IterableIterator({
            next: () => {
                if (iterator === undefined) return DoneResult<T>();
                if (iterator === null) iterator = GetIterator(this._source);
                const { value, done } = iterator.next();
                if (done) {
                    iterator = undefined;
                    return DoneResult<T>();
                }

                return NextResult(value);
            },
            return: () => {
                IteratorClose(iterator);
                iterator = undefined;
                return DoneResult<T>();
            }
        });
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
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    public where(predicate: (element: T, offset: number) => boolean): HierarchyQuery<T> {
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new FilterIterable(this, predicate), this._view);
    }

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     *
     * @param callback The callback to invoke.
     */
    public do(callback: (element: T, offset: number) => void): HierarchyQuery<T> {
        Assert.mustBeFunction(callback, "callback");
        return new HierarchyQuery(new DoIterable(this, callback), this._view);
    }

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     * This is an alias for `do`.
     *
     * @param callback The callback to invoke.
     */
    public tap(callback: (element: T, offset: number) => void): HierarchyQuery<T> {
        return this.do(callback);
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
     * Eagerly evaluate the query, returning a new Query
     */
    public eval(): HierarchyQuery<T> {
        return new HierarchyQuery(this.toArray(), this.hierarchy);
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
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.root), this._view);
    }

    /**
     * Creates a subquery for the ancestors of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public ancestors(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.ancestors), this._view);
    }

    /**
     * Creates a subquery for the ancestors of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public ancestorsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.ancestorsAndSelf), this._view);
    }

    /**
     * Creates a subquery for the parents of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public parents(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.parents), this._view);
    }

    /**
     * Creates a subquery for this query.
     *
     * @param predicate A callback used to filter the results.
     */
    public self(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.self), this._view);
    }

    /**
     * Creates a subquery for the siblings of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public siblings(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.siblings), this._view);
    }

    /**
     * Creates a subquery for the siblings of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public siblingsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.siblingsAndSelf), this._view);
    }

    /**
     * Creates a subquery for the siblings before each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public siblingsBeforeSelf(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.siblingsBeforeSelf), this._view);
    }

    /**
     * Creates a subquery for the siblings after each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public siblingsAfterSelf(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.siblingsAfterSelf), this._view);
    }

    /**
     * Creates a subquery for the children of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public children(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.children), this._view);
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
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.descendants), this._view);
    }

    /**
     * Creates a subquery for the descendants of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    public descendantsAndSelf(predicate?: (element: T) => boolean): HierarchyQuery<T> {
        if (predicate === undefined) predicate = True;
        Assert.mustBeFunction(predicate, "predicate");
        return new HierarchyQuery(new HierarchyAxisIterable(this, this._view, predicate, HierarchyAxis.descendantsAndSelf), this._view);
    }

    /**
     * Creates a subquery for the top-most elements. Elements that are a descendant of any other
     * element are removed.
     */
    public topMost(): HierarchyQuery<T> {
        return new HierarchyQuery(new TopMostIterable(this, this._view), this._view);
    }

    /**
     * Creates a subquery for the bottom-most elements. Elements that are an ancestor of any other
     * element are removed.
     */
    public bottomMost(): HierarchyQuery<T> {
        return new HierarchyQuery(new BottomMostIterable(this, this._view), this._view);
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
    @iterator __iterator__() { return new EmptyIterator<T>(); }
}

class EmptyIterator<T> implements IterableIterator<T> {
    next(value?: any) { return DoneResult<T>(); }
    return(value?: any) { return DoneResult<T>(); }
    @iterator __iterator__() { return this; }
}

class IterableShimWrapper<T> implements Iterable<T> {
    _source: ES6ShimIterable<T>;
    constructor(source: ES6ShimIterable<T>) {
        this._source = source;
    }
    @iterator __iterator__() { return this._source["_es6-shim iterator_"](); }
}

class ArrayLikeIterable<T> implements Iterable<T> {
    _source: ArrayLike<T>;
    constructor(source: ArrayLike<T>) {
        this._source = source;
    }
    @iterator __iterator__() { return new ArrayLikeIterator<T>(this); }
}

class ArrayLikeIterator<T> implements IterableIterator<T> {
    private _iterable: ArrayLikeIterable<T>;
    private _offset: number;
    private _state: string;
    constructor (iterable: ArrayLikeIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._offset = 0;
                this._state = "yielding";
            case "yielding":
                if (this._offset < this._iterable._source.length) {
                    return NextResult(this._iterable._source[this._offset++]);
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class OnceIterable<T> implements Iterable<T> {
    _value: T;
    constructor(value: T) {
        this._value = value;
    }
    @iterator __iterator__() { return new OnceIterator<T>(this); }
}

class OnceIterator<T> implements IterableIterator<T> {
    private _iterable: OnceIterable<T>;
    private _state: string;
    constructor(iterable: OnceIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                const value = this._iterable._value;
                this._iterable = undefined;
                this._state = "done";
                return NextResult(value);
            case "done":
                return DoneResult<T>();
        }
    }
    return() {
        switch (this._state) {
            default:
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class RepeatIterable<T> implements Iterable<T> {
    _value: T;
    _count: number;
    constructor(value: T, count: number) {
        this._value = value;
        this._count = count;
    }
    @iterator __iterator__() { return new RepeatIterator<T>(this); }
}

class RepeatIterator<T> implements IterableIterator<T> {
    private _iterable: RepeatIterable<T>;
    private _remainingCount: number;
    private _state: string;
    constructor(iterable: RepeatIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._remainingCount = this._iterable._count;
                this._state = "yielding";
            case "yielding":
                if (this._remainingCount > 0) {
                    this._remainingCount--;
                    return NextResult(this._iterable._value);
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                this._iterable = undefined;
                this._remainingCount = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class RangeIterable implements Iterable<number> {
    _start: number;
    _end: number;
    _increment: number;
    private _reverse: boolean;
    constructor(start: number, end: number, increment: number, reverse: boolean) {
        this._start = start;
        this._end = end;
        this._increment = increment;
        this._reverse = reverse;
    }

    @iterator __iterator__() {
        return this._reverse
            ? new ReverseRangeIterator(this)
            : new RangeIterator(this);
    }
}

class RangeIterator implements IterableIterator<number> {
    private _iterable: RangeIterable;
    private _offset: number;
    private _state: string;
    constructor(iterable: RangeIterable) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._offset = this._iterable._start;
                this._state = "yielding";
            case "yielding":
                if (this._offset <= this._iterable._end) {
                    const value = this._offset;
                    this._offset += this._iterable._increment;
                    return NextResult(value);
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                this._iterable = undefined;
                this._offset = undefined;
                this._state = "done";
            case "done":
                return DoneResult<number>();
        }
    }
    @iterator __iterator__() { return this; }
}

class ReverseRangeIterator implements IterableIterator<number> {
    private _iterable: RangeIterable;
    private _offset: number;
    private _state: string;
    constructor(iterable: RangeIterable) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._offset = this._iterable._start;
                this._state = "yielding";
            case "yielding":
                if (this._offset >= this._iterable._end) {
                    const value = this._offset;
                    this._offset -= this._iterable._increment;
                    return NextResult(value);
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                this._iterable = undefined;
                this._offset = undefined;
                this._state = "done";
            case "done":
                return DoneResult<number>();
        }
    }
    @iterator __iterator__() { return this; }
}

class ContinuousIterable<T> implements Iterable<T> {
    _value: T;
    constructor(value: T) {
        this._value = value;
    }
    @iterator __iterator__() { return new ContinuousIterator<T>(this); }
}

class ContinuousIterator<T> implements IterableIterator<T> {
    private _iterable: ContinuousIterable<T>;
    private _state: string;
    constructor(iterable: ContinuousIterable<T>) {
        this._iterable = iterable;
        this._state = "yielding";
    }
    next() {
        switch (this._state) {
            case "yielding":
                return NextResult(this._iterable._value);
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class GenerateIterable<T> implements Iterable<T> {
    _count: number;
    _generator: (offset: number) => T;
    constructor(count: number, generator: (offset: number) => T) {
        this._count = count;
        this._generator = generator;
    }
    @iterator __iterator__() { return new GenerateIterator<T>(this); }
}

class GenerateIterator<T> implements Iterator<T> {
    private _iterable: GenerateIterable<T>;
    private _offset: number;
    private _state: string;
    constructor(iterable: GenerateIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._offset = 0;
                this._state = "yielding";
            case "yielding":
                if (this._offset < this._iterable._count) {
                    const value = this._offset;
                    this._offset++;
                    return NextResult((void 0, this._iterable._generator)(value));
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                this._iterable = undefined;
                this._offset = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
}

class AppendIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _value: T;
    constructor(source: Iterable<T>, value: T) {
        this._source = source;
        this._value = value;
    }
    @iterator __iterator__() { return new AppendIterator<T>(this); }
}

class AppendIterator<T> implements IterableIterator<T> {
    private _iterable: AppendIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _state: string;
    constructor(iterable: AppendIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._sourceIterator = GetIterator(this._iterable._source);
                this._state = "yieldingSource";
            case "yieldingSource":
                const { value, done } = this._sourceIterator.next();
                if (done) {
                    const value = this._iterable._value;
                    this._sourceIterator = undefined;
                    this._iterable = undefined;
                    this._state = "done";
                    return NextResult(value);
                }
                return NextResult(value);
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class PrependIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _value: T;
    constructor(value: T, source: Iterable<T>) {
        this._value = value;
        this._source = source;
    }
    @iterator __iterator__() { return new PrependIterator<T>(this); }
}

class PrependIterator<T> implements IterableIterator<T> {
    private _iterable: PrependIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _state: string;
    constructor(iterable: PrependIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._state = "yieldedValue";
                return NextResult(this._iterable._value);
            case "yieldedValue":
                this._sourceIterator = GetIterator(this._iterable._source);
                this._state = "yieldingSource";
            case "yieldingSource":
                const { value, done } = this._sourceIterator.next();
                if (done) {
                    this._sourceIterator = undefined;
                    return this.return();
                }
                return NextResult(value);
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class PatchIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _start: number;
    _skipCount: number;
    _range: Iterable<T>;
    constructor(source: Iterable<T>, start: number, skipCount: number, range: Iterable<T>) {
        this._source = source;
        this._start = start;
        this._skipCount = skipCount;
        this._range = range;
    }
    @iterator __iterator__() { return new PatchIterator<T>(this); };
}

class PatchIterator<T> implements IterableIterator<T> {
    private _iterable: PatchIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _rangeIterator: Iterator<T>;
    private _offset: number;
    private _state: string;
    constructor(iterable: PatchIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._offset = 0;
                    this._sourceIterator = GetIterator(this._iterable._source);
                    this._state = "yieldingLeadingSource";
                case "yieldingLeadingSource":
                    if (this._offset < this._iterable._start) {
                        const { value, done } = this._sourceIterator.next();
                        if (!done) {
                            this._offset++;
                            return ok = true, NextResult(value);
                        }
                        this._sourceIterator = undefined;
                    }
                    this._rangeIterator = GetIterator(this._iterable._range);
                    this._state = "yieldingRange";
                case "yieldingRange":
                    const { value, done } = this._rangeIterator.next();
                    if (!done) {
                        return ok = true, NextResult(value);
                    }
                    this._rangeIterator = undefined;
                    if (this._sourceIterator === undefined) {
                        return ok = true, this.return();
                    }
                    this._state = "yieldingTrailingSource";
                case "yieldingTrailingSource":
                    while (true) {
                        const { value, done } = this._sourceIterator.next();
                        if (done) {
                            this._sourceIterator = undefined;
                            break;
                        }
                        if (this._offset < this._iterable._start + this._iterable._skipCount) {
                            this._offset++;
                            continue;
                        }
                        return ok = true, NextResult(value);
                    }
                case "done":
                    return ok = true, this.return();
            }
        }
        finally {
            if (!ok) {
                this.return();
            }
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._rangeIterator);
                IteratorClose(this._sourceIterator);
                this._iterable = undefined;
                this._rangeIterator = undefined;
                this._sourceIterator = undefined;
                this._offset = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class ConsumeIterable<T> implements Iterable<T> {
    private _source: Iterator<T>;
    constructor(source: Iterator<T>) {
        this._source = source;
    }
    @iterator __iterator__(): Iterator<T> { return this._source; }
}

class IfIterable<T> implements Iterable<T> {
    _condition: () => boolean;
    _thenIterable: Iterable<T>;
    _elseIterable: Iterable<T>;
    constructor(condition: () => boolean, thenIterable: Iterable<T>, elseIterable: Iterable<T>) {
        this._condition = condition;
        this._thenIterable = thenIterable;
        this._elseIterable = elseIterable;
    }
    @iterator __iterator__() { return new IfIterator<T>(this); }
}

class ChooseIterable<K, T> implements Iterable<T> {
    _chooser: () => K;
    _choices: Lookup<K, T>;
    _otherwise: Iterable<T>;
    constructor(chooser: () => K, choices: Iterable<[K, Queryable<T>]>, otherwise: Iterable<T>) {
        this._chooser = chooser;
        this._choices = new Lookup(choices);
        this._otherwise = otherwise;
    }
    @iterator __iterator__() { return new ChooseIterator<K, T>(this); }
}

class ChooseIterator<K, T> implements IterableIterator<T> {
    private _iterable: ChooseIterable<K, T>;
    private _iterator: Iterator<T>;
    private _state: string;
    constructor(iterable: ChooseIterable<K, T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                const choice = (void 0, this._iterable._chooser)();
                if (this._iterable._choices.has(choice)) {
                    this._iterator = GetIterator(this._iterable._choices.get(choice));
                }
                else if (this._iterable._otherwise) {
                    this._iterator = GetIterator(this._iterable._otherwise);
                }
                else {
                    return this.return();
                }
                this._state = "yielding";
            case "yielding":
                const { value, done } = this._iterator.next();
                if (!done) {
                    return NextResult(value);
                }
                this._iterator = undefined;
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._iterator);
                this._iterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class IfIterator<T> implements IterableIterator<T> {
    private _iterable: IfIterable<T>;
    private _iterator: Iterator<T>;
    private _state: string;
    constructor(iterable: IfIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._iterator = (void 0, this._iterable._condition)()
                    ? GetIterator(this._iterable._thenIterable)
                    : GetIterator(this._iterable._elseIterable);
                this._state = "yielding";
            case "yielding":
                const { value, done } = this._iterator.next();
                if (!done) {
                    return NextResult(value);
                }
                this._iterator = undefined;
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._iterator);
                this._iterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class FilterIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _predicate: (element: T, offset: number) => boolean;
    constructor(source: Iterable<T>, predicate: (element: T, offset: number) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }
    @iterator __iterator__() { return new FilterIterator<T>(this); }
}

class FilterIterator<T> implements IterableIterator<T> {
    private _iterable: FilterIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _offset: number;
    private _state: string;
    constructor(iterable: FilterIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            while (true) {
                switch (this._state) {
                    case "new":
                        this._sourceIterator = GetIterator(this._iterable._source);
                        this._offset = 0;
                        this._state = "yielding";
                    case "yielding":
                        const { value, done } = this._sourceIterator.next();
                        if (!done) {
                            if ((void 0, this._iterable._predicate)(value, this._offset++)) {
                                return ok = true, NextResult(value);
                            }
                            continue;
                        }
                    case "done":
                        return ok = true, this.return();
                }
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._iterable = undefined;
                this._offset = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class MapIterable<T, U> implements Iterable<U> {
    _source: Iterable<T>;
    _selector: (element: T, offset: number) => U;
    constructor(source: Iterable<T>, selector: (element: T, offset: number) => U) {
        this._source = source;
        this._selector = selector;
    }
    @iterator __iterator__() { return new MapIterator<T, U>(this); }
}

class MapIterator<T, U> implements IterableIterator<U> {
    private _iterable: MapIterable<T, U>;
    private _sourceIterator: Iterator<T>;
    private _offset: number;
    private _state: string;
    constructor(iterable: MapIterable<T, U>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._sourceIterator = GetIterator(this._iterable._source);
                    this._offset = 0;
                    this._state = "yielding";
                case "yielding":
                    const { value, done } = this._sourceIterator.next();
                    if (!done) {
                        const element = (void 0, this._iterable._selector)(value, this._offset++);
                        return ok = true, NextResult(element);
                    }

                case "done":
                    return ok = true, this.return();
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._offset = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<U>();
        }
    }
    @iterator __iterator__() { return this; }
}

class FlatMapIterable<T, U> implements Iterable<U> {
    _source: Iterable<T>;
    _projection: (element: T) => Queryable<U>;
    constructor(source: Iterable<T>, projection: (element: T) => Queryable<U>) {
        this._source = source;
        this._projection = projection;
    }
    @iterator __iterator__() { return new FlatMapIterator<T, U>(this); }
}

class FlatMapIterator<T, U> implements IterableIterator<U> {
    private _iterable: FlatMapIterable<T, U>;
    private _sourceIterator: Iterator<T>;
    private _projectionIterator: Iterator<U>;
    private _state: string;
    constructor(iterable: FlatMapIterable<T, U>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            while (true) {
                switch (this._state) {
                    case "new":
                        this._sourceIterator = GetIterator(this._iterable._source);
                        this._state = "iteratingSource";
                    case "iteratingSource": {
                        const { value, done } = this._sourceIterator.next();
                        if (done) {
                            this._sourceIterator = undefined;
                            return ok = true, this.return();
                        }
                        const elements = (void 0, this._iterable._projection)(value);
                        this._projectionIterator = GetIterator(ToIterable(elements));
                        this._state = "yieldingProjection";
                    }
                    case "yieldingProjection": {
                        const { value, done } = this._projectionIterator.next();
                        if (done) {
                            this._projectionIterator = undefined;
                            this._state = "iteratingSource";
                            continue;
                        }
                        return ok = true, NextResult(value);
                    }
                    case "done":
                        return ok = true, this.return();
                }
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._projectionIterator);
                IteratorClose(this._sourceIterator);
                this._projectionIterator = undefined;
                this._sourceIterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<U>();
        }
    }
    @iterator __iterator__() { return this; }
}

class ExpandIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _projection: (element: T) => Queryable<T>;
    constructor(source: Iterable<T>, projection: (element: T) => Queryable<T>) {
        this._source = source;
        this._projection = projection;
    }
    @iterator __iterator__() { return new ExpandIterator<T>(this); }
}

class ExpandIterator<T> implements IterableIterator<T> {
    private _iterable: ExpandIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _queue: Iterable<T>[];
    private _state: string;
    constructor(iterable: ExpandIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            while (true) {
                switch (this._state) {
                    case "new":
                        this._queue = [this._iterable._source];
                        this._state = "dequeue";
                    case "dequeue":
                        if (this._queue.length) {
                            const source = this._queue.shift();
                            this._sourceIterator = GetIterator(source);
                            this._state = "iteratingSource";
                            continue;
                        }
                    case "done":
                        return ok = true, this.return();
                    case "iteratingSource": {
                        const { value, done } = this._sourceIterator.next();
                        if (done) {
                            this._sourceIterator = undefined;
                            this._state = "dequeue";
                            continue;
                        }
                        this._queue.push(ToIterable((void 0, this._iterable._projection)(value)));
                        return ok = true, NextResult(value);
                    }
                }
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._queue = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class DoIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _callback: (element: T, offset: number) => void;

    constructor(source: Iterable<T>, callback: (element: T, offset: number) => void) {
        this._source = source;
        this._callback = callback;
    }

    @iterator __iterator__() { return new DoIterator<T>(this); }
}

class DoIterator<T> implements IterableIterator<T> {
    private _iterable: DoIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _offset: number;
    private _state: string;
    constructor(iterable: DoIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._sourceIterator = GetIterator(this._iterable._source);
                    this._offset = 0;
                    this._state = "yielding";
                case "yielding":
                    const { value, done } = this._sourceIterator.next();
                    if (!done) {
                        (void 0, this._iterable._callback)(value, this._offset++);
                        return ok = true, NextResult(value);
                    }

                case "done":
                    return ok = true, this.return();
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._offset = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class ReverseIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    constructor(source: Iterable<T>) {
        this._source = source;
    }
    @iterator __iterator__() { return new ReverseIterator<T>(this); }
}

class ReverseIterator<T> implements IterableIterator<T> {
    private _iterable: ReverseIterable<T>;
    private _list: T[];
    private _offset: number;
    private _state: string;
    constructor(iterable: ReverseIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._list = ToArray(this._iterable._source);
                this._iterable = undefined;
                this._offset = this._list.length - 1;
                this._state = "yielding";
            case "yielding":
                if (this._offset >= 0) {
                    return NextResult(this._list[this._offset--]);
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                this._iterable = undefined;
                this._list = undefined;
                this._offset = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class SkipIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _count: number;
    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }
    @iterator __iterator__() { return new SkipIterator<T>(this); }
}

class SkipIterator<T> implements IterableIterator<T> {
    private _iterable: SkipIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _remainingCount: number;
    private _state: string;
    constructor(iterable: SkipIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._sourceIterator = GetIterator(this._iterable._source);
                this._remainingCount = this._iterable._count;
                this._iterable = undefined;
                this._state = "yielding";
            case "yielding":
                while (true) {
                    const { value, done } = this._sourceIterator.next();
                    if (done) {
                        this._sourceIterator = undefined;
                        break;
                    }
                    if (this._remainingCount > 0) {
                        this._remainingCount--;
                    }
                    else {
                        return NextResult(value);
                    }
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._remainingCount = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class SkipRightIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _count: number;
    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }
    @iterator __iterator__() { return new SkipRightIterator<T>(this); }
}

class SkipRightIterator<T> implements IterableIterator<T> {
    private _iterable: SkipRightIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _pending: T[];
    private _state: string;
    constructor(iterable: SkipRightIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._sourceIterator = GetIterator(this._iterable._source);
                this._pending = [];
                this._state = "yielding";
            case "yielding":
                while (true) {
                    const { value, done } = this._sourceIterator.next();
                    if (done) {
                        this._sourceIterator = undefined;
                        break;
                    }
                    this._pending.push(value);
                    if (this._pending.length > this._iterable._count) {
                        return NextResult(this._pending.shift());
                    }
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._pending = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class SkipWhileIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _predicate: (element: T) => boolean;
    constructor(source: Iterable<T>, predicate: (element: T) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }
    @iterator __iterator__() { return new SkipWhileIterator<T>(this); }
}

class SkipWhileIterator<T> implements IterableIterator<T> {
    private _iterable: SkipWhileIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _skipping: boolean;
    private _state: string;
    constructor(iterable: SkipWhileIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._sourceIterator = GetIterator(this._iterable._source);
                    this._skipping = true;
                    this._state = "yielding";
                case "yielding":
                    while (true) {
                        const { value, done } = this._sourceIterator.next();
                        if (done) {
                            this._sourceIterator = undefined;
                            break;
                        }

                        if (this._skipping) {
                            this._skipping = (void 0, this._iterable._predicate)(value);
                            if (this._skipping) {
                                continue;
                            }
                        }

                        return ok = true, NextResult(value);
                    }
                case "done":
                    return ok = true, this.return();
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._iterable = undefined;
                this._skipping = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class TakeIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _count: number;
    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }
    @iterator __iterator__() { return new TakeIterator<T>(this); }
}

class TakeIterator<T> implements IterableIterator<T> {
    private _iterable: TakeIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _remainingCount: number;
    private _state: string;
    constructor(iterable: TakeIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                if (this._iterable._count <= 0) {
                    return this.return();
                }
                this._sourceIterator = GetIterator(this._iterable._source);
                this._remainingCount = this._iterable._count;
                this._state = "yielding";
            case "yielding":
                if (this._remainingCount > 0) {
                    const { value, done } = this._sourceIterator.next();
                    if (!done) {
                        this._remainingCount--;
                        return NextResult(value);
                    }

                    this._sourceIterator = undefined;
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._remainingCount = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class TakeRightIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _count: number;
    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }
    @iterator __iterator__() { return new TakeRightIterator<T>(this); }
}

class TakeRightIterator<T> implements IterableIterator<T> {
    private _iterable: TakeRightIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _pending: T[];
    private _state: string;
    constructor(iterable: TakeRightIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._sourceIterator = GetIterator(this._iterable._source);
                this._pending = [];
                this._state = "queueing";
            case "queueing":
                while (true) {
                    const { value, done } = this._sourceIterator.next();
                    if (done) {
                        this._sourceIterator = undefined;
                        break;
                    }
                    this._pending.push(value);
                    if (this._pending.length > this._iterable._count) {
                        this._pending.shift();
                    }
                }
                this._state = "taking";
            case "taking":
                if (this._pending.length > 0) {
                    return NextResult(this._pending.shift());
                }

            case "done":
                return this.return();
        }
    }

    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._pending = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class TakeWhileIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _predicate: (element: T) => boolean;
    constructor(source: Iterable<T>, predicate: (element: T) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }
    @iterator __iterator__() { return new TakeWhileIterator<T>(this); }
}

class TakeWhileIterator<T> implements IterableIterator<T> {
    private _iterable: TakeWhileIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _state: string;
    constructor(iterable: TakeWhileIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._sourceIterator = GetIterator(this._iterable._source);
                    this._state = "yielding";
                case "yielding":
                    const { value, done } = this._sourceIterator.next();
                    if (done) {
                        this._sourceIterator = undefined;
                        break;
                    }
                    if ((void 0, this._iterable._predicate)(value)) {
                        return ok = true, NextResult(value);
                    }
                case "done":
                    return ok = true, this.return();
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class IntersectIterable<T> implements Iterable<T> {
    _left: Iterable<T>;
    _right: Iterable<T>;
    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }
    @iterator __iterator__() { return new IntersectIterator<T>(this); }
}

class IntersectIterator<T> implements IterableIterator<T> {
    private _iterable: IntersectIterable<T>;
    private _leftIterator: Iterator<T>;
    private _set: Set<T>;
    private _state: string;
    constructor(iterable: IntersectIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._leftIterator = GetIterator(this._iterable._left);
                    this._set = new Set(this._iterable._right);
                    this._state = "yielding";
                case "yielding":
                    while (true) {
                        const { value, done } = this._leftIterator.next();
                        if (done) {
                            this._leftIterator = undefined;
                            break;
                        }
                        if (!this._set.delete(value)) {
                            continue;
                        }
                        return ok = true, NextResult(value);
                    }
                case "done":
                    return ok = true, this.return();
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._leftIterator);
                this._leftIterator = undefined;
                this._set = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class UnionIterable<T> implements Iterable<T> {
    _left: Iterable<T>;
    _right: Iterable<T>;
    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }
    @iterator __iterator__() { return new UnionIterator<T>(this); }
}

class UnionIterator<T> implements IterableIterator<T> {
    private _iterable: UnionIterable<T>;
    private _leftIterator: Iterator<T>;
    private _rightIterator: Iterator<T>;
    private _set: Set<T>;
    private _state: string;
    constructor(iterable: UnionIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._leftIterator = GetIterator(this._iterable._left);
                this._set = new Set<T>();
                this._state = "yieldingLeft";
            case "yieldingLeft":
                while (true) {
                    const { value, done } = this._leftIterator.next();
                    if (done) {
                        this._leftIterator = undefined;
                        break;
                    }
                    if (this._set.has(value)) {
                        continue;
                    }
                    this._set.add(value);
                    return NextResult(value);
                }
                this._rightIterator = GetIterator(this._iterable._right);
                this._state = "yieldingRight";
            case "yieldingRight":
                while (true) {
                    const { value, done } = this._rightIterator.next();
                    if (done) {
                        this._rightIterator = undefined;
                        break;
                    }
                    if (this._set.has(value)) {
                        continue;
                    }
                    this._set.add(value);
                    return NextResult(value);
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._leftIterator);
                IteratorClose(this._rightIterator);
                this._leftIterator = undefined;
                this._rightIterator = undefined;
                this._set = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class ExceptIterable<T> implements Iterable<T> {
    _left: Iterable<T>;
    _right: Iterable<T>;
    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }
    @iterator __iterator__() { return new ExceptIterator<T>(this); }
}

class ExceptIterator<T> implements IterableIterator<T> {
    private _iterable: ExceptIterable<T>;
    private _leftIterator: Iterator<T>;
    private _set: Set<T>;
    private _state: string;
    constructor(iterable: ExceptIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._leftIterator = GetIterator(this._iterable._left);
                this._set = new Set(this._iterable._right);
                this._state = "yielding";
            case "yielding":
                while (true) {
                    const { value, done } = this._leftIterator.next();
                    if (done) {
                        this._leftIterator = undefined;
                        break;
                    }
                    if (!this._set.has(value)) {
                        this._set.add(value);
                        return NextResult(value);
                    }
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._leftIterator);
                this._leftIterator = undefined;
                this._set = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class DistinctIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    constructor(source: Iterable<T>) {
        this._source = source;
    }
    @iterator __iterator__() { return new DistinctIterator<T>(this); }
}

class DistinctIterator<T> implements IterableIterator<T> {
    private _iterable: DistinctIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _set: Set<T>;
    private _state: string;
    constructor(iterable: DistinctIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._sourceIterator = GetIterator(this._iterable._source);
                this._set = new Set<T>();
                this._state = "yielding";
            case "yielding":
                while (true) {
                    const { value, done } = this._sourceIterator.next();
                    if (done) {
                        this._sourceIterator = undefined;
                        break;
                    }
                    if (!this._set.has(value)) {
                        this._set.add(value);
                        return NextResult(value);
                    }
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._set = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class ConcatIterable<T> implements Iterable<T> {
    _left: Iterable<T>;
    _right: Iterable<T>;
    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }
    @iterator __iterator__() { return new ConcatIterator<T>(this); }
}

class ConcatIterator<T> implements IterableIterator<T> {
    private _iterable: ConcatIterable<T>;
    private _leftIterator: Iterator<T>;
    private _rightIterator: Iterator<T>;
    private _state: string;
    constructor(iterable: ConcatIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._leftIterator = GetIterator(this._iterable._left);
                this._state = "yieldingLeft";
            case "yieldingLeft": {
                const { value, done } = this._leftIterator.next();
                if (!done) {
                    return NextResult(value);
                }
                this._leftIterator = undefined;
                this._rightIterator = GetIterator(this._iterable._right);
                this._state = "yieldingRight";
            }
            case "yieldingRight": {
                const { value, done } = this._rightIterator.next();
                if (!done) {
                    return NextResult(value);
                }
                this._rightIterator = undefined;
            }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._leftIterator);
                IteratorClose(this._rightIterator);
                this._leftIterator = undefined;
                this._rightIterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class ZipIterable<T, U, R> implements Iterable<R> {
    _left: Iterable<T>;
    _right: Iterable<U>;
    _selector: (left: T, right: U) => R;
    constructor(left: Iterable<T>, right: Iterable<U>, selector: (left: T, right: U) => R) {
        this._left = left;
        this._right = right;
        this._selector = selector;
    }
    @iterator __iterator__() { return new ZipIterator<T, U, R>(this); }
}

class ZipIterator<T, U, R> implements IterableIterator<R> {
    private _iterable: ZipIterable<T, U, R>;
    private _leftIterator: Iterator<T>;
    private _rightIterator: Iterator<U>;
    private _state: string;
    constructor(iterable: ZipIterable<T, U, R>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._leftIterator = GetIterator(this._iterable._left);
                    this._rightIterator = GetIterator(this._iterable._right);
                    this._state = "yielding";
                case "yielding":
                    const { value: leftValue, done: leftDone } = this._leftIterator.next();
                    const { value: rightValue, done: rightDone } = this._rightIterator.next();
                    if (leftDone) this._leftIterator = undefined;
                    if (rightDone) this._rightIterator = undefined;
                    if (!leftDone && !rightDone) {
                        const value = (void 0, this._iterable._selector)(leftValue, rightValue)
                        return ok = true, NextResult(value);
                    }
                case "done":
                    return ok = true, this.return();
            }
        } finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._leftIterator);
                IteratorClose(this._rightIterator);
                this._leftIterator = undefined;
                this._rightIterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<R>();
        }
    }
    @iterator __iterator__() { return this; }
}

abstract class OrderedIterableBase<T> implements Iterable<T> {
    _source: Iterable<T>;
    constructor(source: Iterable<T>) {
        this._source = source;
    }
    @iterator __iterator__() { return new OrderedIterator<T>(this); }
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

class OrderedIterator<T> implements IterableIterator<T> {
    private _iterable: OrderedIterableBase<T>;
    private _indices: number[];
    private _array: T[];
    private _offset: number;
    private _state: string;
    constructor(iterable: OrderedIterableBase<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new": {
                this._array = ToArray(this._iterable._source);
                this._indices = new Array<number>(this._array.length);
                for (let i = 0; i < this._indices.length; ++i) this._indices[i] = i;
                this._indices.sort(this._iterable._getSorter(this._array));
                this._offset = 0;
                this._state = "yielding";
            }
            case "yielding": {
                if (this._offset < this._array.length) {
                    const value = this._array[this._indices[this._offset++]];
                    return NextResult(value);
                }
            }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                this._iterable = undefined;
                this._indices = undefined;
                this._array = undefined;
                this._offset = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class SpanMapIterable<T, K, V, R> implements Iterable<R> {
    _source: Iterable<T>;
    _keySelector: (element: T) => K;
    _elementSelector: (element: T) => V;
    _spanSelector: (key: K, elements: Query<V>) => R;
    constructor(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, spanSelector: (key: K, elements: Query<V>) => R) {
        this._source = source;
        this._keySelector = keySelector;
        this._elementSelector = elementSelector;
        this._spanSelector = spanSelector;
    }
    @iterator __iterator__() { return new SpanMapIterator<T, K, V, R>(this); }
}

class SpanMapIterator<T, K, V, R> implements IterableIterator<R> {
    private _iterable: SpanMapIterable<T, K, V, R>;
    private _span: V[];
    private _hasElements: boolean;
    private _previousKey: K;
    private _previousElement: T;
    private _sourceIterator: Iterator<T>;
    private _state: string;
    constructor(iterable: SpanMapIterable<T, K, V, R>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok =  false;
        try {
            while (true) {
                switch (this._state) {
                    case "new":
                        this._hasElements = false;
                        this._sourceIterator = GetIterator(this._iterable._source);
                        this._state = "iteratingSource";
                    case "iteratingSource": {
                        const { value, done } = this._sourceIterator.next();
                        if (done) {
                            this._sourceIterator = undefined;
                            this._state = "yieldingRemainingSpan";
                            break;
                        }
                        const key = (void 0, this._iterable._keySelector)(value);
                        this._previousElement = value;
                        this._state = "addingElement";
                        if (!this._hasElements) {
                            this._previousKey = key;
                            this._hasElements = true;
                            this._span = [];
                        }
                        else if (!SameValue(this._previousKey, key)) {
                            const previousKey = this._previousKey;
                            const span = this._span;
                            this._previousKey = key;
                            this._span = [];
                            const result = (void 0, this._iterable._spanSelector)(previousKey, new Query(span));
                            return ok = true, NextResult(result);
                        }
                    }
                    case "addingElement": {
                        const value = this._previousElement;
                        this._previousElement = undefined;
                        this._span.push((void 0, this._iterable._elementSelector)(value));
                        this._state = "iteratingSource";
                        continue;
                    }
                    case "yieldingRemainingSpan": {
                        this._state = "yieldedRemainingSpan";
                        if (this._span) {
                            const result = (void 0, this._iterable._spanSelector)(this._previousKey, new Query(this._span));
                            return NextResult(result);
                        }
                    }
                    case "done":
                        return this.return();
                }
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._span = undefined;
                this._hasElements = undefined;
                this._previousKey = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<R>();
        }
    }
    @iterator __iterator__() { return this; }
}

class GroupByIterable<T, K, V, R> implements Iterable<R> {
    _source: Iterable<T>;
    _keySelector: (element: T) => K;
    _elementSelector: (element: T) => V;
    _resultSelector: (key: K, elements: Query<V>) => R;
    constructor(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R) {
        this._source = source;
        this._keySelector = keySelector;
        this._elementSelector = elementSelector;
        this._resultSelector = resultSelector;
    }
    @iterator __iterator__() { return new GroupByIterator<T, K, V, R>(this); }
}

class GroupByIterator<T, K, V, R> implements IterableIterator<R> {
    private _iterable: GroupByIterable<T, K, V, R>;
    private _mapIterator: Iterator<[K, V[]]>;
    private _state: string;
    constructor(iterable: GroupByIterable<T, K, V, R>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    const map = CreateGroupings(this._iterable._source, this._iterable._keySelector, this._iterable._elementSelector);
                    this._mapIterator = GetIterator(map);
                    this._state = "yielding";
                case "yielding":
                    const { value, done } = this._mapIterator.next();
                    if (!done) {
                        const [key, values] = value;
                        const result = (void 0, this._iterable._resultSelector)(key, new Query(values));
                        return ok = true, NextResult(result);
                    }

                    this._mapIterator = undefined;
                case "done":
                    return ok = true, this.return();
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._mapIterator);
                this._mapIterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<R>();
        }
    }
    @iterator __iterator__() { return this; }
}

class GroupJoinIterable<O, I, K, R> implements Iterable<R> {
    _outer: Iterable<O>;
    _inner: Iterable<I>;
    _outerKeySelector: (element: O) => K;
    _innerKeySelector: (element: I) => K;
    _resultSelector: (outer: O, inner: Query<I>) => R;
    constructor(outer: Iterable<O>, inner: Iterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: Query<I>) => R) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }
    @iterator __iterator__() { return new GroupJoinIterator<O, I, K, R>(this); }
}

class GroupJoinIterator<O, I, K, R> implements IterableIterator<R> {
    private _iterable: GroupJoinIterable<O, I, K, R>;
    private _map: Map<K, I[]>;
    private _outerIterator: Iterator<O>;
    private _state: string;
    constructor(iterable: GroupJoinIterable<O, I, K, R>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._map = CreateGroupings(this._iterable._inner, this._iterable._innerKeySelector, Identity);
                    this._outerIterator = GetIterator(this._iterable._outer);
                    this._state = "yielding";
                case "yielding":
                    const { value: outerElement, done } = this._outerIterator.next();
                    if (!done) {
                        const outerKey = (void 0, this._iterable._outerKeySelector)(outerElement);
                        const innerElements = this._map.has(outerKey)
                            ? new Query(this._map.get(outerKey))
                            : Query.empty<I>();
                        const result = (void 0, this._iterable._resultSelector)(outerElement, innerElements);
                        return ok = true, NextResult(result);
                    }
                    this._outerIterator = undefined;
                case "done":
                    return ok = true, this.return();
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._outerIterator);
                this._map = undefined;
                this._outerIterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<R>();
        }
    }
    @iterator __iterator__() { return this; }
}

class JoinIterable<O, I, K, R> implements Iterable<R> {
    _outer: Iterable<O>;
    _inner: Iterable<I>;
    _outerKeySelector: (element: O) => K;
    _innerKeySelector: (element: I) => K;
    _resultSelector: (outer: O, inner: I) => R;
    constructor(outer: Iterable<O>, inner: Iterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: I) => R) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }
    @iterator __iterator__() { return new JoinIterator<O, I, K, R>(this); }
}

class JoinIterator<O, I, K, R> implements IterableIterator<R> {
    private _iterable: JoinIterable<O, I, K, R>;
    private _map: Map<K, I[]>;
    private _outerIterator: Iterator<O>;
    private _outerElement: O;
    private _innerIterator: Iterator<I>;
    private _state: string;
    constructor(iterable: JoinIterable<O, I, K, R>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            while (true) {
                switch (this._state) {
                    case "new":
                        this._map = CreateGroupings(this._iterable._inner, this._iterable._innerKeySelector, Identity);
                        this._outerIterator = GetIterator(this._iterable._outer);
                        this._state = "iteratingOuter";
                    case "iteratingOuter": {
                        const { value: outerElement, done } = this._outerIterator.next();
                        if (done) {
                            this._outerIterator = undefined;
                            this._outerElement = undefined;
                            this._state = "doneIteratingOuter";
                            continue;
                        }
                        const outerKey = (void 0, this._iterable._outerKeySelector)(outerElement);
                        if (!this._map.has(outerKey)) {
                            continue;
                        }
                        const innerElements = this._map.get(outerKey);
                        this._innerIterator = GetIterator(ToIterable(innerElements));
                        this._outerElement = outerElement;
                        this._state = "yieldingInner";
                    }
                    case "yieldingInner": {
                        const { value: innerElement, done } = this._innerIterator.next();
                        if (done) {
                            this._innerIterator = undefined;
                            this._state = "iteratingOuter";
                            continue;
                        }
                        const result = (void 0, this._iterable._resultSelector)(this._outerElement, innerElement);
                        return ok = true, NextResult(result);
                    }
                    case "doneIteratingOuter":
                    case "done":
                        return ok = true, this.return();
                }
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._innerIterator);
                IteratorClose(this._outerIterator);
                this._map = undefined;
                this._outerIterator = undefined;
                this._outerElement = undefined;
                this._innerIterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<R>();
        }
    }
    @iterator __iterator__() { return this; }
}

class FullOuterJoinIterable<O, I, K, R> implements Iterable<R> {
    _outer: Iterable<O>;
    _inner: Iterable<I>;
    _outerKeySelector: (element: O) => K;
    _innerKeySelector: (element: I) => K;
    _resultSelector: (outer: O | undefined, inner: I | undefined) => R;
    constructor(outer: Iterable<O>, inner: Iterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O | undefined, inner: I | undefined) => R) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }
    @iterator __iterator__() { return new FullOuterJoinIterator<O, I, K, R>(this); }
}

class FullOuterJoinIterator<O, I, K, R> implements IterableIterator<R> {
    private _iterable: FullOuterJoinIterable<O, I, K, R>;
    private _outerLookup: Lookup<K, O>;
    private _innerLookup: Lookup<K, I>;
    private _keysIterator: Iterator<K>;
    private _outer: Iterable<O>;
    private _outerIterator: Iterator<O>;
    private _outerElement: O;
    private _inner: Iterable<I>;
    private _innerIterator: Iterator<I>;
    private _state: string;
    constructor(iterable: FullOuterJoinIterable<O, I, K, R>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            while (true) {
                switch (this._state) {
                    case "new":
                        this._outerLookup = new Lookup(CreateGroupings(this._iterable._outer, this._iterable._outerKeySelector, Identity));
                        this._innerLookup = new Lookup(CreateGroupings(this._iterable._inner, this._iterable._innerKeySelector, Identity));
                        const keys = Query
                            .from(this._outerLookup.select(group => group.key))
                            .union(this._innerLookup.select(group => group.key));
                        this._keysIterator = GetIterator(keys);
                        this._state = "iteratingKeys";
                    case "iteratingKeys": {
                        const { value: key, done } = this._keysIterator.next();
                        if (done) {
                            this._keysIterator = undefined;
                            this._state = "doneIteratingKeys";
                            continue;
                        }

                        this._outer = this._outerLookup.get(key).defaultIfEmpty(undefined);
                        this._inner = this._innerLookup.get(key).defaultIfEmpty(undefined);
                        this._outerIterator = GetIterator(this._outer);
                        this._state = "iteratingOuter";
                    }
                    case "iteratingOuter": {
                        const { value: outerElement, done } = this._outerIterator.next();
                        if (done) {
                            this._outer = undefined;
                            this._inner = undefined;
                            this._outerIterator = undefined;
                            this._state = "iteratingKeys";
                            continue;
                        }

                        this._outerElement = outerElement;
                        this._innerIterator = GetIterator(this._inner);
                        this._state = "iteratingInner";
                    }
                    case "iteratingInner": {
                        const { value: innerElement, done } = this._innerIterator.next();
                        if (done) {
                            this._outerElement = undefined;
                            this._innerIterator = undefined;
                            this._state = "iteratingOuter";
                            continue;
                        }

                        const result = (void 0, this._iterable._resultSelector)(this._outerElement, innerElement);
                        return ok = true, NextResult(result);
                    }
                    case "doneIteratingKeys":
                    case "done":
                        return ok = true, this.return();
                }
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._keysIterator);
                IteratorClose(this._innerIterator);
                IteratorClose(this._outerIterator);
                this._keysIterator = undefined;
                this._outerIterator = undefined;
                this._outerElement = undefined;
                this._outer = undefined;
                this._outerLookup = undefined;
                this._innerIterator = undefined;
                this._inner = undefined;
                this._innerLookup = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<R>();
        }
    }
    @iterator __iterator__() { return this; }
}

class ScanIterable<T, U> implements Iterable<T | U> {
    _source: Iterable<T>;
    _aggregator: (aggregate: T | U, element: T, offset: number) => T | U;
    _isSeeded: boolean;
    _seed: T | U;
    constructor(source: Iterable<T>, aggregator: (aggregate: T | U, element: T, offset: number) => U, isSeeded: boolean, seed: U) {
        this._source = source;
        this._aggregator = aggregator;
        this._isSeeded = isSeeded;
        this._seed = seed;
    }
    @iterator __iterator__() { return new ScanIterator<T, U>(this); }
}

class ScanIterator<T, U> implements IterableIterator<T | U> {
    private _iterable: ScanIterable<T, U>;
    private _iterator: Iterator<T>;
    private _offset: number;
    private _aggregate: T | U;
    private _state: string;
    constructor(iterable: ScanIterable<T, U>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._iterator = GetIterator(this._iterable._source);
                    this._offset = 0;
                    if (this._iterable._isSeeded) {
                        this._aggregate = this._iterable._seed;
                    }
                    else {
                        const { value, done } = this._iterator.next();
                        if (done) {
                            this._iterator = undefined;
                            return ok = true, this.return();
                        }
                        this._aggregate = value;
                        this._offset++;
                    }
                    this._state = "yielding";
                case "yielding":
                    const { value, done } = this._iterator.next();
                    if (!done) {
                        this._aggregate = (void 0, this._iterable._aggregator)(this._aggregate, value, this._offset++);
                        return ok = true, NextResult(this._aggregate);
                    }
                    this._iterator = undefined;
                case "done":
                    return ok = true, this.return();
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._iterator);
                this._iterator = undefined;
                this._offset = undefined;
                this._aggregate = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T | U>();
        }
    }
    @iterator __iterator__() { return this; }
}

class ScanRightIterable<T, U> implements Iterable<T | U> {
    _source: Iterable<T>;
    _aggregator: (aggregate: T | U, element: T, offset: number) => T | U;
    _isSeeded: boolean;
    _seed: T | U;
    constructor(source: Iterable<T>, aggregator: (aggregate: T | U, element: T, offset: number) => U, isSeeded: boolean, seed: U) {
        this._source = source;
        this._aggregator = aggregator;
        this._isSeeded = isSeeded;
        this._seed = seed;
    }
    @iterator __iterator__() { return new ScanRightIterator<T, U>(this); }
}

class ScanRightIterator<T, U> implements IterableIterator<T | U> {
    private _iterable: ScanRightIterable<T, U>;
    private _sourceArray: T[];
    private _aggregate: T | U;
    private _offset: number;
    private _state: string;
    constructor(iterable: ScanRightIterable<T, U>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._sourceArray = ToArray(this._iterable._source);
                    this._offset = this._sourceArray.length - 1;
                    if (this._offset < 0) {
                        return ok = true, this.return();
                    }
                    if (this._iterable._isSeeded) {
                        this._aggregate = this._iterable._seed;
                    }
                    else {
                        this._aggregate = this._sourceArray[this._offset];
                        this._offset--;
                    }
                    this._state = "yielding";
                case "yielding":
                    if (this._offset < 0) {
                        return ok = true, this.return();
                    }
                    const value = this._sourceArray[this._offset];
                    this._aggregate = (void 0, this._iterable._aggregator)(this._aggregate, value, this._offset--);
                    return ok = true, NextResult(this._aggregate);
                case "done":
                    return ok = true, this.return();
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                this._sourceArray = undefined;
                this._aggregate = undefined;
                this._offset = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T | U>();
        }
    }
    @iterator __iterator__() { return this; }
}

class LookupIterable<K, V, R> implements Iterable<R> {
    _map: Map<K, Queryable<V>>;
    _selector: (key: K, elements: Query<V>) => R;
    constructor(map: Map<K, Queryable<V>>, selector: (key: K, elements: Query<V>) => R) {
        this._map = map;
        this._selector = selector;
    }
    @iterator __iterator__() { return new LookupIterator<K, V, R>(this); }
}

class LookupIterator<K, V, R> implements IterableIterator<R> {
    private _iterable: LookupIterable<K, V, R>;
    private _mapIterator: Iterator<[K, Queryable<V>]>;
    private _state: string;
    constructor(iterable: LookupIterable<K, V, R>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._mapIterator = GetIterator(this._iterable._map);
                    this._state = "yielding";
                case "yielding":
                    const { value, done } = this._mapIterator.next();
                    if (!done) {
                        const [key, values] = value;
                        const result = (void 0, this._iterable._selector)(key, new Query(values));
                        return ok = true, NextResult(result);
                    }
                    this._mapIterator = undefined;
                case "done":
                    return ok = true, this.return();
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._mapIterator);
                this._mapIterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<R>();
        }
    }
    @iterator __iterator__() { return this; }
}

class DefaultIfEmptyIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _defaultValue: T;
    constructor(source: Iterable<T>, defaultValue: T) {
        this._source = source;
        this._defaultValue = defaultValue;
    }
    @iterator __iterator__() { return new DefaultIfEmptyIterator<T>(this); }
}

class DefaultIfEmptyIterator<T> implements IterableIterator<T> {
    private _iterable: DefaultIfEmptyIterable<T>;
    private _iterator: Iterator<T>;
    private _state: string;
    constructor(iterable: DefaultIfEmptyIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._iterator = GetIterator(this._iterable._source);
                this._state = "yieldingFirstValue";
            case "yieldingFirstValue": {
                const { value, done } = this._iterator.next();
                if (!done) {
                    this._state = "yieldingRemainingValues";
                    return NextResult(value);
                }
                this._iterator = undefined;
                this._state = "doneYieldingDefaultValue";
                return NextResult(this._iterable._defaultValue);
            }
            case "yieldingRemainingValues": {
                const { value, done } = this._iterator.next();
                if (!done) {
                    return NextResult(value);
                }
                this._iterator = undefined;
            }
            case "doneYieldingDefaultValue":
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._iterator);
                this._iterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class PageByIterable<T> implements Iterable<Page<T>> {
    _source: Iterable<T>;
    _pageSize: number;
    constructor(source: Iterable<T>, pageSize: number) {
        this._source = source;
        this._pageSize = pageSize;
    }
    @iterator __iterator__() { return new PageByIterator<T>(this); }
}

class PageByIterator<T> implements IterableIterator<Page<T>> {
    private _iterable: PageByIterable<T>;
    private _page: number;
    private _iterator: Iterator<T>;
    private _elements: T[];
    private _state: string;
    constructor(iterable: PageByIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._iterator = GetIterator(this._iterable._source);
                this._elements = [];
                this._page = 0;
                this._state = "yielding";
            case "yielding":
                while (true) {
                    const { value, done } = this._iterator.next();
                    if (done) {
                        this._iterator = undefined;
                        break;
                    }
                    this._elements.push(value);
                    if (this._elements.length >= this._iterable._pageSize) {
                        const page = new Page(this._page, this._page * this._iterable._pageSize, this._elements);
                        this._elements = [];
                        this._page++;
                        return NextResult(page);
                    }
                }
                if (this._elements.length > 0) {
                    const page = new Page(this._page, this._page * this._iterable._pageSize, this._elements);
                    this._state = "doneYieldingLastPage";
                    this._elements = undefined;
                    return NextResult(page);
                }
            case "doneYieldingLastPage":
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._iterator);
                this._iterable = undefined;
                this._page = undefined;
                this._iterator = undefined;
                this._elements = undefined;
                this._state = "done";
            case "done":
                return DoneResult<Page<T>>();
        }
    }
    @iterator __iterator__() { return this; }
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
            ForOf(this.ancestors(element, /*self*/ true), ancestor => {
                root = ancestor;
            });
            return root;
        }
        return undefined;
    }

    public ancestors(element: T, self: boolean) {
        Assert.mustBeBoolean(self, "self");
        return IterableIterator({
            next: () => {
                if (element === undefined) return DoneResult<T>();
                if (self) {
                    self = false;
                }
                else {
                    element = this.parent(element);
                }

                if (element === undefined) return DoneResult<T>();
                return NextResult(element);
            },
            return: () => {
                element = undefined;
                return DoneResult<T>();
            }
        });
    }

    public parent(element: T) {
        if (element !== undefined) {
            return this.hierarchy.parent(element);
        }

        return undefined;
    }

    public children(element: T) {
        let childrenIterator: Iterator<T>;
        return IterableIterator({
            next: () => {
                if (element === undefined) return DoneResult<T>();
                if (childrenIterator === undefined) {
                    const children = this.hierarchy.children(element);
                    if (children === undefined) {
                        element = undefined;
                        return DoneResult<T>();
                    }

                    childrenIterator = GetIterator(ToIterable(children));
                }

                while (true) {
                    const { value: child, done } = childrenIterator.next();
                    if (done) {
                        element = undefined;
                        childrenIterator = undefined;
                        return DoneResult<T>();
                    }

                    if (child !== undefined) {
                        return NextResult(child);
                    }
                }
            },
            return: () => {
                IteratorClose(childrenIterator);
                childrenIterator = undefined;
                element = undefined;
                return DoneResult<T>();
            }
        });
    }

    public nthChild(element: T, offset: number) {
        Assert.mustBeInteger(offset, "offset");
        if (element !== undefined) {
            const children = this.children(element);
            return from(children).elementAt(offset);
        }

        return undefined;
    }

    public siblings(element: T, self: boolean) {
        Assert.mustBeBoolean(self, "self");
        let siblingIterator: Iterator<T>;
        return IterableIterator({
            next: () => {
                if (element === undefined) return DoneResult<T>();
                if (siblingIterator === undefined) {
                    const parent = this.parent(element);
                    if (parent === undefined) {
                        if (self) {
                            const sibling = element;
                            element = undefined;
                            return NextResult(sibling);
                        }

                        element = undefined;
                        return DoneResult<T>();
                    }

                    siblingIterator = this.children(parent);
                }

                while (true) {
                    const { value: sibling, done } = siblingIterator.next();
                    if (done) {
                        siblingIterator = undefined;
                        element = undefined;
                        return DoneResult<T>();
                    }

                    if (self || !SameValue(sibling, element)) {
                        return NextResult(sibling);
                    }
                }
            },
            return: () => {
                IteratorClose(siblingIterator);
                siblingIterator = undefined;
                element = undefined;
                return DoneResult<T>();
            }
        });
    }

    public siblingsBeforeSelf(element: T) {
        let siblingIterator: Iterator<T>;
        return IterableIterator({
            next: () => {
                if (element === undefined) return DoneResult<T>();
                if (siblingIterator === undefined) {
                    siblingIterator = this.siblings(element, /*self*/ true);
                }
                const { value: sibling, done } = siblingIterator.next();
                if (done || SameValue(sibling, element)) {
                    siblingIterator = undefined;
                    element = undefined;
                    return DoneResult<T>();
                }

                return NextResult(sibling);
            },
            return: () => {
                IteratorClose(siblingIterator);
                siblingIterator = undefined;
                element = undefined;
                return DoneResult<T>();
            }
        });
    }

    public siblingsAfterSelf(element: T) {
        let siblingIterator: Iterator<T>;
        let hasSeenSelf: boolean;
        return IterableIterator({
            next: () => {
                if (element === undefined) return DoneResult<T>();
                if (siblingIterator === undefined) {
                    siblingIterator = this.siblings(element, /*self*/ true);
                }

                while (true) {
                    const { value: sibling, done } = siblingIterator.next();
                    if (done) {
                        siblingIterator = undefined;
                        element = undefined;
                        return DoneResult<T>();
                    }

                    if (hasSeenSelf) {
                        return NextResult(sibling);
                    }
                    else {
                        hasSeenSelf = SameValue(sibling, element);
                    }
                }
            },
            return: () => {
                IteratorClose(siblingIterator);
                siblingIterator = undefined;
                element = undefined;
                return DoneResult<T>();
            }
        });
    }

    // NOTE: Currently disabled as View is not public and these are inefficient.
    //
    // public firstChild(element: T) {
    //     if (element !== undefined) {
    //         const state = ForOf(this.children(element), child => {
    //             return Return(child);
    //         });
    //         if (IsReturn(state)) return state.return;
    //     }

    //     return undefined;
    // }

    // public lastChild(element: T) {
    //     if (element !== undefined) {
    //         let lastChild: T;
    //         ForOf(this.children(element), child => {
    //             lastChild = child;
    //         });
    //         return lastChild;
    //     }

    //     return undefined;
    // }

    // public previousSibling(element: T) {
    //     if (element !== undefined) {
    //         let previousSibling: T;
    //         const state = ForOf(this.siblings(element, /*self*/ true), sibling => {
    //             if (SameValue(sibling, element)) {
    //                 return Return(previousSibling);
    //             }

    //             previousSibling = sibling;
    //         });
    //         if (IsReturn(state)) return state.return;
    //     }

    //     return undefined;
    // }

    // public nextSibling(element: T) {
    //     if (element !== undefined) {
    //         let hasSeenSelf: boolean;
    //         const state = ForOf(this.siblings(element, /*self*/ true), sibling => {
    //             if (hasSeenSelf) {
    //                 return Return(sibling);
    //             }

    //             if (SameValue(sibling, element)) {
    //                 hasSeenSelf = true;
    //             }
    //         });
    //         if (IsReturn(state)) return state.return;
    //     }

    //     return undefined;
    // }

    public descendants(element: T, self: boolean) {
        Assert.mustBeBoolean(self, "self");
        let childrenIterator: Iterator<T>;
        let descendantsIterator: Iterator<T>;
        return IterableIterator({
            next: () => {
                if (element === undefined) {
                    return DoneResult<T>();
                }

                if (self) {
                    self = false;
                    return NextResult(element);
                }

                if (childrenIterator === undefined) {
                    childrenIterator = this.children(element);
                }

                while (true) {
                    if (descendantsIterator === undefined) {
                        const { value: child, done } = childrenIterator.next();
                        if (done) {
                            childrenIterator = undefined;
                            element = undefined;
                            return DoneResult<T>();
                        }

                        descendantsIterator = GetIterator(this.descendants(child, /*self*/ true));
                    }

                    const { value, done } = descendantsIterator.next();
                    if (done) {
                        descendantsIterator = undefined;
                    }
                    else {
                        return NextResult(value);
                    }
                }
            },
            return: () => {
                IteratorClose(childrenIterator);
                IteratorClose(descendantsIterator);
                childrenIterator = undefined;
                descendantsIterator = undefined;
                element = undefined;
                return DoneResult<T>();
            }
        });
    }
}

class NthChildIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _hierarchy: HierarchyProviderView<T>;
    _offset: number;
    constructor(source: Iterable<T>, hierarchy: HierarchyProviderView<T>, offset: number) {
        this._source = source;
        this._hierarchy = hierarchy;
        this._offset = offset;
    }
    @iterator __iterator__() { return new NthChildIterator<T>(this); }
}

class NthChildIterator<T> implements IterableIterator<T> {
    private _iterable: NthChildIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _state: string;
    constructor(iterable: NthChildIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            switch (this._state) {
                case "new":
                    this._sourceIterator = GetIterator(this._iterable._source);
                    this._state = "yielding";
                case "yielding":
                    while (true) {
                        const { value: element, done } = this._sourceIterator.next();
                        if (done) {
                            this._sourceIterator = undefined;
                            break;
                        }
                        const child = this._iterable._hierarchy.nthChild(element, this._iterable._offset);
                        if (child !== undefined) {
                            return ok = true, NextResult(child);
                        }
                    }
                case "done":
                    return this.return();
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                this._sourceIterator = undefined;
                this._iterable = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class HierarchyAxisIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _hierarchy: HierarchyProviderView<T>;
    _predicate: (element: T) => boolean;
    _axis: (provider: HierarchyProviderView<T>, element: T) => Iterable<T>;
    constructor(source: Iterable<T>, hierarchy: HierarchyProviderView<T>, predicate: (element: T) => boolean, axis: (provider: HierarchyProviderView<T>, element: T) => Iterable<T>) {
        this._source = source;
        this._hierarchy = hierarchy;
        this._predicate = predicate;
        this._axis = axis;
    }
    @iterator __iterator__() { return new HierarchyAxisIterator<T>(this); }
}

class HierarchyAxisIterator<T> implements IterableIterator<T> {
    private _iterable: HierarchyAxisIterable<T>;
    private _sourceIterator: Iterator<T>;
    private _axisIterator: Iterator<T>;
    private _state: string;
    constructor(iterable: HierarchyAxisIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        let ok = false;
        try {
            while (true) {
                switch (this._state) {
                    case "new":
                        this._sourceIterator = GetIterator(this._iterable._source);
                        this._state = "iteratingSource";
                    case "iteratingSource": {
                        const { value: element, done } = this._sourceIterator.next();
                        if (done) {
                            this._sourceIterator = undefined;
                            this._state = "doneIteratingSource";
                            continue;
                        }
                        if (element === undefined) {
                            continue;
                        }
                        const axisElements = (void 0, this._iterable._axis)(this._iterable._hierarchy, element);
                        this._axisIterator = GetIterator(axisElements);
                        this._state = "yieldingAxis";
                    }
                    case "yieldingAxis": {
                        const { value, done } = this._axisIterator.next();
                        if (done) {
                            this._axisIterator = undefined;
                            this._state = "iteratingSource";
                            continue;
                        }
                        if (!this._iterable._predicate || (void 0, this._iterable._predicate)(value)) {
                            return ok = true, NextResult(value);
                        }
                        continue;
                    }
                    case "doneIteratingSource":
                    case "done":
                        return ok = true, this.return();
                }
            }
        }
        finally {
            if (!ok) this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                IteratorClose(this._sourceIterator);
                IteratorClose(this._axisIterator);
                this._sourceIterator = undefined;
                this._axisIterator = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class TopMostIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _hierarchy: HierarchyProviderView<T>;

    constructor(source: Iterable<T>, hierarchy: HierarchyProviderView<T>) {
        this._source = source;
        this._hierarchy = hierarchy;
    }

    @iterator __iterator__() { return new TopMostIterableIterator<T>(this); }
}

class TopMostIterableIterator<T> implements IterableIterator<T> {
    private _iterable: TopMostIterable<T>;
    private _topMostNodes: T[];
    private _index: number;
    private _state: string;
    constructor(iterable: TopMostIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        while (true) {
            switch (this._state) {
                case "new":
                    const topMostNodes = ToArray(this._iterable._source);
                    const ancestors = new Map<T, Set<T>>();
                    for (let i = topMostNodes.length - 1; i >= 1; i--) {
                        const node = topMostNodes[i];
                        for (let j = i - 1; j >= 0; j--) {
                            const other = topMostNodes[j];
                            let ancestorsOfNode = ancestors.get(node);
                            if (!ancestorsOfNode) {
                                ancestorsOfNode = new Set(this._iterable._hierarchy.ancestors(node, /*self*/ false));
                                ancestors.set(node, ancestorsOfNode);
                            }

                            if (ancestorsOfNode.has(other)) {
                                topMostNodes.splice(i, 1);
                                break;
                            }

                            let ancestorsOfOther = ancestors.get(other);
                            if (!ancestorsOfOther) {
                                ancestorsOfOther = new Set(this._iterable._hierarchy.ancestors(other, /*self*/ false));
                                ancestors.set(other, ancestorsOfOther);
                            }

                            if (ancestorsOfOther.has(node)) {
                                topMostNodes.splice(j, 1);
                                i--;
                            }
                        }
                    }

                    this._topMostNodes = topMostNodes;
                    this._index = 0;
                    this._state = "iterating";
                case "iterating":
                    if (this._index < this._topMostNodes.length) {
                        return NextResult(this._topMostNodes[this._index++])
                    }
                case "done":
                    return this.return();
            }
        }
    }
    return() {
        switch (this._state) {
            default:
                this._topMostNodes = undefined;
                this._index = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

class BottomMostIterable<T> implements Iterable<T> {
    _source: Iterable<T>;
    _hierarchy: HierarchyProviderView<T>;

    constructor(source: Iterable<T>, hierarchy: HierarchyProviderView<T>) {
        this._source = source;
        this._hierarchy = hierarchy;
    }

    @iterator __iterator__() { return new BottomMostIterableIterator<T>(this); }
}

class BottomMostIterableIterator<T> implements IterableIterator<T> {
    private _iterable: BottomMostIterable<T>;
    private _bottomMostNodes: T[];
    private _index: number;
    private _state: string;
    constructor(iterable: BottomMostIterable<T>) {
        this._iterable = iterable;
        this._state = "new";
    }
    next() {
        while (true) {
            switch (this._state) {
                case "new":
                    const bottomMostNodes = ToArray(this._iterable._source);
                    const ancestors = new Map<T, Set<T>>();
                    for (let i = bottomMostNodes.length - 1; i >= 1; i--) {
                        const node = bottomMostNodes[i];
                        for (let j = i - 1; j >= 0; j--) {
                            const other = bottomMostNodes[j];
                            let ancestorsOfOther = ancestors.get(other);
                            if (!ancestorsOfOther) {
                                ancestorsOfOther = new Set(this._iterable._hierarchy.ancestors(other, /*self*/ false));
                                ancestors.set(other, ancestorsOfOther);
                            }

                            if (ancestorsOfOther.has(node)) {
                                bottomMostNodes.splice(i, 1);
                                break;
                            }

                            let ancestorsOfNode = ancestors.get(node);
                            if (!ancestorsOfNode) {
                                ancestorsOfNode = new Set(this._iterable._hierarchy.ancestors(node, /*self*/ false));
                                ancestors.set(node, ancestorsOfNode);
                            }

                            if (ancestorsOfNode.has(other)) {
                                bottomMostNodes.splice(j, 1);
                                i--;
                            }
                        }
                    }

                    this._bottomMostNodes = bottomMostNodes;
                    this._index = 0;
                    this._state = "iterating";
                case "iterating":
                    if (this._index < this._bottomMostNodes.length) {
                        return NextResult(this._bottomMostNodes[this._index++])
                    }
                case "done":
                    return this.return();
            }
        }
    }
    return() {
        switch (this._state) {
            default:
                this._bottomMostNodes = undefined;
                this._index = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}

namespace HierarchyAxis {
    export function root<T>(provider: HierarchyProviderView<T>, element: T) {
        return IterableIterator({
            next() {
                if (provider === undefined) return DoneResult<T>();
                const root = provider.root(element);
                provider = undefined;
                element = undefined;
                return root === undefined ? DoneResult<T>() : NextResult(root);
            },
            return() {
                provider = undefined;
                element = undefined;
                return DoneResult<T>();
            }
        });
    }

    export function ancestors<T>(provider: HierarchyProviderView<T>, element: T) {
        return provider.ancestors(element, false);
    }

    export function ancestorsAndSelf<T>(provider: HierarchyProviderView<T>, element: T) {
        return provider.ancestors(element, true);
    }

    export function parents<T>(provider: HierarchyProviderView<T>, element: T) {
        return IterableIterator({
            next() {
                if (provider === undefined) return DoneResult<T>();
                const parent = provider.parent(element);
                provider = undefined;
                element = undefined;
                return parent === undefined ? DoneResult<T>() : NextResult(parent);
            },
            return() {
                provider = undefined;
                element = undefined;
                return DoneResult<T>();
            }
        });
    }

    export function self<T>(provider: HierarchyProviderView<T>, element: T) {
        return IterableIterator({
            next() {
                if (element === undefined) return DoneResult<T>();
                const value = element;
                provider = undefined;
                element = undefined;
                return NextResult(value);
            },
            return() {
                provider = undefined;
                element = undefined;
                return DoneResult<T>();
            }
        });
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

type Return<R> = { return: R };
type LabeledBreak = { break: string };
type LabeledContinue = { continue: string };
type ForOfCompletion<R> = "break" | "continue" | Return<R> | LabeledBreak | LabeledContinue | void;

function ForOf<T, R, Y>(source: Iterable<T>, cb: (value: T) => ForOfCompletion<R>): Return<R> | LabeledBreak | LabeledContinue {
    let iterator = GetIterator(source);
    try {
        while (true) {
            const { value, done } = iterator.next();
            if (done) {
                iterator = undefined;
                return undefined;
            }

            const state = cb(value);
            if (IsBreak(state)) break;
            if (IsContinue(state)) continue;
            if (IsReturn(state) || IsLabeledBreak(state) || IsLabeledContinue(state)) return state;
        }
    }
    finally {
        IteratorClose(iterator);
        iterator = undefined;
    }
}

function IsBreak<R, Y>(result: ForOfCompletion<R>): result is "break" {
    return result === "break";
}

function IsContinue<R, Y>(result: ForOfCompletion<R>): result is "continue" {
    return result === "continue";
}

function IsLabeledBreak<R, Y>(result: ForOfCompletion<R>): result is LabeledBreak {
    return typeof result === "object" && (<Object>result).hasOwnProperty("break");
}

function IsLabeledContinue<R, Y>(result: ForOfCompletion<R>): result is LabeledContinue {
    return typeof result === "object" && (<Object>result).hasOwnProperty("continue");
}

function IsReturn<R, Y>(result: ForOfCompletion<R>): result is Return<R> {
    return typeof result === "object" && (<Object>result).hasOwnProperty("return");
}

function Break(): "break" {
    return "break";
}

function Continue(): "continue" {
    return "continue";
}

function LabeledBreak(label: string): LabeledBreak {
    return { break: label };
}

function LabeledContinue(label: string): LabeledContinue {
    return { continue: label };
}

function Return<R>(value?: R): Return<R> {
    return { return: value };
}

function Identity<T>(x: T): T {
    return x;
}

function True(x: any) {
    return true;
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

function Iterable<T>(factory: () => Iterator<T>): Iterable<T> {
    const iterable = {
        __iterator__: () => IterableIterator(factory())
    };
    iterator(iterable, "__iterator__");
    return iterable;
}

function IterableIterator<T>(iterable: Iterator<T>): IterableIterator<T>;
function IterableIterator<T>(iterable: IterableIterator<T>): IterableIterator<T> {
    iterable.__iterator__ = () => iterable;
    iterator(iterable, "__iterator__");
    return iterable;
}

function IsOrderedIterable<T>(source: Iterable<T>): source is OrderedIterableBase<T> {
    return source instanceof OrderedIterableBase;
}

function CreateGroupings<T, K, V>(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Map<K, V[]> {
    const map = new Map<K, V[]>();
    let iterator = GetIterator(source);
    try {
        while (true) {
            const { value, done } = iterator.next();
            if (done) {
                iterator = undefined;
                break;
            }

            const key = keySelector(value);
            const element = elementSelector(value);
            let grouping = map.get(key);
            if (grouping === undefined) {
                grouping = [];
                map.set(key, grouping);
            }

            grouping.push(element);
        }
    }
    finally {
        IteratorClose(iterator);
        iterator = undefined;
    }

    return map;
}

function ToIterable<T>(queryable: Queryable<T>): Iterable<T> {
    return IsIterable(queryable) ? queryable
        : IsIterableShim(queryable) ? new IterableShimWrapper(queryable)
        : new ArrayLikeIterable(queryable);
}

function ToArray<T>(source: Queryable<T>): T[];
function ToArray<T, U>(source: Queryable<T>, elementSelector: (value: T) => U): U[];
function ToArray<T, U>(source: Queryable<T>, elementSelector: (value: T) => T | U = Identity): (T | U)[] {
    const array: (T | U)[] = [];
    ForOf(ToIterable(source), element => {
        array.push(elementSelector(element));
    });
    return array;
}

function ToGrouping<K, V>(key: K, elements: Iterable<V>): Grouping<K, V> {
    return new Grouping<K, V>(key, elements);
}

function IsIteratorResult<T>(result: IteratorResult<T> | void): result is IteratorResult<T> {
    return result !== undefined;
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