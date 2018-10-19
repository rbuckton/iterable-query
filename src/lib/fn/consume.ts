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

import { assert, IteratorClose, ToStringTag} from "../internal";

export interface ConsumeOptions {
    /** Indicates whether iterated elements should be cached for subsequent iterations. */
    cacheElements?: boolean;

    /** Indicates whether to leave the iterator open when the iterable returns. */
    leaveOpen?: boolean;
}

/**
 * Creates an [[Iterable]] that, when iterated, consumes the provided [[Iterator]].
 *
 * @param iterator An [[Iterator]] object.
 * @category Query
 */
export function consume<T>(iterator: Iterator<T>, options: ConsumeOptions = {}): Iterable<T> {
    const { cacheElements = false, leaveOpen = false } = options;
    assert.mustBeIterator(iterator, "iterator");
    assert.mustBeBoolean(cacheElements, "cacheElements");
    return new ConsumeIterable(iterator, cacheElements, leaveOpen);
}

@ToStringTag("ConsumeIterable")
class ConsumeIterable<T> implements Iterable<T> {
    private _iterator: Iterator<T> | undefined;
    private _cache?: T[];
    private _leaveOpen: boolean;
    
    constructor(iterator: Iterator<T>, cacheElements: boolean, leaveOpen: boolean) {
        this._iterator = iterator;
        this._cache = cacheElements ? [] : undefined;
        this._leaveOpen = leaveOpen;
    }
    
    *[Symbol.iterator]() {
        let offset = 0;
        try {
            for (;;) {
                if (this._cache && offset < this._cache.length) {
                    yield this._cache[offset++];
                    continue;
                }
                else if (this._iterator) {
                    const { done, value } = this._iterator.next();
                    if (!done) {
                        if (this._cache) this._cache.push(value);
                        yield value;
                        offset++;
                        continue;
                    }
                    this._iterator = undefined;
                }
                return;
            }
        }
        finally {
            if (!this._leaveOpen) {
                IteratorClose(this._iterator);
            }
        }
    }
}