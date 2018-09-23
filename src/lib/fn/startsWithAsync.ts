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


import { assert, SameValue, GetAsyncIterator, ToAsyncIterable, AsyncIteratorClose, Registry } from "../internal";
import { PossiblyAsyncQueryable } from "../types";

/**
 * Computes a scalar value indicating whether the elements of this Query start
 * with the same sequence of elements in another Queryable.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison A callback used to compare the equality of two elements.
 */
export function startsWithAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>, equalityComparison?: (left: T, right: T) => boolean): Promise<boolean>;

/**
 * Computes a scalar value indicating whether the elements of this Query start
 * with the same sequence of elements in another Queryable.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison A callback used to compare the equality of two elements.
 */
export function startsWithAsync<T, U>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<U>, equalityComparison: (left: T, right: U) => boolean): Promise<boolean>;

/**
 * Computes a scalar value indicating whether the elements of this Query start
 * with the same sequence of elements in another Queryable.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison An optional callback used to compare the equality of two elements.
 */
export async function startsWithAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>, equalityComparison: (left: T, right: T) => boolean = SameValue): Promise<boolean> {
    assert.mustBePossiblyAsyncQueryable(left, "left");
    assert.mustBePossiblyAsyncQueryable(right, "right");
    assert.mustBeFunction(equalityComparison, "equalityComparison");
    const leftIterator = GetAsyncIterator(ToAsyncIterable(left));
    let leftDone = false;
    let leftValue: T;
    try {
        const rightIterator = GetAsyncIterator(ToAsyncIterable(right));
        let rightDone = false;
        let rightValue: T;
        try {
            for (;;) {
                ({ done: leftDone, value: leftValue } = await leftIterator.next());
                ({ done: rightDone, value: rightValue } = await rightIterator.next());
                if (rightDone) return true;
                if (leftDone || !equalityComparison(leftValue, rightValue)) return false;
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

Registry.AsyncQuery.registerScalar("startsWith", startsWithAsync);