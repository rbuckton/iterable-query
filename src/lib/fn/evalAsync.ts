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

import { assert, FlowHierarchy, Registry, CreateSubquery, GetAsyncSource } from "../internal";
import { PossiblyAsyncQueryable, PossiblyAsyncHierarchyIterable, HierarchyIterable } from "../types";
import { toArrayAsync } from "./toArrayAsync";

export function evalAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): Promise<HierarchyIterable<TNode, T>>;
export function evalAsync<T>(source: PossiblyAsyncQueryable<T>): Promise<Iterable<T>>;
export async function evalAsync<T>(source: PossiblyAsyncQueryable<T>): Promise<Iterable<T>> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    return FlowHierarchy(await toArrayAsync(source), source);
}

Registry.AsyncQuery.registerCustom("eval", evalAsync, async function () {
    return CreateSubquery(this, await evalAsync(GetAsyncSource(this)));
});