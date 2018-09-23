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
import { PossiblyAsyncHierarchyIterable, AsyncHierarchyIterable, PossiblyAsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates a subquery containing all elements except the first elements up to the supplied
 * count.
 *
 * @param count The number of elements to skip.
 */
export function skipRightAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, count: number): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates a subquery containing all elements except the first elements up to the supplied
 * count.
 *
 * @param count The number of elements to skip.
 */
export function skipRightAsync<T>(source: PossiblyAsyncQueryable<T>, count: number): AsyncIterable<T>;

export function skipRightAsync<T>(source: PossiblyAsyncQueryable<T>, count: number): AsyncIterable<T> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    assert.mustBePositiveFiniteNumber(count, "count");
    return FlowHierarchy(new AsyncSkipRightIterable(ToPossiblyAsyncIterable(source), count), source);
}

@ToStringTag("AsyncSkipRightIterable")
class AsyncSkipRightIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _count: number;

    constructor(source: PossiblyAsyncIterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const pending: T[] = [];
        const count = this._count;
        if (count <= 0) {
            yield* this._source;
        }
        else {
            for await (const element of this._source) {
                pending.push(element);
                if (pending.length > count) {
                    yield pending.shift()!;
                }
            }
        }
    }
}

Registry.AsyncQuery.registerSubquery("skipRight", skipRightAsync);