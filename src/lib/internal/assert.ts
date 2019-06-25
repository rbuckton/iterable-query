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

import * as Debug from "./debug";
import { IsObject, SameValue, IsArrayLike, IsIterable, IsOrderedIterable, IsHierarchyIterable, IsAsyncIterable, IsAsyncOrderedIterable, IsPossiblyAsyncHierarchyIterable, IsOrderedHierarchyIterable } from ".";
import { Queryable, HierarchyProvider, AsyncOrderedIterable, PossiblyAsyncHierarchyIterable, PossiblyAsyncOrderedIterable, AsyncHierarchyIterable, AsyncQueryable } from "../types";
import { OrderedIterable, HierarchyIterable } from "../types";
import { QuerySource, AsyncQuerySource } from "./types";
import { IsQuerySource, IsAsyncQuerySource, IsAsyncHierarchyIterable, IsEqualer, IsComparer } from "./guards";
import { Equaler, Comparer } from '@esfx/equatable';

/** @internal */
export function fail(ErrorType: new (message?: string) => Error, paramName: string | undefined, message: string | undefined, stackCrawlMark: Function = fail): never {
    const error = new ErrorType(typeof paramName === "string" ? message ? `${message}: ${paramName}` : `Invalid argument: ${paramName}` : message);
    Debug.captureStackTrace(error, stackCrawlMark || assertType);
    throw error;
}

function assertType(condition: boolean, paramName: string | undefined, message: string | undefined, stackCrawlMark: Function = assertType) {
    if (!condition) fail(TypeError, paramName, message, stackCrawlMark);
}

function assertRange(condition: boolean, paramName: string | undefined, message: string | undefined, stackCrawlMark: Function = assertRange) {
    if (!condition) fail(RangeError, paramName, message, stackCrawlMark)
}

function mayBeUndefined<T>(mustBe: (value: T, paramName?: string, message?: string, stackCrawlMark?: Function) => void) {
    return function mayBeUndefined(value: T | undefined, paramName?: string, message?: string, stackCrawlMark: Function = mayBeUndefined) {
        if (value === undefined) return;
        mustBe(value, paramName, message, stackCrawlMark);
    }
}

function mayBeNull<T>(mustBe: (value: T, paramName?: string, message?: string, stackCrawlMark?: Function) => void) {
    return function mayBeNull(value: T | null, paramName?: string, message?: string, stackCrawlMark: Function = mayBeNull) {
        if (value === null) return;
        mustBe(value, paramName, message, stackCrawlMark);
    }
}

/** @internal */
export function mustBeBoolean(value: boolean, paramName?: string, message?: string, stackCrawlMark: Function = mustBeBoolean) {
    assertType(typeof value === "boolean", paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeNumber(value: number, paramName?: string, message?: string, stackCrawlMark: Function = mustBeNumber) {
    assertType(typeof value === "number", paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeObject(value: any, paramName?: string, message: string = "Object expected", stackCrawlMark: Function = mustBeObject) {
    assertType(IsObject(value), paramName, message, stackCrawlMark);
}

/** @internal */
export const mustBeObjectOrNull = mayBeNull(mustBeObject);

/** @internal */
export function mustBeFunction(value: Function, paramName?: string, message?: string, stackCrawlMark: Function = mustBeFunction) {
    assertType(typeof value === "function", paramName, message, stackCrawlMark);
}

/** @internal */
export const mustBeFunctionOrUndefined = mayBeUndefined(mustBeFunction);

/** @internal */
export function mustBeFiniteNumber(value: number, paramName?: string, message?: string, stackCrawlMark: Function = mustBeFiniteNumber) {
    mustBeNumber(value, paramName, message, stackCrawlMark);
    assertRange(isFinite(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBePositiveFiniteNumber(value: number, paramName?: string, message?: string, stackCrawlMark: Function = mustBePositiveFiniteNumber) {
    mustBeNumber(value, paramName, message, stackCrawlMark);
    assertRange(isFinite(value) && value >= 0, paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBePositiveNonZeroFiniteNumber(value: number, paramName?: string, message?: string, stackCrawlMark: Function = mustBePositiveNonZeroFiniteNumber) {
    mustBeNumber(value, paramName, message, stackCrawlMark);
    assertRange(isFinite(value) && value > 0, paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeInteger(value: number, paramName?: string, message?: string, stackCrawlMark: Function = mustBeInteger) {
    mustBeNumber(value, paramName, message, stackCrawlMark);
    assertType(SameValue(value, value | 0), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBePositiveInteger(value: number, paramName?: string, message?: string, stackCrawlMark: Function = mustBePositiveInteger) {
    mustBeNumber(value, paramName, message, stackCrawlMark);
    assertType(SameValue(value, value | 0), paramName, message, stackCrawlMark);
    assertRange(value >= 0, paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeIterator<T>(value: Iterator<T> | AsyncIterator<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeIterator) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    mustBeFunction(value.next, paramName, message, stackCrawlMark);
    mustBeFunctionOrUndefined(value.return, paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeQueryable<T>(value: Queryable<T>, paramName?: string, message: string = "Iterable or Array-like object expected", stackCrawlMark: Function = mustBeQueryable) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    assertType(IsArrayLike(value) || IsIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export const mustBeQueryableOrUndefined = mayBeUndefined(mustBeQueryable);

/** @internal */
export function mustBeAsyncIterable<T>(value: AsyncIterable<T>, paramName?: string, message: string = "AsyncIterable object expected", stackCrawlMark: Function = mustBeQueryable) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    assertType(IsAsyncIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export const mustBeAsyncIterableOrUndefined = mayBeUndefined(mustBeAsyncIterable);

/** @internal */
export function mustBePossiblyAsyncQueryable<T>(value: Queryable<T> | AsyncIterable<T>, paramName?: string, message: string = "AsyncIterable or Iterable or Array-like object expected", stackCrawlMark: Function = mustBeQueryable) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    assertType(IsArrayLike(value) || IsIterable(value) || IsAsyncIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export const mustBePossiblyAsyncQueryableOrUndefined = mayBeUndefined(mustBePossiblyAsyncQueryable);

/** @internal */
export function mustBeAsyncQueryable<T>(value: AsyncQueryable<T>, paramName?: string, message: string = "AsyncIterable or Iterable or Array-like object expected", stackCrawlMark: Function = mustBeQueryable) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    assertType(IsArrayLike(value) || IsIterable(value) || IsAsyncIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export const mustBeAsyncQueryableOrUndefined = mayBeUndefined(mustBeAsyncQueryable);

/** @internal */
export function mustBeArrayLike<T>(value: ArrayLike<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeArrayLike) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    assertType(IsArrayLike(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeIterable<T>(value: Iterable<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeArrayLike) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    assertType(IsIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeHierarchyProvider<T>(value: HierarchyProvider<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeHierarchyProvider) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    mustBeFunction(value!.parent, paramName, message, stackCrawlMark);
    mustBeFunction(value!.children, paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeOrderedIterable<T>(value: OrderedIterable<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeOrderedIterable) {
    assertType(IsOrderedIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeOrderedHierarchyIterable<T>(value: OrderedIterable<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeOrderedIterable) {
    assertType(IsOrderedHierarchyIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeAsyncOrderedIterable<T>(value: AsyncOrderedIterable<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeOrderedIterable) {
    assertType(IsAsyncOrderedIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBePossiblyAsyncOrderedIterable<T>(value: PossiblyAsyncOrderedIterable<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeOrderedIterable) {
    assertType(IsAsyncOrderedIterable(value) || IsOrderedIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeHierarchyIterable<T>(value: HierarchyIterable<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeHierarchyIterable) {
    assertType(IsHierarchyIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeAsyncHierarchyIterable<T>(value: AsyncHierarchyIterable<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeHierarchyIterable) {
    assertType(IsAsyncHierarchyIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBePossiblyAsyncHierarchyIterable<TNode, T extends TNode>(value: PossiblyAsyncHierarchyIterable<TNode, T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeHierarchyIterable) {
    assertType(IsPossiblyAsyncHierarchyIterable(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeQuerySource<T>(value: QuerySource<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeQuerySource) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    assertType(IsQuerySource(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeAsyncQuerySource<T>(value: AsyncQuerySource<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeAsyncQuerySource) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    assertType(IsAsyncQuerySource(value), paramName, message, stackCrawlMark);
}

/** @internal */
export function mustBeEqualer<T>(value: Equaler<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeEqualer) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    assertType(IsEqualer(value), paramName, message, stackCrawlMark);
}

/** @internal */
export const mustBeEqualerOrUndefined = mayBeUndefined(mustBeEqualer);

/** @internal */
export function mustBeComparer<T>(value: Comparer<T>, paramName?: string, message?: string, stackCrawlMark: Function = mustBeComparer) {
    mustBeObject(value, paramName, message, stackCrawlMark);
    assertType(IsComparer(value), paramName, message, stackCrawlMark);
}

/** @internal */
export const mustBeComparerOrUndefined = mayBeUndefined(mustBeComparer);
