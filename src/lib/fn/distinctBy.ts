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

import { assert, ToIterable, FlowHierarchy, ToStringTag } from "../internal";
import { Queryable, HierarchyIterable } from "../types";
import { Set } from "../collections";
import { Equaler } from 'equatable';
import { HashSet } from 'equatable/collections';

/**
 * Creates a [[HierarchyIterable]] for the distinct elements of `source`.
 * @category Subquery
 *
 * @param source A [[HierarchyIterable]] object.
 * @param keySelector A callback used to select the key to determine uniqueness.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 */
export function distinctBy<TNode, T extends TNode, K>(source: HierarchyIterable<TNode, T>, keySelector: (value: T) => K, keyEqualer?: Equaler<K>): HierarchyIterable<TNode, T>;
/**
 * Creates an [[Iterable]] for the distinct elements of `source`.
 * @category Subquery
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to select the key to determine uniqueness.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 */
export function distinctBy<T, K>(source: Queryable<T>, keySelector: (value: T) => K, keyEqualer?: Equaler<K>): Iterable<T>;
export function distinctBy<T, K>(source: Queryable<T>, keySelector: (value: T) => K, keyEqualer?: Equaler<K>): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeEqualerOrUndefined(keyEqualer, "keyEqualer");
    return FlowHierarchy(new DistinctByIterable(ToIterable(source), keySelector, keyEqualer), source);
}

@ToStringTag("DistinctByIterable")
class DistinctByIterable<T, K> implements Iterable<T> {
    private _source: Iterable<T>;
    private _keySelector: (value: T) => K;
    private _keyEqualer?: Equaler<K>;

    constructor(source: Iterable<T>, keySelector: (value: T) => K, keyEqualer?: Equaler<K>) {
        this._source = source;
        this._keySelector = keySelector;
        this._keyEqualer = keyEqualer;
    }

    *[Symbol.iterator](): Iterator<T> {
        const set = this._keyEqualer ? new HashSet<K>(this._keyEqualer) : new Set<K>();
        const keySelector = this._keySelector;
        for (const element of this._source) {
            const key = keySelector(element);
            if (!set.has(key)) {
                set.add(key);
                yield element;
            }
        }
    }
}
