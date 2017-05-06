import { GetIterator, IteratorClose, SameValue, Identity, CreateGroupings, ToIterable, CompareValues, IsOrderedIterable } from "./utils";
import { Query, Page, HierarchyProvider, Lookup } from "./query";
import * as Assert from "./assert";

/**
 * Represents an object that is either iterable or array-like.
 */
export type Queryable<T> = Iterable<T> | ArrayLike<T>;

export interface OrderedIterable<T> extends Iterable<T> {
    unordered(): Iterable<T>;
    getSorter(elements: ReadonlyArray<T>, next?: (x: number, y: number) => number): (x: number, y: number) => number;
}

export class EmptyIterable<T> implements Iterable<T> {
    public *[Symbol.iterator](): Iterator<T> {
    }
}

export class ArrayLikeIterable<T> implements Iterable<T> {
    private _source: ArrayLike<T>;

    constructor(source: ArrayLike<T>) {
        this._source = source;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        for (let i = 0; i < source.length; ++i) {
            yield source[i];
        }
    }
}

export class OnceIterable<T> implements Iterable<T> {
    private _value: T;

    constructor(value: T) {
        this._value = value;
    }

    public *[Symbol.iterator](): Iterator<T> {
        yield this._value;
    }
}

export class RepeatIterable<T> implements Iterable<T> {
    private _value: T;
    private _count: number;

    constructor(value: T, count: number) {
        this._value = value;
        this._count = count;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const value = this._value;
        for (let count = this._count; count > 0; --count) {
            yield value;
        }
    }
}

export class RangeIterable implements Iterable<number> {
    private _start: number;
    private _end: number;
    private _increment: number;

    constructor(start: number, end: number, increment: number) {
        this._start = start;
        this._end = end;
        this._increment = increment;
    }

    public *[Symbol.iterator](): Iterator<number> {
        const end = this._end;
        const increment = this._increment;
        for (let i = this._start; i <= end; i += increment) {
            yield i;
        }
    }
}

export class ReverseRangeIterable implements Iterable<number> {
    private _start: number;
    private _end: number;
    private _increment: number;

    constructor(start: number, end: number, increment: number) {
        this._start = start;
        this._end = end;
        this._increment = increment;
    }

    public *[Symbol.iterator](): Iterator<number> {
        const end = this._end;
        const increment = this._increment;
        for (let i = this._start; i >= end; i -= increment) {
            yield i;
        }
    }
}

export class ContinuousIterable<T> implements Iterable<T> {
    private _value: T;

    constructor(value: T) {
        this._value = value;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const value = this._value;
        while (true) {
            yield value;
        }
    }
}

export class GenerateIterable<T> implements Iterable<T> {
    private _count: number;
    private _generator: (offset: number) => T;

    constructor(count: number, generator: (offset: number) => T) {
        this._count = count;
        this._generator = generator;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const count = this._count;
        const generator = this._generator;
        for (let i = 0; i < count; i++) {
            yield generator(i);
        }
    }
}

export class AppendIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _value: T;

    constructor(source: Iterable<T>, value: T) {
        this._source = source;
        this._value = value;
    }

    public *[Symbol.iterator](): Iterator<T> {
        yield* this._source;
        yield this._value;
    }
}

export class PrependIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _value: T;

    constructor(value: T, source: Iterable<T>) {
        this._value = value;
        this._source = source;
    }

    public *[Symbol.iterator](): Iterator<T> {
        yield this._value;
        yield* this._source;
    }
}

export class PatchIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _start: number;
    private _skipCount: number;
    private _range: Iterable<T>;

    constructor(source: Iterable<T>, start: number, skipCount: number, range: Iterable<T>) {
        this._source = source;
        this._start = start;
        this._skipCount = skipCount;
        this._range = range;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const start = this._start;
        const skipCount = this._skipCount;
        const range = this._range;
        let offset = 0;
        let iterator = GetIterator(this._source);
        try {
            // yield the starting elements
            while (iterator !== undefined && offset < start) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                }
                else {
                    yield value;
                    offset++;
                }
            }

            // skip elements to be removed
            while (iterator !== undefined && offset < start + skipCount) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                }
                else {
                    offset++;
                }
            }

            // yield the patched range
            yield* range;

            // yield the remaining elements
            while (iterator !== undefined) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                }
                else {
                    yield value;
                }
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
}

export class ConsumeIterable<T> implements Iterable<T> {
    private _source: Iterator<T>;

    constructor(source: Iterator<T>) {
        this._source = source;
    }

    public *[Symbol.iterator](): Iterator<T> {
        if (this._source === undefined) {
            return;
        }

        try {
            while (this._source !== undefined) {
                const result = this._source.next(), done = result.done, value = result.value;
                if (done) {
                    this._source = undefined;
                    return;
                }

                yield value;
            }
        }
        finally {
            const source = this._source;
            this._source = undefined;
            IteratorClose(source);
        }
    }
}

export class BranchIterable<T> implements Iterable<T> {
    private _condition: () => boolean;
    private _thenIterable: Iterable<T>;
    private _elseIterable: Iterable<T>;

    constructor(condition: () => boolean, thenIterable: Iterable<T>, elseIterable: Iterable<T>) {
        this._condition = condition;
        this._thenIterable = thenIterable;
        this._elseIterable = elseIterable;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const condition = this._condition;
        const iterable = condition() ? this._thenIterable : this._elseIterable;
        yield* iterable;
    }
}

export class ChooseIterable<K, T> implements Iterable<T> {
    private _chooser: () => K;
    private _choices: Lookup<K, T>;
    private _otherwise: Iterable<T>;

    constructor(chooser: () => K, choices: Iterable<[K, Queryable<T>]>, otherwise: Iterable<T>) {
        this._chooser = chooser;
        this._choices = new Lookup(choices);
        this._otherwise = otherwise;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const chooser = this._chooser;
        const choices = this._choices;
        const otherwise = this._otherwise;
        const choice = chooser();
        if (choices.has(choice)) {
            yield* choices.get(choice);
        }
        else if (otherwise) {
            yield* otherwise;
        }
    }
}

export class FilterIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _predicate: (element: T, offset: number) => boolean;

    constructor(source: Iterable<T>, predicate: (element: T, offset: number) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const predicate = this._predicate;
        let offset = 0;
        for (const element of source) {
            if (predicate(element, offset++)) {
                yield element;
            }
        }
    }
}

export class MapIterable<T, U> implements Iterable<U> {
    private _source: Iterable<T>;
    private _selector: (element: T, offset: number) => U;

    constructor(source: Iterable<T>, selector: (element: T, offset: number) => U) {
        this._source = source;
        this._selector = selector;
    }

    public *[Symbol.iterator](): Iterator<U> {
        const source = this._source;
        const selector = this._selector;
        let offset = 0;
        for (const element of source) {
            yield selector(element, offset++);
        }
    }
}

export class FlatMapIterable<T, U> implements Iterable<U> {
    private _source: Iterable<T>;
    private _projection: (element: T) => Queryable<U>;

    constructor(source: Iterable<T>, projection: (element: T) => Queryable<U>) {
        this._source = source;
        this._projection = projection;
    }

    public *[Symbol.iterator](): Iterator<U> {
        const source = this._source;
        const projection = this._projection;
        for (const element of source) {
            yield* ToIterable(projection(element));
        }
    }
}

export class ExpandIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _projection: (element: T) => Queryable<T>;

    constructor(source: Iterable<T>, projection: (element: T) => Queryable<T>) {
        this._source = source;
        this._projection = projection;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const projection = this._projection;
        const queue: Iterable<T>[] = [this._source];
        while (queue.length) {
            const source = queue.shift();
            for (const element of source) {
                queue.push(ToIterable(projection(element)));
                yield element;
            }
        }
    }
}

export class TapIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _callback: (element: T, offset: number) => void;

    constructor(source: Iterable<T>, callback: (element: T, offset: number) => void) {
        this._source = source;
        this._callback = callback;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const callback = this._callback;
        let offset = 0;
        for (const element of source) {
            callback(element, offset++);
            yield element;
        }
    }
}

export class ReverseIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;

    constructor(source: Iterable<T>) {
        this._source = source;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const list = Array.from<T>(this._source);
        for (let i = list.length - 1; i >= 0; --i) {
            yield list[i];
        }
    }
}

export class SkipIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _count: number;

    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        let remaining = this._count;
        if (remaining <= 0) {
            yield* source;
        }
        else {
            for (const element of source) {
                if (remaining > 0) {
                    remaining--;
                }
                else {
                    yield element;
                }
            }
        }
    }
}

export class SkipRightIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _count: number;

    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const pending: T[] = [];
        const count = this._count;
        if (count <= 0) {
            yield* source;
        }
        else {
            for (const element of source) {
                pending.push(element);
                if (pending.length > count) {
                    yield pending.shift();
                }
            }
        }
    }
}

export class SkipWhileIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _predicate: (element: T) => boolean;

    constructor(source: Iterable<T>, predicate: (element: T) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const predicate = this._predicate;
        let skipping = true;
        for (const element of source) {
            if (skipping) {
                skipping = predicate(element);
            }
            if (!skipping) {
                yield element;
            }
        }
    }
}

export class TakeIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _count: number;

    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        let remaining = this._count;
        if (remaining > 0) {
            for (const element of source) {
                yield element;
                if (--remaining <= 0) {
                    break;
                }
            }
        }
    }
}

export class TakeRightIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _count: number;

    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const pending: T[] = [];
        const count = this._count;
        if (count <= 0) {
            return;
        }
        else {
            for (const element of source) {
                pending.push(element);
                if (pending.length > count) {
                    pending.shift();
                }
            }

            yield* pending;
        }
    }
}

export class TakeWhileIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _predicate: (element: T) => boolean;

    constructor(source: Iterable<T>, predicate: (element: T) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const predicate = this._predicate;
        for (const element of source) {
            if (!predicate(element)) {
                break;
            }

            yield element;
        }
    }
}

export class IntersectIterable<T> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;

    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const left = this._left;
        const right = this._right;
        const set = new Set(right);
        if (set.size <= 0) {
            return;
        }

        for (const element of left) {
            if (set.delete(element)) {
                yield element;
            }
        }
    }
}

export class UnionIterable<T> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;

    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const left = this._left;
        const right = this._right;
        const set = new Set<T>();
        for (const element of left) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }

        for (const element of right) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
    }
}

export class ExceptIterable<T> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;

    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const left = this._left;
        const right = this._right;
        const set = new Set<T>(right);
        for (const element of left) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
    }
}

export class DistinctIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;

    constructor(source: Iterable<T>) {
        this._source = source;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const set = new Set<T>();
        for (const element of source) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
    }
}

export class ConcatIterable<T> implements Iterable<T> {
    private _left: Iterable<T>;
    private _right: Iterable<T>;

    constructor(left: Iterable<T>, right: Iterable<T>) {
        this._left = left;
        this._right = right;
    }

    public *[Symbol.iterator](): Iterator<T> {
        yield* this._left;
        yield* this._right;
    }
}

export class ZipIterable<T, U, R> implements Iterable<R> {
    private _left: Iterable<T>;
    private _right: Iterable<U>;
    private _selector: (left: T, right: U) => R;

    constructor(left: Iterable<T>, right: Iterable<U>, selector: (left: T, right: U) => R) {
        this._left = left;
        this._right = right;
        this._selector = selector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const left = this._left;
        const right = this._right;
        const selector = this._selector;
        let leftIterator = GetIterator(left);
        try {
            let rightIterator = GetIterator(right);
            try {
                while (true) {
                    const leftResult = leftIterator.next(), leftDone = leftResult.done, leftValue = leftResult.value;
                    const rightResult = rightIterator.next(), rightDone = rightResult.done, rightValue = rightResult.value;
                    if (leftDone) {
                        leftIterator = undefined;
                    }

                    if (rightDone) {
                        rightIterator = undefined;
                    }

                    if (leftDone || rightDone) {
                        break;
                    }

                    yield selector(leftValue, rightValue);
                }
            }
            finally {
                IteratorClose(rightIterator);
            }
        }
        finally {
            IteratorClose(leftIterator);
        }
    }
}

export class OrderByIterable<T, K> implements OrderedIterable<T> {
    private _source: Iterable<T>;
    private _keySelector: (element: T) => K;
    private _comparison: (x: K, y: K) => number;
    private _descending: boolean;
    private _parent: OrderedIterable<T>;

    constructor(source: Iterable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean, parent?: OrderedIterable<T>) {
        this._source = source;
        this._keySelector = keySelector;
        this._comparison = comparison;
        this._descending = descending;
        this._parent = parent;
    }

    public unordered() {
        return IsOrderedIterable(this._source) ? this._source.unordered() : this._source;
    }

    public getSorter(elements: ReadonlyArray<T>, next: (x: number, y: number) => number = CompareValues): (x: number, y: number) => number {
        const keySelector = this._keySelector;
        const comparison = this._comparison;
        const descending = this._descending;
        const parent = this._parent;
        const len = elements.length;
        const keys = elements.map(keySelector);
        const sorter = (x: number, y: number): number => (comparison(keys[x], keys[y]) * (descending ? -1 : +1)) || next(x, y);
        return parent ? parent.getSorter(elements, sorter) : sorter;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this.unordered();
        const array = Array.from<T>(source);
        const sorter = this.getSorter(array);
        const len = array.length;
        const indices = new Array<number>(len);
        for (let i = 0; i < len; ++i) {
            indices[i] = i;
        }
        indices.sort(sorter);
        for (const index of indices) {
            yield array[index];
        }
    }
}

export class SpanMapIterable<T, K, V, R> implements Iterable<R> {
    private _source: Iterable<T>;
    private _keySelector: (element: T) => K;
    private _elementSelector: (element: T) => V;
    private _spanSelector: (key: K, elements: Query<V>) => R;

    constructor(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, spanSelector: (key: K, elements: Query<V>) => R) {
        this._source = source;
        this._keySelector = keySelector;
        this._elementSelector = elementSelector;
        this._spanSelector = spanSelector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const source = this._source;
        const keySelector = this._keySelector;
        const elementSelector = this._elementSelector;
        const spanSelector = this._spanSelector;
        let span: V[];
        let hasElements = false;
        let previousKey: K;
        for (const element of source) {
            const key = keySelector(element);
            if (!hasElements) {
                previousKey = key;
                hasElements = true;
                span = [];
            }
            else if (!SameValue(previousKey, key)) {
                yield spanSelector(previousKey, new Query(span));
                span = [];
                previousKey = key;
            }

            span.push(elementSelector(element));
        }

        if (span) {
            yield spanSelector(previousKey, new Query(span));
        }
    }
}

export class GroupByIterable<T, K, V, R> implements Iterable<R> {
    private _source: Iterable<T>;
    private _keySelector: (element: T) => K;
    private _elementSelector: (element: T) => V;
    private _resultSelector: (key: K, elements: Query<V>) => R;

    constructor(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R) {
        this._source = source;
        this._keySelector = keySelector;
        this._elementSelector = elementSelector;
        this._resultSelector = resultSelector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const source = this._source;
        const keySelector = this._keySelector;
        const elementSelector = this._elementSelector;
        const resultSelector = this._resultSelector;
        const map = CreateGroupings(source, keySelector, elementSelector);
        for (const element of map) {
            const key = element[0], values = element[1];
            yield resultSelector(key, new Query(values));
        }
    }
}

export class GroupJoinIterable<O, I, K, R> implements Iterable<R> {
    private _outer: Iterable<O>;
    private _inner: Iterable<I>;
    private _outerKeySelector: (element: O) => K;
    private _innerKeySelector: (element: I) => K;
    private _resultSelector: (outer: O, inner: Query<I>) => R;

    constructor(outer: Iterable<O>, inner: Iterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: Query<I>) => R) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const outer = this._outer;
        const inner = this._inner;
        const outerKeySelector = this._outerKeySelector;
        const innerKeySelector = this._innerKeySelector;
        const resultSelector = this._resultSelector;
        const map = CreateGroupings(inner, innerKeySelector, Identity);
        for (const outerElement of outer) {
            const outerKey = outerKeySelector(outerElement);
            const innerElements = map.has(outerKey) ? <Iterable<I>>map.get(outerKey) : new EmptyIterable<I>();
            yield resultSelector(outerElement, new Query(innerElements));
        }
    }
}

export class JoinIterable<O, I, K, R> implements Iterable<R> {
    private _outer: Iterable<O>;
    private _inner: Iterable<I>;
    private _outerKeySelector: (element: O) => K;
    private _innerKeySelector: (element: I) => K;
    private _resultSelector: (outer: O, inner: I) => R;

    constructor(outer: Iterable<O>, inner: Iterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: I) => R) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const outer = this._outer;
        const inner = this._inner;
        const outerKeySelector = this._outerKeySelector;
        const innerKeySelector = this._innerKeySelector;
        const resultSelector = this._resultSelector;
        const map = CreateGroupings(inner, innerKeySelector, Identity);
        for (const outerElement of outer) {
            const outerKey = outerKeySelector(outerElement);
            const innerElements = map.get(outerKey);
            if (innerElements != undefined) {
                for (const innerElement of innerElements) {
                    yield resultSelector(outerElement, innerElement);
                }
            }
        }
    }
}

export class FullJoinIterable<O, I, K, R> implements Iterable<R> {
    private _outer: Iterable<O>;
    private _inner: Iterable<I>;
    private _outerKeySelector: (element: O) => K;
    private _innerKeySelector: (element: I) => K;
    private _resultSelector: (outer: O | undefined, inner: I | undefined) => R;

    constructor(outer: Iterable<O>, inner: Iterable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O | undefined, inner: I | undefined) => R) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerKeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const outer = this._outer;
        const inner = this._inner;
        const outerKeySelector = this._outerKeySelector;
        const innerKeySelector = this._innerKeySelector;
        const resultSelector = this._resultSelector;
        const outerLookup = CreateGroupings(outer, outerKeySelector, Identity);
        const innerLookup = CreateGroupings(inner, innerKeySelector, Identity);
        const keys = new UnionIterable(outerLookup.keys(), innerLookup.keys());
        for (const key of keys) {
            const outer = outerLookup.get(key) || new OnceIterable<O>(undefined);
            const inner = innerLookup.get(key) || new OnceIterable<I>(undefined);
            for (const outerElement of outer) {
                for (const innerElement of inner) {
                    yield resultSelector(outerElement, innerElement);
                }
            }
        }
    }
}

export class ScanIterable<T, U = U> implements Iterable<U> {
    private _source: Iterable<T>;
    private _aggregator: (aggregate: T | U, element: T, offset: number) => U;
    private _isSeeded: boolean;
    private _seed: T | U;

    constructor(source: Iterable<T>, aggregator: (aggregate: T | U, element: T, offset: number) => U, isSeeded: boolean, seed: T | U) {
        this._source = source;
        this._aggregator = aggregator;
        this._isSeeded = isSeeded;
        this._seed = seed;
    }

    public *[Symbol.iterator](): Iterator<U> {
        const aggregator = this._aggregator;
        let isSeeded = this._isSeeded;
        let aggregate = this._seed;
        let iterator = GetIterator(this._source);
        let offset = 0;
        try {
            while (true) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                    break;
                }

                if (!isSeeded) {
                    aggregate = value;
                    isSeeded = true;
                    offset++;
                    continue;
                }

                aggregate = aggregator(aggregate, value, offset);
                yield aggregate;
                offset++;
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
}

export class ScanRightIterable<T, U = T> implements Iterable<U> {
    private _source: Iterable<T>;
    private _aggregator: (aggregate: T | U, element: T, offset: number) => U;
    private _isSeeded: boolean;
    private _seed: T | U;

    constructor(source: Iterable<T>, aggregator: (aggregate: T | U, element: T, offset: number) => U, isSeeded: boolean, seed: U) {
        this._source = source;
        this._aggregator = aggregator;
        this._isSeeded = isSeeded;
        this._seed = seed;
    }

    public *[Symbol.iterator](): Iterator<U> {
        const source = Array.from(this._source);
        const aggregator = this._aggregator;
        let isSeeded = this._isSeeded;
        let aggregate = this._seed;
        for (let offset = source.length - 1; offset >= 0; offset--) {
            const value = source[offset];
            if (!isSeeded) {
                aggregate = value;
                isSeeded = true;
                continue;
            }

            aggregate = aggregator(aggregate, value, offset);
            yield aggregate;
        }
    }
}

export class LookupIterable<K, V, R> implements Iterable<R> {
    private _map: Map<K, Queryable<V>>;
    private _selector: (key: K, elements: Query<V>) => R;

    constructor(map: Map<K, Queryable<V>>, selector: (key: K, elements: Query<V>) => R) {
        this._map = map;
        this._selector = selector;
    }

    public *[Symbol.iterator](): Iterator<R> {
        const map = this._map;
        const selector = this._selector;
        for (const element of map) {
            const key = element[0], values = element[1];
            yield selector(key, new Query<V>(values));
        }
    }
}

export class DefaultIfEmptyIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _defaultValue: T;

    constructor(source: Iterable<T>, defaultValue: T) {
        this._source = source;
        this._defaultValue = defaultValue;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const defaultValue = this._defaultValue;
        let iterator = GetIterator(source);
        let hasElements = false;
        try {
            while (true) {
                const iterResult = iterator.next();
                if (iterResult.done) {
                    iterator = undefined;
                    if (!hasElements) {
                        yield defaultValue;
                    }

                    return;
                }
                else {
                    hasElements = true;
                    yield iterResult.value;
                }
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
}

export class DefaultSequenceIfEmptyIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _defaultValues: Iterable<T>;

    constructor(source: Iterable<T>, defaultValues: Iterable<T>) {
        this._source = source;
        this._defaultValues = defaultValues;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const defaultValues = this._defaultValues;
        let iterator = GetIterator(source);
        let hasElements = false;
        try {
            while (true) {
                const iterResult = iterator.next();
                if (iterResult.done) {
                    iterator = undefined;
                    if (!hasElements) {
                        yield* defaultValues;
                    }
                    return;
                }
                else {
                    hasElements = true;
                    yield iterResult.value;
                }
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
}

export class PageByIterable<T> implements Iterable<Page<T>> {
    private _source: Iterable<T>;
    private _pageSize: number;

    constructor(source: Iterable<T>, pageSize: number) {
        this._source = source;
        this._pageSize = pageSize;
    }

    public *[Symbol.iterator](): Iterator<Page<T>> {
        const pageSize = this._pageSize;
        let iterator = GetIterator(this._source);
        try {
            let elements: T[] = [];
            let page = 0;
            while (true) {
                const result = iterator.next(), done = result.done, value = result.value;
                if (done) {
                    iterator = undefined;
                    break;
                }

                elements.push(value);
                if (elements.length >= pageSize) {
                    yield new Page(page, page * pageSize, elements);
                    elements = [];
                    page++;
                }
            }

            if (elements.length > 0) {
                yield new Page(page, page * pageSize, elements);
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
}

class HierarchyProviderView<T> {
    public hierarchy: HierarchyProvider<T>;

    constructor (hierarchy: HierarchyProvider<T>) {
        Assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
        this.hierarchy = hierarchy;
    }

    public root(element: T) {
        if (element !== undefined) {
            let root: T;
            for (const ancestor of this.ancestors(element, /*self*/ true)) {
                root = ancestor;
            }

            return root;
        }

        return undefined;
    }

    public * ancestors(element: T, self: boolean) {
        Assert.mustBeBoolean(self, "self");
        if (element !== undefined) {
            let ancestor = self ? element : this.parent(element);
            while (ancestor !== undefined) {
                yield ancestor;
                ancestor = this.parent(ancestor);
            }
        }
    }

    public parent(element: T) {
        if (element !== undefined) {
            return this.hierarchy.parent(element);
        }

        return undefined;
    }

    public * children(element: T) {
        if (element !== undefined) {
            const children = this.hierarchy.children(element);
            if (children !== undefined) {
                for (const child of ToIterable(children)) {
                    if (child !== undefined) {
                        yield child;
                    }
                }
            }
        }
    }

    public nthChild(element: T, offset: number) {
        Assert.mustBeInteger(offset, "offset");
        if (element !== undefined) {
            const children = this.children(element);
            return Query.from(children).elementAt(offset);
        }

        return undefined;
    }

    public * siblings(element: T, self: boolean) {
        Assert.mustBeBoolean(self, "self");
        const parent = this.parent(element);
        if (parent !== undefined) {
            for (const child of this.children(parent)) {
                if (self || !SameValue(child, element)) {
                    yield child;
                }
            }
        }
    }

    public * siblingsBeforeSelf(element: T) {
        for (const sibling of this.siblings(element, /*self*/ true)) {
            if (SameValue(sibling, element)) {
                return;
            }

            yield sibling;
        }
    }

    public * siblingsAfterSelf(element: T) {
        let hasSeenSelf: boolean;
        for (const sibling of this.siblings(element, /*self*/ true)) {
            if (hasSeenSelf) {
                yield sibling;
            }
            else {
                hasSeenSelf = SameValue(sibling, element);
            }
        }
    }

    // NOTE: Currently disabled as View is not public and these are inefficient.
    //
    // public firstChild(element: T) {
    //     if (element !== undefined) {
    //         for (const child of this.children(element)) {
    //             return child;
    //         }
    //     }

    //     return undefined;
    // }

    // public lastChild(element: T) {
    //     if (element !== undefined) {
    //         let lastChild: T;
    //         for (const child of this.children(element)) {
    //             lastChild = child;
    //         }

    //         return lastChild;
    //     }

    //     return undefined;
    // }

    // public previousSibling(element: T) {
    //     if (element !== undefined) {
    //         let previousSibling: T;
    //         for (const sibling of this.siblings(element, /*self*/ true)) {
    //             if (SameValue(sibling, element)) {
    //                 return previousSibling;
    //             }

    //             previousSibling = sibling;
    //         }
    //     }

    //     return undefined;
    // }

    // public nextSibling(element: T) {
    //     if (element !== undefined) {
    //         let hasSeenSelf: boolean;
    //         for (const sibling of this.siblings(element, /*self*/ true)) {
    //             if (hasSeenSelf) {
    //                 return sibling;
    //             }

    //             if (SameValue(sibling, element)) {
    //                 hasSeenSelf = true;
    //             }
    //         }
    //     }

    //     return undefined;
    // }

    public * descendants(element: T, self: boolean): IterableIterator<T> {
        Assert.mustBeBoolean(self, "self");
        if (element !== undefined) {
            if (self) {
                yield element;
            }

            for (const child of this.children(element)) {
                yield* this.descendants(child, /*self*/ true);
            }
        }
    }
}

class NthChildIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _hierarchy: HierarchyProviderView<T>;
    private _offset: number;

    constructor(source: Iterable<T>, hierarchy: HierarchyProviderView<T>, offset: number) {
        this._source = source;
        this._hierarchy = hierarchy;
        this._offset = offset;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const hierarchy = this._hierarchy;
        const offset = this._offset;
        for (const element of source) {
            const child = hierarchy.nthChild(element, offset);
            if (child !== undefined) {
                yield child;
            }
        }
    }
}

class HierarchyAxisIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _hierarchy: HierarchyProviderView<T>;
    private _predicate: (element: T) => boolean;
    private _axis: (provider: HierarchyProviderView<T>, element: T) => Iterable<T>;
    constructor(source: Iterable<T>, hierarchy: HierarchyProviderView<T>, predicate: (element: T) => boolean, axis: (provider: HierarchyProviderView<T>, element: T) => Iterable<T>) {
        this._source = source;
        this._hierarchy = hierarchy;
        this._predicate = predicate;
        this._axis = axis;
    }
    public *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const hierarchy = this._hierarchy;
        const predicate = this._predicate;
        const axis = this._axis;
        for (const element of source) {
            for (const related of axis(hierarchy, element)) {
                if (!predicate || predicate(related)) {
                    yield related;
                }
            }
        }
    }
}

class TopMostIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _hierarchy: HierarchyProviderView<T>;

    constructor(source: Iterable<T>, hierarchy: HierarchyProviderView<T>) {
        this._source = source;
        this._hierarchy = hierarchy;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const topMostNodes = Array.from(this._source);
        const ancestors = new Map<T, Set<T>>();
        for (let i = topMostNodes.length - 1; i >= 1; i--) {
            const node = topMostNodes[i];
            for (let j = i - 1; j >= 0; j--) {
                const other = topMostNodes[j];
                let ancestorsOfNode = ancestors.get(node);
                if (!ancestorsOfNode) {
                    ancestorsOfNode = new Set(this._hierarchy.ancestors(node, /*self*/ false));
                    ancestors.set(node, ancestorsOfNode);
                }

                if (ancestorsOfNode.has(other)) {
                    topMostNodes.splice(i, 1);
                    break;
                }

                let ancestorsOfOther = ancestors.get(other);
                if (!ancestorsOfOther) {
                    ancestorsOfOther = new Set(this._hierarchy.ancestors(other, /*self*/ false));
                    ancestors.set(other, ancestorsOfOther);
                }

                if (ancestorsOfOther.has(node)) {
                    topMostNodes.splice(j, 1);
                    i--;
                }
            }
        }

        yield* topMostNodes;
    }
}

class BottomMostIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _hierarchy: HierarchyProviderView<T>;

    constructor(source: Iterable<T>, hierarchy: HierarchyProviderView<T>) {
        this._source = source;
        this._hierarchy = hierarchy;
    }

    public *[Symbol.iterator](): Iterator<T> {
        const bottomMostNodes = Array.from(this._source);
        const ancestors = new Map<T, Set<T>>();
        for (let i = bottomMostNodes.length - 1; i >= 1; i--) {
            const node = bottomMostNodes[i];
            for (let j = i - 1; j >= 0; j--) {
                const other = bottomMostNodes[j];
                let ancestorsOfOther = ancestors.get(other);
                if (!ancestorsOfOther) {
                    ancestorsOfOther = new Set(this._hierarchy.ancestors(other, /*self*/ false));
                    ancestors.set(other, ancestorsOfOther);
                }

                if (ancestorsOfOther.has(node)) {
                    bottomMostNodes.splice(i, 1);
                    break;
                }

                let ancestorsOfNode = ancestors.get(node);
                if (!ancestorsOfNode) {
                    ancestorsOfNode = new Set(this._hierarchy.ancestors(node, /*self*/ false));
                    ancestors.set(node, ancestorsOfNode);
                }

                if (ancestorsOfNode.has(other)) {
                    bottomMostNodes.splice(j, 1);
                    i--;
                }
            }
        }

        yield* bottomMostNodes;
    }
}
