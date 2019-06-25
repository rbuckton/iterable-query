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
/** @module "iterable-query" */

/// <reference lib="es2015.iterable" />
/// <reference lib="esnext.asynciterable" />
import "./compat";
import { Comparison, Comparer } from '@esfx/equatable';

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
    owns?(element: TNode): boolean;

    /**
     * Gets the parent element for the supplied element.
     */
    parent(element: TNode): TNode | undefined;

    /**
     * Gets the children elements for the supplied element.
     */
    children(element: TNode): Queryable<TNode> | undefined;
}

/**
 * Describes an object that has a navigable hierarchy.
 */
export interface Hierarchical<TNode> {
    /**
     * Gets an object that provides hierarchical relationships.
     */
    [Hierarchical.hierarchy](): HierarchyProvider<TNode>;
}

export namespace Hierarchical {
    /** @ignore */
    export const hierarchy = Symbol("Hierarchical.hierarchy");
}

// Comparables

export { Comparable } from "@esfx/equatable";
export { Equatable } from "@esfx/equatable";

// Grouping

/**
 * Represents a group of values associated with the same key.
 */
export interface Grouping<K, V> extends Iterable<V> {
    /**
     * The key associated with this group.
     *
     * NOTE: This is a convenience alias for [Grouping.key] and should return the same value.
     */
    readonly key: K;

    /**
     * The key associated with this group.
     *
     * NOTE: This is a convenience alias for the values in the grouping and should return the same values.
     */
    readonly values: Iterable<V>;

    /**
     * The key associated with this group.
     */
    readonly [Grouping.key]: K;
}

export namespace Grouping {
    export const key = Symbol("Grouping.key");
}

/**
 * Represents a group of hierarchical values associated with the same key.
 */
export interface HierarchyGrouping<K, VNode, V extends VNode = VNode> extends Grouping<K, V>, HierarchyIterable<VNode, V> {
}

// Paging

/**
 * Represents a page of values.
 */
export interface Page<T> extends Iterable<T> {
    /**
     * The page offset from the start of the source iterable.
     *
     * NOTE: This is a convenience alias for [Page.page] and should return the same value.
     */
    readonly page: number;

    /**
     * The element offset from the start of the source iterable.
     *
     * NOTE: This is a convenience alias for [Page.offset] and should return the same value.
     */
    readonly offset: number;

    /**
     * The page offset from the start of the source iterable.
     */
    readonly [Page.page]: number;

    /**
     * The element offset from the start of the source iterable.
     */
    readonly [Page.offset]: number;
}

export namespace Page {
    export const page = Symbol("Page.page");
    export const offset = Symbol("Page.offset");
}

/**
 * Represents a page of hierarchical values.
 */
export interface HierarchyPage<TNode, T extends TNode = TNode> extends Page<T>, HierarchyIterable<TNode, T> {
}

// Iteration

/**
 * Represents an [[Iterable]] that is inherently ordered.
 */
export interface OrderedIterable<T> extends Iterable<T> {
    /**
     * Creates a subsequent `OrderedIterable` whose elements are also ordered by the provided key.
     * @param keySelector A callback used to select the key for an element.
     * @param comparer A callback used to compare two keys.
     * @param descending A value indicating whether to sort in descending (`true`) or ascending (`false`) order.
     */
    [OrderedIterable.thenBy]<K>(keySelector: (element: T) => K, comparer: Comparison<K> | Comparer<K>, descending: boolean): OrderedIterable<T>;
}

export namespace OrderedIterable {
    /** @ignore */
    export const thenBy = Symbol.for("OrderedIterable.thenBy");
}

/**
 * Represents an [[Iterable]] with a navigable hierarchy.
 */
export interface HierarchyIterable<TNode, T extends TNode = TNode> extends Iterable<T>, Hierarchical<TNode> {
}

/**
 * Represents an [[Iterable]] with a navigable hierarchy that is inherently ordered.
 */
export interface OrderedHierarchyIterable<TNode, T extends TNode = TNode> extends OrderedIterable<T>, HierarchyIterable<TNode, T> {
}

export type Choice<K, V> = [K, Queryable<V>];

// Async iteration

/**
 * Represents an [[AsyncIterable]] that is inherently ordered.
 */
export interface AsyncOrderedIterable<T> extends AsyncIterable<T> {
    /**
     * Creates a subsequent `AsyncOrderedIterable` whose elements are also ordered by the provided key.
     * @param keySelector A callback used to select the key for an element.
     * @param comparer An optional callback used to compare two keys.
     * @param descending A value indicating whether to sort in descending (`true`) or ascending (`false`) order.
     */
    [AsyncOrderedIterable.thenByAsync]<K>(keySelector: (element: T) => K, comparer: Comparison<K> | Comparer<K>, descending: boolean): AsyncOrderedIterable<T>;
}

export namespace AsyncOrderedIterable {
    export const thenByAsync = Symbol.for("AsyncOrderedIterable.thenByAsync");
}

/**
 * Represents an [[AsyncIterable]] with a navigable hierarchy.
 */
export interface AsyncHierarchyIterable<TNode, T extends TNode = TNode> extends AsyncIterable<T>, Hierarchical<TNode> {
}

/**
 * Represents an [[AsyncIterable]] with a navigable hierarchy that is inherently ordered.
 */
export interface AsyncOrderedHierarchyIterable<TNode, T extends TNode = TNode> extends AsyncOrderedIterable<T>, AsyncHierarchyIterable<TNode, T> {
}

export type AsyncChoice<K, V> = [PromiseLike<K> | K, AsyncQueryable<V>];

// Compatibility

export type Queryable<T> = Iterable<T> | ArrayLike<T>;
export type AsyncQueryable<T> = AsyncIterable<T> | Queryable<PromiseLike<T> | T>;
export type PossiblyAsyncIterable<T> = AsyncIterable<T> | Iterable<PromiseLike<T> | T>;
export type PossiblyAsyncHierarchyIterable<TNode, T extends TNode = TNode> = AsyncHierarchyIterable<TNode, T> | HierarchyIterable<TNode, T>;
export type PossiblyAsyncOrderedIterable<T> = AsyncOrderedIterable<T> | OrderedIterable<T>;
export type PossiblyAsyncOrderedHierarchyIterable<TNode, T extends TNode = TNode> = AsyncOrderedHierarchyIterable<TNode, T> | OrderedHierarchyIterable<TNode, T>;
export type QueriedType<T> = T extends Queryable<infer U> ? U : never;

export interface WritableArrayLike<T> {
    [index: number]: T;
    length: number;
}