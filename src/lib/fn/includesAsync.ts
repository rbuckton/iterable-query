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
import { EqualityComparison, Equaler } from 'equatable';

/**
 * Computes a scalar value indicating whether the provided value is included in an [[AsyncQueryable]].
 *
 * @param source An [[AsyncQueryable]] object.
 * @param value A value.
 * @param equaler An optional callback used to compare the equality of two elements.
 * @category Scalar
 */
export async function includesAsync<T>(source: AsyncQueryable<T>, value: T, equaler?: EqualityComparison<T> | Equaler<T>): Promise<boolean>;
/**
 * Computes a scalar value indicating whether the provided value is included in an [[AsyncQueryable]].
 *
 * @param source An [[AsyncQueryable]] object.
 * @param value A value.
 * @param equaler An optional callback used to compare the equality of two elements.
 * @category Scalar
 */
export async function includesAsync<T, U>(source: AsyncQueryable<T>, value: U, equaler: (left: T, right: U) => boolean): Promise<boolean>;
export async function includesAsync<T>(source: AsyncQueryable<T>, value: T, equaler: EqualityComparison<T> | Equaler<T> = Equaler.defaultEqualer): Promise<boolean> {
  if (typeof equaler === "function") equaler = Equaler.create(equaler);
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeEqualer(equaler, "equaler");
    for await (const element of ToPossiblyAsyncIterable(source)) {
        if (equaler.equals(value, element)) {
            return true;
        }
    }
    return false;
}