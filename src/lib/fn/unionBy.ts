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

import { assert, ToIterable, FlowHierarchy, ToStringTag, TryAdd} from "../internal";
import { Queryable, HierarchyIterable } from "../types";
import { Set } from "../collections";

/**
 * Creates a subquery for the set union of two [[Queryable]] objects, where set identity is determined by the selected key.
 *
 * @param left A [[Queryable]] value.
 * @param right A [[Queryable]] value.
 * @param keySelector A callback used to select the key for each element.
 * @category Subquery
 */
export function unionBy<TNode, T extends TNode, K>(left: HierarchyIterable<TNode, T>, right: Queryable<T>, keySelector: (element: T) => K): HierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the set union of two [[Queryable]] objects, where set identity is determined by the selected key.
 *
 * @param left A [[Queryable]] value.
 * @param right A [[Queryable]] value.
 * @param keySelector A callback used to select the key for each element.
 * @category Subquery
 */
export function unionBy<TNode, T extends TNode, K>(left: Queryable<T>, right: HierarchyIterable<TNode, T>, keySelector: (element: T) => K): HierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the set union of two [[Queryable]] objects, where set identity is determined by the selected key.
 *
 * @param left A [[Queryable]] value.
 * @param right A [[Queryable]] value.
 * @param keySelector A callback used to select the key for each element.
 * @category Subquery
 */
export function unionBy<T, K>(left: Queryable<T>, right: Queryable<T>, keySelector: (element: T) => K): Iterable<T>;
export function unionBy<T, K>(left: Queryable<T>, right: Queryable<T>, keySelector: (element: T) => K): Iterable<T> {
    assert.mustBeQueryable(left, "left");
    assert.mustBeQueryable(right, "right");
    assert.mustBeFunction(keySelector, "keySelector");
    return FlowHierarchy(new UnionByIterable(ToIterable(left), ToIterable(right), keySelector), left, right);
}

@ToStringTag("UnionByIterable")
class UnionByIterable<T, K> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;
    private _keySelector: (element: T) => K;

    constructor(left: Iterable<T>, right: Iterable<T>, keySelector: (element: T) => K) {
        this._left = left;
        this._right = right;
        this._keySelector = keySelector;
    }

    *[Symbol.iterator](): Iterator<T> {
        const keySelector = this._keySelector;
        const set = new Set<K>();
        for (const element of this._left) {
            if (TryAdd(set, keySelector(element))) {
                yield element;
            }
        }
        for (const element of this._right) {
            if (TryAdd(set, keySelector(element))) {
                yield element;
            }
        }
    }
}
