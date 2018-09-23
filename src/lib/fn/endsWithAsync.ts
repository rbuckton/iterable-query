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

import { assert, SameValue, Registry } from "../internal";
import { PossiblyAsyncQueryable } from "../types";
import { takeRightAsync } from "./takeRightAsync";
import { toArrayAsync } from "./toArrayAsync";

/**
 * Computes a scalar value indicating whether the elements of this Query end
 * with the same sequence of elements in another Queryable.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison An optional callback used to compare the equality of two elements.
 */
export function endsWithAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>, equalityComparison?: (left: T, right: T) => boolean): Promise<boolean>;

/**
 * Computes a scalar value indicating whether the elements of this Query end
 * with the same sequence of elements in another Queryable.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison An optional callback used to compare the equality of two elements.
 */
export function endsWithAsync<T, U>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;

/**
 * Computes a scalar value indicating whether the elements of this Query end
 * with the same sequence of elements in another Queryable.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison An optional callback used to compare the equality of two elements.
 */
export async function endsWithAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>, equalityComparison: (left: T, right: T) => boolean = SameValue): Promise<boolean> {
    assert.mustBePossiblyAsyncQueryable(left, "left");
    assert.mustBePossiblyAsyncQueryable(right, "right");
    assert.mustBeFunction(equalityComparison, "equalityComparison");
    const rightArray = await toArrayAsync(right);
    const numElements = rightArray.length;
    if (numElements <= 0) {
        return true;
    }
    const leftArray = await toArrayAsync(takeRightAsync(left, numElements));
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

Registry.AsyncQuery.registerScalar("endsWith", endsWithAsync);