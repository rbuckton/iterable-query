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

import { assert, GetHierarchy, ToStringTag } from "../internal";
import { AsyncHierarchyIterable, Hierarchical, PossiblyAsyncHierarchyIterable } from "../types";
import { Axis } from "./axis";
import { Map, Set } from "../collections";
import { toArrayAsync } from "./toArrayAsync";
import { T } from "./common";

/**
 * Creates an [[AsyncHierarchyIterable]] for the top-most elements. Elements of `source` that are a descendant of any other
 * element of `source` are removed.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param predicate An optional callback used to filter the results.
 * @category Hierarchy
 */
export function topMostAsync<TNode, T extends TNode, U extends T>(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate: (element: T) => element is U): AsyncHierarchyIterable<TNode, U>;
/**
 * Creates an [[AsyncHierarchyIterable]] for the top-most elements. Elements of `source` that are a descendant of any other
 * element of `source` are removed.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param predicate An optional callback used to filter the results.
 * @category Hierarchy
 */
export function topMostAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate?: (element: T) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode, T>;
export function topMostAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate: (element: T) => boolean | PromiseLike<boolean> = T): AsyncHierarchyIterable<TNode, T> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    return new AsyncTopMostIterable(source, predicate);
}

@ToStringTag("AsyncTopMostIterable")
class AsyncTopMostIterable<TNode, T extends TNode> implements AsyncHierarchyIterable<TNode, T> {
    private _source: PossiblyAsyncHierarchyIterable<TNode, T>;
    private _predicate: (value: T) => boolean | PromiseLike<boolean>;

    constructor(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate: (value: T) => boolean | PromiseLike<boolean>) {
        this._source = source;
        this._predicate = predicate;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const source = this._source;
        const predicate = this._predicate;
        const hierarchy = GetHierarchy(source);
        const topMostNodes = await toArrayAsync(source);
        const ancestors = new Map<TNode, Set<TNode>>();
        for (let i = topMostNodes.length - 1; i >= 1; i--) {
            const node = topMostNodes[i];
            for (let j = i - 1; j >= 0; j--) {
                const other = topMostNodes[j];
                let ancestorsOfNode = ancestors.get(node);
                if (!ancestorsOfNode) {
                    ancestorsOfNode = new Set(Axis.ancestors(hierarchy, node));
                    ancestors.set(node, ancestorsOfNode);
                }

                if (ancestorsOfNode.has(other)) {
                    topMostNodes.splice(i, 1);
                    break;
                }

                let ancestorsOfOther = ancestors.get(other);
                if (!ancestorsOfOther) {
                    ancestorsOfOther = new Set(Axis.ancestors(hierarchy, other));
                    ancestors.set(other, ancestorsOfOther);
                }

                if (ancestorsOfOther.has(node)) {
                    topMostNodes.splice(j, 1);
                    i--;
                }
            }
        }

        if (predicate === T) {
            yield* topMostNodes;
        }
        else {
            for (const node of topMostNodes) {
                if (await predicate(node)) yield node;
            }
        }
    }

    [Hierarchical.hierarchy]() {
        return GetHierarchy(this._source);
    }
}