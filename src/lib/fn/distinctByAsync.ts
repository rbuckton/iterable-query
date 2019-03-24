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

import { assert, ToPossiblyAsyncIterable, FlowHierarchy, ToStringTag } from "../internal";
import { AsyncHierarchyIterable, PossiblyAsyncHierarchyIterable, PossiblyAsyncIterable, AsyncQueryable } from "../types";
import { Set } from "../collections";
import { Equaler } from 'equatable';
import { HashSet } from 'equatable/collections';

/**
 * Creates an [[AsyncHierarchyIterable]] for the distinct elements of `source`.
 * @category Subquery
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param keySelector A callback used to select the key to determine uniqueness.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 */
export function distinctByAsync<TNode, T extends TNode, K>(source: PossiblyAsyncHierarchyIterable<TNode, T>, keySelector: (value: T) => K, keyEqualer?: Equaler<K>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] for the distinct elements of source.
 * @category Subquery
 *
 * @param source An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key to determine uniqueness.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 */
export function distinctByAsync<T, K>(source: AsyncQueryable<T>, keySelector: (value: T) => K, keyEqualer?: Equaler<K>): AsyncIterable<T>;
export function distinctByAsync<T, K>(source: AsyncQueryable<T>, keySelector: (value: T) => K, keyEqualer?: Equaler<K>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeEqualerOrUndefined(keyEqualer, "keyEqualer");
    return FlowHierarchy(new AsyncDistinctByIterable(ToPossiblyAsyncIterable(source), keySelector, keyEqualer), source);
}

@ToStringTag("AsyncDistinctByIterable")
class AsyncDistinctByIterable<T, K> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _keySelector: (value: T) => K;
    private _keyEqualer?: Equaler<K>;

    constructor(source: PossiblyAsyncIterable<T>, keySelector: (value: T) => K, keyEqualer?: Equaler<K>) {
        this._source = source;
        this._keySelector = keySelector;
        this._keyEqualer = keyEqualer;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const set = this._keyEqualer ? new HashSet<K>(this._keyEqualer) : new Set<K>();
        const selector = this._keySelector;
        for await (const element of this._source) {
            const key = selector(element);
            if (!set.has(key)) {
                set.add(key);
                yield element;
            }
        }
    }
}