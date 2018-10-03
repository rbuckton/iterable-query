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
/** @module "iterable-query" */

import { assert, ToIterable, GetIterator, CreateGrouping } from "./internal";
import { Queryable, Grouping } from "./types";
import { empty } from "./fn";
import { Map } from "./collections";

export class Lookup<K, V> implements Iterable<Grouping<K, V>> {
    private _entries: Map<K, Queryable<V>>;
    private _source: Iterable<Grouping<K, V>>;

    /**
     * Creates a new Lookup for the provided groups.
     *
     * @param entries A map containing the unique groups of values.
     */
    constructor(entries: Queryable<[K, Queryable<V>]>) {
        assert.mustBeQueryable(entries, "entries");
        this._entries = new Map(ToIterable(entries));
        this._source = new LookupIterable(this._entries, CreateGrouping);
    }

    /**
     * Gets the number of unique keys.
     */
    get size(): number {
        return this._entries.size;
    }

    /**
     *
     * @param key A key.
     * Gets a value indicating whether any group has the provided key.
     */
    has(key: K): boolean {
        return this._entries.has(key);
    }

    /**
     * Gets the group for the provided key.
     *
     * @param key A key.
     */
    get(key: K): Iterable<V> {
        return ToIterable(this._entries.get(key) || empty<V>());
    }

    /**
     * Creates a `Query` that maps each group in the Lookup.
     *
     * @param selector A callback used to select results for each group.
     */
    applyResultSelector<R>(selector: (key: K, elements: Queryable<V>) => R): Iterable<R> {
        assert.mustBeFunction(selector, "selector");
        return new LookupIterable(this._entries, selector);
    }

    [Symbol.iterator]() {
        return GetIterator(this._source);
    }
}

class LookupIterable<K, V, R> implements Iterable<R> {
    private _map: Map<K, Queryable<V>>;
    private _selector: (key: K, elements: Queryable<V>) => R;

    constructor(map: Map<K, Queryable<V>>, selector: (key: K, elements: Queryable<V>) => R) {
        this._map = map;
        this._selector = selector;
    }

    *[Symbol.iterator](): Iterator<R> {
        const map = this._map;
        const selector = this._selector;
        for (const [key, values] of map) {
            yield selector(key, values);
        }
    }
}