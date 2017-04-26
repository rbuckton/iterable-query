import { createUUID, createBuffer, FixedBuffer } from "./uuid";
declare const global: any;
declare const self: any;

let isGlobal = false;
let _Symbol: SymbolConstructor = typeof Symbol === "function" ? Symbol : createSymbolPolyfill();

function createSymbolPolyfill() {
    const SYMBOL_GLOBAL_NS = createBuffer([0x96, 0x89, 0x6a, 0xf3, 0xaf, 0xd9, 0x4e, 0xcc, 0xad, 0x7e, 0x53, 0x89, 0xd6, 0xe8, 0x21, 0x73]);
    const SYMBOL_INTERNAL_NS = createBuffer([0x96, 0x89, 0x6a, 0xf3, 0xaf, 0xd9, 0x4e, 0xcc, 0xad, 0x7e, 0x53, 0x89, 0xd6, 0xe8, 0x21, 0x75]);
    const SYMBOL_BUILTIN: (keyof SymbolConstructor)[] = ["hasInstance", "isConcatSpreadable", "iterator", "match", "replace", "search", "species", "split", "toPrimitive", "toStringTag", "unscopeables"];
    const SYMBOL_PARSER = /^Symbol\((.*?)\)@@(urn:uuid:[a-fA-F\d]{8}-[a-fA-F\d]{4}-[a-fA-F\d]{4}-[a-fA-F\d]{4}-[a-fA-F\d]{12})$/;
    const H = new Array<number>(5), W = new Array<number>(80), B = new Array<number>(64);

    const Symbol = <any>function Symbol(description?: string | number) {
        return symbolFor(description);
    };

    Symbol.for = function(key: string) {
        return symbolFor(String(key), SYMBOL_GLOBAL_NS);
    };
    Symbol.keyFor = function(symbol: any) {
        let match = SYMBOL_PARSER.exec(symbol);
        return match && symbolFor(match[1], SYMBOL_GLOBAL_NS) === symbol ? match[1] : undefined;
    };

    for (const name of SYMBOL_BUILTIN) {
        (<any>Symbol)[name] = symbolFor("Symbol." + name, SYMBOL_INTERNAL_NS);
    }

    if (typeof global !== "undefined" && global.Symbol === undefined) {
        global.Symbol = Symbol;
        isGlobal = true;
    }

    if (typeof self !== "undefined" && self.Symbol === undefined) {
        self.Symbol = Symbol;
        isGlobal = true;
    }

    return Symbol;

    function symbolFor(description?: string | number, ns?: FixedBuffer): any {
        return `Symbol(${ ns || description !== undefined ? String(description) : "" })@@${createUUID(description, ns)}`;
    }

    function setUint(buffer: number[], offset: number, size: number, value: number): void {
        for (let i = 0; i < size; ++i) buffer[offset + i] = (value >>> ((size - i - 1) * 8)) & 0xff;
    }
}

function noConflict() {
    if (isGlobal) {
        if (typeof global !== "undefined" && global.Symbol === Symbol) {
            delete global.Symbol;
        }
        if (typeof self !== "undefined" && self.Symbol === Symbol) {
            delete self.Symbol;
        }
        isGlobal = false;
    }
}

export { _Symbol as Symbol, noConflict }

declare global {
    interface SymbolConstructor {
        readonly prototype: symbol;
        (description?: string | number): symbol;
        for(key: string): symbol;
        keyFor(sym: symbol): string | undefined;
    }

    interface SymbolConstructor {
        readonly hasInstance: symbol;
        readonly isConcatSpreadable: symbol;
        readonly iterator: symbol;
        readonly match: symbol;
        readonly replace: symbol;
        readonly search: symbol;
        readonly species: symbol;
        readonly split: symbol;
        readonly toPrimitive: symbol;
        readonly toStringTag: symbol;
        readonly unscopeables: symbol;
    }

    interface Symbol {
        toString(): string;
        valueOf(): symbol;
    }

    var Symbol: SymbolConstructor;
}
