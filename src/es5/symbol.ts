import { createUUID, createBuffer, FixedBuffer } from "./uuid";
import { injectGlobal, Shim } from "./shim";

let symbolShim: Shim | undefined;
let symbolPolyfill: SymbolConstructor;
let _Symbol: SymbolConstructor = typeof Symbol === "function" ? Symbol : createSymbolPolyfill(true);

function createSymbolPolyfill(injectGlobals: boolean) {
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

    function symbolFor(description?: string | number, ns?: FixedBuffer): any {
        return `Symbol(${ ns || description !== undefined ? String(description) : "" })@@${createUUID(description, ns)}`;
    }

    function setUint(buffer: number[], offset: number, size: number, value: number): void {
        for (let i = 0; i < size; ++i) buffer[offset + i] = (value >>> ((size - i - 1) * 8)) & 0xff;
    }

    symbolShim = injectGlobal && injectGlobal("Symbol", Symbol);
    return symbolPolyfill = Symbol as SymbolConstructor;
}

function noConflict() {
    if (symbolShim) {
        symbolShim.restore();
        symbolShim = undefined;
    }

    _Symbol = symbolPolyfill || createSymbolPolyfill(false);
}

export { _Symbol as Symbol, noConflict }

declare global {
    interface ObjectConstructor {
        defineProperty(o: any, p: symbol, attributes: PropertyDescriptor & ThisType<any>): any;
    }

    interface SymbolConstructor {
        readonly prototype: Symbol;
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
