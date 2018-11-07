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
import { T } from "./common";

/**
 * Gets the first element, optionally filtering elements using the supplied callback.
 *
 * @param source A [[Queryable]] object.
 * @param predicate An optional callback used to match each element.
 * @category Scalar
 */
export async function firstAsync<T, U extends T>(source: AsyncQueryable<T>, predicate: (element: T) => element is U): Promise<U | undefined>;
/**
 * Gets the first element, optionally filtering elements using the supplied callback.
 *
 * @param source A [[Queryable]] object.
 * @param predicate An optional callback used to match each element.
 * @category Scalar
 */
export async function firstAsync<T>(source: AsyncQueryable<T>, predicate?: (element: T) => boolean | PromiseLike<boolean>): Promise<T | undefined>;
export async function firstAsync<T>(source: AsyncQueryable<T>, predicate: (element: T) => boolean | PromiseLike<boolean> = T): Promise<T | undefined> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(predicate, "predicate");
    for await (const element of ToPossiblyAsyncIterable(source)) {
        const result = predicate(element);
        if (typeof result === "boolean" ? result : await result) {
            return element;
        }
    }
    return undefined;
}