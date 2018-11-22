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
import { AsyncHierarchyIterable, PossiblyAsyncHierarchyIterable, AsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates an [[AsyncHierarchyIterable]] whose elements match the supplied predicate.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @param predicate A callback used to match each key.
 * @category Subquery
 */
export function filterByAsync<TNode, T extends TNode, K>(source: PossiblyAsyncHierarchyIterable<TNode, T>, keySelector: (element: T) => K, predicate: (key: K, offset: number) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] whose elements match the supplied predicate.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @param predicate A callback used to match each key.
 * @category Subquery
 */
export function filterByAsync<T, K>(source: AsyncQueryable<T>, keySelector: (element: T) => K, predicate: (key: K, offset: number) => boolean | PromiseLike<boolean>): AsyncIterable<T>;
export function filterByAsync<T, K>(source: AsyncQueryable<T>, keySelector: (element: T) => K, predicate: (key: K, offset: number) => boolean | PromiseLike<boolean>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(predicate, "predicate");
    return FlowHierarchy(new AsyncFilterByIterable(ToPossiblyAsyncIterable(source), keySelector, predicate), source);
}

@ToStringTag("AsyncFilterByIterable")
class AsyncFilterByIterable<T, K> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _keySelector: (element: T) => K;
    private _predicate: (key: K, offset: number) => boolean | PromiseLike<boolean>;

    constructor(source: PossiblyAsyncIterable<T>, keySelector: (element: T) => K, predicate: (key: K, offset: number) => boolean | PromiseLike<boolean>) {
        this._source = source;
        this._keySelector = keySelector;
        this._predicate = predicate;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const keySelector = this._keySelector;
        const predicate = this._predicate;
        let offset = 0;
        for await (const element of this._source) {
            const result = predicate(keySelector(element), offset++);
            if (typeof result === "boolean" ? result : await result) {
                yield element;
            }
        }
    }
}