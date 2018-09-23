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

import { assert, FlowHierarchy, ToAsyncIterable, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncHierarchyIterable, PossiblyAsyncQueryable, AsyncHierarchyIterable } from "../types";

/**
 * Creates a subquery that concatenates two Queryables.
 *
 * @param left An `AsyncIterable` or `Queryable` value.
 * @param right An `AsyncIterable` or `Queryable` value.
 */
export function concatAsync<TNode, T extends TNode>(left: PossiblyAsyncHierarchyIterable<TNode, T>, right: PossiblyAsyncQueryable<T>): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates a subquery that concatenates two Queryables.
 *
 * @param left An `AsyncIterable` or `Queryable` value.
 * @param right An `AsyncIterable` or `Queryable` value.
 */
export function concatAsync<TNode, T extends TNode>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates a subquery that concatenates two Queryables.
 *
 * @param left An `AsyncIterable` or `Queryable` value.
 * @param right An `AsyncIterable` or `Queryable` value.
 */
export function concatAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>): AsyncIterable<T>;

export function concatAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBePossiblyAsyncQueryable(left, "left");
    assert.mustBePossiblyAsyncQueryable(right, "right");
    return FlowHierarchy(new AsyncConcatIterable(ToAsyncIterable(left), ToAsyncIterable(right)), left, right);
}

@ToStringTag("AsyncConcatIterable")
class AsyncConcatIterable<T> implements AsyncIterable<T> {
    private _left: AsyncIterable<T>;
    private _right: AsyncIterable<T>;

    constructor(left: AsyncIterable<T>, right: AsyncIterable<T>) {
        this._left = left;
        this._right = right;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        yield* this._left;
        yield* this._right;
    }
}

Registry.AsyncQuery.registerSubquery("concat", concatAsync);