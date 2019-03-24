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
import { Queryable, HierarchyIterable } from "../types";
import { intersectBy } from './intersectBy';
import { identity } from './common';
import { Equaler } from 'equatable';

/**
 * Creates a [[HierarchyIterable]] for the set intersection of a [[HierarchyIterable]] object and a [[Queryable]] object.
 *
 * @param left A [[HierarchyIterable]] object.
 * @param right A [[Queryable]] object.
 * @param equaler An [[Equaler]] object used to compare equality.
 * @category Subquery
 */
export function intersect<TNode, T extends TNode>(left: HierarchyIterable<TNode, T>, right: Queryable<T>, equaler?: Equaler<T>): HierarchyIterable<TNode, T>;
/**
 * Creates a [[HierarchyIterable]] for the set intersection of a [[Queryable]] object and a [[HierarchyIterable]] object.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[HierarchyIterable]] object.
 * @param equaler An [[Equaler]] object used to compare equality.
 * @category Subquery
 */
export function intersect<TNode, T extends TNode>(left: Queryable<T>, right: HierarchyIterable<TNode, T>, equaler?: Equaler<T>): HierarchyIterable<TNode, T>;
/**
 * Creates an [[Iterable]] for the set intersection of two [[Queryable]] objects.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param equaler An [[Equaler]] object used to compare equality.
 * @category Subquery
 */
export function intersect<T>(left: Queryable<T>, right: Queryable<T>, equaler?: Equaler<T>): Iterable<T>;
export function intersect<T>(left: Queryable<T>, right: Queryable<T>, equaler?: Equaler<T>): Iterable<T> {
    assert.mustBeQueryable(left, "left");
    assert.mustBeQueryable(right, "right");
    assert.mustBeEqualerOrUndefined(equaler, "equaler");
    return intersectBy(left, right, identity, equaler);
}