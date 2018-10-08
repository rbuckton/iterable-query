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

import { assert, ToIterable, CreateGroupings, Identity, ToStringTag, Registry, CreateSubquery, GetSource } from "../internal";
import { Queryable } from "../types";
import { empty } from "./empty";

/**
 * Creates a grouped [[Iterable]] for the correlated elements between an outer [[Queryable]] object and an inner [[Queryable]] object.
 *
 * @param outer A [[Queryable]] object.
 * @param inner A [[Queryable]] object.
 * @param outerKeySelector A callback used to select the key for an element in `outer`.
 * @param innerKeySelector A callback used to select the key for an element in `inner`.
 * @param resultSelector A callback used to select the result for the correlated elements.
 * @category Join
 */
export function groupJoin<O, I, K, R>(outer: Queryable<O>, inner: Queryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: Iterable<I>) => R): Iterable<R> {
    assert.mustBeQueryable(outer, "outer");
    assert.mustBeQueryable(inner, "inner");
    assert.mustBeFunction(outerKeySelector, "outerKeySelector");
    assert.mustBeFunction(innerKeySelector, "innerKeySelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
    return new GroupJoinIterable(ToIterable(outer), ToIterable(inner), outerKeySelector, innerKeySelector, resultSelector);
}

@ToStringTag("GroupJoinIterable")
class GroupJoinIterable<O, I, K, R> implements Iterable<R> {
    private _outer: Iterable<O>;
    private _inner: Iterable<I>;
    private _outerKeySelector: (element: O) => K;
    private _innerKeySelector: (element: I) => K;
    private _resultSelector: (outer: O, inner: Iterable<I>) => R;

    constructor(outer: Iterable<O>, inner: Iterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: Iterable<I>) => R) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }

    *[Symbol.iterator](): Iterator<R> {
        const outerKeySelector = this._outerKeySelector;
        const resultSelector = this._resultSelector;
        const map = CreateGroupings(this._inner, this._innerKeySelector, Identity);
        for (const outerElement of this._outer) {
            const outerKey = outerKeySelector(outerElement);
            const innerElements = map.get(outerKey) || empty<I>();
            yield resultSelector(outerElement, innerElements);
        }
    }
}

Registry.Query.registerCustom("groupJoin", groupJoin, function (inner, outerKeySelector, innerKeySelector, resultSelector) {
    assert.mustBeQuerySource(this, "this");
    assert.mustBeQueryable(inner, "inner");
    assert.mustBeFunction(outerKeySelector, "outerKeySelector");
    assert.mustBeFunction(innerKeySelector, "innerKeySelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
    return CreateSubquery(this, new GroupJoinIterable(ToIterable(GetSource(this)), ToIterable(inner), outerKeySelector, innerKeySelector, (outer, inner) => resultSelector(outer, CreateSubquery(this, inner))));
});