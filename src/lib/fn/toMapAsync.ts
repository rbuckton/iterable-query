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
import { PossiblyAsyncQueryable } from "../types";
import { Map } from "../collections";

/**
 * Creates a Map for the elements of the Query.
 *
 * @param source A `Queryable` object.
 * @param keySelector A callback used to select a key for each element.
 */
export function toMapAsync<T, K>(source: PossiblyAsyncQueryable<T>, keySelector: (element: T) => K, elementSelector?: (element: T) => T): Promise<Map<K, T>>;

/**
 * Creates a Map for the elements of the Query.
 *
 * @param source A `Queryable` object.
 * @param keySelector A callback used to select a key for each element.
 * @param elementSelector A callback that selects a value for each element.
 */
export function toMapAsync<T, K, V>(source: PossiblyAsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Promise<Map<K, V>>;

export async function toMapAsync<T, K>(source: PossiblyAsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => T = Identity): Promise<Map<K, T>> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    const map = new Map<K, T>();
    for await (const item of ToPossiblyAsyncIterable(source)) {
        const key = keySelector(item);
        const element = elementSelector(item);
        map.set(key, element);
    }
    return map;
}

Registry.AsyncQuery.registerScalar("toMap", toMapAsync);