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
 * Lazily invokes a callback as each element of the iterable is iterated.
 *
 * @param source A [[Queryable]] object.
 * @param callback The callback to invoke.
 * @category Subquery
 */
export function tap<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, callback: (element: T, offset: number) => void): HierarchyIterable<TNode, T>;
/**
 * Lazily invokes a callback as each element of the iterable is iterated.
 *
 * @param source A [[Queryable]] object.
 * @param callback The callback to invoke.
 * @category Subquery
 */
export function tap<T>(source: Queryable<T>, callback: (element: T, offset: number) => void): Iterable<T>;
export function tap<T>(source: Queryable<T>, callback: (element: T, offset: number) => void): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(callback, "callback");
    return FlowHierarchy(new TapIterable(ToIterable(source), callback), source);
}

@ToStringTag("TapIterable")
class TapIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _callback: (element: T, offset: number) => void;

    constructor(source: Iterable<T>, callback: (element: T, offset: number) => void) {
        this._source = source;
        this._callback = callback;
    }

    *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const callback = this._callback;
        let offset = 0;
        for (const element of source) {
            callback(element, offset++);
            yield element;
        }
    }
}

Registry.Query.registerSubquery("tap", tap);