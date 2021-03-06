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
import { EqualityComparison, Equaler } from '@esfx/equatable';

/**
 * Computes a scalar value indicating whether the provided value is included in a [[Queryable]].
 *
 * @param source A [[Queryable]] object.
 * @param value A value.
 * @param equaler An optional callback used to compare the equality of two elements.
 * @category Scalar
 */
export function includes<T>(source: Queryable<T>, value: T, equaler?: EqualityComparison<T> | Equaler<T>): boolean;
/**
 * Computes a scalar value indicating whether the provided value is included in a [[Queryable]].
 *
 * @param source A [[Queryable]] object.
 * @param value A value.
 * @param equaler An optional callback used to compare the equality of two elements.
 * @category Scalar
 */
export function includes<T, U>(source: Queryable<T>, value: U, equaler: (left: T, right: U) => boolean): boolean;
export function includes<T>(source: Queryable<T>, value: T, equaler: EqualityComparison<T> | Equaler<T> = Equaler.defaultEqualer): boolean {
  if (typeof equaler === "function") equaler = Equaler.create(equaler);
    assert.mustBeQueryable(source, "source");
    assert.mustBeEqualer(equaler, "equaler");
    for (const element of ToIterable(source)) {
        if (equaler.equals(value, element)) {
            return true;
        }
    }
    return false;
}