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
import { HierarchyIterable, Hierarchical } from "../types";
import { Map, Set } from "../collections";
import { Axis } from "./axis";
import { toArray } from "./toArray";
import { T } from "./common";

/**
 * Creates a [[HierarchyIterable]] for the bottom-most elements of a [[HierarchyIterable]].
 * Elements of `source` that are an ancestor of any other element of `source` are removed.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param predicate An optional callback used to filter the results.
 * @category Hierarchy
 */
export function bottomMost<TNode, T extends TNode, U extends T>(source: HierarchyIterable<TNode, T>, predicate: (value: T) => value is U): HierarchyIterable<TNode, U>;
/**
 * Creates a [[HierarchyIterable]] for the bottom-most elements of a [[HierarchyIterable]].
 * Elements of `source` that are an ancestor of any other element of `source` are removed.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param predicate An optional callback used to filter the results.
 * @category Hierarchy
 */
export function bottomMost<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, predicate?: (value: T) => boolean): HierarchyIterable<TNode, T>;
export function bottomMost<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, predicate: (value: T) => boolean = T): HierarchyIterable<TNode, T> {
    assert.mustBeHierarchyIterable(source, "source");
    return new BottomMostIterable(source, predicate);
}

@ToStringTag("BottomMostIterable")
class BottomMostIterable<TNode, T extends TNode> implements HierarchyIterable<TNode, T> {
    private _source: HierarchyIterable<TNode, T>;
    private _predicate: (value: T) => boolean;

    constructor(source: HierarchyIterable<TNode, T>, predicate: (value: T) => boolean) {
        this._source = source;
        this._predicate = predicate;
    }

    *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const predicate = this._predicate;
        const hierarchy = GetHierarchy(source);
        const bottomMostNodes = toArray(source);
        const ancestors = new Map<TNode, Set<TNode>>();
        for (let i = bottomMostNodes.length - 1; i >= 1; i--) {
            const node = bottomMostNodes[i];
            for (let j = i - 1; j >= 0; j--) {
                const other = bottomMostNodes[j];
                let ancestorsOfOther = ancestors.get(other);
                if (!ancestorsOfOther) {
                    ancestorsOfOther = new Set(Axis.ancestors(hierarchy, other));
                    ancestors.set(other, ancestorsOfOther);
                }

                if (ancestorsOfOther.has(node)) {
                    bottomMostNodes.splice(i, 1);
                    break;
                }

                let ancestorsOfNode = ancestors.get(node);
                if (!ancestorsOfNode) {
                    ancestorsOfNode = new Set(Axis.ancestors(hierarchy, node));
                    ancestors.set(node, ancestorsOfNode);
                }

                if (ancestorsOfNode.has(other)) {
                    bottomMostNodes.splice(j, 1);
                    i--;
                }
            }
        }

        for (const node of bottomMostNodes) {
            if (predicate(node)) yield node;
        }
    }

    [Hierarchical.hierarchy]() {
        return GetHierarchy(this._source);
    }
}