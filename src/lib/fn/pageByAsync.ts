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
/** @module "iterable-query/fn" */

import { assert, ToPossiblyAsyncIterable, ToStringTag, Registry, CreatePage } from "../internal";
import { AsyncQueryable, PossiblyAsyncIterable, Page, PossiblyAsyncHierarchyIterable, HierarchyPage } from "../types";

/**
 * Creates an [[AsyncHierarchyIterable]] that splits a [[HierarchyIterable]] or 
 * [[AsyncHierarchyIterable]] into one or more pages. While advancing from page 
 * to page is evaluated lazily, the elements of the page are evaluated eagerly.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param pageSize The number of elements per page.
 * @category Subquery
 */
export function pageByAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, pageSize: number): AsyncIterable<HierarchyPage<TNode, T>>;
/**
 * Creates an [[AsyncIterable]] that splits an [[AsyncQueryable]] into one or more pages.
 * While advancing from page to page is evaluated lazily, the elements of the page are
 * evaluated eagerly.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param pageSize The number of elements per page.
 * @category Subquery
 */
export function pageByAsync<T>(source: AsyncQueryable<T>, pageSize: number): AsyncIterable<Page<T>>;
export function pageByAsync<T>(source: AsyncQueryable<T>, pageSize: number): AsyncIterable<Page<T>> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBePositiveNonZeroFiniteNumber(pageSize, "pageSize");
    return new AsyncPageByIterable(ToPossiblyAsyncIterable(source), pageSize);
}

@ToStringTag("AsyncPageByIterable")
class AsyncPageByIterable<T> implements AsyncIterable<Page<T>> {
    private _source: PossiblyAsyncIterable<T>;
    private _pageSize: number;

    constructor(source: PossiblyAsyncIterable<T>, pageSize: number) {
        this._source = source;
        this._pageSize = pageSize;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<Page<T>> {
        const pageSize = this._pageSize;
        let elements: T[] = [];
        let page = 0;
        for await (const value of this._source) {
            elements.push(value);
            if (elements.length >= pageSize) {
                yield CreatePage(page, page * pageSize, elements);
                elements = [];
                page++;
            }
        }
        if (elements.length > 0) {
            yield CreatePage(page, page * pageSize, elements);
        }
    }
}

Registry.AsyncQuery.registerSubquery("pageBy", pageByAsync);