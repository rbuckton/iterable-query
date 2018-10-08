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

import { assert, GetHierarchy, ToStringTag, Registry, True } from "../internal";
import { HierarchyIterable, Hierarchical } from "../types";
import { Map, Set } from "../collections";
import { toArray } from "./toArray";
import { Axis } from "./axis";

/**
 * Creates a [[HierarchyIterable]] for the top-most elements. Elements that are a descendant of any other
 * element are removed.
 * 
 * @param source A [[HierarchyIterable]] object.
 * @param predicate An optional callback used to filter the results.
 * @category Hierarchy
 */
export function topMost<TNode, T extends TNode, U extends T>(source: HierarchyIterable<TNode, T>, predicate: (value: T) => value is U): HierarchyIterable<TNode, U>;
/**
 * Creates a [[HierarchyIterable]] for the top-most elements. Elements that are a descendant of any other
 * element are removed.
 * 
 * @param source A [[HierarchyIterable]] object.
 * @param predicate An optional callback used to filter the results.
 * @category Hierarchy
 */
export function topMost<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, predicate?: (value: T) => boolean): HierarchyIterable<TNode, T>;
export function topMost<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, predicate: (value: T) => boolean = True): HierarchyIterable<TNode, T> {
    assert.mustBeHierarchyIterable(source, "source");
    return new TopMostIterable(source, predicate);
}

@ToStringTag("TopMostIterable")
class TopMostIterable<TNode, T extends TNode> implements HierarchyIterable<TNode, T> {
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
        const topMostNodes = toArray(source);
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

        for (const node of topMostNodes) {
            if (predicate(node)) yield node;
        }
    }

    [Hierarchical.hierarchy]() {
        return GetHierarchy(this._source);
    }
}

Registry.HierarchyQuery.registerSubquery("topMost", topMost);