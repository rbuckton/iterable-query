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
import { AsyncHierarchyIterable, PossiblyAsyncHierarchyIterable, AsyncQueryable } from "../types";
import { filterByAsync } from './filterByAsync';
import { identity } from './common';

/**
 * Creates an [[AsyncHierarchyIterable]] whose elements are neither `null` nor `undefined`.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @category Subquery
 */
export function filterDefinedAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, NonNullable<T>>;
/**
 * Creates an [[AsyncHierarchyIterable]] where the selected key for each element is neither `null` nor `undefined`.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @category Subquery
 */
export function filterDefinedAsync<TNode, T extends TNode, K>(source: PossiblyAsyncHierarchyIterable<TNode, T>, keySelector: (value: T) => K): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] whose elements are neither `null` nor `undefined`.
 *
 * @param source An [[AsyncQueryable]] object.
 * @category Subquery
 */
export function filterDefinedAsync<T>(source: AsyncQueryable<T>): AsyncIterable<NonNullable<T>>;
/**
 * Creates an [[AsyncIterable]] where the selected key for each element is neither `null` nor `undefined`.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @category Subquery
 */
export function filterDefinedAsync<T, K>(source: AsyncQueryable<T>, keySelector: (value: T) => K): AsyncIterable<T>;
export function filterDefinedAsync<T>(source: AsyncQueryable<T>, keySelector: (value: T) => T = identity): AsyncIterable<T> {
    return filterByAsync(source, keySelector, IsDefined);
}