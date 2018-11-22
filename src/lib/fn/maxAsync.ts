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
import { compare, identity } from "./common";
import { maxByAsync } from './maxByAsync';

/**
 * Gets the maximum element of an [[AsyncQueryable]], optionally comparing elements using the supplied callback.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param comparison An optional callback used to compare two elements.
 * @category Scalar
 */
export async function maxAsync<T>(source: AsyncQueryable<T>, comparison: (x: T, y: T) => number = compare): Promise<T | undefined> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(comparison, "comparison");
    return maxByAsync(source, identity, comparison);
}