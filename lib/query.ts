/*! 
  Copyright 2014 Ron Buckton (rbuckton@outlook.com) 

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
"use strict";

// internal symbols
const symQuerySource = Symbol("Query.source");
const symGroupingKey = Symbol("GroupingQueryable.key");
const symLookupMap = Symbol("LookupQueryable.map");
const symHierarchyProvider = Symbol("Hierarchy.hierarchy");

class EmptyIterable<T> implements Iterable<T> {
    public *[Symbol.iterator](): Iterator<T> {
        return;
    }
}

const emptyIterable = new EmptyIterable<any>();

class ArrayLikeIterable<T> implements Iterable<T> {
    constructor(
        private source: ArrayLike<T>) {     
    }

    public *[Symbol.iterator](): Iterator<T> {
        let source = this.source;
        for (let i = 0; i < source.length; ++i) {
            yield source[i];
        }
        return;
    }
}

class OnceIterable<T> implements Iterable<T> {
    constructor(private value: T) {
    }

    public *[Symbol.iterator](): Iterator<T> {
        yield this.value;
        return;
    }
}

class RepeatIterable<T> implements Iterable<T> {
    constructor (private value: T, private count: number) {     
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { value, count } = this;
        for (let i = 0; i < count; i++) {
            yield value;
        }
        return;
    }
}

class RangeIterable implements Iterable<number> {
    constructor(private start: number, private end: number) {
    }

    public *[Symbol.iterator](): Iterator<number> {
        let { start, end } = this;
        if (start <= end) {
            for (var i = start; i <= end; --i) {
                yield i;
            }
        }
        else {
            for (var i = start; i >= end; --i) {
                yield i;
            }
        }
        return;
    }
}

class FilterIterable<T> implements Iterable<T> {
    constructor(private source: Iterable<T>, private predicate: (element: T, offset: number) => boolean) {
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { source, predicate } = this;
        let offset = 0;
        for (let element of source) {
            if (predicate(element, offset++)) {
                yield element;
            }
        }
        return;
    }
}

class MapIterable<T, U> implements Iterable<U> {
    constructor(private source: Iterable<T>, private projection: (element: T, offset: number) => U) {
    }

    public *[Symbol.iterator](): Iterator<U> {
        let { source, projection } = this;
        let offset = 0;
        for (let element of source) {
            yield projection(element, offset++);
        }
        return;
    }
}

class FlatMapIterable<T, U> implements Iterable<U> {
    constructor(private source: Iterable<T>, private projection: (element: T) => Iterable<U>) { 
    }

    public *[Symbol.iterator](): Iterator<U> {
        let { source, projection } = this;
        for (let element of source) {
            yield* projection(element);
        }
        return;
    }
}

class ReverseIterable<T> implements Iterable<T> {
    constructor(private source: Iterable<T>) {      
    }

    public *[Symbol.iterator](): Iterator<T> {
        let list = Array.from<T>(this.source);
        for (let i = list.length - 1; i >= 0; --i) {
            yield list[i];
        }
        return;
    }
}

class SkipIterable<T> implements Iterable<T> {
    constructor(private source: Iterable<T>, private count: number) {       
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { source, count } = this;
        let skipping = true;
        let offset = 0;
        for (let element of source) {
            if (skipping) {
                skipping = ++offset < count;
            }
            if (!skipping) {
                yield element;
            }
        }
        return;
    }
}

class SkipWhileIterable<T> implements Iterable<T> {
    constructor(private source: Iterable<T>, private predicate: (element: T) => boolean) {      
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { source, predicate } = this;
        let skipping = true;
        for (let element of source) {
            if (skipping) {
                skipping = predicate(element);
            }
            if (!skipping) {
                yield item;
            }
        }
        return;
    }
}

class TakeIterable<T> implements Iterable<T> {
    constructor(private source: Iterable<T>, private count: number) {       
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { source, count } = this;
        if (count <= 0) {
            return;
        }
        let offset = 0;
        for (let element of source) {
            yield element;
            if (offset++ < count) {
                break;
            }
        }
        return;
    }
}

class TakeWhileIterable<T> implements Iterable<T> {
    constructor(private source: Iterable<T>, private predicate: (element: T) => boolean) {      
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { source, predicate } = this;     
        for (let element of source) {
            if (!predicate(element)) {
                break;
            }

            yield item;
        }
        return;
    }
}

class IntersectIterable<T> implements Iterable<T> {
    constructor(private left: Iterable<T>, private right: Iterable<T>) {        
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { left, right } = this;
        let set = new Set(right);
        if (set.size <= 0) {
            return;
        }
        for (let element of left) {
            if (set.delete(element)) {
                yield element;
            }
        }
        return;
    }
}

class UnionIterable<T> implements Iterable<T> {
    constructor (private left: Iterable<T>, private right: Iterable<T>) {       
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { left, right } = this;
        let set = new Set<T>();
        for (let element of left) {
            if (SetAdd(set, element)) {
                yield element;
            }
        }
        for (let element of right) {
            if (SetAdd(set, element)) {
                yield element;
            }
        }
        return;
    }
}

class ExceptIterable<T> implements Iterable<T> {
    constructor(private left: Iterable<T>, private right: Iterable<T>) {        
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { left, right } = this;
        let set = new Set<T>(right);
        for (let element of left) {
            if (SetAdd(set, element)) {
                yield element;
            }
        }
        return;
    }
}

class DistinctIterable<T> implements Iterable<T> {
    constructor(private source: Iterable<T>) {      
    }

    public *[Symbol.iterator](): Iterator<T> {
        let set = new Set<T>();
        for (let element of this.source) {
            if (SetAdd(set, element)) {
                yield element;
            }
        }
        return;
    }
}

class ConcatIterable<T> implements Iterable<T> {
    constructor(private left: Iterable<T>, private right: Iterable<T>) {        
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { left, right } = this;
        yield* left;
        yield* right;
        return;
    }
}

class ZipIterable<T, U, R> implements Iterable<R> {
    constructor(private left: Iterable<T>, private right: Iterable<U>, private selector: (left: T, right: U) => R) {        
    }

    public *[Symbol.iterator](): Iterator<R> {
        let { left, right, selector } = this;
        let leftIterator = GetIterator(left);
        try {
            let rightIterator = GetIterator(right);
            try {
                let leftIterResult = leftIterator.next();
                let rightIterResult = rightIterator.next();
                while (!leftIterResult.done && !rightIterResult.done) {
                    yield selector(leftIterResult.value, rightIterResult.value);
                    leftIterResult = leftIterator.next();
                    rightIterResult = rightIterator.next();
                }
            }
            finally {
                IteratorClose(rightIterator);
            }
        }
        finally {
            IteratorClose(leftIterator);
        }
        return;
    }
}

class OrderedIterable<T, K> implements Iterable<T> {
    constructor(
        public source: Iterable<T>,
        private keySelector: (element: T) => K,
        private comparison: (x: K, y: K) => number,
        private descending: boolean,
        private parent?: OrderedIterable<T, any>) {
    }

    public getSorter(elements: T[], next?: (x: number, y: number) => number): (x: number, y: number) => number {
        let { keySelector, comparison, descending, parent } = this;
        let len = elements.length;
        let keys = elements.map(this.keySelector);
        const sorter = (x: number, y: number): number => {
            let result = comparison(keys[x], keys[y]);
            if (result === 0) {
                return next ? next(x, y) : x - y;
            }
            return descending ? -result : result;
        };
        return parent ? parent.getSorter(elements, sorter) : sorter;
    }

    public *[Symbol.iterator](): Iterator<T> {
        let array = Array.from<T>(this.source);
        let sorter = this.getSorter(array);
        let len = array.length;
        let indices = new Array<number>(len);
        for (let i = 0; i < len; ++i) {
            indices[i] = i;
        }
        indices.sort(sorter);
        for (let index of indices) {
            yield array[index];
        }
        return;
    }
}

class GroupByIterable<T, K, V, R> implements Iterable<R> {
    constructor(
        private source: Iterable<T>, 
        private keySelector: (element: T) => K, 
        private elementSelector: (element: T) => V, 
        private resultSelector: (key: K, elements: Query<V>) => R | Grouping<K, V>) {
    }

    public *[Symbol.iterator](): Iterator<R> {
        let { resultSelector } = this;
        let map = CreateGroupings(this.source, this.keySelector, this.elementSelector);
        for (let [key, values] of map) {
            yield <R>resultSelector(key, new Query<V>(values));
        }
        return;
    }
}

class GroupJoinIterable<O, I, K, R> implements Iterable<R> {
    constructor(
        private outer: Iterable<O>,
        private inner: Iterable<I>,
        private outerKeySelector: (element: O) => K,
        private innerKeySelector: (element: I) => K,
        private resultSelector: (outer: O, inner: Query<I>) => R) {     
    }

    public *[Symbol.iterator](): Iterator<R> {
        let { outer, outerKeySelector, resultSelector } = this;
        let map = CreateGroupings(this.inner, this.innerKeySelector, Identity);
        for (let outerElement of outer) {
            let outerKey = outerKeySelector(outerElement);
            let innerElements = map.has(outerKey) ? <Iterable<I>>map.get(outerKey) : emptyIterable;
            yield resultSelector(outerElement, new Query<I>(innerElements));
        }
        return;
    }
}

class JoinIterable<O, I, K, R> implements Iterable<R> {
    constructor(
        private outer: Iterable<O>,
        private inner: Iterable<I>,
        private outerKeySelector: (element: O) => K,
        private innerKeySelector: (element: I) => K,
        private resultSelector: (outer: O, inner: I) => R) {        
    }

    public *[Symbol.iterator](): Iterator<R> {
        let { outer, outerKeySelector, resultSelector } = this;
        let map = CreateGroupings(this.inner, this.innerKeySelector, Identity);
        for (let outerElement of outer) {
            let outerKey = outerKeySelector(outerElement);
            let innerElements = map.get(outerKey);
            if (innerElements != null) {
                for (let innerElement of innerElements) {
                    yield resultSelector(outerElement, innerElements);
                }
            }
        }
        return;
    }
}

class LookupIterable<K, V, R> implements Iterable<R> {
    constructor(
        private map: Map<K, Iterable<V>>,
        private selector: (key: K, elements: Query<V>) => R) {
    }

    public *[Symbol.iterator](): Iterator<R> {
        let { map, selector } = this;
        for (let [key, values] of map) {
            yield selector(key, new Query<V>(values));
        }
        return;
    }
}

class DefaultIfEmptyIterable<T> implements Iterable<T> {
    constructor(
        private source: Iterable<T>,
        private defaultValue: T) {        
    }

    public *[Symbol.iterator](): Iterator<T> {
        let iterator = GetIterator(this.source);
        try {
            let iterResult = iterator.next();
            if (iterResult.done) {
                yield this.defaultValue;
            }
            else {
                do {
                    yield iterResult.value;
                    iterResult = iterator.next();
                }
                while (!iterResult.done);
            }
        }
        finally {
            IteratorClose(iterator);
        }
        return;
    }
}

class AncestorHierarchyIterable<T> implements Iterable<T> {
    constructor(
        private source: Iterable<T>,
        private hierarchy: HierarchyProvider<T>,
        private self: boolean) {
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { source, hierarchy, self } = this;
        for (let element of source) {
            if (self) {
                yield element;
            }
            let current = hierarchy.parent(element);
            while (current !== undefined) {
                yield current;
                current = hierarchy.parent(current);
            }
        }
        return;
    }
}

class ParentHierarchyIterable<T> implements Iterable<T> {
    constructor(
        private source: Iterable<T>,
        private hierarchy: HierarchyProvider<T>) {       
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { source, hierarchy } = this;
        for (let element of source) {
            let parent = hierarchy.parent(element);
            if (parent !== undefined) {
                yield parent;
            }
        }
        return;
    }
}

class ChildHierarchyIterable<T> implements Iterable<T> {
    constructor(
        private source: Iterable<T>,
        private hierarchy: HierarchyProvider<T>) {        
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { source, hierarchy } = this;
        for (let element of source) {
            yield* hierarchy.children(element);
        }
        return;
    }
}

class DescendantHierarchyIterable<T> implements Iterable<T> {
    constructor(
        private source: Iterable<T>,
        private hierarchy: HierarchyProvider<T>,
        private self: boolean) {
    }

    public *[Symbol.iterator](): Iterator<T> {
        let { source, hierarchy, self } = this;
        for (let element of source) {
            if (self) {
                yield element;
            }
            yield* new DescendantHierarchyIterable<T>(hierarchy.children(element), hierarchy, /*self*/ true);
        }
        return;
    }
}

@ToStringTag("Query")
export class Query<T> implements Iterable<T> {
    //internal [symQuerySource]: Iterable<T>;

    constructor(source: Iterable<T>) {
        SetQuerySource(this, <Iterable<T>>source);          
    }

    public static from<T>(source: Iterable<T>): Query<T>;
    public static from<T>(source: ArrayLike<T>): Query<T>;
    public static from<T>(source: Iterable<T> | ArrayLike<T>): Query<T> {
        if (IsIterable(source)) {
            return new Query<T>(<Iterable<T>>source);
        }
        else if (IsArrayLike(source)) {
            return new Query<T>(new ArrayLikeIterable<T>(<ArrayLike<T>>source));
        }
        else {
            throw new TypeError();
        }
    }

    public static of<T>(...elements: T[]): Query<T> {
        return new Query<T>(elements);
    }

    public static empty<T>(): Query<T> {
        return new Query<T>(emptyIterable);
    }

    public static once<T>(value: T): Query<T> {
        return new Query<T>(new OnceIterable(value));
    }

    public static repeat<T>(value: T, count: number): Query<T> {
        return new Query<T>(new RepeatIterable(value, count));
    }

    public static range(start: number, end: number): Query<number> {
        return new Query<number>(new RangeIterable(start, end));
    }

    public filter(predicate: (element: T, offset: number) => boolean): Query<T> {
        return new Query<T>(new FilterIterable(this, predicate));
    }

    public map<U>(selector: (element: T, offset: number) => U): Query<U> {
        return new Query<U>(new MapIterable(this, selector));
    }

    public flatMap<U>(projection: (element: T) => Iterable<U>): Query<U> {
        return new Query<U>(new FlatMapIterable(this, projection));
    }

    public reverse(): Query<T> {
        return new Query<T>(new ReverseIterable(this));
    }

    public skip(count: number): Query<T> {
        return new Query<T>(new SkipIterable(this, count));
    }

    public skipWhile(predicate: (element: T) => boolean): Query<T> {
        return new Query<T>(new SkipWhileIterable(this, predicate));
    }

    public take(count: number): Query<T> {
        return new Query<T>(new TakeIterable(this, count));
    }

    public takeWhile(predicate: (element: T) => boolean): Query<T> {
        return new Query<T>(new SkipWhileIterable(this, predicate));
    }

    public intersect(other: Iterable<T>): Query<T> {
        return new Query<T>(new IntersectIterable(this, other));
    }   

    public union(other: Iterable<T>): Query<T> {
        return new Query<T>(new UnionIterable(this, other));
    }   

    public except(other: Iterable<T>): Query<T> {
        return new Query<T>(new ExceptIterable(this, other));
    }   

    public distinct(): Query<T> {
        return new Query<T>(new DistinctIterable(this));
    }

    public zip<U, R>(right: Query<U>, selector: (left: T, right: U) => R): Query<R> {
        return new Query<R>(new ZipIterable(this, right, selector));
    }

    public orderBy<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedQuery<T> {
        return new OrderedQueryable<T, K>(new OrderedIterable<T, K>(this, keySelector, comparison, false));
    }

    public orderByDescending<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedQuery<T> {
        return new OrderedQueryable<T, K>(new OrderedIterable<T, K>(this, keySelector, comparison, true));
    }

    public groupBy<K>(keySelector: (element: T) => K): Query<Grouping<K, T>>;
    public groupBy<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Query<Grouping<K, V>>;
    public groupBy<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Query<V>) => R): Query<R>;
    public groupBy<K, V, R>(keySelector: (element: T) => K, elementSelector: (element: T) => V = Identity, resultSelector: (key: K, elements: Query<V>) => R | Grouping<K, V> = ToGrouping): Query<R> {
        return new Query<R>(new GroupByIterable<T, K, V, R>(this, keySelector, elementSelector, resultSelector));
    }

    public groupJoin<I, K, R>(inner: Iterable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: Query<I>) => R): Query<R> {
        return new Query<R>(new GroupJoinIterable<T, I, K, R>(this, inner, outerKeySelector, innerKeySelector, resultSelector));
    }

    public defaultIfEmpty(defaultValue: T): Query<T> {
        return new Query<T>(new DefaultIfEmptyIterable<T>(this, defaultValue));
    }

    public join<I, K, R>(inner: Iterable<I>, outerKeySelector: (element: T) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: T, inner: I) => R): Query<R> {
        return new Query<R>(new JoinIterable<T, I, K, R>(this, inner, outerKeySelector, innerKeySelector, resultSelector));
    }

    public reduce(aggregator: (aggregate: T, element: T, offset: number) => T): T;
    public reduce<U>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U): U;
    public reduce<U, R>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): R;
    public reduce<U, R>(aggregator: (aggregate: U, element: T, offset: number) => U, seed?: U, resultSelector: (result: U, count: number) => R = Identity): R {
        let result: T | U | R = seed;
        let seeded = arguments.length >= 2;
        let offset = 0;
        for (let element of this) {
            if (!seeded) {
                result = element;
                seeded = true;
            }
            else {
                result = aggregator(<U>result, element, offset);
            }
            ++offset;
        }
        return resultSelector(<U>result, offset);
    }

    public reduceRight(aggregator: (aggregate: T, element: T, offset: number) => T): T;
    public reduceRight<U>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U): U;
    public reduceRight<U, R>(aggregator: (aggregate: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): R;
    public reduceRight<U, R>(aggregator: (aggregate: U, element: T, offset: number) => U, seed?: U, resultSelector: (result: U, count: number) => R = Identity): R {
        let result: T | U | R = seed;
        let seeded = arguments.length >= 2;
        let list = Array.from<T>(this);
        const len = list.length;
        for (let offset = len - 1; offset >= 0; --offset) {
            let element = list[offset];
            if (!seeded) {
                result = element;
                seeded = true;
            }
            else {
                result = aggregator(<U>result, element, offset);
            }
        }
        return resultSelector(<U>result, len);
    }

    public count(predicate?: (element: T) => boolean): number {
        let count = 0;
        if (predicate) {
            for (let element of this) {
                if (predicate(element)) {
                    count++;
                }
            }
        }
        else {
            for (let element of this) {
                count++;
            }
        }
        return count;
    }

    public first(predicate?: (element: T) => boolean): T {
        for (let element of this) {
            if (!predicate || predicate(element)) {
                return element;
            }
        }
        return undefined;
    }

    public last(predicate?: (element: T) => boolean): T {
        let last: T;
        for (let element of this) {
            if (!predicate || predicate(element)) {
                last = element;
            }
        }
        return last;
    }

    public single() {
        let iterator = GetIterator(this);
        try {
            let { value, done } = iterator.next();
            if (!done) {
                let { done } = iterator.next();
                if (done) {
                    return value;
                }
            }
            return undefined;
        }
        finally {
            IteratorClose(iterator);
        }
    }

    public min(): T;
    public min<U>(selector: (element: T) => U): T;
    public min<U>(selector?: (element: T) => U) {
        let iterator = GetIterator(this);
        try {
            let iterResult = iterator.next();
            if (!iterResult.done) {
                let min = iterResult.value;
                if (selector) {
                    let minComparand = selector(min);
                    iterResult = iterator.next();
                    while (!iterResult.done) {
                        let value = iterResult.value;
                        let valueComparand = selector(value);
                        if (valueComparand < minComparand) {
                            min = value;
                            minComparand = valueComparand;
                        }
                        iterResult = iterator.next();
                    }
                }
                else {
                    iterResult = iterator.next();
                    while (!iterResult.done) {
                        let value = iterResult.value;
                        if (value < min) {
                            min = value;
                        }
                        iterResult = iterator.next();
                    }
                }
                return min;
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }

    public max(): T;
    public max<U>(selector: (element: T) => U): T;
    public max<U>(selector?: (element: T) => U) {
        let iterator = GetIterator(this);
        try {
            let iterResult = iterator.next();
            if (!iterResult.done) {
                let max = iterResult.value;
                if (selector) {
                    let maxComparand = selector(max);
                    iterResult = iterator.next();
                    while (!iterResult.done) {
                        let value = iterResult.value;
                        let valueComparand = selector(value);
                        if (valueComparand > maxComparand) {
                            max = value;
                            maxComparand = valueComparand;
                        }
                        iterResult = iterator.next();
                    }
                }
                else {
                    iterResult = iterator.next();
                    while (!iterResult.done) {
                        let value = iterResult.value;
                        if (value < max) {
                            max = value;
                        }
                        iterResult = iterator.next();
                    }
                }
                return max;
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }

    public some(predicate?: (element: T) => boolean): boolean {
        if (predicate) {
            for (let element of this) {
                if (predicate(element)) {
                    return true;
                }
            }
        }
        else {
            for (let element of this) {
                return true;
            }
        }
        return false;
    }

    public every(predicate: (element: T) => boolean): boolean {
        let any = false;
        for (let element of this) {
            if (!predicate(element)) {
                return false;
            }
            any = true;
        }
        return any;
    }

    public sequenceEquals(other: Iterable<T>): boolean {
        let leftIterator = GetIterator(this);
        try {
            let rightIterator = GetIterator(other);
            try {
                let leftIterResult = leftIterator.next();
                let rightIterResult = rightIterator.next();
                while (!leftIterResult.done && !rightIterResult.done) {
                    if (!SameValue(leftIterResult.value, rightIterResult.value)) {
                        return false;
                    }
                    leftIterResult = leftIterator.next();
                    rightIterResult = rightIterator.next();
                }
                return leftIterResult.done == rightIterResult.done;
            }
            finally {
                IteratorClose(rightIterator);
            }   
        }
        finally {
            IteratorClose(leftIterator);
        }   
    }

    public includes(value: T): boolean {
        for (let element of this) {
            if (SameValue(value, element)) {
                return true;
            }
        }
        return false;
    }

    public elementAt(offset: number): T {
        if (offset < 0) {
            return undefined;
        }
        let iterator = GetIterator(this);
        try {
            let iterResult = iterator.next();
            while (offset >= 0 && !iterResult.done) {
                if (offset === 0) {
                    return iterResult.value;
                }
                --offset;
                iterResult = iterator.next();
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }

    public forEach(callback: (element: T, offset: number) => void): void {
        let offset = 0;
        for (let element of this) {
            callback(element, offset++);
        }
    }

    public toHierarchy(hierarchy: HierarchyProvider<T>): HierarchyQuery<T> {
        return new HierarchyQueryable<T>(this, hierarchy);
    }

    public toArray(): T[];
    public toArray<V>(selector: (element: T) => V): V[];
    public toArray<V>(selector?: (element: T) => V): V[] {
        return Array.from<T, V>(this, selector);
    }

    public toSet(): Set<T>;
    public toSet<V>(elementSelector: (element: T) => V): Set<V>;
    public toSet<V>(elementSelector: (element: T) => V = Identity): Set<V> {
        let set = new Set<V>();
        for (let item of this) {
            let element = elementSelector(item);
            set.add(element);
        }
        return set;
    }

    public toMap<K>(keySelector: (element: T) => K): Map<K, T>;
    public toMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Map<K, V>;
    public toMap<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V = Identity): Map<K, V> {
        let map = new Map<K, V>();
        for (let item of this) {
            let key = keySelector(item);
            let element = elementSelector(item);
            map.set(key, element);
        }
        return map;
    }

    public toLookup<K>(keySelector: (element: T) => K): Lookup<K, T>;
    public toLookup<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V): Lookup<K, V>;
    public toLookup<K, V>(keySelector: (element: T) => K, elementSelector: (element: T) => V = Identity): Lookup<K, V> {
        let map = CreateGroupings(this, keySelector, elementSelector);
        return new LookupQueryable<K, V>(map);
    }

    public toJSON() : any {
        return this.toArray();
    }

    public *[Symbol.iterator](): Iterator<T> {
        let source = GetQuerySource(this);
        yield* source;
        return;
    }
}

export interface OrderedQuery<T> extends Query<T> {
    thenBy<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number): OrderedQuery<T>;
    thenByDescending<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number): OrderedQuery<T>;
}

export interface Grouping<K, V> extends Query<V> {
    key: K;
}

export interface Lookup<K, V> extends Query<Grouping<K, V>> {
    size: number;
    has(key: K): boolean;
    get(key: K): Query<V>;
    applyResultSelector<R>(selector: (key: K, elements: Query<V>) => R): Query<R>;
}

@ToStringTag("OrderedQuery")
@HideConstructor()
class OrderedQueryable<T, K> extends Query<T> implements OrderedQuery<T> {
    constructor(source: OrderedIterable<T, K>) {
        super(source);
    }

    public thenBy<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedQuery<T> {
        let orderedIterable = <OrderedIterable<T, any>>GetQuerySource(this);
        return new OrderedQueryable<T, K>(new OrderedIterable<T, K>(orderedIterable.source, keySelector, comparison, false, orderedIterable));
    }

    public thenByDescending<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedQuery<T> {
        let orderedIterable = <OrderedIterable<T, any>>GetQuerySource(this);
        return new OrderedQueryable<T, K>(new OrderedIterable<T, K>(orderedIterable.source, keySelector, comparison, true, orderedIterable));
    }
}

@ToStringTag("Grouping")
@HideConstructor()
class GroupingQueryable<K, V> extends Query<V> implements Grouping<K, V> {
    // private [symGroupingKey]: K;

    constructor(key: K, items: Iterable<V>) {
        super(items);
        SetGroupingKey(this, key);
    }

    public get key(): K {
        return GetGroupingKey(this);
    }
}

@ToStringTag("Lookup")
@HideConstructor()
class LookupQueryable<K, V> extends Query<Grouping<K, V>> implements Lookup<K, V> {
    // private [symLookupMap]: Map<K, Iterable<V>>;

    constructor(map: Map<K, Iterable<V>>) {
        super(new LookupIterable<K, V, Grouping<K, V>>(map, ToGrouping));
        SetLookupMap(this, map);
    }

    public get size(): number {
        let map = GetLookupMap(this);
        return map.size;
    }

    public has(key: K): boolean {
        let map = GetLookupMap(this);
        return map.has(key);
    }

    public get(key: K): Query<V> {
        let map = GetLookupMap(this);
        let grouping = map.has(key) ? map.get(key) : emptyIterable;
        return new Query<V>(grouping);
    }

    public applyResultSelector<R>(selector: (key: K, elements: Query<V>) => R): Query<R> {
        let map = GetLookupMap(this);
        return new Query<R>(new LookupIterable<K, V, R>(map, selector));
    }
}

export interface HierarchyProvider<T> {
    parent(element: T): T;
    children(element: T): Iterable<T>;
}

export interface HierarchyQuery<T> extends Query<T> {
    filter(predicate: (element: T, offset: number) => boolean): HierarchyQuery<T>;
    reverse(): HierarchyQuery<T>;
    skip(count: number): HierarchyQuery<T>;
    skipWhile(predicate: (element: T) => boolean): HierarchyQuery<T>;
    take(count: number): HierarchyQuery<T>;
    takeWhile(predicate: (element: T) => boolean): HierarchyQuery<T>;
    intersect(other: Iterable<T>): HierarchyQuery<T>;
    union(other: Iterable<T>): HierarchyQuery<T>;
    except(other: Iterable<T>): HierarchyQuery<T>;
    distinct(): HierarchyQuery<T>;
    orderBy<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<T>;
    orderByDescending<K>(keySelector: (element: T) => K, comparison?: (x: K, y: K) => number): OrderedHierarchyQuery<T>;
    self(): HierarchyQuery<T>;
    parents(): HierarchyQuery<T>;
    ancestors(): HierarchyQuery<T>;
    ancestorsOrSelf(): HierarchyQuery<T>;
    children(): HierarchyQuery<T>;
    descendants(): HierarchyQuery<T>;
    descendantsOrSelf(): HierarchyQuery<T>;
}

@ToStringTag("HierarchyQuery")
@HideConstructor()
class HierarchyQueryable<T> extends Query<T> {
    constructor(
        source: Iterable<T>,
        hierarchy: HierarchyProvider<T>) {
        super(source);
        SetHierarchyProvider(this, hierarchy);
    }

    public filter(predicate: (element: T, offset: number) => boolean): HierarchyQuery<T> {
        return super.filter(predicate).toHierarchy(GetHierarchyProvider(this));
    }

    public reverse(): HierarchyQuery<T> {
        return super.reverse().toHierarchy(GetHierarchyProvider(this));
    }

    public skip(count: number): HierarchyQuery<T> {
        return super.skip(count).toHierarchy(GetHierarchyProvider(this));
    }

    public skipWhile(predicate: (element: T) => boolean): HierarchyQuery<T> {
        return super.skipWhile(predicate).toHierarchy(GetHierarchyProvider(this));
    }

    public take(count: number): HierarchyQuery<T> {
        return super.take(count).toHierarchy(GetHierarchyProvider(this));
    }

    public takeWhile(predicate: (element: T) => boolean): HierarchyQuery<T> {
        return super.takeWhile(predicate).toHierarchy(GetHierarchyProvider(this));
    }

    public intersect(other: Iterable<T>): HierarchyQuery<T> {
        return super.intersect(other).toHierarchy(GetHierarchyProvider(this));
    }   

    public union(other: Iterable<T>): HierarchyQuery<T> {
        return super.union(other).toHierarchy(GetHierarchyProvider(this));
    }   

    public except(other: Iterable<T>): HierarchyQuery<T> {
        return super.except(other).toHierarchy(GetHierarchyProvider(this));
    }   

    public distinct(): HierarchyQuery<T> {
        return super.distinct().toHierarchy(GetHierarchyProvider(this));
    }

    public orderBy<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedHierarchyQuery<T> {
        return new OrderedHierarchyQueryable<T, K>(new OrderedIterable<T, K>(this, keySelector, comparison, false), GetHierarchyProvider(this));
    }

    public orderByDescending<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedHierarchyQuery<T> {
        return new OrderedHierarchyQueryable<T, K>(new OrderedIterable<T, K>(this, keySelector, comparison, true), GetHierarchyProvider(this));
    }    

    public self(): HierarchyQuery<T> {
        return this;
    }

    public parents(): HierarchyQuery<T> {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable<T>(new ParentHierarchyIterable<T>(this, hierarchy), hierarchy);
    }

    public ancestors(): HierarchyQuery<T> {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable<T>(new AncestorHierarchyIterable<T>(this, hierarchy, /*self*/ false), hierarchy);
    }

    public ancestorsOrSelf(): HierarchyQuery<T> {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable<T>(new AncestorHierarchyIterable<T>(this, hierarchy, /*self*/ true), hierarchy);
    }

    public children(): HierarchyQuery<T> {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable<T>(new ChildHierarchyIterable<T>(this, hierarchy), hierarchy);
    }

    public descendants(): HierarchyQuery<T> {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable<T>(new DescendantHierarchyIterable<T>(this, hierarchy, /*self*/ false), hierarchy);
    }

    public descendantsOrSelf(): HierarchyQuery<T> {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable<T>(new DescendantHierarchyIterable<T>(this, hierarchy, /*self*/ true), hierarchy);
    }
}

export interface OrderedHierarchyQuery<T> extends HierarchyQuery<T> {    
    thenBy<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number): OrderedHierarchyQuery<T>;
    thenByDescending<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number): OrderedHierarchyQuery<T>;
}

@ToStringTag("OrderedHierarchyQueryable")
@HideConstructor()
class OrderedHierarchyQueryable<T, K> extends HierarchyQueryable<T> implements OrderedHierarchyQuery<T> {
    constructor(source: OrderedIterable<T, K>, hierarchy: HierarchyProvider<T>) {
        super(source, hierarchy);
    }

    public thenBy<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedHierarchyQuery<T> {
        let orderedIterable = <OrderedIterable<T, any>>GetQuerySource(this);
        let hierarchy = GetHierarchyProvider(this);
        return new OrderedHierarchyQueryable<T, K>(new OrderedIterable<T, K>(orderedIterable.source, keySelector, comparison, false, orderedIterable), hierarchy);
    }

    public thenByDescending<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedHierarchyQuery<T> {
        let orderedIterable = <OrderedIterable<T, any>>GetQuerySource(this);
        let hierarchy = GetHierarchyProvider(this);
        return new OrderedHierarchyQueryable<T, K>(new OrderedIterable<T, K>(orderedIterable.source, keySelector, comparison, true, orderedIterable), hierarchy);
    }
}

function SetQuerySource<T>(query: Query<T>, source: Iterable<T>): void {
    (<any>query)[symQuerySource] = source;
}

function GetQuerySource<T>(query: Query<T>): Iterable<T> {
    return (<any>query)[symQuerySource];
}

function SetGroupingKey<K, V>(grouping: GroupingQueryable<K, V>, key: K): void {
    (<any>grouping)[symGroupingKey] = key;
}

function GetGroupingKey<K, V>(grouping: GroupingQueryable<K, V>): K {
    return (<any>grouping)[symGroupingKey];
}

function SetLookupMap<K, V>(lookup: LookupQueryable<K, V>, map: Map<K, Iterable<V>>): void {
    (<any>lookup)[symLookupMap] = map;
}

function GetLookupMap<K, V>(lookup: LookupQueryable<K, V>): Map<K, Iterable<V>> {
    return (<any>lookup)[symLookupMap];
}

function GetHierarchyProvider<T>(Hierarchy: HierarchyQuery<T>): HierarchyProvider<T> {
    return (<any>Hierarchy)[symHierarchyProvider];
}

function SetHierarchyProvider<T>(Hierarchy: HierarchyQuery<T>, value: HierarchyProvider<T>): void {
    (<any>Hierarchy)[symHierarchyProvider] = value;
}

function Identity<T>(x: T): T {
    return x;
}

function CompareValues<T>(x: T, y: T): number {
    if (x < y) {
        return -1;
    }
    else if (x > y) {
        return +1;
    }
    return 0;
}

function SetAdd<T>(set: Set<T>, value: T): boolean {
    let size = set.size;
    set.add(value);
    return set.size > size;
}

function IsObject(x: any): boolean {
    return x !== null && typeof x === "object";
}

function IsArrayLike(x: any): boolean {
    return IsObject(x) && typeof x.length === "number";
}

function IsIterable(x: any): boolean {
    return IsObject(x) && Symbol.iterator in x;
}

function GetIterator<T>(iterable: Iterable<T>): Iterator<T> {
    return iterable[Symbol.iterator]();
}

function IteratorClose<T>(iterator: Iterator<T>): IteratorResult<T> {
    let close = iterator.return;
    if (typeof close === "function") {
        return close.call(iterator);
    }
}

function CreateGroupings<T, K, V>(source: Iterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Map<K, V[]> {
    let map = new Map<K, V[]>();
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

function ToGrouping<K, V>(key: K, elements: Iterable<V>): Grouping<K, V> {
    return new GroupingQueryable<K, V>(key, elements);
}

function SameValue(x: any, y: any): boolean {
    return (x === y) ? (x !== 0 || 1 / x === 1 / y) : (x !== x && y !== y);
}

function ToStringTag(tag: string) {
    return function(target: Function): void {
        target.prototype[Symbol.toStringTag] = tag;
    }
}

function HideConstructor() {
    return function(target: Function): void {
        target.prototype.constructor = Object.getPrototypeOf(target.prototype).constructor;
    }
}