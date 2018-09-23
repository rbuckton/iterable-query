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

import { assert, Identity, SelectGroupingKey, ToPossiblyAsyncIterable, CreateGroupingsAsync, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncQueryable, PossiblyAsyncIterable } from "../types";
import { Lookup } from "../lookup";
import { union } from "../fn/union";
import { map } from "../fn/map";
import { defaultIfEmpty } from "../fn/defaultIfEmpty";

/**
 * Creates a subquery for the correlated elements between an outer `Queryable` object and an inner 
 * `Queryable` object.
 *
 * @param outer A `Queryable` object.
 * @param inner A `Queryable` object.
 * @param outerKeySelector A callback used to select the key for an element in this Query.
 * @param innerKeySelector A callback used to select the key for an element in the other Queryable.
 * @param resultSelector A callback used to select the result for the correlated elements.
 */
export function fullJoinAsync<O, I, K, R>(outer: PossiblyAsyncQueryable<O>, inner: PossiblyAsyncQueryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O | undefined, inner: I | undefined) => R): AsyncIterable<R> {
    assert.mustBePossiblyAsyncQueryable(outer, "outer");
    assert.mustBePossiblyAsyncQueryable(inner, "inner");
    assert.mustBeFunction(outerKeySelector, "outerKeySelector");
    assert.mustBeFunction(innerKeySelector, "innerKeySelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
    return new AsyncFullJoinIterable(ToPossiblyAsyncIterable(outer), ToPossiblyAsyncIterable(inner), outerKeySelector, innerKeySelector, resultSelector);
}

@ToStringTag("AsyncFullJoinIterable")
class AsyncFullJoinIterable<O, I, K, R> implements AsyncIterable<R> {
    private _outer: PossiblyAsyncIterable<O>;
    private _inner: PossiblyAsyncIterable<I>;
    private _outerKeySelector: (element: O) => K;
    private _innerKeySelector: (element: I) => K;
    private _resultSelector: (outer: O | undefined, inner: I | undefined) => R;

    constructor(outer: PossiblyAsyncIterable<O>, inner: PossiblyAsyncIterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O | undefined, inner: I | undefined) => R) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<R> {
        const resultSelector = this._resultSelector;
        const outerLookup = new Lookup(await CreateGroupingsAsync(this._outer, this._outerKeySelector, Identity));
        const innerLookup = new Lookup(await CreateGroupingsAsync(this._inner, this._innerKeySelector, Identity));
        const keys = union(map(outerLookup, SelectGroupingKey), map(innerLookup, SelectGroupingKey));
        for (const key of keys) {
            const outer = defaultIfEmpty<O | undefined>(outerLookup.get(key), undefined);
            const inner = defaultIfEmpty<I | undefined>(innerLookup.get(key), undefined);
            for (const outerElement of outer) {
                for (const innerElement of inner) {
                    yield resultSelector(outerElement, innerElement);
                }
            }
        }
    }
}

Registry.AsyncQuery.registerSubquery("fullJoin", fullJoinAsync);