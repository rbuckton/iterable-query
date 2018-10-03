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

import { assert, FlowHierarchy, ToStringTag, Registry, ToPossiblyAsyncIterable } from "../internal";
import { AsyncHierarchyIterable, AsyncQueryable, PossiblyAsyncHierarchyIterable, PossiblyAsyncIterable } from "../types";

/**
 * Creates a `AsyncIterable` that concatenates two `AsyncQueryable` sources.
 *
 * @param left An `AsyncQueryable` value.
 * @param right An `AsyncQueryable` value.
 * @category Subquery
 */
export function concatAsync<TNode, T extends TNode>(left: PossiblyAsyncHierarchyIterable<TNode, T>, right: AsyncQueryable<T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates a `AsyncIterable` that concatenates two `AsyncQueryable` sources.
 *
 * @param left An `AsyncQueryable` value.
 * @param right An `AsyncQueryable` value.
 * @category Subquery
 */
export function concatAsync<TNode, T extends TNode>(left: AsyncQueryable<T>, right: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates a `AsyncIterable` that concatenates two `AsyncQueryable` sources.
 *
 * @param left An `AsyncQueryable` value.
 * @param right An `AsyncQueryable` value.
 * @category Subquery
 */
export function concatAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>): AsyncIterable<T>;
export function concatAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<T>(right, "right");
    return FlowHierarchy(new AsyncConcatIterable(ToPossiblyAsyncIterable(left), ToPossiblyAsyncIterable(right)), left, right);
}

@ToStringTag("AsyncConcatIterable")
class AsyncConcatIterable<T> implements AsyncIterable<T> {
    private _left: PossiblyAsyncIterable<T>;
    private _right: PossiblyAsyncIterable<T>;

    constructor(left: PossiblyAsyncIterable<T>, right: PossiblyAsyncIterable<T>) {
        this._left = left;
        this._right = right;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        yield* this._left;
        yield* this._right;
    }
}

Registry.AsyncQuery.registerSubquery("concat", concatAsync);