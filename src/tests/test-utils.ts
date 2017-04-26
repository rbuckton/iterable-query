import { assert, expect } from "chai";

export function theory(name: string, data: any[][], cb: (...args: any[]) => void) {
    for (const entry of data) {
        it(`${name}[${entry.map(value => typeof value === "function" ? value.name : JSON.stringify(value)).join(", ")}]`, () => cb.apply(undefined, entry));
    }
}

export function preconditions(name: string, data: [any, new () => Error][], cb: (value: any) => void) {
    theory("preconditions for " + name, data, (value, error) => {
        if (error) {
            expect(() => cb(value)).to.throw(error)
        }
        else {
            expect(() => cb(value)).to.not.throw();
        }
    });
}