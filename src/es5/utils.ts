import "./symbol";
import { Queryable } from "./query";

export function IsObject(x: any): x is object {
    return x !== null && (typeof x === "object" || typeof x === "function");
}

export function IsIterable<T>(x: Queryable<T>): x is Iterable<T>;
export function IsIterable(x: any): x is Iterable<any>;
export function IsIterable(x: any): x is Iterable<any> {
    return IsObject(x) && Symbol.iterator in x;
}

export function ToIterable<T>(source: Queryable<T>) {
    return IsIterable(source) ? source : new ArrayLikeIterable(source);
}

export function GetIterator<T>(iterable: Iterable<T>): Iterator<T> {
    return (<any>iterable)[Symbol.iterator]();
}

export function ToArray<T, U = T>(source: Iterable<T> | ArrayLike<T>, selector: (v: T, k: number) => U = Identity, thisArg?: any) {
    if (!IsIterable(source)) {
        const result: U[] = new Array<U>(source.length);
        for (let i = 0; i < source.length; i++) {
            result[i] = selector.call(thisArg, source[i], i);
        }
        return result;
    }
    else {
        const result: U[] = [];
        let i = 0;
        for (const item of source) {
            result.push(selector.call(thisArg, item, i++));
        }
        return result;
    }
}

export function Identity<T>(x: T): T {
    return x;
}

export function CompareValues<T>(x: T, y: T): number {
    if (x < y) {
        return -1;
    }
    else if (x > y) {
        return +1;
    }
    return 0;
}

export function MakeTuple<T, U>(x: T, y: U): [T, U] {
    return [x, y];
}

export function IsArrayLike<T>(x: Queryable<T>): x is ArrayLike<T>;
export function IsArrayLike(x: any): x is ArrayLike<any>;
export function IsArrayLike(x: any): x is ArrayLike<any> {
    return x !== null && typeof x === "object" && typeof x.length === "number";
}

export function IteratorThrow<T>(iterator: Iterator<T>, reason: any): IteratorResult<T> {
    if (iterator !== undefined) {
        const func = iterator.throw;
        if (typeof func === "function") {
            return func.call(iterator, reason);
        }

        Debug.captureStackTrace(reason, IteratorThrow);
        throw reason;
    }
}

export function IteratorClose<T>(iterator: Iterator<T>, value?: any): IteratorResult<T> {
    if (iterator !== undefined) {
        const func = iterator.return;
        if (typeof func === "function") {
            return func.call(iterator, value);
        }
    }
}

export function SameValue(x: any, y: any): boolean {
    return (x === y) ? (x !== 0 || 1 / x === 1 / y) : (x !== x && y !== y);
}

export function NextResult<T>(value: T): IteratorResult<T> {
    return { done: false, value };
}

export function DoneResult<T>(): IteratorResult<T> {
    return { done: true, value: undefined };
}

export function True(x: any) {
    return true;
}

class ArrayLikeIterable<T> implements Iterable<T> {
    private _source: ArrayLike<T>;

    constructor (source: ArrayLike<T>) {
        this._source = source;
    }

    * [Symbol.iterator](): IterableIterator<T> {
        for (let i = 0; i < this._source.length; i++) yield this._source[i];
    }
}

export namespace Debug {
    interface ErrorConstructorWithStackTraceApi extends ErrorConstructor {
        captureStackTrace(target: any, stackCrawlMark?: Function): void;
    }

    declare const Error: ErrorConstructorWithStackTraceApi;

    export function captureStackTrace(error: any, stackCrawlMark?: Function) {
        if (typeof error === "object" && error !== null && Error.captureStackTrace) {
            Error.captureStackTrace(error, stackCrawlMark || captureStackTrace);
        }
    }
}