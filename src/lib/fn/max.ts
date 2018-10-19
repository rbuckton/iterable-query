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

import { assert, ToIterable, CompareValues} from "../internal";
import { Queryable } from "../types";

/**
 * Gets the maximum element of a [[Queryable]], optionally comparing elements using the supplied callback.
 *
 * @param source A [[Queryable]] object.
 * @param comparison An optional callback used to compare two elements.
 * @category Scalar
 */
export function max<T>(source: Queryable<T>, comparison: (x: T, y: T) => number = CompareValues): T | undefined {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(comparison, "comparison");
    let hasResult = false;
    let result: T | undefined;
    for (const element of ToIterable(source)) {
        if (!hasResult) {
            result = element;
            hasResult = true;
        }
        else if (comparison(element, result!) > 0) {
            result = element;
        }
    }
    return result;
}