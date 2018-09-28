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

import { assert, FlowHierarchy, ToPossiblyAsyncIterable, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncHierarchyIterable, AsyncQueryable, AsyncHierarchyIterable, PossiblyAsyncIterable } from "../types";
import { Set } from "../collections";
import { toSetAsync } from "./toSetAsync";

/**
 * Creates a subquery for the symmetric difference between two `Queryable` objects.
 * The result is an `AsyncIterable` containings the elements that exist in only left or right, but not 
 * in both.
 *
 * @param left An `AsyncQueryable` object.
 * @param right An `AsyncQueryable` object.
 */
export function symmetricDifferenceAsync<TNode, T extends TNode>(left: PossiblyAsyncHierarchyIterable<TNode, T>, right: AsyncQueryable<T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the symmetric difference between two `Queryable` objects.
 * The result is an `AsyncIterable` containings the elements that exist in only left or right, but not 
 * in both.
 *
 * @param left An `AsyncQueryable` object.
 * @param right An `AsyncQueryable` object.
 */
export function symmetricDifferenceAsync<TNode, T extends TNode>(left: AsyncQueryable<T>, right: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the symmetric difference between two `Queryable` objects.
 * The result is an `AsyncIterable` containings the elements that exist in only left or right, but not 
 * in both.
 *
 * @param left An `AsyncQueryable` object.
 * @param right An `AsyncQueryable` object.
 */
export function symmetricDifferenceAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>): AsyncIterable<T>;
export function symmetricDifferenceAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<T>(right, "right");
    return FlowHierarchy(new AsyncSymmetricDifferenceIterable(ToPossiblyAsyncIterable(left), ToPossiblyAsyncIterable(right)), left, right);
}

@ToStringTag("AsyncSymmetricDifferenceIterable")
class AsyncSymmetricDifferenceIterable<T> implements AsyncIterable<T> {
    private _left: PossiblyAsyncIterable<T>;
    private _right: PossiblyAsyncIterable<T>;

    constructor(left: PossiblyAsyncIterable<T>, right: PossiblyAsyncIterable<T>) {
        this._left = left;
        this._right = right;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const right = await toSetAsync(this._right);
        const set = new Set<T>();
        for await (const element of this._left) {
            if (!set.has(element) && !right.has(element)) {
                set.add(element);
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

Registry.AsyncQuery.registerSubquery("symmetricDifference", symmetricDifferenceAsync);