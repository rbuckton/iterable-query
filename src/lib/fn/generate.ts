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

import { assert, ToStringTag} from "../internal";

/**
 * Creates an [[Iterable]] whose values are provided by a callback executed a provided number of
 * times.
 *
 * @param count The number of times to execute the callback.
 * @param generator The callback to execute.
 * @category Query
 */
export function generate<T>(count: number, generator: (offset: number) => T): Iterable<T> {
    assert.mustBePositiveFiniteNumber(count, "count");
    assert.mustBeFunction(generator, "generator");
    return new GenerateIterable(count, generator);
}

@ToStringTag("GenerateIterable")
class GenerateIterable<T> implements Iterable<T> {
    private _count: number;
    private _generator: (offset: number) => T;

    constructor(count: number, generator: (offset: number) => T) {
        this._count = count;
        this._generator = generator;
    }

    *[Symbol.iterator](): Iterator<T> {
        const count = this._count;
        const generator = this._generator;
        for (let i = 0; i < count; i++) {
            yield generator(i);
        }
    }
}