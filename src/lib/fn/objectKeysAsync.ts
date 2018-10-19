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
 * Creates an [[AsyncIterable]] for the own property keys of an `object`.
 *
 * @param source An `object` or a [[Promise]] for an `object`.
 * @category Query
 */
export function objectKeysAsync<T extends object>(source: PromiseLike<T> | T): AsyncIterable<Extract<keyof T, string>> {
    assert.mustBeObject(source, "source");
    return new AsyncObjectKeysIterable(source);
}

@ToStringTag("AsyncObjectKeysIterable")
class AsyncObjectKeysIterable<T extends object> implements AsyncIterable<Extract<keyof T, string>> {
    private _source: PromiseLike<T> | T;
    constructor(source: PromiseLike<T> | T) {
        this._source = source;
    }
    
    async *[Symbol.asyncIterator](): AsyncIterator<Extract<keyof T, string>> {
        const source = await this._source;
        assert.mustBeObject(source, "source");
        yield* Object.keys(source) as Extract<keyof T, string>[];
    }
}