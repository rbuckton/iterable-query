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

import { assert, ToIterable, FlowHierarchy, ToStringTag, TryAdd } from "../internal";
import { Queryable, HierarchyIterable } from "../types";
import { Set } from "../collections";
import { Equaler } from '@esfx/equatable';
import { HashSet } from '@esfx/collections-hashset';
import { HashMap } from '@esfx/collections-hashmap';

/**
 * Creates a subquery for the symmetric difference between two [[Queryable]] objects, where set identity is determined by the selected key.
 * The result is an [[Iterable]] containings the elements that exist in only left or right, but not 
 * in both.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function symmetricDifferenceBy<TNode, T extends TNode, K>(left: HierarchyIterable<TNode, T>, right: Queryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): HierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the symmetric difference between two [[Queryable]] objects, where set identity is determined by the selected key.
 * The result is an [[Iterable]] containings the elements that exist in only left or right, but not 
 * in both.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function symmetricDifferenceBy<TNode, T extends TNode, K>(left: Queryable<T>, right: HierarchyIterable<TNode, T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): HierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the symmetric difference between two [[Queryable]] objects, where set identity is determined by the selected key.
 * The result is an [[Iterable]] containings the elements that exist in only left or right, but not 
 * in both.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function symmetricDifferenceBy<T, K>(left: Queryable<T>, right: Queryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): Iterable<T>;
export function symmetricDifferenceBy<T, K>(left: Queryable<T>, right: Queryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): Iterable<T> {
    assert.mustBeQueryable(left, "left");
    assert.mustBeQueryable(right, "right");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeEqualerOrUndefined(keyEqualer, "keyEqualer");
    return FlowHierarchy(new SymmetricDifferenceByIterable(ToIterable(left), ToIterable(right), keySelector, keyEqualer), left, right);
}

@ToStringTag("SymmetricDifferenceByIterable")
class SymmetricDifferenceByIterable<T, K> implements Iterable<T> {
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
        const rightKeys = this._keyEqualer ? new HashSet<K>(this._keyEqualer) : new Set<K>();
        const right = this._keyEqualer ? new HashMap<K, T>(this._keyEqualer) : new Map<K, T>();
        for (const element of this._right) {
            const key = keySelector(element);
            if (TryAdd(rightKeys, key)) {
                right.set(key, element);
            }
        }
        const set = this._keyEqualer ? new HashSet<K>(this._keyEqualer) : new Set<K>();
        for (const element of this._left) {
            const key = keySelector(element);
            if (TryAdd(set, key) && !right.has(key)) {
                yield element;
            }
        }
        for (const [key, element] of right) {
            if (TryAdd(set, key)) {
                yield element;
            }
        }
    }
}