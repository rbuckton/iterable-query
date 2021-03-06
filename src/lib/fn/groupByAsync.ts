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

import { assert, CreateGrouping, ToPossiblyAsyncIterable, CreateGroupingsAsync, ToStringTag, FlowHierarchy, IsEqualer } from "../internal";
import { AsyncQueryable, PossiblyAsyncIterable, Grouping, PossiblyAsyncHierarchyIterable, HierarchyGrouping } from "../types";
import { identity } from "./common";
import { Equaler } from '@esfx/equatable';

/**
 * Groups each element of a [[HierarchyIterable]] or [[AsyncHierarchyIterable]] by its key.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function groupByAsync<T, K>(source: PossiblyAsyncHierarchyIterable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): AsyncIterable<HierarchyGrouping<K, T>>;
/**
 * Groups each element of an [[AsyncQueryable]] by its key.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function groupByAsync<T, K>(source: AsyncQueryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): AsyncIterable<Grouping<K, T>>;
/**
 * Groups each element of an [[AsyncQueryable]] by its key.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function groupByAsync<T, K, V>(source: AsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V | PromiseLike<V>, keyEqualer?: Equaler<K>): AsyncIterable<Grouping<K, V>>;
/**
 * Groups each element of an [[AsyncQueryable]] by its key.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 * @param resultSelector A callback used to select a result from a group.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function groupByAsync<T, K, V, R>(source: AsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V | PromiseLike<V>, resultSelector: (key: K, elements: Iterable<V>) => PromiseLike<R> | R, keyEqualer?: Equaler<K>): AsyncIterable<R>;
export function groupByAsync<T, K, V, R>(source: AsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: ((element: T) => T | V | PromiseLike<T | V>) | Equaler<K> = identity, resultSelector: ((key: K, elements: Iterable<T | V>) => PromiseLike<Grouping<K, T | V> | R> | Grouping<K, T | V> | R) | Equaler<K> = CreateGrouping, keyEqualer?: Equaler<K>): AsyncIterable<Grouping<K, T | V> | R> {
    if (IsEqualer(elementSelector)) {
        resultSelector = elementSelector;
        elementSelector = identity;
    }
    if (IsEqualer(resultSelector)) {
        keyEqualer = resultSelector;
        resultSelector = CreateGrouping;
    }
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
    assert.mustBeEqualerOrUndefined(keyEqualer, "keyEqualer");
    return new AsyncGroupByIterable(ToPossiblyAsyncIterable(source), keySelector, elementSelector, resultSelector);
}

@ToStringTag("AsyncGroupByIterable")
class AsyncGroupByIterable<T, K, V, R> implements AsyncIterable<R> {
    private _source: PossiblyAsyncIterable<T>;
    private _keySelector: (element: T) => K;
    private _elementSelector: (element: T) => T | V | PromiseLike<T | V>;
    private _resultSelector: (key: K, elements: Iterable<T | V>) => PromiseLike<R> | R;
    private _keyEqualer?: Equaler<K>

    constructor(source: PossiblyAsyncIterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V | PromiseLike<V>, resultSelector: (key: K, elements: Iterable<T | V>) => PromiseLike<R> | R, keyEqualer?: Equaler<K>) {
        this._source = source;
        this._keySelector = keySelector;
        this._elementSelector = elementSelector;
        this._resultSelector = resultSelector;
        this._keyEqualer = keyEqualer;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<R> {
        const source = this._source;
        const elementSelector = this._elementSelector;
        const resultSelector = this._resultSelector;
        const map = await CreateGroupingsAsync(source, this._keySelector, this._elementSelector, this._keyEqualer);
        for (const [key, values] of map) {
            yield resultSelector(key, elementSelector === identity ? FlowHierarchy(values, source) : values);
        }
    }
}