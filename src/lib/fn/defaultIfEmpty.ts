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
 * Creates a subquery that contains the provided default value if the source
 * contains no elements.
 *
 * @param defaultValue The default value.
 */
export function defaultIfEmpty<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, defaultValue: T): HierarchyIterable<TNode, T>;

/**
 * Creates a subquery that contains the provided default value if the source
 * contains no elements.
 *
 * @param defaultValue The default value.
 */
export function defaultIfEmpty<T>(source: Queryable<T>, defaultValue: T): Iterable<T>;

export function defaultIfEmpty<T>(source: Queryable<T>, defaultValue: T): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    return FlowHierarchy(new DefaultIfEmptyIterable(ToIterable(source), defaultValue), source);
}

@ToStringTag("DefaultIfEmptyIterable")
class DefaultIfEmptyIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _defaultValue: T;

    constructor(source: Iterable<T>, defaultValue: T) {
        this._source = source;
        this._defaultValue = defaultValue;
    }

    *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const defaultValue = this._defaultValue;
        let hasElements = false;
        for (const value of source) {
            hasElements = true;
            yield value;
        }
        if (!hasElements) {
            yield defaultValue;
        }
    }
}

Registry.Query.registerSubquery("defaultIfEmpty", defaultIfEmpty);