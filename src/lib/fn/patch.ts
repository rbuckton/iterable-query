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

import { assert, ToIterable, FlowHierarchy, ToStringTag, Registry } from "../internal";
import { Queryable, HierarchyIterable } from "../types";

/**
 * Creates a subquery for the elements of the source with the provided range
 * patched into the results.
 *
 * @param start The offset at which to patch the range.
 * @param skipCount The number of elements to skip from start.
 * @param range The range to patch into the result.
 */
export function patch<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, start: number, skipCount?: number, range?: Queryable<T>): HierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the elements of the source with the provided range
 * patched into the results.
 *
 * @param start The offset at which to patch the range.
 * @param skipCount The number of elements to skip from start.
 * @param range The range to patch into the result.
 */
export function patch<T>(source: Queryable<T>, start: number, skipCount?: number, range?: Queryable<T>): Iterable<T>;
export function patch<T>(source: Queryable<T>, start: number, skipCount: number = 0, range?: Queryable<T>): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    assert.mustBePositiveFiniteNumber(start, "start");
    assert.mustBePositiveFiniteNumber(skipCount, "skipCount");
    assert.mustBeQueryableOrUndefined(range, "range");
    return FlowHierarchy(new PatchIterable(ToIterable(source), start, skipCount, range && ToIterable(range)), source);
}

@ToStringTag("PatchIterable")
class PatchIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _start: number;
    private _skipCount: number;
    private _range: Iterable<T> | undefined;

    constructor(source: Iterable<T>, start: number, skipCount: number, range: Iterable<T> | undefined) {
        this._source = source;
        this._start = start;
        this._skipCount = skipCount;
        this._range = range;
    }

    *[Symbol.iterator](): Iterator<T> {
        const start = this._start;
        const skipCount = this._skipCount;
        let offset = 0;
        let hasYieldedRange = false;
        for (const value of this._source) {
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

Registry.Query.registerSubquery("patch", patch);