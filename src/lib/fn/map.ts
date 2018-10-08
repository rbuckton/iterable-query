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

import { assert, ToIterable, ToStringTag, Registry } from "../internal";
import { Queryable } from "../types";

/**
 * Creates an [[Iterable]] by applying a callback to each element of a [[Queryable]].
 *
 * @param source A [[Queryable]] object.
 * @param selector A callback used to map each element.
 * @category Subquery
 */
export function map<T, U>(source: Queryable<T>, selector: (element: T, offset: number) => U): Iterable<U> {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(selector, "selector");
    return new MapIterable(ToIterable(source), selector);
}

@ToStringTag("MapIterable")
class MapIterable<T, U> implements Iterable<U> {
    private _source: Iterable<T>;
    private _selector: (element: T, offset: number) => U;

    constructor(source: Iterable<T>, selector: (element: T, offset: number) => U) {
        this._source = source;
        this._selector = selector;
    }

    *[Symbol.iterator](): Iterator<U> {
        const selector = this._selector;
        let offset = 0;
        for (const element of this._source) {
            yield selector(element, offset++);
        }
    }
}

Registry.Query.registerSubquery("map", map);