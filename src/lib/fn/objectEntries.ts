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

import { assert, Registry, ToStringTag } from "../internal";
import { KeyValuePair } from "../types";

/**
 * Creates an [[Iterable]] for the own property entries of an `object`.
 *
 * @param source An `object`.
 * @category Query
 */
export function objectEntries<T extends object>(source: T): Iterable<KeyValuePair<T, Extract<keyof T, string>>> {
    assert.mustBeObject(source, "source");
    return new ObjectEntriesIterable(source);
}

@ToStringTag("ObjectEntriesIterable")
class ObjectEntriesIterable<T extends object> implements Iterable<KeyValuePair<T, Extract<keyof T, string>>> {
    private _source: T;
    constructor(source: T) {
        this._source = source;
    }
    
    *[Symbol.iterator](): Iterator<KeyValuePair<T, Extract<keyof T, string>>> {
        const source = this._source;
        for (const key of Object.keys(source) as Extract<keyof T, string>[]) {
            yield [key, source[key]] as KeyValuePair<T, Extract<keyof T, string>>;
        }
    }
}

Registry.Query.registerStatic("objectEntries", objectEntries);