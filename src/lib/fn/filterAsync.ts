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
import { AsyncHierarchyIterable, PossiblyAsyncHierarchyIterable, PossiblyAsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates an `Iterable` whose elements match the supplied predicate.
 *
 * @param source A `Queryable` object.
 * @param predicate A callback used to match each element.
 */
export function filterAsync<TNode, T extends TNode, U extends T>(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate: (element: T, offset: number) => element is U): AsyncHierarchyIterable<TNode, U>;

/**
 * Creates an `Iterable` whose elements match the supplied predicate.
 *
 * @param source A `Queryable` object.
 * @param predicate A callback used to match each element.
 */
export function filterAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode, offset: number) => element is U): AsyncHierarchyIterable<TNode, U>;

/**
 * Creates an `Iterable` whose elements match the supplied predicate.
 *
 * @param source A `Queryable` object.
 * @param predicate A callback used to match each element.
 */
export function filterAsync<T, U extends T>(source: PossiblyAsyncQueryable<T>, predicate: (element: T, offset: number) => element is U): AsyncIterable<U>;

/**
 * Creates an `Iterable` whose elements match the supplied predicate.
 *
 * @param source A `Queryable` object.
 * @param predicate A callback used to match each element.
 */
export function filterAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate: (element: T, offset: number) => boolean): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates an `Iterable` whose elements match the supplied predicate.
 *
 * @param source A `Queryable` object.
 * @param predicate A callback used to match each element.
 */
export function filterAsync<T>(source: PossiblyAsyncQueryable<T>, predicate: (element: T, offset: number) => boolean): AsyncIterable<T>;

export function filterAsync<T>(source: PossiblyAsyncQueryable<T>, predicate: (element: T, offset: number) => boolean): AsyncIterable<T> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    assert.mustBeFunction(predicate, "predicate");
    return FlowHierarchy(new AsyncFilterIterable(ToPossiblyAsyncIterable(source), predicate), source);
}

@ToStringTag("AsyncFilterIterable")
class AsyncFilterIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _predicate: (element: T, offset: number) => boolean;

    constructor(source: PossiblyAsyncIterable<T>, predicate: (element: T, offset: number) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const predicate = this._predicate;
        let offset = 0;
        for await (const element of this._source) {
            if (predicate(element, offset++)) {
                yield element;
            }
        }
    }
}

Registry.AsyncQuery.registerSubquery("filter", filterAsync);