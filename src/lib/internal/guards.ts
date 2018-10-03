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
/** @internal */

import { Queryable, OrderedIterable, HierarchyProvider, HierarchyIterable, PossiblyAsyncIterable, PossiblyAsyncHierarchyIterable, OrderedHierarchyIterable, AsyncOrderedIterable, AsyncHierarchyIterable, AsyncOrderedHierarchyIterable, Hierarchical, PossiblyAsyncOrderedIterable, Grouping, PossiblyAsyncOrderedHierarchyIterable } from "../types";
import { QuerySource, AsyncQuerySource } from "./types";

type Primitive = string | number | boolean | symbol;
type Other = Primitive | object | null | undefined;

/** @internal */
export function IsObject<T>(value: T): value is T & object {
    return typeof value === "object" && value !== null
        || typeof value === "function";
}

function IsFunctionOrUndefined(value: any): value is Function | undefined {
    return typeof value === "function" || value === undefined;
}

/** @internal */
export function IsPromiseLike(value: any): value is PromiseLike<any> {
    return IsObject(value)
        && "then" in value && typeof value.then === "function";
}

/** @internal */
export function IsHierarchyProvider<TNode>(value: HierarchyProvider<TNode> | Other): value is HierarchyProvider<TNode> {
    return IsObject(value)
        && "parent" in value && typeof value.parent === "function"
        && "children" in value && typeof value.children === "function"
        && IsFunctionOrUndefined(value.owns);
}

/** @internal */
export function IsGrouping<K, V>(value: Grouping<K, V> | Other): value is Grouping<K, V> {
    return IsObject(value) 
        && Symbol.iterator in value
        && "key" in value;
}

/** @internal */
export function IsArrayLike<T>(value: ArrayLike<T> | Other): value is ArrayLike<T> {
    return IsObject(value) && typeof value !== "function" 
        && "length" in value;
}

/** @internal */
export function IsIterable<T>(value: Iterable<T> | Other): value is Iterable<T> {
    return IsObject(value) 
        && Symbol.iterator in value;
}

/** @internal */
export function IsOrderedIterable<T>(value: Iterable<T> | Other): value is OrderedIterable<T> {
    return IsObject(value) 
        && Symbol.iterator in value
        && OrderedIterable.thenBy in value;
}

/** @internal */
export function IsHierarchyIterable<T>(value: Iterable<T> | Other): value is HierarchyIterable<T> {
    return IsObject(value) 
        && Symbol.iterator in value
        && Hierarchical.hierarchy in value;
}

/** @internal */
export function IsOrderedHierarchyIterable<T>(value: Iterable<T> | Other): value is OrderedHierarchyIterable<T> {
    return IsObject(value) 
        && Symbol.iterator in value
        && OrderedIterable.thenBy in value
        && Hierarchical.hierarchy in value;
}

/** @internal */
export function IsAsyncIterable<T>(value: AsyncIterable<T> | Other): value is AsyncIterable<T> {
    return IsObject(value)
        && Symbol.asyncIterator in value;
}

/** @internal */
export function IsAsyncOrderedIterable<T>(value: AsyncIterable<T> | Other): value is AsyncOrderedIterable<T> {
    return IsObject(value)
        && Symbol.asyncIterator in value
        && AsyncOrderedIterable.thenByAsync in value;
}

/** @internal */
export function IsAsyncHierarchyIterable<T>(value: AsyncIterable<T> | Other): value is AsyncHierarchyIterable<T> {
    return IsObject(value)
        && Symbol.asyncIterator in value
        && Hierarchical.hierarchy in value;
}

/** @internal */
export function IsAsyncOrderedHierarchyIterable<T>(value: AsyncIterable<T> | Other): value is AsyncOrderedHierarchyIterable<T> {
    return IsObject(value)
        && Symbol.asyncIterator in value
        && AsyncOrderedIterable.thenByAsync in value
        && Hierarchical.hierarchy in value;
}

/** @internal */
export function IsPossiblyAsyncIterable<T>(value: PossiblyAsyncIterable<T> | Other): value is PossiblyAsyncIterable<T> {
    return IsAsyncIterable(value)
        || IsIterable(value);
}

/** @internal */
export function IsPossiblyAsyncOrderedIterable<T>(value: PossiblyAsyncIterable<T> | Other): value is PossiblyAsyncOrderedIterable<T> {
    return IsAsyncOrderedIterable(value)
        || IsOrderedIterable(value);
}

/** @internal */
export function IsPossiblyAsyncHierarchyIterable<T>(value: PossiblyAsyncIterable<T> | Other): value is PossiblyAsyncHierarchyIterable<T> {
    return IsAsyncHierarchyIterable(value)
        || IsHierarchyIterable(value);
}

/** @internal */
export function IsPossiblyAsyncOrderedHierarchyIterable<T>(value: PossiblyAsyncIterable<T> | Other): value is PossiblyAsyncOrderedHierarchyIterable<T> {
    return IsAsyncOrderedHierarchyIterable(value)
        || IsOrderedHierarchyIterable(value);
}

/** @internal */
export function IsQueryable<T>(value: Queryable<T> | Other): value is Queryable<T> {
    return IsIterable(value)
        || IsArrayLike(value);
}

/** @internal */
export function IsQuerySource<T>(value: QuerySource<T> | Other): value is QuerySource<T> {
    return IsObject(value)
        && QuerySource.source in value
        && QuerySource.create in value;
}

/** @internal */
export function IsAsyncQuerySource<T>(value: AsyncQuerySource<T> | Other): value is AsyncQuerySource<T> {
    return IsObject(value)
        && AsyncQuerySource.source in value
        && AsyncQuerySource.create in value
        && AsyncQuerySource.createSync in value;
}