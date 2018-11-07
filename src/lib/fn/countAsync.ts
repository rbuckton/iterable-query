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

import { assert, ToPossiblyAsyncIterable, GetAsyncSource } from "../internal";
import { Map, Set } from "../collections";
import { AsyncQueryable } from "../types";
import { T } from "./common";

/**
 * Counts the number of elements, optionally filtering elements using the supplied callback.
 *
 * @param source A [[Queryable]] object.
 * @param predicate An optional callback used to match each element.
 * @category Scalar
 */
export async function countAsync<T>(source: AsyncQueryable<T>, predicate: (element: T) => boolean | PromiseLike<boolean> = T): Promise<number> {
    assert.mustBeAsyncQueryable(source, "source");
    assert.mustBeFunction(predicate, "predicate");

    if (predicate === T) {
        const realSource = GetAsyncSource(source);
        if (Array.isArray(realSource)) return realSource.length;
        if (realSource instanceof Set || realSource instanceof Map) return realSource.size;
    }

    let count = 0;
    for await (const element of ToPossiblyAsyncIterable(source)) {
        if (predicate === T || await predicate(element)) {
            count++;
        }
    }

    return count;
}