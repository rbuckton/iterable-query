declare const global: any;
declare const self: any;

const root = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : undefined;

export interface Shim {
    restore(): void;
}

export function injectGlobal(name: string, value: any): Shim | undefined {
    if (root && name && value && root[name] === undefined) {
        root[name] = value;
        return {
            restore() {
                if (value && root[name] === value) {
                    delete root[name];
                    value = undefined;
                }
            }
        };
    }
}