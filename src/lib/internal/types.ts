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

import { Queryable, AsyncQueryable } from "../types";

// Queries

/** @internal */
export namespace QuerySource {
    export const source = Symbol("QuerySource.source");
}

/** @internal */
export interface QuerySource<T> extends Iterable<T> {
    [QuerySource.source](): Queryable<T>;
}

/** @internal */
export namespace AsyncQuerySource {
    export const source = Symbol("AsyncQuerySource.source");
}

/** @internal */
export interface AsyncQuerySource<T> extends AsyncIterable<T> {
    [AsyncQuerySource.source](): AsyncQueryable<T>;
}