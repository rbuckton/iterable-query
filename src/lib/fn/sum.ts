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

import { assert, ToIterable} from "../internal";
import { Queryable } from "../types";
import { identity } from "./common";

/**
 * Computes the sum for a series of numbers.
 *
 * @param source A [[Queryable]] object.
 * @category Scalar
 */
export function sum(source: Queryable<number>): number;
/**
 * Computes the sum for a series of numbers.
 *
 * @param source A [[Queryable]] object.
 * @param elementSelector A callback used to convert a value in `source` to a number.
 * @category Scalar
 */
export function sum<T>(source: Queryable<T>, elementSelector: (element: T) => number): number;
export function sum(source: Queryable<number>, elementSelector: (element: number) => number = identity): number {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(elementSelector, "elementSelector");
    let sum = 0;
    for (const value of ToIterable(source)) {
        const result = elementSelector(value);
        if (typeof result !== "number") throw new TypeError();
        sum += result;
    }
    return sum;
}