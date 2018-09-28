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

import { assert, Identity, ToPossiblyAsyncIterable, Registry } from "../internal";
import { AsyncQueryable } from "../types";
import { Set } from "../collections";

/**
 * Creates a Set for the elements of the Query.
 * 
 * @param source An `AsyncQueryable` object.
 */
export function toSetAsync<T>(source: AsyncQueryable<T>): Promise<Set<T>>;
/**
 * Creates a Set for the elements of the Query.
 * 
 * @param source An `AsyncQueryable` object.
 * @param elementSelector A callback that selects a value for each element.
 */
export function toSetAsync<T, V>(source: AsyncQueryable<T>, elementSelector: (element: T) => V): Promise<Set<V>>;
export async function toSetAsync<T>(source: AsyncQueryable<T>, elementSelector: (element: T) => T = Identity): Promise<Set<T>> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(elementSelector, "elementSelector");
    const set = new Set<T>();
    for await (const item of ToPossiblyAsyncIterable(source)) {
        const element = elementSelector(item);
        set.add(element);
    }
    return set;
}

Registry.AsyncQuery.registerScalar("toSet", toSetAsync);