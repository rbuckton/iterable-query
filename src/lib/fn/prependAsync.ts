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
import { AsyncHierarchyIterable, PossiblyAsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates a subquery for the elements of the source with the provided value prepended to the beginning.
 *
 * @param value The value to prepend.
 */
export function prependAsync<TNode, T extends TNode>(source: AsyncHierarchyIterable<TNode, T>, value: T): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates a subquery for the elements of the source with the provided value prepended to the beginning.
 *
 * @param value The value to prepend.
 */
export function prependAsync<T>(source: PossiblyAsyncQueryable<T>, value: T): AsyncIterable<T>;

export function prependAsync<T>(source: PossiblyAsyncQueryable<T>, value: T): AsyncIterable<T> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    return FlowHierarchy(new AsyncPrependIterable(value, ToPossiblyAsyncIterable(source)), source);
}

@ToStringTag("AsyncPrependIterable")
class AsyncPrependIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _value: T;

    constructor(value: T, source: PossiblyAsyncIterable<T>) {
        this._value = value;
        this._source = source;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        yield this._value;
        yield* this._source;
    }
}

Registry.AsyncQuery.registerSubquery("prepend", prependAsync);