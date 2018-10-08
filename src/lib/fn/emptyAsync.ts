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

import { Registry, ToStringTag } from "../internal";

/**
 * Creates an [[AsyncIterable]] with no elements.
 * @category Query
 */
export function emptyAsync<T>(): AsyncIterable<T> {
    return new AsyncEmptyIterable<T>();
}

@ToStringTag("AsyncEmptyIterable")
class AsyncEmptyIterable<T> implements AsyncIterable<T> {
    async *[Symbol.asyncIterator](): AsyncIterator<T> {
    }
}

Registry.AsyncQuery.registerStatic("empty", emptyAsync);