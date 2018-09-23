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

import { assert, SameValue, ToPossiblyAsyncIterable, Registry } from "../internal";
import { PossiblyAsyncQueryable } from "../types";
import { toArrayAsync } from "./toArrayAsync";

/**
 * Computes a scalar value indicating whether the elements of `left` include
 * an exact sequence of elements from `right`.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison A callback used to compare the equality of two elements.
 */
export function includesSequenceAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>, equalityComparison?: (left: T, right: T) => boolean): Promise<boolean>;

/**
 * Computes a scalar value indicating whether the elements of `left` include
 * an exact sequence of elements from `right`.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison A callback used to compare the equality of two elements.
 */
export function includesSequenceAsync<T, U>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;

/**
 * Computes a scalar value indicating whether the elements of `left` include
 * an exact sequence of elements from `right`.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison An optional callback used to compare the equality of two elements.
 */
export async function includesSequenceAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>, equalityComparison: (left: T, right: T) => boolean = SameValue): Promise<boolean> {
    assert.mustBePossiblyAsyncQueryable(left, "source");
    assert.mustBePossiblyAsyncQueryable(right, "other");
    assert.mustBeFunction(equalityComparison, "equalityComparison");
    const rightArray = await toArrayAsync(right);
    const numRightElements = rightArray.length;
    if (numRightElements <= 0) {
        return true;
    }
    const span: T[] = [];
    for await (const leftValue of ToPossiblyAsyncIterable(left)) {
        for (;;) {
            const rightValue = rightArray[span.length];
            if (equalityComparison(leftValue, rightValue)) {
                if (span.length + 1 >= numRightElements) {
                    return true;
                }
                span.push(leftValue);
            }
            else if (span.length > 0) {
                span.shift();
                continue;
            }
            break;
        }
    }
    return false;
}

Registry.AsyncQuery.registerScalar("includesSequence", includesSequenceAsync);