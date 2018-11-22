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

import { assert, SameValue } from "../internal";
import { AsyncQueryable } from "../types";
import { correspondsByAsync } from './correspondsByAsync';
import { identity } from './common';

/**
 * Computes a scalar value indicating whether every element in `left` corresponds to a matching element
 * in `right` at the same position.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @category Scalar
 */
export async function correspondsAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>): Promise<boolean>;
/**
 * Computes a scalar value indicating whether every element in `left` corresponds to a matching element
 * in `right` at the same position.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equalityComparison An optional callback used to compare the equality of two elements.
 * @category Scalar
 */
export async function correspondsAsync<T, U>(left: AsyncQueryable<T>, right: AsyncQueryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;
export async function correspondsAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, equalityComparison: (left: T, right: T) => boolean = SameValue): Promise<boolean> {
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<T>(right, "right");
    assert.mustBeFunction(equalityComparison, "equalityComparison");
    return await correspondsByAsync(left, right, identity, identity, equalityComparison);
}