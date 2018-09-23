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

import { assert, ToIterable, GetHierarchy, IsHierarchyIterable, FlowHierarchy, ToStringTag, Registry } from "../internal";
import { Queryable, HierarchyProvider, HierarchyIterable } from "../types";
import { Set } from "../collections";
import { toSet } from "./toSet";

/**
 * Creates a subquery for the symmetric difference between two `Queryable` objects.
 * The result is an `Iterable` containings the elements that exist in only left or right, but not 
 * in both.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 */
export function symmetricDifference<TNode, T extends TNode>(left: HierarchyIterable<TNode, T>, right: Queryable<T>): HierarchyIterable<TNode, T>;

/**
 * Creates a subquery for the symmetric difference between two `Queryable` objects.
 * The result is an `Iterable` containings the elements that exist in only left or right, but not 
 * in both.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 */
export function symmetricDifference<TNode, T extends TNode>(left: Queryable<T>, right: HierarchyIterable<TNode, T>): HierarchyIterable<TNode, T>;

/**
 * Creates a subquery for the symmetric difference between two `Queryable` objects.
 * The result is an `Iterable` containings the elements that exist in only left or right, but not 
 * in both.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 */
export function symmetricDifference<T>(left: Queryable<T>, right: Queryable<T>): Iterable<T>;

export function symmetricDifference<T>(left: Queryable<T>, right: Queryable<T>): Iterable<T> {
    assert.mustBeQueryable(left, "left");
    assert.mustBeQueryable(right, "right");
    return FlowHierarchy(new SymmetricDifferenceIterable(ToIterable(left), ToIterable(right)), left, right);
}

@ToStringTag("SymmetricDifferenceIterable")
class SymmetricDifferenceIterable<T> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;

    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }

    *[Symbol.iterator](): Iterator<T> {
        const right = toSet(this._right);
        const set = new Set<T>();
        for (const element of this._left) {
            if (!set.has(element) && !right.has(element)) {
                set.add(element);
            }
        }
        for (const element of right) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
    }
}

Registry.Query.registerSubquery("symmetricDifference", symmetricDifference);