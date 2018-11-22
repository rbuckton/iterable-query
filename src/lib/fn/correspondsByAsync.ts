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

import { assert, SameValueZero, GetAsyncIterator, AsyncIteratorClose, ToPossiblyAsyncIterable } from "../internal";
import { AsyncQueryable } from "../types";

/**
 * Computes a scalar value indicating whether the key for every element in `left` corresponds to a matching key
 * in `right` at the same position.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @category Scalar
 */
export async function correspondsByAsync<T, K>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, keySelector: (element: T) => K): Promise<boolean>;
/**
 * Computes a scalar value indicating whether the key for every element in `left` corresponds to a matching key
 * in `right` at the same position.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param leftKeySelector A callback used to select the key for each element in `left`.
 * @param rightKeySelector A callback used to select the key for each element in `right`.
 * @param equalityComparison An optional callback used to compare the equality of two keys.
 * @category Scalar
 */
export async function correspondsByAsync<T, U, K>(left: AsyncQueryable<T>, right: AsyncQueryable<U>, leftKeySelector: (element: T) => K, rightKeySelector: (element: U) => K, equalityComparison?: (left: K, right: K) => boolean): Promise<boolean>;
export async function correspondsByAsync<T, K>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, leftKeySelector: (element: T) => K, rightKeySelector: (element: T) => K = leftKeySelector, equalityComparison: (left: K, right: K) => boolean = SameValueZero): Promise<boolean> {
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<T>(right, "right");
    assert.mustBeFunction(equalityComparison, "equalityComparison");
    const leftIterator = GetAsyncIterator(ToPossiblyAsyncIterable(left));
    let leftDone = false;
    let leftValue: T;
    try {
        const rightIterator = GetAsyncIterator(ToPossiblyAsyncIterable(right));
        let rightDone = false;
        let rightValue: T;
        try {
            for (;;) {
                ({ done: leftDone, value: leftValue } = await leftIterator.next());
                ({ done: rightDone, value: rightValue } = await rightIterator.next());
                if (leftDone && rightDone) return true;
                if (Boolean(leftDone) !== Boolean(rightDone) || !equalityComparison(leftKeySelector(leftValue), rightKeySelector(rightValue))) return false;
            }
        }
        finally {
            if (!rightDone) await AsyncIteratorClose(rightIterator);
        }
    }
    finally {
        if (!leftDone) await AsyncIteratorClose(leftIterator);
    }
}