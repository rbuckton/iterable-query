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

import { assert, Registry, ToPossiblyAsyncIterable } from "../internal";
import { AsyncQueryable } from "../types";

/**
 * Computes the average for a series of numbers.
 * 
 * @param source An `AsyncQueryable` object.
 */
export async function averageAsync(source: AsyncQueryable<number>): Promise<number>;
/**
 * Computes the average for a series of numbers.
 * 
 * @param source An `AsyncQueryable` object.
 * @param elementSelector A callback used to convert a value in `source` to a number.
 */
export async function averageAsync<T>(source: AsyncQueryable<T>, elementSelector: (element: T) => number): Promise<number>;
export async function averageAsync<T>(source: AsyncQueryable<T>, elementSelector: (element: T) => number = Number): Promise<number> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunctionOrUndefined(elementSelector, "elementSelector");
    let sum = 0;
    let count = 0;
    for await (const value of ToPossiblyAsyncIterable(source)) {
        const result = elementSelector(value);
        if (typeof result !== "number") throw new TypeError();
        sum += result;
        count++;
    }
    return count > 0 ? sum / count : 0;
}

Registry.AsyncQuery.registerScalar("average", averageAsync);