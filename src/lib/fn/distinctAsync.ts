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

import { assert } from "../internal";
import { AsyncHierarchyIterable, PossiblyAsyncHierarchyIterable, AsyncQueryable } from "../types";
import { identity } from "./common";
import { Equaler } from '@esfx/equatable';
import { distinctByAsync } from './distinctByAsync';

/**
 * Creates an [[AsyncHierarchyIterable]] for the distinct elements of `source`.
 * @category Subquery
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param equaler An [[Equaler]] object used to compare element equality.
 */
export function distinctAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, equaler?: Equaler<T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] for the distinct elements of source.
 * @category Subquery
 *
 * @param source An [[AsyncQueryable]] object.
 * @param equaler An [[Equaler]] object used to compare element equality.
 */
export function distinctAsync<T>(source: AsyncQueryable<T>, equaler?: Equaler<T>): AsyncIterable<T>;
export function distinctAsync<T>(source: AsyncQueryable<T>, equaler?: Equaler<T>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable(source, "source");
    assert.mustBeEqualerOrUndefined(equaler, "equaler");
    return distinctByAsync(source, identity, equaler);
}