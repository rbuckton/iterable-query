import "./symbol";
import { inject, Shim } from "./shim";
import { createUUID } from "./uuid";
import { SameValue, ToIterable, NextResult, DoneResult, IsObject, Identity, IsIterable, ToArray } from "./utils";

const KEY_NULL = `null@`;
const KEY_UNDEFINED = `undefined@`;
const KEY_TRUE = `true@`;
const KEY_FALSE = `false@`;
const KEY_NAN = `NaN@`;
const KEY_MINUS_ZERO = `minusZero@`;
const KEY_NUMBER = `number@`;
const KEY_STRING = `string@`;

const hasOwn = Object.prototype.hasOwnProperty;
let uniqueKey: WeakMap<object, string>;
let mapShim: Shim | undefined;
let mapPolyfill: MapConstructor | undefined;
let Map_: MapConstructor = typeof Map === "function" && Map.prototype.entries ? Map : createMapPolyfill(true);
let weakMapShim: Shim | undefined;
let weakMapPolyfill: WeakMapConstructor | undefined;
let WeakMap_: WeakMapConstructor = typeof WeakMap === "function" ? WeakMap : createWeakMapPolyfill(true);
let setShim: Shim | undefined;
let setPolyfill: SetConstructor | undefined;
let Set_: SetConstructor = typeof Set === "function" && Set.prototype.entries ? Set : createSetPolyfill(true);
let weakSetShim: Shim | undefined;
let weakSetPolyfill: WeakSetConstructor | undefined;
let WeakSet_: WeakSetConstructor = typeof WeakSet === "function" ? WeakSet : createWeakSetPolyfill(true);
let arrayMethodShim: Shim | undefined = injectArrayMethodPolyfills();

interface Hashtable<T> {
    [key: string]: T;
}

function createMapPolyfill(injectGlobals: boolean) {
    class Map<K, V> {
        private _keys = createHashtable<K>();
        private _values = createHashtable<V>();
        private _size: number = 0;
        constructor(iterable?: Iterable<[K, V]> | ArrayLike<[K, V]>) {
            if (iterable !== undefined) {
                for (const [key, value] of ToIterable(iterable)) this.set(key, value);
            }
        }
        get size() { return this._size; }
        has(key: K) { return getUniqueKey(key) in this._keys; }
        get(key: K): V {
            const id = getUniqueKey(key);
            return id in this._keys ? this._values[id] : undefined;
        }
        set(key: K, value: V): this {
            const id = getUniqueKey(key);
            if (id in this._keys) {
                this._values[id] = value;
            }
            else {
                this._keys[id] = key;
                this._values[id] = value;
                this._size++;
            }
            return this;
        }
        delete(key: K): boolean {
            const id = getUniqueKey(key);
            if (id in this._keys) {
                delete this._keys[id];
                delete this._values[id];
                this._size--;
                return true;
            }

            return false;
        }
        clear(): void {
            this._keys = createHashtable<K>();
            this._values = createHashtable<V>();
            this._size = 0;
        }
        forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any) {
            for (const id in this._keys) callback.call(thisArg, this._values[id], this._keys[id], this);
        }
        * keys(): IterableIterator<K> {
            for (const id in this._keys) yield this._keys[id];
        }
        * values(): IterableIterator<V> {
            for (const id in this._values) yield this._values[id];
        }
        * entries(): IterableIterator<[K, V]> {
            for (const id in this._keys) yield [this._keys[id], this._values[id]];
        }
        [Symbol.iterator]: () => IterableIterator<[K, V]>;
        [Symbol.toStringTag]: "Map";
    }

    Object.defineProperty(Map.prototype, Symbol.toStringTag, { value: "Map", configurable: true, writable: true });
    Object.defineProperty(Map.prototype, Symbol.iterator, { value: Map.prototype.entries, configurable: true, writable: true });
    mapShim = injectGlobals && inject(
        global => { if (global.Map === undefined) global.Map = Map; },
        global => { if (global.Map === Map) delete global.Map; }
    );
    return mapPolyfill = Map as MapConstructor;
}

function createWeakMapPolyfill(injectGlobals: boolean) {
    const rootKey = createUUID();
    class WeakMap<K extends object, V> {
        private _key = createUUID();
        constructor(iterable?: Iterable<[K, V]> | ArrayLike<[K, V]>) {
            if (iterable !== undefined) {
                for (const [key, value] of ToIterable(iterable)) this.set(key, value);
            }
        }
        has(target: K): boolean {
            const table = getOrCreateWeakTable<V>(target, rootKey, /*create*/ false);
            return table ? this._key in table : false;
        }
        get(target: K): V {
            const table = getOrCreateWeakTable<V>(target, rootKey, /*create*/ false);
            return table && this._key in table ? table[this._key] : undefined;
        }
        set(target: K, value: V): this {
            getOrCreateWeakTable<V>(target, rootKey, /*create*/ true)[this._key] = value;
            return this;
        }
        delete(target: K): boolean {
            const table = getOrCreateWeakTable<V>(target, rootKey, /*create*/ false);
            return table && this._key in table ? delete table[this._key] : false;
        }
        [Symbol.toStringTag]: "WeakMap";
    }
    Object.defineProperty(WeakMap.prototype, Symbol.toStringTag, { value: "WeakMap", configurable: true, writable: true });
    weakMapShim = injectGlobals && inject(
        global => { if (global.WeakMap === undefined) global.WeakMap = WeakMap; },
        global => { if (global.WeakMap === WeakMap) delete global.WeakMap; }
    );
    return weakMapPolyfill = WeakMap as WeakMapConstructor;
}

function createSetPolyfill(injectGlobals: boolean) {
    class Set<T> {
        private _values = createHashtable<T>();
        private _size: number = 0;
        constructor(iterable?: Iterable<T> | ArrayLike<T>) {
            if (iterable !== undefined) {
                for (const value of ToIterable(iterable)) this.add(value);
            }
        }
        get size() { return this._size; }
        has(value: T) { return getUniqueKey(value) in this._values; }
        add(value: T): this {
            const id = getUniqueKey(value);
            if (!(id in this._values)) {
                this._values[id] = value;
                this._size++;
            }
            return this;
        }
        delete(value: T): boolean {
            const id = getUniqueKey(value);
            if (id in this._values) {
                delete this._values[id];
                this._size--;
                return true;
            }
            return false;
        }
        clear(): void {
            this._values = createHashtable<T>();
            this._size = 0;
        }
        forEach(callback: (value: T, key: T, set: this) => void, thisArg?: any) {
            for (const id in this._values) {
                const value = this._values[id];
                callback.call(thisArg, value, value, this);
            }
        }
        * keys(): IterableIterator<T> {
            for (const id in this._values) yield this._values[id];
        }
        * values(): IterableIterator<T> {
            for (const id in this._values) yield this._values[id];
        }
        * entries(): IterableIterator<[T, T]> {
            for (const id in this._values) yield [this._values[id], this._values[id]];
        }
        [Symbol.iterator]: () => IterableIterator<T>;
        [Symbol.toStringTag]: "Set";
    }
    Object.defineProperty(Set.prototype, Symbol.toStringTag, { value: "Set", configurable: true, writable: true });
    Object.defineProperty(Set.prototype, Symbol.iterator, { value: Set.prototype.values, configurable: true, writable: true });
    setShim = injectGlobals && inject(
        global => { if (global.Set === undefined) global.Set = Set; },
        global => { if (global.Set === Set) delete global.Set; }
    );
    return setPolyfill = Set as SetConstructor;
}

function createWeakSetPolyfill(injectGlobals: boolean) {
    const rootKey = createUUID();
    class WeakSet<T extends object> {
        private _key = createUUID();
        constructor(iterable?: Iterable<T> | ArrayLike<T>) {
            if (iterable !== undefined) {
                for (const value of ToIterable(iterable)) this.add(value);
            }
        }
        has(target: T): boolean {
            const table = getOrCreateWeakTable<boolean>(target, rootKey, /*create*/ false);
            return table ? this._key in table : false;
        }
        add(target: T): this {
            getOrCreateWeakTable<boolean>(target, rootKey, /*create*/ true)[this._key] = true;
            return this;
        }
        delete(target: T): boolean {
            const table = getOrCreateWeakTable<boolean>(target, rootKey, /*create*/ false);
            return table && this._key in table ? delete table[this._key] : false;
        }
        [Symbol.toStringTag]: "WeakSet";
    }
    Object.defineProperty(WeakMap.prototype, Symbol.toStringTag, { value: "WeakSet", configurable: true, writable: true });
    weakSetShim = injectGlobals && inject(
        global => { if (global.WeakSet === undefined) global.WeakSet = WeakSet; },
        global => { if (global.WeakSet === WeakSet) delete global.WeakSet; }
    );
    return weakSetPolyfill = WeakSet as WeakSetConstructor;
}

function injectArrayMethodPolyfills() {
    function* keys<T>(this: Array<T>): IterableIterator<number> {
        for (let i = 0; i < this.length; i++) yield i;
    }
    function* values<T>(this: Array<T>): IterableIterator<T> {
        for (let i = 0; i < this.length; i++) yield this[i];
    }
    function* entries<T>(this: Array<T>): IterableIterator<[number, T]> {
        for (let i = 0; i < this.length; i++) yield [i, this[i]];
    }
    function from<T, U = T>(source: Iterable<T> | ArrayLike<T>, selector?: (v: T, k: number) => U, thisArg?: any) {
        return ToArray<T, U>(source, selector, thisArg);
    }
    function of<T>(...args: T[]) {
        return args;
    }
    return inject(
        global => {
            if (global.Array.prototype.keys === undefined) Object.defineProperty(global.Array.prototype, "keys", { value: keys, configurable: true, writable: true });
            if (global.Array.prototype.entries === undefined) Object.defineProperty(global.Array.prototype, "entries", { value: entries, configurable: true, writable: true });
            if (global.Array.prototype[Symbol.iterator] === undefined) Object.defineProperty(global.Array.prototype, Symbol.iterator, { value: values, configurable: true, writable: true });
            if (global.Array.prototype.values === undefined) Object.defineProperty(global.Array.prototype, "values", { value: values, configurable: true, writable: true });
            if (global.Array.from === undefined) Object.defineProperty(global.Array, "from", { value: from, configurable: true, writable: true });
            if (global.Array.of === undefined) Object.defineProperty(global.Array, "of", { value: of, configurable: true, writable: true });
        },
        global => {
            if (global.Array.prototype.keys === keys) delete global.Array.prototype.keys;
            if (global.Array.prototype.values === values) delete global.Array.prototype.values;
            if (global.Array.prototype.entries === entries) delete global.Array.prototype.entries;
            if (global.Array.prototype[Symbol.iterator] === values) delete global.Array.prototype[Symbol.iterator];
            if (global.Array.from === from) delete global.Array.from;
            if (global.Array.of === of) delete global.Array.of;
        }
    );
}

function createHashtable<T>(): Hashtable<T> {
    const obj = Object.create(null);
    obj.__ = undefined;
    delete obj.__;
    return obj;
}

function getOrCreateWeakTable<T>(target: any, rootKey: string, create: boolean): Hashtable<T> {
    if (!IsObject(target)) throw new TypeError();
    if (!hasOwn.call(target, rootKey)) {
        if (!create) return undefined;
        Object.defineProperty(target, rootKey, { value: createHashtable() });
    }
    return (<any>target)[rootKey];
}

function getUniqueKey(target: any) {
    if (SameValue(target, null)) return KEY_NULL;
    if (SameValue(target, undefined)) return KEY_UNDEFINED;
    if (SameValue(target, true)) return KEY_TRUE;
    if (SameValue(target, false)) return KEY_FALSE;
    if (SameValue(target, NaN)) return KEY_NAN;
    if (SameValue(target, -0)) return KEY_MINUS_ZERO;
    if (typeof target === "string") return KEY_STRING + target;
    if (typeof target === "number") return KEY_NUMBER + target;
    if (typeof target === "symbol") return target;
    if (uniqueKey === undefined) uniqueKey = new WeakMap_<object, string>();
    if (uniqueKey.has(target)) return uniqueKey.get(target);
    const id = `${typeof target}@${createUUID()}`;
    uniqueKey.set(target, id);
    return id;
}

function noConflict() {
    if (arrayMethodShim) {
        arrayMethodShim.restore();
        arrayMethodShim = undefined;
    }
    if (mapShim) {
        mapShim.restore();
        mapShim = undefined;
    }
    if (weakMapShim) {
        weakMapShim.restore();
        weakMapShim = undefined;
    }
    if (setShim) {
        setShim.restore();
        setShim = undefined;
    }
    if (weakSetShim) {
        weakSetShim.restore();
        weakSetShim = undefined;
    }
    Map_ = mapPolyfill || createMapPolyfill(false);
    WeakMap_ = weakMapPolyfill || createWeakMapPolyfill(false);
    Set_ = setPolyfill || createSetPolyfill(false);
    WeakSet_ = weakSetPolyfill || createWeakSetPolyfill(false);
}

export {
    Map_ as Map,
    Set_ as Set,
    WeakMap_ as WeakMap,
    WeakSet_ as WeakSet,
    noConflict
}

declare global {
    interface IteratorResult<T> {
        done: boolean;
        value: T;
    }

    interface Iterator<T> {
        next(value?: any): IteratorResult<T>;
        return?(value?: any): IteratorResult<T>;
        throw?(e?: any): IteratorResult<T>;
    }

    interface Iterable<T> {
        [Symbol.iterator](): Iterator<T>;
    }

    interface IterableIterator<T> extends Iterator<T> {
        [Symbol.iterator](): IterableIterator<T>;
    }

    interface Array<T> {
        keys(): IterableIterator<number>;
        entries(): IterableIterator<[number, T]>;
        [Symbol.iterator](): IterableIterator<T>;
    }

    interface ArrayConstructor {
        from<T, U>(arrayLike: Iterable<T> | ArrayLike<T>, mapfn: (this: undefined, v: T, k: number) => U): Array<U>;
        from<T, U>(arrayLike: Iterable<T> | ArrayLike<T>, mapfn: (this: undefined, v: T, k: number) => U, thisArg: undefined): Array<U>;
        from<Z, T, U>(arrayLike: Iterable<T> | ArrayLike<T>, mapfn: (this: Z, v: T, k: number) => U, thisArg: Z): Array<U>;
        from<T>(arrayLike: Iterable<T> | ArrayLike<T>): Array<T>;
        of<T>(...items: T[]): Array<T>;
    }

    interface ReadonlyArray<T> {
        entries(): IterableIterator<[number, T]>;
        keys(): IterableIterator<number>;
        [Symbol.iterator](): IterableIterator<T>;
    }

    interface Map<K, V> {
        readonly size: number;
        has(key: K): boolean;
        get(key: K): V | undefined;
        set(key: K, value: V): this;
        delete(key: K): boolean;
        clear(): void;
        forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
        entries(): IterableIterator<[K, V]>;
        keys(): IterableIterator<K>;
        values(): IterableIterator<V>;
        [Symbol.iterator](): IterableIterator<[K, V]>;
    }

    interface MapConstructor {
        new (): Map<any, any>;
        new <K, V>(entries?: [K, V][]): Map<K, V>;
        new <K, V>(entries?: Iterable<[K, V]>): Map<K, V>;
        readonly prototype: Map<any, any>;
    }
    var Map: MapConstructor;

    interface ReadonlyMap<K, V> {
        readonly size: number;
        get(key: K): V | undefined;
        has(key: K): boolean;
        forEach(callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: any): void;
        entries(): IterableIterator<[K, V]>;
        keys(): IterableIterator<K>;
        values(): IterableIterator<V>;
        [Symbol.iterator](): IterableIterator<[K, V]>;
    }

    interface WeakMap<K extends object, V> {
        has(key: K): boolean;
        get(key: K): V | undefined;
        set(key: K, value: V): this;
        delete(key: K): boolean;
    }

    interface WeakMapConstructor {
        new (): WeakMap<any, any>;
        new <K extends object, V>(entries?: [K, V][]): WeakMap<K, V>;
        readonly prototype: WeakMap<any, any>;
    }
    var WeakMap: WeakMapConstructor;

    interface Set<T> {
        readonly size: number;
        has(value: T): boolean;
        add(value: T): this;
        delete(value: T): boolean;
        clear(): void;
        forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
        entries(): IterableIterator<[T, T]>;
        keys(): IterableIterator<T>;
        values(): IterableIterator<T>;
        [Symbol.iterator](): IterableIterator<T>;
    }

    interface SetConstructor {
        new (): Set<any>;
        new <T>(values?: T[]): Set<T>;
        new <T>(values?: Iterable<T>): Set<T>;
        readonly prototype: Set<any>;
    }
    var Set: SetConstructor;

    interface ReadonlySet<T> {
        readonly size: number;
        has(value: T): boolean;
        forEach(callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void, thisArg?: any): void;
        entries(): IterableIterator<[T, T]>;
        keys(): IterableIterator<T>;
        values(): IterableIterator<T>;
        [Symbol.iterator](): IterableIterator<T>;
    }

    interface WeakSet<T> {
        has(value: T): boolean;
        add(value: T): this;
        delete(value: T): boolean;
    }

    interface WeakSetConstructor {
        new (): WeakSet<any>;
        new <T>(values?: T[]): WeakSet<T>;
        readonly prototype: WeakSet<any>;
    }
    var WeakSet: WeakSetConstructor;
}
