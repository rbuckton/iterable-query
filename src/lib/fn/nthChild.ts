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

import { assert, GetHierarchy, ToStringTag} from "../internal";
import { HierarchyProvider, HierarchyIterable, Hierarchical } from "../types";
import { elementAt } from "./elementAt";
import { Axis } from "./axis";

/**
 * Creates a [[HierarchyIterable]] for the child of each element at the specified offset. A negative offset
 * starts from the last child.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param offset The offset for the child.
 * @category Hierarchy
 */
export function nthChild<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, offset: number): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeInteger(offset, "offset");
    return new NthChildIterable(source, offset);
}

function nthChildOf<TNode, T extends TNode>(element: T | undefined, provider: HierarchyProvider<TNode>, offset: number) {
    if (element !== undefined) {
        const children = Axis.children(provider, element);
        return elementAt(children, offset);
    }
    return undefined;
}

@ToStringTag("NthChildIterable")
class NthChildIterable<TNode, T extends TNode> implements Iterable<TNode> {
    private _source: HierarchyIterable<TNode, T>;
    private _offset: number;

    constructor(source: HierarchyIterable<TNode, T>, offset: number) {
        this._source = source;
        this._offset = offset;
    }

    *[Symbol.iterator](): Iterator<TNode> {
        const source = this._source;
        const hierarchy = GetHierarchy(source);
        const offset = this._offset;
        for (const element of source) {
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
