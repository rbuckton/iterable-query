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

import { assert, ToIterable, ToStringTag, Registry } from "../internal";
import { Queryable } from "../types";
import { Map } from "../collections";

/**
 * Creates an `Iterable` that iterates the elements from sources picked from a list based on the
 * result of a lazily evaluated choice.
 *
 * @param chooser A callback used to choose a source.
 * @param choices A `Queryable` of key/value pairs, where each value is a `Queryable` object.
 * @param otherwise A default source to use when another choice could not be made.
 */
export function choose<K, T>(chooser: () => K, choices: Queryable<[K, Queryable<T>]>, otherwise?: Queryable<T>): Iterable<T> {
    assert.mustBeFunction(chooser, "chooser");
    assert.mustBeQueryable(choices, "choices");
    assert.mustBeQueryableOrUndefined(otherwise, "otherwise");
    return new ChooseIterable(chooser, ToIterable(choices), otherwise && ToIterable(otherwise));
}

@ToStringTag("ChooseIterable")
class ChooseIterable<K, T> implements Iterable<T> {
    private _chooser: () => K;
    private _choices: Iterable<[K, Queryable<T>]>;
    private _otherwise: Iterable<T> | undefined;

    constructor(chooser: () => K, choices: Iterable<[K, Queryable<T>]>, otherwise?: Iterable<T>) {
        this._chooser = chooser;
        this._choices = choices;
        this._otherwise = otherwise;
    }

    *[Symbol.iterator](): Iterator<T> {
        const chooser = this._chooser;
        const choices = new Map(this._choices);
        const otherwise = this._otherwise;
        const choice = chooser();
        const result = choices.get(choice);
        if (result !== undefined && result !== null) {
            yield* ToIterable(result);
        }
        else if (otherwise) {
            yield* otherwise;
        }
    }
}

Registry.Query.registerStatic("choose", choose);