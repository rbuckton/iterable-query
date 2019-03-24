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
import { Queryable } from "../types";
import { takeRight } from "./takeRight";
import { toArray } from "./toArray";
import { EqualityComparison, Equaler } from 'equatable';

/**
 * Computes a scalar value indicating whether the elements of `left` end
 * with the same sequence of elements in `right`.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param equaler An optional callback used to compare the equality of two elements.
 * @category Scalar
 */
export function endsWith<T>(left: Queryable<T>, right: Queryable<T>, equaler?: EqualityComparison<T> | Equaler<T>): boolean;
/**
 * Computes a scalar value indicating whether the elements of `left` end
 * with the same sequence of elements in `right`.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param equaler An optional callback used to compare the equality of two elements.
 * @category Scalar
 */
export function endsWith<T, U>(left: Queryable<T>, right: Queryable<U>, equaler: (left: T, right: U) => boolean): boolean;
export function endsWith<T>(left: Queryable<T>, right: Queryable<T>, equaler: EqualityComparison<T> | Equaler<T> = Equaler.defaultEqualer): boolean {
    if (typeof equaler === "function") equaler = Equaler.create(equaler);
    assert.mustBeQueryable(left, "left");
    assert.mustBeQueryable(right, "right");
    assert.mustBeEqualer(equaler, "equaler");
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
        if (!equaler.equals(leftArray[i], rightArray[i])) {
            return false;
        }
    }
    return true;
}