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

import { IsDefined } from "../internal";
import { Queryable, HierarchyIterable } from "../types";
import { identity } from './common';
import { filterBy } from './filterBy';

/**
 * Creates a [[HierarchyIterable]] whose elements are neither `null` nor `undefined`.
 *
 * @param source A [[HierarchyIterable]] object.
 * @category Subquery
 */
export function filterDefined<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>): HierarchyIterable<TNode, NonNullable<T>>;
/**
 * Creates a [[HierarchyIterable]] where the selected key for each element is neither `null` nor `undefined`.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @category Subquery
 */
export function filterDefined<TNode, T extends TNode, K>(source: HierarchyIterable<TNode, T>, keySelector: (value: T) => K): HierarchyIterable<TNode, T>;
/**
 * Creates an [[Iterable]] whose elements are neither `null` nor `undefined`.
 *
 * @param source A [[Queryable]] object.
 * @category Subquery
 */
export function filterDefined<T>(source: Queryable<T>): Iterable<NonNullable<T>>;
/**
 * Creates an [[Iterable]] where the selected key for each element is neither `null` nor `undefined`.
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @category Subquery
 */
export function filterDefined<T, K>(source: Queryable<T>, keySelector: (value: T) => K): Iterable<T>;
export function filterDefined<T>(source: Queryable<T>, keySelector: (value: T) => T = identity): Iterable<T> {
    return filterBy(source, keySelector, IsDefined);
}
