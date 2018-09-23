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

import { assert, ToPossiblyAsyncIterable, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates a subquery by applying a callback to each element.
 *
 * @param source A `Queryable` object.
 * @param selector A callback used to map each element.
 */
export function mapAsync<T, U>(source: PossiblyAsyncQueryable<T>, selector: (element: T, offset: number) => U): AsyncIterable<U> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    assert.mustBeFunction(selector, "selector");
    return new AsyncMapIterable(ToPossiblyAsyncIterable(source), selector);
}

@ToStringTag("AsyncMapIterable")
class AsyncMapIterable<T, U> implements AsyncIterable<U> {
    private _source: PossiblyAsyncIterable<T>;
    private _selector: (element: T, offset: number) => U;

    constructor(source: PossiblyAsyncIterable<T>, selector: (element: T, offset: number) => U) {
        this._source = source;
        this._selector = selector;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<U> {
        const selector = this._selector;
        let offset = 0;
        for await (const element of this._source) {
            yield selector(element, offset++);
        }
    }
}

Registry.AsyncQuery.registerSubquery("map", mapAsync);