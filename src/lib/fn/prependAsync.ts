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

import { assert, FlowHierarchy, ToStringTag, Registry, ToPossiblyAsyncIterable } from "../internal";
import { AsyncHierarchyIterable, PossiblyAsyncHierarchyIterable, AsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates an `AsyncIterable` for the elements of `source` with the provided `value` prepended to the
 * beginning.
 *
 * @param source An `AsyncQueryable` value.
 * @param value The value to prepend.
 */
export function prependAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, value: T): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an `AsyncIterable` for the elements of `source` with the provided `value` prepended to the
 * beginning.
 *
 * @param source An `AsyncQueryable` value.
 * @param value The value to prepend.
 */
export function prependAsync<T>(source: AsyncQueryable<T>, value: PromiseLike<T> | T): AsyncIterable<T>;
export function prependAsync<T>(source: AsyncQueryable<T>, value: PromiseLike<T> | T): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    return FlowHierarchy(new AsyncPrependIterable(value, ToPossiblyAsyncIterable(source)), source);
}

@ToStringTag("AsyncPrependIterable")
class AsyncPrependIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _value: PromiseLike<T> | T;

    constructor(value: PromiseLike<T> | T, source: PossiblyAsyncIterable<T>) {
        this._value = value;
        this._source = source;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        yield this._value;
        yield* this._source;
    }
}

Registry.AsyncQuery.registerSubquery("prepend", prependAsync);