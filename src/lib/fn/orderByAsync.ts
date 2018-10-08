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
/** @module "iterable-query/fn" */

import { assert, CompareValues, FlowHierarchy, ThenByAsync, ToAsyncOrderedIterable, ToPossiblyAsyncIterable, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncHierarchyIterable, AsyncOrderedHierarchyIterable, AsyncQueryable, AsyncOrderedIterable, PossiblyAsyncOrderedHierarchyIterable, PossiblyAsyncOrderedIterable, PossiblyAsyncIterable } from "../types";
import { toArrayAsync } from "./toArrayAsync";

/**
 * Creates an [[AsyncOrderedHierarchyIterable]] whose elements are sorted in ascending order by the provided key.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param comparison An optional callback used to compare two keys.
 * @category Order
 */
export function orderByAsync<TNode, T extends TNode, K>(source: PossiblyAsyncHierarchyIterable<TNode, T>, keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncOrderedIterable]] whose elements are sorted in ascending order by the provided key.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param comparison An optional callback used to compare two keys.
 * @category Order
 */
export function orderByAsync<T, K>(source: AsyncQueryable<T>, keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedIterable<T>;
export function orderByAsync<T, K>(source: AsyncQueryable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): AsyncOrderedIterable<T> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(comparison, "comparison");
    return FlowHierarchy(new AsyncOrderByIterable(ToPossiblyAsyncIterable(source), keySelector, comparison, /*descending*/ false), source);
}

/**
 * Creates an [[AsyncOrderedHierarchyIterable]] whose elements are sorted in descending order by the provided key.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param comparison An optional callback used to compare two keys.
 * @category Order
 */
export function orderByDescendingAsync<TNode, T extends TNode, K>(source: PossiblyAsyncHierarchyIterable<TNode, T>, keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncOrderedIterable]] whose elements are sorted in descending order by the provided key.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param comparison An optional callback used to compare two keys.
 * @category Order
 */
export function orderByDescendingAsync<T, K>(source: AsyncQueryable<T>, keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedIterable<T>;
export function orderByDescendingAsync<T, K>(source: AsyncQueryable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): AsyncOrderedIterable<T> {
    assert.mustBeAsyncQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(comparison, "comparison");
    return FlowHierarchy(new AsyncOrderByIterable(ToPossiblyAsyncIterable(source), keySelector, comparison, /*descending*/ true), source);
}

/**
 * Creates a subsequent [[AsyncOrderedHierarchyIterable]] whose elements are also sorted in ascending order by the provided key.
 *
 * @param source An [[OrderedHierarchyIterable]] or [[AsyncOrderedHierarchyIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param comparison An optional callback used to compare two keys.
 * @category Order
 */
export function thenByAsync<TNode, T extends TNode, K>(source: PossiblyAsyncOrderedHierarchyIterable<TNode, T>, keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyIterable<TNode, T>;
/**
 * Creates a subsequent [[AsyncOrderedIterable]] whose elements are also sorted in ascending order by the provided key.
 *
 * @param source An [[OrderedIterable]] or [[AsyncOrderedIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param comparison An optional callback used to compare two keys.
 * @category Order
 */
export function thenByAsync<T, K>(source: PossiblyAsyncOrderedIterable<T>, keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedIterable<T>;
export function thenByAsync<T, K>(source: PossiblyAsyncOrderedIterable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): AsyncOrderedIterable<T> {
    assert.mustBePossiblyAsyncOrderedIterable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(comparison, "comparison");
    return FlowHierarchy(ThenByAsync(ToAsyncOrderedIterable(source), keySelector, comparison, /*descending*/ false), source);
}

/**
 * Creates a subsequent [[AsyncOrderedHierarchyIterable]] whose elements are also sorted in descending order by the provided key.
 *
 * @param source An [[OrderedHierarchyIterable]] or [[AsyncOrderedHierarchyIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param comparison An optional callback used to compare two keys.
 * @category Order
 */
export function thenByDescendingAsync<TNode, T extends TNode, K>(source: PossiblyAsyncOrderedHierarchyIterable<TNode, T>, keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedHierarchyIterable<TNode, T>;
/**
 * Creates a subsequent [[AsyncOrderedIterable]] whose elements are also sorted in descending order by the provided key.
 *
 * @param source An [[OrderedIterable]] or [[AsyncOrderedIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param comparison An optional callback used to compare two keys.
 * @category Order
 */
export function thenByDescendingAsync<T, K>(source: PossiblyAsyncOrderedIterable<T>, keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): AsyncOrderedIterable<T>;
export function thenByDescendingAsync<T, K>(source: PossiblyAsyncOrderedIterable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): AsyncOrderedIterable<T> {
    assert.mustBePossiblyAsyncOrderedIterable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(comparison, "comparison");
    return FlowHierarchy(ThenByAsync(ToAsyncOrderedIterable(source), keySelector, comparison, /*descending*/ true), source);
}

@ToStringTag("AsyncOrderByIterable")
class AsyncOrderByIterable<T, K> implements AsyncOrderedIterable<T> {
    protected _source: PossiblyAsyncIterable<T>;
    private _keySelector: (element: T) => K;
    private _comparison: (x: K, y: K) => number;
    private _descending: boolean;
    private _parent?: AsyncOrderByIterable<T, any>;

    constructor(source: PossiblyAsyncIterable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean, parent?: AsyncOrderByIterable<T, any>) {
        this._source = source;
        this._keySelector = keySelector;
        this._comparison = comparison;
        this._descending = descending;
        this._parent = parent;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const source = this._source;
        const array = await toArrayAsync(source);
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

    [AsyncOrderedIterable.thenByAsync]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedIterable<T> {
        assert.mustBeFunction(keySelector, "keySelector");
        assert.mustBeFunction(comparison, "comparison");
        assert.mustBeBoolean(descending, "descending");
        return new AsyncOrderByIterable(this._source, keySelector, comparison, descending, this);
    }

    private _getSorter(elements: T[], next?: (x: number, y: number) => number): (x: number, y: number) => number {
        const keySelector = this._keySelector;
        const comparison = this._comparison;
        const descending = this._descending;
        const parent = this._parent;
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

Registry.AsyncQuery.registerSubquery("orderBy", orderByAsync);
Registry.AsyncQuery.registerSubquery("orderByDescending", orderByDescendingAsync);
Registry.AsyncOrderedQuery.registerSubquery("thenBy", thenByAsync);
Registry.AsyncOrderedQuery.registerSubquery("thenByDescending", thenByDescendingAsync);
Registry.AsyncOrderedHierarchyQuery.registerSubquery("thenBy", thenByAsync);
Registry.AsyncOrderedHierarchyQuery.registerSubquery("thenByDescending", thenByDescendingAsync);