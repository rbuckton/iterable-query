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

import { assert, ToIterable, CreateGroupings, Identity, CreateGrouping, ToStringTag, CreateSubquery, Registry, GetSource, FlowHierarchy } from "../internal";
import { Queryable, HierarchyIterable, HierarchyGrouping, Grouping } from "../types";

/**
 * Groups each element of this Query by its key.
 *
 * @param keySelector A callback used to select the key for an element.
 * @category Subquery
 */
export function groupBy<TNode, T extends TNode, K>(source: HierarchyIterable<TNode, T>, keySelector: (element: T) => K): Iterable<HierarchyGrouping<K, TNode, T>>;
/**
 * Groups each element of this Query by its key.
 *
 * @param keySelector A callback used to select the key for an element.
 * @category Subquery
 */
export function groupBy<T, K>(source: Queryable<T>, keySelector: (element: T) => K): Iterable<Grouping<K, T>>;
/**
 * Groups each element by its key.
 *
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 * @category Subquery
 */
export function groupBy<T, K, V>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Iterable<Grouping<K, V>>;
/**
 * Groups each element by its key.
 *
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 * @param resultSelector A callback used to select a result from a group.
 * @category Subquery
 */
export function groupBy<T, K, V, R>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Iterable<V>) => R): Iterable<R>;
export function groupBy<T, K, V, R>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => T | V = Identity, resultSelector: (key: K, elements: Iterable<T | V>) => Grouping<K, T | V> | R = CreateGrouping) {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
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
            yield resultSelector(key, elementSelector === Identity ? FlowHierarchy(values, source) : values);
        }
    }
}

Registry.Query.registerCustom("groupBy", groupBy, function (keySelector, elementSelector = Identity, resultSelector = CreateGrouping) {
    assert.mustBeQuerySource(this, "this");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
    return CreateSubquery(this, new GroupByIterable(
        ToIterable(GetSource(this)),
        keySelector,
        elementSelector,
        resultSelector === CreateGrouping ? CreateGrouping : (key, values) => resultSelector(key, CreateSubquery(this, values))));
});