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

import { assert, ToIterable, FlowHierarchy, ToStringTag, Registry } from "../internal";
import { Queryable, HierarchyIterable } from "../types";

/**
 * Creates a `HierarchyIterable` for the elements of `source` with the provided `value` appended to the
 * end.
 *
 * @param source A `HierarchyIterable` value.
 * @param value The value to append.
 */
export function append<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, value: T): HierarchyIterable<TNode, T>;
/**
 * Creates an `Iterable` for the elements of `source` with the provided `value` appended to the
 * end.
 *
 * @param source A `Queryable` value.
 * @param value The value to append.
 */
export function append<T>(source: Queryable<T>, value: T): Iterable<T>;

export function append<T>(source: Queryable<T>, value: T): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    return FlowHierarchy(new AppendIterable(ToIterable(source), value), source);
}

@ToStringTag("AppendIterable")
class AppendIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _value: T;

    constructor(source: Iterable<T>, value: T) {
        this._source = source;
        this._value = value;
    }

    *[Symbol.iterator](): Iterator<T> {
        yield* this._source;
        yield this._value;
    }
}

Registry.Query.registerSubquery("append", append);