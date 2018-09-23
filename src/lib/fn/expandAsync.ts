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

import { assert, ToPossiblyAsyncIterable, FlowHierarchy, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncHierarchyIterable, PossiblyAsyncQueryable, AsyncHierarchyIterable, PossiblyAsyncIterable } from "../types";

/**
 * Creates a subquery that iterates the results of recursively expanding the
 * elements of the source.
 *
 * @param source A `Queryable` object.
 * @param projection A callback used to recusively expand each element.
 */
export function expandAsync<TNode, T extends TNode = TNode, U extends TNode = T>(source: PossiblyAsyncHierarchyIterable<TNode, T>, projection: (element: T) => PossiblyAsyncQueryable<U>): AsyncHierarchyIterable<TNode, U>;

/**
 * Creates a subquery that iterates the results of recursively expanding the
 * elements of the source.
 *
 * @param source A `Queryable` object.
 * @param projection A callback used to recusively expand each element.
 */
export function expandAsync<T>(source: PossiblyAsyncQueryable<T>, projection: (element: T) => PossiblyAsyncQueryable<T>): AsyncIterable<T>;

export function expandAsync<T>(source: PossiblyAsyncQueryable<T>, projection: (element: T) => PossiblyAsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    assert.mustBeFunction(projection, "projection");
    return FlowHierarchy(new AsyncExpandIterable(ToPossiblyAsyncIterable(source), projection), source);
}

@ToStringTag("AsyncExpandIterable")
class AsyncExpandIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _projection: (element: T) => PossiblyAsyncQueryable<T>;

    constructor(source: PossiblyAsyncIterable<T>, projection: (element: T) => PossiblyAsyncQueryable<T>) {
        this._source = source;
        this._projection = projection;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const projection = this._projection;
        const queue: PossiblyAsyncIterable<T>[] = [this._source];
        while (queue.length) {
            const source = queue.shift()!;
            for await (const element of source) {
                queue.push(ToPossiblyAsyncIterable(projection(element)));
                yield element;
            }
        }
    }
}

Registry.AsyncQuery.registerSubquery("expand", expandAsync);