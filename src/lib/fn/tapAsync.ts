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

import { assert, ToPossiblyAsyncIterable, FlowHierarchy, ToStringTag, Registry, IsPromiseLike } from "../internal";
import { PossiblyAsyncHierarchyIterable, AsyncHierarchyIterable, AsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Lazily invokes a callback as each element of the iterable is iterated.
 *
 * @param source An `AsyncQueryable` object.
 * @param callback The callback to invoke.
 * @category Subquery
 */
export function tapAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, callback: (element: T, offset: number) => void): AsyncHierarchyIterable<TNode, T>;
/**
 * Lazily invokes a callback as each element of the iterable is iterated.
 *
 * @param source An `AsyncQueryable` object.
 * @param callback The callback to invoke.
 * @category Subquery
 */
export function tapAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, callback: (element: T, offset: number) => PromiseLike<void>): AsyncHierarchyIterable<TNode, T>;
/**
 * Lazily invokes a callback as each element of the iterable is iterated.
 *
 * @param source An `AsyncQueryable` object.
 * @param callback The callback to invoke.
 * @category Subquery
 */
export function tapAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, callback: (element: T, offset: number) => PromiseLike<void> | void): AsyncHierarchyIterable<TNode, T>;
/**
 * Lazily invokes a callback as each element of the iterable is iterated.
 *
 * @param source An `AsyncQueryable` object.
 * @param callback The callback to invoke.
 * @category Subquery
 */
export function tapAsync<T>(source: AsyncQueryable<T>, callback: (element: T, offset: number) => void): AsyncIterable<T>;
/**
 * Lazily invokes a callback as each element of the iterable is iterated.
 *
 * @param source An `AsyncQueryable` object.
 * @param callback The callback to invoke.
 * @category Subquery
 */
export function tapAsync<T>(source: AsyncQueryable<T>, callback: (element: T, offset: number) => PromiseLike<void>): AsyncIterable<T>;
/**
 * Lazily invokes a callback as each element of the iterable is iterated.
 *
 * @param source An `AsyncQueryable` object.
 * @param callback The callback to invoke.
 * @category Subquery
 */
export function tapAsync<T>(source: AsyncQueryable<T>, callback: (element: T, offset: number) => PromiseLike<void> | void): AsyncIterable<T>;
export function tapAsync<T>(source: AsyncQueryable<T>, callback: (element: T, offset: number) => PromiseLike<void> | void): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(callback, "callback");
    return FlowHierarchy(new AsyncTapterable(ToPossiblyAsyncIterable(source), callback), source);
}

@ToStringTag("AsyncTapIterable")
class AsyncTapterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _callback: (element: T, offset: number) => PromiseLike<void> | void;

    constructor(source: PossiblyAsyncIterable<T>, callback: (element: T, offset: number) => PromiseLike<void> | void) {
        this._source = source;
        this._callback = callback;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const source = this._source;
        const callback = this._callback;
        let offset = 0;
        for await (const element of source) {
            const result = callback(element, offset++);
            if (IsPromiseLike(result)) await result;
            yield element;
        }
    }
}

Registry.AsyncQuery.registerSubquery("tap", tapAsync);