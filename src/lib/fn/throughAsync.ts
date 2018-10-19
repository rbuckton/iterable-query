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

/**
 * Pass the entire source to the provided callback, returning an [[AsyncQueryable]] from the result.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param callback A callback function.
 * @category Subquery
 */
export function throughAsync<T, U, S extends AsyncQueryable<T> = AsyncQueryable<T>, R extends AsyncQueryable<U> = AsyncQueryable<U>>(source: S, callback: (source: S) => R): R {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(callback, "callback");
    const result = callback(source);
    assert.mustBeAsyncQueryable(result);
    return result;
}