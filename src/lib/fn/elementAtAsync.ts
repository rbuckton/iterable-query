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

import { assert, ToPossiblyAsyncIterable, Registry } from "../internal";
import { AsyncQueryable } from "../types";
import { lastAsync } from "./lastAsync";

/**
 * Finds the value at the provided offset. A negative offset starts from the
 * last element.
 *
 * @param source An `AsyncQueryable` object.
 * @param offset An offset.
 */
export async function elementAtAsync<T>(source: AsyncQueryable<T>, offset: number): Promise<T | undefined> {
    assert.mustBeAsyncQueryable<T>(source, "source")
    assert.mustBeInteger(offset, "offset");
    if (offset === -1) {
        return await lastAsync(source);
    }
    if (offset < 0) {
        offset = Math.abs(offset);
        const array: T[] = [];
        for await (const element of ToPossiblyAsyncIterable(source)) {
            if (array.length >= offset) {
                array.shift();
            }
            array.push(element);
        }
        return array.length - offset >= 0 ? array[array.length - offset] : undefined;
    }
    for await (const element of ToPossiblyAsyncIterable(source)) {
        if (offset === 0) {
            return element;
        }
        offset--;
    }
    return undefined;
}

Registry.AsyncQuery.registerScalar("elementAt", elementAtAsync);