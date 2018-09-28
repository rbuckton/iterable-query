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

import { assert, ToIterable, SameValue, Identity, CreateGrouping, ToStringTag, Registry, FlowHierarchy } from "../internal";
import { Queryable, HierarchyIterable, HierarchyGrouping, Grouping } from "../types";

/**
 * Creates a subquery whose elements are the contiguous ranges of elements that share the same key.
 *
 * @param source A `Queryable` object.
 * @param keySelector A callback used to select the key for an element.
 */
export function spanMap<TNode, T extends TNode, K>(source: HierarchyIterable<TNode, T>, keySelector: (element: T) => K): Iterable<HierarchyGrouping<K, TNode, T>>;
/**
 * Creates a subquery whose elements are the contiguous ranges of elements that share the same key.
 *
 * @param source A `Queryable` object.
 * @param keySelector A callback used to select the key for an element.
 */
export function spanMap<T, K>(source: Queryable<T>, keySelector: (element: T) => K): Iterable<Grouping<K, T>>;
/**
 * Creates a subquery whose values are computed from each element of the contiguous ranges of elements that share the same key.
 *
 * @param source A `Queryable` object.
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 */
export function spanMap<T, K, V>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Iterable<Grouping<K, V>>;
/**
 * Creates a subquery whose values are computed from the contiguous ranges of elements that share the same key.
 *
 * @param source A `Queryable` object.
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 * @param spanSelector A callback used to select a result from a contiguous range.
 */
export function spanMap<T, K, V, R>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, spanSelector: (key: K, elements: Iterable<V>) => R): Iterable<R>;
export function spanMap<T, K, V, R>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => T | V = Identity, spanSelector: (key: K, span: Iterable<T | V>) => Grouping<K, T | V> | R = CreateGrouping) {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    assert.mustBeFunction(spanSelector, "spanSelector");
    return new SpanMapIterable(ToIterable(source), keySelector, elementSelector, spanSelector);
}

@ToStringTag("SpanMapIterable")
class SpanMapIterable<T, K, V, R> implements Iterable<R> {
    private _source: Iterable<T>;
    private _keySelector: (element: T) => K;
    private _elementSelector: (element: T) => V;
    private _spanSelector: (key: K, elements: Iterable<T | V>) => R;

    constructor(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, spanSelector: (key: K, elements: Iterable<T | V>) => R) {
        this._source = source;
        this._keySelector = keySelector;
        this._elementSelector = elementSelector;
        this._spanSelector = spanSelector;
    }

    *[Symbol.iterator](): Iterator<R> {
        const source = ToIterable(this._source);
        const keySelector = this._keySelector;
        const elementSelector = this._elementSelector;
        const spanSelector = this._spanSelector;
        let span: V[] | undefined;
        let previousKey!: K;
        for (const element of source) {
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

Registry.Query.registerSubquery("spanMap", spanMap);