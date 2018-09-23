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
import { HierarchyIterable, Hierarchical } from "../types";
import { Map, Set } from "../collections";
import { toArray } from "./toArray";
import { Axis } from "./axis";

/**
 * Creates a subquery for the top-most elements. Elements that are a descendant of any other
 * element are removed.
 */
export function topMost<T>(source: HierarchyIterable<T>): HierarchyIterable<T> {
    assert.mustBeHierarchyIterable(source, "source");
    return new TopMostIterable(source);
}

@ToStringTag("TopMostIterable")
class TopMostIterable<T> implements HierarchyIterable<T> {
    private _source: HierarchyIterable<T>;

    constructor(source: HierarchyIterable<T>) {
        this._source = source;
    }

    *[Symbol.iterator](): Iterator<T> {
        const source = this._source;
        const hierarchy = GetHierarchy(source);
        const topMostNodes = toArray(source);
        const ancestors = new Map<T, Set<T>>();
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

        yield* topMostNodes;
    }

    [Hierarchical.hierarchy]() {
        return GetHierarchy(this._source);
    }
}

Registry.HierarchyQuery.registerSubquery("topMost", topMost);