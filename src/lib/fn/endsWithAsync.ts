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

import { assert } from "../internal";
import { AsyncQueryable } from "../types";
import { takeRightAsync } from "./takeRightAsync";
import { toArrayAsync } from "./toArrayAsync";
import { EqualityComparison, Equaler } from '@esfx/equatable';

/**
 * Computes a scalar value indicating whether the elements of `left` end
 * with the same sequence of elements in `right`.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equaler An optional callback used to compare the equality of two elements.
 * @category Scalar
 */
export async function endsWithAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, equaler?: EqualityComparison<T> | Equaler<T>): Promise<boolean>;
/**
 * Computes a scalar value indicating whether the elements of `left` end
 * with the same sequence of elements in `right`.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equaler An optional callback used to compare the equality of two elements.
 * @category Scalar
 */
export async function endsWithAsync<T, U>(left: AsyncQueryable<T>, right: AsyncQueryable<U>, equaler: (left: T, right: U) => boolean): Promise<boolean>;
export async function endsWithAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, equaler: EqualityComparison<T> | Equaler<T> = Equaler.defaultEqualer): Promise<boolean> {
    if (typeof equaler === "function") equaler = Equaler.create(equaler);
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<T>(right, "right");
    assert.mustBeEqualer(equaler, "equaler");
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
        if (!equaler.equals(leftArray[i], rightArray[i])) {
            return false;
        }
    }
    return true;
}