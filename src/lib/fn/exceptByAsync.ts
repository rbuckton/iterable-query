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

import { assert, ToPossiblyAsyncIterable, FlowHierarchy, ToStringTag, TryAdd } from "../internal";
import { PossiblyAsyncHierarchyIterable, AsyncQueryable, AsyncHierarchyIterable, PossiblyAsyncIterable } from "../types";
import { toSetAsync } from "./toSetAsync";
import { Equaler } from '@esfx/equatable';

/**
 * Creates an [[AsyncHierarchyIterable]] for the set difference between a [[HierarchyIterable]] or an [[AsyncHierarchyIterable]] and an [[AsyncQueryable]] object, where set identity is determined by the selected key.
 *
 * @param left A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function exceptByAsync<TNode, T extends TNode, K>(left: PossiblyAsyncHierarchyIterable<TNode, T>, right: AsyncQueryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] for the set difference between two [[AsyncQueryable]] objects, where set identity is determined by the selected key.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function exceptByAsync<T, K>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): AsyncIterable<T>;
export function exceptByAsync<T, K>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<T>(right, "right");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeEqualerOrUndefined(keyEqualer, "keyEqualer");
    return FlowHierarchy(new AsyncExceptByIterable(ToPossiblyAsyncIterable(left), ToPossiblyAsyncIterable(right), keySelector, keyEqualer), left);
}

@ToStringTag("AsyncExceptByIterable")
class AsyncExceptByIterable<T, K> implements AsyncIterable<T> {
    private _left: PossiblyAsyncIterable<T>;
    private _right: PossiblyAsyncIterable<T>;
    private _keySelector: (element: T) => K;
    private _keyEqualer?: Equaler<K>;

    constructor(left: PossiblyAsyncIterable<T>, right: PossiblyAsyncIterable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>) {
        this._left = left;
        this._right = right;
        this._keySelector = keySelector;
        this._keyEqualer = keyEqualer;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const keySelector = this._keySelector;
        const set = await toSetAsync(this._right, keySelector, this._keyEqualer!);
        for await (const element of this._left) {
            if (TryAdd(set, keySelector(element))) {
                yield element;
            }
        }
    }
}