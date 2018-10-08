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

import { assert, ToIterable, FlowHierarchy, ToStringTag, Registry } from "../internal";
import { Queryable, HierarchyIterable } from "../types";

/**
 * Creates a subquery containing the first elements that match the supplied predicate.
 *
 * @param source A [[Queryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function takeWhile<TNode, T extends TNode, U extends T>(source: HierarchyIterable<TNode, T>, predicate: (element: T) => element is U): HierarchyIterable<TNode, U>;
/**
 * Creates a subquery containing the first elements that match the supplied predicate.
 *
 * @param source A [[Queryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function takeWhile<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, predicate: (element: T) => boolean): HierarchyIterable<TNode, T>;
/**
 * Creates a subquery containing the first elements that match the supplied predicate.
 *
 * @param source A [[Queryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function takeWhile<T, U extends T>(source: Queryable<T>, predicate: (element: T) => element is U): Iterable<U>;
/**
 * Creates a subquery containing the first elements that match the supplied predicate.
 *
 * @param source A [[Queryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function takeWhile<T>(source: Queryable<T>, predicate: (element: T) => boolean): Iterable<T>;
export function takeWhile<T>(source: Queryable<T>, predicate: (element: T) => boolean): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(predicate, "predicate");
    return FlowHierarchy(new TakeWhileIterable(ToIterable(source), predicate), source);
}

@ToStringTag("TakeWhileIterable")
class TakeWhileIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _predicate: (element: T) => boolean;

    constructor(source: Iterable<T>, predicate: (element: T) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }

    *[Symbol.iterator](): Iterator<T> {
        const predicate = this._predicate;
        for (const element of this._source) {
            if (!predicate(element)) {
                break;
            }
            yield element;
        }
    }
}

Registry.Query.registerSubquery("takeWhile", takeWhile);