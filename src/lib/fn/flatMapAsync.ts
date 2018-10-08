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

import { assert, ToPossiblyAsyncIterable, ToStringTag, Registry } from "../internal";
import { AsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates an [[AsyncIterable]] that iterates the results of applying a callback to each element of `source`.
 *
 * @param source A [[Queryable]] object.
 * @param projection A callback used to map each element into an iterable.
 * @category Subquery
 */
export function flatMapAsync<T, U>(source: AsyncQueryable<T>, projection: (element: T) => AsyncQueryable<U>): AsyncIterable<U> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(projection, "projection");
    return new AsyncFlatMapIterable(ToPossiblyAsyncIterable(source), projection);
}

@ToStringTag("AsyncFlatMapIterable")
class AsyncFlatMapIterable<T, U> implements AsyncIterable<U> {
    private _source: PossiblyAsyncIterable<T>;
    private _projection: (element: T) => AsyncQueryable<U>;

    constructor(source: PossiblyAsyncIterable<T>, projection: (element: T) => AsyncQueryable<U>) {
        this._source = source;
        this._projection = projection;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<U> {
        const projection = this._projection;
        for await (const element of this._source) {
            yield* ToPossiblyAsyncIterable(projection(element));
        }
    }
}

Registry.AsyncQuery.registerSubquery("flatMap", flatMapAsync);