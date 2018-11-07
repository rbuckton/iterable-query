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

import { assert, ToPossiblyAsyncIterable, CreateGroupingsAsync, ToStringTag } from "../internal";
import { AsyncQueryable, PossiblyAsyncIterable } from "../types";
import { empty } from "../fn/empty";
import { identity } from "./common";

/**
 * Creates a grouped [[AsyncIterable]] for the correlated elements between an outer [[AsyncQueryable]] object and an inner [[AsyncQueryable]] object.
 *
 * @param outer An [[AsyncQueryable]] object.
 * @param inner An [[AsyncQueryable]] object.
 * @param outerKeySelector A callback used to select the key for an element in `outer`.
 * @param innerKeySelector A callback used to select the key for an element in `inner`.
 * @param resultSelector A callback used to select the result for the correlated elements.
 * @category Join
 */
export function groupJoinAsync<O, I, K, R>(outer: AsyncQueryable<O>, inner: AsyncQueryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: Iterable<I>) => R | PromiseLike<R>): AsyncIterable<R> {
    assert.mustBeAsyncQueryable<O>(outer, "outer");
    assert.mustBeAsyncQueryable<I>(inner, "inner");
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
    private _resultSelector: (outer: O, inner: Iterable<I>) => R | PromiseLike<R>;

    constructor(outer: PossiblyAsyncIterable<O>, inner: PossiblyAsyncIterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: Iterable<I>) => R | PromiseLike<R>) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<R> {
        const outerKeySelector = this._outerKeySelector;
        const resultSelector = this._resultSelector;
        const map = await CreateGroupingsAsync(this._inner, this._innerKeySelector, identity);
        for await (const outerElement of this._outer) {
            const outerKey = outerKeySelector(outerElement);
            const innerElements = map.get(outerKey) || empty<I>();
            yield resultSelector(outerElement, innerElements);
        }
    }
}