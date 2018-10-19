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

import { assert, FlowHierarchy } from "../internal";
import { AsyncQueryable, PossiblyAsyncHierarchyIterable, HierarchyIterable } from "../types";
import { toArrayAsync } from "./toArrayAsync";

/**
 * Eagerly evaluate a [[HierarchyIterable]] or [[AsyncHierarchyIterable]], returning a [[Promise]]
 * for a [[HierarchyIterable]] for the resolved elements of the original sequence.
 * 
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @category Scalar
 */
export async function evalAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): Promise<HierarchyIterable<TNode, T>>;
/**
 * Eagerly evaluate an [[AsyncQueryable]], returning a [[Promise]] for an [[Iterable]] for the 
 * resolved elements of the original sequence.
 * 
 * @param An [[AsyncQueryable]] object.
 * @category Scalar
 */
export async function evalAsync<T>(source: AsyncQueryable<T>): Promise<Iterable<T>>;
export async function evalAsync<T>(source: AsyncQueryable<T>): Promise<Iterable<T>> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    return FlowHierarchy(await toArrayAsync(source), source);
}