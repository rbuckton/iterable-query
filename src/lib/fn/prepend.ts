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

import { assert, ToIterable, FlowHierarchy, ToStringTag, Registry } from "../internal";
import { Queryable, HierarchyIterable } from "../types";

/**
 * Creates a subquery for the elements of the source with the provided value prepended to the beginning.
 *
 * @param value The value to prepend.
 * @category Subquery
 */
export function prepend<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, value: T): HierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the elements of the source with the provided value prepended to the beginning.
 *
 * @param value The value to prepend.
 * @category Subquery
 */
export function prepend<T>(source: Queryable<T>, value: T): Iterable<T>;
export function prepend<T>(source: Queryable<T>, value: T): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    return FlowHierarchy(new PrependIterable(value, ToIterable(source)), source);
}

@ToStringTag("PrependIterable")
class PrependIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _value: T;

    constructor(value: T, source: Iterable<T>) {
        this._value = value;
        this._source = source;
    }

    *[Symbol.iterator](): Iterator<T> {
        yield this._value;
        yield* this._source;
    }
}

Registry.Query.registerSubquery("prepend", prepend);