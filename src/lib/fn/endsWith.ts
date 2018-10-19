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

import { assert, SameValue} from "../internal";
import { Queryable } from "../types";
import { takeRight } from "./takeRight";
import { toArray } from "./toArray";

/**
 * Computes a scalar value indicating whether the elements of `left` end
 * with the same sequence of elements in `right`.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @category Scalar
 */
export function endsWith<T>(left: Queryable<T>, right: Queryable<T>): boolean;
/**
 * Computes a scalar value indicating whether the elements of `left` end
 * with the same sequence of elements in `right`.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param equalityComparison An optional callback used to compare the equality of two elements.
 * @category Scalar
 */
export function endsWith<T, U>(left: Queryable<T>, right: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;
export function endsWith<T>(left: Queryable<T>, right: Queryable<T>, equalityComparison: (left: T, right: T) => boolean = SameValue): boolean {
    assert.mustBeQueryable(left, "left");
    assert.mustBeQueryable(right, "right");
    assert.mustBeFunction(equalityComparison, "equalityComparison");
    const rightArray = toArray(right);
    const numElements = rightArray.length;
    if (numElements <= 0) {
        return true;
    }
    const leftArray = toArray(takeRight(left, numElements));
    if (leftArray.length < numElements) {
        return false;
    }
    for (let i = 0; i < numElements; i++) {
        if (!equalityComparison(leftArray[i], rightArray[i])) {
            return false;
        }
    }
    return true;
}