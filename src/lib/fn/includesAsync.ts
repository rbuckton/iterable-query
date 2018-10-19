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

import { assert, SameValue, ToPossiblyAsyncIterable } from "../internal";
import { AsyncQueryable } from "../types";

/**
 * Computes a scalar value indicating whether the provided value is included in an [[AsyncQueryable]].
 *
 * @param source An [[AsyncQueryable]] object.
 * @param value A value.
 * @category Scalar
 */
export async function includesAsync<T>(source: AsyncQueryable<T>, value: T): Promise<boolean>;
/**
 * Computes a scalar value indicating whether the provided value is included in an [[AsyncQueryable]].
 *
 * @param source An [[AsyncQueryable]] object.
 * @param value A value.
 * @param equalityComparison An optional callback used to compare the equality of two elements.
 * @category Scalar
 */
export async function includesAsync<T, U>(source: AsyncQueryable<T>, value: U, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;
export async function includesAsync<T>(source: AsyncQueryable<T>, value: T, equalityComparison: (left: T, right: T) => boolean = SameValue): Promise<boolean> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    for await (const element of ToPossiblyAsyncIterable(source)) {
        if (equalityComparison(value, element)) {
            return true;
        }
    }
    return false;
}