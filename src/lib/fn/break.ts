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

import { assert, GetIterator, FlowHierarchy, ToIterable, CreateSubquery, Registry, GetSource, MakeTuple } from "../internal";
import { Queryable, HierarchyIterable } from "../types";
import { prepend } from "./prepend";
import { consume, ConsumeOptions } from "./consume";
import { empty } from "./empty";

const noCacheAndLeaveOpen: ConsumeOptions = { cacheElements: false, leaveOpen: true };
const cacheAndClose: ConsumeOptions = { cacheElements: true, leaveOpen: false };

/**
 * Creates a tuple whose first element is an `Iterable` containing the first span of
 * elements that do not match the supplied predicate, and whose second element is an `Iterable`
 * containing the remaining elements.
 *
 * The first `Iterable` is eagerly evaluated, while the second `Iterable` is lazily
 * evaluated.
 *
 * @param source A `Queryable` object.
 * @param predicate The predicate used to match elements.
 * @category Scalar
 */
function _break<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, predicate: (element: T) => boolean): [HierarchyIterable<TNode, T>, HierarchyIterable<TNode, T>];
/**
 * Creates a tuple whose first element is an `Iterable` containing the first span of
 * elements that do not match the supplied predicate, and whose second element is an `Iterable`
 * containing the remaining elements.
 *
 * The first `Iterable` is eagerly evaluated, while the second `Iterable` is lazily
 * evaluated.
 *
 * @param source A `Queryable` object.
 * @param predicate The predicate used to match elements.
 * @category Scalar
 */
function _break<T>(source: Queryable<T>, predicate: (element: T) => boolean): [Iterable<T>, Iterable<T>];
function _break<T>(source: Queryable<T>, predicate: (element: T) => boolean): [Iterable<T>, Iterable<T>] {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(predicate, "predicate");
    const prefix: T[] = [];
    const iterator = GetIterator(ToIterable(source));
    for (const value of consume(iterator, noCacheAndLeaveOpen)) {
        if (predicate(value)) {
            const remaining = prepend(consume(iterator, cacheAndClose), value);
            return [
                FlowHierarchy(prefix, source),
                FlowHierarchy(remaining, source)
            ];
        }
        prefix.push(value);
    }
    return [
        FlowHierarchy(prefix, source),
        FlowHierarchy(empty<T>(), source)
    ];
}

export { _break as break };

Registry.Query.registerCustom("break", _break, function (predicate) {
    const [first, rest] = _break(GetSource(this), predicate);
    return MakeTuple(CreateSubquery(this, first), CreateSubquery(this, rest));
});