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

import { assert, SelectEntry, Registry } from "../internal";
import { KeyValuePair } from "../types";
import { map } from "./map";
import { objectKeys } from "./objectKeys";

/**
 * Creates an `Iterable` for the own property keys of an object.
 *
 * @param source An object.
 */
export function objectEntries<T extends object>(source: T): Iterable<KeyValuePair<T, Extract<keyof T, string>>> {
    assert.mustBeObject(source, "source");
    return map(objectKeys(source), SelectEntry.bind(source));
}

Registry.Query.registerStatic("objectEntries", objectEntries);