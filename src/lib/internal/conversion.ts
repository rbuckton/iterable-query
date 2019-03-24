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

import * as assert from "./assert";
import { ToStringTag } from "./decorators";
import { GetHierarchy, GetIterator, GetAsyncIterator, ThenBy, ThenByAsync } from "./utils";
import { IsIterable, IsArrayLike, IsOrderedIterable, IsAsyncIterable, IsOrderedHierarchyIterable, IsHierarchyIterable, IsAsyncHierarchyIterable, IsAsyncOrderedIterable, IsAsyncOrderedHierarchyIterable, IsGrouping, IsPossiblyAsyncHierarchyIterable } from "./guards";
import { HierarchyIterable, AsyncHierarchyIterable, AsyncOrderedIterable, OrderedIterable, AsyncOrderedHierarchyIterable, OrderedHierarchyIterable, HierarchyProvider, Queryable, PossiblyAsyncHierarchyIterable, PossiblyAsyncOrderedHierarchyIterable, PossiblyAsyncOrderedIterable, PossiblyAsyncIterable, Hierarchical, Grouping, HierarchyGrouping, Page, HierarchyPage, AsyncQueryable } from "../types";
import { FlowHierarchy } from "./flow";

/** @internal */ export function ToIterable<TNode, T extends TNode>(value: OrderedHierarchyIterable<TNode, T>): OrderedHierarchyIterable<TNode, T>;
/** @internal */ export function ToIterable<TNode, T extends TNode>(value: HierarchyIterable<TNode, T>): HierarchyIterable<TNode, T>;
/** @internal */ export function ToIterable<T>(value: OrderedIterable<T>): OrderedIterable<T>;
/** @internal */ export function ToIterable<T>(value: Queryable<T>): Iterable<T>;
/** @internal */ export function ToIterable<T>(value: Queryable<T>): Iterable<T> {
    if (IsIterable(value)) return value;
    if (IsArrayLike(value)) return new ArrayLikeIterable(value);
    throw new TypeError();
}

/** @internal */ export function ToAsyncIterable<TNode, T extends TNode>(value: PossiblyAsyncOrderedHierarchyIterable<TNode, T>): AsyncOrderedHierarchyIterable<TNode, T>;
/** @internal */ export function ToAsyncIterable<TNode, T extends TNode>(value: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T>;
/** @internal */ export function ToAsyncIterable<T>(value: PossiblyAsyncOrderedIterable<T>): AsyncOrderedIterable<T>;
/** @internal */ export function ToAsyncIterable<T>(value: AsyncQueryable<T>): AsyncIterable<T>;
/** @internal */ export function ToAsyncIterable<T>(value: AsyncQueryable<T>) {
    if (IsAsyncIterable(value)) return value;
    if (IsOrderedHierarchyIterable(value)) return new AsyncFromSyncOrderedHierarchyIterable(value);
    if (IsOrderedIterable(value)) return new AsyncFromSyncOrderedIterable(value);
    if (IsHierarchyIterable(value)) return new AsyncFromSyncHierarchyIterable(value);
    if (IsIterable(value)) return new AsyncFromSyncIterable(value);
    if (IsArrayLike(value)) return new AsyncFromSyncIterable(new ArrayLikeIterable(value));
    throw new TypeError();
}

/** @internal */ export function ToAsyncHierarchyIterable<TNode, T extends TNode>(value: PossiblyAsyncOrderedHierarchyIterable<TNode, T>): AsyncOrderedHierarchyIterable<TNode, T>;
/** @internal */ export function ToAsyncHierarchyIterable<TNode, T extends TNode>(value: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T>;
/** @internal */ export function ToAsyncHierarchyIterable<TNode, T extends TNode>(value: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T> {
    if (IsAsyncHierarchyIterable(value)) return value;
    if (IsHierarchyIterable(value)) return ToAsyncIterable(value);
    throw new TypeError();
} 

/** @internal */ export function ToAsyncOrderedIterable<T>(value: PossiblyAsyncOrderedIterable<T>) {
    if (IsAsyncOrderedIterable(value)) return value;
    if (IsOrderedIterable(value)) return ToAsyncIterable(value);
    throw new TypeError();
}

/** @internal */ export function ToAsyncOrderedHierarchyIterable<TNode, T extends TNode>(value: PossiblyAsyncOrderedHierarchyIterable<TNode, T>) {
    if (IsAsyncOrderedHierarchyIterable(value)) return value;
    if (IsOrderedHierarchyIterable(value)) return ToAsyncIterable(value);
    throw new TypeError();
}

/** @internal */ export function ToPossiblyAsyncIterable<TNode, T extends TNode>(value: PossiblyAsyncOrderedHierarchyIterable<TNode, T>): PossiblyAsyncOrderedHierarchyIterable<TNode, T>;
/** @internal */ export function ToPossiblyAsyncIterable<TNode, T extends TNode>(value: PossiblyAsyncHierarchyIterable<TNode, T>): PossiblyAsyncHierarchyIterable<TNode, T>;
/** @internal */ export function ToPossiblyAsyncIterable<T>(value: PossiblyAsyncOrderedIterable<T>): PossiblyAsyncOrderedIterable<T>;
/** @internal */ export function ToPossiblyAsyncIterable<T>(value: AsyncQueryable<T>): PossiblyAsyncIterable<T>;
/** @internal */ export function ToPossiblyAsyncIterable<T>(value: AsyncQueryable<T>) {
    if (IsAsyncIterable(value)) return value;
    if (IsIterable(value)) return value;
    if (IsArrayLike(value)) return new ArrayLikeIterable(value);
    throw new TypeError();
}

/** @internal */ export function MakeHierarchyIterable<TNode, T extends TNode>(value: OrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): OrderedHierarchyIterable<TNode, T>;
/** @internal */ export function MakeHierarchyIterable<TNode, T extends TNode>(value: Queryable<T>, hierarchy: HierarchyProvider<TNode>): HierarchyIterable<TNode, T>;
/** @internal */ export function MakeHierarchyIterable<TNode, T extends TNode>(value: Queryable<T> | OrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): OrderedHierarchyIterable<TNode, T> | HierarchyIterable<TNode, T> {
    if (IsOrderedIterable(value)) return new OrderedHierarchyIterableImpl(value, hierarchy);
    if (IsGrouping(value)) return new HierarchyGroupingImpl(value.key, new HierarchyIterableImpl(value, hierarchy));
    if (IsIterable(value)) return new HierarchyIterableImpl(value, hierarchy);
    if (IsArrayLike(value)) return new HierarchyIterableImpl(new ArrayLikeIterable(value), hierarchy);
    throw new TypeError();
}

/** @internal */ export function MakeOrderedHierarchyIterable<TNode, T extends TNode>(value: OrderedIterable<T>, hierarchy: HierarchyProvider<TNode>) {
    if (IsOrderedIterable(value)) return MakeHierarchyIterable(value, hierarchy);
    throw new TypeError();
}

/** @internal */ export function MakeAsyncHierarchyIterable<TNode, T extends TNode>(value: PossiblyAsyncOrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): AsyncOrderedHierarchyIterable<TNode, T>;
/** @internal */ export function MakeAsyncHierarchyIterable<TNode, T extends TNode>(value: AsyncQueryable<T>, hierarchy: HierarchyProvider<TNode>): AsyncHierarchyIterable<TNode, T>;
/** @internal */ export function MakeAsyncHierarchyIterable<TNode, T extends TNode>(value: AsyncQueryable<T> | PossiblyAsyncOrderedIterable<T>, hierarchy: HierarchyProvider<TNode>): AsyncHierarchyIterable<TNode, T> {
    if (IsAsyncOrderedIterable(value)) return new AsyncOrderedHierarchyIterableImpl(value, hierarchy);
    if (IsAsyncIterable(value)) return new AsyncHierarchyIterableImpl(value, hierarchy);
    if (IsOrderedIterable(value)) return new AsyncOrderedHierarchyIterableImpl(new AsyncFromSyncOrderedIterable(value), hierarchy);
    if (IsIterable(value)) return new AsyncHierarchyIterableImpl(new AsyncFromSyncIterable(value), hierarchy);
    if (IsArrayLike(value)) return new AsyncHierarchyIterableImpl(new AsyncFromSyncIterable(new ArrayLikeIterable(value)), hierarchy);
    throw new TypeError();
}

@ToStringTag("ArrayLikeIterable")
class ArrayLikeIterable<T> implements Iterable<T> {
    private _source: ArrayLike<T>;

    constructor(source: ArrayLike<T>) {
        assert.mustBeArrayLike(source, "source");
        this._source = source;
    }

    *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        for (let i = 0; i < source.length; ++i) {
            yield source[i];
        }
    }
}

@ToStringTag("Async-from-sync Iterable")
class AsyncFromSyncIterable<T, TSource extends Iterable<PromiseLike<T> | T>> implements AsyncIterable<T> {
    protected _source: TSource;

    constructor(source: TSource) {
        assert.mustBeIterable(source, "source");
        this._source = source;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        yield* this._source;
    }
}

@ToStringTag("Async-from-sync HierarchyIterable")
class AsyncFromSyncHierarchyIterable<TNode, T extends TNode, TSource extends HierarchyIterable<TNode, T>> extends AsyncFromSyncIterable<T, TSource> implements AsyncHierarchyIterable<TNode, T> {
    constructor(source: TSource) {
        assert.mustBeHierarchyIterable(source, "source");
        super(source);
    }

    [Hierarchical.hierarchy]() {
        return GetHierarchy(this._source);
    }
}

@ToStringTag("Async-from-sync OrderedIterable")
class AsyncFromSyncOrderedIterable<T, TSource extends OrderedIterable<T>> extends AsyncFromSyncIterable<T, TSource> implements AsyncOrderedIterable<T> {
    constructor(source: TSource) {
        assert.mustBeOrderedIterable(source, "source");
        super(source);
    }

    [AsyncOrderedIterable.thenByAsync]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedIterable<T> {
        return new AsyncFromSyncOrderedIterable(ThenBy(this._source, keySelector, comparison, descending));
    }
}

@ToStringTag("Async-from-sync OrderedHierarchyIterable")
class AsyncFromSyncOrderedHierarchyIterable<TNode, T extends TNode, TSource extends OrderedHierarchyIterable<TNode, T>> extends AsyncFromSyncOrderedIterable<T, TSource> implements AsyncOrderedHierarchyIterable<TNode, T> {
    constructor(source: TSource) {
        assert.mustBeOrderedHierarchyIterable(source, "source");
        super(source);
    }

    [Hierarchical.hierarchy]() {
        return GetHierarchy(this._source);
    }
}

@ToStringTag("HierarchyIterable")
class HierarchyIterableImpl<TNode, T extends TNode, TSource extends Iterable<T>> implements HierarchyIterable<TNode, T> {
    protected _source: TSource;
    protected _hierarchy: HierarchyProvider<TNode>;

    constructor(source: TSource, hierarchy: HierarchyProvider<TNode>) {
        assert.mustBeIterable(source, "source");
        assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
        this._source = source;
        this._hierarchy = hierarchy;
    }

    [Symbol.iterator]() {
        return GetIterator(this._source);
    }

    [Hierarchical.hierarchy]() {
        return this._hierarchy;
    }
}

@ToStringTag("OrderedHierarchyIterable")
class OrderedHierarchyIterableImpl<TNode, T extends TNode, TSource extends OrderedIterable<T>> extends HierarchyIterableImpl<TNode, T, TSource> implements OrderedHierarchyIterable<TNode, T> {
    constructor(source: TSource, hierarchy: HierarchyProvider<TNode>) {
        assert.mustBeOrderedIterable(source, "source");
        super(source, hierarchy);
    }

    [OrderedIterable.thenBy]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): OrderedHierarchyIterable<TNode, T> {
        return new OrderedHierarchyIterableImpl(ThenBy(this._source, keySelector, comparison, descending), this._hierarchy);
    }
}

@ToStringTag("AsyncHierarchyIterable")
class AsyncHierarchyIterableImpl<TNode, T extends TNode> implements AsyncHierarchyIterable<TNode, T> {
    protected _source: AsyncIterable<T>;
    protected _hierarchy: HierarchyProvider<TNode>;

    constructor(source: AsyncIterable<T>, hierarchy: HierarchyProvider<TNode>) {
        assert.mustBeAsyncIterable(source, "source");
        assert.mustBeHierarchyProvider(hierarchy, "hierarchy");
        this._source = source;
        this._hierarchy = hierarchy;
    }

    [Symbol.asyncIterator]() {
        return GetAsyncIterator(this._source);
    }

    [Hierarchical.hierarchy]() {
        return this._hierarchy;
    }
}

@ToStringTag("AsyncOrderedHierarchyIterable")
class AsyncOrderedHierarchyIterableImpl<TNode, T extends TNode> extends AsyncHierarchyIterableImpl<TNode, T> implements AsyncOrderedHierarchyIterable<TNode, T> {
    constructor(source: AsyncOrderedIterable<T>, hierarchy: HierarchyProvider<TNode>) {
        assert.mustBeAsyncOrderedIterable(source, "source");
        super(source, hierarchy);
    }

    [AsyncOrderedIterable.thenByAsync]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedHierarchyIterable<TNode, T> {
        return new AsyncOrderedHierarchyIterableImpl(ThenByAsync(this._source as AsyncOrderedIterable<T>, keySelector, comparison, descending), this._hierarchy);
    }
}

/** @internal */ export function ToGroupingWithFlow<K, V>(key: K, elements: Iterable<V>, source?: AsyncQueryable<V>): Grouping<K, V> {
    return IsPossiblyAsyncHierarchyIterable(source)
        // TODO: fixme vvv
        // @ts-ignore
        ? CreateHierarchyGrouping(key, FlowHierarchy(elements, source)) 
        : CreateGrouping(key, elements);
}

// /** @internal */ export function CreateGrouping<K, VNode, V extends VNode>(key: K, elements: HierarchyIterable<VNode, V>): HierarchyGrouping<K, VNode, V>;
// /** @internal */ export function CreateGrouping<K, V>(key: K, elements: Queryable<V>): Grouping<K, V>;
/** @internal */ export function CreateGrouping<K, V>(key: K, elements: Queryable<V>): Grouping<K, V> {
    return IsHierarchyIterable(elements) ? new HierarchyGroupingImpl(key, elements) : new GroupingImpl(key, ToIterable(elements));
}

/** @internal */ export function CreateHierarchyGrouping<K, VNode, V extends VNode>(key: K, elements: HierarchyIterable<VNode, V>): HierarchyGrouping<K, VNode, V> {
    return new HierarchyGroupingImpl<K, VNode, V>(key, elements);
}

@ToStringTag("Grouping")
class GroupingImpl<K, V, VSource extends Iterable<V> = Iterable<V>> implements Grouping<K, V> {
    /**
     * The key for the group.
     */
    readonly key: K;

    /**
     * Gets the items in the group.
     */
    readonly values: VSource;

    /**
     * Creates a new Grouping for the specified key.
     *
     * @param key The key for the group.
     * @param values The elements in the group.
     */
    constructor(key: K, values: VSource) {
        assert.mustBeQueryable(values, "items");
        this.key = key;
        this.values = values;
    }

    get [Grouping.key]() { return this.key; }

    [Symbol.iterator]() {
        return GetIterator(this.values);
    }
}

@ToStringTag("HierarchyGrouping")
class HierarchyGroupingImpl<K, VNode, V extends VNode> extends GroupingImpl<K, V, HierarchyIterable<VNode, V>> implements HierarchyGrouping<K, VNode, V> {
    constructor(key: K, items: HierarchyIterable<VNode, V>) {
        assert.mustBeHierarchyIterable(items, "items");
        super(key, items);
    }

    [Hierarchical.hierarchy]() {
        return GetHierarchy(this.values);
    }
}

/** @internal */ export function CreatePage<T>(page: number, offset: number, items: Queryable<T>): Page<T> {
    return IsHierarchyIterable(items) ? new HierarchyPageImpl(page, offset, items) : new PageImpl(page, offset, ToIterable(items));
}

/** @internal */ export function CreateHierarchyPage<TNode, T extends TNode>(page: number, offset: number, items: HierarchyIterable<TNode, T>): HierarchyPage<TNode, T> {
    return new HierarchyPageImpl(page, offset, items);
}
/**
 * Represents a page of results.
 */
@ToStringTag("Page")
class PageImpl<T, TSource extends Iterable<T>> implements Page<T> {
    /**
     * Gets the page number (zero-based).
     */
    readonly page: number;

    /**
     * Gets the offset in the source at which the page begins (zero-based).
     */
    readonly offset: number;

    /**
     * Gets the items in the page.
     */
    protected _items: TSource;

    /**
     * Creates a new Page for the provided elements.
     *
     * @param page The page number (zero-based).
     * @param offset The offset in the source at which the page begins.
     * @param items The elements in the page.
     */
    constructor(page: number, offset: number, items: TSource) {
        assert.mustBePositiveInteger(page, "page");
        assert.mustBePositiveInteger(offset, "offset");
        assert.mustBeIterable(items, "items");
        this.page = page;
        this.offset = offset;
        this._items = items;
    }

    get [Page.page]() { return this.page; }
    get [Page.offset]() { return this.offset; }

    [Symbol.iterator]() {
        return GetIterator(this._items);
    }
}

@ToStringTag("HierarchyPage")
class HierarchyPageImpl<TNode, T extends TNode, TSource extends HierarchyIterable<TNode, T>> extends PageImpl<T, TSource> implements HierarchyPage<TNode, T> {
    constructor(page: number, offset: number, items: TSource) {
        assert.mustBeHierarchyIterable(items, "items");
        super(page, offset, items);
    }

    [Hierarchical.hierarchy]() {
        return GetHierarchy(this._items);
    }
}