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

import { assert, ToIterable } from "../internal";
import { Queryable } from "../types";
import { toArray } from "./toArray";
import { EqualityComparison, Equaler } from '@esfx/equatable';

/**
 * Computes a scalar value indicating whether the elements of `left` include
 * an exact sequence of elements from `right`.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param equaler A callback used to compare the equality of two elements.
 * @category Scalar
 */
export function includesSequence<T>(left: Queryable<T>, right: Queryable<T>, equaler?: EqualityComparison<T> | Equaler<T>): boolean;
/**
 * Computes a scalar value indicating whether the elements of `left` include
 * an exact sequence of elements from `right`.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param equaler A callback used to compare the equality of two elements.
 * @category Scalar
 */
export function includesSequence<T, U>(left: Queryable<T>, right: Queryable<U>, equaler: (left: T, right: U) => boolean): boolean;
export function includesSequence<T>(left: Queryable<T>, right: Queryable<T>, equaler: EqualityComparison<T> | Equaler<T> = Equaler.defaultEqualer): boolean {
    if (typeof equaler === "function") equaler = Equaler.create(equaler);
    assert.mustBeQueryable(left, "source");
    assert.mustBeQueryable(right, "other");
    assert.mustBeEqualer(equaler, "equaler");
    const rightArray = toArray(right);
    const numRightElements = rightArray.length;
    if (numRightElements <= 0) {
        return true;
    }
    const span: T[] = [];
    for (const leftValue of ToIterable(left)) {
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