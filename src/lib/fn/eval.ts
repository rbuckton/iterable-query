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

import { assert, FlowHierarchy, Registry } from "../internal";
import { Queryable, HierarchyIterable } from "../types";
import { toArray } from "./toArray";

/**
 * Eagerly evaluate a `Queryable`, returning a new `Iterable`.
 * @category Scalar
 */
function _eval<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>): HierarchyIterable<TNode, T>;
/**
 * Eagerly evaluate a `Queryable`, returning a new `Iterable`.
 * @category Scalar
 */
function _eval<T>(source: Queryable<T>): Iterable<T>;
function _eval<T>(source: Queryable<T>): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    return FlowHierarchy(toArray(source), source);
}

export { _eval as eval };

Registry.Query.registerSubquery("eval", _eval);