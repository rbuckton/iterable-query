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

import { assert, ToIterable, FlowHierarchy, ToStringTag} from "../internal";
import { Queryable, HierarchyIterable } from "../types";
import { Set } from "../collections";

/**
 * Creates a [[HierarchyIterable]] for the distinct elements of `source`.
 * @category Subquery
 * 
 * @param source A [[HierarchyIterable]] object.
 */
export function distinct<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>): HierarchyIterable<TNode, T>;
/**
 * Creates an [[Iterable]] for the distinct elements of `source`.
 * @category Subquery
 * 
 * @param source A [[Queryable]] object.
 */
export function distinct<T>(source: Queryable<T>): Iterable<T>;
export function distinct<T>(source: Queryable<T>): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    return FlowHierarchy(new DistinctIterable(ToIterable(source)), source);
}

@ToStringTag("DistinctIterable")
class DistinctIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;

    constructor(source: Iterable<T>) {
        this._source = source;
    }

    *[Symbol.iterator](): Iterator<T> {
        const set = new Set<T>();
        for (const element of this._source) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
    }
}
