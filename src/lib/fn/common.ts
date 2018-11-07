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

import "../compat";
import { IsComparable } from "../internal/guards";
import { Comparable } from "../types";
import { Lazy } from "../lazy";

/** A function that returns the provided value. */
export function identity<T>(value: T): T {
    return value;
}

const weakThunks = new WeakMap<object, () => any>();
/** Creates a function that always returns the provided value. */
export function thunk<T>(value: T): () => T;
export function thunk(value: any): () => any {
    if (typeof value === "object" && value !== null) {
        let f = weakThunks.get(value);
        if (!f) weakThunks.set(value, f = () => value);
        return f;
    }
    return () => value;
}

/** A function that does nothing. */
export function noop(...args: unknown[]): unknown;
export function noop(): any {
}

/** Creates a function that produces monotonically increasing number values. */
export function incrementer(start = 0) {
    return () => start++;
}

/** Creates a function that produces monotonically decreasing number values. */
export function decrementer(start = 0) {
    return () => start--;
}

/** Compares two values. */
export function compare<T>(x: T, y: T): number {
    if (IsComparable(x) && IsComparable(y)) {
        return x[Comparable.compareTo](y);
    }
    if (x < y) {
        return -1;
    }
    else if (x > y) {
        return +1;
    }
    return 0;
}

/** Compose one function with another (i.e. `compose(g, f)` is `x => g(f(x))`) */
export function compose<X, Y, Z>(g: (y: Y) => Z, f: (x: X) => Y): (x: X) => Z {
    return x => g(f(x));
}

/** Create a lazy-initialized value. */
export function lazy<T, A extends any[]>(factory: (...args: A) => T, ...args: A): Lazy<T> {
    return Lazy.from(factory, ...args);
}

/** Makes a tuple from the provided arguments */
export function tuple<A extends [any?, ...any[]]>(...args: A): A {
    return args;
}

/** Always returns `true` */
export function T(): true { return true; }

/** Always returns `false` */
export function F(): false { return false; }

/** Various shorthand operator functions */
export namespace Op {
    /** Add */
    export function add(x: number, y: number) { return x + y; }
    /** Subtract */
    export function sub(x: number, y: number) { return x - y; }
    /** Multiply */
    export function mul(x: number, y: number) { return x * y; }
    /** Exponentiate */
    export function pow(x: number, y: number) { return x ** y; }
    /** Divide */
    export function div(x: number, y: number) { return x / y; }
    /** Modulo */
    export function mod(x: number, y: number) { return x % y; }
    /** Left shift */
    export function shl(x: number, n: number) { return x << n; }
    /** Right shift */
    export function shr(x: number, n: number) { return x >> n; }
    /** Unsigned right shift */
    export function sru(x: number, n: number) { return x >>> n; }
    /** Negate */
    export function neg(x: number) { return -x; }
    /** Bitwise AND */
    export function band(x: number, y: number) { return x & y; }
    /** Bitwise OR */
    export function bor(x: number, y: number) { return x | y; }
    /** Bitwise XOR */
    export function bxor(x: number, y: number) { return x ^ y; }
    /** Bitwise NOT */
    export function bnot(x: number) { return ~x; }
    /** Logical AND */
    export function and(x: boolean, y: boolean) { return x && y; }
    /** Logical OR */
    export function or(x: boolean, y: boolean) { return x || y; }
    /** Logical XOR */
    export function xor(x: boolean, y: boolean) { return !!(+x ^ +y); }
    /** Logical NOT */
    export function not(x: boolean) { return !x; }
    /** Relational greater-than */
    export function gt<T>(x: T, y: T) { return compare(x, y) > 0; }
    /** Relational greater-than-equals */
    export function ge<T>(x: T, y: T) { return compare(x, y) >= 0; }
    /** Relational less-than */
    export function lt<T>(x: T, y: T) { return compare(x, y) < 0; }
    /** Relational less-than-equals */
    export function le<T>(x: T, y: T) { return compare(x, y) <= 0; }
    /** Relational equals */
    export function eq<T>(x: T, y: T) { return compare(x, y) === 0; }
    /** Relational not-equals */
    export function ne<T>(x: T, y: T) { return compare(x, y) !== 0; }
    /** Relational minimum */
    export function min<T>(x: T, y: T) { return compare(x, y) <= 0 ? x : y; }
    /** Relational maximum */
    export function max<T>(x: T, y: T) { return compare(x, y) >= 0 ? x : y; }
}