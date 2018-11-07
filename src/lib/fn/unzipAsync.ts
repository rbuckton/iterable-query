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

import { AsyncQueryable } from "../types";
import { ToPossiblyAsyncIterable } from "../internal";
import { identity } from "./common";

/**
 * Unzips a sequence of tuples into a tuple of sequences.
 * @param source An [[AsyncQueryable]]
 * @category Scalar
 */
export async function unzipAsync<T extends [any, ...any[]]>(source: AsyncQueryable<T>): Promise<{ [I in keyof T]: T[I][]; }>;
/**
 * Unzips a sequence of tuples into a tuple of sequences.
 * @param source An [[AsyncQueryable]]
 * @param partSelector A callback that converts a result into a tuple.
 * @category Scalar
 */
export async function unzipAsync<T, U extends [any, ...any[]]>(source: AsyncQueryable<T>, partSelector: (value: T) => U | PromiseLike<U>): Promise<{ [I in keyof U]: U[I][]; }>
export async function unzipAsync<T extends [any, ...any[]]>(source: AsyncQueryable<T>, partSelector: (value: T) => T | PromiseLike<T> = identity): Promise<any> {
    const result: any[][] = [];
    let length = -1;
    for await (const element of ToPossiblyAsyncIterable(source)) {
        const row = await partSelector(element);
        if (length === -1) {
            length = row.length;
            for (let i = 0; i < length; i++) {
                result.push([]);
            }
        }
        for (let i = 0; i < length; i++) {
            result[i].push(row[i]);
        }
    }
    return result;
}