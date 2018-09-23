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

import { assert, ToPossiblyAsyncIterable, FlowHierarchy, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncHierarchyIterable, PossiblyAsyncQueryable, AsyncHierarchyIterable, PossiblyAsyncIterable } from "../types";
import { toSetAsync } from "./toSetAsync";

/**
 * Creates a subquery for the set intersection of two Queryables.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 */
export function intersectAsync<TNode, T extends TNode>(left: PossiblyAsyncHierarchyIterable<TNode, T>, right: PossiblyAsyncQueryable<T>): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates a subquery for the set intersection of two Queryables.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 */
export function intersectAsync<TNode, T extends TNode>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates a subquery for the set intersection of two Queryables.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 */
export function intersectAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>): AsyncIterable<T>;

export function intersectAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBePossiblyAsyncQueryable(left, "left");
    assert.mustBePossiblyAsyncQueryable(right, "right");
    return FlowHierarchy(new AsyncIntersectIterable(ToPossiblyAsyncIterable(left), ToPossiblyAsyncIterable(right)), left, right);
}

@ToStringTag("AsyncIntersectIterable")
class AsyncIntersectIterable<T> implements AsyncIterable<T> {
    private _left: PossiblyAsyncIterable<T>;
    private _right: PossiblyAsyncIterable<T>;

    constructor(left: PossiblyAsyncIterable<T>, right: PossiblyAsyncIterable<T>) {
        this._left = left;
        this._right = right;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const set = await toSetAsync(this._right);
        if (set.size <= 0) {
            return;
        }
        for await (const element of this._left) {
            if (set.delete(element)) {
                yield element;
            }
        }
    }
}

Registry.AsyncQuery.registerSubquery("intersect", intersectAsync);