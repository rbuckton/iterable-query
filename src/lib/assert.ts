import * as Debug from "./debug";
import { IsObject, SameValue, IsIterable, IsArrayLike, IsOrderedIterable } from "./utils";
import { HierarchyProvider } from "./query";
import { OrderedIterable } from "./core";

function assertType(condition: boolean, paramName: string, message: string, stackCrawlMark: Function) {
    if (!condition) {
        const error = new TypeError(message);
        Debug.captureStackTrace(error, stackCrawlMark || assertType);
        throw error;
    }
}

function assertRange(condition: boolean, paramName: string, message: string, stackCrawlMark: Function) {
    if (!condition) {
        const error = new RangeError(message);
        Debug.captureStackTrace(error, stackCrawlMark || assertType);
        throw error;
    }
}

export function mustBeBoolean(value: boolean, paramName: string, message?: string) {
    assertType(typeof value === "boolean", paramName, message, mustBeBoolean);
}

export function mustBeNumber(value: number, paramName: string, message?: string, stackCrawlMark?: Function) {
    assertType(typeof value === "number", paramName, message, stackCrawlMark || mustBeNumber);
}

export function mustBeObject(value: any, paramName: string, message?: string, stackCrawlMark?: Function) {
    assertType(IsObject(value), paramName, message, stackCrawlMark || mustBeObject);
}

export function mustBeObjectOrNull(value: any, paramName: string, message?: string) {
    assertType(IsObject(value) || value === null, paramName, message, mustBeObjectOrNull);
}

export function mustBeFunction(value: Function, paramName: string, message?: string, stackCrawlMark?: Function) {
    assertType(typeof value === "function", paramName, message, stackCrawlMark || mustBeFunction);
}

export function mustBeFunctionOrUndefined(value: Function, paramName: string, message?: string, stackCrawlMark?: Function) {
    assertType(typeof value === "function" || typeof value === "undefined", paramName, message, stackCrawlMark || mustBeFunctionOrUndefined);
}

export function mustBeFiniteNumber(value: number, paramName: string, message?: string) {
    mustBeNumber(value, paramName, message, mustBeFiniteNumber);
    assertRange(isFinite(value), paramName, message, mustBeFiniteNumber);
}

export function mustBePositiveFiniteNumber(value: number, paramName: string, message?: string) {
    mustBeNumber(value, paramName, message, mustBePositiveFiniteNumber);
    assertRange(isFinite(value) && value >= 0, paramName, message, mustBePositiveFiniteNumber);
}

export function mustBePositiveNonZeroFiniteNumber(value: number, paramName: string, message?: string) {
    mustBeNumber(value, paramName, message, mustBePositiveNonZeroFiniteNumber);
    assertRange(isFinite(value) && value > 0, paramName, message, mustBePositiveNonZeroFiniteNumber);
}

export function mustBeInteger(value: number, paramName: string, message?: string) {
    mustBeNumber(value, paramName, message, mustBeInteger);
    assertType(SameValue(value, value | 0), paramName, message, mustBeInteger);
}

export function mustBePositiveInteger(value: number, paramName: string, message?: string) {
    mustBeNumber(value, paramName, message, mustBePositiveInteger);
    assertType(SameValue(value, value | 0), paramName, message, mustBeInteger);
    assertRange(value >= 0, paramName, message, mustBePositiveInteger);
}

export function mustBeIterator<T>(value: Iterator<T>, paramName: string, message?: string) {
    mustBeObject(value, paramName, message, mustBeIterator);
    mustBeFunction(value.next, paramName, message, mustBeIterator);
    mustBeFunctionOrUndefined(value.return, paramName, message, mustBeIterator);
}

export function mustBeQueryable<T>(value: Iterable<T> | ArrayLike<T>, paramName: string, message?: string) {
    mustBeObject(value, paramName, message, mustBeQueryable);
    assertType(IsArrayLike(value) || IsIterable(value), paramName, message, mustBeQueryable);
}

export function mustBeQueryableOrUndefined<T>(value: Iterable<T> | ArrayLike<T>, paramName: string, message?: string) {
    if (value === undefined) return;
    mustBeObject(value, paramName, message, mustBeQueryableOrUndefined);
    assertType(IsArrayLike(value) || IsIterable(value), paramName, message, mustBeQueryableOrUndefined);
}

export function mustBeHierarchyProvider<T>(value: HierarchyProvider<T>, paramName: string, message?: string) {
    mustBeObject(value, paramName, message, mustBeHierarchyProvider);
    mustBeFunction(value.parent, paramName, message, mustBeHierarchyProvider);
    mustBeFunction(value.children, paramName, message, mustBeHierarchyProvider);
}

export function mustBeIterable<T>(value: Iterable<T>, paramName: string, message?: string) {
    assertType(IsIterable(value), paramName, message, mustBeIterable);
}

export function mustBeOrderedIterable<T>(value: OrderedIterable<T>, paramName: string, message?: string) {
    assertType(IsOrderedIterable(value), paramName, message, mustBeOrderedIterable);
}

export function mustNotBeOrderedIterable<T>(value: Iterable<T>, paramName: string, message?: string) {
    assertType(!IsOrderedIterable(value), paramName, message, mustNotBeOrderedIterable);
}
