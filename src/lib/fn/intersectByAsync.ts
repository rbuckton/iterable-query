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
import { PossiblyAsyncHierarchyIterable, AsyncQueryable, AsyncHierarchyIterable, PossiblyAsyncIterable } from "../types";
import { toSetAsync } from "./toSetAsync";

/**
 * Creates a [[HierarchyIterable]] for the set intersection of a [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object and an [[AsyncQueryable]] object, where set identity is determined by the selected key.
 *
 * @param left A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @category Subquery
 */
export function intersectByAsync<TNode, T extends TNode, K>(left: PossiblyAsyncHierarchyIterable<TNode, T>, right: AsyncQueryable<T>, keySelector: (element: T) => K): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates a [[HierarchyIterable]] for the set intersection of an [[AsyncQueryable]] object and a [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object, where set identity is determined by the selected key.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @category Subquery
 */
export function intersectByAsync<TNode, T extends TNode, K>(left: AsyncQueryable<T>, right: PossiblyAsyncHierarchyIterable<TNode, T>, keySelector: (element: T) => K): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] for the set intersection of two [[AsyncQueryable]] objects, where set identity is determined by the selected key.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @category Subquery
 */
export function intersectByAsync<T, K>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, keySelector: (element: T) => K): AsyncIterable<T>;
export function intersectByAsync<T, K>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, keySelector: (element: T) => K): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<T>(right, "right");
    assert.mustBeFunction(keySelector, "keySelector");
    return FlowHierarchy(new AsyncIntersectByIterable(ToPossiblyAsyncIterable(left), ToPossiblyAsyncIterable(right), keySelector), left, right);
}

@ToStringTag("AsyncIntersectByIterable")
class AsyncIntersectByIterable<T, K> implements AsyncIterable<T> {
    private _left: PossiblyAsyncIterable<T>;
    private _right: PossiblyAsyncIterable<T>;
    private _keySelector: (element: T) => K;

    constructor(left: PossiblyAsyncIterable<T>, right: PossiblyAsyncIterable<T>, keySelector: (element: T) => K) {
        this._left = left;
        this._right = right;
        this._keySelector = keySelector;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const keySelector = this._keySelector;
        const set = await toSetAsync(this._right, keySelector);
        if (set.size <= 0) {
            return;
        }
        for await (const element of this._left) {
            if (set.delete(keySelector(element))) {
                yield element;
            }
        }
    }
}