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
/** @internal */

import { IsPossiblyAsyncHierarchyIterable, IsAsyncIterable } from "./guards";
import { MakeAsyncHierarchyIterable, MakeHierarchyIterable } from "./conversion";
import { GetHierarchy } from "./utils";
import { ToStringTag } from "./decorators";
import { Set } from "../collections";
import { AsyncQueryable, AsyncOrderedHierarchyIterable, AsyncOrderedIterable, AsyncHierarchyIterable, OrderedHierarchyIterable, OrderedIterable, HierarchyIterable, HierarchyProvider, Hierarchical, Grouping, HierarchyGrouping } from "../types";

/** @internal */ type WithHierarchy<S extends AsyncIterable<any> | Iterable<any>> =
    S extends AsyncOrderedIterable<infer T> ? AsyncOrderedHierarchyIterable<T> :
    S extends AsyncIterable<infer T> ? AsyncHierarchyIterable<T> :
    S extends OrderedIterable<infer T> ? OrderedHierarchyIterable<T> :
    S extends Grouping<infer K, infer V> ? HierarchyGrouping<K, V> :
    S extends Iterable<infer T> ? HierarchyIterable<T> :
    never;

/** @internal */ type PossiblyWithHierarchy<T, R extends AsyncIterable<T> | Iterable<T>, FlowLeft extends AsyncQueryable<T> | undefined, FlowRight extends AsyncQueryable<T> | undefined> =
    R extends Hierarchical<T> ? R :
    FlowLeft extends Hierarchical<T> ? WithHierarchy<R> :
    FlowRight extends Hierarchical<T> ? WithHierarchy<R> :
    R;

/** @internal */ export function FlowHierarchy<T, R extends AsyncIterable<T> | Iterable<T>, FlowLeft extends AsyncQueryable<T>, FlowRight extends AsyncQueryable<T> | undefined>(result: R, flowLeft: FlowLeft, flowRight?: FlowRight): PossiblyWithHierarchy<T, R, FlowLeft, FlowRight>;
/** @internal */ export function FlowHierarchy<T>(result: Iterable<T>, flowLeft: AsyncQueryable<T>, flowRight?: AsyncQueryable<T>): Iterable<T>;
/** @internal */ export function FlowHierarchy<T>(result: Grouping<unknown, T> | AsyncIterable<T> | Iterable<T>, flowLeft: AsyncQueryable<T>, flowRight?: AsyncQueryable<T>): AsyncIterable<T> | Iterable<T> {
    if (IsPossiblyAsyncHierarchyIterable(result)) return result;
    const leftHierarchy = IsPossiblyAsyncHierarchyIterable(flowLeft) ? GetHierarchy(flowLeft) : undefined;
    const rightHierarchy = IsPossiblyAsyncHierarchyIterable(flowRight) ? GetHierarchy(flowRight) : undefined;
    const hierarchy = CombineHierarchies(leftHierarchy, rightHierarchy);
    if (hierarchy) {
        if (IsAsyncIterable(result)) {
            return MakeAsyncHierarchyIterable(result, hierarchy);
        }
    }
    return hierarchy ? IsAsyncIterable(result) ? MakeAsyncHierarchyIterable(result, hierarchy) : MakeHierarchyIterable(result, hierarchy) : result;
}

/** @internal */ export function CombineHierarchies<T>(left: HierarchyProvider<T> | undefined, right: HierarchyProvider<T> | undefined): HierarchyProvider<T> | undefined;
/** @internal */ export function CombineHierarchies<T>(left: CompositeHierarchyProvider<T> | HierarchyProvider<T> | undefined, right: CompositeHierarchyProvider<T> | HierarchyProvider<T> | undefined): HierarchyProvider<T> | undefined {
    if (left === right || right === undefined) return left;
    if (left === undefined) return right;
    const leftHierarchies = left instanceof CompositeHierarchyProvider ? left["_hierarchies"] : [left];
    const rightHierarchies = right instanceof CompositeHierarchyProvider ? right["_hierarchies"] : [right];
    const set = new Set<HierarchyProvider<T>>(leftHierarchies);
    for (const hierarchy of rightHierarchies) set.add(hierarchy);
    if (set.size === leftHierarchies.length) return left;
    const hierarchies = [...set];
    return hierarchies.length === 1 ? hierarchies[0] : new CompositeHierarchyProvider(hierarchies);
}

@ToStringTag("CompositeHierarchyProvider")
class CompositeHierarchyProvider<T> {
    private _hierarchies: ReadonlyArray<HierarchyProvider<T>>;

    constructor(hierarchies: ReadonlyArray<HierarchyProvider<T>>) {
        this._hierarchies = hierarchies;
    }

    owns(value: T) {
        return findOwner(this._hierarchies, value) !== undefined;
    }

    parent(value: T) {
        const hierarchy = findOwner(this._hierarchies, value);
        return hierarchy && hierarchy.parent(value);
    }

    children(value: T) {
        const hierarchy = findOwner(this._hierarchies, value);
        return hierarchy ? hierarchy.children(value) : [];
    }
}

function findOwner<T>(hierarchies: ReadonlyArray<HierarchyProvider<T>>, value: T) {
    let bestMatch: HierarchyProvider<T> | undefined;
    for (const hierarchy of hierarchies) {
        if (hierarchy.owns) {
            if (hierarchy.owns(value)) return hierarchy;
        }
        else if (!bestMatch) {
            bestMatch = hierarchy;
        }
    }
    return bestMatch;
}