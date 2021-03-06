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

import { assert, FlowHierarchy, ToPossiblyAsyncIterable, ToStringTag } from "../internal";
import { AsyncHierarchyIterable, PossiblyAsyncHierarchyIterable, AsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates a subquery containing the first elements that do not match the supplied predicate.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function takeUntilAsync<TNode, T extends TNode, U extends T>(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate: (element: T) => element is U): AsyncHierarchyIterable<TNode, U>;
/**
 * Creates a subquery containing the first elements that do not match the supplied predicate.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function takeUntilAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate: (element: T) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates a subquery containing the first elements that do not match the supplied predicate.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function takeUntilAsync<T, U extends T>(source: AsyncQueryable<T>, predicate: (element: T) => element is U): AsyncIterable<U>;
/**
 * Creates a subquery containing the first elements that do not match the supplied predicate.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function takeUntilAsync<T>(source: AsyncQueryable<T>, predicate: (element: T) => boolean | PromiseLike<boolean>): AsyncIterable<T>;
export function takeUntilAsync<T>(source: AsyncQueryable<T>, predicate: (element: T) => boolean | PromiseLike<boolean>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(predicate, "predicate");
    return FlowHierarchy(new AsyncTakeUntilIterable(ToPossiblyAsyncIterable(source), predicate), source);
}

@ToStringTag("AsyncTakeUntilIterable")
class AsyncTakeUntilIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _predicate: (element: T) => boolean | PromiseLike<boolean>;

    constructor(source: PossiblyAsyncIterable<T>, predicate: (element: T) => boolean | PromiseLike<boolean>) {
        this._source = source;
        this._predicate = predicate;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const predicate = this._predicate;
        for await (const element of this._source) {
            const result = predicate(element);
            if (typeof result === "boolean" ? result : await result) {
                break;
            }
            yield element;
        }
    }
}