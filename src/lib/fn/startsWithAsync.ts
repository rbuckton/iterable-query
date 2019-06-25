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

import { assert, GetAsyncIterator, AsyncIteratorClose, ToPossiblyAsyncIterable } from "../internal";
import { AsyncQueryable } from "../types";
import { EqualityComparison, Equaler } from '@esfx/equatable';

/**
 * Computes a scalar value indicating whether the elements of this Query start
 * with the same sequence of elements in another Queryable.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equaler A callback used to compare the equality of two elements.
 * @category Scalar
 */
export async function startsWithAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, equaler?: EqualityComparison<T> | Equaler<T>): Promise<boolean>;
/**
 * Computes a scalar value indicating whether the elements of this Query start
 * with the same sequence of elements in another Queryable.
 *
 * @param left An [[AsyncQueryable]] object.
 * @param right An [[AsyncQueryable]] object.
 * @param equaler A callback used to compare the equality of two elements.
 * @category Scalar
 */
export async function startsWithAsync<T, U>(left: AsyncQueryable<T>, right: AsyncQueryable<U>, equaler: (left: T, right: U) => boolean): Promise<boolean>;
export async function startsWithAsync<T>(left: AsyncQueryable<T>, right: AsyncQueryable<T>, equaler: EqualityComparison<T> | Equaler<T> = Equaler.defaultEqualer): Promise<boolean> {
    if (typeof equaler === "function") equaler = Equaler.create(equaler);
    assert.mustBeAsyncQueryable<T>(left, "left");
    assert.mustBeAsyncQueryable<T>(right, "right");
    assert.mustBeEqualer(equaler, "equaler");
    const leftIterator = GetAsyncIterator(ToPossiblyAsyncIterable(left));
    let leftDone = false;
    let leftValue: T;
    try {
        const rightIterator = GetAsyncIterator(ToPossiblyAsyncIterable(right));
        let rightDone = false;
        let rightValue: T;
        try {
            for (;;) {
                ({ done: leftDone, value: leftValue } = await leftIterator.next());
                ({ done: rightDone, value: rightValue } = await rightIterator.next());
                if (rightDone) return true;
                if (leftDone || !equaler.equals(leftValue, rightValue)) return false;
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