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

import { assert, ToIterable, CreateGroupings, CreateGrouping, ToStringTag, FlowHierarchy, IsEqualer } from "../internal";
import { Queryable, HierarchyIterable, HierarchyGrouping, Grouping } from "../types";
import { identity } from "./common";
import { Equaler } from '@esfx/equatable';

/**
 * Groups each element of a [[HierarchyIterable]] by its key.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function groupBy<TNode, T extends TNode, K>(source: HierarchyIterable<TNode, T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): Iterable<HierarchyGrouping<K, TNode, T>>;
/**
 * Groups each element of a [[Queryable]] by its key.
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function groupBy<T, K>(source: Queryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): Iterable<Grouping<K, T>>;
/**
 * Groups each element of a [[Queryable]] by its key.
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function groupBy<T, K, V>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, keyEqualer?: Equaler<K>): Iterable<Grouping<K, V>>;
/**
 * Groups each element of a [[Queryable]] by its key.
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 * @param resultSelector A callback used to select a result from a group.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Subquery
 */
export function groupBy<T, K, V, R>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Iterable<V>) => R, keyEqualer?: Equaler<K>): Iterable<R>;
export function groupBy<T, K, V, R>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: ((element: T) => T | V) | Equaler<K> = identity, resultSelector: ((key: K, elements: Iterable<T | V>) => Grouping<K, T | V> | R) | Equaler<K> = CreateGrouping, keyEqualer?: Equaler<K>) {
    if (IsEqualer(elementSelector)) {
        resultSelector = elementSelector;
        elementSelector = identity;
    }
    if (IsEqualer(resultSelector)) {
        keyEqualer = resultSelector;
        resultSelector = CreateGrouping;
    }
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
    assert.mustBeEqualerOrUndefined(keyEqualer, "keyEqualer");
    return new GroupByIterable(ToIterable(source), keySelector, elementSelector, resultSelector);
}

@ToStringTag("GroupByIterable")
class GroupByIterable<T, K, V, R> implements Iterable<R> {
    private _source: Iterable<T>;
    private _keySelector: (element: T) => K;
    private _elementSelector: (element: T) => T | V;
    private _resultSelector: (key: K, elements: Iterable<T | V>) => R;

    constructor(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Iterable<T | V>) => R) {
        this._source = source;
        this._keySelector = keySelector;
        this._elementSelector = elementSelector;
        this._resultSelector = resultSelector;
    }

    *[Symbol.iterator](): Iterator<R> {
        const source = this._source;
        const elementSelector = this._elementSelector;
        const resultSelector = this._resultSelector;
        const map = CreateGroupings(source, this._keySelector, this._elementSelector);
        for (const [key, values] of map) {
            yield resultSelector(key, elementSelector === identity ? FlowHierarchy(values, source) : values);
        }
    }
}