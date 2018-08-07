import * as crypto from "crypto";
import { iterator, SameValue, GetIterator, IteratorClose, NextResult, DoneResult } from "./utils";
import { Iterable, Iterator, IterableIterator, IteratorResult } from "./query";

const rootKey = uuid();
const uniqueKey = uuid();

export class Map<K, V> {
    private _keys = CreateHashMap<K>();
    private _values = CreateHashMap<V>();
    private _size = 0;

    constructor(iterable?: Iterable<[K, V]> | ArrayLike<[K, V]>) {
        if (iterable !== undefined) {
            let iterator = GetIterator(iterable);
            try {
                while (true) {
                    const { value, done } = iterator.next();
                    if (done) {
                        iterator = undefined;
                        break;
                    }

                    const [key, entry] = value;
                    this.set(key, entry);
                }
            }
            finally {
                IteratorClose(iterator);
            }
        }
    }

    public get size() {
        return this._size;
    }

    public has(key: K) {
        const id = GetUniqueKey(key, this._keys, /*cacheSymbols*/ false);
        return id in this._keys;
    }

    public get(key: K): V {
        const id = GetUniqueKey(key, this._keys, /*cacheSymbols*/ false);
        return id in this._keys ? this._values[id] : undefined;
    }

    public set(key: K, value: V): Map<K, V> {
        const id = GetUniqueKey(key, this._keys, /*cacheSymbols*/ true);
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
        const id = GetUniqueKey(key, this._keys, /*cacheSymbols*/ false);
        if (id in this._keys) {
            delete this._keys[id];
            delete this._values[id];
            if (typeof key === "symbol") RemoveSymbol(key, this._keys);
            this._size--;
            return true;
        }

        return false;
    }

    public clear(): void {
        this._keys = CreateHashMap();
        this._values = CreateHashMap();
        this._size = 0;
    }

    public keys(): IterableIterator<K> {
        return <IterableIterator<K>>new KeyValueIterator(this._keys, this._values, "key");
    }

    public values(): IterableIterator<V> {
        return <IterableIterator<V>>new KeyValueIterator(this._keys, this._values, "value");
    }

    public entries(): IterableIterator<[K, V]> {
        return <IterableIterator<[K, V]>>new KeyValueIterator(this._keys, this._values, "key+value");
    }

    @iterator __iterator__(): IterableIterator<[K, V]> {
        return this.entries();
    }
}

export class Set<T> {
    private _values = CreateHashMap<T>();
    private _size: number = 0;

    constructor(iterable?: Iterable<T> | ArrayLike<T>) {
        if (iterable !== undefined) {
            let iterator = GetIterator(iterable);
            try {
                while (true) {
                    const { value, done } = iterator.next();
                    if (done) {
                        iterator = undefined;
                        break;
                    }

                    this.add(value);
                }
            }
            finally {
                IteratorClose(iterator);
            }
        }
    }

    public get size() {
        return this._size;
    }

    public has(value: T) {
        const id = GetUniqueKey(value, this._values, /*cacheSymbols*/ false);
        return id in this._values;
    }

    public add(value: T): Set<T> {
        const id = GetUniqueKey(value, this._values, /*cacheSymbols*/ true);
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
        const id = GetUniqueKey(value, this._values, /*cacheSymbols*/ false);
        if (id in this._values) {
            delete this._values[id];
            if (typeof value === "symbol") RemoveSymbol(value, this._values);
            this._size--;
            return true;
        }

        return false;
    }

    public clear(): void {
        this._values = CreateHashMap();
        this._size = 0;
    }

    public keys(): IterableIterator<T> {
        return <IterableIterator<T>>new KeyValueIterator(this._values, this._values, "key");
    }

    public values(): IterableIterator<T> {
        return <IterableIterator<T>>new KeyValueIterator(this._values, this._values, "value");
    }

    public entries(): IterableIterator<[T, T]> {
        return <IterableIterator<[T, T]>>new KeyValueIterator(this._values, this._values, "key+value");
    }

    @iterator __iterator__(): Iterator<T> {
        return this.values();
    }
}

export class WeakMap<K, V> {
    private _key = uuid();

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
        this._key = uuid();
    }
}

class KeyValueIterator<K, V> implements IterableIterator<K | V | [K, V]> {
    private _keys: HashMap<K>;
    private _values: HashMap<V>;
    private _kind: "key" | "value" | "key+value";
    private _ids: string[];

    constructor(keys: HashMap<K>, values: HashMap<V>, kind: "key" | "value" | "key+value") {
        this._keys = keys;
        this._values = values;
        this._kind = kind;

        const ids: string[] = [];
        for (const key in keys) {
            ids.push(key);
        }

        this._ids = ids;
    }

    @iterator __iterator__() {
        return this;
    }

    public next(): IteratorResult<K | V | [K, V]> {
        if (this._ids !== undefined) {
            while (this._ids.length > 0) {
                const id = this._ids.shift();
                if (id in this._keys) {
                    switch (this._kind) {
                        case "key":
                            return NextResult(this._keys[id]);
                        case "value":
                            return NextResult(this._values[id]);
                        case "key+value":
                            return NextResult(<[K, V]>[this._keys[id], this._values[id]]);
                    }
                }
            }

            this._ids = undefined;
            this._keys = undefined;
            this._values = undefined;
            return DoneResult<any>();
        }
    }

    public throw(value: any): IteratorResult<K | V | [K, V]> {
        this._ids = undefined;
        this._keys = undefined;
        this._values = undefined;
        throw value;
    }

    public return(): IteratorResult<K | V | [K, V]> {
        this._ids = undefined;
        this._keys = undefined;
        this._values = undefined;
        return DoneResult<K | V | [K, V]>();
    }
}

interface HashMap<T> {
    [key: string]: T;
}

function CreateHashMap<T>(): HashMap<T> {
    const hashMap = Object.create(null);
    hashMap["__"] = undefined;
    delete hashMap["__"];
    return hashMap;
}

function GetUniqueKey(target: any, keys: any, cacheSymbols: boolean): string {
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
            return `number@-0`;
        }
        else {
            return `number@${target}`;
        }
    }
    else if (typeof target === "boolean") {
        return target ? `boolean@true` : `boolean@false`;
    }
    else if (typeof target === "symbol") {
        if (target in keys) return keys[target];
        if (!cacheSymbols) return `no-key@`;
        const key = uuid();
        keys[target] = key;
        return key;
    }
    else {
        if (Object.prototype.hasOwnProperty.call(target, uniqueKey)) {
            return target[uniqueKey];
        }

        const key = uuid();
        Object.defineProperty(target, uniqueKey, { value: key });
        return key;
    }
}

function RemoveSymbol(target: symbol, keys: any) {
    delete keys[target];
}

function GetWeakTable(target: any, create: boolean): { [key: string]: any; } {
    if (Object(target) !== target) {
        throw new TypeError();
    }

    if (!Object.prototype.hasOwnProperty.call(target, rootKey)) {
        if (!create) {
            return undefined;
        }

        Object.defineProperty(target, rootKey, { value: CreateHashMap() });
    }

    return target[rootKey];
}

function uuid() {
    const data = crypto.randomBytes(16);
    let offset = 0;
    data[6] = data[6] & 0x4f | 0x40;
    data[8] = data[8] & 0xbf | 0x80;
    return "@@DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD".replace(/DD/g,
        () => (data[offset] < 16 ? "0" : "") + data[offset++].toString(16));
}