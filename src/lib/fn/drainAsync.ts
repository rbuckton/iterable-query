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

/**
 * Iterates over all of the elements in an [[AsyncQueryable]], ignoring the results.
 * 
 * @param source A [[Queryable]] object.
 * @category Scalar
 */
export async function drainAsync<T>(source: AsyncQueryable<T>): Promise<void> {
    assert.mustBeAsyncQueryable(source, "source");
    for await (const _ of ToPossiblyAsyncIterable(source)) ;
}