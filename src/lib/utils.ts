import * as Debug from "./debug";
import { Queryable, OrderedIterable, ArrayLikeIterable, OrderByIterable } from "./core";
import { Grouping } from "./query";

export function Identity<T>(x: T): T {
    return x;
}

export function True(x: any) {
    return true;
}

export function SameValue(x: any, y: any): boolean {
    return (x === y) ? (x !== 0 || 1 / x === 1 / y) : (x !== x && y !== y);
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

export function IsObject(x: any): boolean {
    return x !== null && (typeof x === "object" || typeof x === "function");
}

export function IsArrayLike<T>(x: Iterable<T> | ArrayLike<T>): x is ArrayLike<T>;
export function IsArrayLike(x: any): x is ArrayLike<any>;
export function IsArrayLike(x: any): x is ArrayLike<any> {
    return x !== null && typeof x === "object" && typeof x.length === "number";
}

export function IsIterable<T>(x: Iterable<T> | ArrayLike<T>): x is Iterable<T>;
export function IsIterable(x: any): x is Iterable<any>;
export function IsIterable(x: any): x is Iterable<any> {
    return IsObject(x) && Symbol.iterator in x;
}

export function IsOrderedIterable<T>(source: Iterable<T>): source is OrderedIterable<T> {
    return IsIterable(source)
        && (source instanceof OrderByIterable
            || (typeof (<OrderedIterable<T>>source).getSorter === "function"
                && typeof (<OrderedIterable<T>>source).unordered === "function"));
}

export function GetUnorderedIterable<T>(source: Iterable<T>): Iterable<T> {
    while (IsOrderedIterable(source)) {
        source = source.unordered();
    }
    return source;
}

export function GetIterator<T>(iterable: Iterable<T>): Iterator<T> {
    return iterable[Symbol.iterator]();
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

export function ToIterable<T>(queryable: Queryable<T>): Iterable<T> {
    return IsIterable(queryable) ? queryable : new ArrayLikeIterable(queryable);
}

export function CreateGroupings<T, K, V = T>(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V = Identity): Map<K, V[]> {
    const map = new Map<K, V[]>();
    for (let item of source) {
        let key = keySelector(item);
        let element = elementSelector(item);
        let grouping = map.get(key);
        if (grouping == null) {
            grouping = [];
            map.set(key, grouping);
        }
        grouping.push(element);
    }
    return map;
}

export function ToGrouping<K, V>(key: K, elements: Iterable<V>): Grouping<K, V> {
    return new Grouping<K, V>(key, elements);
}
