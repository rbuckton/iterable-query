/*!
  Copyright 2018 Ron Buckton (rbuckton@chronicles.org)

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

import * as fn from "./fn";
import { assert, IsPossiblyAsyncHierarchyIterable, GetHierarchy, ToPossiblyAsyncIterable, ThenByAsync, ToAsyncOrderedIterable, MakeAsyncHierarchyIterable, ToAsyncOrderedHierarchyIterable, IsPossiblyAsyncOrderedIterable, Registry, IsPossiblyAsyncOrderedHierarchyIterable, GetAsyncSource, GetAsyncIterator } from "./internal";
import { OrderedHierarchyIterable, HierarchyIterable, Queryable, HierarchyProvider, Hierarchical, Grouping, PossiblyAsyncOrderedHierarchyIterable, PossiblyAsyncHierarchyIterable, PossiblyAsyncOrderedIterable, PossiblyAsyncQueryable, AsyncOrderedHierarchyIterable, AsyncOrderedIterable, PossiblyAsyncIterator, AsyncQuerySource, QuerySource, AsyncOrderedQuerySource, OrderedIterable, Page, KeyValuePair } from "./types";
import { Lookup } from "./lookup";
import { ConsumeAsyncOptions } from "./fn";
import { Query, from, OrderedHierarchyQuery, OrderedQuery, HierarchyQuery } from "./query";

/**
 * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
 *
 * @param source A `Queryable` or `AsyncQueryable` object.
 */
export function fromAsync<TNode, T extends TNode>(source: PossiblyAsyncOrderedHierarchyIterable<TNode, T>): AsyncOrderedHierarchyQuery<TNode, T>;

/**
 * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
 *
 * @param source A `Queryable` or `AsyncQueryable` object.
 */
export function fromAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyQuery<TNode, T>;

/**
 * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
 *
 * @param source A `Queryable` or `AsyncQueryable` object.
 */
export function fromAsync<T>(source: PossiblyAsyncOrderedIterable<T>): AsyncOrderedQuery<T>;

/**
 * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
 *
 * @param source A `Queryable` or `AsyncQueryable` object.
 */
export function fromAsync<T>(source: PossiblyAsyncQueryable<T>): AsyncQuery<T>;

/**
 * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
 *
 * @param source A `Queryable` or `AsyncQueryable` object.
 */
export function fromAsync<TNode, T extends TNode>(source: PossiblyAsyncOrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): AsyncOrderedHierarchyQuery<TNode, T>;

/**
 * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
 *
 * @param source A `Queryable` or `AsyncQueryable` object.
 */
export function fromAsync<TNode, T extends TNode>(source: PossiblyAsyncQueryable<T>, hierarchy: HierarchyProvider<TNode>): AsyncHierarchyQuery<TNode, T>;

/**
 * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
 *
 * @param source A `Queryable` or `AsyncQueryable` object.
 */
export function fromAsync<T>(source: PossiblyAsyncQueryable<T>, hierarchy?: HierarchyProvider<T>): AsyncQuery<T> {
    if (hierarchy) source = MakeAsyncHierarchyIterable(source, hierarchy);
    return IsPossiblyAsyncOrderedHierarchyIterable(source) ? new AsyncOrderedHierarchyQuery(source) :
        IsPossiblyAsyncHierarchyIterable(source) ? new AsyncHierarchyQuery(source) :
        IsPossiblyAsyncOrderedIterable(source) ? new AsyncOrderedQuery(source) :
        new AsyncQuery(source);
}

Registry.AsyncQuery.registerStatic("from", fromAsync);

function ofAsync<T>(...elements: (PromiseLike<T> | T)[]): AsyncQuery<T>;
function ofAsync<T>(): AsyncQuery<T> {
    return new AsyncQuery(arguments);
}

Registry.AsyncQuery.registerStatic("of", ofAsync);

Registry.addRegistry(fn);
Registry.addRegistry({ from: fromAsync, of: ofAsync });

/**
 * An `AsyncQuery` represents a series of operations that act upon an `AsyncIterable`, `Iterable`
 * or `ArrayLike`. Evaluation of these operations is deferred until the either a scalar value is
 * requested from the `AsyncQuery` or the `AsyncQuery` is iterated.
 */
@Registry.QueryConstructor("AsyncQuery")
export class AsyncQuery<T> implements AsyncQuerySource<T> {
    private _source: PossiblyAsyncQueryable<T>;

    /**
     * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
     *
     * @param source A `Queryable` or `AsyncQueryable` object.
     */
    constructor(source: PossiblyAsyncQueryable<T>) {
        assert.mustBePossiblyAsyncQueryable(source, "source");
        this._source = source instanceof AsyncQuery
            ? source._source
            : source;
    }

    [Symbol.asyncIterator](): AsyncIterator<T> {
        return GetAsyncIterator(ToPossiblyAsyncIterable(GetAsyncSource(this)));
    }

    [AsyncQuerySource.source]() {
        return this._source;
    }

    [AsyncQuerySource.create]<UNode, U extends UNode>(source: PossiblyAsyncOrderedHierarchyIterable<UNode, U>): AsyncOrderedHierarchyQuery<UNode, U>;
    [AsyncQuerySource.create]<UNode, U extends UNode>(source: PossiblyAsyncHierarchyIterable<UNode, U>): AsyncHierarchyQuery<UNode, U>;
    [AsyncQuerySource.create]<U>(source: PossiblyAsyncOrderedIterable<U>): AsyncOrderedQuery<U>;
    [AsyncQuerySource.create]<U>(source: PossiblyAsyncQueryable<U>): AsyncQuery<U>;
    [AsyncQuerySource.create]<U>(source: PossiblyAsyncQueryable<U>): AsyncQuerySource<U> {
        return fromAsync(source);
    }

    [AsyncQuerySource.createSync]<UNode, U extends UNode>(value: OrderedHierarchyIterable<UNode, U>): OrderedHierarchyQuery<UNode, U>;
    [AsyncQuerySource.createSync]<UNode, U extends UNode>(value: HierarchyIterable<UNode, U>): HierarchyQuery<UNode, U>;
    [AsyncQuerySource.createSync]<U>(value: OrderedIterable<U>): OrderedQuery<U>;
    [AsyncQuerySource.createSync]<U>(value: Queryable<U>): Query<U>;
    [AsyncQuerySource.createSync]<U>(source: Queryable<U>): QuerySource<U> {
        return from(source);
    }
}

export declare namespace AsyncQuery {
    /**
     * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
     *
     * @param source A `Queryable` or `AsyncQueryable` object.
     */
    export function from<TNode, T extends TNode>(source: PossiblyAsyncOrderedHierarchyIterable<TNode, T>): AsyncOrderedHierarchyQuery<TNode, T>;

    /**
     * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
     *
     * @param source A `Queryable` or `AsyncQueryable` object.
     */
    export function from<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
     *
     * @param source A `Queryable` or `AsyncQueryable` object.
     */
    export function from<T>(source: PossiblyAsyncOrderedIterable<T>): AsyncOrderedQuery<T>;

    /**
     * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
     *
     * @param source A `Queryable` or `AsyncQueryable` object.
     */
    export function from<T>(source: PossiblyAsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
     *
     * @param source A `Queryable` or `AsyncQueryable` object.
     */
    export function from<TNode, T extends TNode>(source: PossiblyAsyncOrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): AsyncOrderedHierarchyQuery<TNode, T>;

    /**
     * Creates an `AsyncQuery` from a `Queryable` or `AsyncIterable` source.
     *
     * @param source A `Queryable` or `AsyncQueryable` object.
     */
    export function from<TNode, T extends TNode>(source: PossiblyAsyncQueryable<T>, hierarchy: HierarchyProvider<TNode>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a `Query` for the provided elements.
     *
     * @param elements The elements of the `Query`.
     */
    export function of<T>(...elements: (PromiseLike<T> | T)[]): AsyncQuery<T>;

    /**
     * Creates a `Query` with no elements.
     */
    export function empty<T>(): AsyncQuery<T>;

    /**
     * Creates a `Query` over a single element.
     *
     * @param value The only element for the `Query`.
     */
    export function once<T>(value: PromiseLike<T> | T): AsyncQuery<T>;

    /**
     * Creates a `Query` for a value repeated a provided number of times.
     *
     * @param value The value for each element of the `Query`.
     * @param count The number of times to repeat the value.
     */
    export function repeat<T>(value: PromiseLike<T> | T, count: number): AsyncQuery<T>;

    /**
     * Creates a `Query` that repeats the provided value forever.
     *
     * @param value The value for each element of the `Query`.
     */
    export function continuous<T>(value: PromiseLike<T> | T): AsyncQuery<T>;

    /**
     * Creates a `Query` whose values are provided by a callback executed a provided number of
     * times.
     *
     * @param count The number of times to execute the callback.
     * @param generator The callback to execute.
     */
    export function generate<T>(count: number, generator: (offset: number) => PromiseLike<T> | T): AsyncQuery<T>;

    /**
     * Creates a HierarchyQuery from a root node and a HierarchyProvider.
     *
     * @param root The root node of the hierarchy.
     * @param hierarchy A `HierarchyProvider` object.
     */
    export function hierarchy<TNode, T extends TNode>(root: PromiseLike<T> | T, hierarchy: HierarchyProvider<TNode>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a `Query` that, when iterated, consumes the provided `Iterator`.
     *
     * @param iterator An `Iterator` object.
     */
    export function consume<T>(iterator: PossiblyAsyncIterator<T>, options?: ConsumeAsyncOptions): AsyncQuery<T>;

    /**
     * Creates a `Query` that iterates the elements from one of two sources based on the result of a
     * lazily evaluated condition.
     *
     * @param condition A callback used to choose a source.
     * @param thenQueryable The source to use when the callback evaluates to `true`.
     * @param elseQueryable The source to use when the callback evaluates to `false`.
     */
    function _if<T>(condition: () => boolean, thenQueryable: PossiblyAsyncQueryable<T>, elseQueryable?: PossiblyAsyncQueryable<T>): AsyncQuery<T>;
    export { _if as if };

    /**
     * Creates a `Query` that iterates the elements from sources picked from a list based on the
     * result of a lazily evaluated choice.
     *
     * @param chooser A callback used to choose a source.
     * @param choices A list of sources
     * @param otherwise A default source to use when another choice could not be made.
     */
    export function choose<K, T>(chooser: () => K, choices: PossiblyAsyncQueryable<[K, PossiblyAsyncQueryable<T>]>, otherwise?: PossiblyAsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Creates a `Query` for the own property keys of an object.
     *
     * @param source An object.
     */
    export function objectKeys<T extends object>(source: PromiseLike<T> | T): AsyncQuery<Extract<keyof T, string>>;

    /**
     * Creates a `Query` for the own property values of an object.
     *
     * @param source An object.
     */
    export function objectValues<T extends object>(source: PromiseLike<T> | T): AsyncQuery<T[Extract<keyof T, string>]>;

    /**
     * Creates a `Query` for the own property key-value pairs of an object.
     *
     * @param source An object.
     */
    export function objectEntries<T extends object>(source: PromiseLike<T> | T): AsyncQuery<KeyValuePair<T, Extract<keyof T, string>>>;
}

export interface AsyncQuery<T> {
    // #region Subqueries

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    filter<U extends T>(predicate: (element: T, offset: number) => element is U): AsyncQuery<U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    filter(predicate: (element: T, offset: number) => boolean): AsyncQuery<T>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     * This is an alias for `filter`.
     *
     * @param predicate A callback used to match each element.
     */
    where<U extends T>(predicate: (element: T, offset: number) => element is U): AsyncQuery<U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     * This is an alias for `filter`.
     *
     * @param predicate A callback used to match each element.
     */
    where(predicate: (element: T, offset: number) => boolean): AsyncQuery<T>;

    /**
     * Creates a subquery by applying a callback to each element.
     *
     * @param selector A callback used to map each element.
     */
    map<U>(selector: (element: T, offset: number) => U): AsyncQuery<U>;

    /**
     * Creates a subquery by applying a callback to each element.
     * This is an alias for `map`.
     *
     * @param selector A callback used to map each element.
     */
    select<U>(selector: (element: T, offset: number) => U): AsyncQuery<U>;

    /**
     * Creates a subquery that iterates the results of applying a callback to each element.
     *
     * @param projection A callback used to map each element into an iterable.
     */
    flatMap<U>(projection: (element: T) => PossiblyAsyncQueryable<U>): AsyncQuery<U>;

    /**
     * Creates a subquery that iterates the results of applying a callback to each element.
     * This is an alias for `flatMap`.
     *
     * @param projection A callback used to map each element into an iterable.
     */
    selectMany<U>(projection: (element: T) => PossiblyAsyncQueryable<U>): AsyncQuery<U>;

    /**
     * Creates a subquery that iterates the results of recursively expanding the
     * elements of the source.
     *
     * @param projection A callback used to recusively expand each element.
     */
    expand(projection: (element: T) => PossiblyAsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     *
     * @param callback The callback to invoke.
     */
    do(callback: (element: T, offset: number) => void): AsyncQuery<T>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     * This is an alias for `do`.
     *
     * @param callback The callback to invoke.
     */
    tap(callback: (element: T, offset: number) => void): AsyncQuery<T>;

    /**
     * Pass the entire query to the provided callback, creating a new query from the result.
     *
     * @param callback A callback function.
     */
    through<UNode, U extends UNode>(callback: (source: this) => PossiblyAsyncOrderedHierarchyIterable<UNode, U>): AsyncOrderedHierarchyQuery<UNode, U>;

    /**
     * Pass the entire query to the provided callback, creating a new query from the result.
     *
     * @param callback A callback function.
     */
    through<UNode, U extends UNode>(callback: (source: this) => PossiblyAsyncHierarchyIterable<UNode, U>): AsyncHierarchyQuery<UNode, U>;

    /**
     * Pass the entire query to the provided callback, creating a new query from the result.
     *
     * @param callback A callback function.
     */
    through<U>(callback: (source: this) => PossiblyAsyncOrderedIterable<U>): AsyncOrderedQuery<U>;

    /**
     * Pass the entire query to the provided callback, creating a new query from the result.
     *
     * @param callback A callback function.
     */
    through<U>(callback: (source: this) => PossiblyAsyncQueryable<U>): AsyncQuery<U>;

    /**
     * Creates a subquery whose elements are in the reverse order.
     */
    reverse(): AsyncQuery<T>;

    /**
     * Creates a subquery containing all elements except the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     */
    skip(count: number): AsyncQuery<T>;

    /**
     * Creates a subquery containing all elements except the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     */
    skipRight(count: number): AsyncQuery<T>;

    /**
     * Creates a subquery containing all elements except the first elements that match
     * the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    skipWhile(predicate: (element: T) => boolean): AsyncQuery<T>;

    /**
     * Creates a subquery containing the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     */
    take(count: number): AsyncQuery<T>;

    /**
     * Creates a subquery containing the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     */
    takeRight(count: number): AsyncQuery<T>;

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    takeWhile<U extends T>(predicate: (element: T) => element is U): AsyncQuery<U>;

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    takeWhile(predicate: (element: T) => boolean): AsyncQuery<T>;

    /**
     * Creates a subquery for the set intersection of this `Query` and another `Queryable`.
     *
     * @param right A `Queryable` object.
     */
    intersect(right: PossiblyAsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Creates a subquery for the set union of this `Query` and another `Queryable`.
     *
     * @param right A `Queryable` object.
     */
    union(right: PossiblyAsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Creates a subquery for the set difference between this and another Queryable.
     *
     * @param right A `Queryable` object.
     */
    except(right: PossiblyAsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Creates a subquery for the set difference between this and another Queryable.
     *
     * This is an alias for `except`.
     *
     * @param right A `Queryable` object.
     */
    relativeComplement(right: PossiblyAsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Creates a subquery for the symmetric difference between this and another `Queryable`.
     *
     * @param right A `Queryable` object.
     */
    symmetricDifference(right: PossiblyAsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Creates a subquery for the symmetric difference between this and another `Queryable`.
     *
     * This is an alias for `symmetricDifference`.
     *
     * @param right A `Queryable` object.
     */
    xor(right: PossiblyAsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Creates a subquery that concatenates this Query with another Queryable.
     *
     * @param right A `Queryable` object.
     */
    concat(right: PossiblyAsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Creates a subquery for the distinct elements of this Query.
     */
    distinct(): AsyncQuery<T>;

    /**
     * Creates a subquery for the elements of this Query with the provided value appended to the end.
     *
     * @param value The value to append.
     */
    append(value: T): AsyncQuery<T>;

    /**
     * Creates a subquery for the elements of this Query with the provided value prepended to the beginning.
     *
     * @param value The value to prepend.
     */
    prepend(value: T): AsyncQuery<T>;

    /**
     * Creates a subquery for the elements of this Query with the provided range
     * patched into the results.
     *
     * @param start The offset at which to patch the range.
     * @param skipCount The number of elements to skip from start.
     * @param range The range to patch into the result.
     */
    patch(start: number, skipCount: number, range: PossiblyAsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Creates a subquery that contains the provided default value if this Query
     * contains no elements.
     *
     * @param defaultValue The default value.
     */
    defaultIfEmpty(defaultValue: T): AsyncQuery<T>;

    /**
     * Creates a subquery that splits this Query into one or more pages.
     * While advancing from page to page is evaluated lazily, the elements of the page are
     * evaluated eagerly.
     *
     * @param pageSize The number of elements per page.
     */
    pageBy(pageSize: number): AsyncQuery<Page<T>>;

    /**
     * Creates a subquery that combines this Query with another Queryable by combining elements
     * in tuples.
     *
     * @param right A `Queryable` object.
     */
    zip<U>(right: PossiblyAsyncQueryable<U>): AsyncQuery<[T, U]>;

    /**
     * Creates a subquery that combines this Query with another Queryable by combining elements
     * using the supplied callback.
     *
     * @param right A `Queryable` object.
     * @param selector A callback used to combine two elements.
     */
    zip<U, R>(right: PossiblyAsyncQueryable<U>, selector: (left: T, right: U) => R): AsyncQuery<R>;

    /**
     * Creates an ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    orderBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedQuery<T>;

    /**
     * Creates an ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    orderByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedQuery<T>;

    /**
     * Creates a subquery whose elements are the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     */
    spanMap<K>(keySelector: (element: T) => K): AsyncQuery<Grouping<K, T>>;

    /**
     * Creates a subquery whose values are computed from each element of the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     */
    spanMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): AsyncQuery<Grouping<K, V>>;

    /**
     * Creates a subquery whose values are computed from the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @param spanSelector A callback used to select a result from a contiguous range.
     */
    spanMap<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V, spanSelector: (key: K, elements: Query<V>) => R): AsyncQuery<R>;

    /**
     * Groups each element of this Query by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     */
    groupBy<K>(keySelector: (element: T) => K): AsyncQuery<Grouping<K, T>>;

    /**
     * Groups each element by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     */
    groupBy<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): AsyncQuery<Grouping<K, V>>;

    /**
     * Groups each element by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @param resultSelector A callback used to select a result from a group.
     */
    groupBy<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R): AsyncQuery<R>;

    /**
     * Creates a grouped subquery for the correlated elements of this `Query` and another `Queryable` object.
     *
     * @param inner A `Queryable` object.
     * @param outerKeySelector A callback used to select the key for an element in this `Query`.
     * @param innerKeySelector A callback used to select the key for an element in the other `Queryable` object.
     * @param resultSelector A callback used to select the result for the correlated elements.
     */
    groupJoin<I, K, R>(inner: PossiblyAsyncQueryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: Query<I>) => R): AsyncQuery<R>;

    /**
     * Creates a subquery for the correlated elements of this `Query` and another `Queryable`.
     *
     * @param inner A `Queryable` object.
     * @param outerKeySelector A callback used to select the key for an element in this Query.
     * @param innerKeySelector A callback used to select the key for an element in the other Queryable.
     * @param resultSelector A callback used to select the result for the correlated elements.
     */
    join<I, K, R>(inner: PossiblyAsyncQueryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: I) => R): AsyncQuery<R>;

    /**
     * Creates a subquery for the correlated elements of this `Query` and another `Queryable`.
     *
     * @param inner A `Queryable` object.
     * @param outerKeySelector A callback used to select the key for an element in this Query.
     * @param innerKeySelector A callback used to select the key for an element in the other Queryable.
     * @param resultSelector A callback used to select the result for the correlated elements.
     */
    fullJoin<I, K, R>(inner: PossiblyAsyncQueryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T | undefined, inner: I | undefined) => R): AsyncQuery<R>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element.
     *
     * @param accumulator The callback used to compute each result.
     */
    scan(accumulator: (current: T, element: T, offset: number) => T): AsyncQuery<T>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element.
     *
     * @param accumulator The callback used to compute each result.
     * @param seed An optional seed value.
     */
    scan<U>(accumulator: (current: U, element: T, offset: number) => U, seed: U): AsyncQuery<U>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.
     *
     * @param accumulator The callback used to compute each result.
     */
    scanRight(accumulator: (current: T, element: T, offset: number) => T): AsyncQuery<T>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.
     *
     * @param accumulator The callback used to compute each result.
     * @param seed An optional seed value.
     */
    scanRight<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): AsyncQuery<U>;

    /**
     * Creates a HierarchyQuery using the provided HierarchyProvider.
     *
     * @param hierarchy A HierarchyProvider.
     */
    toHierarchy(hierarchy: HierarchyProvider<T>): AsyncHierarchyQuery<T>;

    // #endregion Subqueries

    // #region Scalars

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     */
    reduce(accumulator: (current: T, element: T, offset: number) => T): Promise<T>;

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     */
    reduce<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): Promise<U>;

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @param resultSelector An optional callback used to compute the final result.
     */
    reduce<U, R>(accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): Promise<R>;

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     */
    reduceRight(accumulator: (current: T, element: T, offset: number) => T): Promise<T>;

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     */
    reduceRight<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): Promise<U>;

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @param resultSelector An optional callback used to compute the final result.
     */
    reduceRight<U, R>(accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): Promise<R>;

    /**
     * Counts the number of elements in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    count(predicate?: (element: T) => boolean): Promise<number>;

    /**
     * Gets the first element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    first<U extends T>(predicate: (element: T) => element is U): Promise<U | undefined>;

    /**
     * Gets the first element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    first(predicate?: (element: T) => boolean): Promise<T | undefined>;

    /**
     * Gets the last element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    last<U extends T>(predicate: (element: T) => element is U): Promise<U | undefined>;

    /**
     * Gets the last element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    last(predicate?: (element: T) => boolean): Promise<T | undefined>;

    /**
     * Gets the only element in the Query, or returns undefined.
     *
     * @param predicate An optional callback used to match each element.
     */
    single<U extends T>(predicate: (element: T) => element is U): Promise<U | undefined>;

    /**
     * Gets the only element in the Query, or returns undefined.
     *
     * @param predicate An optional callback used to match each element.
     */
    single(predicate?: (element: T) => boolean): Promise<T | undefined>;

    /**
     * Gets the minimum element in the query, optionally comparing elements using the supplied
     * callback.
     *
     * @param comparison An optional callback used to compare two elements.
     */
    min(comparison?: (x: T, y: T) => number): Promise<T | undefined>;

    /**
     * Gets the maximum element in the query, optionally comparing elements using the supplied
     * callback.
     *
     * @param comparison An optional callback used to compare two elements.
     */
    max(comparison?: (x: T, y: T) => number): Promise<T | undefined>;

    sum(selector: (element: T) => number): Promise<number>;
    sum(): Promise<T extends number ? number : never>;

    average(selector: (element: T) => number): Promise<number>;
    average(): Promise<T extends number ? number : never>; // no literal for NaN

    /**
     * Computes a scalar value indicating whether the Query contains any elements,
     * optionally filtering the elements using the supplied callback.
     *
     * @param predicate An optional callback used to match each element.
     */
    some(predicate?: (element: T) => boolean): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether all elements of the Query
     * match the supplied callback.
     *
     * @param predicate A callback used to match each element.
     */
    every(predicate: (element: T) => boolean): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether every element in this Query corresponds to a matching element
     * in another Queryable at the same position.
     *
     * @param right A `Queryable` object.
     * @param equalityComparison An optional callback used to compare the equality of two elements.
     */
    corresponds(right: PossiblyAsyncQueryable<T>, equalityComparison?: (left: T, right: T) => boolean): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether the provided value is included in the query.
     *
     * @param value A value.
     */
    includes(value: T): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether the elements of this Query include
     * an exact sequence of elements from another Queryable.
     *
     * @param right A `Queryable` object.
     */
    includesSequence(right: PossiblyAsyncQueryable<T>): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether the elements of this Query include
     * an exact sequence of elements from another Queryable.
     *
     * @param right A `Queryable` object.
     * @param equalityComparison A callback used to compare the equality of two elements.
     */
    includesSequence<U>(right: PossiblyAsyncQueryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether the elements of this Query start
     * with the same sequence of elements in another Queryable.
     *
     * @param right A `Queryable` object.
     */
    startsWith(right: PossiblyAsyncQueryable<T>): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether the elements of this Query start
     * with the same sequence of elements in another Queryable.
     *
     * @param right A `Queryable` object.
     * @param equalityComparison A callback used to compare the equality of two elements.
     */
    startsWith<U>(right: PossiblyAsyncQueryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether the elements of this Query end
     * with the same sequence of elements in another Queryable.
     *
     * @param right A `Queryable` object.
     */
    endsWith(right: PossiblyAsyncQueryable<T>): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether the elements of this Query end
     * with the same sequence of elements in another Queryable.
     *
     * @param right A `Queryable` object.
     * @param equalityComparison A callback used to compare the equality of two elements.
     */
    endsWith<U>(right: PossiblyAsyncQueryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;

    /**
     * Finds the value in the Query at the provided offset. A negative offset starts from the
     * last element.
     *
     * @param offset An offset.
     */
    elementAt(offset: number): Promise<T | undefined>;

    /**
     * Finds the value in the Query at the provided offset. A negative offset starts from the
     * last element.
     *
     * This is an alias for `elementAt`.
     *
     * @param offset An offset.
     */
    nth(offset: number): Promise<T | undefined>;

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
    span<U extends T>(predicate: (element: T) => element is U): Promise<[Query<U>, AsyncQuery<T>]>;

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
    span(predicate: (element: T) => boolean): Promise<[Query<T>, AsyncQuery<T>]>;

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
    break(predicate: (element: T) => boolean): Promise<[Query<T>, AsyncQuery<T>]>;

    /**
     * Invokes a callback for each element of the query.
     *
     * @param callback The callback to invoke.
     */
    forEach(callback: (element: T, offset: number) => void): Promise<void>;

    /**
     * Iterates over all of the elements in the query, ignoring the results.
     */
    drain(): Promise<void>;

    /**
     * Eagerly evaluate the query, returning a new `Query`.
     */
    eval(): Promise<Query<T>>;

    /**
     * Creates an Array for the elements of the Query.
     */
    toArray(elementSelector?: (element: T) => T): Promise<T[]>;

    /**
     * Creates an Array for the elements of the Query.
     *
     * @param elementSelector A callback that selects a value for each element.
     */
    toArray<V>(elementSelector: (element: T) => V): Promise<V[]>;

    /**
     * Creates a `Set` for the elements of the `Query`.
     */
    toSet(elementSelector?: (element: T) => T): Promise<Set<T>>;

    /**
     * Creates a `Set` for the elements of the `Query`.
     *
     * @param elementSelector A callback that selects a value for each element.
     */
    toSet<V>(elementSelector: (element: T) => V): Promise<Set<V>>;

    /**
     * Creates a `Map` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     */
    toMap<K>(keySelector: (element: T) => K, elementSelector?: (element: T) => T): Promise<Map<K, T>>;

    /**
     * Creates a `Map` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     */
    toMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Promise<Map<K, V>>;

    /**
     * Creates a `Lookup` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     */
    toLookup<K>(keySelector: (element: T) => K, elementSelector?: (element: T) => T): Promise<Lookup<K, T>>;

    /**
     * Creates a `Lookup` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     */
    toLookup<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Promise<Lookup<K, V>>;

    /**
     * Creates an `object` for the elements of the `Query`.
     *
     * @param prototype The prototype for the object.
     * @param keySelector A callback used to select a key for each element.
     */
    toObject(prototype: object | null, keySelector: (element: T) => PropertyKey): Promise<object>;

    /**
     * Creates an `object` for the elements of the `Query`.
     *
     * @param prototype The prototype for the object.
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     */
    toObject<V>(prototype: object | null, keySelector: (element: T) => PropertyKey, elementSelector: (element: T) => V): Promise<object>;

    // #endregion Scalars
}

/**
 * Represents a sequence of hierarchically organized values.
 */
@Registry.QueryConstructor("AsyncHierarchyQuery")
export class AsyncHierarchyQuery<TNode, T extends TNode = TNode> extends AsyncQuery<T> implements AsyncHierarchyQuery<TNode, T> {
    constructor(source: PossiblyAsyncHierarchyIterable<TNode, T>);
    constructor(source: PossiblyAsyncQueryable<T>, hierarchy: HierarchyProvider<TNode>);
    constructor(source: PossiblyAsyncQueryable<T> | HierarchyIterable<TNode, T>, hierarchy?: HierarchyProvider<TNode>) {
        if (hierarchy) {
            assert.mustBePossiblyAsyncQueryable(source, "source");
            assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
            source = MakeAsyncHierarchyIterable(source, hierarchy);
        }
        else {
            assert.mustBePossiblyAsyncHierarchyIterable(source as PossiblyAsyncHierarchyIterable<TNode, T>, "source");
        }
        super(source);
    }

    [Hierarchical.hierarchy](): HierarchyProvider<TNode> {
        return GetHierarchy(GetAsyncSource(this));
    }
}

export declare namespace AsyncHierarchyQuery {
}

export interface AsyncHierarchyQuery<TNode, T extends TNode = TNode> {
    // #region Subqueries

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    filter<U extends T>(predicate: (element: T, offset: number) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    filter(predicate: (element: T, offset: number) => boolean): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    where<U extends T>(predicate: (element: T, offset: number) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    where(predicate: (element: T, offset: number) => boolean): AsyncHierarchyQuery<TNode, T>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     *
     * @param callback The callback to invoke.
     */
    do(callback: (element: T, offset: number) => void): AsyncHierarchyQuery<TNode, T>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     * This is an alias for `do`.
     *
     * @param callback The callback to invoke.
     */
    tap(callback: (element: T, offset: number) => void): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery whose elements are in the reverse order.
     */
    reverse(): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing all elements except the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     */
    skip(count: number): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing all elements except the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     */
    skipRight(count: number): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing all elements except the first elements that match
     * the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    skipWhile(predicate: (element: T) => boolean): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     */
    take(count: number): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     */
    takeRight(count: number): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    takeWhile<U extends T>(predicate: (element: T) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    takeWhile(predicate: (element: T) => boolean): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the set intersection of this `Query` and another `Queryable`.
     *
     * @param right A `Queryable` object.
     */
    intersect(right: PossiblyAsyncQueryable<T>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the set union of this `Query` and another `Queryable`.
     *
     * @param right A `Queryable` object.
     */
    union(right: PossiblyAsyncQueryable<T>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the set difference between this `Query` and another `Queryable`.
     *
     * @param right A `Queryable` object.
     */
    except(right: PossiblyAsyncQueryable<T>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the set difference between this `Query` and another `Queryable`.
     *
     * This is an alias for `except`.
     *
     * @param right A `Queryable` object.
     */
    relativeComplement(right: PossiblyAsyncQueryable<T>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the symmetric difference between this and another `Queryable`.
     *
     * @param right A `Queryable` object.
     */
    symmetricDifference(right: PossiblyAsyncQueryable<T>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the symmetric difference between this and another `Queryable`.
     *
     * This is an alias for `symmetricDifference`.
     *
     * @param right A `Queryable` object.
     */
    xor(right: PossiblyAsyncQueryable<T>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery that concatenates this `Query` with another `Queryable`.
     *
     * @param right A `Queryable` object.
     */
    concat(right: PossiblyAsyncQueryable<T>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery that concatenates this `Query` with another `Queryable`.
     */
    distinct(): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the elements of this `Query` with the provided value appended to the end.
     *
     * @param value The value to append.
     */
    append(value: T): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the elements of this `Query` with the provided value prepended to the beginning.
     *
     * @param value The value to prepend.
     */
    prepend(value: T): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the elements of this `Query` with the provided range
     * patched into the results.
     *
     * @param start The offset at which to patch the range.
     * @param skipCount The number of elements to skip from start.
     * @param range The range to patch into the result.
     */
    patch(start: number, skipCount: number, range: PossiblyAsyncQueryable<T>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery that contains the provided default value if this Query
     * contains no elements.
     *
     * @param defaultValue The default value.
     */
    defaultIfEmpty(defaultValue: T): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates an ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    orderBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyQuery<T>;

    /**
     * Creates an ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    orderByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyQuery<T>;

    /**
     * Creates a subquery for the roots of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    root<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the roots of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    root(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the ancestors of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    ancestors<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the ancestors of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    ancestors(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the ancestors of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    ancestorsAndSelf<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the ancestors of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    ancestorsAndSelf(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the descendants of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    descendants<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the descendants of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    descendants(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the descendants of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    descendantsAndSelf<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the descendants of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    descendantsAndSelf(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for this query.
     *
     * @param predicate A callback used to filter the results.
     */
    self<U extends T>(predicate: (element: T) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for this query.
     *
     * @param predicate A callback used to filter the results.
     */
    self<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for this query.
     *
     * @param predicate A callback used to filter the results.
     */
    self(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the parents of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    parents<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the parents of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    parents(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the children of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    children<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the children of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    children(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the siblings of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    siblings<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    siblings(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the siblings of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    siblingsAndSelf<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    siblingsAndSelf(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the siblings before each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    siblingsBeforeSelf<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings before each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    siblingsBeforeSelf(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the siblings after each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    siblingsAfterSelf<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings after each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     */
    siblingsAfterSelf(predicate?: (element: TNode) => boolean): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the child of each element at the specified offset. A negative offset
     * starts from the last child.
     *
     * @param offset The offset for the child.
     */
    nthChild(offset: number): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the top-most elements. Elements that are a descendant of any other
     * element are removed.
     */
    topMost(): AsyncHierarchyQuery<TNode>;

    /**
     * Creates a subquery for the bottom-most elements. Elements that are an ancestor of any other
     * element are removed.
     */
    bottomMost(): AsyncHierarchyQuery<TNode>;

    // #endregion Subqueries

    // #region Scalars

    /**
     * Eagerly evaluate the query, returning a new `Query`.
     */
    eval(): Promise<HierarchyQuery<T>>;

    // #endregion
}

/**
 * Represents an ordered sequence of elements.
 */
@Registry.QueryConstructor("AsyncOrderedQuery")
export class AsyncOrderedQuery<T> extends AsyncQuery<T> implements AsyncOrderedQuerySource<T> {
    constructor(source: PossiblyAsyncOrderedIterable<T>) {
        assert.mustBePossiblyAsyncOrderedIterable(source, "source");
        super(ToAsyncOrderedIterable(source));
    }

    [AsyncOrderedIterable.thenByAsync]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedIterable<T> {
        return ThenByAsync(this["_source"] as AsyncOrderedIterable<T>, keySelector, comparison, descending);
    }
}

export declare namespace AsyncOrderedQuery {
}

export interface AsyncOrderedQuery<T> {
    /**
     * Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedQuery<T>;

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedQuery<T>;
}

/**
 * Represents an ordered sequence of hierarchically organized values.
 */
@Registry.QueryConstructor("AsyncOrderedHierarchyQuery")
export class AsyncOrderedHierarchyQuery<TNode, T extends TNode = TNode> extends AsyncHierarchyQuery<TNode, T> implements AsyncOrderedHierarchyIterable<TNode, T> {
    constructor(source: PossiblyAsyncOrderedHierarchyIterable<TNode, T>);
    constructor(source: PossiblyAsyncOrderedIterable<T>, hierarchy: HierarchyProvider<TNode>);
    constructor(source: PossiblyAsyncOrderedIterable<T> | OrderedHierarchyIterable<TNode, T>, hierarchy?: HierarchyProvider<TNode>) {
        assert.mustBePossiblyAsyncOrderedIterable(source, "source");
        if (hierarchy === undefined && IsPossiblyAsyncHierarchyIterable(source)) {
            super(ToAsyncOrderedHierarchyIterable(source));
        }
        else {
            super(ToAsyncOrderedIterable(source), hierarchy!);
        }
    }

    [AsyncOrderedIterable.thenByAsync]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedHierarchyIterable<TNode, T> {
        return ThenByAsync(this["_source"] as AsyncOrderedHierarchyIterable<TNode, T>, keySelector, comparison, descending);
    }
}

export declare namespace AsyncOrderedHierarchyQuery {
}

export interface AsyncOrderedHierarchyQuery<TNode, T extends TNode = TNode> {
    /**
     * Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyQuery<TNode, T>;

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     */
    thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyQuery<TNode, T>;
}
