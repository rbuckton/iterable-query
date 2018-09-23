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

import { assert, ToPossiblyAsyncIterable, FlowHierarchy, ToStringTag, Registry } from "../internal";
import { AsyncHierarchyIterable, PossiblyAsyncHierarchyIterable, PossiblyAsyncQueryable, PossiblyAsyncIterable } from "../types";
import { Set } from "../collections";


/**
 * Creates a subquery for the distinct elements of the source.
 */
export function distinctAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates a subquery for the distinct elements of the source.
 */
export function distinctAsync<T>(source: PossiblyAsyncQueryable<T>): AsyncIterable<T>;

export function distinctAsync<T>(source: PossiblyAsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    return FlowHierarchy(new AsyncDistinctIterable(ToPossiblyAsyncIterable(source)), source);
}

@ToStringTag("AsyncDistinctIterable")
class AsyncDistinctIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;

    constructor(source: PossiblyAsyncIterable<T>) {
        this._source = source;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const set = new Set<T>();
        for await (const element of this._source) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
    }
}

Registry.AsyncQuery.registerSubquery("distinct", distinctAsync);