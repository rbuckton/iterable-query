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

import { assert, MakeAsyncHierarchyIterable, Registry } from "../internal";
import { HierarchyProvider, PossiblyAsyncQueryable, AsyncHierarchyIterable, AsyncOrderedHierarchyIterable, PossiblyAsyncOrderedIterable } from "../types";

export function toHierarchyAsync<TNode, T extends TNode>(source: PossiblyAsyncOrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): AsyncOrderedHierarchyIterable<TNode, T>;
export function toHierarchyAsync<TNode, T extends TNode>(source: PossiblyAsyncQueryable<T>, hierarchy: HierarchyProvider<TNode>): AsyncHierarchyIterable<TNode, T>;
export function toHierarchyAsync<TNode, T extends TNode>(source: PossiblyAsyncQueryable<T>, hierarchy: HierarchyProvider<TNode>): AsyncHierarchyIterable<TNode, T> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
    return MakeAsyncHierarchyIterable(source, hierarchy);
}

Registry.AsyncQuery.registerSubquery("toHierarchy", toHierarchyAsync);