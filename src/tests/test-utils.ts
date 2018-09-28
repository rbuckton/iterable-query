import { assert, expect } from "chai";

interface ErrorConstructorWithStackTraceApi extends ErrorConstructor {
    captureStackTrace(target: any, stackCrawlMark?: Function): void;
}

declare const Error: ErrorConstructorWithStackTraceApi;

function getStack() {
    const stackObj = new Error();
    Error.captureStackTrace(stackObj, getStack);
    return stackObj.stack;
}

export class Lemma<A extends any[]> {
    name: string;
    data: A;
    constructor(name: string, data: A) {
        this.name = name;
        this.data = data;
    }

    static * fromData<A extends any[]>(data: (A | Lemma<A>)[] | Record<string, A>) {
        yield* Array.isArray(data) ? Lemma.fromRows(data) : Lemma.fromRecord(data);
    }

    static * fromRecord<A extends any[]>(data: Record<string, A>) {
        for (const key in data) {
            yield new Lemma(key, data[key]);
        }
    }

    static * fromRows<A extends any[]>(rows: Iterable<A | Lemma<A>>) {
        for (const row of rows) {
            yield Lemma.fromRow(row);
        }
    }

    static fromRow<A extends any[]>(row: A | Lemma<A>) {
        if (row instanceof Lemma) return row;
        const name = `[${row.map(value => 
            typeof value === "function" ? value.name || "<anonymous function>" : 
            (value = JSON.stringify(value), value === undefined ? "undefined" : value === null ? "null" : value)).join(", ")}]`;
        return new Lemma(name, row);
    }
}

function makeTheory<A extends any[]>(fn: Mocha.SuiteFunction | Mocha.PendingSuiteFunction | Mocha.ExclusiveSuiteFunction, name: string, data: A[] | Record<string, A> | ((...args: A) => void), cb: ((...args: A) => void) | A[] | Record<string, A>) {
    const _data = Array.isArray(data) ? data : cb as A[] | Record<string, A>;
    const _cb = typeof cb === "function" ? cb : data as (...args: A) => void;
    fn(name, () => {
        for (const lemma of Lemma.fromData(_data)) {
            it(lemma.name, () => _cb(...lemma.data));
        }
    });
}

type Rest<A extends any[]> = ((...args: A) => void) extends ((first: any, ...rest: infer ARest) => void) ? ARest : never;

function isPromiseLike(value: any): value is PromiseLike<any> {
    return typeof value === "object"
        && typeof value.then === "function";
}

async function awaitThrowsResult(stack: string, error: ErrorConstructorLike, result: PromiseLike<any>) {
    let caught: { error: any } | undefined;
    try {
        await result;
    }
    catch (e) {
        caught = { error: e };
    }
    expectError(stack, error, caught)
}

function expectError(stack: string, error: ErrorConstructorLike, caught: { error: any } | undefined) {
    try {
        expect(() => { if (caught) throw caught.error; }).to.throw(error);
    }
    catch (e) {
        if (stack) e.stack = stack;
        throw e;
    }
}

function makeThrowsTheory<A extends [ErrorConstructorLike, ...any[]], R>(fn: Mocha.SuiteFunction | Mocha.PendingSuiteFunction | Mocha.ExclusiveSuiteFunction, name: string, cb: (...args: Rest<A>) => R | PromiseLike<R>, data: A[] | Record<string, A>) {
    const stack = getStack();
    makeTheory<any[]>(fn, name, (error, ...args: any[]) => {
        let caught: { error: any } | undefined;
        try {
            const result = cb(...args as Rest<A>);
            if (isPromiseLike(result)) {
                return awaitThrowsResult(stack, error, result);
            }
        }
        catch (e) {
            caught = { error: e };
        }
        expectError(stack, error, caught);
    }, data);
}

export function theory<A extends any[], R>(name: string, data: A[] | Record<string, A>, cb: (...args: A) => R | PromiseLike<R>): void;
export function theory<A extends any[], R>(name: string, cb: (...args: A) => R | PromiseLike<R>, data: A[] | Record<string, A>): void;
export function theory<A extends any[], R>(name: string, data: A[] | Record<string, A> | ((...args: A) => R | PromiseLike<R>), cb: ((...args: A) => R | PromiseLike<R>) | A[] | Record<string, A>) {
    makeTheory(describe, name, data, cb);
}

export namespace theory {
    export function skip<A extends any[], R>(name: string, data: A[] | Record<string, A>, cb: (...args: A) => R | PromiseLike<R>): void;
    export function skip<A extends any[], R>(name: string, cb: (...args: A) => R | PromiseLike<R>, data: A[] | Record<string, A>): void;
    export function skip<A extends any[], R>(name: string, data: A[] | Record<string, A> | ((...args: A) => R | PromiseLike<R>), cb: ((...args: A) => R | PromiseLike<R>) | A[] | Record<string, A>) {
        return makeTheory(describe.skip, name, data, cb);
    }

    export function only<A extends any[], R>(name: string, data: A[] | Record<string, A>, cb: (...args: A) => R | PromiseLike<R>): void;
    export function only<A extends any[], R>(name: string, cb: (...args: A) => R | PromiseLike<R>, data: A[] | Record<string, A>): void;
    export function only<A extends any[], R>(name: string, data: A[] | Record<string, A> | ((...args: A) => R | PromiseLike<R>), cb: ((...args: A) => R | PromiseLike<R>) | A[] | Record<string, A>) {
        return makeTheory(describe.only, name, data, cb);
    }

    export function throws<A extends [ErrorConstructorLike, ...any[]], R>(name: string, cb: (...args: Rest<A>) => R | PromiseLike<R>, data: A[] | Record<string, A>) {
        makeThrowsTheory(describe, name, cb, data);
    }

    export namespace throws {
        export function skip<A extends [ErrorConstructorLike, ...any[]], R>(name: string, cb: (...args: Rest<A>) => R | PromiseLike<R>, data: A[] | Record<string, A>) {
            makeThrowsTheory(describe.skip, name, cb, data);
        }

        export function only<A extends [ErrorConstructorLike, ...any[]], R>(name: string, cb: (...args: Rest<A>) => R | PromiseLike<R>, data: A[] | Record<string, A>) {
            makeThrowsTheory(describe.only, name, cb, data);
        }
    }
}


export type ErrorConstructorLike = ErrorConstructor | TypeErrorConstructor | RangeErrorConstructor;

export function preconditions(name: string, data: [any, ErrorConstructorLike][], cb: (value: any) => void) {
    const stack = getStack();
    theory(`preconditions for ${name}`, data, (value, error) => {
        try {
            if (error) {
                expect(() => cb(value)).to.throw(error)
            }
            else {
                expect(() => cb(value)).to.not.throw();
            }
        }
        catch (e) {
            if (stack) e.stack = stack;
            throw e;
        }
    });
}

export type Not<A extends boolean> = A extends true ? false : A extends false ? true : boolean;
export type And<A extends boolean, B extends boolean> = A extends true ? B extends true ? true : false : false;
export type Or<A extends boolean, B extends boolean> = A extends false ? B extends false ? false : true : true;
export type IsNever<T> = [T] extends [never] ? true : false;
export type IsAny<T> = T extends unknown ? boolean extends (T extends never ? true : false) ? true : false : never;
export type IsVoid<T> = T extends unknown ? IsAny<T> extends true ? false : [T] extends [void] ? [void] extends [T] ? true : false : false : never;
export type IsUnknown<T> = T extends unknown ? unknown extends T ? Not<IsAny<T>> : false : false;
export type IsSubTypeOf<A, B> = [A] extends [B] ? true : false;
export type IsSuperTypeOf<A, B> = [B] extends [A] ? true : false;
export type IsExactly<A, B> = 
    Or<IsAny<A>, IsAny<B>> extends true ? And<IsAny<B>, IsAny<A>> :
    Or<IsUnknown<A>, IsUnknown<B>> extends true ? And<IsUnknown<B>, IsUnknown<A>> :
    Or<IsNever<A>, IsNever<B>> extends true ? And<IsNever<A>, IsNever<B>> :
    Or<IsVoid<A>, IsVoid<B>> extends true ? And<IsVoid<A>, IsVoid<B>> :
    And<IsSubTypeOf<A, B>, IsSuperTypeOf<A, B>>;
export type IsRelatedTo<A, B> =
    IsExactly<A, B> extends true ? true :
    IsSuperTypeOf<A, B> extends true ? true :
    IsSubTypeOf<A, B> extends true ? true :
    false;

// test the above conditional types:
type MustBeTrue<_ extends true> = true;
type MustBeFalse<_ extends false> = true;
type A1 = { a: number }
type A2 = { a: number }
type AB = { a: number, b: string }
type R = MustBeTrue<
    | MustBeFalse<IsNever<any>>
    | MustBeFalse<IsNever<unknown>>
    | MustBeTrue<IsNever<never>>
    | MustBeFalse<IsNever<void>>
    | MustBeTrue<IsAny<any>>
    | MustBeFalse<IsAny<unknown>>
    | MustBeFalse<IsAny<never>>
    | MustBeFalse<IsAny<void>>
    | MustBeFalse<IsVoid<any>>
    | MustBeFalse<IsVoid<unknown>>
    | MustBeFalse<IsVoid<never>>
    | MustBeTrue<IsVoid<void>>
    | MustBeFalse<IsUnknown<any>>
    | MustBeTrue<IsUnknown<unknown>>
    | MustBeFalse<IsUnknown<never>>
    | MustBeFalse<IsUnknown<void>>
    | MustBeTrue<IsExactly<A1, A1>>
    | MustBeTrue<IsExactly<A1, A2>>
    | MustBeFalse<IsExactly<A1, AB>>
    | MustBeFalse<IsExactly<A1, any>>
    | MustBeFalse<IsExactly<A1, never>>
    | MustBeFalse<IsExactly<A1, void>>
    | MustBeFalse<IsExactly<A1, unknown>>
    | MustBeFalse<IsExactly<AB, A1>>
    | MustBeFalse<IsExactly<any, A1>>
    | MustBeFalse<IsExactly<never, A1>>
    | MustBeFalse<IsExactly<void, A1>>
    | MustBeFalse<IsExactly<unknown, A1>>
    >;

export function typeOnly(_: () => void) { /*do nothing*/ }

export declare function type<T>(): T;

export declare namespace type {
    export {};

    const expectedExactType: unique symbol;
    const expectedSuperType: unique symbol;
    const expectedSubType: unique symbol;
    const expectedTypeRelatedTo: unique symbol;

    interface ExpectedExactType<E> { readonly [expectedExactType]: E; }
    interface ExpectedSuperTypeOf<E> { readonly [expectedSuperType]: E; }
    interface ExpectedSubTypeOf<E> { readonly [expectedSubType]: E; }
    interface ExpectedTypeRelatedTo<E> { readonly [expectedTypeRelatedTo]: E; }

    type ExpectExactType<TExpected, TActual> = IsExactly<TExpected, TActual> extends true ? TActual : ExpectedExactType<TExpected>;
    type ExpectSubTypeOf<TExpected, TActual> = IsSubTypeOf<TActual, TExpected> extends true ? TActual : ExpectedSubTypeOf<TExpected>;
    type ExpectSuperTypeOf<TExpected, TActual> = IsSuperTypeOf<TActual, TExpected> extends true ? TActual : ExpectedSuperTypeOf<TExpected>;
    type ExpectTypeRelatedTo<TExpected, TActual> = IsRelatedTo<TExpected, TActual> extends true ? TActual: ExpectedTypeRelatedTo<TExpected>;
    
    export function exact<TExpected, TActual>(expected: TExpected, actual: ExpectExactType<TExpected, TActual>): void;
    export function subtype<TExpected, TActual>(expected: TExpected, actual: ExpectSubTypeOf<TExpected, TActual>): void;
    export function supertype<TExpected, TActual>(expected: TExpected, actual: ExpectSuperTypeOf<TExpected, TActual>): void;
    export function related<TExpected, TActual>(expected: TExpected, actual: ExpectTypeRelatedTo<TExpected, TActual>): void;

    export namespace not {
        export {};

        const notExpectedExactType: unique symbol;
        const notExpectedSuperType: unique symbol;
        const notExpectedSubType: unique symbol;
        const notExpectedTypeRelatedTo: unique symbol;
        
        interface ExpectedNotExactType<E> { readonly [notExpectedExactType]: E; }
        interface ExpectedNotSuperTypeOf<E> { readonly [notExpectedSuperType]: E; }
        interface ExpectedNotSubTypeOf<E> { readonly [notExpectedSubType]: E; }
        interface ExpectedTypeNotRelatedTo<E> { readonly [notExpectedTypeRelatedTo]: E; }

        type ExpectNotExactType<TExpected, TActual> = IsExactly<TExpected, TActual> extends false ? TActual : ExpectedNotExactType<TExpected>;
        type ExpectNotSubTypeOf<TExpected, TActual> = IsSubTypeOf<TActual, TExpected> extends false ? TActual : ExpectedNotSubTypeOf<TExpected>;
        type ExpectNotSuperTypeOf<TExpected, TActual> = IsSuperTypeOf<TActual, TExpected> extends false ? TActual : ExpectedNotSuperTypeOf<TExpected>;
        type ExpectTypeNotRelatedTo<TExpected, TActual> = IsRelatedTo<TExpected, TActual> extends false ? TActual: ExpectedTypeNotRelatedTo<TExpected>;
    
        export function exact<TExpected, TActual>(expected: TExpected, actual: ExpectNotExactType<TExpected, TActual>): void;
        export function subtype<TExpected, TActual>(expected: TExpected, actual: ExpectNotSubTypeOf<TExpected, TActual>): void;
        export function supertype<TExpected, TActual>(expected: TExpected, actual: ExpectNotSuperTypeOf<TExpected, TActual>): void;
        export function related<TExpected, TActual>(expected: TExpected, actual: ExpectTypeNotRelatedTo<TExpected, TActual>): void;
    }
}