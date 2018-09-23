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

import { assert, SameValue, GetIterator, IteratorClose, ToIterable, Registry } from "../internal";
import { Queryable } from "../types";

/**
 * Computes a scalar value indicating whether the elements of this Query start
 * with the same sequence of elements in another Queryable.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison A callback used to compare the equality of two elements.
 */
export function startsWith<T>(left: Queryable<T>, right: Queryable<T>, equalityComparison?: (left: T, right: T) => boolean): boolean;

/**
 * Computes a scalar value indicating whether the elements of this Query start
 * with the same sequence of elements in another Queryable.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison A callback used to compare the equality of two elements.
 */
export function startsWith<T, U>(left: Queryable<T>, right: Queryable<U>, equalityComparison: (left: T, right: U) => boolean): boolean;

/**
 * Computes a scalar value indicating whether the elements of this Query start
 * with the same sequence of elements in another Queryable.
 *
 * @param left A `Queryable` object.
 * @param right A `Queryable` object.
 * @param equalityComparison An optional callback used to compare the equality of two elements.
 */
export function startsWith<T>(left: Queryable<T>, right: Queryable<T>, equalityComparison: (left: T, right: T) => boolean = SameValue): boolean {
    assert.mustBeQueryable(left, "left");
    assert.mustBeQueryable(right, "right");
    assert.mustBeFunction(equalityComparison, "equalityComparison");
    const leftIterator = GetIterator(ToIterable(left));
    let leftDone = false;
    let leftValue: T;
    try {
        const rightIterator = GetIterator(ToIterable(right));
        let rightDone = false;
        let rightValue: T;
        try {
            for (;;) {
                ({ done: leftDone, value: leftValue } = leftIterator.next());
                ({ done: rightDone, value: rightValue } = rightIterator.next());
                if (rightDone) return true;
                if (leftDone || !equalityComparison(leftValue, rightValue)) return false;
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

Registry.Query.registerScalar("startsWith", startsWith);