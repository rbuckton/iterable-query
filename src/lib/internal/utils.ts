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

import { Hierarchical, HierarchyProvider, PossiblyAsyncQueryable, Queryable, PossiblyAsyncIterator, OrderedIterable, AsyncOrderedIterable, HierarchyIterable, PossiblyAsyncIterable, Grouping, QuerySource, AsyncQuerySource, OrderedHierarchyIterable, PossiblyAsyncOrderedHierarchyIterable, PossiblyAsyncHierarchyIterable, PossiblyAsyncOrderedIterable, AsyncOrderedHierarchyIterable } from "../types";
import { ToPossiblyAsyncIterable, ToIterable } from "./conversion";
import { IsAsyncIterable, IsIterable, IsAsyncQuerySource } from "./guards";
import { ToStringTag } from "./decorators";
import { Query, HierarchyQuery, OrderedHierarchyQuery, OrderedQuery } from "../query";
import { AsyncQuery, AsyncOrderedQuery, AsyncOrderedHierarchyQuery, AsyncHierarchyQuery } from "../asyncQuery";

/** @internal */
export function GetIterator<T>(source: Iterable<T>): Iterator<T> {
    const iterator = source[Symbol.iterator];
    if (typeof iterator === "function") {
        return iterator.call(source);
    }
    throw new TypeError();
}

/** @internal */
export function GetAsyncIterator<T>(source: PossiblyAsyncIterable<T>): AsyncIterator<T> {
    const asyncIterator = IsAsyncIterable(source) ? source[Symbol.asyncIterator] : undefined;
    if (typeof asyncIterator === "function") {
        return asyncIterator.call(source);
    }

    const iterator = IsIterable(source) ? source[Symbol.iterator] : undefined;
    if (typeof iterator === "function") {
        return new AsyncFromSyncIterator(iterator.call(source));
    }

    throw new TypeError();
}

@ToStringTag("Async-from-sync Iterator")
class AsyncFromSyncIterator<T> implements AsyncIterator<T> {
    private _iterator: Iterator<PromiseLike<T> | T>;

    constructor(iterator: Iterator<PromiseLike<T> | T>) {
        this._iterator = iterator;
    }
    
    async next(value?: any): Promise<IteratorResult<T>> {
        const { done, value: resultValue } = this._iterator.next(value);
        return { done, value: await resultValue };
    }
    
    async return(value?: T): Promise<IteratorResult<T>> {
        const returnMethod = this._iterator.return;
        if (returnMethod === undefined) {
            return { done: true, value: value! };
        }
        const { done, value: resultValue } = returnMethod.call(this._iterator, value);
        return { done, value: await resultValue };
    }

    async throw(value?: any): Promise<IteratorResult<T>> {
        const throwMethod = this._iterator.throw;
        if (throwMethod === undefined) {
            throw value;
        }
        const { done, value: resultValue } = throwMethod.call(this._iterator, value);
        return { done, value: await resultValue };
    }
}

/** @internal */
export function GetHierarchy<TNode>(value: Hierarchical<TNode>): HierarchyProvider<TNode> {
    const hierarchy = value[Hierarchical.hierarchy];
    if (typeof hierarchy === "function") {
        return hierarchy.call(value);
    }
    throw new TypeError();
}

/** @internal */ export function GetSource<TNode, T extends TNode>(query: OrderedHierarchyQuery<TNode, T>): OrderedHierarchyIterable<TNode, T>;
/** @internal */ export function GetSource<TNode, T extends TNode>(query: HierarchyQuery<TNode, T>): HierarchyIterable<TNode, T>;
/** @internal */ export function GetSource<T>(query: OrderedQuery<T>): OrderedIterable<T>;
/** @internal */ export function GetSource<T>(query: QuerySource<T>): Queryable<T>;
/** @internal */ export function GetSource<T>(query: QuerySource<T>): Queryable<T> {
    const sourceMethod = query[QuerySource.source];
    if (typeof sourceMethod === "function") {
        return sourceMethod.call(query);
    }
    throw new TypeError();
}

/** @internal */ export function CreateSubquery<TNode, T extends TNode>(query: Query<unknown> | AsyncQuery<unknown>, subquery: OrderedHierarchyIterable<TNode, T>): OrderedHierarchyQuery<TNode, T>;
/** @internal */ export function CreateSubquery<TNode, T extends TNode>(query: Query<unknown> | AsyncQuery<unknown>, subquery: HierarchyIterable<TNode, T>): HierarchyQuery<TNode, T>;
/** @internal */ export function CreateSubquery<T>(query: Query<unknown> | AsyncQuery<unknown>, subquery: OrderedIterable<T>): OrderedQuery<T>;
/** @internal */ export function CreateSubquery<T>(query: Query<unknown> | AsyncQuery<unknown>, subquery: Queryable<T>): Query<T>;
/** @internal */ export function CreateSubquery<T>(query: QuerySource<unknown> | AsyncQuerySource<unknown>, subquery: Queryable<T>): QuerySource<T>;
/** @internal */ export function CreateSubquery<T>(query: QuerySource<unknown> | AsyncQuerySource<unknown>, subquery: Queryable<T>): QuerySource<T> {
    const subqueryMethod = IsAsyncQuerySource(query) ? query[AsyncQuerySource.createSync] : query[QuerySource.create];
    if (typeof subqueryMethod === "function") {
        return subqueryMethod.call(query, subquery);
    }
    throw new TypeError();
}

/** @internal */ export function GetAsyncSource<TNode, T extends TNode>(query: AsyncOrderedHierarchyQuery<TNode, T>): PossiblyAsyncOrderedHierarchyIterable<TNode, T>;
/** @internal */ export function GetAsyncSource<TNode, T extends TNode>(query: AsyncHierarchyQuery<TNode, T>): PossiblyAsyncHierarchyIterable<TNode, T>;
/** @internal */ export function GetAsyncSource<T>(query: AsyncOrderedQuery<T>): PossiblyAsyncOrderedIterable<T>;
/** @internal */ export function GetAsyncSource<T>(query: AsyncQuerySource<T>): PossiblyAsyncQueryable<T>;
/** @internal */ export function GetAsyncSource<T>(query: AsyncQuerySource<T>): PossiblyAsyncQueryable<T> {
    const sourceMethod = query[AsyncQuerySource.source];
    if (typeof sourceMethod === "function") {
        return sourceMethod.call(query);
    }
    throw new TypeError();
}

/** @internal */ export function CreateAsyncSubquery<TNode, T extends TNode>(query: AsyncQuery<unknown>, subquery: PossiblyAsyncOrderedHierarchyIterable<TNode, T>): AsyncOrderedHierarchyQuery<TNode, T>;
/** @internal */ export function CreateAsyncSubquery<TNode, T extends TNode>(query: AsyncQuery<unknown>, subquery: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyQuery<TNode, T>;
/** @internal */ export function CreateAsyncSubquery<T>(query: AsyncQuery<unknown>, subquery: PossiblyAsyncOrderedIterable<T>): AsyncOrderedQuery<T>;
/** @internal */ export function CreateAsyncSubquery<T>(query: AsyncQuery<unknown>, subquery: PossiblyAsyncQueryable<T>): AsyncQuery<T>;
/** @internal */ export function CreateAsyncSubquery<T>(query: AsyncQuerySource<unknown>, subquery: PossiblyAsyncQueryable<T>): AsyncQuerySource<T>;
/** @internal */ export function CreateAsyncSubquery<T>(query: AsyncQuerySource<unknown>, subquery: PossiblyAsyncQueryable<T>): AsyncQuerySource<T> {
    const subqueryMethod = query[AsyncQuerySource.create];
    if (typeof subqueryMethod === "function") {
        return subqueryMethod.call(query, subquery);
    }
    throw new TypeError();
}

/** @internal */
export function IteratorClose<T>(iterator: Iterator<T> | undefined | null): IteratorResult<T> | undefined {
    if (iterator !== undefined && iterator !== null) {
        const close = iterator.return;
        if (typeof close === "function") {
            return close.call(iterator);
        }
    }
}

/** @internal */
export function AsyncIteratorClose<T>(iterator: AsyncIterator<T> | undefined | null): Promise<IteratorResult<T>> | undefined {
    if (iterator !== undefined && iterator !== null) {
        const close = iterator.return;
        if (typeof close === "function") {
            return close.call(iterator);
        }
    }
}

/** @internal */
export function PossiblyAsyncIteratorClose<T>(iterator: PossiblyAsyncIterator<T> | undefined | null): Promise<IteratorResult<T>> | IteratorResult<T> | undefined {
    if (iterator !== undefined && iterator !== null) {
        const close = iterator.return;
        if (typeof close === "function") {
            return close.call(iterator);
        }
    }
}

/** @internal */ export function ThenBy<TNode, T extends TNode, K>(value: OrderedHierarchyIterable<TNode, T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): OrderedHierarchyIterable<TNode, T>;
/** @internal */ export function ThenBy<T, K>(value: OrderedIterable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): OrderedIterable<T>;
/** @internal */ export function ThenBy<T, K>(value: OrderedIterable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): OrderedIterable<T> {
    const thenBy = value[OrderedIterable.thenBy];
    if (typeof thenBy === "function") {
        return thenBy.call(value, keySelector, comparison, descending);
    }
    throw new TypeError();
}

/** @internal */ export function ThenByAsync<TNode, T extends TNode, K>(value: AsyncOrderedHierarchyIterable<TNode, T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedHierarchyIterable<TNode, T>;
/** @internal */ export function ThenByAsync<T, K>(value: AsyncOrderedIterable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedIterable<T>;
/** @internal */ export function ThenByAsync<T, K>(value: AsyncOrderedIterable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedIterable<T> {
    const thenBy = value[AsyncOrderedIterable.thenByAsync];
    if (typeof thenBy === "function") {
        return thenBy.call(value, keySelector, comparison, descending);
    }
    throw new TypeError();
}

/** @internal */
export function NextResult<T>(value: T): IteratorResult<T> {
    return { done: false, value };
}

/** @internal */
export function DoneResult<T>(): IteratorResult<T> {
    return { done: true, value: undefined! };
}

/** @internal */
export function SameValue(x: any, y: any): boolean {
    return (x === y) ? (x !== 0 || 1 / x === 1 / y) : (x !== x && y !== y);
}

/** @internal */
export function CompareValues<T>(x: T, y: T): number {
    if (x < y) {
        return -1;
    }
    else if (x > y) {
        return +1;
    }
    return 0;
}

/** @internal */
export function Identity<T>(x: T): T {
    return x;
}

/** @internal */
export function CreateGroupings<T, K, V>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Map<K, V[]> {
    const map = new Map<K, V[]>();
    for (const item of ToIterable(source)) {
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

/** @internal */
export async function CreateGroupingsAsync<T, K, V>(source: PossiblyAsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Promise<Map<K, V[]>> {
    const map = new Map<K, V[]>();
    for await (const item of ToPossiblyAsyncIterable(source)) {
        let key = keySelector(item);
        let element = elementSelector(item);
        let grouping = map.get(key);
        if (grouping == null) {
            grouping = [];
            map.set(key, grouping);
        }
        grouping.push(element);
    }
    return map;0
}

/** @internal */
export function SelectGroupingKey<K, V>(grouping: Grouping<K, V>) {
    return grouping.key;
}

/** @internal */
export function MakeTuple<T, U>(x: T, y: U): [T, U] {
    return [x, y];

}
/** @internal */
export function SelectValue<T extends object, K extends keyof T>(this: T, key: K) {
    return this[key];
}

/** @internal */
export function SelectEntry<T extends object, K extends keyof T>(this: T, key: K) {
    return MakeTuple(key, this[key]);
}

/** @internal */
export function True(_unused: any) {
    return true;
}