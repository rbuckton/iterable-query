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
import { assert, ToPossiblyAsyncIterable, ToAsyncIterable, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncQueryable } from "../types";
import { Map } from "../collections";
import { toArrayAsync } from "./toArrayAsync";

/**
 * Creates an `Iterable` that iterates the elements from sources picked from a list based on the
 * result of a lazily evaluated choice.
 *
 * @param chooser A callback used to choose a source.
 * @param choices A `Queryable` of key/value pairs, where each value is a `Queryable` object.
 * @param otherwise A default source to use when another choice could not be made.
 */
export function chooseAsync<K, T>(chooser: () => K, choices: PossiblyAsyncQueryable<[K, PossiblyAsyncQueryable<T>]>, otherwise?: PossiblyAsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBeFunction(chooser, "chooser");
    assert.mustBePossiblyAsyncQueryable(choices, "choices");
    assert.mustBePossiblyAsyncQueryableOrUndefined(otherwise, "otherwise");
    return new AsyncChooseIterable(chooser, ToAsyncIterable(choices), otherwise && ToAsyncIterable(otherwise));
}

@ToStringTag("AsyncChooseIterable")
class AsyncChooseIterable<K, T> implements AsyncIterable<T> {
    private _chooser: () => K;
    private _choices: AsyncIterable<[K, PossiblyAsyncQueryable<T>]>;
    private _otherwise: AsyncIterable<T> | undefined;

    constructor(chooser: () => K, choices: AsyncIterable<[K, PossiblyAsyncQueryable<T>]>, otherwise?: AsyncIterable<T>) {
        this._chooser = chooser;
        this._choices = choices;
        this._otherwise = otherwise;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const chooser = this._chooser;
        const choices = new Map(await toArrayAsync(this._choices));
        const choice = choices.get(chooser());
        if (choice !== undefined && choice !== null) {
            yield* ToPossiblyAsyncIterable(choice);
        }
        else if (this._otherwise) {
            yield* ToPossiblyAsyncIterable(this._otherwise);
        }
    }
}

Registry.AsyncQuery.registerStatic("choose", chooseAsync);