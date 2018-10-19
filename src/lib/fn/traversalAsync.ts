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

import { assert, True, GetHierarchy, ToStringTag, ClassName } from "../internal";
import { HierarchyProvider, AsyncHierarchyIterable, Hierarchical, PossiblyAsyncHierarchyIterable } from "../types";
import { Axis } from "./axis";

/** @category Hierarchy */
export function rootAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function rootAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode>;
export function rootAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncRootTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function ancestorsAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function ancestorsAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode>;
export function ancestorsAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncAncestorsTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function ancestorsAndSelfAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function ancestorsAndSelfAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode>;
export function ancestorsAndSelfAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncAncestorsAndSelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function descendantsAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function descendantsAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode>;
export function descendantsAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncDescendantsTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function descendantsAndSelfAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function descendantsAndSelfAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode>;
export function descendantsAndSelfAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncDescendantsAndSelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function parentsAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function parentsAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode>;
export function parentsAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncParentsTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function selfAsync<TNode, T extends TNode, U extends T>(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate: (element: T) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function selfAsync<TNode, T extends TNode>(source: AsyncHierarchyIterable<T>, predicate?: (element: T) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode, T>;
export function selfAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncSelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function siblingsAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function siblingsAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode>;
export function siblingsAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncSiblingsTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function siblingsAndSelfAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function siblingsAndSelfAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode>;
export function siblingsAndSelfAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncSiblingsAndSelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function siblingsBeforeSelfAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function siblingsBeforeSelfAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode>;
export function siblingsBeforeSelfAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncSiblingsBeforeSelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function siblingsAfterSelfAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function siblingsAfterSelfAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode>;
export function siblingsAfterSelfAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncSiblingsAfterSelfTraversalIterable(source, predicate);
}

/** @category Hierarchy */
export function childrenAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => element is U): AsyncHierarchyIterable<TNode, U>;
/** @category Hierarchy */
export function childrenAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate?: (element: TNode) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode>;
export function childrenAsync<TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean> = True): AsyncHierarchyIterable<TNode> {
    assert.mustBePossiblyAsyncHierarchyIterable(source, "source");
    assert.mustBeFunctionOrUndefined(predicate, "predicate");
    return new AsyncChildrenTraversalIterable(source, predicate);
}

function CreateAsyncTraversalIterable(tag: string, axis: <TNode>(provider: HierarchyProvider<TNode>, element: TNode) => Iterable<TNode>) {
    @ClassName(tag)
    @ToStringTag(tag)
    class AsyncHierarchyTraversalIterable<TNode> implements AsyncHierarchyIterable<TNode> {
        private _source: PossiblyAsyncHierarchyIterable<TNode>;
        private _predicate: (element: TNode) => boolean | PromiseLike<boolean>;
        private _axis: (provider: HierarchyProvider<TNode>, element: TNode) => Iterable<TNode>;

        constructor(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode) => boolean | PromiseLike<boolean>) {
            this._source = source;
            this._predicate = predicate;
            this._axis = axis;
        }

        async *[Symbol.asyncIterator](): AsyncIterator<TNode> {
            const source = this._source;
            const hierarchy = GetHierarchy(this._source);
            const predicate = this._predicate;
            const axis = this._axis;
            for await (const element of source) {
                for (const related of axis(hierarchy, element)) {
                    if (await predicate(related)) {
                        yield related;
                    }
                }
            }
        }

        [Hierarchical.hierarchy]() {
            return GetHierarchy(this._source);
        }
    }

    return AsyncHierarchyTraversalIterable;
}

const AsyncRootTraversalIterable = CreateAsyncTraversalIterable("AsyncRootTraversalIterable", Axis.root);
const AsyncAncestorsTraversalIterable = CreateAsyncTraversalIterable("AsyncAncestorsTraversalIterable", Axis.ancestors);
const AsyncAncestorsAndSelfTraversalIterable = CreateAsyncTraversalIterable("AsyncAncestorsAndSelfTraversalIterable", Axis.ancestorsAndSelf);
const AsyncDescendantsTraversalIterable = CreateAsyncTraversalIterable("AsyncDescendantsTraversalIterable", Axis.descendants);
const AsyncDescendantsAndSelfTraversalIterable = CreateAsyncTraversalIterable("AsyncDescendantsAndSelfTraversalIterable", Axis.descendantsAndSelf);
const AsyncParentsTraversalIterable = CreateAsyncTraversalIterable("AsyncParentsTraversalIterable", Axis.parents);
const AsyncSelfTraversalIterable = CreateAsyncTraversalIterable("AsyncSelfTraversalIterable", Axis.self);
const AsyncSiblingsTraversalIterable = CreateAsyncTraversalIterable("AsyncSiblingsTraversalIterable", Axis.siblings);
const AsyncSiblingsAndSelfTraversalIterable = CreateAsyncTraversalIterable("AsyncSiblingsAndSelfTraversalIterable", Axis.siblingsAndSelf);
const AsyncSiblingsBeforeSelfTraversalIterable = CreateAsyncTraversalIterable("AsyncSiblingsBeforeSelfTraversalIterable", Axis.siblingsBeforeSelf);
const AsyncSiblingsAfterSelfTraversalIterable = CreateAsyncTraversalIterable("AsyncSiblingsAfterSelfTraversalIterable", Axis.siblingsAfterSelf);
const AsyncChildrenTraversalIterable = CreateAsyncTraversalIterable("AsyncChildrenTraversalIterable", Axis.children);