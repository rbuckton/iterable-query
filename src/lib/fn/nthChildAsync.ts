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

import { assert, GetHierarchy, ToStringTag, Registry } from "../internal";
import { HierarchyProvider, PossiblyAsyncHierarchyIterable, AsyncHierarchyIterable, Hierarchical } from "../types";
import { Axis } from "./axis";
import { elementAt } from "./elementAt";

/**
 * Creates a subquery for the child of each element at the specified offset. A negative offset
 * starts from the last child.
 *
 * @param offset The offset for the child.
 */
export function nthChildAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, offset: number): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeInteger(offset, "offset");
    return new AsyncNthChildIterable(source, offset);
}

function nthChildOf<TNode, T extends TNode>(element: T | undefined, provider: HierarchyProvider<TNode>, offset: number) {
    if (element !== undefined) {
        const children = Axis.children(provider, element);
        return elementAt(children, offset);
    }
    return undefined;
}

@ToStringTag("AsyncNthChildIterable")
class AsyncNthChildIterable<TNode, T extends TNode> implements AsyncIterable<TNode> {
    private _source: PossiblyAsyncHierarchyIterable<TNode, T>;
    private _offset: number;

    constructor(source: PossiblyAsyncHierarchyIterable<TNode, T>, offset: number) {
        this._source = source;
        this._offset = offset;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<TNode> {
        const offset = this._offset;
        const hierarchy = GetHierarchy(this._source);
        for await (const element of this._source) {
            const child = nthChildOf(element, hierarchy, offset);
            if (child !== undefined) {
                yield child;
            }
        }
    }

    [Hierarchical.hierarchy]() {
        return GetHierarchy(this._source);
    }
}

Registry.AsyncHierarchyQuery.registerSubquery("nthChild", nthChildAsync);