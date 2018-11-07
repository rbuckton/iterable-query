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
import { Axis } from "./axis";
import { T } from "./common";

/** @category Hierarchy */
export function root<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function root<TNode>(source: HierarchyIterable<TNode>, predicate?: (element: TNode) => boolean): HierarchyIterable<TNode>;
export function root<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new RootTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function ancestors<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function ancestors<TNode>(source: HierarchyIterable<TNode>, predicate?: (element: TNode) => boolean): HierarchyIterable<TNode>;
export function ancestors<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AncestorsTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function ancestorsAndSelf<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function ancestorsAndSelf<TNode>(source: HierarchyIterable<TNode>, predicate?: (element: TNode) => boolean): HierarchyIterable<TNode>;
export function ancestorsAndSelf<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AncestorsAndSelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function descendants<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function descendants<TNode>(source: HierarchyIterable<TNode>, predicate?: (element: TNode) => boolean): HierarchyIterable<TNode>;
export function descendants<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new DescendantsTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function descendantsAndSelf<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function descendantsAndSelf<TNode>(source: HierarchyIterable<TNode>, predicate?: (element: TNode) => boolean): HierarchyIterable<TNode>;
export function descendantsAndSelf<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new DescendantsAndSelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function parents<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function parents<TNode>(source: HierarchyIterable<TNode>, predicate?: (element: TNode) => boolean): HierarchyIterable<TNode>;
export function parents<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new ParentsTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function self<TNode, T extends TNode, U extends T>(source: HierarchyIterable<TNode, T>, predicate: (element: T) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function self<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, predicate?: (element: T) => boolean): HierarchyIterable<TNode, T>;
export function self<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new SelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function siblings<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function siblings<TNode>(source: HierarchyIterable<TNode>, predicate?: (element: TNode) => boolean): HierarchyIterable<TNode>;
export function siblings<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new SiblingsTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function siblingsAndSelf<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function siblingsAndSelf<TNode>(source: HierarchyIterable<TNode>, predicate?: (element: TNode) => boolean): HierarchyIterable<TNode>;
export function siblingsAndSelf<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new SiblingsAndSelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function siblingsBeforeSelf<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function siblingsBeforeSelf<TNode>(source: HierarchyIterable<TNode>, predicate?: (element: TNode) => boolean): HierarchyIterable<TNode>;
export function siblingsBeforeSelf<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new SiblingsBeforeSelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function siblingsAfterSelf<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function siblingsAfterSelf<TNode>(source: HierarchyIterable<TNode>, predicate?: (element: TNode) => boolean): HierarchyIterable<TNode>;
export function siblingsAfterSelf<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new SiblingsAfterSelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function children<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => element is U): HierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function children<TNode>(source: HierarchyIterable<TNode>, predicate?: (element: TNode) => boolean): HierarchyIterable<TNode>;
export function children<TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean = T): HierarchyIterable<TNode> {
    assert.mustBeHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new ChildrenTraversalIterable(source, predicate);
}

function CreateTraversalIterable(tag: string, axis: <TNode>(provider: HierarchyProvider<TNode>, element: TNode) => Iterable<TNode>) {
    @ToStringTag(tag)
    class HierarchyTraversalIterable<TNode> implements HierarchyIterable<TNode> {
        private _source: HierarchyIterable<TNode>;
        private _predicate: (element: TNode) => boolean;
        private _axis: (provider: HierarchyProvider<TNode>, element: TNode) => Iterable<TNode>;

        constructor(source: HierarchyIterable<TNode>, predicate: (element: TNode) => boolean) {
            this._source = source;
            this._predicate = predicate;
            this._axis = axis;
        }

        *[Symbol.iterator](): Iterator<TNode> {
            const source = this._source;
            const hierarchy = GetHierarchy(source);
            const predicate = this._predicate;
            const axis = this._axis;
            for (const element of source) {
                for (const related of axis(hierarchy, element)) {
                    if (predicate(related)) {
                        yield related;
                    }
                }
            }
        }

        [Hierarchical.hierarchy]() {
            return GetHierarchy(this._source);
        }
    }
    return HierarchyTraversalIterable;
}

const RootTraversalIterable = CreateTraversalIterable("RootTraversalIterable", Axis.root);
const AncestorsTraversalIterable = CreateTraversalIterable("AncestorsTraversalIterable", Axis.ancestors);
const AncestorsAndSelfTraversalIterable = CreateTraversalIterable("AncestorsAndSelfTraversalIterable", Axis.ancestorsAndSelf);
const DescendantsTraversalIterable = CreateTraversalIterable("DescendantsTraversalIterable", Axis.descendants);
const DescendantsAndSelfTraversalIterable = CreateTraversalIterable("DescendantsAndSelfTraversalIterable", Axis.descendantsAndSelf);
const ParentsTraversalIterable = CreateTraversalIterable("ParentsTraversalIterable", Axis.parents);
const SelfTraversalIterable = CreateTraversalIterable("SelfTraversalIterable", Axis.self);
const SiblingsTraversalIterable = CreateTraversalIterable("SiblingsTraversalIterable", Axis.siblings);
const SiblingsAndSelfTraversalIterable = CreateTraversalIterable("SiblingsAndSelfTraversalIterable", Axis.siblingsAndSelf);
const SiblingsBeforeSelfTraversalIterable = CreateTraversalIterable("SiblingsBeforeSelfTraversalIterable", Axis.siblingsBeforeSelf);
const SiblingsAfterSelfTraversalIterable = CreateTraversalIterable("SiblingsAfterSelfTraversalIterable", Axis.siblingsAfterSelf);
const ChildrenTraversalIterable = CreateTraversalIterable("ChildrenTraversalIterable", Axis.children);
