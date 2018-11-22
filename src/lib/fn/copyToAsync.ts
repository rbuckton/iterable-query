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
import { WritableArrayLike, AsyncQueryable } from "../types";

/**
 * Writes each element of a source iterable to a destination array.
 *
 * @param source A [[Queryable]] object.
 * @param dest The destination array.
 * @param start The offset into the array at which to start writing.
 * @param count The number of elements to write to the array.
 * @category Scalar
 */
export async function copyToAsync<T, U extends WritableArrayLike<T>>(source: AsyncQueryable<T>, dest: U, start: number = 0, count: number = dest.length - start): Promise<U> {
    assert.mustBeAsyncQueryable(source, "source");
    assert.mustBeArrayLike(dest, "dest");
    assert.mustBePositiveInteger(start, "start");
    assert.mustBePositiveInteger(count, "count");
    if (count > 0) {
        const minLength = start + count;
        for await (const element of ToPossiblyAsyncIterable(source)) {
            if (count > 0) {
                dest[start++] = element;
                count--;
            }
        }
        if (dest.length < minLength) dest.length = minLength;
    }
    return dest;
}