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

import { assert, Identity, ToIterable, Registry } from "../internal";
import { Queryable } from "../types";

/**
 * Creates an Array for the elements of the `Queryable`.
 * 
 * @param source A `Queryable` object.
 * @category Scalar
 */
export function toArray<T>(source: Queryable<T>): T[];
/**
 * Creates an Array for the elements of the `Queryable`.
 *
 * @param source A `Queryable` object.
 * @param elementSelector A callback that selects a value for each element.
 * @category Scalar
 */
export function toArray<T, V>(source: Queryable<T>, elementSelector: (element: T) => V): V[];
export function toArray<T>(source: Queryable<T>, elementSelector: (element: T) => T = Identity): T[] {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(elementSelector, "elementSelector");
    const result: T[] = [];
    for (const element of ToIterable(source)) {
        result.push(elementSelector(element));
    }
    return result;
}

Registry.Query.registerScalar("toArray", toArray);
Registry.Query.registerAlias("toJSON", toArray);