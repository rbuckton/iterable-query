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
import { exceptBy } from './exceptBy';
import { identity } from './common';

/**
 * Creates a [[HierarchyIterable]] with every instance of the specified value removed.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param values The values to exclude.
 * @category Subquery
 */
export function exclude<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, ...values: [T, ...T[]]): HierarchyIterable<TNode, T>;
/**
 * Creates an [[Iterable]] with every instance of the specified value removed.
 *
 * @param source A [[Queryable]] object.
 * @param values The values to exclude.
 * @category Subquery
 */
export function exclude<T>(source: Queryable<T>, ...values: [T, ...T[]]): Iterable<T>;
export function exclude<T>(source: Queryable<T>, ...values: [T, ...T[]]): Iterable<T> {
    assert.mustBeQueryable(source, "left");
    return exceptBy(source, values, identity);
}