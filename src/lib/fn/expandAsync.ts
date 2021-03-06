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

import { assert, ToPossiblyAsyncIterable, FlowHierarchy, ToStringTag } from "../internal";
import { PossiblyAsyncHierarchyIterable, AsyncQueryable, AsyncHierarchyIterable, PossiblyAsyncIterable } from "../types";

/**
 * Creates an [[AsyncHierarchyIterable]] that iterates the results of recursively expanding the
 * elements of `source`.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param projection A callback used to recusively expand each element.
 * @category Subquery
 */
export function expandAsync<TNode, T extends TNode = TNode, U extends TNode = T>(source: PossiblyAsyncHierarchyIterable<TNode, T>, projection: (element: T) => AsyncQueryable<U>): AsyncHierarchyIterable<TNode, U>;
/**
 * Creates an [[AsyncIterable]] that iterates the results of recursively expanding the
 * elements of `source`.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param projection A callback used to recusively expand each element.
 * @category Subquery
 */
export function expandAsync<T>(source: AsyncQueryable<T>, projection: (element: T) => AsyncQueryable<T>): AsyncIterable<T>;
export function expandAsync<T>(source: AsyncQueryable<T>, projection: (element: T) => AsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(projection, "projection");
    return FlowHierarchy(new AsyncExpandIterable(ToPossiblyAsyncIterable(source), projection), source);
}

@ToStringTag("AsyncExpandIterable")
class AsyncExpandIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _projection: (element: T) => AsyncQueryable<T>;

    constructor(source: PossiblyAsyncIterable<T>, projection: (element: T) => AsyncQueryable<T>) {
        this._source = source;
        this._projection = projection;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const projection = this._projection;
        const queue: PossiblyAsyncIterable<T>[] = [this._source];
        while (queue.length) {
            const source = queue.shift()!;
            for await (const element of source) {
                const projected = projection(element);
                assert.mustBeAsyncQueryable<T>(projected);
                queue.push(ToPossiblyAsyncIterable(projected));
                yield element;
            }
        }
    }
}