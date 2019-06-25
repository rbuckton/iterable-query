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

import { assert, FlowHierarchy, ToIterable, ThenBy, ToStringTag} from "../internal";
import { Queryable, OrderedIterable, HierarchyIterable, OrderedHierarchyIterable } from "../types";
import { toArray } from "./toArray";
import { Comparison, Comparer } from '@esfx/equatable';

/**
 * Creates an [[OrderedHierarchyIterable]] whose elements are sorted in ascending order by the provided key.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param comparison An optional callback used to compare two keys.
 * @category Order
 */
export function orderBy<TNode, T extends TNode, K>(source: HierarchyIterable<TNode, T>, keySelector: (element: T) => K, keyComparer?: Comparison<K> | Comparer<K>): OrderedHierarchyIterable<TNode, T>;
/**
 * Creates an [[OrderedIterable]] whose elements are sorted in ascending order by the provided key.
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param keyComparer An optional callback used to compare two keys.
 * @category Order
 */
export function orderBy<T, K>(source: Queryable<T>, keySelector: (element: T) => K, keyComparer?: Comparison<K> | Comparer<K>): OrderedIterable<T>;
export function orderBy<T, K>(source: Queryable<T>, keySelector: (element: T) => K, keyComparer: Comparison<K> | Comparer<K> = Comparer.defaultComparer): OrderedIterable<T> {
    if (typeof keyComparer === "function") keyComparer = Comparer.create(keyComparer);
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeComparer(keyComparer, "keyComparer");
    return FlowHierarchy(new OrderByIterable(ToIterable(source), keySelector, keyComparer, /*descending*/ false), source);
}

/**
 * Creates an [[OrderedHierarchyIterable]] whose elements are sorted in descending order by the provided key.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param keyComparer An optional callback used to compare two keys.
 * @category Order
 */
export function orderByDescending<TNode, T extends TNode, K>(source: HierarchyIterable<TNode, T>, keySelector: (element: T) => K, keyComparer?: Comparison<K> | Comparer<K>): OrderedHierarchyIterable<TNode, T>;
/**
 * Creates an [[OrderedIterable]] whose elements are sorted in descending order by the provided key.
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param keyComparer An optional callback used to compare two keys.
 * @category Order
 */
export function orderByDescending<T, K>(source: Queryable<T>, keySelector: (element: T) => K, keyComparer?: Comparison<K> | Comparer<K>): OrderedIterable<T>;
export function orderByDescending<T, K>(source: Queryable<T>, keySelector: (element: T) => K, keyComparer: Comparison<K> | Comparer<K> = Comparer.defaultComparer): OrderedIterable<T> {
    if (typeof keyComparer === "function") keyComparer = Comparer.create(keyComparer);
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeComparer(keyComparer, "keyComparer");
    return FlowHierarchy(new OrderByIterable(ToIterable(source), keySelector, keyComparer, /*descending*/ true), source);
}

/**
 * Creates a subsequent [[OrderedHierarchyIterable]] whose elements are also sorted in ascending order by the provided key.
 *
 * @param source An [[OrderedHierarchyIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param keyComparer An optional callback used to compare two keys.
 * @category Order
 */
export function thenBy<TNode, T extends TNode, K>(source: OrderedHierarchyIterable<TNode, T>, keySelector: (element: T) => K, keyComparer?: Comparison<K> | Comparer<K>): OrderedHierarchyIterable<TNode, T>;
/**
 * Creates a subsequent [[OrderedIterable]] whose elements are also sorted in ascending order by the provided key.
 *
 * @param source An [[OrderedIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param keyComparer An optional callback used to compare two keys.
 * @category Order
 */
export function thenBy<T, K>(source: OrderedIterable<T>, keySelector: (element: T) => K, keyComparer?: Comparison<K> | Comparer<K>): OrderedIterable<T>;
export function thenBy<T, K>(source: OrderedIterable<T>, keySelector: (element: T) => K, keyComparer: Comparison<K> | Comparer<K> = Comparer.defaultComparer): OrderedIterable<T> {
    if (typeof keyComparer === "function") keyComparer = Comparer.create(keyComparer);
    assert.mustBeOrderedIterable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeComparer(keyComparer, "keyComparer");
    return FlowHierarchy(ThenBy(source, keySelector, keyComparer, /*descending*/ false), source);
}

/**
 * Creates a subsequent [[OrderedHierarchyIterable]] whose elements are also sorted in descending order by the provided key.
 *
 * @param source An [[OrderedHierarchyIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param keyComparer An optional callback used to compare two keys.
 * @category Order
 */
export function thenByDescending<TNode, T extends TNode, K>(source: OrderedHierarchyIterable<TNode, T>, keySelector: (element: T) => K, keyComparer?: Comparison<K> | Comparer<K>): OrderedHierarchyIterable<TNode, T>;
/**
 * Creates a subsequent [[OrderedIterable]] whose elements are also sorted in descending order by the provided key.
 *
 * @param source An [[OrderedIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param keyComparer An optional callback used to compare two keys.
 * @category Order
 */
export function thenByDescending<T, K>(source: OrderedIterable<T>, keySelector: (element: T) => K, keyComparer?: Comparison<K> | Comparer<K>): OrderedIterable<T>;
export function thenByDescending<T, K>(source: OrderedIterable<T>, keySelector: (element: T) => K, keyComparer: Comparison<K> | Comparer<K> = Comparer.defaultComparer): OrderedIterable<T> {
    if (typeof keyComparer === "function") keyComparer = Comparer.create(keyComparer);
    assert.mustBeOrderedIterable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeComparer(keyComparer, "keyComparer");
    return FlowHierarchy(ThenBy(source, keySelector, keyComparer, /*descending*/ true), source);
}

@ToStringTag("OrderByIterable")
class OrderByIterable<T, K> implements OrderedIterable<T> {
    private _source: Iterable<T>;
    private _keySelector: (element: T) => K;
    private _keyComparer: Comparer<K>;
    private _descending: boolean;
    private _parent?: OrderByIterable<T, any>;

    constructor(source: Iterable<T>, keySelector: (element: T) => K, keyComparer: Comparer<K>, descending: boolean, parent?: OrderByIterable<T, any>) {
        this._source = source;
        this._keySelector = keySelector;
        this._keyComparer = keyComparer;
        this._descending = descending;
        this._parent = parent;
    }

    *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const array = toArray<T>(source);
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

    [OrderedIterable.thenBy]<K>(keySelector: (element: T) => K, keyComparer: Comparison<K> | Comparer<K>, descending: boolean): OrderedIterable<T> {
        if (typeof keyComparer === "function") keyComparer = Comparer.create(keyComparer);
        assert.mustBeFunction(keySelector, "keySelector");
        assert.mustBeComparer(keyComparer, "keyComparer");
        assert.mustBeBoolean(descending, "descending");
        return new OrderByIterable(this._source, keySelector, keyComparer, descending, this);
    }

    private _getSorter(elements: T[], next?: (x: number, y: number) => number): (x: number, y: number) => number {
        const keySelector = this._keySelector;
        const comparer = this._keyComparer;
        const descending = this._descending;
        const parent = this._parent;
        const keys = elements.map(keySelector);
        const sorter = (x: number, y: number): number => {
            const result = comparer.compare(keys[x], keys[y]);
            if (result === 0) {
                return next ? next(x, y) : x - y;
            }
            return descending ? -result : result;
        };
        return parent ? parent._getSorter(elements, sorter) : sorter;
    }
}
