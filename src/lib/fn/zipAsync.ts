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

import { assert, MakeTuple, GetAsyncIterator, ToAsyncIterable, AsyncIteratorClose, ToPossiblyAsyncIterable, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncQueryable, PossiblyAsyncIterable, PossiblyAsyncIterator } from "../types";

/**
 * Creates a subquery that combines two Queryables by combining elements
 * in tuples.
 *
 * @param left A Queryable.
 * @param right A Queryable.
 */
export function zipAsync<T, U>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<U>): AsyncIterable<[T, U]>;

/**
 * Creates a subquery that combines two Queryables by combining elements
 * using the supplied callback.
 *
 * @param left A Queryable.
 * @param right A Queryable.
 * @param selector A callback used to combine two elements.
 */
export function zipAsync<T, U, R>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<U>, selector: (left: T, right: U) => R): AsyncIterable<R>;

/**
 * Creates a subquery that combines two Queryables by combining elements
 * using the supplied callback.
 *
 * @param left A Queryable.
 * @param right A Queryable.
 * @param selector An optional callback used to combine two elements.
 */
export function zipAsync<T, U, R>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<U>, selector: (left: T, right: U) => [T, U] | R = MakeTuple): AsyncIterable<[T, U] | R> {
    assert.mustBePossiblyAsyncQueryable(left, "left");
    assert.mustBePossiblyAsyncQueryable(right, "right");
    assert.mustBeFunction(selector, "selector");
    return new AsyncZipIterable(ToPossiblyAsyncIterable(left), ToPossiblyAsyncIterable(right), selector);
}

@ToStringTag("AsyncZipIterable")
class AsyncZipIterable<T, U, R> implements AsyncIterable<R> {
    private _left: PossiblyAsyncIterable<T>;
    private _right: PossiblyAsyncIterable<U>;
    private _selector: (left: T, right: U) => R;

    constructor(left: PossiblyAsyncIterable<T>, right: PossiblyAsyncIterable<U>, selector: (left: T, right: U) => R) {
        this._left = left;
        this._right = right;
        this._selector = selector;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<R> {
        const selector = this._selector;
        const leftIterator: PossiblyAsyncIterator<T> = GetAsyncIterator(this._left);
        let leftDone = false;
        let leftValue: T;
        try {
            const rightIterator: PossiblyAsyncIterator<U> = GetAsyncIterator(this._right);
            let rightDone = false;
            let rightValue: U;
            try {
                for (;;) {
                    ({ done: leftDone, value: leftValue } = await leftIterator.next());
                    ({ done: rightDone, value: rightValue } = await rightIterator.next());
                    if (leftDone || rightDone) break;
                    yield selector(leftValue, rightValue);
                }
            }
            finally {
                if (!rightDone) await AsyncIteratorClose(rightIterator);
            }
        }
        finally {
            if (!leftDone) await AsyncIteratorClose(leftIterator);
        }
    }
}

Registry.AsyncQuery.registerSubquery("zip", zipAsync);