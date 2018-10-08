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
import { AsyncQueryable, PossiblyAsyncHierarchyIterable, AsyncHierarchyIterable, PossiblyAsyncIterable } from "../types";

/**
 * Creates a subquery for the elements of the source with the provided range
 * patched into the results.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param start The offset at which to patch the range.
 * @param skipCount The number of elements to skip from start.
 * @param range The range to patch into the result.
 * @category Subquery
 */
export function patchAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, start: number, skipCount?: number, range?: AsyncQueryable<T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the elements of the source with the provided range
 * patched into the results.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param start The offset at which to patch the range.
 * @param skipCount The number of elements to skip from start.
 * @param range The range to patch into the result.
 * @category Subquery
 */
export function patchAsync<T>(source: AsyncQueryable<T>, start: number, skipCount?: number, range?: AsyncQueryable<T>): AsyncIterable<T>;
export function patchAsync<T>(source: AsyncQueryable<T>, start: number, skipCount: number = 0, range?: AsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBePositiveFiniteNumber(start, "start");
    assert.mustBePositiveFiniteNumber(skipCount, "skipCount");
    assert.mustBeAsyncQueryableOrUndefined<T>(range, "range");
    return FlowHierarchy(new AsyncPatchIterable(ToPossiblyAsyncIterable(source), start, skipCount, range && ToPossiblyAsyncIterable(range)), source);
}

@ToStringTag("AsyncPatchIterable")
class AsyncPatchIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _start: number;
    private _skipCount: number;
    private _range: PossiblyAsyncIterable<T> | undefined;

    constructor(source: PossiblyAsyncIterable<T>, start: number, skipCount: number, range: PossiblyAsyncIterable<T> | undefined) {
        this._source = source;
        this._start = start;
        this._skipCount = skipCount;
        this._range = range;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const start = this._start;
        const skipCount = this._skipCount;
        let offset = 0;
        let hasYieldedRange = false;
        for await (const value of this._source) {
            if (offset < start) {
                yield value;
                offset++;
            }
            else if (offset < start + skipCount) {
                offset++;
            }
            else {
                if (!hasYieldedRange && this._range) {
                    yield* this._range;
                    hasYieldedRange = true;
                }
                yield value;
            }
        }
        if (!hasYieldedRange && this._range) {
            yield* this._range;
        }
    }
}

Registry.AsyncQuery.registerSubquery("patch", patchAsync);