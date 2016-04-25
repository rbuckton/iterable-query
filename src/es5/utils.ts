import { Iterable, Iterator, IterableIterator, IteratorResult } from "./query";

declare var Symbol: any;

export function iterator(target: any, name: string) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        target[Symbol.iterator] = target[name];
    }
}

export function GetIterator<T>(source: Iterable<T> | ArrayLike<T>): Iterator<T> {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        const iterator = (<any>source)[Symbol.iterator];
        if (typeof iterator === "function") {
            return iterator.call(source);
        }
    }

    const iterator = (<Iterable<T>>source).__iterator__;
    if (typeof iterator === "function") {
        return iterator.call(source);
    }

    if (typeof (<ArrayLike<T>>source).length === "number") {
        return new ArrayLikeIterator(<ArrayLike<T>>source);
    }

    throw new TypeError();
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