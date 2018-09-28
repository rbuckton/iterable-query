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
import { AsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates a subquery containing the cumulative results of applying the provided callback to each element.
 *
 * @param source An `AsyncQueryable` object.
 * @param accumulator The callback used to compute each result.
 */
export function scanAsync<T>(source: AsyncQueryable<T>, accumulator: (current: T, element: T, offset: number) => T): AsyncIterable<T>;
/**
 * Creates a subquery containing the cumulative results of applying the provided callback to each element.
 *
 * @param source An `AsyncQueryable` object.
 * @param accumulator The callback used to compute each result.
 * @param seed An optional seed value.
 */
export function scanAsync<T, U>(source: AsyncQueryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed: U): AsyncIterable<U>;
export function scanAsync<T, U>(source: AsyncQueryable<T>, accumulator: (current: T | U, element: T, offset: number) => T | U, seed?: T | U): AsyncIterable<T | U> {
    assert.mustBeAsyncQueryable(source, "source");
    assert.mustBeFunction(accumulator, "accumulator");
    return new AsyncScanIterable<T, U>(ToPossiblyAsyncIterable(source), accumulator, arguments.length > 2, seed!);
}

@ToStringTag("AsyncScanIterable")
class AsyncScanIterable<T, U> implements AsyncIterable<T | U> {
    private _source: PossiblyAsyncIterable<T>;
    private _accumulator: (current: T | U, element: T, offset: number) => T | U;
    private _isSeeded: boolean;
    private _seed: T | U | undefined;

    constructor(source: PossiblyAsyncIterable<T>, accumulator: (current: T | U, element: T, offset: number) => T | U, isSeeded: boolean, seed: T | U | undefined) {
        this._source = source;
        this._accumulator = accumulator;
        this._isSeeded = isSeeded;
        this._seed = seed;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T | U> {
        const accumulator = this._accumulator;
        let hasCurrent = this._isSeeded;
        let current = this._seed;
        let offset = 0;
        for await (const value of this._source) {
            if (!hasCurrent) {
                current = value;
                hasCurrent = true;
            }
            else {
                current = accumulator(current!, value, offset);
                yield current;
            }
            offset++;
        }
    }
}

Registry.AsyncQuery.registerSubquery("scan", scanAsync);