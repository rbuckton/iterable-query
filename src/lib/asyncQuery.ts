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
/** @module "iterable-query" */

import * as fn from "./fn";
import { assert, IsPossiblyAsyncHierarchyIterable, GetHierarchy, ToPossiblyAsyncIterable, ThenByAsync, ToAsyncOrderedIterable, MakeAsyncHierarchyIterable, ToAsyncOrderedHierarchyIterable, IsPossiblyAsyncOrderedIterable, IsPossiblyAsyncOrderedHierarchyIterable, GetAsyncSource, GetAsyncIterator, AsyncQuerySource } from "./internal";
import { OrderedHierarchyIterable, HierarchyIterable, Queryable, HierarchyProvider, Hierarchical, Grouping, PossiblyAsyncOrderedHierarchyIterable, PossiblyAsyncHierarchyIterable, PossiblyAsyncOrderedIterable, AsyncQueryable, AsyncOrderedHierarchyIterable, AsyncOrderedIterable, Page, KeyValuePair, AsyncHierarchyIterable, AsyncChoice, QueriedType } from "./types";
import { Lookup } from "./lookup";
import { ConsumeAsyncOptions } from "./fn";
import { Query, from } from "./query";

/**
 * Flows the base type of a [[Query]] as an unordered query with a new iterated type.
 */
export type AsyncUnorderedFlow<S extends AsyncQueryable<any>, T> =
    S extends Hierarchical<infer TNode> ? AsyncHierarchyQuery<TNode, TNode & T> :
    AsyncQuery<T>;

/**
 * Flows the base type of a [[Query]] as an ordered query with a new iterated type.
 */
export type AsyncOrderedFlow<S extends AsyncQueryable<any>, T> =
    S extends Hierarchical<infer TNode> ? AsyncOrderedHierarchyQuery<TNode, TNode & T> :
    AsyncOrderedQuery<T>;

/**
 * Flows the base type of a [[Query]] as a hierarchical query with a new iterated type.
 */
export type AsyncHierarchyFlow<S extends AsyncQueryable<any>, T> =
    S extends AsyncOrderedIterable<T> ? AsyncOrderedHierarchyQuery<T, T> :
    AsyncHierarchyQuery<T, T>;

/**
 * Flows the base type of a [[Query]] with a new iterated type.
 */
export type AsyncFlow<S extends AsyncQueryable<any>, T> =
    S extends AsyncOrderedIterable<T> ? AsyncOrderedFlow<S, T> :
    AsyncUnorderedFlow<S, T>;

/**
 * Creates an [[AsyncQuery]] from an [[AsyncQueryable]] source.
 *
 * @param source An [[AsyncQueryable]] object.
 */
export function fromAsync<TNode, T extends TNode>(source: PossiblyAsyncOrderedHierarchyIterable<TNode, T>): AsyncOrderedHierarchyQuery<TNode, T>;

/**
 * Creates an [[AsyncQuery]] from an [[AsyncQueryable]] source.
 *
 * @param source An [[AsyncQueryable]] object.
 */
export function fromAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyQuery<TNode, T>;

/**
 * Creates an [[AsyncQuery]] from an [[AsyncQueryable]] source.
 *
 * @param source An [[AsyncQueryable]] object.
 */
export function fromAsync<T>(source: PossiblyAsyncOrderedIterable<T>): AsyncOrderedQuery<T>;

/**
 * Creates an [[AsyncQuery]] from an [[AsyncQueryable]] source.
 *
 * @param source An [[AsyncQueryable]] object.
 */
export function fromAsync<T>(source: AsyncQueryable<T>): AsyncQuery<T>;

/**
 * Creates an `AsyncHierarchyQuery` from an [[AsyncQueryable]] source.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param hierarchy A `HierarchyProvider` object.
 */
export function fromAsync<TNode, T extends TNode>(source: PossiblyAsyncOrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): AsyncOrderedHierarchyQuery<TNode, T>;

/**
 * Creates an `AsyncHierarchyQuery` from an [[AsyncQueryable]] source.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param hierarchy A `HierarchyProvider` object.
 */
export function fromAsync<TNode, T extends TNode>(source: AsyncQueryable<T>, hierarchy: HierarchyProvider<TNode>): AsyncHierarchyQuery<TNode, T>;

/**
 * Creates an `AsyncHierarchyQuery` from an [[AsyncQueryable]] source.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param hierarchy A `HierarchyProvider` object.
 */
export function fromAsync<T>(source: AsyncQueryable<T> | PossiblyAsyncOrderedHierarchyIterable<T> | PossiblyAsyncOrderedIterable<T> | PossiblyAsyncHierarchyIterable<T>, hierarchy?: HierarchyProvider<T>): AsyncQuery<T> {
    if (hierarchy) source = MakeAsyncHierarchyIterable(source, hierarchy);
    return IsPossiblyAsyncOrderedHierarchyIterable(source) ? new AsyncOrderedHierarchyQuery(source) :
        IsPossiblyAsyncHierarchyIterable(source) ? new AsyncHierarchyQuery(source) :
        IsPossiblyAsyncOrderedIterable(source) ? new AsyncOrderedQuery(source) :
        new AsyncQuery(source);
}

/**
 * An [[AsyncQuery]] represents a series of operations that act upon an [[AsyncIterable]], [[Iterable]]
 * or `ArrayLike`. Evaluation of these operations is deferred until the either a scalar value is
 * requested from the [[AsyncQuery]] or the [[AsyncQuery]] is iterated.
 */
export class AsyncQuery<T> implements AsyncIterable<T> /*, AsyncQuerySource<T>*/ {
    private _source: AsyncQueryable<T>;

    /**
     * Creates an [[AsyncQuery]] from an [[AsyncQueryable]] source.
     *
     * @param source An [[AsyncQueryable]] object.
     */
    constructor(source: AsyncQueryable<T>) {
        assert.mustBeAsyncQueryable(source, "source");
        this._source = source instanceof AsyncQuery
            ? source._source
            : source;
    }

    [Symbol.asyncIterator](): AsyncIterator<T> {
        return GetAsyncIterator(ToPossiblyAsyncIterable(GetAsyncSource(this)));
    }

    // #region Query
    /**
     * Creates an [[AsyncQuery]] from an [[AsyncQueryable]] source.
     *
     * @param source An [[AsyncQueryable]] object.
     * @category Query
     */
    static from<TNode, T extends TNode>(source: PossiblyAsyncOrderedHierarchyIterable<TNode, T>): AsyncOrderedHierarchyQuery<TNode, T>;

    /**
     * Creates an [[AsyncQuery]] from an [[AsyncQueryable]] source.
     *
     * @param source An [[AsyncQueryable]] object.
     * @category Query
     */
    static from<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyQuery<TNode, T>;

    /**
     * Creates an [[AsyncQuery]] from an [[AsyncQueryable]] source.
     *
     * @param source An [[AsyncQueryable]] object.
     * @category Query
     */
    static from<T>(source: PossiblyAsyncOrderedIterable<T>): AsyncOrderedQuery<T>;

    /**
     * Creates an [[AsyncQuery]] from an [[AsyncQueryable]] source.
     *
     * @param source An [[AsyncQueryable]] object.
     * @category Query
     */
    static from<T>(source: AsyncQueryable<T>): AsyncQuery<T>;

    /**
     * Creates an `AsyncHierarchyQuery` from an [[AsyncQueryable]] source.
     *
     * @param source An [[AsyncQueryable]] object.
     * @param hierarchy A `HierarchyProvider` object.
     * @category Query
     */
    static from<TNode, T extends TNode>(source: PossiblyAsyncOrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): AsyncOrderedHierarchyQuery<TNode, T>;

    /**
     * Creates an `AsyncHierarchyQuery` from an [[AsyncQueryable]] source.
     *
     * @param source An [[AsyncQueryable]] object.
     * @param hierarchy A `HierarchyProvider` object.
     * @category Query
     */
    static from<TNode, T extends TNode>(source: AsyncQueryable<T>, hierarchy: HierarchyProvider<TNode>): AsyncHierarchyQuery<TNode, T>;
    static from<T>(source: AsyncQueryable<T>, hierarchy?: HierarchyProvider<T>): AsyncQuery<T> {
        return fromAsync(source, hierarchy!);
    }

    /**
     * Creates an [[AsyncQuery]] for the provided elements.
     *
     * @param elements The elements of the `Query`.
     * @category Query
     */
    static of<T>(...elements: (PromiseLike<T> | T)[]): AsyncQuery<T>;
    static of<T>(): AsyncQuery<T> {
        return fromAsync(arguments);
    }

    /**
     * Creates an [[AsyncQuery]] with no elements.
     * @category Query
     */
    static empty<T>(): AsyncQuery<T> {
        // TODO: Consider contextual typing here?
        // return fromAsync(fn.emptyAsync());
        return fromAsync(fn.emptyAsync<T>());
    }

    /**
     * Creates an [[AsyncQuery]] over a single element.
     *
     * @param value The only element for the `Query`.
     * @category Query
     */
    static once<T>(value: PromiseLike<T> | T): AsyncQuery<T> {
        return fromAsync(fn.onceAsync(value));
    }

    /**
     * Creates an [[AsyncQuery]] for a value repeated a provided number of times.
     *
     * @param value The value for each element of the `Query`.
     * @param count The number of times to repeat the value.
     * @category Query
     */
    static repeat<T>(value: PromiseLike<T> | T, count: number): AsyncQuery<T> {
        return fromAsync(fn.repeatAsync(value, count));
    }

    /**
     * Creates an [[AsyncQuery]] that repeats the provided value forever.
     *
     * @param value The value for each element of the `Query`.
     * @category Query
     */
    static continuous<T>(value: PromiseLike<T> | T): AsyncQuery<T> {
        return fromAsync(fn.continuousAsync(value));
    }

    /**
     * Creates an [[AsyncQuery]] whose values are provided by a callback executed a provided number of
     * times.
     *
     * @param count The number of times to execute the callback.
     * @param generator The callback to execute.
     * @category Query
     */
    static generate<T>(count: number, generator: (offset: number) => PromiseLike<T> | T): AsyncQuery<T> {
        return fromAsync(fn.generateAsync(count, generator));
    }

    /**
     * Creates an `AsyncHierarchyQuery` from a root node and a `HierarchyProvider`.
     *
     * @param root The root node of the hierarchy.
     * @param hierarchy A `HierarchyProvider` object.
     * @category Query
     */
    static hierarchy<TNode, T extends TNode>(root: PromiseLike<T> | T, hierarchy: HierarchyProvider<TNode>): AsyncHierarchyQuery<TNode, T> {
        return fromAsync(fn.hierarchyAsync(root, hierarchy));
    }

    /**
     * Creates an [[AsyncQuery]] that, when iterated, consumes the provided `AsyncIterator`.
     *
     * @param iterator An `AsyncIterator` object.
     * @category Query
     */
    static consume<T>(iterator: AsyncIterator<T>, options?: ConsumeAsyncOptions): AsyncQuery<T> {
        return fromAsync(fn.consumeAsync(iterator, options));
    }

    /**
     * Creates an [[AsyncQuery]] that iterates the elements from one of two sources based on the result of a
     * lazily evaluated condition.
     *
     * @param condition A callback used to choose a source.
     * @param thenQueryable The source to use when the callback evaluates to `true`.
     * @param elseQueryable The source to use when the callback evaluates to `false`.
     * @category Query
     */
    static if<T>(condition: () => PromiseLike<boolean> | boolean, thenQueryable: AsyncQueryable<T>, elseQueryable?: AsyncQueryable<T>): AsyncQuery<T> {
        return fromAsync(fn.ifAsync(condition, thenQueryable, elseQueryable));
    }

    /**
     * Creates an [[AsyncQuery]] that iterates the elements from sources picked from a list based on the
     * result of a lazily evaluated choice.
     *
     * @param chooser A callback used to choose a source.
     * @param choices A list of sources
     * @param otherwise A default source to use when another choice could not be made.
     * @category Query
     */
    static choose<K, V>(chooser: () => PromiseLike<K> | K, choices: AsyncQueryable<AsyncChoice<K, V>>, otherwise?: AsyncQueryable<V>): AsyncQuery<V> {
        return fromAsync(fn.chooseAsync(chooser, choices, otherwise));
    }

    /**
     * Creates an [[AsyncQuery]] for the own property keys of an object.
     *
     * @param source An object.
     * @category Query
     */
    static objectKeys<T extends object>(source: PromiseLike<T> | T): AsyncQuery<Extract<keyof T, string>> {
        return fromAsync(fn.objectKeysAsync(source));
    }

    /**
     * Creates an [[AsyncQuery]] for the own property values of an object.
     *
     * @param source An object.
     * @category Query
     */
    static objectValues<T extends object>(source: PromiseLike<T> | T): AsyncQuery<T[Extract<keyof T, string>]> {
        return fromAsync(fn.objectValuesAsync(source));
    }

    /**
     * Creates an [[AsyncQuery]] for the own property key-value pairs of an object.
     *
     * @param source An object.
     * @category Query
     */
    static objectEntries<T extends object>(source: PromiseLike<T> | T): AsyncQuery<KeyValuePair<T, Extract<keyof T, string>>> {
        return fromAsync(fn.objectEntriesAsync(source));
    }

    // #endregion Query

    // #region Subquery

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    filter<U extends T>(predicate: (element: T, offset: number) => element is U): AsyncUnorderedFlow<this, U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    filter(predicate: (element: T, offset: number) => boolean | PromiseLike<boolean>): AsyncUnorderedFlow<this, T>;
    filter(predicate: (element: T, offset: number) => boolean | PromiseLike<boolean>): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.filterAsync(GetAsyncSource(this), predicate)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery whose elements match the supplied predicate.
     * This is an alias for `filter`.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    where<U extends T>(predicate: (element: T, offset: number) => element is U): AsyncUnorderedFlow<this, U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     * This is an alias for `filter`.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    where(predicate: (element: T, offset: number) => boolean | PromiseLike<boolean>): AsyncUnorderedFlow<this, T>;
    where(predicate: (element: T, offset: number) => boolean | PromiseLike<boolean>): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.whereAsync(GetAsyncSource(this), predicate)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery whose elements are neither `null` nor `undefined`.
     *
     * @category Subquery
     */
    filterDefined(): AsyncUnorderedFlow<this, NonNullable<T>> {
        return fromAsync(fn.filterDefinedAsync(GetAsyncSource(this))) as AsyncUnorderedFlow<this, NonNullable<T>>;
    }

    /**
     * Creates a subquery whose elements are neither `null` nor `undefined`.
     *
     * NOTE: This is an alias for `filterDefined`.
     *
     * @category Subquery
     */
    whereDefined(): AsyncUnorderedFlow<this, NonNullable<T>> {
        return fromAsync(fn.whereDefinedAsync(GetAsyncSource(this))) as AsyncUnorderedFlow<this, NonNullable<T>>;
    }

    /**
     * Creates a subquery by applying a callback to each element.
     *
     * @param selector A callback used to map each element.
     * @category Subquery
     */
    map<U>(selector: (element: T, offset: number) => U | PromiseLike<U>): AsyncQuery<U> {
        return fromAsync(fn.mapAsync(GetAsyncSource(this), selector));
    }

    /**
     * Creates a subquery by applying a callback to each element.
     * This is an alias for `map`.
     *
     * @param selector A callback used to map each element.
     * @category Subquery
     */
    select<U>(selector: (element: T, offset: number) => U | PromiseLike<U>): AsyncQuery<U> {
        return fromAsync(fn.selectAsync(GetAsyncSource(this), selector));
    }

    /**
     * Creates a subquery that iterates the results of applying a callback to each element.
     *
     * @param projection A callback used to map each element into an iterable.
     * @category Subquery
     */
    flatMap<U>(projection: (element: T) => AsyncQueryable<U>): AsyncQuery<U>;
    /**
     * Creates a subquery that iterates the results of applying a callback to each element.
     *
     * @param projection A callback used to map each element into an iterable.
     * @category Subquery
     */
    flatMap<U, R>(projection: (element: T) => AsyncQueryable<U>, resultSelector: (element: T, innerElement: U) => R | PromiseLike<R>): AsyncQuery<R>;
    flatMap<U, R>(projection: (element: T) => AsyncQueryable<U>, resultSelector?: (element: T, innerElement: U) => R | PromiseLike<R>): AsyncQuery<U | R> {
        return fromAsync(fn.flatMapAsync(GetAsyncSource(this), projection, resultSelector!));
    }

    /**
     * Creates a subquery that iterates the results of applying a callback to each element.
     * This is an alias for `flatMap`.
     *
     * @param projection A callback used to map each element into an iterable.
     * @category Subquery
     */
    selectMany<U>(projection: (element: T) => AsyncQueryable<U>): AsyncQuery<U>;
    /**
     * Creates a subquery that iterates the results of applying a callback to each element.
     * This is an alias for `flatMap`.
     *
     * @param projection A callback used to map each element into an iterable.
     * @category Subquery
     */
    selectMany<U, R>(projection: (element: T) => AsyncQueryable<U>, resultSelector: (element: T, innerElement: U) => R | PromiseLike<R>): AsyncQuery<R>;
    selectMany<U, R>(projection: (element: T) => AsyncQueryable<U>, resultSelector?: (element: T, innerElement: U) => R | PromiseLike<R>): AsyncQuery<U | R> {
        return fromAsync(fn.selectManyAsync(GetAsyncSource(this), projection, resultSelector!));
    }

    /**
     * Creates a subquery that iterates the results of recursively expanding the
     * elements of the source.
     *
     * @param projection A callback used to recusively expand each element.
     * @category Subquery
     */
    expand(projection: (element: T) => AsyncQueryable<T>): AsyncQuery<T> {
        return fromAsync(fn.expandAsync(GetAsyncSource(this), projection));
    }

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     *
     * @param callback The callback to invoke.
     * @category Subquery
     */
    do(callback: (element: T, offset: number) => void): AsyncUnorderedFlow<this, T>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     *
     * @param callback The callback to invoke.
     * @category Subquery
     */
    do(callback: (element: T, offset: number) => PromiseLike<void>): AsyncUnorderedFlow<this, T>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     *
     * @param callback The callback to invoke.
     * @category Subquery
     */
    do(callback: (element: T, offset: number) => PromiseLike<void> | void): AsyncUnorderedFlow<this, T>;
    do(callback: (element: T, offset: number) => PromiseLike<void> | void): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.doAsync(GetAsyncSource(this), callback)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     * This is an alias for `do`.
     *
     * @param callback The callback to invoke.
     * @category Subquery
     */
    tap(callback: (element: T, offset: number) => void): AsyncUnorderedFlow<this, T>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     * This is an alias for `do`.
     *
     * @param callback The callback to invoke.
     * @category Subquery
     */
    tap(callback: (element: T, offset: number) => PromiseLike<void>): AsyncUnorderedFlow<this, T>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     * This is an alias for `do`.
     *
     * @param callback The callback to invoke.
     * @category Subquery
     */
    tap(callback: (element: T, offset: number) => PromiseLike<void> | void): AsyncUnorderedFlow<this, T>;
    tap(callback: (element: T, offset: number) => PromiseLike<void> | void): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.tapAsync(GetAsyncSource(this), callback)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Pass the entire query to the provided callback, creating a new query from the result.
     *
     * @param callback A callback function.
     * @category Subquery
     */
    through<R extends Queryable<any> = Queryable<any>>(callback: (source: this) => R): AsyncFlow<R, QueriedType<R>> {
        return fromAsync(fn.throughAsync(this, callback)) as AsyncFlow<R, QueriedType<R>>;
    }

    /**
     * Creates a subquery whose elements are in the reverse order.
     * @category Subquery
     */
    reverse(): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.reverseAsync(GetAsyncSource(this))) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery containing all elements except the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     * @category Subquery
     */
    skip(count: number): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.skipAsync(GetAsyncSource(this), count)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery containing all elements except the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     * @category Subquery
     */
    skipRight(count: number): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.skipRightAsync(GetAsyncSource(this), count)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery containing all elements except the first elements that match
     * the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    skipWhile(predicate: (element: T) => boolean | PromiseLike<boolean>): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.skipWhileAsync(GetAsyncSource(this), predicate)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery containing all elements except the first elements that do not match
     * the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    skipUntil(predicate: (element: T) => boolean): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.skipUntilAsync(GetAsyncSource(this), predicate)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery containing the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     * @category Subquery
     */
    take(count: number): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.takeAsync(GetAsyncSource(this), count)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery containing the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     * @category Subquery
     */
    takeRight(count: number): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.takeRightAsync(GetAsyncSource(this), count)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    takeWhile<U extends T>(predicate: (element: T) => element is U): AsyncUnorderedFlow<this, U>;

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    takeWhile(predicate: (element: T) => boolean | PromiseLike<boolean>): AsyncUnorderedFlow<this, T>;
    takeWhile(predicate: (element: T) => boolean | PromiseLike<boolean>): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.takeWhileAsync(GetAsyncSource(this), predicate)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery containing the first elements that do not match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    takeUntil(predicate: (element: T) => boolean | PromiseLike<boolean>): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.takeUntilAsync(GetAsyncSource(this), predicate)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery for the set intersection of this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    intersect<UNode extends T, U extends UNode>(right: PossiblyAsyncHierarchyIterable<UNode, U>): AsyncHierarchyQuery<UNode, U>;

    /**
     * Creates a subquery for the set intersection of this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    intersect<U extends T>(right: AsyncQueryable<U>): AsyncQuery<U>;

    /**
     * Creates a subquery for the set intersection of this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    intersect(right: AsyncQueryable<T>): AsyncQuery<T>;
    intersect(right: AsyncQueryable<T>): AsyncQuery<T> {
        return fromAsync(fn.intersectAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery for the set union of this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    union(right: AsyncQueryable<T>): AsyncQuery<T> {
        return fromAsync(fn.unionAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery for the set difference (a.k.a. 'relative complement') between this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    except(right: AsyncQueryable<T>): AsyncQuery<T> {
        return fromAsync(fn.exceptAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery for the set difference between this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * This is an alias for `except`.
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    relativeComplement(right: AsyncQueryable<T>): AsyncQuery<T> {
        return fromAsync(fn.relativeComplementAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery for the symmetric difference between this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    symmetricDifference(right: AsyncQueryable<T>): AsyncQuery<T> {
        return fromAsync(fn.symmetricDifferenceAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery for the symmetric difference between this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * This is an alias for `symmetricDifference`.
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    xor(right: AsyncQueryable<T>): AsyncQuery<T> {
        return fromAsync(fn.xorAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery that concatenates this Query with another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    concat(right: AsyncQueryable<T>): AsyncQuery<T> {
        return fromAsync(fn.concatAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery for the distinct elements of this Query.
     * @category Subquery
     */
    distinct(): AsyncUnorderedFlow<this, T>;
    /**
     * Creates a subquery for the distinct elements of this Query.
     *
     * @param keySelector A callback used to select the key to determine uniqueness.
     * @category Subquery
     */
    distinct<K>(keySelector: (value: T) => K): AsyncUnorderedFlow<this, T>;
    distinct(keySelector?: (value: T) => T): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.distinctAsync(GetAsyncSource(this), keySelector!)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery for the elements of this Query with the provided value appended to the end.
     *
     * @param value The value to append.
     * @category Subquery
     */
    append(value: PromiseLike<T> | T): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.appendAsync(GetAsyncSource(this), value)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery for the elements of this Query with the provided value prepended to the beginning.
     *
     * @param value The value to prepend.
     * @category Subquery
     */
    prepend(value: PromiseLike<T> | T): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.prependAsync(GetAsyncSource(this), value)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery for the elements of this Query with the provided range
     * patched into the results.
     *
     * @param start The offset at which to patch the range.
     * @param skipCount The number of elements to skip from start.
     * @param range The range to patch into the result.
     * @category Subquery
     */
    patch(start: number, skipCount?: number, range?: AsyncQueryable<T>): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.patchAsync(GetAsyncSource(this), start, skipCount, range && GetAsyncSource(range))) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery that contains the provided default value if this Query
     * contains no elements.
     *
     * @param defaultValue The default value.
     * @category Subquery
     */
    defaultIfEmpty(defaultValue: PromiseLike<T> | T): AsyncUnorderedFlow<this, T> {
        return fromAsync(fn.defaultIfEmptyAsync(GetAsyncSource(this), defaultValue)) as AsyncUnorderedFlow<this, T>;
    }

    /**
     * Creates a subquery that splits this Query into one or more pages.
     * While advancing from page to page is evaluated lazily, the elements of the page are
     * evaluated eagerly.
     *
     * @param pageSize The number of elements per page.
     * @category Subquery
     */
    pageBy(pageSize: number): AsyncQuery<Page<T>> {
        return fromAsync(fn.pageByAsync(GetAsyncSource(this), pageSize));
    }

    /**
     * Creates a subquery whose elements are the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @category Subquery
     */
    spanMap<K>(keySelector: (element: T) => K): AsyncQuery<Grouping<K, T>>;

    /**
     * Creates a subquery whose values are computed from each element of the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @category Subquery
     */
    spanMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V | PromiseLike<V>): AsyncQuery<Grouping<K, V>>;

    /**
     * Creates a subquery whose values are computed from the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @param spanSelector A callback used to select a result from a contiguous range.
     * @category Subquery
     */
    spanMap<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V | PromiseLike<V>, spanSelector: (key: K, elements: Query<V>) => PromiseLike<R> | R): AsyncQuery<R>;
    spanMap<K, V, R>(keySelector: (element: T) => K, elementSelector?: (element: T) => T | V | PromiseLike<T | V>, spanSelector?: (key: K, elements: Query<T | V>) => PromiseLike<Grouping<K, T | V> | R> | Grouping<K, T | V> | R): AsyncQuery<Grouping<K, T | V> | R> {
        return fromAsync(fn.spanMapAsync(GetAsyncSource(this), keySelector, elementSelector!, wrapResultSelector(spanSelector!)));
    }

    /**
     * Groups each element of this Query by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @category Subquery
     */
    groupBy<K>(keySelector: (element: T) => K): AsyncQuery<Grouping<K, T>>;

    /**
     * Groups each element by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @category Subquery
     */
    groupBy<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V | PromiseLike<V>): AsyncQuery<Grouping<K, V>>;

    /**
     * Groups each element by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @param resultSelector A callback used to select a result from a group.
     * @category Subquery
     */
    groupBy<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V | PromiseLike<V>, resultSelector: (key: K, elements: Query<V>) => R): AsyncQuery<R>;
    groupBy<K, V, R>(keySelector: (element: T) => K, elementSelector?: (element: T) => T | V | PromiseLike<T | V>, resultSelector?: (key: K, elements: Query<T | V>) => PromiseLike<Grouping<K, T | V> | R> | Grouping<K, T | V> | R): AsyncQuery<Grouping<K, T | V> | R> {
        return fromAsync(fn.groupByAsync(GetAsyncSource(this), keySelector, elementSelector!, wrapResultSelector(resultSelector!)));
    }

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element.
     *
     * @param accumulator The callback used to compute each result.
     * @category Subquery
     */
    scan(accumulator: (current: T, element: T, offset: number) => T | PromiseLike<T>): AsyncQuery<T>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element.
     *
     * @param accumulator The callback used to compute each result.
     * @param seed An optional seed value.
     * @category Subquery
     */
    scan<U>(accumulator: (current: U, element: T, offset: number) => U | PromiseLike<U>, seed: U): AsyncQuery<U>;
    scan(accumulator: (current: T, element: T, offset: number) => T | PromiseLike<T>, seed?: T): AsyncQuery<T> {
        return fromAsync(arguments.length > 1
            ? fn.scanAsync(GetAsyncSource(this), accumulator, seed!)
            : fn.scanAsync(GetAsyncSource(this), accumulator));
    }

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.
     *
     * @param accumulator The callback used to compute each result.
     * @category Subquery
     */
    scanRight(accumulator: (current: T, element: T, offset: number) => T | PromiseLike<T>): AsyncQuery<T>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.
     *
     * @param accumulator The callback used to compute each result.
     * @param seed An optional seed value.
     * @category Subquery
     */
    scanRight<U>(accumulator: (current: U, element: T, offset: number) => U | PromiseLike<U>, seed?: U): AsyncQuery<U>;
    scanRight(accumulator: (current: T, element: T, offset: number) => T | PromiseLike<T>, seed?: T): AsyncQuery<T> {
        return fromAsync(arguments.length > 1
            ? fn.scanRightAsync(GetAsyncSource(this), accumulator, seed!)
            : fn.scanRightAsync(GetAsyncSource(this), accumulator));
    }

    // #endregion Subquery

    // #region Join

    /**
     * Creates a grouped subquery for the correlated elements of this [[AsyncQuery]] and another [[AsyncQueryable]] object.
     *
     * @param inner A [[Queryable]] object.
     * @param outerKeySelector A callback used to select the key for an element in this [[AsyncQuery]].
     * @param innerKeySelector A callback used to select the key for an element in the other [[Queryable]] object.
     * @param resultSelector A callback used to select the result for the correlated elements.
     * @category Join
     */
    groupJoin<I, K, R>(inner: AsyncQueryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: Query<I>) => R | PromiseLike<R>): AsyncQuery<R> {
        return fromAsync(fn.groupJoinAsync(GetAsyncSource(this), GetAsyncSource(inner), outerKeySelector, innerKeySelector, wrapResultSelector(resultSelector)));
    }

    /**
     * Creates a subquery for the correlated elements of this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param inner A [[Queryable]] object.
     * @param outerKeySelector A callback used to select the key for an element in this Query.
     * @param innerKeySelector A callback used to select the key for an element in the other Queryable.
     * @param resultSelector A callback used to select the result for the correlated elements.
     * @category Join
     */
    join<I, K, R>(inner: AsyncQueryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: I) => R | PromiseLike<R>): AsyncQuery<R> {
        return fromAsync(fn.joinAsync(GetAsyncSource(this), GetAsyncSource(inner), outerKeySelector, innerKeySelector, resultSelector));
    }

    /**
     * Creates a subquery for the correlated elements of this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param inner A [[Queryable]] object.
     * @param outerKeySelector A callback used to select the key for an element in this Query.
     * @param innerKeySelector A callback used to select the key for an element in the other Queryable.
     * @param resultSelector A callback used to select the result for the correlated elements.
     * @category Join
     */
    fullJoin<I, K, R>(inner: AsyncQueryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T | undefined, inner: I | undefined) => R | PromiseLike<R>): AsyncQuery<R> {
        return fromAsync(fn.joinAsync(GetAsyncSource(this), GetAsyncSource(inner), outerKeySelector, innerKeySelector, resultSelector));
    }

    /**
     * Creates a subquery that combines this Query with another [[AsyncQueryable]] by combining elements
     * in tuples.
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Join
     */
    zip<U>(right: AsyncQueryable<U>): AsyncQuery<[T, U]>;

    /**
     * Creates a subquery that combines this Query with another [[AsyncQueryable]] by combining elements
     * using the supplied callback.
     *
     * @param right An [[AsyncQueryable]] object.
     * @param selector A callback used to combine two elements.
     * @category Join
     */
    zip<U, R>(right: AsyncQueryable<U>, selector: (left: T, right: U) => R | PromiseLike<R>): AsyncQuery<R>;
    zip<U, R>(right: AsyncQueryable<U>, selector?: (left: T, right: U) => R): AsyncQuery<R> {
        return fromAsync(fn.zipAsync(GetAsyncSource(this), GetAsyncSource(right), selector!));
    }

    // #endregion

    // #region Order

    /**
     * Creates an ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    orderBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedFlow<this, T> {
        return fromAsync(fn.orderByAsync(GetAsyncSource(this), keySelector, comparison)) as AsyncOrderedFlow<this, T>;
    }

    /**
     * Creates an ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    orderByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedFlow<this, T> {
        return fromAsync(fn.orderByDescendingAsync(GetAsyncSource(this), keySelector, comparison)) as AsyncOrderedFlow<this, T>;
    }

    // #endregion Order

    // #region Hierarchy

    /**
     * Creates a HierarchyQuery using the provided HierarchyProvider.
     *
     * @param hierarchy A HierarchyProvider.
     * @category Hierarchy
     */
    toHierarchy(hierarchy: HierarchyProvider<T>): AsyncHierarchyFlow<this, T> {
        return fromAsync(fn.toHierarchyAsync(GetAsyncSource(this), hierarchy)) as AsyncHierarchyFlow<this, T>;
    }

    // #endregion Hierarchy

    // #region Scalar

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     * @category Scalar
     */
    reduce(accumulator: (current: T, element: T, offset: number) => T | PromiseLike<T>): Promise<T>;

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @category Scalar
     */
    reduce<U>(accumulator: (current: U, element: T, offset: number) => U | PromiseLike<U>, seed?: U): Promise<U>;

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @param resultSelector An optional callback used to compute the final result.
     * @category Scalar
     */
    reduce<U, R>(accumulator: (current: U, element: T, offset: number) => U | PromiseLike<U>, seed: U, resultSelector: (result: U, count: number) => R | PromiseLike<R>): Promise<R>;
    reduce(accumulator: (current: T, element: T, offset: number) => T | PromiseLike<T>, seed?: T, resultSelector?: (result: T, count: number) => T | PromiseLike<T>): Promise<T> {
        return arguments.length > 1
            ? fn.reduceAsync(GetAsyncSource(this), accumulator, seed as T, resultSelector!)
            : fn.reduceAsync(GetAsyncSource(this), accumulator);
    }

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     * @category Scalar
     */
    reduceRight(accumulator: (current: T, element: T, offset: number) => T | PromiseLike<T>): Promise<T>;

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @category Scalar
     */
    reduceRight<U>(accumulator: (current: U, element: T, offset: number) => U | PromiseLike<U>, seed: U): Promise<U>;

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @param resultSelector An optional callback used to compute the final result.
     * @category Scalar
     */
    reduceRight<U, R>(accumulator: (current: U, element: T, offset: number) => U | PromiseLike<U>, seed: U, resultSelector: (result: U, count: number) => R | PromiseLike<R>): Promise<R>;
    reduceRight(accumulator: (current: T, element: T, offset: number) => T | PromiseLike<T>, seed?: T, resultSelector?: (result: T, count: number) => T | PromiseLike<T>): Promise<T> {
        return arguments.length > 1
            ? fn.reduceAsync(GetAsyncSource(this), accumulator, seed as T, resultSelector!)
            : fn.reduceAsync(GetAsyncSource(this), accumulator);
    }

    /**
     * Counts the number of elements in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    count(predicate?: (element: T) => boolean | PromiseLike<boolean>): Promise<number> {
        return fn.countAsync(GetAsyncSource(this), predicate!);
    }

    /**
     * Gets the first element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    first<U extends T>(predicate: (element: T) => element is U): Promise<U | undefined>;

    /**
     * Gets the first element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    first(predicate?: (element: T) => boolean | PromiseLike<boolean>): Promise<T | undefined>;
    first(predicate?: (element: T) => boolean | PromiseLike<boolean>): Promise<T | undefined> {
        return fn.firstAsync(GetAsyncSource(this), predicate!);
    }

    /**
     * Gets the last element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    last<U extends T>(predicate: (element: T) => element is U): Promise<U | undefined>;

    /**
     * Gets the last element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    last(predicate?: (element: T) => boolean | PromiseLike<boolean>): Promise<T | undefined>;
    last(predicate?: (element: T) => boolean | PromiseLike<boolean>): Promise<T | undefined> {
        return fn.lastAsync(GetAsyncSource(this), predicate!);
    }

    /**
     * Gets the only element in the Query, or returns undefined.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    single<U extends T>(predicate: (element: T) => element is U): Promise<U | undefined>;

    /**
     * Gets the only element in the Query, or returns undefined.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    single(predicate?: (element: T) => boolean | PromiseLike<boolean>): Promise<T | undefined>;
    single(predicate?: (element: T) => boolean | PromiseLike<boolean>): Promise<T | undefined> {
        return fn.singleAsync(GetAsyncSource(this), predicate);
    }

    /**
     * Gets the minimum element in the query, optionally comparing elements using the supplied
     * callback.
     *
     * @param comparison An optional callback used to compare two elements.
     * @category Scalar
     */
    min(comparison?: (x: T, y: T) => number): Promise<T | undefined> {
        return fn.minAsync(GetAsyncSource(this), comparison);
    }

    /**
     * Gets the maximum element in the query, optionally comparing elements using the supplied
     * callback.
     *
     * @param comparison An optional callback used to compare two elements.
     * @category Scalar
     */
    max(comparison?: (x: T, y: T) => number): Promise<T | undefined> {
        return fn.maxAsync(GetAsyncSource(this), comparison);
    }

    /**
     * Computes the sum for a series of numbers.
     *
     * @category Scalar
     */
    sum(this: AsyncQuery<number>): Promise<number>;

    /**
     * Computes the sum for a series of numbers.
     *
     * @param elementSelector A callback used to convert a value in `source` to a number.
     * @category Scalar
     */
    sum(elementSelector: (element: T) => number | PromiseLike<number>): Promise<number>;
    sum(elementSelector?: (element: T) => number | PromiseLike<number>): Promise<number> {
        return fn.sumAsync(GetAsyncSource(this), elementSelector!);
    }

    /**
     * Computes the average for a series of numbers.
     * NOTE: If any element is not a `number`, this overload will throw.
     *
     * @category Scalar
     */
    average(this: AsyncQuery<number>): Promise<number>;

    /**
     * Computes the average for a series of numbers.
     *
     * @param elementSelector A callback used to convert a value in `source` to a number.
     * @category Scalar
     */
    average(elementSelector: (element: T) => number | PromiseLike<number>): Promise<number>;
    average(elementSelector?: (element: T) => number | PromiseLike<number>): Promise<number> {
        return fn.averageAsync(GetAsyncSource(this), elementSelector!);
    }

    /**
     * Computes a scalar value indicating whether the Query contains any elements,
     * optionally filtering the elements using the supplied callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    some(predicate?: (element: T) => boolean | PromiseLike<boolean>): Promise<boolean> {
        return fn.someAsync(GetAsyncSource(this), predicate);
    }

    /**
     * Computes a scalar value indicating whether all elements of the Query
     * match the supplied callback.
     *
     * @param predicate A callback used to match each element.
     * @category Scalar
     */
    every(predicate: (element: T) => boolean | PromiseLike<boolean>): Promise<boolean> {
        return fn.everyAsync(GetAsyncSource(this), predicate);
    }

    /**
     * Computes a scalar value indicating whether every element in this Query corresponds to a matching element
     * in another [[AsyncQueryable]] at the same position.
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Scalar
     */
    corresponds(right: AsyncQueryable<T>): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether every element in this Query corresponds to a matching element
     * in another [[AsyncQueryable]] at the same position.
     *
     * @param right An [[AsyncQueryable]] object.
     * @param equalityComparison An optional callback used to compare the equality of two elements.
     * @category Scalar
     */
    corresponds<U>(right: AsyncQueryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;
    corresponds(right: AsyncQueryable<T>, equalityComparison?: (left: T, right: T) => boolean): Promise<boolean> {
        return fn.correspondsAsync(GetAsyncSource(this), GetAsyncSource(right), equalityComparison!);
    }

    /**
     * Computes a scalar value indicating whether the provided value is included in the query.
     *
     * @param value A value.
     * @category Scalar
     */
    includes(value: T): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether the provided value is included in the query.
     *
     * @param value A value.
     * @param equalityComparison An optional callback used to compare the equality of two elements.
     * @category Scalar
     */
    includes<U>(value: U, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;
    includes(value: T, equalityComparison?: (left: T, right: T) => boolean): Promise<boolean> {
        return fn.includesAsync(GetAsyncSource(this), value, equalityComparison!);
    }

    /**
     * Computes a scalar value indicating whether the elements of this Query include
     * an exact sequence of elements from another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Scalar
     */
    includesSequence(right: AsyncQueryable<T>): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether the elements of this Query include
     * an exact sequence of elements from another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @param equalityComparison A callback used to compare the equality of two elements.
     * @category Scalar
     */
    includesSequence<U>(right: AsyncQueryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;
    includesSequence(right: AsyncQueryable<T>, equalityComparison?: (left: T, right: T) => boolean): Promise<boolean> {
        return fn.includesSequenceAsync(GetAsyncSource(this), GetAsyncSource(right), equalityComparison!);
    }

    /**
     * Computes a scalar value indicating whether the elements of this Query start
     * with the same sequence of elements in another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Scalar
     */
    startsWith(right: AsyncQueryable<T>): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether the elements of this Query start
     * with the same sequence of elements in another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @param equalityComparison A callback used to compare the equality of two elements.
     * @category Scalar
     */
    startsWith<U>(right: AsyncQueryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;
    startsWith(right: AsyncQueryable<T>, equalityComparison?: (left: T, right: T) => boolean): Promise<boolean> {
        return fn.startsWithAsync(GetAsyncSource(this), GetAsyncSource(right), equalityComparison!);
    }

    /**
     * Computes a scalar value indicating whether the elements of this Query end
     * with the same sequence of elements in another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Scalar
     */
    endsWith(right: AsyncQueryable<T>): Promise<boolean>;

    /**
     * Computes a scalar value indicating whether the elements of this Query end
     * with the same sequence of elements in another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @param equalityComparison A callback used to compare the equality of two elements.
     * @category Scalar
     */
    endsWith<U>(right: AsyncQueryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;
    endsWith(right: AsyncQueryable<T>, equalityComparison?: (left: T, right: T) => boolean): Promise<boolean> {
        return fn.endsWithAsync(GetAsyncSource(this), GetAsyncSource(right), equalityComparison!);
    }

    /**
     * Finds the value in the Query at the provided offset. A negative offset starts from the
     * last element.
     *
     * @param offset An offset.
     * @category Scalar
     */
    elementAt(offset: number): Promise<T | undefined> {
        return fn.elementAtAsync(GetAsyncSource(this), offset);
    }

    /**
     * Finds the value in the Query at the provided offset. A negative offset starts from the
     * last element.
     *
     * This is an alias for `elementAt`.
     *
     * @param offset An offset.
     * @category Scalar
     */
    nth(offset: number): Promise<T | undefined> {
        return fn.nthAsync(GetAsyncSource(this), offset);
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
     * @category Scalar
     */
    span<U extends T>(predicate: (element: T, offset: number) => element is U): Promise<[Query<U>, AsyncQuery<T>]>;

    /**
     * Creates a tuple whose first element is a subquery containing the first span of
     * elements that match the supplied predicate, and whose second element is a subquery
     * containing the remaining elements.
     *
     * The first subquery is eagerly evaluated, while the second subquery is lazily
     * evaluated.
     *
     * @param predicate The predicate used to match elements.
     * @category Scalar
     */
    span(predicate: (element: T, offset: number) => boolean | PromiseLike<boolean>): Promise<[Query<T>, AsyncQuery<T>]>;
    async span(predicate: (element: T, offset: number) => boolean | PromiseLike<boolean>): Promise<[Query<T>, AsyncQuery<T>]> {
        const [first, rest] = await fn.spanAsync(GetAsyncSource(this), predicate);
        return [from(first), fromAsync(rest)];
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
     * @category Scalar
     */
    async break(predicate: (element: T, offset: number) => boolean | PromiseLike<boolean>): Promise<[Query<T>, AsyncQuery<T>]> {
        const [first, rest] = await fn.breakAsync(GetAsyncSource(this), predicate);
        return [from(first), fromAsync(rest)];
    }

    /**
     * Invokes a callback for each element of the query.
     *
     * @param callback The callback to invoke.
     * @category Scalar
     */
    forEach(callback: (element: T, offset: number) => void): Promise<void>;
    /**
     * Invokes a callback for each element of the query.
     *
     * @param callback The callback to invoke.
     * @category Scalar
     */
    forEach(callback: (element: T, offset: number) => void | PromiseLike<void>): Promise<void>;
    forEach(callback: (element: T, offset: number) => void | PromiseLike<void>): Promise<void> {
        return fn.forEachAsync(GetAsyncSource(this), callback);
    }

    /**
     * Iterates over all of the elements in the query, ignoring the results.
     * @category Scalar
     */
    drain(): Promise<void> {
        return fn.drainAsync(GetAsyncSource(this));
    }

    /**
     * Eagerly evaluate the query, returning a new `Query`.
     * @category Scalar
     */
    async eval(): Promise<Query<T>> {
        return from(await fn.evalAsync(GetAsyncSource(this)));
    }

    /**
     * Unzips a sequence of tuples into a tuple of sequences.
     * @category Scalar
     */
    unzip<T extends [any, ...any[]]>(this: Query<T>): Promise<{ [I in keyof T]: T[I][]; }>;

    /**
     * Unzips a sequence of tuples into a tuple of sequences.
     * @param partSelector A callback that converts a result into a tuple.
     * @category Scalar
     */
    unzip<T, U extends [any, ...any[]]>(this: Query<T>, partSelector: (value: T) => U | PromiseLike<U>): Promise<{ [I in keyof U]: U[I][]; }>;
    unzip<T extends [any, ...any[]]>(this: Query<T>, partSelector?: (value: T) => T | PromiseLike<T>): Promise<any> {
        return fn.unzipAsync(GetAsyncSource(this), partSelector!);
    }

    /**
     * Creates an Array for the elements of the Query.
     * @category Scalar
     */
    toArray(): Promise<T[]>;

    /**
     * Creates an Array for the elements of the Query.
     *
     * @param elementSelector A callback that selects a value for each element.
     * @category Scalar
     */
    toArray<V>(elementSelector: (element: T) => V | PromiseLike<V>): Promise<V[]>;
    toArray(elementSelector?: (element: T) => T | PromiseLike<T>): Promise<T[]> {
        return fn.toArrayAsync(GetAsyncSource(this), elementSelector!);
    }

    /**
     * Creates a `Set` for the elements of the `Query`.
     * @category Scalar
     */
    toSet(): Promise<Set<T>>;

    /**
     * Creates a `Set` for the elements of the `Query`.
     *
     * @param elementSelector A callback that selects a value for each element.
     * @category Scalar
     */
    toSet<V>(elementSelector: (element: T) => V | PromiseLike<V>): Promise<Set<V>>;
    toSet(elementSelector?: (element: T) => T | PromiseLike<T>): Promise<Set<T>> {
        return fn.toSetAsync(GetAsyncSource(this), elementSelector!);
    }

    /**
     * Creates a `Map` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     * @category Scalar
     */
    toMap<K>(keySelector: (element: T) => K): Promise<Map<K, T>>;

    /**
     * Creates a `Map` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     * @category Scalar
     */
    toMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V | PromiseLike<V>): Promise<Map<K, V>>;
    toMap<K>(keySelector: (element: T) => K, elementSelector?: (element: T) => T | PromiseLike<T>): Promise<Map<K, T>> {
        return fn.toMapAsync(GetAsyncSource(this), keySelector, elementSelector!);
    }

    /**
     * Creates a `Lookup` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     * @category Scalar
     */
    toLookup<K>(keySelector: (element: T) => K, ): Promise<Lookup<K, T>>;

    /**
     * Creates a `Lookup` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     * @category Scalar
     */
    toLookup<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V | PromiseLike<V>): Promise<Lookup<K, V>>;
    toLookup<K>(keySelector: (element: T) => K, elementSelector?: (element: T) => T | PromiseLike<T>): Promise<Lookup<K, T>> {
        return fn.toLookupAsync(GetAsyncSource(this), keySelector, elementSelector!);
    }

    /**
     * Creates an `object` for the elements of the `Query`.
     *
     * @param prototype The prototype for the object.
     * @param keySelector A callback used to select a key for each element.
     * @category Scalar
     */
    toObject(prototype: object | null, keySelector: (element: T) => PropertyKey): Promise<object>;

    /**
     * Creates an `object` for the elements of the `Query`.
     *
     * @param prototype The prototype for the object.
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     * @category Scalar
     */
    toObject<V>(prototype: object | null, keySelector: (element: T) => PropertyKey, elementSelector: (element: T) => V | PromiseLike<V>): Promise<object>;
    toObject(prototype: object | null, keySelector: (element: T) => PropertyKey, elementSelector?: (element: T) => T | PromiseLike<T>): Promise<object> {
        return fn.toObjectAsync(GetAsyncSource(this), prototype, keySelector, elementSelector!);
    }

    // #endregion Scalar

    /** @internal */ [AsyncQuerySource.source]() {
        return this._source;
    }
}

/**
 * Represents a sequence of hierarchically organized values.
 */
export class AsyncHierarchyQuery<TNode, T extends TNode = TNode> extends AsyncQuery<T> implements AsyncHierarchyIterable<TNode, T> /*, AsyncHierarchyQuerySource<TNode, T> */ {
    constructor(source: PossiblyAsyncHierarchyIterable<TNode, T>);
    constructor(source: AsyncQueryable<T>, hierarchy: HierarchyProvider<TNode>);
    constructor(source: AsyncQueryable<T> | HierarchyIterable<TNode, T>, hierarchy?: HierarchyProvider<TNode>) {
        if (hierarchy) {
            assert.mustBeAsyncQueryable(source, "source");
            assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
            source = MakeAsyncHierarchyIterable(source, hierarchy);
        }
        else {
            assert.mustBePossiblyAsyncHierarchyIterable(source as PossiblyAsyncHierarchyIterable<TNode, T>, "source");
        }
        super(source);
    }

    // #region Subquery

    /**
     * Creates a subquery for the set intersection of this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    intersect<UNode extends TNode, U extends UNode & T>(right: PossiblyAsyncHierarchyIterable<UNode, U>): AsyncHierarchyQuery<UNode, U>;

    /**
     * Creates a subquery for the set intersection of this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    intersect<U extends T>(right: AsyncQueryable<U>): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the set intersection of this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    intersect(right: AsyncQueryable<T>): AsyncHierarchyQuery<TNode, T>;
    intersect(right: AsyncQueryable<T>): AsyncHierarchyQuery<TNode, T> {
        return fromAsync(fn.intersectAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery for the set union of this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    union(right: AsyncQueryable<T>): AsyncHierarchyQuery<TNode, T> {
        return fromAsync(fn.unionAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery for the set difference (a.k.a. 'relative complement') between this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    except(right: AsyncQueryable<T>): AsyncHierarchyQuery<TNode, T> {
        return fromAsync(fn.exceptAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery for the set difference between this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * This is an alias for `except`.
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    relativeComplement(right: AsyncQueryable<T>): AsyncHierarchyQuery<TNode, T> {
        return fromAsync(fn.relativeComplementAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery for the symmetric difference between this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    symmetricDifference(right: AsyncQueryable<T>): AsyncHierarchyQuery<TNode, T> {
        return fromAsync(fn.symmetricDifferenceAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery for the symmetric difference between this [[AsyncQuery]] and another [[AsyncQueryable]].
     *
     * This is an alias for `symmetricDifference`.
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    xor(right: AsyncQueryable<T>): AsyncHierarchyQuery<TNode, T> {
        return fromAsync(fn.xorAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    /**
     * Creates a subquery that concatenates this Query with another [[AsyncQueryable]].
     *
     * @param right An [[AsyncQueryable]] object.
     * @category Subquery
     */
    concat(right: AsyncQueryable<T>): AsyncHierarchyQuery<TNode, T> {
        return fromAsync(fn.concatAsync(GetAsyncSource(this), GetAsyncSource(right)));
    }

    // #endregion Subquery

    // #region Hierarchy

    /**
     * Creates a subquery for the roots of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    root<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the roots of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    root(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    root(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.rootAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the ancestors of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    ancestors<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the ancestors of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    ancestors(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    ancestors(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.ancestorsAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the ancestors of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    ancestorsAndSelf<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the ancestors of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    ancestorsAndSelf(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    ancestorsAndSelf(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.ancestorsAndSelfAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the descendants of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    descendants<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the descendants of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    descendants(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    descendants(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.descendantsAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the descendants of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    descendantsAndSelf<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the descendants of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    descendantsAndSelf(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    descendantsAndSelf(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.descendantsAndSelfAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for this query.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    self<U extends T>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for this query.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    self<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for this query.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    self(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    self(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.selfAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the parents of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    parents<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the parents of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    parents(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    parents(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.parentsAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the children of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    children<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the children of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    children(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    children(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.childrenAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the siblings of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblings<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblings(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    siblings(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.siblingsAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the siblings of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsAndSelf<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsAndSelf(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    siblingsAndSelf(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.siblingsAndSelfAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the siblings before each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsBeforeSelf<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings before each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsBeforeSelf(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    siblingsBeforeSelf(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.siblingsBeforeSelfAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the siblings after each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsAfterSelf<U extends TNode>(predicate: (element: TNode) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings after each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsAfterSelf(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode>;
    siblingsAfterSelf(predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.siblingsAfterSelfAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the child of each element at the specified offset. A negative offset
     * starts from the last child.
     *
     * @param offset The offset for the child.
     * @category Hierarchy
     */
    nthChild(offset: number): AsyncHierarchyQuery<TNode> {
        return fromAsync(fn.nthChildAsync(GetAsyncSource(this), offset));
    }

    /**
     * Creates a subquery for the top-most elements. Elements that are a descendant of any other
     * element are removed.
     * @category Hierarchy
     */
    topMost<U extends T>(predicate: (element: T) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the top-most elements. Elements that are a descendant of any other
     * element are removed.
     * @category Hierarchy
     */
    topMost(predicate?: (element: T) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode, T>;
    topMost(predicate?: (element: T) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode, T> {
        return fromAsync(fn.topMostAsync(GetAsyncSource(this), predicate));
    }

    /**
     * Creates a subquery for the bottom-most elements. Elements that are an ancestor of any other
     * element are removed.
     * @category Hierarchy
     */
    bottomMost<U extends T>(predicate: (element: T) => element is U): AsyncHierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the bottom-most elements. Elements that are an ancestor of any other
     * element are removed.
     * @category Hierarchy
     */
    bottomMost(predicate?: (element: T) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode, T>;
    bottomMost(predicate?: (element: T) => boolean | PromiseLike<boolean>): AsyncHierarchyQuery<TNode, T> {
        return fromAsync(fn.bottomMostAsync(GetAsyncSource(this), predicate));
    }

    // #endregion Hierarchy

    [Hierarchical.hierarchy](): HierarchyProvider<TNode> {
        return GetHierarchy(GetAsyncSource(this));
    }
}

/**
 * Represents an ordered sequence of elements.
 */
export class AsyncOrderedQuery<T> extends AsyncQuery<T> implements AsyncOrderedIterable<T> /*, AsyncOrderedQuerySource<T>*/ {
    constructor(source: PossiblyAsyncOrderedIterable<T>) {
        assert.mustBePossiblyAsyncOrderedIterable(source, "source");
        super(ToAsyncOrderedIterable(source));
    }

    // #region Order

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedQuery<T> {
        return fromAsync(fn.thenByAsync(GetAsyncSource(this), keySelector, comparison));
    }

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedQuery<T> {
        return fromAsync(fn.thenByDescendingAsync(GetAsyncSource(this), keySelector, comparison));
    }

    // #endregion Order

    [AsyncOrderedIterable.thenByAsync]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedIterable<T> {
        return ThenByAsync(GetAsyncSource(this), keySelector, comparison, descending);
    }
}

/**
 * Represents an ordered sequence of hierarchically organized values.
 */
export class AsyncOrderedHierarchyQuery<TNode, T extends TNode = TNode> extends AsyncHierarchyQuery<TNode, T> implements AsyncOrderedHierarchyIterable<TNode, T> /*, AsyncOrderedHierarchyQuerySource<TNode, T> */ {
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

    // #region Order

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyQuery<TNode, T> {
        return fromAsync(fn.thenByAsync(GetAsyncSource(this), keySelector, comparison));
    }

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyQuery<TNode, T> {
        return fromAsync(fn.thenByDescendingAsync(GetAsyncSource(this), keySelector, comparison));
    }

    // #endregion Order

    [AsyncOrderedIterable.thenByAsync]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedHierarchyIterable<TNode, T> {
        return ThenByAsync(GetAsyncSource(this), keySelector, comparison, descending);
    }
}

function wrapResultSelector<I, O, R>(selector: ((inner: I, outer: Query<O>) => R)): ((inner: I, outer: Queryable<O>) => R);
function wrapResultSelector<I, O, R>(selector: ((inner: I, outer: Query<O>) => R) | undefined): ((inner: I, outer: Queryable<O>) => R) | undefined;
function wrapResultSelector<I, O, R>(selector: ((inner: I, outer: Query<O>) => R) | undefined) {
    if (typeof selector === "function") {
        return (inner: I, outer: Queryable<O>) => selector(inner, from(outer));
    }
    return selector;
}