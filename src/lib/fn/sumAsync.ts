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

import { assert, Identity, ToPossiblyAsyncIterable, Registry } from "../internal";
import { PossiblyAsyncQueryable } from "../types";

export function sumAsync(source: PossiblyAsyncQueryable<number>): Promise<number>;
export function sumAsync<T>(source: PossiblyAsyncQueryable<T>, elementSelector: (element: T) => number): Promise<number>;
export async function sumAsync(source: PossiblyAsyncQueryable<number>, elementSelector: (element: number) => number = Identity): Promise<number> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    assert.mustBeFunction(elementSelector, "elementSelector");
    let sum = 0;
    for await (const value of ToPossiblyAsyncIterable(source)) {
        const result = elementSelector(value);
        if (typeof result !== "number") throw new TypeError();
        sum += result;
    }
    return sum;
}

Registry.AsyncQuery.registerScalar("sum", sumAsync);