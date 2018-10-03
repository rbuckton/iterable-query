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

import { assert, ToStringTag, ToPossiblyAsyncIterable, Registry } from "../internal";
import { AsyncQueryable, PossiblyAsyncIterable } from "../types";
import { empty } from "./empty";

/**
 * Creates an `AsyncIterable` that iterates the elements from one of two sources based on the result of a
 * lazily evaluated condition.
 *
 * @param condition A callback used to choose a source.
 * @param thenQueryable The source to use when the callback evaluates to `true`.
 * @param elseQueryable The source to use when the callback evaluates to `false`.
 * @category Query
 */
export function ifAsync<T>(condition: () => PromiseLike<boolean> | boolean, thenQueryable: AsyncQueryable<T>, elseQueryable?: AsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBeFunction(condition, "condition");
    assert.mustBeAsyncQueryable<T>(thenQueryable, "thenQueryable");
    assert.mustBeAsyncQueryableOrUndefined<T>(elseQueryable, "elseQueryable");
    return new AsyncIfIterable(condition, ToPossiblyAsyncIterable(thenQueryable), elseQueryable && ToPossiblyAsyncIterable(elseQueryable));
}

@ToStringTag("AsyncIfIterable")
class AsyncIfIterable<T> implements AsyncIterable<T> {
    private _condition: () => PromiseLike<boolean> | boolean;
    private _thenQueryable: PossiblyAsyncIterable<T>;
    private _elseQueryable: PossiblyAsyncIterable<T> | undefined;

    constructor(condition: () => PromiseLike<boolean> | boolean, thenQueryable: PossiblyAsyncIterable<T>, elseQueryable?: PossiblyAsyncIterable<T>) {
        this._condition = condition;
        this._thenQueryable = thenQueryable;
        this._elseQueryable = elseQueryable;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const condition = this._condition;
        const iterable = await condition() ? this._thenQueryable : (this._elseQueryable || empty());
        yield* iterable;
    }
}

Registry.AsyncQuery.registerStatic("if", ifAsync);