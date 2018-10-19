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

import { ToStringTag } from "../internal";

/**
 * Creates an [[Iterable]] with no elements.
 * @category Query
 */
export function empty<T>(): Iterable<T> {
    return new EmptyIterable<T>();
}

@ToStringTag("EmptyIterable")
class EmptyIterable<T> implements Iterable<T> {
    *[Symbol.iterator](): Iterator<T> {
    }
}