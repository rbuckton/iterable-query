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

import { assert, MakeTuple, GetAsyncIterator, AsyncIteratorClose, ToPossiblyAsyncIterable, ToStringTag } from "../internal";
import { AsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates a subquery that combines two [[AsyncQueryable]] objects by combining elements
 * in tuples.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @category Join
 */
export function zipAsync<T, U>(left: AsyncQueryable<T>, right: AsyncQueryable<U>): AsyncIterable<[T, U]>;
/**
 * Creates a subquery that combines two [[AsyncQueryable]] objects by combining elements
 * using the supplied callback.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param selector A callback used to combine two elements.
 * @category Join
 */
export function zipAsync<T, U, R>(left: AsyncQueryable<T>, right: AsyncQueryable<U>, selector: (left: T, right: U) => R | PromiseLike<R>): AsyncIterable<R>;
export function zipAsync<T, U, R>(left: AsyncQueryable<T>, right: AsyncQueryable<U>, selector: (left: T, right: U) => PromiseLike<[T, U] | R> | [T, U] | R = MakeTuple): AsyncIterable<[T, U] | R> {
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<U>(right, "right");
    assert.mustBeFunction(selector, "selector");
    return new AsyncZipIterable(ToPossiblyAsyncIterable(left), ToPossiblyAsyncIterable(right), selector);
}

@ToStringTag("AsyncZipIterable")
class AsyncZipIterable<T, U, R> implements AsyncIterable<R> {
    private _left: PossiblyAsyncIterable<T>;
    private _right: PossiblyAsyncIterable<U>;
    private _selector: (left: T, right: U) => PromiseLike<R> | R;

    constructor(left: PossiblyAsyncIterable<T>, right: PossiblyAsyncIterable<U>, selector: (left: T, right: U) => PromiseLike<R> | R) {
        this._left = left;
        this._right = right;
        this._selector = selector;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<R> {
        const selector = this._selector;
        const leftIterator: AsyncIterator<T> = GetAsyncIterator(this._left);
        let leftDone = false;
        let leftValue: T;
        try {
            const rightIterator: AsyncIterator<U> = GetAsyncIterator(this._right);
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