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

import { assert, FlowHierarchy, ToStringTag, ToAsyncIterable, Registry } from "../internal";
import { AsyncHierarchyIterable, PossiblyAsyncQueryable, PossiblyAsyncHierarchyIterable } from "../types";

/**
 * Creates a `AsyncHierarchyIterable` for the elements of `source` with the provided `value` appended to the
 * end.
 *
 * @param source An `AsyncHierarchyIterable` or `HierarchyIterable` value.
 * @param value The value to append.
 */
export function appendAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, value: PromiseLike<T> | T): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates an `AsyncIterable` for the elements of `source` with the provided `value` appended to the
 * end.
 *
 * @param source An `AsyncIterable` or `Queryable` value.
 * @param value The value to append.
 */
export function appendAsync<T>(source: PossiblyAsyncQueryable<T>, value: PromiseLike<T> | T): AsyncIterable<T>;

export function appendAsync<T>(source: PossiblyAsyncQueryable<T>, value: PromiseLike<T> | T): AsyncIterable<T> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    return FlowHierarchy(new AsyncAppendIterable(ToAsyncIterable(source), value), source);
}

@ToStringTag("AsyncAppendIterable")
class AsyncAppendIterable<T> implements AsyncIterable<T> {
    private _source: AsyncIterable<T>;
    private _value: PromiseLike<T> | T;

    constructor(source: AsyncIterable<T>, value: PromiseLike<T> | T) {
        this._source = source;
        this._value = value;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        yield* this._source;
        yield this._value;
    }
}

Registry.AsyncQuery.registerSubquery("append", appendAsync);
