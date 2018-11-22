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
import { intersectByAsync } from './intersectByAsync';
import { identity } from './common';

/**
 * Creates a [[HierarchyIterable]] for the set intersection of a [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object and an [[AsyncQueryable]] object.
 *
 * @param left A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @category Subquery
 */
export function intersectAsync<TNode, T extends TNode>(left: PossiblyAsyncHierarchyIterable<TNode, T>, right: AsyncQueryable<T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates a [[HierarchyIterable]] for the set intersection of an [[AsyncQueryable]] object and a [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @category Subquery
 */
export function intersectAsync<TNode, T extends TNode>(left: AsyncQueryable<T>, right: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] for the set intersection of two [[AsyncQueryable]] objects.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @category Subquery
 */
export function intersectAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>): AsyncIterable<T>;
export function intersectAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<T>(right, "right");
    return intersectByAsync(left, right, identity);
}