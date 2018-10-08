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

import { Queryable, HierarchyIterable, OrderedIterable, OrderedHierarchyIterable, AsyncQueryable, AsyncHierarchyIterable, PossiblyAsyncHierarchyIterable, AsyncOrderedIterable, PossiblyAsyncOrderedIterable, PossiblyAsyncOrderedHierarchyIterable } from "../types";

// Queries

/** @internal */
export namespace QuerySource {
    export const source = Symbol("QuerySource.source");
    export const create = Symbol("QuerySource.create");
}

/** @internal */
export interface QuerySource<T> extends Iterable<T> {
    [QuerySource.source](): Queryable<T>;
    [QuerySource.create]<U>(value: Queryable<U>): QuerySource<U>;
}

/** @internal */
export interface QuerySourceConstructor {
    prototype: QuerySource<unknown>;
    new <T>(source: Queryable<T>): QuerySource<T>;
}

/** @internal */
export interface HierarchyQuerySource<TNode, T extends TNode = TNode> extends QuerySource<T>, HierarchyIterable<TNode, T> {
}

/** @internal */
export interface HierarchyQuerySourceConstructor {
    prototype: HierarchyQuerySource<unknown>;
    new <TNode, T extends TNode>(source: HierarchyIterable<TNode, T>): HierarchyQuerySource<TNode, T>;
}

/** @internal */
export interface OrderedQuerySource<T> extends QuerySource<T>, OrderedIterable<T> {
}

/** @internal */
export interface OrderedQuerySourceConstructor {
    prototype: OrderedQuerySource<unknown>;
    new <T>(source: OrderedIterable<T>): OrderedQuerySource<T>;
}

/** @internal */
export interface OrderedHierarchyQuerySource<TNode, T extends TNode = TNode> extends QuerySource<T>, OrderedIterable<T>, HierarchyIterable<TNode, T> {
}

/** @internal */
export interface OrderedHierarchyQuerySourceConstructor {
    prototype: OrderedHierarchyQuerySource<unknown>;
    new <TNode, T extends TNode>(source: OrderedHierarchyIterable<TNode, T>): OrderedHierarchyQuerySource<TNode, T>;
}

/** @internal */
export namespace AsyncQuerySource {
    export const source = Symbol("AsyncQuerySource.source");
    export const create = Symbol("AsyncQuerySource.create");
    export const createSync = Symbol("AsyncQuerySource.createSync");
}

/** @internal */
export interface AsyncQuerySource<T> extends AsyncIterable<T> {
    [AsyncQuerySource.source](): AsyncQueryable<T>;
    [AsyncQuerySource.create]<U>(value: AsyncQueryable<U>): AsyncQuerySource<U>;
    [AsyncQuerySource.createSync]<U>(value: Queryable<U>): QuerySource<U>;
}

/** @internal */
export interface AsyncQuerySourceConstructor {
    prototype: AsyncQuerySource<unknown>;
    new <T>(source: AsyncQueryable<T>): AsyncQuerySource<T>;
}

/** @internal */
export interface AsyncHierarchyQuerySource<TNode, T extends TNode = TNode> extends AsyncQuerySource<T>, AsyncHierarchyIterable<TNode, T> {
}

/** @internal */
export interface AsyncHierarchyQuerySourceConstructor {
    prototype: AsyncHierarchyQuerySource<unknown>;
    new <TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyQuerySource<TNode, T>;
}

/** @internal */
export interface AsyncOrderedQuerySource<T> extends AsyncQuerySource<T>, AsyncOrderedIterable<T> {
}

/** @internal */
export interface AsyncOrderedQuerySourceConstructor {
    prototype: AsyncOrderedQuerySource<unknown>;
    new <T>(source: PossiblyAsyncOrderedIterable<T>): AsyncOrderedQuerySource<T>;
}

/** @internal */
export interface AsyncOrderedHierarchyQuerySource<TNode, T extends TNode = TNode> extends AsyncQuerySource<T>, AsyncOrderedIterable<T>, AsyncHierarchyIterable<TNode, T> {
}

/** @internal */
export interface AsyncOrderedHierarchyQuerySourceConstructor {
    prototype: AsyncOrderedHierarchyQuerySource<unknown>;
    new <TNode, T extends TNode>(source: PossiblyAsyncOrderedHierarchyIterable<TNode, T>): AsyncOrderedHierarchyQuerySource<TNode, T>;
}