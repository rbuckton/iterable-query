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

import { assert, MakeTuple, GetIterator, IteratorClose, ToIterable, ToStringTag} from "../internal";
import { Queryable } from "../types";

/**
 * Creates a subquery that combines two [[Queryable]] objects by combining elements
 * in tuples.
 *
 * @param left A [[Queryable]].
 * @param right A [[Queryable]].
 * @category Join
 */
export function zip<T, U>(left: Queryable<T>, right: Queryable<U>): Iterable<[T, U]>;
/**
 * Creates a subquery that combines two [[Queryable]] objects by combining elements
 * using the supplied callback.
 *
 * @param left A [[Queryable]].
 * @param right A [[Queryable]].
 * @param selector A callback used to combine two elements.
 * @category Join
 */
export function zip<T, U, R>(left: Queryable<T>, right: Queryable<U>, selector: (left: T, right: U) => R): Iterable<R>;
export function zip<T, U, R>(left: Queryable<T>, right: Queryable<U>, selector: (left: T, right: U) => [T, U] | R = MakeTuple): Iterable<[T, U] | R> {
    assert.mustBeQueryable(left, "left");
    assert.mustBeQueryable(right, "right");
    assert.mustBeFunction(selector, "selector");
    return new ZipIterable(ToIterable(left), ToIterable(right), selector);
}

@ToStringTag("ZipIterable")
class ZipIterable<T, U, R> implements Iterable<R> {
    private _left: Iterable<T>;
    private _right: Iterable<U>;
    private _selector: (left: T, right: U) => R;

    constructor(left: Iterable<T>, right: Iterable<U>, selector: (left: T, right: U) => R) {
        this._left = left;
        this._right = right;
        this._selector = selector;
    }

    *[Symbol.iterator](): Iterator<R> {
        const selector = this._selector;
        const leftIterator = GetIterator(this._left);
        let leftDone = false;
        let leftValue: T;
        try {
            const rightIterator = GetIterator(this._right);
            let rightDone = false;
            let rightValue: U;
            try {
                for (;;) {
                    ({ done: leftDone, value: leftValue } = leftIterator.next());
                    ({ done: rightDone, value: rightValue } = rightIterator.next());
                    if (leftDone || rightDone) break;
                    yield selector(leftValue, rightValue);
                }
            }
            finally {
                if (!rightDone) IteratorClose(rightIterator);
            }
        }
        finally {
            if (!leftDone) IteratorClose(leftIterator);
        }
    }
}
