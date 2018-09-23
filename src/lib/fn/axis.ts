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

import { ToIterable, SameValue } from "../internal";
import { HierarchyProvider } from "../types";

/** @internal */
export namespace Axis {
    export function * root<T>(provider: HierarchyProvider<T>, element: T) {
        if (element === undefined) return;
        let hasRoot = false;
        let root: T;
        for (const ancestor of ancestorsAndSelf(provider, element)) {
            hasRoot = true;
            root = ancestor;
        }
        if (hasRoot) {
            yield root!;
        }
    }

    export function ancestors<T>(provider: HierarchyProvider<T>, element: T) {
        return ancestorsWorker(provider, element, /*self*/ false);
    }

    export function ancestorsAndSelf<T>(provider: HierarchyProvider<T>, element: T) {
        return ancestorsWorker(provider, element, /*self*/ true);
    }

    function * ancestorsWorker<T>(provider: HierarchyProvider<T>, element: T, self: boolean) {
        if (element === undefined) return;
        let ancestor = self ? element : provider.parent(element);
        while (ancestor !== undefined) {
            yield ancestor;
            ancestor = provider.parent(ancestor);
        }
    }

    export function descendants<T>(provider: HierarchyProvider<T>, element: T) {
        return descendantsWorker(provider, element, /*self*/ false);
    }

    export function descendantsAndSelf<T>(provider: HierarchyProvider<T>, element: T) {
        return descendantsWorker(provider, element, /*self*/ true);
    }

    function * descendantsWorker<T>(provider: HierarchyProvider<T>, element: T, self: boolean): IterableIterator<T> {
        if (element === undefined) return;
        if (self) {
            yield element;
        }
        for (const child of children(provider, element)) {
            yield* descendantsWorker(provider, child, /*self*/ true);
        }
    }

    export function * parents<T>(provider: HierarchyProvider<T>, element: T) {
        if (element === undefined) return;
        const parent = provider.parent(element);
        if (parent !== undefined) {
            yield parent;
        }
    }

    export function * self<T>(_provider: HierarchyProvider<T>, element: T) {
        if (element === undefined) return;
        yield element;
    }

    export function siblings<T>(provider: HierarchyProvider<T>, element: T) {
        return siblingsWorker(provider, element, /*self*/ false);
    }

    export function siblingsAndSelf<T>(provider: HierarchyProvider<T>, element: T) {
        return siblingsWorker(provider, element, /*self*/ true);
    }

    function * siblingsWorker<T>(provider: HierarchyProvider<T>, element: T, self: boolean) {
        if (element === undefined) return;
        const parent = provider.parent(element);
        if (parent !== undefined) {
            for (const child of children(provider, parent)) {
                if (self || !SameValue(child, element)) {
                    yield child;
                }
            }
        }
    }

    export function * siblingsBeforeSelf<T>(provider: HierarchyProvider<T>, element: T) {
        if (element === undefined) return;
        for (const sibling of siblingsAndSelf(provider, element)) {
            if (SameValue(sibling, element)) {
                return;
            }
            yield sibling;
        }
    }
    
    export function * siblingsAfterSelf<T>(provider: HierarchyProvider<T>, element: T) {
        if (element === undefined) return;
        let hasSeenSelf = false;
        for (const sibling of siblingsAndSelf(provider, element)) {
            if (hasSeenSelf) {
                yield sibling;
            }
            else {
                hasSeenSelf = SameValue(sibling, element);
            }
        }
    }

    export function * children<T>(provider: HierarchyProvider<T>, element: T) {
        if (element === undefined) return;
        const children = provider.children(element);
        if (children === undefined) return;
        for (const child of ToIterable(children)) {
            if (child !== undefined) yield child;
        }
    }
}

