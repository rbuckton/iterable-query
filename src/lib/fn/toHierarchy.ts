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

import { assert, MakeHierarchyIterable, Registry } from "../internal";
import { Queryable, HierarchyIterable, HierarchyProvider, OrderedIterable, OrderedHierarchyIterable } from "../types";

/**
 * Creates a `HierarchyIterable` using the provided `HierarchyProvider`.
 *
 * @param source A `Queryable` object.
 * @param hierarchy A `HierarchyProvider`.
 * @category Hierarchy
 */
export function toHierarchy<TNode, T extends TNode>(source: OrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): OrderedHierarchyIterable<TNode, T>;
/**
 * Creates a `HierarchyIterable` using the provided `HierarchyProvider`.
 *
 * @param source A `Queryable` object.
 * @param hierarchy A `HierarchyProvider`.
 * @category Hierarchy
 */
export function toHierarchy<TNode, T extends TNode>(source: Queryable<T>, hierarchy: HierarchyProvider<TNode>): HierarchyIterable<TNode, T>;
export function toHierarchy<TNode, T extends TNode>(source: Queryable<T>, hierarchy: HierarchyProvider<TNode>): HierarchyIterable<TNode, T> {
    assert.mustBeQueryable(source, "source");
    assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
    return MakeHierarchyIterable(source, hierarchy);
}

Registry.Query.registerSubquery("toHierarchy", toHierarchy);