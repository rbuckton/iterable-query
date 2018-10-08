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

import { assert, ToStringTag, Registry } from "../internal";

/**
 * Creates an [[AsyncIterable]] whose values are provided by a callback executed a provided number of
 * times.
 *
 * @param count The number of times to execute the callback.
 * @param generator The callback to execute.
 * @category Query
 */
export function generateAsync<T>(count: number, generator: (offset: number) => PromiseLike<T> | T): AsyncIterable<T> {
    assert.mustBePositiveFiniteNumber(count, "count");
    assert.mustBeFunction(generator, "generator");
    return new AsyncGenerateIterable(count, generator);
}

@ToStringTag("AsyncGenerateIterable")
class AsyncGenerateIterable<T> implements AsyncIterable<T> {
    private _count: number;
    private _generator: (offset: number) => PromiseLike<T> | T;

    constructor(count: number, generator: (offset: number) => PromiseLike<T> | T) {
        this._count = count;
        this._generator = generator;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const count = this._count;
        const generator = this._generator;
        for (let i = 0; i < count; i++) {
            yield generator(i);
        }
    }
}

Registry.AsyncQuery.registerStatic("generate", generateAsync);