declare const global: any;
declare const self: any;

const root = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : undefined;

export interface Shim {
    restore(): void;
}

export function inject(inject: (global: any) => void, restore: (global: any) => void): Shim | undefined {
    if (root && inject && restore) {
        inject(root);
        return {
            restore() {
                if (restore) {
                    restore(root);
                    restore = undefined;
                    inject = undefined;
                }
            }
        };
    }
}