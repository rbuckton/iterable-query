import { Symbol as Sym } from "./symbol";
import { injectGlobal, Shim } from "./shim";
import { createUUID } from "./uuid";
import { SameValue, ToIterable, NextResult, DoneResult } from "./utils";

const hasOwn = Object.prototype.hasOwnProperty;
let uniqueKey: WeakMap<object, string>;
let mapShim: Shim | undefined;
let setShim: Shim | undefined;
let weakMapShim: Shim | undefined;
let weakMapPolyfill: WeakMapConstructor | undefined;
let mapPolyfill: MapConstructor | undefined;
let setPolyfill: SetConstructor | undefined;
let _WeakMap: WeakMapConstructor = typeof WeakMap === "function" ? WeakMap : createWeakMapPolyfill(true);
let _Map: MapConstructor = typeof Map === "function" && Map.prototype.entries ? Map : createMapPolyfill(true);
let _Set: SetConstructor = typeof Set === "function" && Set.prototype.entries ? Set : createSetPolyfill(true);

function createWeakMapPolyfill(injectGlobals: boolean) {
    const rootKey = createUUID();

    class WeakMap<K, V> {
        private _key = createUUID();

        public has(target: K): boolean {
            const table = GetWeakTable(target, /*create*/ false);
            return table ? this._key in table : false;
        }

        public get(target: K): V {
            const table = GetWeakTable(target, /*create*/ false);
            return table && this._key in table ? table[this._key] : undefined;
        }

        public set(target: K, value: V): WeakMap<K, V> {
            const table = GetWeakTable(target, /*create*/ true);
            table[this._key] = value;
            return this;
        }

        public delete(target: K): boolean {
            const table = GetWeakTable(target, /*create*/ false);
            return table && this._key in table ? delete table[this._key] : false;
        }

        public clear(): void {
            this._key = createUUID();
        }

        [Symbol.toStringTag]: "WeakMap";
    }

    function GetWeakTable(target: any, create: boolean): Record<string, any> {
        if (Object(target) !== target) throw new TypeError();
        if (!hasOwn.call(target, rootKey)) {
            if (!create) {
                return undefined;
            }
            Object.defineProperty(target, rootKey, { value: createDictionary() });
        }
        return target[rootKey];
    }

    Object.defineProperty(WeakMap.prototype, Sym.toStringTag, { value: "WeakMap", configurable: true, writable: true });
    weakMapShim = injectGlobals && injectGlobal("WeakMap", WeakMap);
    return weakMapPolyfill = WeakMap as WeakMapConstructor;
}

function createMapPolyfill(injectGlobals: boolean) {
    class Map<K, V> {
        private _keys = createDictionary<K>();
        private _values = createDictionary<V>();
        private _size: number = 0;

        constructor(iterable?: Iterable<[K, V]> | ArrayLike<[K, V]>) {
            if (iterable !== undefined) {
                for (const [key, value] of ToIterable(iterable)) {
                    this.set(key, value);
                }
            }
        }

        public get size() {
            return this._size;
        }

        public has(key: K) {
            const id = GetUniqueKey(key);
            return id in this._keys;
        }

        public get(key: K): V {
            const id = GetUniqueKey(key);
            return id in this._keys ? this._values[id] : undefined;
        }

        public set(key: K, value: V): this {
            const id = GetUniqueKey(key);
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

        public delete(key: K): boolean {
            const id = GetUniqueKey(key);
            if (id in this._keys) {
                delete this._keys[id];
                delete this._values[id];
                this._size--;
                return true;
            }

            return false;
        }

        public clear(): void {
            this._keys = createDictionary<K>();
            this._values = createDictionary<V>();
            this._size = 0;
        }

        public forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any) {
            for (const id in this._keys) {
                callback.call(thisArg, this._values[id], this._keys[id], this);
            }
        }

        public keys(): IterableIterator<K> {
            return new KeyValueIterator(this._keys, this._values, keySelector);
        }

        public values(): IterableIterator<V> {
            return new KeyValueIterator(this._keys, this._values, valueSelector);
        }

        public entries(): IterableIterator<[K, V]> {
            return new KeyValueIterator(this._keys, this._values, entrySelector);
        }

        [Symbol.iterator]: () => IterableIterator<[K, V]>;
        [Symbol.toStringTag]: "Map";
    }

    Object.defineProperty(Map.prototype, Sym.toStringTag, { value: "Map", configurable: true, writable: true });
    Object.defineProperty(Map.prototype, Sym.iterator, { value: Map.prototype.entries, configurable: true, writable: true });
    mapShim = injectGlobals && injectGlobal("Map", Map);
    return mapPolyfill = Map as MapConstructor;
}

function createSetPolyfill(injectGlobals: boolean) {
    class Set<T> {
        private _values = createDictionary<T>();
        private _size: number = 0;

        constructor(iterable?: Iterable<T> | ArrayLike<T>) {
            if (iterable !== undefined) {
                for (const value of ToIterable(iterable)) {
                    this.add(value);
                }
            }
        }

        public get size() {
            return this._size;
        }

        public has(value: T) {
            const id = GetUniqueKey(value);
            return id in this._values;
        }

        public add(value: T): this {
            const id = GetUniqueKey(value);
            if (id in this._values) {
                return this;
            }
            else {
                this._values[id] = value;
                this._size++;
            }

            return this;
        }

        public delete(value: T): boolean {
            const id = GetUniqueKey(value);
            if (id in this._values) {
                delete this._values[id];
                this._size--;
                return true;
            }

            return false;
        }

        public clear(): void {
            this._values = createDictionary<T>();
            this._size = 0;
        }

        public forEach(callback: (value: T, key: T, set: this) => void, thisArg?: any) {
            for (const key in this._values) {
                const value = this._values[key];
                callback.call(thisArg, value, value, this);
            }
        }

        public keys(): IterableIterator<T> {
            return new KeyValueIterator(this._values, this._values, keySelector);
        }

        public values(): IterableIterator<T> {
            return new KeyValueIterator(this._values, this._values, valueSelector);
        }

        public entries(): IterableIterator<[T, T]> {
            return new KeyValueIterator(this._values, this._values, entrySelector);
        }

        [Symbol.iterator]: () => IterableIterator<T>;
        [Symbol.toStringTag]: "Set";
    }

    Object.defineProperty(Set.prototype, Sym.toStringTag, { value: "Set", configurable: true, writable: true });
    Object.defineProperty(Set.prototype, Sym.iterator, { value: Set.prototype.values, configurable: true, writable: true });
    setShim = injectGlobals && injectGlobal("Set", Set);
    return setPolyfill = Set as SetConstructor;
}

function noConflict() {
    if (weakMapShim) {
        weakMapShim.restore();
        weakMapShim = undefined;
    }
    if (mapShim) {
        mapShim.restore();
        mapShim = undefined;
    }
    if (setShim) {
        setShim.restore();
        setShim = undefined;
    }
    _WeakMap = weakMapPolyfill || createWeakMapPolyfill(false);
    _Map = mapPolyfill || createMapPolyfill(false);
    _Set = setPolyfill || createSetPolyfill(false);
}

function createDictionary<T>(): Record<string, T> {
    const obj = Object.create(null);
    obj.__ = undefined;
    delete obj.__;
    return obj;
}

function keySelector<K, V>(id: string, keys: Record<string, K>, _values: Record<string, V>) {
    return keys[id];
}

function valueSelector<K, V>(id: string, _keys: Record<string, K>, values: Record<string, V>) {
    return values[id];
}

function entrySelector<K, V>(id: string, keys: Record<string, K>, values: Record<string, V>) {
    return [keys[id], values[id]] as [K, V];
}

class KeyValueIterator<K, V, T extends K | V | [K, V]> implements IterableIterator<T> {
    private _keys: { [id: string]: K; };
    private _values: { [id: string]: V; };
    private _ids: string[];
    private _selector: (id: string, keys: Record<string, K>, values: Record<string, V>) => T;

    constructor(keys: Record<string, K>, values: Record<string, V>, selector: (id: string, keys: Record<string, K>, values: Record<string, V>) => T) {
        this._keys = keys;
        this._values = values;
        this._selector = selector;

        const ids: string[] = [];
        for (const key in keys) {
            ids.push(key);
        }

        this._ids = ids;
    }

    public next(): IteratorResult<T> {
        if (this._ids !== undefined) {
            while (this._ids.length > 0) {
                const id = this._ids.shift();
                if (id in this._keys) {
                    return NextResult(this._selector(id, this._keys, this._values));
                }
            }

            this._ids = undefined;
            this._keys = undefined;
            this._values = undefined;
            return DoneResult<any>();
        }
    }

    public throw(value: any): IteratorResult<T> {
        this._ids = undefined;
        this._keys = undefined;
        this._values = undefined;
        throw value;
    }

    public return(): IteratorResult<T> {
        this._ids = undefined;
        this._keys = undefined;
        this._values = undefined;
        return DoneResult<T>();
    }

    [Symbol.iterator]() {
        return this;
    }
}

function GetUniqueKey(target: any) {
    if (target === null) {
        return `null@`;
    }
    else if (target === undefined) {
        return `undefined@`;
    }
    else if (typeof target === "string") {
        return `string@${target}`;
    }
    else if (typeof target === "number") {
        if (SameValue(target, NaN)) {
            return `number@NaN`;
        }
        else if (SameValue(target, -0)) {
            return `number@minusZero`;
        }
        else {
            return `number@${target}`;
        }
    }
    else if (typeof target === "boolean") {
        return target ? `boolean@true` : `boolean@false`;
    }
    else {
        if (uniqueKey === undefined) {
            uniqueKey = new _WeakMap<object, string>();
        }
        if (uniqueKey.has(target)) {
            return uniqueKey.get(target);
        }
        const id = createUUID();
        uniqueKey.set(target, id);
        return id;
    }
}

export {
    _Map as Map,
    _Set as Set,
    _WeakMap as WeakMap,
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

    interface MapConstructor {
        readonly prototype: Map<any, any>;
        new (): Map<any, any>;
        new <K, V>(entries?: [K, V][]): Map<K, V>;
        new <K, V>(entries?: Iterable<[K, V]>): Map<K, V>;
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

    var Map: MapConstructor;

    interface SetConstructor {
        readonly prototype: Set<any>;
        new (): Set<any>;
        new <T>(values?: T[]): Set<T>;
        new <T>(values?: Iterable<T>): Set<T>;
    }

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

    var Set: SetConstructor;

    interface WeakMapConstructor {
        readonly prototype: WeakMap<any, any>;
        new (): WeakMap<any, any>;
        new <K extends object, V>(entries?: [K, V][]): WeakMap<K, V>;
    }

    interface WeakMap<K extends object, V> {
        has(key: K): boolean;
        get(key: K): V | undefined;
        set(key: K, value: V): this;
        delete(key: K): boolean;
    }

    var WeakMap: WeakMapConstructor;
}
