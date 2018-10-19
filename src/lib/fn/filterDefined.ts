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

import { Registry, IsDefined } from "../internal";
import { Queryable, HierarchyIterable } from "../types";
import { filter } from "./filter";

/**
 * Creates a [[HierarchyIterable]] whose elements are neither `null` nor `undefined`.
 *
 * @param source A [[HierarchyIterable]] object.
 * @category Subquery
 */
export function filterDefined<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>): HierarchyIterable<TNode, NonNullable<T>>;
/**
 * Creates an [[Iterable]] whose elements are neither `null` nor `undefined`.
 *
 * @param source A [[Queryable]] object.
 * @category Subquery
 */
export function filterDefined<T>(source: Queryable<T>): Iterable<NonNullable<T>>;
export function filterDefined<T>(source: Queryable<T>): Iterable<NonNullable<T>> {
    return filter(source, IsDefined);
}

Registry.Query.registerSubquery("filterDefined", filterDefined);