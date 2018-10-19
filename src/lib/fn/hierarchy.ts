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

import { assert, MakeHierarchyIterable } from "../internal";
import { HierarchyProvider, HierarchyIterable } from "../types";
import { once } from "./once";

/**
 * Creates a [[HierarchyIterable]] for a root element using the provided [[HierarchyProvider]].
 *
 * @param root The root element.
 * @param hierarchy A [[HierarchyProvider]] object.
 * @category Hierarchy
 */
export function hierarchy<TNode, T extends TNode>(root: T, hierarchy: HierarchyProvider<TNode>): HierarchyIterable<TNode, T> {
    assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
    return MakeHierarchyIterable(once(root), hierarchy);
}