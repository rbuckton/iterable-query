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

import { assert, SameValue, Identity, CreateGrouping, ToPossiblyAsyncIterable, ToStringTag, Registry, FlowHierarchy } from "../internal";
import { AsyncQueryable, PossiblyAsyncHierarchyIterable, HierarchyGrouping, Grouping, PossiblyAsyncIterable } from "../types";

/**
 * Creates a subquery whose elements are the contiguous ranges of elements that share the same key.
 *
 * @param source An `AsyncQueryable` object.
 * @param keySelector A callback used to select the key for an element.
 */
export function spanMapAsync<TNode, T extends TNode, K>(source: PossiblyAsyncHierarchyIterable<TNode, T>, keySelector: (element: T) => K): AsyncIterable<HierarchyGrouping<K, TNode, T>>;
/**
 * Creates a subquery whose elements are the contiguous ranges of elements that share the same key.
 *
 * @param source An `AsyncQueryable` object.
 * @param keySelector A callback used to select the key for an element.
 */
export function spanMapAsync<T, K>(source: AsyncQueryable<T>, keySelector: (element: T) => K): AsyncIterable<Grouping<K, T>>;
/**
 * Creates a subquery whose values are computed from each element of the contiguous ranges of elements that share the same key.
 *
 * @param source An `AsyncQueryable` object.
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 */
export function spanMapAsync<T, K, V>(source: AsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): AsyncIterable<Grouping<K, V>>;
/**
 * Creates a subquery whose values are computed from the contiguous ranges of elements that share the same key.
 *
 * @param source An `AsyncQueryable` object.
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 * @param spanSelector A callback used to select a result from a contiguous range.
 */
export function spanMapAsync<T, K, V, R>(source: AsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, spanSelector: (key: K, elements: Iterable<V>) => R): AsyncIterable<R>;
export function spanMapAsync<T, K, V, R>(source: AsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => T | V = Identity, spanSelector: (key: K, span: Iterable<T | V>) => Grouping<K, T | V> | R = CreateGrouping): AsyncIterable<Grouping<K, T | V> | R> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    assert.mustBeFunction(spanSelector, "spanSelector");
    return new AsyncSpanMapIterable(ToPossiblyAsyncIterable(source), keySelector, elementSelector, spanSelector);
}

@ToStringTag("AsyncSpanMapIterable")
class AsyncSpanMapIterable<T, K, V, R> implements AsyncIterable<R> {
    private _source: PossiblyAsyncIterable<T>;
    private _keySelector: (element: T) => K;
    private _elementSelector: (element: T) => V;
    private _spanSelector: (key: K, elements: Iterable<T | V>) => R;

    constructor(source: PossiblyAsyncIterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, spanSelector: (key: K, elements: Iterable<T | V>) => R) {
        this._source = source;
        this._keySelector = keySelector;
        this._elementSelector = elementSelector;
        this._spanSelector = spanSelector;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<R> {
        const keySelector = this._keySelector;
        const elementSelector = this._elementSelector;
        const spanSelector = this._spanSelector;
        let span: V[] | undefined;
        let previousKey!: K;
        for await (const element of this._source) {
            const key = keySelector(element);
            if (!span) {
                previousKey = key;
                span = [];
            }
            else if (!SameValue(previousKey, key)) {
                yield spanSelector(previousKey, elementSelector === Identity ? FlowHierarchy(span, this._source) : span);
                span = [];
                previousKey = key;
            }
            span.push(elementSelector(element));
        }
        if (span) {
            yield spanSelector(previousKey, elementSelector === Identity ? FlowHierarchy(span, this._source) : span);
        }
    }
}

Registry.AsyncQuery.registerSubquery("spanMap", spanMapAsync);