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

import { assert, ToIterable, FlowHierarchy, ToStringTag} from "../internal";
import { Queryable, HierarchyIterable } from "../types";

/**
 * Creates a [[HierarchyIterable]] where the selected key for each element matches the supplied predicate.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @param predicate A callback used to match each key.
 * @category Subquery
 */
export function filterBy<TNode, T extends TNode, K>(source: HierarchyIterable<TNode, T>, keySelector: (element: T) => K, predicate: (key: K, offset: number) => boolean): HierarchyIterable<TNode, T>;
/**
 * Creates an [[Iterable]] where the selected key for each element matches the supplied predicate.
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @param predicate A callback used to match each key.
 * @category Subquery
 */
export function filterBy<T, K>(source: Queryable<T>, keySelector: (element: T) => K, predicate: (key: K, offset: number) => boolean): Iterable<T>;
export function filterBy<T, K>(source: Queryable<T>, keySelector: (element: T) => K, predicate: (key: K, offset: number) => boolean): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(predicate, "predicate");
    return FlowHierarchy(new FilterByIterable(ToIterable(source), keySelector, predicate), source);
}

@ToStringTag("FilterByIterable")
class FilterByIterable<T, K> implements Iterable<T> {
    private _source: Iterable<T>;
    private _keySelector: (element: T) => K;
    private _predicate: (key: K, offset: number) => boolean;

    constructor(source: Iterable<T>, keySelector: (element: T) => K, predicate: (key: K, offset: number) => boolean) {
        this._source = source;
        this._keySelector = keySelector;
        this._predicate = predicate;
    }

    *[Symbol.iterator](): Iterator<T> {
        const keySelector = this._keySelector;
        const predicate = this._predicate;
        let offset = 0;
        for (const element of this._source) {
            if (predicate(keySelector(element), offset++)) {
                yield element;
            }
        }
    }
}
