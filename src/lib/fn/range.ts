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
 * Creates an [[Iterable]] over a range of numbers.
 *
 * @param start The starting number of the range.
 * @param end The ending number of the range.
 * @param increment The amount by which to change between each itereated value.
 * @category Query
 */
export function range(start: number, end: number, increment: number = 1): Iterable<number> {
    assert.mustBeFiniteNumber(start, "start");
    assert.mustBeFiniteNumber(end, "end");
    assert.mustBePositiveNonZeroFiniteNumber(increment, "increment");
    return new RangeIterable(start, end, increment);
}

@ToStringTag("RangeIterable")
class RangeIterable implements Iterable<number> {
    private _start: number;
    private _end: number;
    private _increment: number;

    constructor(start: number, end: number, increment: number) {
        this._start = start;
        this._end = end;
        this._increment = increment;
    }

    *[Symbol.iterator](): Iterator<number> {
        const start = this._start;
        const end = this._end;
        const increment = this._increment;
        if (start <= end) { 
            for (let i = start; i <= end; i += increment) {
                yield i;
            }
        }
        else {
            for (let i = start; i >= end; i -= increment) {
                yield i;
            }
        }
    }
}