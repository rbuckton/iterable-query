import { Queryable, Iterable, ES6ShimIterable, Iterator, IterableIterator, IteratorResult } from "./query";

declare var Symbol: any;

export const IteratorKey = "__iterator__";
export const ES6ShimIteratorKey = "_es6-shim iterator_";
export const IteratorSymbol = typeof Symbol === "function" && Symbol.iterator;

export function iterator(target: any, name: string) {
    const iterator = target[name];
    if (IteratorSymbol) target[IteratorSymbol] = iterator;
    if (name !== IteratorKey) target[IteratorKey] = iterator;
    if (name !== ES6ShimIteratorKey) target[ES6ShimIteratorKey] = iterator;
}

export function GetIterator<T>(source: Queryable<T>): Iterator<T>;
export function GetIterator(source: any): Iterator<any> {
    const iterator = (IteratorSymbol && source[IteratorSymbol])
        || source[IteratorKey]
        || source[ES6ShimIteratorKey];

    if (typeof iterator === "function") {
        return iterator.call(source);
    }

    if (IsArrayLike(source)) {
        return new ArrayLikeIterator(source);
    }

    throw new TypeError();
}

export function IsObject(x: any) {
    return Object(x) === x;
}

export function IsIterable<T>(x: Queryable<T>): x is Iterable<T>;
export function IsIterable(x: any): x is Iterable<any>;
export function IsIterable(x: any): x is Iterable<any> {
    return IsObject(x) && (IteratorKey in x || IteratorSymbol in x);
}

export function IsIterableShim<T>(x: Queryable<T>): x is ES6ShimIterable<T> {
    return IsObject(x) && (ES6ShimIteratorKey in x);
}

export function IsArrayLike<T>(source: Queryable<T>): source is ArrayLike<T>;
export function IsArrayLike(source: any): source is ArrayLike<any>;
export function IsArrayLike(source: any): source is ArrayLike<any> {
    return source !== null
        && typeof source === "object"
        && typeof source.length === "number";
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

export function IteratorClose<T>(iterator: Iterator<T>): IteratorResult<T> {
    if (iterator !== undefined && iterator !== null) {
        const close = iterator.return;
        if (typeof close === "function") {
            return close.call(iterator);
        }
    }
}

class ArrayLikeIterator<T> implements IterableIterator<T> {
    private _source: ArrayLike<T>;
    private _offset: number;
    private _state: string;
    constructor (source: ArrayLike<T>) {
        this._source = source;
        this._state = "new";
    }
    next() {
        switch (this._state) {
            case "new":
                this._offset = 0;
                this._state = "yielding";
            case "yielding":
                if (this._offset < this._source.length) {
                    return NextResult(this._source[this._offset++]);
                }
            case "done":
                return this.return();
        }
    }
    return() {
        switch (this._state) {
            default:
                this._source = undefined;
                this._state = "done";
            case "done":
                return DoneResult<T>();
        }
    }
    @iterator __iterator__() { return this; }
}