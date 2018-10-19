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

import { assert, ToIterable, ToStringTag} from "../internal";
import { Queryable } from "../types";
import { empty } from "./empty";

/**
 * Creates an [[Iterable]] that iterates the elements from one of two sources based on the result of a
 * lazily evaluated condition.
 *
 * @param condition A callback used to choose a source.
 * @param thenQueryable The source to use when the callback evaluates to `true`.
 * @param elseQueryable The source to use when the callback evaluates to `false`.
 * @category Query
 */
export function conditional<T>(condition: () => boolean, thenQueryable: Queryable<T>, elseQueryable?: Queryable<T>): Iterable<T> {
    assert.mustBeFunction(condition, "condition");
    assert.mustBeQueryable(thenQueryable, "thenQueryable");
    assert.mustBeQueryableOrUndefined(elseQueryable, "elseQueryable");
    return new IfIterable(condition, ToIterable(thenQueryable), elseQueryable && ToIterable(elseQueryable));
}

@ToStringTag("IfIterable")
class IfIterable<T> implements Iterable<T> {
    private _condition: () => boolean;
    private _thenQueryable: Iterable<T>;
    private _elseQueryable: Iterable<T> | undefined;

    constructor(condition: () => boolean, thenQueryable: Iterable<T>, elseQueryable?: Iterable<T>) {
        this._condition = condition;
        this._thenQueryable = thenQueryable;
        this._elseQueryable = elseQueryable;
    }

    *[Symbol.iterator](): Iterator<T> {
        const condition = this._condition;
        const iterable = condition() ? this._thenQueryable : (this._elseQueryable || empty());
        yield* iterable;
    }
}