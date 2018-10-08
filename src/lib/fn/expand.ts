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
 * Creates a [[HierarchyIterable]] that iterates the results of recursively expanding the
 * elements of `source`.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param projection A callback used to recusively expand each element.
 * @category Subquery
 */
export function expand<TNode, T extends TNode = TNode, U extends TNode = T>(source: HierarchyIterable<TNode, T>, projection: (element: T) => Queryable<U>): HierarchyIterable<TNode, U>;
/**
 * Creates an [[Iterable]] that iterates the results of recursively expanding the
 * elements of the `source`.
 *
 * @param source A [[Queryable]] object.
 * @param projection A callback used to recusively expand each element.
 * @category Subquery
 */
export function expand<T>(source: Queryable<T>, projection: (element: T) => Queryable<T>): Iterable<T>;
export function expand<T>(source: Queryable<T>, projection: (element: T) => Queryable<T>): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(projection, "projection");
    return FlowHierarchy(new ExpandIterable(ToIterable(source), projection), source);
}

@ToStringTag("ExpandIterable")
class ExpandIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _projection: (element: T) => Queryable<T>;

    constructor(source: Iterable<T>, projection: (element: T) => Queryable<T>) {
        this._source = source;
        this._projection = projection;
    }

    *[Symbol.iterator](): Iterator<T> {
        const projection = this._projection;
        const queue: Iterable<T>[] = [this._source];
        while (queue.length) {
            const source = queue.shift()!;
            for (const element of source) {
                queue.push(ToIterable(projection(element)));
                yield element;
            }
        }
    }
}

Registry.Query.registerSubquery("expand", expand);