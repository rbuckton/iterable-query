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

import { assert, Registry, GetSource, CreateSubquery } from "../internal";
import { Queryable } from "../types";

/**
 * Pass the entire source to the provided callback, returning a `Queryable` from the result.
 *
 * @param source A `Queryable` object.
 * @param callback A callback function.
 */
export function through<T, U, S extends Queryable<T> = Queryable<T>, R extends Queryable<U> = Queryable<U>>(source: S, callback: (source: S) => R): R {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(callback, "callback");
    const result = callback(source);
    assert.mustBeQueryable(result);
    return result;
}

Registry.Query.registerCustom("through", through, function (callback) {
    return CreateSubquery(this, through(GetSource(this), callback as <S, R>(source: S) => R));
});