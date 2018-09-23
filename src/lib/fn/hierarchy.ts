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

import { assert, Registry, MakeHierarchyIterable } from "../internal";
import { HierarchyProvider, HierarchyIterable } from "../types";
import { once } from "./once";

/**
 * Creates an `Iterable` that iterates the elements from one of two sources based on the result of a
 * lazily evaluated condition.
 *
 * @param condition A callback used to choose a source.
 * @param thenQueryable The source to use when the callback evaluates to `true`.
 * @param elseQueryable The source to use when the callback evaluates to `false`.
 */
export function hierarchy<TNode, T extends TNode>(root: T, hierarchy: HierarchyProvider<TNode>): HierarchyIterable<TNode, T> {
    assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
    return MakeHierarchyIterable(once(root), hierarchy);
}

Registry.Query.registerStatic("hierarchy", hierarchy);