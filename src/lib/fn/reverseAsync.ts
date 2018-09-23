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

import { assert, FlowHierarchy, ToStringTag, ToPossiblyAsyncIterable, Registry } from "../internal";
import { PossiblyAsyncHierarchyIterable, AsyncHierarchyIterable, PossiblyAsyncQueryable, PossiblyAsyncIterable } from "../types";
import { toArrayAsync } from "./toArrayAsync";

/**
 * Creates a subquery whose elements are in the reverse order.
 */
export function reverseAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates a subquery whose elements are in the reverse order.
 */
export function reverseAsync<T>(source: PossiblyAsyncQueryable<T>): AsyncIterable<T>;

export function reverseAsync<T>(source: PossiblyAsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    return FlowHierarchy(new AsyncReverseIterable(ToPossiblyAsyncIterable(source)), source);
}

@ToStringTag("AsyncReverseIterable")
class AsyncReverseIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;

    constructor(source: PossiblyAsyncIterable<T>) {
        this._source = source;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const list = await toArrayAsync(this._source);
        list.reverse();
        yield* list;
    }
}

Registry.AsyncQuery.registerSubquery("reverse", reverseAsync);