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

import { assert, ToIterable, ToStringTag, Registry } from "../internal";
import { Queryable } from "../types";

/**
 * Creates a subquery that iterates the results of applying a callback to each element.
 *
 * @param source A `Queryable` object.
 * @param projection A callback used to map each element into an iterable.
 */
export function flatMap<T, U>(source: Queryable<T>, projection: (element: T) => Queryable<U>): Iterable<U> {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(projection, "projection");
    return new FlatMapIterable(ToIterable(source), projection);
}

@ToStringTag("FlatMapIterable")
class FlatMapIterable<T, U> implements Iterable<U> {
    private _source: Iterable<T>;
    private _projection: (element: T) => Queryable<U>;

    constructor(source: Iterable<T>, projection: (element: T) => Queryable<U>) {
        this._source = source;
        this._projection = projection;
    }

    *[Symbol.iterator](): Iterator<U> {
        const projection = this._projection;
        for (const element of this._source) {
            yield* ToIterable(projection(element));
        }
    }
}

Registry.Query.registerSubquery("flatMap", flatMap);