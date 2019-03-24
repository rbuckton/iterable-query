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

import { assert, CreateGroupings, IsEqualer} from "../internal";
import { Queryable } from "../types";
import { Lookup } from "../lookup";
import { identity } from "./common";
import { Equaler } from 'equatable';

/**
 * Creates a Lookup for the elements of the Query.
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to select a key for each element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Scalar
 */
export function toLookup<T, K>(source: Queryable<T>, keySelector: (element: T) => K, keyEqualer?: Equaler<K>): Lookup<K, T>;
/**
 * Creates a Lookup for the elements of the Query.
 *
 * @param source A [[Queryable]] object.
 * @param keySelector A callback used to select a key for each element.
 * @param elementSelector A callback that selects a value for each element.
 * @param keyEqualer An [[Equaler]] object used to compare key equality.
 * @category Scalar
 */
export function toLookup<T, K, V>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, keyEqualer?: Equaler<K>): Lookup<K, V>;
export function toLookup<T, K>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: ((element: T) => T) | Equaler<K> = identity, keyEqualer?: Equaler<K>): Lookup<K, T> {
    if (IsEqualer(elementSelector)) {
        keyEqualer = elementSelector;
        elementSelector = identity;
    }
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    assert.mustBeEqualerOrUndefined(keyEqualer, "keyEqualer");
    return new Lookup(CreateGroupings(source, keySelector, elementSelector, keyEqualer), keyEqualer);
}