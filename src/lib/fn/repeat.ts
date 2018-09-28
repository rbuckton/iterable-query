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

import { assert, ToStringTag, Registry } from "../internal";

/**
 * Creates an Iterable for a value repeated a provided number of times.
 *
 * @param value The value for each element of the Iterable.
 * @param count The number of times to repeat the value.
 */
export function repeat<T>(value: T, count: number): Iterable<T> {
    assert.mustBePositiveFiniteNumber(count, "count");
    return new RepeatIterable(value, count);
}

@ToStringTag("RepeatIterable")
class RepeatIterable<T> implements Iterable<T> {
    private _value: T;
    private _count: number;

    constructor(value: T, count: number) {
        this._value = value;
        this._count = count;
    }

    *[Symbol.iterator](): Iterator<T> {
        const value = this._value;
        for (let count = this._count; count > 0; --count) {
            yield value;
        }
    }
}

Registry.Query.registerStatic("repeat", repeat);