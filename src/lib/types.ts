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

/// <reference lib="es2015.iterable" />
/// <reference lib="esnext.asynciterable" />
import "./compat";

/**
 * Typed key-value pairs derived from the properties of an `object`.
 */
export type KeyValuePair<T extends object, K extends keyof T> = K extends keyof T ? [K, T[K]] : never;

// Hierarchies

/**
 * Describes an object that defines the relationships between parents and children of an element.
 */
export interface HierarchyProvider<TNode> {
    /**
     * Indicates whether the supplied element is contained within a hierarchy.
     */
    owns(element: TNode): boolean;

    /**
     * Gets the parent element for the supplied element.
     */
    parent(element: TNode): TNode | undefined;

    /**
     * Gets the children elements for the supplied element.
     */
    children(element: TNode): Queryable<TNode> | undefined;
}

export namespace Hierarchical {
    export const hierarchy = Symbol("Hierarchical.hierarchy");
}

export interface Hierarchical<TNode> {
    [Hierarchical.hierarchy](): HierarchyProvider<TNode>;
}

// Grouping

export interface Grouping<K, V> extends Iterable<V> {
    readonly key: K;
}

export interface HierarchyGrouping<K, VNode, V extends VNode = VNode> extends Grouping<K, V>, HierarchyIterable<VNode, V> {
}

// Paging

export interface Page<T> extends Iterable<T> {
    readonly page: number;
    readonly offset: number;
}

export interface HierarchyPage<TNode, T extends TNode = TNode> extends Page<T>, HierarchyIterable<TNode, T> {
}

// Iteration

export namespace OrderedIterable {
    export const thenBy = Symbol.for("OrderedIterable.thenBy");
}

export interface OrderedIterable<T> extends Iterable<T> {
    [OrderedIterable.thenBy]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): OrderedIterable<T>;
}

export interface HierarchyIterable<TNode, T extends TNode = TNode> extends Iterable<T>, Hierarchical<TNode> {
}

export interface OrderedHierarchyIterable<TNode, T extends TNode = TNode> extends OrderedIterable<T>, HierarchyIterable<TNode, T> {
}

// Async iteration

export namespace AsyncOrderedIterable {
    export const thenByAsync = Symbol.for("AsyncOrderedIterable.thenByAsync");
}

export interface AsyncOrderedIterable<T> extends AsyncIterable<T> {
    [AsyncOrderedIterable.thenByAsync]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedIterable<T>;
}

export interface AsyncHierarchyIterable<TNode, T extends TNode = TNode> extends AsyncIterable<T>, Hierarchical<TNode> {
}

export interface AsyncOrderedHierarchyIterable<TNode, T extends TNode = TNode> extends AsyncOrderedIterable<T>, AsyncHierarchyIterable<TNode, T> {
}

// Compatibility

export type Queryable<T> = Iterable<T> | ArrayLike<T>;
export type PossiblyAsyncIterator<T> = AsyncIterator<T> | Iterator<T>;
export type PossiblyAsyncIterable<T> = AsyncIterable<T> | Iterable<T>;
export type PossiblyAsyncQueryable<T> = AsyncIterable<T> | Queryable<T>;
export type PossiblyAsyncOrderedIterable<T> = AsyncOrderedIterable<T> | OrderedIterable<T>;
export type PossiblyAsyncOrderedHierarchyIterable<TNode, T extends TNode = TNode> = AsyncOrderedHierarchyIterable<TNode, T> | OrderedHierarchyIterable<TNode, T>;
export type PossiblyAsyncHierarchyIterable<TNode, T extends TNode = TNode> = AsyncHierarchyIterable<TNode, T> | HierarchyIterable<TNode, T>;

// Queries

export namespace QuerySource {
    export const source = Symbol("QuerySource.source");
    export const create = Symbol("QuerySource.create");
}

export interface QuerySource<T> extends Iterable<T> {
    [QuerySource.source](): Queryable<T>;
    [QuerySource.create]<U>(value: Queryable<U>): QuerySource<U>;
}

export interface QuerySourceConstructor {
    prototype: QuerySource<unknown>;
    new <T>(source: Queryable<T>): QuerySource<T>;
} 

export interface HierarchyQuerySource<TNode, T extends TNode = TNode> extends QuerySource<T>, HierarchyIterable<TNode, T> {
}

export interface HierarchyQuerySourceConstructor {
    prototype: HierarchyQuerySource<unknown>;
    new <TNode, T extends TNode>(source: HierarchyIterable<TNode, T>): HierarchyQuerySource<TNode, T>;
}

export interface OrderedQuerySource<T> extends QuerySource<T>, OrderedIterable<T> {
}

export interface OrderedQuerySourceConstructor {
    prototype: OrderedQuerySource<unknown>;
    new <T>(source: OrderedIterable<T>): OrderedQuerySource<T>;
}

export interface OrderedHierarchyQuerySource<TNode, T extends TNode = TNode> extends QuerySource<T>, OrderedIterable<T>, HierarchyIterable<TNode, T> {
}

export interface OrderedHierarchyQuerySourceConstructor {
    prototype: OrderedHierarchyQuerySource<unknown>;
    new <TNode, T extends TNode>(source: OrderedHierarchyIterable<TNode, T>): OrderedHierarchyQuerySource<TNode, T>;
}

export namespace AsyncQuerySource {
    export const source = Symbol("AsyncQuerySource.source");
    export const create = Symbol("AsyncQuerySource.create");
    export const createSync = Symbol("AsyncQuerySource.createSync");
}

export interface AsyncQuerySource<T> extends AsyncIterable<T> {
    [AsyncQuerySource.source](): PossiblyAsyncQueryable<T>;
    [AsyncQuerySource.create]<U>(value: PossiblyAsyncQueryable<U>): AsyncQuerySource<U>;
    [AsyncQuerySource.createSync]<U>(value: Queryable<U>): QuerySource<U>;
}

export interface AsyncQuerySourceConstructor {
    prototype: AsyncQuerySource<unknown>;
    new <T>(source: PossiblyAsyncQueryable<T>): AsyncQuerySource<T>;
}

export interface AsyncHierarchyQuerySource<TNode, T extends TNode = TNode> extends AsyncQuerySource<T>, AsyncHierarchyIterable<TNode, T> {
}

export interface AsyncHierarchyQuerySourceConstructor {
    prototype: AsyncHierarchyQuerySource<unknown>;
    new <TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyQuerySource<TNode, T>;
}

export interface AsyncOrderedQuerySource<T> extends AsyncQuerySource<T>, AsyncOrderedIterable<T> {
}

export interface AsyncOrderedQuerySourceConstructor {
    prototype: AsyncOrderedQuerySource<unknown>;
    new <T>(source: PossiblyAsyncOrderedIterable<T>): AsyncOrderedQuerySource<T>;
}

export interface AsyncOrderedHierarchyQuerySource<TNode, T extends TNode = TNode> extends AsyncQuerySource<T>, AsyncOrderedIterable<T>, AsyncHierarchyIterable<TNode, T> {
}

export interface AsyncOrderedHierarchyQuerySourceConstructor {
    prototype: AsyncOrderedHierarchyQuerySource<unknown>;
    new <TNode, T extends TNode>(source: PossiblyAsyncOrderedHierarchyIterable<TNode, T>): AsyncOrderedHierarchyQuerySource<TNode, T>;
}