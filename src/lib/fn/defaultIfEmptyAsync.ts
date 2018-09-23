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

import { assert, ToPossiblyAsyncIterable, FlowHierarchy, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncHierarchyIterable, AsyncHierarchyIterable, PossiblyAsyncQueryable, PossiblyAsyncIterable } from "../types";

/**
 * Creates a subquery that contains the provided default value if the source
 * contains no elements.
 *
 * @param defaultValue The default value.
 */
export function defaultIfEmptyAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, defaultValue: T): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates a subquery that contains the provided default value if the source
 * contains no elements.
 *
 * @param defaultValue The default value.
 */
export function defaultIfEmptyAsync<T>(source: PossiblyAsyncQueryable<T>, defaultValue: T): AsyncIterable<T>;

export function defaultIfEmptyAsync<T>(source: PossiblyAsyncQueryable<T>, defaultValue: T): AsyncIterable<T> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    return FlowHierarchy(new AsyncDefaultIfEmptyIterable(ToPossiblyAsyncIterable(source), defaultValue), source);
}

@ToStringTag("AsyncDefaultIfEmptyIterable")
class AsyncDefaultIfEmptyIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _defaultValue: T;

    constructor(source: PossiblyAsyncIterable<T>, defaultValue: T) {
        this._source = source;
        this._defaultValue = defaultValue;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const source = this._source;
        const defaultValue = this._defaultValue;
        let hasElements = false;
        for await (const value of source) {
            hasElements = true;
            yield value;
        }
        if (!hasElements) {
            yield defaultValue;
        }
    }
}

Registry.AsyncQuery.registerSubquery("defaultIfEmpty", defaultIfEmptyAsync);