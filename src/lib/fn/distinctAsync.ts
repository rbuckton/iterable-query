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

import { assert, ToPossiblyAsyncIterable, FlowHierarchy, ToStringTag } from "../internal";
import { AsyncHierarchyIterable, PossiblyAsyncHierarchyIterable, PossiblyAsyncIterable, AsyncQueryable } from "../types";
import { Set } from "../collections";

/**
 * Creates an [[AsyncHierarchyIterable]] for the distinct elements of `source`.
 * @category Subquery
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 */
export function distinctAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] for the distinct elements of source.
 * @category Subquery
 *
 * @param source An [[AsyncQueryable]] object.
 */
export function distinctAsync<T>(source: AsyncQueryable<T>): AsyncIterable<T>;
export function distinctAsync<T>(source: AsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable(source, "source");
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