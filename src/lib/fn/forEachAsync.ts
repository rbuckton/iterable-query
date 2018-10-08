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

import { assert, ToPossiblyAsyncIterable, Registry } from "../internal";
import { AsyncQueryable } from "../types";

/**
 * Invokes a callback for each element of `source`.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param callback The callback to invoke.
 * @category Scalar
 */
export async function forEachAsync<T>(source: AsyncQueryable<T>, callback: (element: T, offset: number) => void): Promise<void> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(callback, "callback");
    let offset = 0;
    for await (const element of ToPossiblyAsyncIterable(source)) {
        callback(element, offset++);
    }
}

Registry.AsyncQuery.registerScalar("forEach", forEachAsync);