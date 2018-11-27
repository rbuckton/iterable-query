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

import { assert, ToPossiblyAsyncIterable, MakeDescriptor } from "../internal";
import { AsyncQueryable } from "../types";
import { identity } from "./common";

/**
 * Creates an Object for the elements of `source`. Properties are added via `Object.defineProperty`.
 *
 * ```ts
 * // As a regular object
 * const obj = await toObjectAsync([Promise.resolve(["x", 1]), ["y", 2]], undefined, a => a[0]);
 * obj.x; // ["x", 1]
 * obj.y; // ["y", 2]
 * typeof obj.toString; // function
 *
 * // with a custom prototype
 * const baseObject = { toString() { return `${this.x}:${this.y}` } };
 * const obj = await toObjectAsync([Promise.resolve(["x", 1]), ["y", 2]], baseObject, a => a[0]);
 * obj.x; // ["x", 1]
 * obj.y; // ["y", 2]
 * typeof obj.toString; // function
 * obj.toString(); // "x",1:"y",2
 *
 * // with a null prototype
 * const obj = await toObjectAsync([Promise.resolve(["x", 1]), ["y", 2]], null, a => a[0]);
 * obj.x; // ["x", 1]
 * obj.y; // ["y", 2]
 * typeof obj.toString; // undefined
 * ```
 *
 * @param source An [[AsyncQueryable]] object.
 * @param prototype The prototype for the object. If `prototype` is `null`, an object with a `null`
 * prototype is created. If `prototype` is `undefined`, the default `Object.prototype` is used.
 * @param keySelector A callback used to select a key for each element.
 * @category Scalar
 */
export async function toObjectAsync<T>(source: AsyncQueryable<T>, prototype: object | null | undefined, keySelector: (element: T) => PropertyKey): Promise<object>;
/**
 * Creates an Object for the elements of `source`. Properties are added via `Object.defineProperty`.
 *
 * ```ts
 * // As a regular object
 * const obj = await toObjectAsync([Promise.resolve(["x", 1]), ["y", 2]], undefined, a => a[0], a => a[1]);
 * obj.x; // 1
 * obj.y; // 2
 * typeof obj.toString; // function
 *
 * // with a custom prototype
 * const baseObject = { toString() { return `${this.x}:${this.y}` } };
 * const obj = await toObjectAsync([Promise.resolve(["x", 1]), ["y", 2]], baseObject, a => a[0], a => a[1]);
 * obj.x; // 1
 * obj.y; // 2
 * typeof obj.toString; // function
 * obj.toString(); // 1:2
 *
 * // with a null prototype
 * const obj = await toObjectAsync([Promise.resolve(["x", 1]), ["y", 2]], null, a => a[0], a => a[1]);
 * obj.x; // 1
 * obj.y; // 2
 * typeof obj.toString; // undefined
 * ```
 *
 * @param source An [[AsyncQueryable]] object.
 * @param prototype The prototype for the object. If `prototype` is `null`, an object with a `null`
 * prototype is created. If `prototype` is `undefined`, the default `Object.prototype` is used.
 * @param keySelector A callback used to select a key for each element.
 * @param elementSelector A callback that selects a value for each element.
 * @param descriptorSelector A callback that defines the `PropertyDescriptor` for each property.
 * @category Scalar
 */
export async function toObjectAsync<T, V>(source: AsyncQueryable<T>, prototype: object | null | undefined, keySelector: (element: T) => PropertyKey, elementSelector: (element: T) => V | PromiseLike<V>, descriptorSelector?: (key: PropertyKey, value: V) => PropertyDescriptor): Promise<object>;
export async function toObjectAsync<T>(source: AsyncQueryable<T>, prototype: object | null = Object.prototype, keySelector: (element: T) => PropertyKey, elementSelector: (element: T) => T | PromiseLike<T> = identity, descriptorSelector: (key: PropertyKey, value: T) => PropertyDescriptor = MakeDescriptor): Promise<object> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeObjectOrNull(prototype, "prototype");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    assert.mustBeFunction(descriptorSelector, "descriptorSelector");
    const obj = prototype === Object.prototype ? {} : Object.create(prototype);
    for await (const item of ToPossiblyAsyncIterable(source)) {
        const key = keySelector(item);
        const element = await elementSelector(item);
        const descriptor = descriptorSelector(key, element);
        Object.defineProperty(obj, key, descriptor);
    }
    return obj;
}