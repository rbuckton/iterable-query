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

export {};

// ES2015 compatibility for ES5 hosts.
declare const global: any;
declare const self: any;
declare const window: any;

if (!hasNativeSymbol() || !hasNativeCollections()) {
    installShims(getGlobal());
}

function hasNativeSymbol() {
    return typeof Symbol === "function";
}

function hasNativeCollections() {
    return typeof Map !== "undefined"
        && typeof Set !== "undefined"
        && typeof WeakMap !== "undefined"
        && typeof WeakSet !== "undefined";
}

function getGlobal(): object {
    if (typeof global !== "undefined") return global;
    if (typeof self !== "undefined") return self;
    if (typeof window !== "undefined") return window;
    throw new Error("Global object not found");
}

function installShims(global: any) {
    const H = newUint32Array(5);
    const W = newUint8Array(80);
    const B = newUint8Array(64);

    if (!hasNativeSymbol()) {
        installSymbolShim();
    }

    if (!hasNativeCollections()) {
        installCollectionsShim();
    }

    function uuid(name?: string, ns?: ReadonlyArray<number> | Uint8Array): string {
        try {
            let offset = 0, buffer = B, kind = 0x40;
            if (ns) {
                name = String(name);
                const uuidSize = 16, blockSize = 64;
                const textSize = name.length;
                const messageSize = uuidSize + textSize * 2;
                const finalBlockSize = messageSize % blockSize;
                const padSize = (finalBlockSize < blockSize - 8 - 1 ? blockSize : blockSize * 2) - finalBlockSize;
                const byteLength = messageSize + padSize;
                if (byteLength > blockSize) buffer = newUint8Array(byteLength);
                for (let i = 0; i < uuidSize; ++i) buffer[i] = ns[i] & 0xff;
                for (let i = 0; i < textSize; ++i) setUint(buffer, uuidSize + i * 2, 2, name.charCodeAt(i));
                buffer[messageSize] = 0x80;
                setUint(buffer, byteLength - 4, 4, messageSize * 8);
                H[0] = 0x67452301, H[1] = 0xefcdab89, H[2] = 0x98badcfe, H[3] = 0x10325476, H[4] = 0xc3d2e1f0;
                for (let offset = 0; offset < byteLength; offset += blockSize) {
                    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4];
                    for (let i = 0; i < 80; ++i) {
                        if (i < 16) {
                            let x = offset + i * 4;
                            W[i] = buffer[x] << 24 | buffer[x + 1] << 16 | buffer[x + 2] << 8 | buffer[x + 3];
                        }
                        else {
                            let x = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                            W[i] = (x << 1 | x >>> 31) >>> 0;
                        }
                        let t = (a << 5 | a >>> 27) >>> 0 + e + W[i];
                        if (i < 20) t += ((b & c) | (~b & d)) + 0x5A827999;
                        else if (i < 40) t += (b ^ c ^ d) + 0x6ED9EBA1;
                        else if (i < 60) t += ((b & c) | (b & d) | (c & d)) + 0x8F1BBCDC;
                        else t += (b ^ c ^ d) + 0xCA62C1D6;
                        e = d, d = c, c = (b << 30 | b >>> 2) >>> 0, b = a, a = t;
                    }
                    H[0] += a, H[1] += b, H[2] += c, H[3] += d, H[4] += e;
                }
                for (let i = 0; i < 5; ++i) setUint(buffer, i * 4, 4, H[i]);
                kind = 0x41;
            }
            else {
                for (let i = 0; i < 16; i += 4) setUint(buffer, i, 4, (Math.random() * 0xffffffff));
            }
            buffer[6] = buffer[6] & 0x4f | kind;
            buffer[8] = buffer[8] & 0xbf | 0x80;
            return "DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD".replace(/DD/g, () => (buffer[offset] < 16 ? "0" : "") + buffer[offset++].toString(16));
        }
        finally {
            clear(H);
            clear(W);
            clear(B);
        }
    }

    function setUint(buffer: number[] | Uint8Array, offset: number, size: number, value: number): void {
        for (let i = 0; i < size; ++i) buffer[offset + i] = (value >>> ((size - i - 1) * 8)) & 0xff;
    }

    function newUint32Array(size: number) {
        return typeof Uint32Array === "function" ? new Uint32Array(size) : clear(new Array<number>(size));
    }

    function newUint8Array(size: number) {
        return typeof Uint8Array === "function" ? new Uint8Array(size) : clear(new Array<number>(size));
    }

    function clear<T extends number[] | Uint8Array | Uint32Array>(buffer: T): T {
        if (typeof buffer.fill === "function") {
            buffer.fill(0);
        }
        else {
            for (let i = 0; i < buffer.length; i++) buffer[i] = 0;
        }
        return buffer;
    }

    function installSymbolShim() {
        const SYMBOL_BUILTIN = [
            // es2015
            "hasInstance",
            "isConcatSpreadable",
            "iterator",
            "match",
            "replace",
            "search",
            "species",
            "split",
            "toPrimitive",
            "toStringTag",
            "unscopables",
            // es2018
            "asyncIterator"
        ];
        const SYMBOL_GLOBAL_NS = [0x96, 0x89, 0x6a, 0xf3, 0xaf, 0xd9, 0x4e, 0xcc, 0xad, 0x7e, 0x53, 0x89, 0xd6, 0xe8, 0x21, 0x73];
        const SYMBOL_INTERNAL_NS = [0x96, 0x89, 0x6a, 0xf3, 0xaf, 0xd9, 0x4e, 0xcc, 0xad, 0x7e, 0x53, 0x89, 0xd6, 0xe8, 0x21, 0x75];
        const SYMBOL_PARSER = /^Symbol\((.*?)\)@@(urn:uuid:[a-fA-F\d]{8}-[a-fA-F\d]{4}-[a-fA-F\d]{4}-[a-fA-F\d]{4}-[a-fA-F\d]{12})$/;
        const Symbol = function(this: any, description?: string) {
            if (this instanceof Symbol) throw new TypeError("Symbol is not a constructor");
            return symbolFor(description);
        } as SymbolConstructor;
        Object.defineProperty(Symbol, "for", {
            configurable: true, writable: true,
            value(key: string) { return symbolFor(String(key), SYMBOL_GLOBAL_NS); }
        });
        Object.defineProperty(Symbol, "keyFor", {
            configurable: true, writable: true,
            value(symbol: any) {
                const match = SYMBOL_PARSER.exec(symbol);
                return match && symbolFor(match[1], SYMBOL_GLOBAL_NS) === symbol ? match[1] : undefined;
            }
        });
        for (const name of SYMBOL_BUILTIN) {
            Object.defineProperty(Symbol, name, {
                value: symbolFor("Symbol." + name, SYMBOL_INTERNAL_NS)
            });
        }
        global.Symbol = Symbol;

        function symbolFor(description?: string, ns?: number[]): any {
            description = ns === undefined && description === undefined ? "" : String(description);
            return `Symbol(${description})@@urn:uuid:${uuid(description, ns)}`;
        }
    }

    function installCollectionsShim() {
        const primFunction = {
            uncurryThis: Function.prototype.bind.bind(Function.prototype.call)
        };

        const primObject = {
            getOwnPropertyNames: Object.getOwnPropertyNames.bind(Object),
            keys: Object.keys.bind(Object),
            seal: Object.seal.bind(Object),
            freeze: Object.freeze.bind(Object),
            preventExtensions: Object.preventExtensions.bind(Object),
            isExtensible: Object.isExtensible.bind(Object),
            hasOwn: primFunction.uncurryThis(Object.prototype.hasOwnProperty)
        };

        const primArray = {
            filter: primFunction.uncurryThis(Array.prototype.filter)
        };

        const primReflect = typeof Reflect === "undefined" ? undefined : {
            ownKeys: Reflect.ownKeys.bind(Reflect),
            preventExtensions: Reflect.preventExtensions.bind(Reflect),
            isExtensible: Reflect.isExtensible.bind(Reflect)
        };

        const INTERNAL_NS: ReadonlyArray<number> = [0x96, 0x89, 0x6a, 0xf3, 0xaf, 0xd9, 0x4e, 0xcc, 0xad, 0x7e, 0x53, 0x89, 0xd6, 0xe8, 0x21, 0x71];
        const WEAK_TABLE = uuid("[[WeakTable]]", INTERNAL_NS);
        const OBJECT_ID = uuid("[[ObjectId]]", INTERNAL_NS);

        Object.getOwnPropertyNames = function(o: any) {
            return primArray.filter(primObject.getOwnPropertyNames(o), isVisibleKey);
        };

        Object.keys = function(o: any) {
            return primArray.filter(primObject.keys(o), isVisibleKey);
        };

        Object.freeze = function<T>(o: T) {
            if (primObject.isExtensible(o) && typeof o === "object" && o !== null) getOrCreateWeakTable(o, /*create*/ true);
            return primObject.freeze(o) as T;
        };

        Object.seal = function<T>(o: T) {
            if (primObject.isExtensible(o) && typeof o === "object" && o !== null) getOrCreateWeakTable(o, /*create*/ true);
            return primObject.seal(o) as T;
        };

        Object.preventExtensions = function<T>(o: T) {
            if (primObject.isExtensible(o) && typeof o === "object" && o !== null) getOrCreateWeakTable(o, /*create*/ true);
            return primObject.preventExtensions(o) as T;
        };

        if (primReflect) {
            Reflect.ownKeys = function(o: any) {
                return primArray.filter(primReflect.ownKeys(o), isVisibleKey);
            };
            Reflect.preventExtensions = function(o: any) {
                if (primReflect.isExtensible(o) && typeof o === "object" && o !== null) getOrCreateWeakTable(o, true);
                return primReflect.preventExtensions(o);
            };
        }

        function isVisibleKey(key: string | symbol) {
            return key !== WEAK_TABLE;
        }

        function getOrCreateWeakTable(target: any, create: true): HashMap<unknown>;
        function getOrCreateWeakTable(target: any, create: boolean): HashMap<unknown> | undefined;
        function getOrCreateWeakTable(target: any, create: boolean): HashMap<unknown> | undefined {
            if (typeof target !== "object" || target === null) throw new TypeError();
            if (!primObject.hasOwn(target, WEAK_TABLE)) {
                if (!create) { return undefined; }
                Object.defineProperty(target, WEAK_TABLE, { value: createHashMap() });
            }
            return target[WEAK_TABLE];
        }

        function hasWeakValue(target: any, key: string) {
            const weakTable = getOrCreateWeakTable(target, false);
            return weakTable !== undefined && key in weakTable;
        }

        function getWeakValue(target: any, key: string) {
            const weakTable = getOrCreateWeakTable(target, false);
            return weakTable && weakTable[key];
        }

        function setWeakValue<T>(target: any, key: any, value: T) {
            return getOrCreateWeakTable(target, true)[key] = value;
        }

        function deleteWeakValue(target: any, key: string) {
            const weakTable = getOrCreateWeakTable(target, false);
            if (weakTable !== undefined && key in weakTable) {
                delete weakTable[key];
                return true;
            }
            return false;
        }

        function getId(target: any, keys: any, cacheSymbols: boolean): string {
            if (target === null) return "null";
            if (typeof target === "undefined") return "undefined";
            if (typeof target === "number") return 1 / target === -Infinity ? "-0" : String(target);
            if (typeof target === "symbol") return `Symbol(${target in keys ? keys[target] : !cacheSymbols ? "" : keys[target] = uuid()})`;
            if (typeof target === "object" || typeof target === "function") return (getWeakValue(target, OBJECT_ID) as string | undefined) || setWeakValue(target, OBJECT_ID, uuid());
            if (typeof target === "boolean") return target ? "true" : "false";
            if (typeof target === "string") return JSON.stringify(target);
            return `${typeof target}(${target})`;
        }

        class Map<K, V> {
            private _keys = createHashMap<K>();
            private _values = createHashMap<V>();
            private _size = 0;

            constructor(entries?: Iterable<[K, V]> | null) {
                if (entries !== undefined && entries !== null) {
                    for (const [key, value] of entries) {
                        this.set(key, value);
                    }
                }
            }

            get size() {
                return this._size;
            }

            has(key: K) {
                const id = getId(key, this._keys, /*cacheSymbols*/ false);
                return id in this._keys;
            }

            get(key: K): V | undefined {
                const id = getId(key, this._keys, /*cacheSymbols*/ false);
                return id in this._keys ? this._values[id] : undefined;
            }

            set(key: K, value: V): Map<K, V> {
                const id = getId(key, this._keys, /*cacheSymbols*/ true);
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
                const id = getId(key, this._keys, /*cacheSymbols*/ false);
                if (id in this._keys) {
                    delete this._keys[id];
                    delete this._values[id];
                    if (typeof key === "symbol") delete (this._keys as any)[key];
                    this._size--;
                    return true;
                }

                return false;
            }

            clear(): void {
                this._keys = createHashMap();
                this._values = createHashMap();
                this._size = 0;
            }

            keys(): IterableIterator<K> {
                return <IterableIterator<K>>new KeyValueIterator(this._keys, this._values, "key");
            }

            values(): IterableIterator<V> {
                return <IterableIterator<V>>new KeyValueIterator(this._keys, this._values, "value");
            }

            entries(): IterableIterator<[K, V]> {
                return <IterableIterator<[K, V]>>new KeyValueIterator(this._keys, this._values, "key+value");
            }

            forEach(cb: (value: V, key: K, map: this) => void, thisArg?: any) {
                for (const id in this._keys) {
                    const key = this._keys[id];
                    const value = this._values[id];
                    cb.call(thisArg, value, key, this);
                }
            }

            static readonly [Symbol.species]: MapConstructor;
            [Symbol.toStringTag]: "Map";
            [Symbol.iterator]: () => IterableIterator<[K, V]>;
        }

        Object.defineProperty(Map.prototype, Symbol.toStringTag, { configurable: true, value: "Map" });
        Object.defineProperty(Map.prototype, Symbol.iterator, { configurable: true, writable: true, value: Map.prototype.entries });
        Object.defineProperty(Map, Symbol.species, { configurable: true, get: function() { return this; }});

        class Set<T> {
            private _values = createHashMap<T>();
            private _size: number = 0;

            constructor(iterable?: Iterable<T> | null) {
                if (iterable !== undefined && iterable !== null) {
                    for (const value of iterable) {
                        this.add(value);
                    }
                }
            }

            get size() {
                return this._size;
            }

            has(value: T) {
                const id = getId(value, this._values, /*cacheSymbols*/ false);
                return id in this._values;
            }

            add(value: T): Set<T> {
                const id = getId(value, this._values, /*cacheSymbols*/ true);
                if (id in this._values) {
                    return this;
                }
                else {
                    this._values[id] = value;
                    this._size++;
                }

                return this;
            }

            delete(value: T): boolean {
                const id = getId(value, this._values, /*cacheSymbols*/ false);
                if (id in this._values) {
                    delete this._values[id];
                    if (typeof value === "symbol") delete (this._values as any)[value];
                    this._size--;
                    return true;
                }

                return false;
            }

            clear(): void {
                this._values = createHashMap();
                this._size = 0;
            }

            keys(): IterableIterator<T> {
                return <IterableIterator<T>>new KeyValueIterator(this._values, this._values, "key");
            }

            values(): IterableIterator<T> {
                return <IterableIterator<T>>new KeyValueIterator(this._values, this._values, "value");
            }

            entries(): IterableIterator<[T, T]> {
                return <IterableIterator<[T, T]>>new KeyValueIterator(this._values, this._values, "key+value");
            }

            forEach(cb: (value: T, key: T, map: this) => void, thisArg?: any) {
                for (const id in this._values) {
                    const value = this._values[id];
                    cb.call(thisArg, value, value, this);
                }
            }

            static readonly [Symbol.species]: SetConstructor;
            [Symbol.toStringTag]: "Set";
            [Symbol.iterator]: () => IterableIterator<T>;
        }

        Object.defineProperty(Set.prototype, Symbol.toStringTag, { configurable: true, value: "Set" });
        Object.defineProperty(Set.prototype, Symbol.iterator, { configurable: true, writable: true, value: Set.prototype.values });
        Object.defineProperty(Set, Symbol.species, { configurable: true, get: function() { return this; }});

        class WeakMap<K, V> {
            private _key = uuid();

            has(target: K): boolean {
                return hasWeakValue(target, this._key);
            }

            get(target: K): V | undefined {
                return getWeakValue(target, this._key) as V | undefined;
            }

            set(target: K, value: V): WeakMap<K, V> {
                setWeakValue(target, this._key, value);
                return this;
            }

            delete(target: K): boolean {
                return deleteWeakValue(target, this._key);
            }

            [Symbol.toStringTag]: "WeakMap";
        }

        Object.defineProperty(WeakMap.prototype, Symbol.toStringTag, { configurable: true, value: "WeakMap" });

        class WeakSet<T> {
            private _key = uuid();

            has(target: T): boolean {
                return hasWeakValue(target, this._key);
            }

            add(target: T): WeakSet<T> {
                setWeakValue(target, this._key, true);
                return this;
            }

            delete(target: T): boolean {
                return deleteWeakValue(target, this._key);
            }

            [Symbol.toStringTag]: "WeakSet";
        }

        Object.defineProperty(WeakSet.prototype, Symbol.toStringTag, { configurable: true, value: "WeakSet" });

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
                for (const key in keys) ids.push(key);
                this._ids = ids;
            }

            [Symbol.iterator]() { return this; }

            next(): IteratorResult<K | V | [K, V]> {
                if (this._ids !== undefined) {
                    let id: string | undefined;
                    while ((id = this._ids.shift()) !== undefined) {
                        if (id in this._keys) {
                            switch (this._kind) {
                                case "key":
                                    return { value: this._keys[id], done: false };
                                case "value":
                                    return { value: this._values[id], done: false };
                                case "key+value":
                                    return { value: <[K, V]>[this._keys[id], this._values[id]], done: false };
                            }
                        }
                    }

                    this._ids = undefined!;
                    this._keys = undefined!;
                    this._values = undefined!;
                }
                return { value: undefined!, done: true };
            }
        }

        global.Map = Map;
        global.Set = Set;
        global.WeakMap = WeakMap;
        global.WeakSet = WeakSet;

        interface HashMap<T> {
            [key: string]: T;
        }

        function createHashMap<T>(): HashMap<T> {
            const hashMap = Object.create(null);
            hashMap["__"] = undefined;
            delete hashMap["__"];
            return hashMap;
        }
    }
}
