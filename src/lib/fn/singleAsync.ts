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

import { assert, True, ToPossiblyAsyncIterable } from "../internal";
import { AsyncQueryable } from "../types";

/**
 * Gets the only element, or returns `undefined`.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param predicate An optional callback used to match each element.
 * @category Scalar
 */
export async function singleAsync<T, U extends T>(source: AsyncQueryable<T>, predicate: (element: T) => element is U): Promise<U | undefined>;
/**
 * Gets the only element, or returns `undefined`.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param predicate An optional callback used to match each element.
 * @category Scalar
 */
export async function singleAsync<T>(source: AsyncQueryable<T>, predicate?: (element: T) => boolean | PromiseLike<boolean>): Promise<T | undefined>;
export async function singleAsync<T>(source: AsyncQueryable<T>, predicate: (element: T) => boolean | PromiseLike<boolean> = True) {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(predicate, "predicate");
    let hasResult = false;
    let single: T | undefined;
    for await (const element of ToPossiblyAsyncIterable(source)) {
        const result = predicate(element);
        if (typeof result === "boolean" ? result : await result) {
            if (hasResult) {
                return undefined;
            }
            hasResult = true;
            single = element;
        }
    }
    return hasResult ? single : undefined;
}