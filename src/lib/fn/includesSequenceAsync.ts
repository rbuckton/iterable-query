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

import { assert, ToPossiblyAsyncIterable } from "../internal";
import { AsyncQueryable } from "../types";
import { toArrayAsync } from "./toArrayAsync";
import { EqualityComparison, Equaler } from '@esfx/equatable';

/**
 * Computes a scalar value indicating whether the elements of `left` include
 * an exact sequence of elements from `right`.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equaler A callback used to compare the equality of two elements.
 * @category Scalar
 */
export async function includesSequenceAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, equaler?: EqualityComparison<T> | Equaler<T>): Promise<boolean>;
/**
 * Computes a scalar value indicating whether the elements of `left` include
 * an exact sequence of elements from `right`.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equaler A callback used to compare the equality of two elements.
 * @category Scalar
 */
export async function includesSequenceAsync<T, U>(left: AsyncQueryable<T>, right: AsyncQueryable<U>, equaler: (left: T, right: U) => boolean): Promise<boolean>;
export async function includesSequenceAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, equaler: EqualityComparison<T> | Equaler<T> = Equaler.defaultEqualer): Promise<boolean> {
    if (typeof equaler === "function") equaler = Equaler.create(equaler);
    assert.mustBeAsyncQueryable<T>(left, "source");
    assert.mustBeAsyncQueryable<T>(right, "other");
    assert.mustBeEqualer(equaler, "equaler");
    const rightArray = await toArrayAsync(right);
    const numRightElements = rightArray.length;
    if (numRightElements <= 0) {
        return true;
    }
    const span: T[] = [];
    for await (const leftValue of ToPossiblyAsyncIterable(left)) {
        for (;;) {
            const rightValue = rightArray[span.length];
            if (equaler.equals(leftValue, rightValue)) {
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