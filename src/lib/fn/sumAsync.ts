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

import { assert, Identity, ToPossiblyAsyncIterable } from "../internal";
import { AsyncQueryable } from "../types";

/**
 * Computes the sum for a series of numbers.
 * NOTE: If any element is not a `number`, this overload will throw.
 *
 * @param source An [[AsyncQueryable]] object.
 * @category Scalar
 */
export async function sumAsync(source: AsyncQueryable<number>): Promise<number>;
/**
 * Computes the sum for a series of numbers.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param elementSelector A callback used to convert a value in `source` to a number.
 * @category Scalar
 */
export async function sumAsync<T>(source: AsyncQueryable<T>, elementSelector: (element: T) => number | PromiseLike<number>): Promise<number>;
export async function sumAsync(source: AsyncQueryable<number>, elementSelector: (element: number) => number | PromiseLike<number> = Identity): Promise<number> {
    assert.mustBeAsyncQueryable<number>(source, "source");
    assert.mustBeFunction(elementSelector, "elementSelector");
    let sum = 0;
    for await (const element of ToPossiblyAsyncIterable(source)) {
        const value = elementSelector(element);
        const result = typeof value === "number" ? value : await value;
        assert.mustBeNumber(result);
        sum += result;
    }
    return sum;
}