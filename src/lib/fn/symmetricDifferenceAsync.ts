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
import { PossiblyAsyncHierarchyIterable, AsyncQueryable, AsyncHierarchyIterable } from "../types";
import { symmetricDifferenceByAsync } from './symmetricDifferenceByAsync';
import { identity } from './common';
import { Equaler } from '@esfx/equatable';

/**
 * Creates a subquery for the symmetric difference between two [[Queryable]] objects.
 * The result is an [[AsyncIterable]] containings the elements that exist in only left or right, but not
 * in both.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equaler An [[Equaler]] object used to compare equality.
 * @category Subquery
 */
export function symmetricDifferenceAsync<TNode, T extends TNode>(left: PossiblyAsyncHierarchyIterable<TNode, T>, right: AsyncQueryable<T>, equaler?: Equaler<T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the symmetric difference between two [[Queryable]] objects.
 * The result is an [[AsyncIterable]] containings the elements that exist in only left or right, but not
 * in both.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equaler An [[Equaler]] object used to compare equality.
 * @category Subquery
 */
export function symmetricDifferenceAsync<TNode, T extends TNode>(left: AsyncQueryable<T>, right: PossiblyAsyncHierarchyIterable<TNode, T>, equaler?: Equaler<T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates a subquery for the symmetric difference between two [[Queryable]] objects.
 * The result is an [[AsyncIterable]] containings the elements that exist in only left or right, but not
 * in both.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equaler An [[Equaler]] object used to compare equality.
 * @category Subquery
 */
export function symmetricDifferenceAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, equaler?: Equaler<T>): AsyncIterable<T>;
export function symmetricDifferenceAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, equaler?: Equaler<T>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<T>(right, "right");
    assert.mustBeEqualerOrUndefined(equaler, "equaler");
    return symmetricDifferenceByAsync(left, right, identity, equaler);
}