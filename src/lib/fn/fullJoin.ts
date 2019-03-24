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

import { assert, ToIterable, CreateGroupings, SelectGroupingKey, ToStringTag} from "../internal";
import { Queryable } from "../types";
import { union } from "./union";
import { map } from "./map";
import { Lookup } from "../lookup";
import { defaultIfEmpty } from "./defaultIfEmpty";
import { identity } from "./common";
import { Equaler } from 'equatable';

/**
 * Creates an [[Iterable]] for the correlated elements between an outer [[Queryable]] object and an inner
 * [[Queryable]] object.
 *
 * @param outer A [[Queryable]] object.
 * @param inner A [[Queryable]] object.
 * @param outerKeySelector A callback used to select the key for an element in `outer`.
 * @param innerKeySelector A callback used to select the key for an element in `inner`.
 * @param resultSelector A callback used to select the result for the correlated elements.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Join
 */
export function fullJoin<O, I, K, R>(outer: Queryable<O>, inner: Queryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O | undefined, inner: I | undefined) => R, keyEqualer?: Equaler<K>): Iterable<R> {
    assert.mustBeQueryable(outer, "outer");
    assert.mustBeQueryable(inner, "inner");
    assert.mustBeFunction(outerKeySelector, "outerKeySelector");
    assert.mustBeFunction(innerKeySelector, "innerKeySelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
    assert.mustBeEqualerOrUndefined(keyEqualer, "keyEqualer");
    return new FullJoinIterable(ToIterable(outer), ToIterable(inner), outerKeySelector, innerKeySelector, resultSelector, keyEqualer);
}

@ToStringTag("FullJoinIterable")
class FullJoinIterable<O, I, K, R> implements Iterable<R> {
    private _outer: Iterable<O>;
    private _inner: Iterable<I>;
    private _outerKeySelector: (element: O) => K;
    private _innerKeySelector: (element: I) => K;
    private _resultSelector: (outer: O | undefined, inner: I | undefined) => R;
    private _keyEqualer?: Equaler<K>

    constructor(outer: Iterable<O>, inner: Iterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O | undefined, inner: I | undefined) => R, keyEqualer?: Equaler<K>) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
        this._keyEqualer = keyEqualer;
    }

    *[Symbol.iterator](): Iterator<R> {
        const resultSelector = this._resultSelector;
        const outerLookup = new Lookup(CreateGroupings(this._outer, this._outerKeySelector, identity, this._keyEqualer));
        const innerLookup = new Lookup(CreateGroupings(this._inner, this._innerKeySelector, identity, this._keyEqualer));
        const keys = union(map(outerLookup, SelectGroupingKey), map(innerLookup, SelectGroupingKey), this._keyEqualer);
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
