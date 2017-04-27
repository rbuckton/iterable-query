import { assert, expect } from "chai";
import { theory, preconditions } from "./test-utils";
import { Map, Set, WeakMap, WeakSet, noConflict } from "../es5/collections";

noConflict();

describe("es5", () => {
    describe("Map", () => {
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
            [{}, "object: 1"],
            [{}, "object: 2"],
            [true, "boolean: true"],
            [false, "boolean: false"]
        ];
        describe("new", () => {
            it("from array", () => expect(new Map([[1, 2]]).get(1)).to.equal(2));
            it("from iterable", () => expect(new Map(function*() { yield [1, 2] as [number, number]; }()).get(1)).to.equal(2));
        });
        describe("get()", () => {
            it("missing", () => expect(new Map<any, any>().get(1)).to.be.undefined);
            theory("gets", data, (key, value) => expect(new Map(data).get(key)).to.equal(value));
        });
        describe("has()", () => {
            it("missing", () => expect(new Map<any, any>().has(1)).to.be.false);
            theory("has", data, (key, value) => expect(new Map(data).has(key)).to.be.true);
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
        describe("clear()", () => {
            it("size is 0", () => {
                const map = new Map(data);
                map.clear();
                expect(map.size).to.eq(0);
            });
        });
    });
    describe("WeakMap", () => {
        const sentinel = {};
        const data: [object, any][] = [
            [{}, "object: 1"],
            [{}, "object: 2"],
            [function() {}, "function: 1"],
            [function() {}, "function: 2"]
        ];
        describe("new", () => {
            it("from array", () => expect(new WeakMap([[sentinel, 2]]).get(sentinel)).to.equal(2));
            it("from iterable", () => expect(new WeakMap(function*() { yield [sentinel, 2] as [object, number]; }()).get(sentinel)).to.equal(2));
        });
        describe("get()", () => {
            it("missing", () => expect(new WeakMap<any, any>().get({})).to.be.undefined);
            theory("gets", data, (key, value) => expect(new WeakMap(data).get(key)).to.equal(value));
        });
        describe("has()", () => {
            it("missing", () => expect(new WeakMap<any, any>().has(sentinel)).to.be.false);
            theory("has", data, (key, value) => expect(new WeakMap(data).has(key)).to.be.true);
        });
        describe("set()", () => {
            theory("set", data, (key, value) => expect(new WeakMap<any, any>().set(key, value).get(key)).to.equal(value));
        });
        describe("delete()", () => {
            it("delete missing", () => expect(new WeakMap<any, any>().delete(sentinel)).to.be.false);
            it("delete existing", () => expect(new WeakMap<any, any>().set(sentinel, 1).delete(sentinel)).to.be.true);
        });
    });
    describe("Set", () => {
        const data: [any][] = [
            [1],
            [0],
            [-0],
            [NaN],
            [Infinity],
            [-Infinity],
            [undefined],
            [null],
            [""],
            ["abc"],
            [{}],
            [{}],
            [true],
            [false]
        ];
        describe("new", () => {
            it("from array", () => expect(new Set([1]).has(1)).to.be.true);
            it("from iterable", () => expect(new Set(function*() { yield 1; }()).has(1)).to.be.true);
        });
        describe("has()", () => {
            it("missing", () => expect(new Set<any>().has(1)).to.be.false);
            theory("has", data, (key) => expect(new Set(data.map(x => x[0])).has(key)).to.be.true);
        });
        describe("add()", () => {
            it("adds new", () => expect(new Set<any>().add(1).size).to.equal(1));
            it("adds same", () => expect(new Set<any>().add(1).add(1).size).to.equal(1));
        });
        describe("delete()", () => {
            it("delete missing", () => expect(new Set<any>().delete(1)).to.be.false);
            it("delete existing", () => expect(new Set<any>().add(1).delete(1)).to.be.true);
            it("delete changes size", () => {
                const set = new Set<any>();
                set.add(1).delete(1);
                expect(set.size).to.equal(0);
            });
        });
        describe("clear()", () => {
            it("size is 0", () => {
                const set = new Set(data.map(x => x[0]));
                set.clear();
                expect(set.size).to.eq(0);
            });
        });
    });
    describe("WeakSet", () => {
        const sentinel = {};
        const data: [object][] = [
            [{}],
            [function() {}]
        ];
        describe("new", () => {
            it("from array", () => expect(new WeakSet([sentinel]).has(sentinel)).to.be.true);
            it("from iterable", () => expect(new WeakSet(function*() { yield sentinel; }()).has(sentinel)).to.be.true);
        });
        describe("has()", () => {
            it("missing", () => expect(new WeakSet<any>().has(sentinel)).to.be.false);
            theory("has", data, (key) => expect(new WeakSet(data.map(x => x[0])).has(key)).to.be.true);
        });
        describe("add()", () => {
            it("adds", () => expect(new WeakSet<any>().add(sentinel).has(sentinel)).to.be.true);
        });
        describe("delete()", () => {
            it("delete missing", () => expect(new WeakSet<any>().delete(sentinel)).to.be.false);
            it("delete existing", () => expect(new WeakSet<any>().add(sentinel).delete(sentinel)).to.be.true);
        });
    });
});
