import { expect } from "chai";
import { theory } from "./test-utils";
import { Map, Set, WeakMap, WeakSet } from "../lib/collections";

describe("collections", () => {
    describe("Map", () => {
        describe("get()", () => {
            const key1 = {};
            const key2 = {};
            const sym = Symbol();
            const data: [any, any][] = [
                [1, "number: 1"],
                [0, "number: 0"],
                [-0, "number: -0"],
                [NaN, "number: NaN"],
                [Infinity, "number: Infinity"],
                [-Infinity, "number: -Infinity"],
                [undefined, "undefined"],
                [null, "null"],
                ["", "string: "],
                ["abc", "string: abc"],
                [key1, "object: 1"],
                [key2, "object: 2"],
                [true, "boolean: true"],
                [false, "boolean: false"],
                [sym, "symbol"]
            ];
            it("missing", () => expect(new Map<any, any>().get(1)).to.be.undefined);
            theory("gets and sets", data, (key, value) => {
                const map = new Map<any, any>();
                expect(map.set(key, value).get(key)).to.equal(value);
            });
        });
        describe("set()", () => {
            it("sets new", () => expect(new Map<any, any>().set(1, 1).size).to.equal(1));
            it("sets same", () => expect(new Map<any, any>().set(1, 1).set(1, 2).size).to.equal(1));
        });
        describe("delete()", () => {
            it("delete missing", () => expect(new Map<any, any>().delete(1)).to.be.false);
            it("delete existing", () => expect(new Map<any, any>().set(1, 1).delete(1)).to.be.true);
            it("delete changes size", () => {
                const map = new Map<any, any>();
                map.set(1, 1).delete(1);
                expect(map.size).to.equal(0);
            });
        });
    });
    describe("Set", () => {
    });
    describe("WeakMap", () => {
    });
    describe("WeakSet", () => {
    });
});