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
 * Creates a subquery containing all elements except the first elements up to the supplied
 * count.
 *
 * @param count The number of elements to skip.
 */
export function skip<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, count: number): HierarchyIterable<TNode, T>;

/**
 * Creates a subquery containing all elements except the first elements up to the supplied
 * count.
 *
 * @param count The number of elements to skip.
 */
export function skip<T>(source: Queryable<T>, count: number): Iterable<T>;

export function skip<T>(source: Queryable<T>, count: number): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    assert.mustBePositiveFiniteNumber(count, "count");
    return FlowHierarchy(new SkipIterable(ToIterable(source), count), source);
}

@ToStringTag("SkipIterable")
class SkipIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _count: number;

    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    *[Symbol.iterator](): Iterator<T> {
        let remaining = this._count;
        if (remaining <= 0) {
            yield* this._source;
        }
        else {
            for (const element of this._source) {
                if (remaining > 0) {
                    remaining--;
                }
                else {
                    yield element;
                }
            }
        }
    }
}

Registry.Query.registerSubquery("skip", skip);