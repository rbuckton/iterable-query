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
import { assert, IsHierarchyIterable, ToIterable, IsOrderedIterable, IsOrderedHierarchyIterable, GetHierarchy, ThenBy, MakeHierarchyIterable, GetSource, Registry, GetIterator, QuerySource } from "./internal";
import { OrderedHierarchyIterable, HierarchyIterable, OrderedIterable, Queryable, HierarchyProvider, Hierarchical, Grouping, KeyValuePair, Page, Choice } from "./types";
import { Lookup } from "./lookup";
import { ConsumeOptions } from "./fn";

Registry.addRegistry(fn);

/**
 * Creates a `Query` from a [[Queryable]] source.
 *
 * @param source A [[Queryable]] object.
 */
export function from<TNode, T extends TNode>(source: OrderedHierarchyIterable<TNode, T>): OrderedHierarchyQuery<TNode, T>;

/**
 * Creates a `Query` from a [[Queryable]] source.
 *
 * @param source A [[Queryable]] object.
 */
export function from<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>): HierarchyQuery<TNode, T>;

/**
 * Creates a `Query` from a [[Queryable]] source.
 *
 * @param source A [[Queryable]] object.
 */
export function from<T>(source: OrderedIterable<T>): OrderedQuery<T>;

/**
 * Creates a `Query` from a [[Queryable]] source.
 *
 * @param source A [[Queryable]] object.
 */
export function from<T>(source: Queryable<T>): Query<T>;

/**
 * Creates a `Query` from a [[Queryable]] source.
 *
 * @param source A [[Queryable]] object.
 * @param hierarchy A `HierarchyProvider` object.
 */
export function from<TNode, T extends TNode>(source: OrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): OrderedHierarchyQuery<TNode, T>;

/**
 * Creates a `Query` from a [[Queryable]] source.
 *
 * @param source A [[Queryable]] object.
 * @param hierarchy A `HierarchyProvider` object.
 */
export function from<TNode, T extends TNode>(source: Queryable<T>, hierarchy: HierarchyProvider<TNode>): HierarchyQuery<TNode, T>;

/**
 * Creates a `Query` from a [[Queryable]] source.
 *
 * @param source A [[Queryable]] object.
 */
export function from<T>(source: Queryable<T>, hierarchy?: HierarchyProvider<T>): any {
    if (hierarchy) source = MakeHierarchyIterable(source, hierarchy);
    return IsOrderedHierarchyIterable(source) ? new OrderedHierarchyQuery(source) :
        IsHierarchyIterable(source) ? new HierarchyQuery(source) :
        IsOrderedIterable(source) ? new OrderedQuery(source) :
        new Query(source);
}

Registry.Query.registerStatic("from", from);

function of<T>(...elements: T[]): Query<T>;
function of<T>(): Query<T> {
    return from(arguments);
}

Registry.Query.registerStatic("of", of);

Registry.addRegistry({ from, of });

/**
 * A `Query` represents a series of operations that act upon an Iterable or ArrayLike. Evaluation of
 * these operations is deferred until the either a scalar value is requested from the `Query` or the
 * `Query` is iterated.
 *
 * @typeparam T The type for each element.
 */
@Registry.QueryConstructor("Query")
export class Query<T> implements Iterable<T> /*, QuerySource<T>*/ {
    private _source: Queryable<T>;

    /**
     * Creates a `Query` from a [[Queryable]] source.
     *
     * @param source A [[Queryable]] object.
     */
    constructor(source: Queryable<T>) {
        assert.mustBeQueryable(source, "source");
        this._source = source instanceof Query
            ? source._source
            : source;
    }

    [Symbol.iterator](): Iterator<T> {
        return GetIterator(ToIterable(GetSource(this)));
    }

    /** @internal */ [QuerySource.source]() {
        return this._source;
    }

    /** @internal */ [QuerySource.create]<U>(value: Queryable<U>): QuerySource<U> {
        return from(value);
    }
}

export declare namespace Query {
    /**
     * Creates a `Query` from a [[Queryable]] source.
     *
     * @param source A [[Queryable]] object.
     * @category Query
     */
    export function from<TNode, T extends TNode>(source: OrderedHierarchyIterable<TNode, T>): OrderedHierarchyQuery<TNode, T>;

    /**
     * Creates a `Query` from a [[Queryable]] source.
     *
     * @param source A [[Queryable]] object.
     * @category Query
     */
    export function from<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a `Query` from a [[Queryable]] source.
     *
     * @param source A [[Queryable]] object.
     * @category Query
     */
    export function from<T>(source: OrderedIterable<T>): OrderedQuery<T>;

    /**
     * Creates a `Query` from a [[Queryable]] source.
     *
     * @param source A [[Queryable]] object.
     * @category Query
     */
    export function from<T>(source: Queryable<T>): Query<T>;

    /**
     * Creates a `Query` from a [[Queryable]] source.
     *
     * @param source A [[Queryable]] object.
     * @param hierarchy A `HierarchyProvider` object.
     * @category Query
     */
    export function from<TNode, T extends TNode>(source: OrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): OrderedHierarchyQuery<TNode, T>;

    /**
     * Creates a `Query` from a [[Queryable]] source.
     *
     * @param source A [[Queryable]] object.
     * @param hierarchy A `HierarchyProvider` object.
     * @category Query
     */
    export function from<TNode, T extends TNode>(source: Queryable<T>, hierarchy: HierarchyProvider<TNode>): HierarchyQuery<TNode, T>;

    /**
     * Creates a `Query` for the provided elements.
     *
     * @param elements The elements of the `Query`.
     * @category Query
     */
    export function of<T>(...elements: T[]): Query<T>;

    /**
     * Creates a `Query` with no elements.
     * @category Query
     */
    export function empty<T>(): Query<T>;

    /**
     * Creates a `Query` over a single element.
     *
     * @param value The only element for the `Query`.
     * @category Query
     */
    export function once<T>(value: T): Query<T>;

    /**
     * Creates a `Query` for a value repeated a provided number of times.
     *
     * @param value The value for each element of the `Query`.
     * @param count The number of times to repeat the value.
     * @category Query
     */
    export function repeat<T>(value: T, count: number): Query<T>;

    /**
     * Creates a `Query` over a range of numbers.
     *
     * @param start The starting number of the range.
     * @param end The ending number of the range.
     * @param increment The amount by which to change between each itereated value.
     * @category Query
     */
    export function range(start: number, end: number, increment?: number): Query<number>;

    /**
     * Creates a `Query` that repeats the provided value forever.
     *
     * @param value The value for each element of the `Query`.
     * @category Query
     */
    export function continuous<T>(value: T): Query<T>;

    /**
     * Creates a `Query` whose values are provided by a callback executed a provided number of
     * times.
     *
     * @param count The number of times to execute the callback.
     * @param generator The callback to execute.
     * @category Query
     */
    export function generate<T>(count: number, generator: (offset: number) => T): Query<T>;

    /**
     * Creates a HierarchyQuery from a root node and a HierarchyProvider.
     *
     * @param root The root node of the hierarchy.
     * @param hierarchy A `HierarchyProvider` object.
     * @category Query
     */
    export function hierarchy<TNode, T extends TNode>(root: T, hierarchy: HierarchyProvider<TNode>): HierarchyQuery<TNode, T>;

    /**
     * Creates a `Query` that, when iterated, consumes the provided `Iterator`.
     *
     * @param iterator An `Iterator` object.
     * @category Query
     */
    export function consume<T>(iterator: Iterator<T>, options?: ConsumeOptions): Query<T>;

    /**
     * Creates a `Query` that iterates the elements from one of two sources based on the result of a
     * lazily evaluated condition.
     *
     * @param condition A callback used to choose a source.
     * @param thenQueryable The source to use when the callback evaluates to `true`.
     * @param elseQueryable The source to use when the callback evaluates to `false`.
     * @category Query
     */
    function _if<T>(condition: () => boolean, thenQueryable: Queryable<T>, elseQueryable?: Queryable<T>): Query<T>;
    export { _if as if };

    /**
     * Creates a `Query` that iterates the elements from sources picked from a list based on the
     * result of a lazily evaluated choice.
     *
     * @param chooser A callback used to choose a source.
     * @param choices A list of sources
     * @param otherwise A default source to use when another choice could not be made.
     * @category Query
     */
    export function choose<K, V>(chooser: () => K, choices: Queryable<Choice<K, V>>, otherwise?: Queryable<V>): Query<V>;

    /**
     * Creates a `Query` for the own property keys of an object.
     *
     * @param source An object.
     * @category Query
     */
    export function objectKeys<T extends object>(source: T): Query<Extract<keyof T, string>>;

    /**
     * Creates a `Query` for the own property values of an object.
     *
     * @param source An object.
     * @category Query
     */
    export function objectValues<T extends object>(source: T): Query<T[Extract<keyof T, string>]>;

    /**
     * Creates a `Query` for the own property key-value pairs of an object.
     *
     * @param source An object.
     * @category Query
     */
    export function objectEntries<T extends object>(source: T): Query<KeyValuePair<T, Extract<keyof T, string>>>;
}

export interface Query<T> {
    // #region Subqueries

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @param predicate.element The element to test.
     * @param predicate.offset The offset from the start of the source iterable.
     * @category Subquery
     */
    filter<U extends T>(predicate: (element: T, offset: number) => element is U): Query<U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @param predicate.element The element to test.
     * @param predicate.offset The offset from the start of the source iterable.
     * @category Subquery
     */
    filter(predicate: (element: T, offset: number) => boolean): Query<T>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * NOTE: This is an alias for `filter`.
     *
     * @param predicate A callback used to match each element.
     * @param predicate.element The element to test.
     * @param predicate.offset The offset from the start of the source iterable.
     * @category Subquery
     */
    where<U extends T>(predicate: (element: T, offset: number) => element is U): Query<U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * NOTE: This is an alias for `filter`.
     *
     * @param predicate A callback used to match each element.
     * @param predicate.element The element to test.
     * @param predicate.offset The offset from the start of the source iterable.
     * @category Subquery
     */
    where(predicate: (element: T, offset: number) => boolean): Query<T>;

    /**
     * Creates a subquery whose elements are neither `null` nor `undefined`.
     *
     * @category Subquery
     */
    filterDefined(): Query<NonNullable<T>>;

    /**
     * Creates a subquery whose elements are neither `null` nor `undefined`.
     *
     * NOTE: This is an alias for `filterDefined`.
     *
     * @category Subquery
     */
    whereDefined(): Query<NonNullable<T>>;

    /**
     * Creates a subquery by applying a callback to each element.
     *
     * @param selector A callback used to map each element.
     * @param selector.element The element to map.
     * @param selector.offset The offset from the start of the source iterable.
     * @category Subquery
     */
    map<U>(selector: (element: T, offset: number) => U): Query<U>;

    /**
     * Creates a subquery by applying a callback to each element.
     *
     * NOTE: This is an alias for `map`.
     *
     * @param selector A callback used to map each element.
     * @param selector.element The element to map.
     * @param selector.offset The offset from the start of the source iterable.
     * @category Subquery
     */
    select<U>(selector: (element: T, offset: number) => U): Query<U>;

    /**
     * Creates a subquery that iterates the results of applying a callback to each element.
     *
     * @param projection A callback used to map each element into an iterable.
     * @param projection.element The element to flatMap.
     * @category Subquery
     */
    flatMap<U>(projection: (element: T) => Queryable<U>): Query<U>;

    /**
     * Creates a subquery that iterates the results of applying a callback to each element.
     *
     * NOTE: This is an alias for `flatMap`.
     *
     * @param projection A callback used to map each element into an iterable.
     * @param projection.element The element to flatMap.
     * @category Subquery
     */
    selectMany<U>(projection: (element: T) => Queryable<U>): Query<U>;

    /**
     * Creates a subquery that iterates the results of recursively expanding the
     * elements of the source.
     *
     * @param projection A callback used to recusively expand each element.
     * @param projection.element The element to expand.
     * @category Subquery
     */
    expand(projection: (element: T) => Queryable<T>): Query<T>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     *
     * @param callback The callback to invoke.
     * @param callback.element An element of the source.
     * @param callback.offset The offset from the start of the source iterable.
     * @category Subquery
     */
    do(callback: (element: T, offset: number) => void): Query<T>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     *
     * NOTE: This is an alias for `do`.
     *
     * @param callback The callback to invoke.
     * @param callback.element An element of the source.
     * @param callback.offset The offset from the start of the source iterable.
     * @category Subquery
     */
    tap(callback: (element: T, offset: number) => void): Query<T>;

    /**
     * Creates a subquery whose elements are in the reverse order.
     * @category Subquery
     */
    reverse(): Query<T>;

    /**
     * Creates a subquery containing all elements except the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     * @category Subquery
     */
    skip(count: number): Query<T>;

    /**
     * Creates a subquery containing all elements except the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     * @category Subquery
     */
    skipRight(count: number): Query<T>;

    /**
     * Creates a subquery containing all elements except the first elements that match
     * the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    skipWhile(predicate: (element: T) => boolean): Query<T>;

    /**
     * Creates a subquery containing all elements except the first elements that don't match
     * the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    skipUntil(predicate: (element: T) => boolean): Query<T>;

    /**
     * Creates a subquery containing the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     * @category Subquery
     */
    take(count: number): Query<T>;

    /**
     * Creates a subquery containing the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     * @category Subquery
     */
    takeRight(count: number): Query<T>;

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    takeWhile<U extends T>(predicate: (element: T) => element is U): Query<U>;

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     */
    takeWhile(predicate: (element: T) => boolean): Query<T>;

    /**
     * Creates a subquery containing the first elements that do not match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    takeUntil(predicate: (element: T) => boolean): Query<T>;

    /**
     * Creates a subquery for the set intersection of this `Query` and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    intersect<TNode, T extends TNode>(right: HierarchyIterable<TNode, T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the set intersection of this `Query` and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    intersect(right: Queryable<T>): Query<T>;

    /**
     * Creates a subquery for the set union of this `Query` and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    union<TNode, T extends TNode>(right: HierarchyIterable<TNode, T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the set union of this `Query` and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    union(right: Queryable<T>): Query<T>;

    /**
     * Creates a subquery for the set difference between this and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    except(right: Queryable<T>): Query<T>;

    /**
     * Creates a subquery for the set difference between this and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    relativeComplement(right: Queryable<T>): Query<T>;

    /**
     * Creates a subquery for the symmetric difference between this and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    symmetricDifference<TNode, T extends TNode>(right: HierarchyIterable<TNode, T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the symmetric difference between this and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    symmetricDifference(right: Queryable<T>): Query<T>;

    /**
     * Creates a subquery for the symmetric difference between this and another [[Queryable]].
     *
     * This is an alias for `symmetricDifference`.
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    xor<TNode, T extends TNode>(right: HierarchyIterable<TNode, T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the symmetric difference between this and another [[Queryable]].
     *
     * This is an alias for `symmetricDifference`.
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    xor(right: Queryable<T>): Query<T>;

    /**
     * Creates a subquery that concatenates this `Query` with another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    concat<TNode, T extends TNode>(right: HierarchyIterable<TNode, T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery that concatenates this `Query` with another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    concat(right: Queryable<T>): Query<T>;

    /**
     * Creates a subquery for the distinct elements of this `Query`.
     * @category Subquery
     */
    distinct(): Query<T>;

    /**
     * Creates a subquery for the elements of this `Query` with the provided value appended to the end.
     *
     * @param value The value to append.
     * @category Subquery
     */
    append(value: T): Query<T>;

    /**
     * Creates a subquery for the elements of this `Query` with the provided value prepended to the beginning.
     *
     * @param value The value to prepend.
     * @category Subquery
     */
    prepend(value: T): Query<T>;

    /**
     * Creates a subquery for the elements of this `Query` with the provided range
     * patched into the results.
     *
     * @param start The offset at which to patch the range.
     * @param skipCount The number of elements to skip from start.
     * @param range The range to patch into the result.
     * @category Subquery
     */
    patch(start: number, skipCount?: number, range?: Queryable<T>): Query<T>;

    /**
     * Creates a subquery that contains the provided default value if this `Query`
     * contains no elements.
     *
     * @param defaultValue The default value.
     * @category Subquery
     */
    defaultIfEmpty(defaultValue: T): Query<T>;

    /**
     * Creates a subquery that splits this `Query` into one or more pages.
     * While advancing from page to page is evaluated lazily, the elements of the page are
     * evaluated eagerly.
     *
     * @param pageSize The number of elements per page.
     * @category Subquery
     */
    pageBy(pageSize: number): Query<Page<T>>;

    /**
     * Creates a subquery that combines this `Query` with another [[Queryable]] by combining elements
     * in tuples.
     *
     * @param right A [[Queryable]] object.
     * @category Join
     */
    zip<U>(right: Queryable<U>): Query<[T, U]>;

    /**
     * Creates a subquery that combines this `Query` with another [[Queryable]] by combining elements
     * using the supplied callback.
     *
     * @param right A [[Queryable]] object.
     * @param selector A callback used to combine two elements.
     * @category Join
     */
    zip<U, R>(right: Queryable<U>, selector: (left: T, right: U) => R): Query<R>;

    /**
     * Creates an ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    orderBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T>;

    /**
     * Creates an ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    orderByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T>;

    /**
     * Creates a subquery whose elements are the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @category Subquery
     */
    spanMap<K>(keySelector: (element: T) => K): Query<Grouping<K, T>>;

    /**
     * Creates a subquery whose values are computed from each element of the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @category Subquery
     */
    spanMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Query<Grouping<K, V>>;

    /**
     * Creates a subquery whose values are computed from the contiguous ranges of elements that share the same key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @param spanSelector A callback used to select a result from a contiguous range.
     * @category Subquery
     */
    spanMap<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V, spanSelector: (key: K, elements: Query<V>) => R): Query<R>;

    /**
     * Groups each element of this `Query` by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @category Subquery
     */
    groupBy<K>(keySelector: (element: T) => K): Query<Grouping<K, T>>;

    /**
     * Groups each element by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @category Subquery
     */
    groupBy<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Query<Grouping<K, V>>;

    /**
     * Groups each element by its key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param elementSelector A callback used to select a value for an element.
     * @param resultSelector A callback used to select a result from a group.
     * @category Subquery
     */
    groupBy<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R): Query<R>;

    /**
     * Creates a grouped subquery for the correlated elements of this `Query` and another [[Queryable]] object.
     *
     * @param inner A [[Queryable]] object.
     * @param outerKeySelector A callback used to select the key for an element in this `Query`.
     * @param innerKeySelector A callback used to select the key for an element in the other [[Queryable]] object.
     * @param resultSelector A callback used to select the result for the correlated elements.
     * @category Join
     */
    groupJoin<I, K, R>(inner: Queryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: Query<I>) => R): Query<R>;

    /**
     * Creates a subquery for the correlated elements of this `Query` and another [[Queryable]].
     *
     * @param inner A [[Queryable]] object.
     * @param outerKeySelector A callback used to select the key for an element in this `Query`.
     * @param innerKeySelector A callback used to select the key for an element in the other Queryable.
     * @param resultSelector A callback used to select the result for the correlated elements.
     * @category Join
     */
    join<I, K, R>(inner: Queryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: I) => R): Query<R>

    /**
     * Creates a subquery for the correlated elements of this `Query` and another [[Queryable]].
     *
     * @param inner A [[Queryable]] object.
     * @param outerKeySelector A callback used to select the key for an element in this `Query`.
     * @param innerKeySelector A callback used to select the key for an element in the other Queryable.
     * @param resultSelector A callback used to select the result for the correlated elements.
     * @category Join
     */
    fullJoin<I, K, R>(inner: Queryable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T | undefined, inner: I | undefined) => R): Query<R>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element.
     *
     * @param accumulator The callback used to compute each result.
     * @category Subquery
     */
    scan(accumulator: (current: T, element: T, offset: number) => T): Query<T>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element.
     *
     * @param accumulator The callback used to compute each result.
     * @param seed An optional seed value.
     * @category Subquery
     */
    scan<U>(accumulator: (current: U, element: T, offset: number) => U, seed: U): Query<U>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.
     *
     * @param accumulator The callback used to compute each result.
     * @category Subquery
     */
    scanRight(accumulator: (current: T, element: T, offset: number) => T): Query<T>;

    /**
     * Creates a subquery containing the cumulative results of applying the provided callback to each element in reverse.
     *
     * @param accumulator The callback used to compute each result.
     * @param seed An optional seed value.
     * @category Subquery
     */
    scanRight<U>(accumulator: (current: U, element: T, offset: number) => U, seed?: U): Query<U>;

    /**
     * Pass the entire query to the provided callback, creating a new query from the result.
     *
     * @param callback A callback function.
     * @category Subquery
     */
    through<UNode, U extends UNode>(callback: (source: this) => OrderedHierarchyIterable<UNode, U>): OrderedHierarchyQuery<UNode, U>;

    /**
     * Pass the entire query to the provided callback, creating a new query from the result.
     *
     * @param callback A callback function.
     * @category Subquery
     */
    through<UNode, U extends UNode>(callback: (source: this) => HierarchyIterable<UNode, U>): HierarchyQuery<UNode, U>;

    /**
     * Pass the entire query to the provided callback, creating a new query from the result.
     *
     * @param callback A callback function.
     * @category Subquery
     */
    through<U>(callback: (source: this) => OrderedIterable<U>): OrderedQuery<U>;

    /**
     * Pass the entire query to the provided callback, creating a new query from the result.
     *
     * @param callback A callback function.
     * @category Subquery
     */
    through<U>(callback: (source: this) => Queryable<U>): Query<U>;

    /**
     * Creates a HierarchyQuery using the provided HierarchyProvider.
     *
     * @param hierarchy A HierarchyProvider.
     * @category Hierarchy
     */
    toHierarchy(hierarchy: HierarchyProvider<T>): HierarchyQuery<T>;

    // #endregion Subqueries

    // #region Scalars

    /**
     * Eagerly evaluate the query, returning a new `Query`.
     * @category Scalar
     */
    eval(): Query<T>;

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     * @category Scalar
     */
    reduce(accumulator: (current: T, element: T, offset: number) => T): T;

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @category Scalar
     */
    reduce<U>(accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector?: (result: U, count: number) => U): U;

    /**
     * Computes a scalar value by applying an accumulator callback over each element.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @param resultSelector An optional callback used to compute the final result.
     * @category Scalar
     */
    reduce<U, R>(accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): R;

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     * @category Scalar
     */
    reduceRight(accumulator: (current: T, element: T, offset: number) => T): T;

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @category Scalar
     */
    reduceRight<U>(accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector?: (result: U, count: number) => U): U;

    /**
     * Computes a scalar value by applying an accumulator callback over each element in reverse.
     *
     * @param accumulator the callback used to compute the result.
     * @param seed An optional seed value.
     * @param resultSelector An optional callback used to compute the final result.
     * @category Scalar
     */
    reduceRight<U, R>(accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): R;

    /**
     * Counts the number of elements in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    count(predicate?: (element: T) => boolean): number;

    /**
     * Gets the first element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    first<U extends T>(predicate: (element: T) => element is U): U | undefined;

    /**
     * Gets the first element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    first(predicate?: (element: T) => boolean): T | undefined;

    /**
     * Gets the last element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    last<U extends T>(predicate: (element: T) => element is U): U | undefined;

    /**
     * Gets the last element in the Query, optionally filtering elements using the supplied
     * callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    last(predicate?: (element: T) => boolean): T | undefined;

    /**
     * Gets the only element in the Query, or returns undefined.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    single<U extends T>(predicate: (element: T) => element is U): U | undefined;

    /**
     * Gets the only element in the Query, or returns undefined.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    single(predicate?: (element: T) => boolean): T | undefined;

    /**
     * Gets the minimum element in the query, optionally comparing elements using the supplied
     * callback.
     *
     * @param comparison An optional callback used to compare two elements.
     * @category Scalar
     */
    min(comparison?: (x: T, y: T) => number): T | undefined;

    /**
     * Gets the maximum element in the query, optionally comparing elements using the supplied
     * callback.
     *
     * @param comparison An optional callback used to compare two elements.
     * @category Scalar
     */
    max(comparison?: (x: T, y: T) => number): T | undefined;

    /**
     * @category Scalar
     */
    sum(selector: (element: T) => number): number;
    /**
     * @category Scalar
     */
    sum(): T extends number ? number : never;

    /**
     * @category Scalar
     */
    average(selector: (element: T) => number): number;
    /**
     * @category Scalar
     */
    average(): T extends number ? number : unknown; // no literal for NaN

    /**
     * Computes a scalar value indicating whether the Query contains any elements,
     * optionally filtering the elements using the supplied callback.
     *
     * @param predicate An optional callback used to match each element.
     * @category Scalar
     */
    some(predicate?: (element: T) => boolean): boolean;

    /**
     * Computes a scalar value indicating whether all elements of the Query
     * match the supplied callback.
     *
     * @param predicate A callback used to match each element.
     * @category Scalar
     */
    every<U extends T>(predicate: (element: T) => element is U): this is Query<U>;

    /**
     * Computes a scalar value indicating whether all elements of the Query
     * match the supplied callback.
     *
     * @param predicate A callback used to match each element.
     * @category Scalar
     */
    every(predicate: (element: T) => boolean): boolean;

    /**
     * Computes a scalar value indicating whether every element in this `Query` corresponds to a matching element
     * in another [[Queryable]] at the same position.
     *
     * @param right A [[Queryable]] object.
     * @category Scalar
     */
    corresponds(right: Queryable<T>): boolean;

    /**
     * Computes a scalar value indicating whether every element in this `Query` corresponds to a matching element
     * in another [[Queryable]] at the same position.
     *
     * @param right A [[Queryable]] object.
     * @param equalityComparison An optional callback used to compare the equality of two elements.
     * @category Scalar
     */
    corresponds<U>(right: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;

    /**
     * Computes a scalar value indicating whether the provided value is included in the query.
     *
     * @param value A value.
     * @category Scalar
     */
    includes(value: T): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this `Query` include
     * an exact sequence of elements from another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Scalar
     */
    includesSequence(right: Queryable<T>): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this `Query` include
     * an exact sequence of elements from another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @param equalityComparison A callback used to compare the equality of two elements.
     * @category Scalar
     */
    includesSequence<U>(right: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this `Query` start
     * with the same sequence of elements in another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Scalar
     */
    startsWith(right: Queryable<T>): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this `Query` start
     * with the same sequence of elements in another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @param equalityComparison A callback used to compare the equality of two elements.
     * @category Scalar
     */
    startsWith<U>(right: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this `Query` end
     * with the same sequence of elements in another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Scalar
     */
    endsWith(right: Queryable<T>): boolean;

    /**
     * Computes a scalar value indicating whether the elements of this `Query` end
     * with the same sequence of elements in another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @param equalityComparison A callback used to compare the equality of two elements.
     * @category Scalar
     */
    endsWith<U>(right: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;

    /**
     * Finds the value in the Query at the provided offset. A negative offset starts from the
     * last element.
     *
     * @param offset An offset.
     * @category Scalar
     */
    elementAt(offset: number): T | undefined;

    /**
     * Finds the value in the Query at the provided offset. A negative offset starts from the
     * last element.
     *
     * This is an alias for `elementAt`.
     *
     * @param offset An offset.
     * @category Scalar
     */
    nth(offset: number): T | undefined;

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
    span<U extends T>(predicate: (element: T) => element is U): [Query<U>, Query<T>];

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
    span(predicate: (element: T) => boolean): [Query<T>, Query<T>];

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
    break(predicate: (element: T) => boolean): [Query<T>, Query<T>];

    /**
     * Invokes a callback for each element of the query.
     *
     * @param callback The callback to invoke.
     * @category Scalar
     */
    forEach(callback: (element: T, offset: number) => void): void;

    /**
     * Iterates over all of the elements in the query, ignoring the results.
     * @category Scalar
     */
    drain(): void;

    /**
     * Creates an Array for the elements of the Query.
     * @category Scalar
     */
    toArray(elementSelector?: (element: T) => T): T[];

    /**
     * Creates an Array for the elements of the Query.
     *
     * @param elementSelector A callback that selects a value for each element.
     * @category Scalar
     */
    toArray<V>(elementSelector: (element: T) => V): V[];

    /**
     * Creates a `Set` for the elements of the `Query`.
     * @category Scalar
     */
    toSet(elementSelector?: (element: T) => T): Set<T>;

    /**
     * Creates a `Set` for the elements of the `Query`.
     *
     * @param elementSelector A callback that selects a value for each element.
     * @category Scalar
     */
    toSet<V>(elementSelector: (element: T) => V): Set<V>;

    /**
     * Creates a `Map` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     * @category Scalar
     */
    toMap<K>(keySelector: (element: T) => K): Map<K, T>;

    /**
     * Creates a `Map` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     * @category Scalar
     */
    toMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Map<K, V>;

    /**
     * Creates a `Lookup` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     * @category Scalar
     */
    toLookup<K>(keySelector: (element: T) => K): Lookup<K, T>;

    /**
     * Creates a `Lookup` for the elements of the `Query`.
     *
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     * @category Scalar
     */
    toLookup<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Lookup<K, V>;

    /**
     * Creates an `object` for the elements of the `Query`.
     *
     * @param prototype The prototype for the object.
     * @param keySelector A callback used to select a key for each element.
     * @category Scalar
     */
    toObject(prototype: object | null, keySelector: (element: T) => PropertyKey): object;

    /**
     * Creates an `object` for the elements of the `Query`.
     *
     * @param prototype The prototype for the object.
     * @param keySelector A callback used to select a key for each element.
     * @param elementSelector A callback that selects a value for each element.
     * @category Scalar
     */
    toObject<V>(prototype: object | null, keySelector: (element: T) => PropertyKey, elementSelector: (element: T) => V): object;

    toJSON(): T[];

    // #endregion Scalars
}

/**
 * Represents a sequence of hierarchically organized values.
 */
@Registry.QueryConstructor("HierarchyQuery")
export class HierarchyQuery<TNode, T extends TNode = TNode> extends Query<T> implements HierarchyIterable<TNode, T> {
    constructor(source: HierarchyIterable<TNode, T>);
    constructor(source: Queryable<T>, hierarchy: HierarchyProvider<TNode>);
    constructor(source: Queryable<T> | HierarchyIterable<TNode, T>, hierarchy?: HierarchyProvider<TNode>) {
        if (hierarchy !== undefined) {
            source = MakeHierarchyIterable(source, hierarchy);
        }
        assert.mustBeHierarchyIterable(source as HierarchyIterable<T>, "source");
        super(source);
    }

    [Hierarchical.hierarchy](): HierarchyProvider<TNode> {
        return GetHierarchy(GetSource(this));
    }
}

export declare namespace HierarchyQuery {
}

export interface HierarchyQuery<TNode, T extends TNode = TNode> {
    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    filter<U extends T>(predicate: (element: T, offset: number) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    filter(predicate: (element: T, offset: number) => boolean): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    where<U extends T>(predicate: (element: T, offset: number) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery whose elements match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    where(predicate: (element: T, offset: number) => boolean): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery whose elements are neither `null` nor `undefined`.
     *
     * @category Subquery
     */
    filterDefined(): HierarchyQuery<TNode, NonNullable<T>>;

    /**
     * Creates a subquery whose elements are neither `null` nor `undefined`.
     *
     * @category Subquery
     */
    whereDefined(): HierarchyQuery<TNode, NonNullable<T>>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     *
     * @param callback The callback to invoke.
     * @category Subquery
     */
    do(callback: (element: T, offset: number) => void): HierarchyQuery<TNode, T>;

    /**
     * Lazily invokes a callback as each element of the query is iterated.
     * This is an alias for `do`.
     *
     * @param callback The callback to invoke.
     * @category Subquery
     */
    tap(callback: (element: T, offset: number) => void): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery whose elements are in the reverse order.
     * @category Subquery
     */
    reverse(): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing all elements except the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     * @category Subquery
     */
    skip(count: number): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing all elements except the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to skip.
     * @category Subquery
     */
    skipRight(count: number): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing all elements except the first elements that match
     * the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    skipWhile(predicate: (element: T) => boolean): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing the first elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     * @category Subquery
     */
    take(count: number): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing the last elements up to the supplied
     * count.
     *
     * @param count The number of elements to take.
     * @category Subquery
     */
    takeRight(count: number): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    takeWhile<U extends T>(predicate: (element: T) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    takeWhile<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery containing the first elements that match the supplied predicate.
     *
     * @param predicate A callback used to match each element.
     * @category Subquery
     */
    takeWhile(predicate: (element: T) => boolean): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the set intersection of this `Query` and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    intersect(right: Queryable<T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the set union of this `Query` and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    union(right: Queryable<T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the set difference between this `Query` and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    except(right: Queryable<T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the set difference between this `Query` and another [[Queryable]].
     *
     * This is an alias for `except`.
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    relativeComplement(right: Queryable<T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the symmetric difference between this and another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    symmetricDifference(right: Queryable<T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the symmetric difference between this and another [[Queryable]].
     *
     * This is an alias for `symmetricDifference`.
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    xor(right: Queryable<T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery that concatenates this `Query` with another [[Queryable]].
     *
     * @param right A [[Queryable]] object.
     * @category Subquery
     */
    concat(right: Queryable<T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery that concatenates this `Query` with another [[Queryable]].
     * @category Subquery
     */
    distinct(): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the elements of this `Query` with the provided value appended to the end.
     *
     * @param value The value to append.
     * @category Subquery
     */
    append(value: T): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the elements of this `Query` with the provided value prepended to the beginning.
     *
     * @param value The value to prepend.
     * @category Subquery
     */
    prepend(value: T): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the elements of this `Query` with the provided range
     * patched into the results.
     *
     * @param start The offset at which to patch the range.
     * @param skipCount The number of elements to skip from start.
     * @param range The range to patch into the result.
     * @category Subquery
     */
    patch(start: number, skipCount?: number, range?: Queryable<T>): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery that contains the provided default value if this `Query`
     * contains no elements.
     *
     * @param defaultValue The default value.
     * @category Subquery
     */
    defaultIfEmpty(defaultValue: T): HierarchyQuery<TNode, T>;

    /**
     * Eagerly evaluate the query, returning a new `Query`.
     * @category Scalar
     */
    eval(): HierarchyQuery<TNode, T>;

    /**
     * Creates an ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    orderBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<TNode, T>;

    /**
     * Creates an ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    orderByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the roots of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    root<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the roots of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    root(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the ancestors of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    ancestors<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the ancestors of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    ancestors(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the ancestors of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    ancestorsAndSelf<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the ancestors of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    ancestorsAndSelf(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the descendants of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    descendants<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the descendants of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    descendants(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the descendants of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    descendantsAndSelf<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the descendants of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    descendantsAndSelf(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for this `query`.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    self<U extends T>(predicate: (element: T) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for this `query`.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    self<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for this `query`.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    self(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the parents of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    parents<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the parents of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    parents(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the children of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    children<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the children of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    children(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the siblings of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblings<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings of each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblings(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the siblings of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsAndSelf<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings of each element as well as each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsAndSelf(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the siblings before each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsBeforeSelf<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings before each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsBeforeSelf(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the siblings after each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsAfterSelf<U extends TNode>(predicate: (element: TNode) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the siblings after each element in the hierarchy.
     *
     * @param predicate A callback used to filter the results.
     * @category Hierarchy
     */
    siblingsAfterSelf(predicate?: (element: TNode) => boolean): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the child of each element at the specified offset. A negative offset
     * starts from the last child.
     *
     * @param offset The offset for the child.
     * @category Hierarchy
     */
    nthChild(offset: number): HierarchyQuery<TNode>;

    /**
     * Creates a subquery for the top-most elements. Elements that are a descendant of any other
     * element are removed.
     * @category Hierarchy
     */
    topMost<U extends T>(predicate: (element: T) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the top-most elements. Elements that are a descendant of any other
     * element are removed.
     * @category Hierarchy
     */
    topMost(predicate?: (element: T) => boolean): HierarchyQuery<TNode, T>;

    /**
     * Creates a subquery for the bottom-most elements. Elements that are an ancestor of any other
     * element are removed.
     * @category Hierarchy
     */
    bottomMost<U extends T>(predicate: (element: T) => element is U): HierarchyQuery<TNode, U>;

    /**
     * Creates a subquery for the bottom-most elements. Elements that are an ancestor of any other
     * element are removed.
     * @category Hierarchy
     */
    bottomMost(predicate?: (element: T) => boolean): HierarchyQuery<TNode, T>;

    /**
     * Computes a scalar value indicating whether all elements of the Query
     * match the supplied callback.
     *
     * @param predicate A callback used to match each element.
     * @category Scalar
     */
    every<U extends T>(predicate: (element: T) => element is U): this is HierarchyQuery<TNode, U>;

    /**
     * Computes a scalar value indicating whether all elements of the Query
     * match the supplied callback.
     *
     * @param predicate A callback used to match each element.
     * @category Scalar
     */
    every(predicate: (element: T) => boolean): boolean;
}

/**
 * Represents an ordered sequence of elements.
 */
@Registry.QueryConstructor("OrderedQuery")
export class OrderedQuery<T> extends Query<T> implements OrderedIterable<T> {
    constructor(source: OrderedIterable<T>) {
        assert.mustBeOrderedIterable(source, "source");
        super(source);
    }

    [OrderedIterable.thenBy]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): OrderedIterable<T> {
        return ThenBy(GetSource(this), keySelector, comparison, descending);
    }
}

export declare namespace OrderedQuery {
}

export interface OrderedQuery<T> {
    /**
     * Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T>;

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedQuery<T>;

    /**
     * Computes a scalar value indicating whether all elements of the Query
     * match the supplied callback.
     *
     * @param predicate A callback used to match each element.
     * @category Scalar
     */
    every<U extends T>(predicate: (element: T) => element is U): this is OrderedQuery<U>;

    /**
     * Computes a scalar value indicating whether all elements of the Query
     * match the supplied callback.
     *
     * @param predicate A callback used to match each element.
     * @category Scalar
     */
    every(predicate: (element: T) => boolean): boolean;
}

/**
 * Represents an ordered sequence of hierarchically organized values.
 */
@Registry.QueryConstructor("OrderedHierarchyQuery")
export class OrderedHierarchyQuery<TNode, T extends TNode = TNode> extends HierarchyQuery<TNode, T> implements OrderedHierarchyIterable<TNode, T> {
    constructor(source: OrderedHierarchyIterable<TNode, T>);
    constructor(source: OrderedIterable<T>, hierarchy: HierarchyProvider<TNode>);
    constructor(source: OrderedIterable<T> | OrderedHierarchyIterable<TNode, T>, hierarchy?: HierarchyProvider<TNode>) {
        assert.mustBeOrderedIterable(source, "source");
        if (hierarchy === undefined && IsHierarchyIterable(source)) {
            super(source);
        }
        else {
            super(source, hierarchy!);
        }
    }

    [OrderedIterable.thenBy]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): OrderedHierarchyIterable<TNode, T> {
        return ThenBy(GetSource(this), keySelector, comparison, descending);
    }
}

export declare namespace OrderedHierarchyQuery {
}

export interface OrderedHierarchyQuery<TNode, T extends TNode = TNode> {
    /**
     * Creates a subsequent ordered subquery whose elements are sorted in ascending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    thenBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<TNode, T>;

    /**
     * Creates a subsequent ordered subquery whose elements are sorted in descending order by the provided key.
     *
     * @param keySelector A callback used to select the key for an element.
     * @param comparison An optional callback used to compare two keys.
     * @category Order
     */
    thenByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<TNode, T>;

    /**
     * Computes a scalar value indicating whether all elements of the Query
     * match the supplied callback.
     *
     * @param predicate A callback used to match each element.
     * @category Scalar
     */
    every<U extends T>(predicate: (element: T) => element is U): this is OrderedHierarchyQuery<TNode, U>;

    /**
     * Computes a scalar value indicating whether all elements of the Query
     * match the supplied callback.
     *
     * @param predicate A callback used to match each element.
     * @category Scalar
     */
    every(predicate: (element: T) => boolean): boolean;
}
