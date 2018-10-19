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

import { assert, MakeAsyncHierarchyIterable } from "../internal";
import { HierarchyProvider, AsyncHierarchyIterable } from "../types";
import { onceAsync } from "./onceAsync";

/**
 * Creates an [[AsyncHierarchyIterable]] for a resolved root element using the provided [[HierarchyProvider]].
 *
 * @param root The root element.
 * @param hierarchy A [[HierarchyProvider]] object.
 * @category Hierarchy
 */
export function hierarchyAsync<TNode, T extends TNode>(root: PromiseLike<T> | T, hierarchy: HierarchyProvider<TNode>): AsyncHierarchyIterable<TNode, T> {
    assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
    return MakeAsyncHierarchyIterable(onceAsync(root), hierarchy);
}