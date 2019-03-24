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
import { exceptByAsync } from './exceptByAsync';
import { identity } from './common';
import { Equaler } from 'equatable';

/**
 * Creates an [[AsyncHierarchyIterable]] for the set difference between a [[HierarchyIterable]] or an [[AsyncHierarchyIterable]] and an [[AsyncQueryable]] object.
 *
 * @param left A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equaler An [[Equaler]] object used to compare equality.
 * @category Subquery
 */
export function exceptAsync<TNode, T extends TNode>(left: PossiblyAsyncHierarchyIterable<TNode, T>, right: AsyncQueryable<T>, equaler?: Equaler<T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] for the set difference between two [[AsyncQueryable]] objects.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equaler An [[Equaler]] object used to compare equality.
 * @category Subquery
 */
export function exceptAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, equaler?: Equaler<T>): AsyncIterable<T>;
export function exceptAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, equaler?: Equaler<T>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<T>(right, "right");
    assert.mustBeEqualerOrUndefined(equaler, "equaler");
    return exceptByAsync(left, right, identity, equaler);
}