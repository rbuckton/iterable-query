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

import { assert, Identity, ToPossiblyAsyncIterable, Registry } from "../internal";
import { AsyncQueryable } from "../types";

/**
 * Creates an Array for the elements of the [[AsyncIterable]].
 * 
 * @param source An [[AsyncQueryable]] object.
 * @category Scalar
 */
export async function toArrayAsync<T>(source: AsyncQueryable<T>): Promise<T[]>;
/**
 * Creates an Array for the elements of the [[AsyncIterable]].
 * 
 * @param source An [[AsyncQueryable]] object.
 * @param elementSelector A callback that selects a value for each element.
 * @category Scalar
 */
export async function toArrayAsync<T, V>(source: AsyncQueryable<T>, elementSelector: (element: T) => V): Promise<V[]>;
export async function toArrayAsync<T>(source: AsyncQueryable<T>, elementSelector: (element: T) => T = Identity): Promise<T[]> {
    assert.mustBeAsyncQueryable(source, "source");
    assert.mustBeFunction(elementSelector, "elementSelector");
    const result: T[] = [];
    for await (const item of ToPossiblyAsyncIterable(source)) {
        result.push(elementSelector(item));
    }
    return result;
}

Registry.AsyncQuery.registerScalar("toArray", toArrayAsync);