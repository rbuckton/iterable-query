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
 * Creates an Object for the elements of `source`.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param prototype The prototype for the object.
 * @param keySelector A callback used to select a key for each element.
 * @category Scalar
 */
export async function toObjectAsync<T>(source: AsyncQueryable<T>, prototype: object | null, keySelector: (element: T) => PropertyKey): Promise<object>;
/**
 * Creates an Object for the elements of `source`.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param prototype The prototype for the object.
 * @param keySelector A callback used to select a key for each element.
 * @param elementSelector A callback that selects a value for each element.
 * @category Scalar
 */
export async function toObjectAsync<T, V>(source: AsyncQueryable<T>, prototype: object | null, keySelector: (element: T) => PropertyKey, elementSelector: (element: T) => V): Promise<object>;
export async function toObjectAsync<T>(source: AsyncQueryable<T>, prototype: object | null, keySelector: (element: T) => PropertyKey, elementSelector: (element: T) => T = Identity): Promise<object> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeObjectOrNull(prototype, "prototype");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    const obj = Object.create(prototype);
    for await (const item of ToPossiblyAsyncIterable(source)) {
        const key = keySelector(item);
        const element = elementSelector(item);
        obj[key] = element;
    }
    return obj;
}

Registry.AsyncQuery.registerScalar("toObject", toObjectAsync);