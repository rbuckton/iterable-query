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

import { assert, Identity, Registry } from "../internal";
import { AsyncQueryable } from "../types";
import { toArrayAsync } from "./toArrayAsync";

/**
 * Computes a scalar value by applying an accumulator callback over each element in reverse.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param accumulator the callback used to compute the result.
 * @category Scalar
 */
export function reduceRightAsync<T>(source: AsyncQueryable<T>, accumulator: (current: T, element: T, offset: number) => T): Promise<T>;
/**
 * Computes a scalar value by applying an accumulator callback over each element in reverse.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param accumulator the callback used to compute the result.
 * @param seed An optional seed value.
 * @category Scalar
 */
export function reduceRightAsync<T, U>(source: AsyncQueryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector?: (result: U, count: number) => U): Promise<U>;
/**
 * Computes a scalar value by applying an accumulator callback over each element in reverse.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param accumulator the callback used to compute the result.
 * @param seed An optional seed value.
 * @param resultSelector An optional callback used to compute the final result.
 * @category Scalar
 */
export function reduceRightAsync<T, U, R>(source: AsyncQueryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): Promise<R>;
export function reduceRightAsync<T>(source: AsyncQueryable<T>, accumulator: (current: T, element: T, offset: number) => T, seed?: T, resultSelector: (result: T, count: number) => T = Identity): Promise<T> {
    return reduceRightAsyncCore(source, accumulator, seed, arguments.length > 2, resultSelector);
}

async function reduceRightAsyncCore<T>(source: AsyncQueryable<T>, accumulator: (current: T, element: T, offset: number) => T, current: T | undefined, hasCurrent: boolean, resultSelector: (result: T, count: number) => T): Promise<T> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(accumulator, "accumulator");
    assert.mustBeFunction(resultSelector, "resultSelector");
    const sourceArray = await toArrayAsync(source);
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

Registry.AsyncQuery.registerScalar("reduceRight", reduceRightAsync);