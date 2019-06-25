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

import { assert, ToIterable } from "../internal";
import { Queryable } from "../types";
import { Comparison, Comparer } from '@esfx/equatable';

/**
 * Gets the minimum element of a [[Queryable]], optionally comparing the keys of each element using the supplied callback.
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to choose the key to compare.
 * @param keyComparer An optional callback used to compare the keys.
 * @category Scalar
 */
export function minBy<T, K>(source: Queryable<T>, keySelector: (value: T) => K, keyComparer: Comparison<K> | Comparer<K> = Comparer.defaultComparer): T | undefined {
    if (typeof keyComparer === "function") keyComparer = Comparer.create(keyComparer);
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeComparer(keyComparer, "keyComparer");
    let hasResult = false;
    let result: T | undefined;
    let resultKey: K | undefined;
    for (const element of ToIterable(source)) {
        const key = keySelector(element);
        if (!hasResult) {
            result = element;
            resultKey = key;
            hasResult = true;
        }
        else if (keyComparer.compare(key, resultKey!) < 0) {
            result = element;
            resultKey = key;
        }
    }
    return result;
}