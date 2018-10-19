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

import { assert, ToStringTag } from "../internal";

/**
 * Creates an Iterable for a value repeated a provided number of times.
 *
 * @param value The value for each element of the Iterable.
 * @param count The number of times to repeat the value.
 * @category Query
 */
export function repeatAsync<T>(value: PromiseLike<T> | T, count: number): AsyncIterable<T> {
    assert.mustBePositiveFiniteNumber(count, "count");
    return new AsyncRepeatIterable(value, count);
}

@ToStringTag("AsyncRepeatIterable")
class AsyncRepeatIterable<T> implements AsyncIterable<T> {
    private _value: PromiseLike<T> | T;
    private _count: number;
    
    constructor(value: PromiseLike<T> | T, count: number) {
        this._value = value;
        this._count = count;
    }
    
    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const value = await this._value;
        let count = this._count;
        while (count > 0) {
            yield value;
            count--;
        }
    }
}