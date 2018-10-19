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

import { assert, ToPossiblyAsyncIterable, ToStringTag, SameValue } from "../internal";
import { AsyncQueryable, PossiblyAsyncIterable, AsyncChoice } from "../types";

/**
 * Creates an [[Iterable]] that iterates the elements from sources picked from a list based on the
 * result of a lazily evaluated choice.
 *
 * @param chooser A callback used to choose a source.
 * @param choices An [[AsyncQueryable]] of key/value pairs, where each value is an [[AsyncQueryable]] object.
 * @param otherwise A default source to use when another choice could not be made.
 * @category Query
 */
export function chooseAsync<K, V>(chooser: () => PromiseLike<K> | K, choices: AsyncQueryable<AsyncChoice<K, V>>, otherwise?: AsyncQueryable<V>): AsyncIterable<V> {
    assert.mustBeFunction(chooser, "chooser");
    assert.mustBeAsyncQueryable<AsyncChoice<K, V>>(choices, "choices");
    assert.mustBeAsyncQueryableOrUndefined<V>(otherwise, "otherwise");
    return new AsyncChooseIterable(chooser, ToPossiblyAsyncIterable(choices), otherwise && ToPossiblyAsyncIterable(otherwise));
}

@ToStringTag("AsyncChooseIterable")
class AsyncChooseIterable<K, V> implements AsyncIterable<V> {
    private _chooser: () => PromiseLike<K> | K;
    private _choices: PossiblyAsyncIterable<AsyncChoice<K, V>>;
    private _otherwise: PossiblyAsyncIterable<V> | undefined;

    constructor(chooser: () => PromiseLike<K> | K, choices: PossiblyAsyncIterable<AsyncChoice<K, V>>, otherwise?: PossiblyAsyncIterable<V>) {
        this._chooser = chooser;
        this._choices = choices;
        this._otherwise = otherwise;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<V> {
        const chooser = this._chooser;
        const choice = await chooser();
        for await (const [key, values] of this._choices) {
            if (SameValue(choice, await key)) {
                yield* ToPossiblyAsyncIterable(values);
                return;
            }
        }
        if (this._otherwise) {
            yield* this._otherwise;
        }
    }
}