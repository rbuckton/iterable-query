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

import { assert, Identity, Registry } from "../internal";
import { Queryable } from "../types";
import { toArray } from "./toArray";

/**
 * Computes a scalar value by applying an accumulator callback over each element in reverse.
 *
 * @param source A `Queryable` object.
 * @param accumulator the callback used to compute the result.
 */
export function reduceRight<T>(source: Queryable<T>, accumulator: (current: T, element: T, offset: number) => T): T;

/**
 * Computes a scalar value by applying an accumulator callback over each element in reverse.
 *
 * @param source A `Queryable` object.
 * @param accumulator the callback used to compute the result.
 * @param seed An optional seed value.
 */
export function reduceRight<T, U>(source: Queryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector?: (result: U, count: number) => U): U;

/**
 * Computes a scalar value by applying an accumulator callback over each element in reverse.
 *
 * @param source A `Queryable` object.
 * @param accumulator the callback used to compute the result.
 * @param seed An optional seed value.
 * @param resultSelector An optional callback used to compute the final result.
 */
export function reduceRight<T, U, R>(source: Queryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): R;

/**
 * Computes a scalar value by applying an accumulator callback over each element in reverse.
 *
 * @param source A `Queryable` object.
 * @param accumulator the callback used to compute the result.
 * @param seed An optional seed value.
 * @param resultSelector An optional callback used to compute the final result.
 */
export function reduceRight<T>(source: Queryable<T>, accumulator: (current: T, element: T, offset: number) => T, seed?: T, resultSelector: (result: T, count: number) => T = Identity): T {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(accumulator, "accumulator");
    assert.mustBeFunction(resultSelector, "resultSelector");
    const sourceArray = toArray<T>(source);
    let hasCurrent = arguments.length > 2;
    let current = seed;
    let count = 0;
    for (let offset = sourceArray.length - 1; offset >= 0; offset--) {
        const value = sourceArray[offset];
        if (!hasCurrent) {
            current = value;
            hasCurrent = true;
        }
        else {
            current = accumulator(current!, value, offset);
        }
        count++;
    }
    return resultSelector(current!, count);
}

Registry.Query.registerScalar("reduceRight", reduceRight);