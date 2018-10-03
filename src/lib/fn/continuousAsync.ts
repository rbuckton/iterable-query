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

import { ToStringTag, Registry } from "../internal";

/**
 * Creates an `AsyncIterable` that repeats the provided value forever.
 *
 * @param value The value for each element of the `AsyncIterable`.
 * @category Query
 */
export function continuousAsync<T>(value: PromiseLike<T> | T): AsyncIterable<T> {
    return new AsyncContinuousIterable(value);
}

@ToStringTag("AsyncContinuousIterable")
class AsyncContinuousIterable<T> implements AsyncIterable<T> {
    private _value: PromiseLike<T> | T;

    constructor(value: PromiseLike<T> | T) {
        this._value = value;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const value = await this._value;
        for (;;) {
            yield value;
        }
    }
}

Registry.AsyncQuery.registerStatic("continuous", continuousAsync);