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

import { assert, ToPossiblyAsyncIterable, FlowHierarchy, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncHierarchyIterable, AsyncHierarchyIterable, AsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates a subquery containing the last elements up to the supplied
 * count.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param count The number of elements to take.
 * @category Subquery
 */
export function takeRightAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, count: number): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates a subquery containing the last elements up to the supplied
 * count.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param count The number of elements to take.
 * @category Subquery
 */
export function takeRightAsync<T>(source: AsyncQueryable<T>, count: number): AsyncIterable<T>;
export function takeRightAsync<T>(source: AsyncQueryable<T>, count: number): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBePositiveFiniteNumber(count, "count");
    return FlowHierarchy(new AsyncTakeRightIterable(ToPossiblyAsyncIterable(source), count), source);
}

@ToStringTag("AsyncTakeRightIterable")
class AsyncTakeRightIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _count: number;

    constructor(source: PossiblyAsyncIterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const count = this._count;
        if (count <= 0) {
            return;
        }
        else {
            const pending: T[] = [];
            for await (const element of this._source) {
                pending.push(element);
                if (pending.length > count) {
                    pending.shift();
                }
            }
            yield* pending;
        }
    }
}

Registry.AsyncQuery.registerSubquery("takeRight", takeRightAsync);