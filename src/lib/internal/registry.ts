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
import "../compat";
import { Queryable, HierarchyIterable, OrderedIterable, OrderedHierarchyIterable, AsyncHierarchyIterable, AsyncOrderedHierarchyIterable, AsyncOrderedIterable } from "../types";
import { GetSource, CreateSubquery, GetAsyncSource, CreateAsyncSubquery } from "./utils";
import { Set } from "../collections";
import { QuerySourceConstructor, HierarchyQuerySourceConstructor, OrderedQuerySourceConstructor, OrderedHierarchyQuerySourceConstructor, AsyncQuerySourceConstructor, AsyncHierarchyQuerySourceConstructor, AsyncOrderedQuerySourceConstructor, AsyncOrderedHierarchyQuerySourceConstructor, QuerySource, AsyncQuerySource } from "./types";

type QueryKind =
    | "Query"
    | "HierarchyQuery"
    | "OrderedQuery"
    | "OrderedHierarchyQuery";

type AsyncQueryKind =
    | "AsyncQuery"
    | "AsyncHierarchyQuery"
    | "AsyncOrderedQuery"
    | "AsyncOrderedHierarchyQuery";

type AnyQueryKind =
    | QueryKind
    | AsyncQueryKind ;

type AnyQuerySourceConstructor =
    | QuerySourceConstructor
    | HierarchyQuerySourceConstructor
    | OrderedQuerySourceConstructor
    | OrderedHierarchyQuerySourceConstructor
    | AsyncQuerySourceConstructor
    | AsyncHierarchyQuerySourceConstructor
    | AsyncOrderedQuerySourceConstructor
    | AsyncOrderedHierarchyQuerySourceConstructor;

type ParameterTypes<T> = T extends (...args: infer A) => any ? A : never;
type MethodKeys<T, K extends keyof T = keyof T> = K extends (T[K] extends (...args: any[]) => any ? K : never) ? K : never;
type IterableReturnType<T extends (...args: any[]) => any, R extends ReturnType<T> = ReturnType<T>> =
    R extends OrderedHierarchyQuery<infer U> ? OrderedHierarchyIterable<U> :
    R extends OrderedQuery<infer U> ? OrderedIterable<U> :
    R extends HierarchyQuery<infer U> ? HierarchyIterable<U> :
    R extends Query<infer U> ? Iterable<U> :
    R extends AsyncOrderedHierarchyQuery<infer U> ? AsyncOrderedHierarchyIterable<U> :
    R extends AsyncOrderedQuery<infer U> ? AsyncOrderedIterable<U> :
    R extends AsyncHierarchyQuery<infer U> ? AsyncHierarchyIterable<U> :
    R extends AsyncQuery<infer U> ? AsyncIterable<U> :
    R;

type Query<T> = import("../query").Query<T>;
type HierarchyQuery<T> = import("../query").HierarchyQuery<T>;
type OrderedQuery<T> = import("../query").OrderedQuery<T>;
type OrderedHierarchyQuery<T> = import("../query").OrderedHierarchyQuery<T>;
type QueryConstructor = typeof import("../query").Query;
type HierarchyQueryConstructor = typeof import("../query").HierarchyQuery;
type OrderedQueryConstructor = typeof import("../query").OrderedQuery;
type OrderedHierarchyQueryConstructor = typeof import("../query").OrderedHierarchyQuery;
type AsyncQuery<T> = import("../asyncQuery").AsyncQuery<T>;
type AsyncHierarchyQuery<T> = import("../asyncQuery").AsyncHierarchyQuery<T>;
type AsyncOrderedQuery<T> = import("../asyncQuery").AsyncOrderedQuery<T>;
type AsyncOrderedHierarchyQuery<T> = import("../asyncQuery").AsyncOrderedHierarchyQuery<T>;
type AsyncQueryConstructor = typeof import("../asyncQuery").AsyncQuery;
type AsyncHierarchyQueryConstructor = typeof import("../asyncQuery").AsyncHierarchyQuery;
type AsyncOrderedQueryConstructor = typeof import("../asyncQuery").AsyncOrderedQuery;
type AsyncOrderedHierarchyQueryConstructor = typeof import("../asyncQuery").AsyncOrderedHierarchyQuery;

type QueryConstructorForKind<K extends AnyQueryKind> =
    K extends "AsyncOrderedHierarchyQuery" ? AsyncOrderedHierarchyQueryConstructor :
    K extends "AsyncOrderedQuery" ? AsyncOrderedQueryConstructor :
    K extends "AsyncHierarchyQuery" ? AsyncHierarchyQueryConstructor :
    K extends "AsyncQuery" ? AsyncQueryConstructor :
    K extends "OrderedHierarchyQuery" ? OrderedHierarchyQueryConstructor :
    K extends "OrderedQuery" ? OrderedQueryConstructor :
    K extends "HierarchyQuery" ? HierarchyQueryConstructor :
    K extends "Query" ? QueryConstructor :
    never;

const registries = new Set();

/** @internal */
export namespace Registry {
    export function getRegistries() { return registries; }

    export function addRegistry(registry: object) {
        registries.add(registry);
    }

    export function QueryConstructor<K extends AnyQueryKind>(kind: K) {
        return function (ctor: QueryConstructorForKind<K>) {
            for (const registry of registries) {
                for (const key of Object.keys(registry)) {
                    const func = registry[key];
                    const reg = typeof func === "function" ? getRegistration(func, kind) : undefined;
                    if (!reg || !reg.placement || !reg.descriptor || !reg.names) continue;
                    const target = reg.placement === "static" ? ctor : ctor.prototype;
                    for (const name of reg.names) {
                        if (hasOwn(target, name)) continue;
                        Object.defineProperty(target, name, reg.descriptor);
                    }
                }
            }
        }
    }

    export namespace Query {
        export function registerAlias<K extends MethodKeys<Query<unknown>>>(name: K, fn: Function) { registerMethodName("Query", fn, name); }
        export function registerScalar<K extends MethodKeys<Query<unknown>>>(name: K, fn: <T>(this: Query<T>, source: Queryable<T>, ...args: ParameterTypes<Query<T>[K]>) => ReturnType<Query<T>[K]>) { registerScalarMethod("Query", fn, name); }
        export function registerSubquery<K extends MethodKeys<Query<unknown>>>(name: K, fn: <T>(this: Query<T>, source: Queryable<T>, ...args: ParameterTypes<Query<T>[K]>) => IterableReturnType<Query<T>[K]>) { registerSubqueryMethod("Query", fn, name); }
        export function registerCustom<K extends MethodKeys<Query<unknown>>>(name: K, fn: Function, custom: <T>(this: Query<T>, ...args: ParameterTypes<Query<T>[K]>) => ReturnType<Query<T>[K]>) { registerCustomMethod("Query", fn, custom, name); }
        export function registerStatic<K extends MethodKeys<QueryConstructor>>(name: K, fn: (this: QueryConstructor, ...args: ParameterTypes<QueryConstructor[K]>) => IterableReturnType<QueryConstructor[K]>) { registerStaticMethod("Query", fn, name); }
    }

    export namespace HierarchyQuery {
        export function registerAlias<K extends MethodKeys<HierarchyQuery<unknown>>>(name: K, fn: Function) { registerMethodName("HierarchyQuery", fn, name); }
        export function registerScalar<K extends MethodKeys<HierarchyQuery<unknown>>>(name: K, fn: <T>(this: HierarchyQuery<T>, source: HierarchyIterable<T>, ...args: ParameterTypes<HierarchyQuery<T>[K]>) => ReturnType<HierarchyQuery<T>[K]>) { registerScalarMethod("HierarchyQuery", fn, name); }
        export function registerSubquery<K extends MethodKeys<HierarchyQuery<unknown>>>(name: K, fn: <T>(this: HierarchyQuery<T>, source: HierarchyIterable<T>, ...args: ParameterTypes<HierarchyQuery<T>[K]>) => IterableReturnType<HierarchyQuery<T>[K]>) { registerSubqueryMethod("HierarchyQuery", fn, name); }
        export function registerCustom<K extends MethodKeys<HierarchyQuery<unknown>>>(name: K, fn: Function, custom: <T>(this: HierarchyQuery<T>, ...args: ParameterTypes<HierarchyQuery<T>[K]>) => ReturnType<HierarchyQuery<T>[K]>) { registerCustomMethod("HierarchyQuery", fn, custom, name); }
        export function registerStatic<K extends MethodKeys<HierarchyQueryConstructor>>(name: K, fn: (this: HierarchyQueryConstructor, ...args: ParameterTypes<HierarchyQueryConstructor[K]>) => IterableReturnType<HierarchyQueryConstructor[K]>) { registerStaticMethod("HierarchyQuery", fn, name); }
    }

    export namespace OrderedQuery {
        export function registerAlias<K extends MethodKeys<OrderedQuery<unknown>>>(name: K, fn: Function) { registerMethodName("OrderedQuery", fn, name); }
        export function registerScalar<K extends MethodKeys<OrderedQuery<unknown>>>(name: K, fn: <T>(this: OrderedQuery<T>, source: OrderedIterable<T>, ...args: ParameterTypes<OrderedQuery<T>[K]>) => ReturnType<OrderedQuery<T>[K]>) { registerScalarMethod("OrderedQuery", fn, name); }
        export function registerSubquery<K extends MethodKeys<OrderedQuery<unknown>>>(name: K, fn: <T>(this: OrderedQuery<T>, source: OrderedIterable<T>, ...args: ParameterTypes<OrderedQuery<T>[K]>) => IterableReturnType<OrderedQuery<T>[K]>) { registerSubqueryMethod("OrderedQuery", fn, name); }
        export function registerCustom<K extends MethodKeys<OrderedQuery<unknown>>>(name: K, fn: Function, custom: <T>(this: OrderedQuery<T>, ...args: ParameterTypes<OrderedQuery<T>[K]>) => ReturnType<OrderedQuery<T>[K]>) { registerCustomMethod("OrderedQuery", fn, custom, name); }
        export function registerStatic<K extends MethodKeys<OrderedQueryConstructor>>(name: K, fn: (this: OrderedQueryConstructor, ...args: ParameterTypes<OrderedQueryConstructor[K]>) => IterableReturnType<OrderedQueryConstructor[K]>) { registerStaticMethod("OrderedQuery", fn, name); }
    }

    export namespace OrderedHierarchyQuery {
        export function registerAlias<K extends MethodKeys<OrderedHierarchyQuery<unknown>>>(name: K, fn: Function) { registerMethodName("OrderedHierarchyQuery", fn, name); }
        export function registerScalar<K extends MethodKeys<OrderedHierarchyQuery<unknown>>>(name: K, fn: <T>(this: OrderedHierarchyQuery<T>, source: OrderedHierarchyIterable<T>, ...args: ParameterTypes<OrderedHierarchyQuery<T>[K]>) => ReturnType<OrderedHierarchyQuery<T>[K]>) { registerScalarMethod("OrderedHierarchyQuery", fn, name); }
        export function registerSubquery<K extends MethodKeys<OrderedHierarchyQuery<unknown>>>(name: K, fn: <T>(this: OrderedHierarchyQuery<T>, source: OrderedHierarchyIterable<T>, ...args: ParameterTypes<OrderedHierarchyQuery<T>[K]>) => IterableReturnType<OrderedHierarchyQuery<T>[K]>) { registerSubqueryMethod("OrderedHierarchyQuery", fn, name); }
        export function registerCustom<K extends MethodKeys<OrderedHierarchyQuery<unknown>>>(name: K, fn: Function, custom: <T>(this: OrderedHierarchyQuery<T>, ...args: ParameterTypes<OrderedHierarchyQuery<T>[K]>) => ReturnType<OrderedHierarchyQuery<T>[K]>) { registerCustomMethod("OrderedHierarchyQuery", fn, custom, name); }
        export function registerStatic<K extends MethodKeys<OrderedHierarchyQueryConstructor>>(name: K, fn: (this: OrderedHierarchyQueryConstructor, ...args: ParameterTypes<OrderedHierarchyQueryConstructor[K]>) => IterableReturnType<OrderedHierarchyQueryConstructor[K]>) { registerStaticMethod("OrderedHierarchyQuery", fn, name); }
    }

    export namespace AsyncQuery {
        export function registerAlias<K extends MethodKeys<AsyncQuery<unknown>>>(name: K, fn: Function) { registerMethodName("AsyncQuery", fn, name); }
        export function registerScalar<K extends MethodKeys<AsyncQuery<unknown>>>(name: K, fn: <T>(this: AsyncQuery<T>, source: AsyncIterable<T>, ...args: ParameterTypes<AsyncQuery<T>[K]>) => ReturnType<AsyncQuery<T>[K]>) { registerScalarMethod("AsyncQuery", fn, name); }
        export function registerSubquery<K extends MethodKeys<AsyncQuery<unknown>>>(name: K, fn: <T>(this: AsyncQuery<T>, source: AsyncIterable<T>, ...args: ParameterTypes<AsyncQuery<T>[K]>) => IterableReturnType<AsyncQuery<T>[K]>) { registerSubqueryMethod("AsyncQuery", fn, name); }
        export function registerCustom<K extends MethodKeys<AsyncQuery<unknown>>>(name: K, fn: Function, custom: <T>(this: AsyncQuery<T>, ...args: ParameterTypes<AsyncQuery<T>[K]>) => ReturnType<AsyncQuery<T>[K]>) { registerCustomMethod("AsyncQuery", fn, custom, name); }
        export function registerStatic<K extends MethodKeys<AsyncQueryConstructor>>(name: K, fn: (this: AsyncQueryConstructor, ...args: ParameterTypes<AsyncQueryConstructor[K]>) => IterableReturnType<AsyncQueryConstructor[K]>) { registerStaticMethod("AsyncQuery", fn, name); }
    }

    export namespace AsyncHierarchyQuery {
        export function registerAlias<K extends MethodKeys<AsyncHierarchyQuery<unknown>>>(name: K, fn: Function) { registerMethodName("AsyncHierarchyQuery", fn, name); }
        export function registerScalar<K extends MethodKeys<AsyncHierarchyQuery<unknown>>>(name: K, fn: <T>(this: AsyncHierarchyQuery<T>, source: AsyncHierarchyIterable<T>, ...args: ParameterTypes<AsyncHierarchyQuery<T>[K]>) => ReturnType<AsyncHierarchyQuery<T>[K]>) { registerScalarMethod("AsyncHierarchyQuery", fn, name); }
        export function registerSubquery<K extends MethodKeys<AsyncHierarchyQuery<unknown>>>(name: K, fn: <T>(this: AsyncHierarchyQuery<T>, source: AsyncHierarchyIterable<T>, ...args: ParameterTypes<AsyncHierarchyQuery<T>[K]>) => IterableReturnType<AsyncHierarchyQuery<T>[K]>) { registerSubqueryMethod("AsyncHierarchyQuery", fn, name); }
        export function registerCustom<K extends MethodKeys<AsyncHierarchyQuery<unknown>>>(name: K, fn: Function, custom: <T>(this: AsyncHierarchyQuery<T>, ...args: ParameterTypes<AsyncHierarchyQuery<T>[K]>) => ReturnType<AsyncHierarchyQuery<T>[K]>) { registerCustomMethod("AsyncHierarchyQuery", fn, custom, name); }
        export function registerStatic<K extends MethodKeys<AsyncHierarchyQueryConstructor>>(name: K, fn: (this: AsyncHierarchyQueryConstructor, ...args: ParameterTypes<AsyncHierarchyQueryConstructor[K]>) => IterableReturnType<AsyncHierarchyQueryConstructor[K]>) { registerStaticMethod("AsyncHierarchyQuery", fn, name); }
    }

    export namespace AsyncOrderedQuery {
        export function registerAlias<K extends MethodKeys<AsyncOrderedQuery<unknown>>>(name: K, fn: Function) { registerMethodName("AsyncOrderedQuery", fn, name); }
        export function registerScalar<K extends MethodKeys<AsyncOrderedQuery<unknown>>>(name: K, fn: <T>(this: AsyncOrderedQuery<T>, source: AsyncOrderedIterable<T>, ...args: ParameterTypes<AsyncOrderedQuery<T>[K]>) => ReturnType<AsyncOrderedQuery<T>[K]>) { registerScalarMethod("AsyncOrderedQuery", fn, name); }
        export function registerSubquery<K extends MethodKeys<AsyncOrderedQuery<unknown>>>(name: K, fn: <T>(this: AsyncOrderedQuery<T>, source: AsyncOrderedIterable<T>, ...args: ParameterTypes<AsyncOrderedQuery<T>[K]>) => IterableReturnType<AsyncOrderedQuery<T>[K]>) { registerSubqueryMethod("AsyncOrderedQuery", fn, name); }
        export function registerCustom<K extends MethodKeys<AsyncOrderedQuery<unknown>>>(name: K, fn: Function, custom: <T>(this: AsyncOrderedQuery<T>, ...args: ParameterTypes<AsyncOrderedQuery<T>[K]>) => ReturnType<AsyncOrderedQuery<T>[K]>) { registerCustomMethod("AsyncOrderedQuery", fn, custom, name); }
        export function registerStatic<K extends MethodKeys<AsyncOrderedQueryConstructor>>(name: K, fn: (this: AsyncOrderedQueryConstructor, ...args: ParameterTypes<AsyncOrderedQueryConstructor[K]>) => IterableReturnType<AsyncOrderedQueryConstructor[K]>) { registerStaticMethod("AsyncOrderedQuery", fn, name); }
    }

    export namespace AsyncOrderedHierarchyQuery {
        export function registerAlias<K extends MethodKeys<AsyncOrderedHierarchyQuery<unknown>>>(name: K, fn: Function) { registerMethodName("AsyncOrderedHierarchyQuery", fn, name); }
        export function registerScalar<K extends MethodKeys<AsyncOrderedHierarchyQuery<unknown>>>(name: K, fn: <T>(this: AsyncOrderedHierarchyQuery<T>, source: AsyncOrderedHierarchyIterable<T>, ...args: ParameterTypes<AsyncOrderedHierarchyQuery<T>[K]>) => ReturnType<AsyncOrderedHierarchyQuery<T>[K]>) { registerScalarMethod("AsyncOrderedHierarchyQuery", fn, name); }
        export function registerSubquery<K extends MethodKeys<AsyncOrderedHierarchyQuery<unknown>>>(name: K, fn: <T>(this: AsyncOrderedHierarchyQuery<T>, source: AsyncOrderedHierarchyIterable<T>, ...args: ParameterTypes<AsyncOrderedHierarchyQuery<T>[K]>) => IterableReturnType<AsyncOrderedHierarchyQuery<T>[K]>) { registerSubqueryMethod("AsyncOrderedHierarchyQuery", fn, name); }
        export function registerCustom<K extends MethodKeys<AsyncOrderedHierarchyQuery<unknown>>>(name: K, fn: Function, custom: <T>(this: AsyncOrderedHierarchyQuery<T>, ...args: ParameterTypes<AsyncOrderedHierarchyQuery<T>[K]>) => ReturnType<AsyncOrderedHierarchyQuery<T>[K]>) { registerCustomMethod("AsyncOrderedHierarchyQuery", fn, custom, name); }
        export function registerStatic<K extends MethodKeys<AsyncOrderedHierarchyQueryConstructor>>(name: K, fn: (this: AsyncOrderedHierarchyQueryConstructor, ...args: ParameterTypes<AsyncOrderedHierarchyQueryConstructor[K]>) => IterableReturnType<AsyncOrderedHierarchyQueryConstructor[K]>) { registerStaticMethod("AsyncOrderedHierarchyQuery", fn, name); }
    }
}

const hasOwn = Function.call.bind(Object.prototype.hasOwnProperty);
const registrationSym = Symbol();

type Registrations = Record<AnyQueryKind, Registration>;

interface Registration {
    names?: PropertyKey[];
    placement?: "static" | "prototype";
    descriptor?: PropertyDescriptor;
}

interface RegisteredFunction extends Function {
    [registrationSym]?: Registrations;
}

function getRegistration(fn: RegisteredFunction, kind: AnyQueryKind): Registration | undefined {
    const regs = fn[registrationSym];
    return regs && regs[kind];
}

function getOrCreateRegistration(fn: RegisteredFunction, kind: AnyQueryKind): Registration {
    const regs = fn[registrationSym] || (fn[registrationSym] = Object.create(null));
    return regs[kind] || (regs[kind] = {});
}

function createDescriptor(fn: Function): PropertyDescriptor {
    return {
        enumerable: false,
        configurable: true,
        writable: true,
        value: fn
    };
}

function registerMethodName(kind: AnyQueryKind, registeredFunction: Function, name: PropertyKey) {
    const reg = getOrCreateRegistration(registeredFunction, kind);
    (reg.names || (reg.names = [])).push(name);
    return reg;
}

function registerScalarMethod(kind: AnyQueryKind, registeredFunction: RegisteredFunction, name: PropertyKey) {
    registerMethod(kind, registeredFunction, "prototype", isAsyncQueryKind(kind) ? asyncScalarWrap(registeredFunction) : scalarWrap(registeredFunction), name);
}

function registerSubqueryMethod(kind: AnyQueryKind, registeredFunction: RegisteredFunction, name: PropertyKey) {
    registerMethod(kind, registeredFunction, "prototype", isAsyncQueryKind(kind) ? asyncSubqueryWrap(registeredFunction) : subqueryWrap(registeredFunction), name);
}

function registerCustomMethod(kind: AnyQueryKind, registeredFunction: RegisteredFunction, custom: Function, name: PropertyKey) {
    registerMethod(kind, registeredFunction, "prototype", custom, name);
}

function registerStaticMethod(kind: AnyQueryKind, registeredFunction: RegisteredFunction, name: PropertyKey) {
    registerMethod(kind, registeredFunction, "static", isAsyncQueryKind(kind) ? asyncStaticWrap(registeredFunction) : staticWrap(registeredFunction), name);
}

function registerMethod(kind: AnyQueryKind, registeredFunction: RegisteredFunction, placement: "static" | "prototype", method: Function, name: PropertyKey) {
    const reg = registerMethodName(kind, registeredFunction, name);
    (reg.names || (reg.names = [])).push(name);
    reg.placement = placement;
    reg.descriptor = createDescriptor(method);
}

function scalarWrap(fn: Function) {
    return function (this: QuerySource<unknown>) { return fn.call(this, GetSource(this), ...arguments); };
}

function subqueryWrap(fn: Function) {
    return function (this: QuerySource<unknown>) { return CreateSubquery(this, fn.call(this, GetSource(this), ...arguments)); }
}

function staticWrap(fn: Function) {
    return function (this: QuerySourceConstructor) { return CreateSubquery(this.prototype, fn.apply(this, arguments)); }
}

function asyncScalarWrap(fn: Function) {
    return function (this: AsyncQuerySource<unknown>) { return fn.call(this, GetAsyncSource(this), ...arguments); };
}

function asyncSubqueryWrap(fn: Function) {
    return function (this: AsyncQuerySource<unknown>) { return CreateAsyncSubquery(this, fn.call(this, GetAsyncSource(this), ...arguments)); }
}

function asyncStaticWrap(fn: Function) {
    return function (this: AsyncQuerySourceConstructor) { return CreateAsyncSubquery(this.prototype, fn.apply(this, arguments)); }
}

/** @internal */ export function attachMethods(kind: "Query", ctor: QuerySourceConstructor, registry: typeof import("../fn")): void;
/** @internal */ export function attachMethods(kind: "HierarchyQuery", ctor: HierarchyQuerySourceConstructor, registry: typeof import("../fn")): void;
/** @internal */ export function attachMethods(kind: "OrderedQuery", ctor: OrderedQuerySourceConstructor, registry: typeof import("../fn")): void;
/** @internal */ export function attachMethods(kind: "OrderedHierarchyQuery", ctor: OrderedHierarchyQuerySourceConstructor, registry: typeof import("../fn")): void;
/** @internal */ export function attachMethods(kind: "AsyncQuery", ctor: AsyncQuerySourceConstructor, registry: typeof import("../fn")): void;
/** @internal */ export function attachMethods(kind: "AsyncHierarchyQuery", ctor: AsyncHierarchyQuerySourceConstructor, registry: typeof import("../fn")): void;
/** @internal */ export function attachMethods(kind: "AsyncOrderedQuery", ctor: AsyncOrderedQuerySourceConstructor, registry: typeof import("../fn")): void;
/** @internal */ export function attachMethods(kind: "AsyncOrderedHierarchyQuery", ctor: AsyncOrderedHierarchyQuerySourceConstructor, registry: typeof import("../fn")): void;
/** @internal */ export function attachMethods(kind: AnyQueryKind, ctor: AnyQuerySourceConstructor, registry: typeof import("../fn")) {
    for (const key of Object.keys(registry) as (keyof typeof registry)[]) {
        const func = registry[key];
        const reg = typeof func === "function" ? getRegistration(func, kind) : undefined;
        if (!reg || !reg.placement || !reg.descriptor || !reg.names) continue;
        const target = reg.placement === "static" ? ctor : ctor.prototype;
        for (const name of reg.names) {
            if (hasOwn(target, name)) continue;
            Object.defineProperty(target, name, reg.descriptor);
        }
    }
}

function isAsyncQueryKind(kind: AsyncQueryKind | QueryKind): kind is AsyncQueryKind {
    return kind === "AsyncQuery"
        || kind === "AsyncHierarchyQuery"
        || kind === "AsyncOrderedQuery"
        || kind === "AsyncOrderedHierarchyQuery";
}

