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
import { PossiblyAsyncHierarchyIterable, AsyncQueryable, AsyncHierarchyIterable } from "../types";
import { exceptByAsync } from './exceptByAsync';
import { identity } from './common';

/**
 * Creates an [[AsyncHierarchyIterable]] with every instance of the specified value removed.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param values The values to exclude.
 * @category Subquery
 */
export function excludeAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, ...values: [T | PromiseLike<T>, ...(T | PromiseLike<T>)[]]): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] with every instance of the specified value removed.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param values The values to exclude.
 * @category Subquery
 */
export function excludeAsync<T>(source: AsyncQueryable<T>, ...values: [T | PromiseLike<T>, ...(T | PromiseLike<T>)[]]): AsyncIterable<T>;
export function excludeAsync<T>(source: AsyncQueryable<T>, ...values: [T | PromiseLike<T>, ...(T | PromiseLike<T>)[]]): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(source, "left");
    return exceptByAsync(source, values, identity);
}
