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

import { assert, True, ToIterable, Registry } from "../internal";
import { Queryable } from "../types";

/**
 * Gets the last element of a [[Queryable]], optionally filtering elements using the supplied
 * callback.
 *
 * @param source A [[Queryable]] object.
 * @param predicate An optional callback used to match each element.
 * @category Scalar
 */
export function last<T>(source: Queryable<T>, predicate: (element: T) => boolean = True): T | undefined {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(predicate, "predicate");
    let result: T | undefined;
    for (const element of ToIterable(source)) {
        if (predicate(element)) {
            result = element;
        }
    }
    return result;
}

Registry.Query.registerScalar("last", last);