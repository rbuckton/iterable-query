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
import { identity } from "./common";

/**
 * Creates a [[HierarchyIterable]] for the distinct elements of `source`.
 * @category Subquery
 *
 * @param source A [[HierarchyIterable]] object.
 */
export function distinct<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>): HierarchyIterable<TNode, T>;
/**
 * Creates a [[HierarchyIterable]] for the distinct elements of `source`.
 * @category Subquery
 *
 * @param source A [[HierarchyIterable]] object.
 * @param keySelector A callback used to select the key to determine uniqueness.
 */
export function distinct<TNode, T extends TNode, K>(source: HierarchyIterable<TNode, T>, keySelector: (value: T) => K): HierarchyIterable<TNode, T>;
/**
 * Creates an [[Iterable]] for the distinct elements of `source`.
 * @category Subquery
 *
 * @param source A [[Queryable]] object.
 */
export function distinct<T>(source: Queryable<T>): Iterable<T>;
/**
 * Creates an [[Iterable]] for the distinct elements of `source`.
 * @category Subquery
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to select the key to determine uniqueness.
 */
export function distinct<T, K>(source: Queryable<T>, keySelector: (value: T) => K): Iterable<T>;
export function distinct<T>(source: Queryable<T>, keySelector: (value: T) => T = identity): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    return FlowHierarchy(new DistinctIterable(ToIterable(source), keySelector), source);
}

@ToStringTag("DistinctIterable")
class DistinctIterable<T, K> implements Iterable<T> {
    private _source: Iterable<T>;
    private _keySelector: (value: T) => K;

    constructor(source: Iterable<T>, keySelector: (value: T) => K) {
        this._source = source;
        this._keySelector = keySelector;
    }

    *[Symbol.iterator](): Iterator<T> {
        const set = new Set<K>();
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
