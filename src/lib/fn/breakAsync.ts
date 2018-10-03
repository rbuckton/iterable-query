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

import { assert, GetAsyncIterator, FlowHierarchy, Registry, GetAsyncSource, CreateAsyncSubquery, CreateSubquery, MakeTuple, ToPossiblyAsyncIterable } from "../internal";
import { AsyncHierarchyIterable, HierarchyIterable, PossiblyAsyncHierarchyIterable, AsyncQueryable } from "../types";
import { prependAsync } from "./prependAsync";
import { consumeAsync, ConsumeAsyncOptions } from "./consumeAsync";
import { emptyAsync } from "./emptyAsync";

const noCacheAndLeaveOpen: ConsumeAsyncOptions = { cacheElements: false, leaveOpen: true };
const cacheAndClose: ConsumeAsyncOptions = { cacheElements: true, leaveOpen: false };

/**
 * Creates a tuple whose first element is an `Iterable` containing the first span of
 * elements that do not match the supplied predicate, and whose second element is an `AsyncIterable`
 * containing the remaining elements.
 *
 * The first `Iterable` is eagerly evaluated, while the second `ASyncIterable` is lazily
 * evaluated.
 *
 * @param source An `AsyncQueryable` object.
 * @param predicate The predicate used to match elements.
 * @category Scalar
 */
export async function breakAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate: (element: T) => boolean): Promise<[HierarchyIterable<TNode, T>, AsyncHierarchyIterable<TNode, T>]>;
/**
 * Creates a tuple whose first element is an `Iterable` containing the first span of
 * elements that do not match the supplied predicate, and whose second element is an `AsyncIterable`
 * containing the remaining elements.
 *
 * The first `Iterable` is eagerly evaluated, while the second `ASyncIterable` is lazily
 * evaluated.
 *
 * @param source An `AsyncQueryable` object.
 * @param predicate The predicate used to match elements.
 * @category Scalar
 */
export async function breakAsync<T>(source: AsyncQueryable<T>, predicate: (element: T) => boolean): Promise<[Iterable<T>, AsyncIterable<T>]>;
export async function breakAsync<T>(source: AsyncQueryable<T>, predicate: (element: T) => boolean): Promise<[Iterable<T>, AsyncIterable<T>]> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(predicate, "predicate");
    const prefix: T[] = [];
    const iterator = GetAsyncIterator(ToPossiblyAsyncIterable(source));
    for await (const value of consumeAsync(iterator, noCacheAndLeaveOpen)) {
        if (predicate(value)) {
            const remaining = prependAsync(consumeAsync(iterator, cacheAndClose), value);
            return [
                FlowHierarchy(prefix, source),
                FlowHierarchy(remaining, source)
            ];
        }
        prefix.push(value);
    }
    return [
        FlowHierarchy(prefix, source),
        FlowHierarchy(emptyAsync<T>(), source)
    ];
}

Registry.AsyncQuery.registerCustom("break", breakAsync, async function (predicate) {
    const [first, rest] = await breakAsync(GetAsyncSource(this), predicate);
    return MakeTuple(CreateSubquery(this, first), CreateAsyncSubquery(this, rest));
});