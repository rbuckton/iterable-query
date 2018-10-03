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

import { assert, ToIterable, FlowHierarchy, ToStringTag, Registry } from "../internal";
import { Queryable, HierarchyIterable } from "../types";
import { toSet } from "./toSet";

/**
 * Creates a subquery for the set difference between two `Queryable` objects.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @category Subquery
 */
export function except<TNode, T extends TNode>(left: HierarchyIterable<TNode, T>, right: Queryable<T>): HierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the set difference between two `Queryable` objects.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @category Subquery
 */
export function except<T>(left: Queryable<T>, right: Queryable<T>): Iterable<T>;
export function except<T>(left: Queryable<T>, right: Queryable<T>): Iterable<T> {
    assert.mustBeQueryable(left, "left");
    assert.mustBeQueryable(right, "right");
    return FlowHierarchy(new ExceptIterable(ToIterable(left), ToIterable(right)), left);
}

@ToStringTag("ExceptIterable")
class ExceptIterable<T> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;

    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }

    *[Symbol.iterator](): Iterator<T> {
        const set = toSet(this._right);
        for (const element of this._left) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
    }
}

Registry.Query.registerSubquery("except", except);