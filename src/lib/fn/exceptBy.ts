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
import { toSet } from "./toSet";
import { Equaler } from '@esfx/equatable';

/**
 * Creates a [[HierarchyIterable]] for the set difference between a [[HierarchyIterable]] and a [[Queryable]] object, where set identity is determined by the selected key.
 *
 * @param left A [[HierarchyIterable]] object.
 * @param right A [[Queryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function exceptBy<TNode, T extends TNode, K>(left: HierarchyIterable<TNode, T>, right: Queryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): HierarchyIterable<TNode, T>;
/**
 * Creates an [[Iterable]] for the set difference between two [[Queryable]] objects, where set identity is determined by the selected key.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function exceptBy<T, K>(left: Queryable<T>, right: Queryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): Iterable<T>;
export function exceptBy<T, K>(left: Queryable<T>, right: Queryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): Iterable<T> {
    assert.mustBeQueryable(left, "left");
    assert.mustBeQueryable(right, "right");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeEqualerOrUndefined(keyEqualer, "keyEqualer");
    return FlowHierarchy(new ExceptByIterable(ToIterable(left), ToIterable(right), keySelector, keyEqualer), left);
}

@ToStringTag("ExceptByIterable")
class ExceptByIterable<T, K> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;
    private _keySelector: (element: T) => K;
    private _keyEqualer?: Equaler<K>;

    constructor(left: Iterable<T>, right: Iterable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>) {
        this._left = left;
        this._right = right;
        this._keySelector = keySelector;
        this._keyEqualer = keyEqualer;
    }

    *[Symbol.iterator](): Iterator<T> {
        const keySelector = this._keySelector;
        const set = toSet(this._right, keySelector, this._keyEqualer!);
        for (const element of this._left) {
            if (TryAdd(set, keySelector(element))) {
                yield element;
            }
        }
    }
}
