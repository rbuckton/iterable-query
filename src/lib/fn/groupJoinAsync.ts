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

import { assert, Identity, ToPossiblyAsyncIterable, CreateGroupingsAsync, ToStringTag, Registry, GetAsyncSource, CreateSubquery, CreateAsyncSubquery } from "../internal";
import { PossiblyAsyncQueryable, PossiblyAsyncIterable } from "../types";
import { empty } from "../fn/empty";

/**
 * Creates a grouped subquery for the correlated elements between an outer `Queryable` object and an inner `Queryable` object.
 *
 * @param outer A `Queryable` object.
 * @param inner A `Queryable` object.
 * @param outerKeySelector A callback used to select the key for an element in this Query.
 * @param innerKeySelector A callback used to select the key for an element in the other Queryable.
 * @param resultSelector A callback used to select the result for the correlated elements.
 */
export function groupJoinAsync<O, I, K, R>(outer: PossiblyAsyncQueryable<O>, inner: PossiblyAsyncQueryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: Iterable<I>) => R): AsyncIterable<R> {
    assert.mustBePossiblyAsyncQueryable(outer, "outer");
    assert.mustBePossiblyAsyncQueryable(inner, "inner");
    assert.mustBeFunction(outerKeySelector, "outerKeySelector");
    assert.mustBeFunction(innerKeySelector, "innerKeySelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
    return new AsyncGroupJoinIterable(ToPossiblyAsyncIterable(outer), ToPossiblyAsyncIterable(inner), outerKeySelector, innerKeySelector, resultSelector);
}

@ToStringTag("AsyncGroupJoinIterable")
class AsyncGroupJoinIterable<O, I, K, R> implements AsyncIterable<R> {
    private _outer: PossiblyAsyncIterable<O>;
    private _inner: PossiblyAsyncIterable<I>;
    private _outerKeySelector: (element: O) => K;
    private _innerKeySelector: (element: I) => K;
    private _resultSelector: (outer: O, inner: Iterable<I>) => R;

    constructor(outer: PossiblyAsyncIterable<O>, inner: PossiblyAsyncIterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: Iterable<I>) => R) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<R> {
        const outerKeySelector = this._outerKeySelector;
        const resultSelector = this._resultSelector;
        const map = await CreateGroupingsAsync(this._inner, this._innerKeySelector, Identity);
        for await (const outerElement of this._outer) {
            const outerKey = outerKeySelector(outerElement);
            const innerElements = map.get(outerKey) || empty<I>();
            yield resultSelector(outerElement, innerElements);
        }
    }
}

Registry.AsyncQuery.registerCustom("groupJoin", groupJoinAsync, function (inner, outerKeySelector, innerKeySelector, resultSelector) {
    assert.mustBeAsyncQuerySource(this, "this");
    assert.mustBePossiblyAsyncQueryable(inner, "inner");
    assert.mustBeFunction(outerKeySelector, "outerKeySelector");
    assert.mustBeFunction(innerKeySelector, "innerKeySelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
    return CreateAsyncSubquery(this, new AsyncGroupJoinIterable(ToPossiblyAsyncIterable(GetAsyncSource(this)), ToPossiblyAsyncIterable(inner), outerKeySelector, innerKeySelector, (outer, inner) => resultSelector(outer, CreateSubquery(this, inner))));
});