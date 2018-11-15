import "../lib/compat";
import { expect } from "chai";
import { theory, typeOnly, type } from "./test-utils";
import { AsyncQuery, fromAsync, AsyncOrderedIterable, AsyncOrderedQuery, AsyncHierarchyIterable, AsyncHierarchyQuery, AsyncOrderedHierarchyQuery, AsyncOrderedHierarchyIterable, OrderedIterable, HierarchyIterable, OrderedHierarchyIterable, HierarchyProvider, AsyncChoice } from "../lib";
import * as users from "./data/users";
import * as nodes from "./data/nodes";
import * as books from "./data/books";
import * as numbers from "./data/numbers";

interface A { kind: "A", a: number }
interface B { kind: "B", b: number }
interface C { kind: "c", c: number }
type ABC = A | B | C;
type AB = A | B;

describe("AsyncQuery", () => {
    describe("new()", () => {
        it("Iterable", () => expect(new AsyncQuery([1, 2, 3])).to.equalSequenceAsync([1, 2, 3]));
        it("ArrayLike", () => expect(new AsyncQuery({ 0: 1, 1: 2, 2: 3, length: 3 })).to.equalSequenceAsync([1, 2, 3]));
        it("AsyncQuery", () => {
            const source: any[] = [];
            const query1 = new AsyncQuery(source);
            const query2 = new AsyncQuery(query1);
            expect(query2["_source"]).to.equal(source);
        });
        theory.throws("throws if 'source' is", (source: any) => new AsyncQuery(source), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, undefined],
            "function": [TypeError, () => {}],
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<number>>(), new AsyncQuery(type<Iterable<number>>()));
            type.exact(type<AsyncQuery<number>>(), new AsyncQuery(type<Iterable<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), new AsyncQuery(type<Iterable<Promise<number> | number>>()));
            type.exact(type<AsyncQuery<number>>(), new AsyncQuery(type<ArrayLike<number>>()));
            type.exact(type<AsyncQuery<number>>(), new AsyncQuery(type<ArrayLike<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), new AsyncQuery(type<ArrayLike<Promise<number> | number>>()));
            type.exact(type<AsyncQuery<number>>(), new AsyncQuery(type<AsyncIterable<number>>()));
            type.exact(type<AsyncQuery<number>>(), new AsyncQuery(type<AsyncIterable<number> | Iterable<Promise<number> | number>>()));
            type.not.exact(type<AsyncQuery<number>>(), new AsyncQuery(type<AsyncIterable<Promise<number>>>()));
        });
    });
    describe("from()", () => {
        it("Iterable", () => expect(AsyncQuery.from([1, 2, 3])).to.equalSequenceAsync([1, 2, 3]));
        it("ArrayLike", () => expect(AsyncQuery.from({ 0: 1, 1: 2, 2: 3, length: 3 })).to.equalSequenceAsync([1, 2, 3]));
        theory.throws("throws if 'source' is", (source: any) => AsyncQuery.from(source), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, undefined],
            "function": [TypeError, () => {}],
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.from(type<Iterable<number>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.from(type<Iterable<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.from(type<Iterable<Promise<number> | number>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.from(type<ArrayLike<number>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.from(type<ArrayLike<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.from(type<ArrayLike<Promise<number> | number>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.from(type<AsyncIterable<number>>()));
            type.exact(type<AsyncOrderedQuery<number>>(), AsyncQuery.from(type<OrderedIterable<number>>()));
            type.exact(type<AsyncOrderedQuery<number>>(), AsyncQuery.from(type<AsyncOrderedIterable<number>>()));
            type.exact(type<AsyncHierarchyQuery<number>>(), AsyncQuery.from(type<Iterable<number>>(), type<HierarchyProvider<number>>()));
            type.exact(type<AsyncHierarchyQuery<number>>(), AsyncQuery.from(type<Iterable<Promise<number>>>(), type<HierarchyProvider<number>>()));
            type.exact(type<AsyncHierarchyQuery<number>>(), AsyncQuery.from(type<Iterable<Promise<number> | number>>(), type<HierarchyProvider<number>>()));
            type.exact(type<AsyncHierarchyQuery<number>>(), AsyncQuery.from(type<ArrayLike<number>>(), type<HierarchyProvider<number>>()));
            type.exact(type<AsyncHierarchyQuery<number>>(), AsyncQuery.from(type<ArrayLike<Promise<number>>>(), type<HierarchyProvider<number>>()));
            type.exact(type<AsyncHierarchyQuery<number>>(), AsyncQuery.from(type<ArrayLike<Promise<number> | number>>(), type<HierarchyProvider<number>>()));
            type.exact(type<AsyncHierarchyQuery<number>>(), AsyncQuery.from(type<AsyncIterable<number>>(), type<HierarchyProvider<number>>()));
            type.exact(type<AsyncOrderedHierarchyQuery<number>>(), AsyncQuery.from(type<OrderedIterable<number>>(), type<HierarchyProvider<number>>()));
            type.exact(type<AsyncOrderedHierarchyQuery<number>>(), AsyncQuery.from(type<AsyncOrderedIterable<number>>(), type<HierarchyProvider<number>>()));
            type.not.exact(type<AsyncQuery<number>>(), AsyncQuery.from(type<AsyncIterable<Promise<number>>>()));
        });
    });
    describe("of()", () => {
        it("no arguments", () => expect(AsyncQuery.of()).to.equalSequenceAsync([]));
        it("multiple arguments", () => expect(AsyncQuery.of(1, 2, 3)).to.equalSequenceAsync([1, 2, 3]));
        typeOnly(() => {
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.of(type<number>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.of(type<Promise<number>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.of(type<Promise<number> | number>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.of(type<Promise<number>>(), type<number>()));
        });
    });
    describe("empty()", () => {
        it("is empty", () => expect(AsyncQuery.empty()).to.equalSequenceAsync([]));
    });
    describe("once()", () => {
        it("is once", () => expect(AsyncQuery.once(1)).to.equalSequenceAsync([1]));
        it("is once (promise)", () => expect(AsyncQuery.once(Promise.resolve(1))).to.equalSequenceAsync([1]));
        typeOnly(() => {
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.once(type<number>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.once(type<Promise<number>>()));
        });
    });
    describe("repeat()", () => {
        it("0 times", () => expect(AsyncQuery.repeat("a", 0)).to.equalSequenceAsync([]));
        it("0 times (promise)", () => expect(AsyncQuery.repeat(Promise.resolve("a"), 0)).to.equalSequenceAsync([]));
        it("5 times", () => expect(AsyncQuery.repeat("a", 5)).to.equalSequenceAsync(["a", "a", "a", "a", "a"]));
        it("5 times (promise)", () => expect(AsyncQuery.repeat(Promise.resolve("a"), 5)).to.equalSequenceAsync(["a", "a", "a", "a", "a"]));
        theory.throws("throws if 'count' is", (count: any) => AsyncQuery.repeat("a", count), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<string>>(), AsyncQuery.repeat(type<string>(), type<number>()));
            type.exact(type<AsyncQuery<string>>(), AsyncQuery.repeat(type<Promise<string>>(), type<number>()));
            type.exact(type<AsyncQuery<string>>(), AsyncQuery.repeat(type<Promise<string> | string>(), type<number>()));
        });
    });
    describe("continuous()", () => {
        it("after 5 elements", () => expect(AsyncQuery.continuous(1)).to.startWithSequenceAsync([1, 1, 1, 1, 1]));
        it("after 5 elements (promise)", () => expect(AsyncQuery.continuous(Promise.resolve(1))).to.startWithSequenceAsync([1, 1, 1, 1, 1]));
        it("after 10 elements", () => expect(AsyncQuery.continuous(1)).to.startWithSequenceAsync([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
        it("after 10 elements (promise)", () => expect(AsyncQuery.continuous(Promise.resolve(1))).to.startWithSequenceAsync([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
        typeOnly(() => {
            type.exact(type<AsyncQuery<string>>(), AsyncQuery.continuous(type<string>()));
            type.exact(type<AsyncQuery<string>>(), AsyncQuery.continuous(type<Promise<string>>()));
            type.exact(type<AsyncQuery<string>>(), AsyncQuery.continuous(type<Promise<string> | string>()));
        });
    });
    describe("generate()", () => {
        it("even numbers", () => expect(AsyncQuery.generate(3, i => i * 2)).to.equalSequenceAsync([0, 2, 4]));
        it("even numbers (async)", () => expect(AsyncQuery.generate(3, i => Promise.resolve(i * 2))).to.equalSequenceAsync([0, 2, 4]));
        theory.throws("throws if 'count' is", (count: any) => AsyncQuery.generate(count, () => {}), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
        theory.throws("throws if 'generator' is", (generator: any) => AsyncQuery.generate(1, generator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<string>>(), AsyncQuery.generate(type<number>(), type<(i: number) => string>()));
            type.exact(type<AsyncQuery<string>>(), AsyncQuery.generate(type<number>(), type<(i: number) => Promise<string>>()));
        });
    });
    describe("hierarchy()", () => {
        theory.throws("throws if 'hierarchy' is", (hierarchy: any) => AsyncQuery.hierarchy({}, hierarchy), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""],
            "non-provider": [TypeError, {}],
        });
        typeOnly(() => {
            type.exact(type<AsyncHierarchyQuery<ABC>>(), AsyncQuery.hierarchy(type<ABC>(), type<HierarchyProvider<ABC>>()));
            type.exact(type<AsyncHierarchyQuery<ABC, A>>(), AsyncQuery.hierarchy(type<A>(), type<HierarchyProvider<ABC>>()));
        });
    });
    describe("consume()", () => {
        it("consumes", async () => {
            const q = AsyncQuery.consume(async function* () { yield 1; } ());
            await expect(q).to.equalSequenceAsync([1]);
            await expect(q).to.equalSequenceAsync([]);
        });
        theory.throws("throws if 'iterator' is", (iterator: any) => AsyncQuery.consume(iterator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""],
            "non-iterator": [TypeError, {}],
        });
    });
    describe("objectKeys()", () => {
        it("gets keys", () => expect(AsyncQuery.objectKeys({ a: 1, b: 2 })).to.equalSequenceAsync(["a", "b"]));
        it("gets keys (promise)", () => expect(AsyncQuery.objectKeys(Promise.resolve({ a: 1, b: 2 }))).to.equalSequenceAsync(["a", "b"]));
        theory.throws("throws if 'source' is", (source: any) => AsyncQuery.objectKeys(source)[Symbol.asyncIterator]().next(), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<"a" | "b">>(), AsyncQuery.objectKeys(type<{ a: 1, b: 2 }>()));
            type.exact(type<AsyncQuery<"a" | "b">>(), AsyncQuery.objectKeys(type<Promise<{ a: 1, b: 2 }>>()));
        });
    });
    describe("objectValues()", () => {
        it("gets values", () => expect(AsyncQuery.objectValues({ a: 1, b: 2 })).to.equalSequenceAsync([1, 2]));
        theory.throws("throws if 'source' is", (source: any) => AsyncQuery.objectValues(source)[Symbol.asyncIterator]().next(), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<1 | 2>>(), AsyncQuery.objectValues(type<{ a: 1, b: 2 }>()));
            type.exact(type<AsyncQuery<1 | 2>>(), AsyncQuery.objectValues(type<Promise<{ a: 1, b: 2 }>>()));
        });
    });
    describe("objectEntries()", () => {
        it("gets keys", async () => expect(await AsyncQuery.objectEntries({ a: 1, b: 2 }).toArray()).to.deep.equal([["a", 1], ["b", 2]]));
        theory.throws("throws if 'source' is", (source: any) => AsyncQuery.objectEntries(source)[Symbol.asyncIterator]().next(), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<["a", 1] | ["b", 2]>>(), AsyncQuery.objectEntries(type<{ a: 1, b: 2 }>()));
            type.exact(type<AsyncQuery<["a", 1] | ["b", 2]>>(), AsyncQuery.objectEntries(type<Promise<{ a: 1, b: 2 }>>()));
        });
    });
    describe("if()", () => {
        it("when true", () => expect(AsyncQuery.if(() => true, [1, 2], [3, 4])).to.equalSequenceAsync([1, 2]));
        it("when false", () => expect(AsyncQuery.if(() => false, [1, 2], [3, 4])).to.equalSequenceAsync([3, 4]));
        theory.throws("throws if 'condition' is", (condition: any) => AsyncQuery.if(condition, [], []), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'thenQueryable' is", (thenQueryable: any) => AsyncQuery.if(() => true, thenQueryable, []), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elseQueryable' is", (elseQueryable: any) => AsyncQuery.if(() => true, [], elseQueryable), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.if(type<() => boolean>(), type<Iterable<number>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.if(type<() => boolean>(), type<Iterable<number>>(), type<Iterable<number>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.if(type<() => boolean>(), type<Iterable<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.if(type<() => boolean>(), type<Iterable<Promise<number>>>(), type<Iterable<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.if(type<() => boolean>(), type<AsyncIterable<number>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.if(type<() => boolean>(), type<AsyncIterable<number>>(), type<AsyncIterable<number>>()));
        });
    });
    describe("choose()", () => {
        it("choice 1", () => expect(AsyncQuery.choose(() => 1, [[1, [1, 2]], [2, [3, 4]]])).to.equalSequenceAsync([1, 2]));
        it("choice 2", () => expect(AsyncQuery.choose(() => 2, [[1, [1, 2]], [2, [3, 4]]])).to.equalSequenceAsync([3, 4]));
        it("otherwise", () => expect(AsyncQuery.choose(() => 3, [[1, [1, 2]], [2, [3, 4]]], [5, 6])).to.equalSequenceAsync([5, 6]));
        it("no match", () => expect(AsyncQuery.choose(() => 3, [[1, [1, 2]], [2, [3, 4]]])).to.equalSequenceAsync([]));
        theory.throws("throws if 'chooser' is", (chooser: any) => AsyncQuery.choose(chooser, [], []), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'choices' is", (choices: any) => AsyncQuery.choose(() => 0, choices, []), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-queryable": [TypeError, 0]
        });
        theory.throws("throws if 'otherwise' is", (otherwise: any) => AsyncQuery.choose(() => 0, [], otherwise), {
            "null": [TypeError, null],
            "non-queryable": [TypeError, 0]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.choose(type<() => number>(), type<Iterable<[number, Iterable<number>]>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.choose(type<() => number>(), type<Iterable<[number, Iterable<number>]>>(), type<Iterable<number>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.choose(type<() => number>(), type<Iterable<[Promise<number>, Iterable<Promise<number>>]>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.choose(type<() => number>(), type<Iterable<[Promise<number>, Iterable<Promise<number>>]>>(), type<Iterable<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.choose(type<() => number>(), type<ArrayLike<[number, ArrayLike<number>]>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.choose(type<() => number>(), type<ArrayLike<[number, ArrayLike<number>]>>(), type<ArrayLike<number>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.choose(type<() => number>(), type<ArrayLike<[Promise<number>, ArrayLike<Promise<number>>]>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.choose(type<() => number>(), type<ArrayLike<[Promise<number>, ArrayLike<Promise<number>>]>>(), type<ArrayLike<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.choose(type<() => number>(), type<AsyncIterable<[number, AsyncIterable<number>]>>()));
            type.exact(type<AsyncQuery<number>>(), AsyncQuery.choose(type<() => number>(), type<AsyncIterable<[number, AsyncIterable<number>]>>(), type<AsyncIterable<number>>()));
        });
    });
    describe("filter()", () => {
        it("filters", () => expect(AsyncQuery.from([1, 2, 3]).filter(x => x >= 2)).to.equalSequenceAsync([2, 3]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).filter(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<A>>(), type<AsyncQuery<AB>>().filter(type<(ab: AB) => ab is A>()));
            type.exact(type<AsyncQuery<AB>>(), type<AsyncQuery<AB>>().filter(type<(ab: AB) => boolean>()));
        });
    });
    describe("where()", () => {
        it("filters", () => expect(AsyncQuery.from([1, 2, 3]).where(x => x >= 2)).to.equalSequenceAsync([2, 3]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).where(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<A>>(), type<AsyncQuery<AB>>().where(type<(ab: AB) => ab is A>()));
            type.exact(type<AsyncQuery<AB>>(), type<AsyncQuery<AB>>().where(type<(ab: AB) => boolean>()));
        });
    });
    describe("map()", () => {
        it("maps", () => expect(AsyncQuery.from([1, 2, 3]).map(x => x * 2)).to.equalSequenceAsync([2, 4, 6]));
        theory.throws("throws if 'selector' is", (selector: any) => AsyncQuery.from([]).map(selector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("select()", () => {
        it("maps", () => expect(AsyncQuery.from([1, 2, 3]).select(x => x * 2)).to.equalSequenceAsync([2, 4, 6]));
        theory.throws("throws if 'selector' is", (selector: any) => AsyncQuery.from([]).select(selector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("flatMap()", () => {
        it("flatMaps", () => expect(AsyncQuery.from([1, 2, 3]).flatMap(x => [x, 0])).to.equalSequenceAsync([1, 0, 2, 0, 3, 0]));
        theory.throws("throws if 'projection' is", (projection: any) => AsyncQuery.from([]).flatMap(projection), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<number>>(), type<AsyncQuery<number>>().flatMap(type<(_: number) => Iterable<number>>()));
            type.exact(type<AsyncQuery<number>>(), type<AsyncQuery<number>>().flatMap(type<(_: number) => Iterable<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), type<AsyncQuery<number>>().flatMap(type<(_: number) => ArrayLike<number>>()));
            type.exact(type<AsyncQuery<number>>(), type<AsyncQuery<number>>().flatMap(type<(_: number) => ArrayLike<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), type<AsyncQuery<number>>().flatMap(type<(_: number) => AsyncIterable<number>>()));
        });
    });
    describe("selectMany()", () => {
        it("flatMaps", () => expect(AsyncQuery.from([1, 2, 3]).selectMany(x => [x, 0])).to.equalSequenceAsync([1, 0, 2, 0, 3, 0]));
        theory.throws("throws if 'projection' is", (projection: any) => AsyncQuery.from([]).selectMany(projection), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<number>>(), type<AsyncQuery<number>>().selectMany(type<(_: number) => Iterable<number>>()));
            type.exact(type<AsyncQuery<number>>(), type<AsyncQuery<number>>().selectMany(type<(_: number) => Iterable<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), type<AsyncQuery<number>>().selectMany(type<(_: number) => ArrayLike<number>>()));
            type.exact(type<AsyncQuery<number>>(), type<AsyncQuery<number>>().selectMany(type<(_: number) => ArrayLike<Promise<number>>>()));
            type.exact(type<AsyncQuery<number>>(), type<AsyncQuery<number>>().selectMany(type<(_: number) => AsyncIterable<number>>()));
        });
    });
    describe("do()", () => {
        it("does", async () => {
            const received: number[] = [];
            const result = await AsyncQuery.from([1, 2, 3, 4]).do(v => received.push(v));
            await expect(result).to.equalSequenceAsync([1, 2, 3, 4]);
            expect(received).to.deep.equal([1, 2, 3, 4]);
        });
        theory.throws("throws if 'callback' is", (callback: any) => AsyncQuery.from([]).do(callback), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("tap()", () => {
        it("taps", async () => {
            const received: number[] = [];
            const result = AsyncQuery.from([1, 2, 3, 4]).tap(v => received.push(v));
            await expect(result).to.equalSequenceAsync([1, 2, 3, 4]);
            expect(received).to.deep.equal([1, 2, 3, 4]);
        });
        theory.throws("throws if 'callback' is", (callback: any) => AsyncQuery.from([]).do(callback), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("expand()", () => {
        it("expands", () => expect(AsyncQuery.from([nodes.nodeA]).expand(x => x.children || [])).to.equalSequenceAsync([nodes.nodeA, nodes.nodeAA, nodes.nodeAB, nodes.nodeAC, nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC, nodes.nodeACA, nodes.nodeAAAA]));
        theory.throws("throws if 'projection' is", (projection: any) => AsyncQuery.from([]).expand(projection), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("reverse()", () => {
        it("reverses", () => expect(AsyncQuery.from([1, 2, 3]).reverse()).to.equalSequenceAsync([3, 2, 1]));
    });
    describe("skip()", () => {
        it("skips", () => expect(AsyncQuery.from([1, 2, 3]).skip(1)).to.equalSequenceAsync([2, 3]));
        it("skip none", () => expect(AsyncQuery.from([1, 2, 3]).skip(0)).to.equalSequenceAsync([1, 2, 3]));
        theory.throws("throws if 'count' is", (count: any) => AsyncQuery.from([]).skip(count), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
    });
    describe("skipRight()", () => {
        it("skips right", () => expect(AsyncQuery.from([1, 2, 3]).skipRight(1)).to.equalSequenceAsync([1, 2]));
        it("skips right none", () => expect(AsyncQuery.from([1, 2, 3]).skipRight(0)).to.equalSequenceAsync([1, 2, 3]));
        theory.throws("throws if 'count' is", (count: any) => AsyncQuery.from([]).skipRight(count), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
    });
    describe("skipWhile()", () => {
        it("skips while", () => expect(AsyncQuery.from([1, 2, 1, 3]).skipWhile(x => x < 2)).to.equalSequenceAsync([2, 1, 3]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).skipWhile(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("take()", () => {
        it("takes", () => expect(AsyncQuery.from([1, 2, 3]).take(2)).to.equalSequenceAsync([1, 2]));
        it("takes none", () => expect(AsyncQuery.from([1, 2, 3]).take(0)).to.equalSequenceAsync([]));
        theory.throws("throws if 'count' is", (count: any) => AsyncQuery.from([]).take(count), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
    });
    describe("takeRight()", () => {
        it("takes right", () => expect(AsyncQuery.from([1, 2, 3]).takeRight(2)).to.equalSequenceAsync([2, 3]));
        it("takes right none", () => expect(AsyncQuery.from([1, 2, 3]).takeRight(0)).to.equalSequenceAsync([]));
        theory.throws("throws if 'count' is", (count: any) => AsyncQuery.from([]).takeRight(count), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
    });
    describe("takeWhile()", () => {
        it("takes while", () => expect(AsyncQuery.from([1, 2, 3, 1]).takeWhile(x => x < 3)).to.equalSequenceAsync([1, 2]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).takeWhile(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<A>>(), type<AsyncQuery<AB>>().takeWhile(type<(ab: AB) => ab is A>()));
            type.exact(type<AsyncQuery<AB>>(), type<AsyncQuery<AB>>().takeWhile(type<(ab: AB) => boolean>()));
        });
    });
    describe("intersect()", () => {
        it("intersects", () => expect(AsyncQuery.from([1, 1, 2, 3, 4]).intersect([1, 3, 3, 5, 7])).to.equalSequenceAsync([1, 3]));
        it("intersects none", () => expect(AsyncQuery.from([1, 1, 2, 3, 4]).intersect([])).to.equalSequenceAsync([]));
        theory.throws("throws if 'other' is", (other: any) => AsyncQuery.from([]).intersect(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<AB>>(), type<AsyncQuery<ABC>>().intersect(type<Iterable<AB>>()));;
            
            type<AsyncQuery<ABC>>().intersect(type<HierarchyIterable<ABC>>());

            type.exact(type<AsyncHierarchyQuery<ABC>>(), type<AsyncQuery<ABC>>().intersect(type<HierarchyIterable<ABC>>()));
            type.exact(type<AsyncHierarchyQuery<ABC, A>>(), type<AsyncQuery<ABC>>().intersect(type<HierarchyIterable<ABC, A>>()));
            type.exact(type<AsyncHierarchyQuery<AB, A>>(), type<AsyncQuery<ABC>>().intersect(type<HierarchyIterable<AB, A>>()));
            type.exact(type<AsyncHierarchyQuery<ABC>>(), type<AsyncQuery<ABC>>().intersect(type<AsyncHierarchyIterable<ABC>>()));
            type.exact(type<AsyncHierarchyQuery<ABC, A>>(), type<AsyncQuery<ABC>>().intersect(type<AsyncHierarchyIterable<ABC, A>>()));
            type.exact(type<AsyncHierarchyQuery<AB, A>>(), type<AsyncQuery<ABC>>().intersect(type<AsyncHierarchyIterable<AB, A>>()));
        });
    });
    describe("union()", () => {
        it("unions", () => expect(AsyncQuery.from([1, 1, 2, 3, 4]).union([1, 3, 3, 5, 7])).to.equalSequenceAsync([1, 2, 3, 4, 5, 7]));
        theory.throws("throws if 'other' is", (other: any) => AsyncQuery.from([]).union(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        typeOnly(() => {
            type.exact(type<AsyncQuery<ABC>>(), type<AsyncQuery<ABC>>().union(type<Iterable<AB>>()));
            type.exact(type<AsyncQuery<ABC>>(), type<AsyncQuery<ABC>>().union(type<HierarchyIterable<ABC>>()));
            type.exact(type<AsyncQuery<ABC>>(), type<AsyncQuery<ABC>>().union(type<HierarchyIterable<ABC, A>>()));
            type.exact(type<AsyncQuery<ABC>>(), type<AsyncQuery<ABC>>().union(type<AsyncHierarchyIterable<ABC>>()));
            type.exact(type<AsyncQuery<ABC>>(), type<AsyncQuery<ABC>>().union(type<AsyncHierarchyIterable<ABC, A>>()));
        });
    });
    describe("except()", () => {
        it("excepts", () => expect(AsyncQuery.from([1, 1, 2, 3, 4]).except([2, 4])).to.equalSequenceAsync([1, 3]));
        theory.throws("throws if 'other' is", (other: any) => AsyncQuery.from([]).except(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
    });
    describe("concat()", () => {
        it("concats", () => expect(AsyncQuery.from([1, 1, 2, 3, 4]).concat([1, 3, 3, 5, 7])).to.equalSequenceAsync([1, 1, 2, 3, 4, 1, 3, 3, 5, 7]));
        theory.throws("throws if 'other' is", (other: any) => AsyncQuery.from([]).concat(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
    });
    describe("distinct()", () => {
        it("is distinct", () => expect(AsyncQuery.from([1, 1, 2, 3, 4]).distinct()).to.equalSequenceAsync([1, 2, 3, 4]));
    });
    describe("append()", () => {
        it("appends", () => expect(AsyncQuery.from([1, 2, 3]).append(5)).to.equalSequenceAsync([1, 2, 3, 5]));
    });
    describe("prepend()", () => {
        it("prepends", () => expect(AsyncQuery.from([1, 2, 3]).prepend(5)).to.equalSequenceAsync([5, 1, 2, 3]));
    });
    describe("patch()", () => {
        const data: [number, number, number[], number[]][] = [
            [0, 0, [9, 8, 7], [9, 8, 7, 1, 2, 3]],
            [0, 2, [9, 8, 7], [9, 8, 7, 3]],
            [2, 0, [9, 8, 7], [1, 2, 9, 8, 7, 3]],
            [5, 0, [9, 8, 7], [1, 2, 3, 9, 8, 7]],
            [2, 1, [9, 8, 7], [1, 2, 9, 8, 7]],
            [2, 3, [9, 8, 7], [1, 2, 9, 8, 7]]
        ];
        theory("patches", data, (start, skip, range, actual) => expect(AsyncQuery.from([1, 2, 3]).patch(start, skip, range)).to.equalSequenceAsync(actual));
        theory.throws("throws if 'start' is", (start: any) => AsyncQuery.from([]).patch(start, 0, []), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
        theory.throws("throws if 'skipCount' is", (skipCount: any) => AsyncQuery.from([]).patch(0, skipCount, []), {
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
        theory.throws("throws if 'range' is", (range: any) => AsyncQuery.from([]).patch(0, 0, range), {
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
    });
    describe("defaultIfEmpty()", () => {
        it("not empty", () => expect(AsyncQuery.from([1, 2, 3]).defaultIfEmpty(9)).to.equalSequenceAsync([1, 2, 3]));
        it("empty", () => expect(AsyncQuery.from([]).defaultIfEmpty(9)).to.equalSequenceAsync([9]));
    });
    describe("pageBy()", () => {
        it("pages with partial last page", async () => expect(await AsyncQuery.from([1, 2, 3]).pageBy(2).map(x => Array.from(x)).toArray()).to.deep.equal([[1, 2], [3]]));
        it("pages exact", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).pageBy(2).map(x => Array.from(x)).toArray()).to.deep.equal([[1, 2], [3, 4]]));
        theory.throws("throws if 'pageSize' is", (pageSize: any) => AsyncQuery.from([]).pageBy(pageSize), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "0": [RangeError, 0],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
    });
    describe("zip()", () => {
        const data: [number[], string[], [number, string][]][] = [
            [[1, 2, 3], ["a", "b", "c"], [[1, "a"], [2, "b"], [3, "c"]]],
            [[1, 2], ["a", "b", "c"], [[1, "a"], [2, "b"]]],
            [[1, 2, 3], ["a", "b"], [[1, "a"], [2, "b"]]],
        ];
        theory("zips", data, async (left, right, expected) => expect(await AsyncQuery.from(left).zip(right).toArray()).to.deep.equal(expected));
        theory.throws("throws if 'right' is", (right: any) => AsyncQuery.from([]).zip(right), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'selector' is", (selector: any) => AsyncQuery.from([]).zip([], selector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("orderBy()", () => {
        it("orders", () => expect(AsyncQuery.from([3, 1, 2]).orderBy(x => x)).to.equalSequenceAsync([1, 2, 3]));
        it("orders same", async() => {
            const q = await AsyncQuery.from(books.books_same).orderBy(x => x.title).toArray();
            expect(q[0]).to.equal(books.bookB2);
            expect(q[1]).to.equal(books.bookB2_same);
        });
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([]).orderBy(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => AsyncQuery.from([]).orderBy(x => x, comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("orderByDescending()", () => {
        it("orders", () => expect(AsyncQuery.from([3, 1, 2]).orderByDescending(x => x)).to.equalSequenceAsync([3, 2, 1]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([]).orderByDescending(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => AsyncQuery.from([]).orderByDescending(x => x, comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("spanMap()", () => {
        it("odd/even spans", async () => expect(await AsyncQuery.from([1, 3, 2, 4, 5, 7]).spanMap(k => k % 2 === 1).map(g => Array.from(g)).toArray()).to.deep.equal([[1, 3], [2, 4], [5, 7]]));
        it("empty", () => expect(AsyncQuery.from([]).spanMap(k => k % 2 === 1)).to.equalSequenceAsync([]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([]).spanMap(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => AsyncQuery.from([]).spanMap(x => x, elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'spanSelector' is", (spanSelector: any) => AsyncQuery.from([]).spanMap(x => x, x => x, spanSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("groupBy()", () => {
        it("group by role", async () => expect(await AsyncQuery.from(users.users).groupBy(u => u.role, u => u.name, (role, names) => ({ role: role, names: names.toArray() })).toArray())
            .to.deep.equal([
                { role: "admin", names: ["alice"] },
                { role: "user", names: ["bob", "dave"] }
            ]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([]).groupBy(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => AsyncQuery.from([]).groupBy(x => x, elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'resultSelector' is", (resultSelector: any) => AsyncQuery.from([]).groupBy(x => x, x => x, resultSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        it("group by symbol", async () => {
            const sym = Symbol();
            const data = [
                { category: "a", value: 1 },
                { category: "a", value: 2 },
                { category: "a", value: 3 },
                { category: sym, value: 4 }
            ];
            expect(await AsyncQuery.from(data).groupBy(row => row.category, row => row.value, (category, values) => ({ category, values: values.toArray() })).toArray())
                .to.deep.equal([
                    { category: "a", values: [1, 2, 3] },
                    { category: sym, values: [4] }
                ]);
        });
    });
    describe("groupJoin()", () => {
        it("joins groups", async () => expect(await AsyncQuery.from(users.roles).groupJoin(users.users, g => g.name, u => u.role, (role, users) => ({ role: role, users: users.toArray() })).toArray())
            .to.deep.equal([
                { role: users.adminRole, users: [users.aliceUser] },
                { role: users.userRole, users: [users.bobUser, users.daveUser] },
                { role: users.guestRole, users: [] }
            ]));
        theory.throws("throws if 'inner' is", (inner: any) => AsyncQuery.from([]).groupJoin(inner, x => x, x => x, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'outerKeySelector' is", (outerKeySelector: any) => AsyncQuery.from([]).groupJoin([], outerKeySelector, x => x, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'innerKeySelector' is", (innerKeySelector: any) => AsyncQuery.from([]).groupJoin([], x => x, innerKeySelector, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'resultSelector' is", (resultSelector: any) => AsyncQuery.from([]).groupJoin([], x => x, x => x, resultSelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("join()", () => {
        it("joins", async() => expect(await AsyncQuery.from(users.roles).join(users.users, g => g.name, u => u.role, (role, user) => ({ role: role, user: user })).toArray())
            .to.deep.equal([
                { role: users.adminRole, user: users.aliceUser },
                { role: users.userRole, user: users.bobUser },
                { role: users.userRole, user: users.daveUser }
            ]));
        theory.throws("throws if 'inner' is", (inner: any) => AsyncQuery.from([]).join(inner, x => x, x => x, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'outerKeySelector' is", (outerKeySelector: any) => AsyncQuery.from([]).join([], outerKeySelector, x => x, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'innerKeySelector' is", (innerKeySelector: any) => AsyncQuery.from([]).join([], x => x, innerKeySelector, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'resultSelector' is", (resultSelector: any) => AsyncQuery.from([]).join([], x => x, x => x, resultSelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("scan()", () => {
        it("scans sums", () => expect(AsyncQuery.from([1, 2, 3]).scan((c, e) => c + e, 0)).to.equalSequenceAsync([1, 3, 6]));
        it("scans sums no seed", () => expect(AsyncQuery.from([1, 2, 3]).scan((c, e) => c + e)).to.equalSequenceAsync([3, 6]));
        theory.throws("throws if 'accumulator' is", (accumulator: any) => AsyncQuery.from([]).scan(accumulator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("scanRight()", () => {
        it("scans sums from right", () => expect(AsyncQuery.from([1, 2, 3]).scanRight((c, e) => c + e, 0)).to.equalSequenceAsync([3, 5, 6]));
        it("scans sums from right no seed", () => expect(AsyncQuery.from([1, 2, 3]).scanRight((c, e) => c + e)).to.equalSequenceAsync([5, 6]));
        theory.throws("throws if 'accumulator' is", (accumulator: any) => AsyncQuery.from([]).scanRight(accumulator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("reduce()", () => {
        it("reduces sum", async () => expect(await AsyncQuery.from([1, 2, 3]).reduce((c, e) => c + e)).to.equal(6));
        it("reduces average", async () => expect(await AsyncQuery.from([1, 2, 3]).reduce((c, e) => c + e, 0, (r, c) => r / c)).to.equal(2));
        theory.throws("throws if 'accumulator' is", (accumulator: any) => AsyncQuery.from([]).reduce(accumulator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'resultSelector' is", (resultSelector: any) => AsyncQuery.from([]).reduce(x => x, undefined, resultSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("reduceRight()", () => {
        it("reduces sum", async () => expect(await AsyncQuery.from([1, 2, 3]).reduceRight((c, e) => c + e)).to.equal(6));
        it("reduces average", async () => expect(await AsyncQuery.from([1, 2, 3]).reduceRight((c, e) => c + e, 0, (r, c) => r / c)).to.equal(2));
        theory.throws("throws if 'accumulator' is", (accumulator: any) => AsyncQuery.from([]).reduceRight(accumulator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'resultSelector' is", (resultSelector: any) => AsyncQuery.from([]).reduceRight(x => x, undefined, resultSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("count()", () => {
        it("counts array", async () => expect(await AsyncQuery.from([1, 2, 3]).count()).to.equal(3));
        it("counts set", async () => expect(await AsyncQuery.from(new Set([1, 2, 3])).count()).to.equal(3));
        it("counts map", async () => expect(await AsyncQuery.from(new Set([1, 2, 3])).count()).to.equal(3));
        // it("counts range", async () => expect(await AsyncQuery.range(1, 3).count()).to.equal(3));
        it("counts odds", async () => expect(await AsyncQuery.from([1, 2, 3]).count(x => x % 2 === 1)).to.equal(2));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).count(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("first()", () => {
        it("finds first", async () => expect(await AsyncQuery.from([1, 2, 3]).first()).to.equal(1));
        it("finds first even", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).first(x => x % 2 === 0)).to.equal(2));
        it("finds undefined when empty", async() => expect(await AsyncQuery.from([]).first()).to.be.undefined);
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).first(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("last()", () => {
        it("finds last", async () => expect(await AsyncQuery.from([1, 2, 3]).last()).to.equal(3));
        it("finds last odd", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).last(x => x % 2 === 1)).to.equal(3));
        it("finds undefined when empty", async () => expect(await AsyncQuery.from([]).last()).to.be.undefined);
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).last(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("single()", () => {
        it("finds single", async () => expect(await AsyncQuery.from([1]).single()).to.equal(1));
        it("finds undefined when many", async () => expect(await AsyncQuery.from([1, 2, 3]).single()).to.be.undefined);
        it("finds undefined when empty", async () => expect(await AsyncQuery.from([]).single()).to.be.undefined);
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).single(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("min()", () => {
        it("finds minimum", async () => expect(await AsyncQuery.from([5, 6, 3, 9, 4]).min()).to.equal(3));
        it("finds undefined when empty", async () => expect(await AsyncQuery.from([]).min()).to.be.undefined);
        theory.throws("throws if 'comparison' is", (comparison: any) => AsyncQuery.from([]).min(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("max()", () => {
        it("finds maximum", async () => expect(await AsyncQuery.from([5, 6, 3, 9, 4]).max()).to.equal(9));
        it("finds undefined when empty", async () => expect(await AsyncQuery.from([]).max()).to.be.undefined);
        theory.throws("throws if 'comparison' is", (comparison: any) => AsyncQuery.from([]).max(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("some()", () => {
        it("false when empty", async () => expect(await AsyncQuery.from([]).some()).to.be.false);
        it("true when one or more", async () => expect(await AsyncQuery.from([1]).some()).to.be.true);
        it("false when no match", async () => expect(await AsyncQuery.from([1, 3]).some(x => x === 2)).to.be.false);
        it("true when matched", async () => expect(await AsyncQuery.from([1, 3]).some(x => x === 3)).to.be.true);
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).some(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("every()", () => {
        it("false when empty", async () => expect(await AsyncQuery.from([]).every(x => x % 2 === 1)).to.be.false);
        it("false when no match", async () => expect(await AsyncQuery.from([2, 4]).every(x => x % 2 === 1)).to.be.false);
        it("false when partial match", async () => expect(await AsyncQuery.from([1, 2]).every(x => x % 2 === 1)).to.be.false);
        it("true when fully matched", async () => expect(await AsyncQuery.from([1, 3]).every(x => x % 2 === 1)).to.be.true);
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).every(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("corresponds()", () => {
        it("true when both match", async () => expect(await AsyncQuery.from([1, 2, 3]).corresponds([1, 2, 3])).to.be.true);
        it("false when source has fewer elements", async () => expect(await AsyncQuery.from([1, 2]).corresponds([1, 2, 3])).to.be.false);
        it("false when other has fewer elements", async () => expect(await AsyncQuery.from([1, 2, 3]).corresponds([1, 2])).to.be.false);
        it("false when other has elements in different order", async () => expect(await AsyncQuery.from([1, 2, 3]).corresponds([1, 3, 2])).to.be.false);
        it("false when other has different elements", async () => expect(await AsyncQuery.from([1, 2, 3]).corresponds([1, 2, 4])).to.be.false);
        theory.throws("throws if 'other' is", (other: any) => AsyncQuery.from([]).corresponds(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'equalityComparison' is", (equalityComparison: any) => AsyncQuery.from([]).corresponds([], equalityComparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("includes()", () => {
        it("true when present", async () => expect(await AsyncQuery.from([1, 2, 3]).includes(2)).to.be.true);
        it("false when missing", async () => expect(await AsyncQuery.from([1, 2, 3]).includes(4)).to.be.false);
        it("false when empty", async () => expect(await AsyncQuery.from([]).includes(4)).to.be.false);
    });
    describe("includesSequence()", () => {
        it("true when included", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).includesSequence([2, 3])).to.be.true);
        it("false when wrong order", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).includesSequence([3, 2])).to.be.false);
        it("false when not present", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).includesSequence([5, 6])).to.be.false);
        it("false when source empty", async () => expect(await AsyncQuery.from([]).includesSequence([1, 2])).to.be.false);
        it("true when other empty", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).includesSequence([])).to.be.true);
        theory.throws("throws if 'other' is", (other: any) => AsyncQuery.from([]).includesSequence(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'equalityComparison' is", (equalityComparison: any) => AsyncQuery.from([]).includesSequence([], equalityComparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("startsWith()", () => {
        it("true when starts with other", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).startsWith([1, 2])).to.be.true);
        it("false when not at start", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).startsWith([2, 3])).to.be.false);
        it("false when wrong order", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).startsWith([2, 1])).to.be.false);
        it("false when not present", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).startsWith([5, 6])).to.be.false);
        it("false when source empty", async () => expect(await AsyncQuery.from([]).startsWith([1, 2])).to.be.false);
        it("true when other empty", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).startsWith([])).to.be.true);
        theory.throws("throws if 'other' is", (other: any) => AsyncQuery.from([]).startsWith(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'equalityComparison' is", (equalityComparison: any) => AsyncQuery.from([]).startsWith([], equalityComparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("endsWith()", () => {
        it("true when ends with other", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).endsWith([3, 4])).to.be.true);
        it("false when not at end", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).endsWith([2, 3])).to.be.false);
        it("false when wrong order", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).endsWith([4, 3])).to.be.false);
        it("false when not present", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).endsWith([5, 6])).to.be.false);
        it("false when source empty", async () => expect(await AsyncQuery.from([]).endsWith([1, 2])).to.be.false);
        it("true when other empty", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).endsWith([])).to.be.true);
        theory.throws("throws if 'other' is", (other: any) => AsyncQuery.from([]).endsWith(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'equalityComparison' is", (equalityComparison: any) => AsyncQuery.from([]).endsWith([], equalityComparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("elementAt()", () => {
        it("at offset 0", async () => expect(await AsyncQuery.from([1, 2, 3]).elementAt(0)).to.equal(1));
        it("at offset 1", async () => expect(await AsyncQuery.from([1, 2, 3]).elementAt(1)).to.equal(2));
        it("at offset -1", async () => expect(await AsyncQuery.from([1, 2, 3]).elementAt(-1)).to.equal(3));
        it("at offset -2", async () => expect(await AsyncQuery.from([1, 2, 3]).elementAt(-2)).to.equal(2));
        it("at offset greater than size", async () => expect(await AsyncQuery.from([1, 2, 3]).elementAt(3)).to.be.undefined);
        it("at negative offset greater than size", async () => expect(await AsyncQuery.from([1, 2, 3]).elementAt(-4)).to.be.undefined);
        theory.throws("throws if 'offset' is", (offset: any) => AsyncQuery.from([]).elementAt(offset), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "float": [TypeError, 1.5],
            "NaN": [TypeError, NaN],
            "Infinity": [TypeError, Infinity]
        });
    });
    describe("span()", () => {
        it("gets initial span", async () => expect(await Promise.all((await AsyncQuery.from([1, 2, 3, 4]).span(x => x < 3)).map(x => x.toArray()))).to.deep.equal([[1, 2], [3, 4]]));
        it("gets whole source", async () => expect(await Promise.all((await AsyncQuery.from([1, 2, 3, 4]).span(x => x < 5)).map(x => x.toArray()))).to.deep.equal([[1, 2, 3, 4], []]));
        it("gets no initial span", async () => expect(await Promise.all((await AsyncQuery.from([1, 2, 3, 4]).span(x => x < 1)).map(x => x.toArray()))).to.deep.equal([[], [1, 2, 3, 4]]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).span(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("break()", () => {
        it("gets initial span", async () => expect(await Promise.all((await AsyncQuery.from([1, 2, 3, 4]).break(x => x > 2)).map(x => x.toArray()))).to.deep.equal([[1, 2], [3, 4]]));
        it("gets whole source", async () => expect(await Promise.all((await AsyncQuery.from([1, 2, 3, 4]).break(x => x > 4)).map(x => x.toArray()))).to.deep.equal([[1, 2, 3, 4], []]));
        it("gets no initial span", async () => expect(await Promise.all((await AsyncQuery.from([1, 2, 3, 4]).break(x => x > 0)).map(x => x.toArray()))).to.deep.equal([[], [1, 2, 3, 4]]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([]).break(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("forEach()", () => {
        it("called for each item", async () => {
            const received: number[] = [];
            await AsyncQuery.from([1, 2, 3, 4]).forEach(v => received.push(v));
            expect(received).to.deep.equal([1, 2, 3, 4]);
        });

        // node's for..of does not call return :/
        it("close iterator on error", async () => {
            let returnWasCalled = false;
            const iterator: IterableIterator<number> = {
                [Symbol.iterator]() { return this; },
                next() { return { value: 1, done: false } },
                return() { returnWasCalled = true; return { value: undefined, done: true } }
            };
            const error = new Error();
            let caught: { error: any } | undefined;
            try {
                await AsyncQuery.from(iterator).forEach(() => { throw error; });
            }
            catch (e) {
                caught = { error: e };
            }
            expect(() => { if (caught) throw caught.error }).to.throw(error);
            expect(returnWasCalled).to.be.true;
        });

        theory.throws("throws if 'callback' is", (callback: any) => AsyncQuery.from([]).forEach(callback), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("drain()", () => {
        it("drains", async () => {
            const received: number[] = [];
            await AsyncQuery.from([1, 2, 3, 4]).do(x => received.push(x)).drain();
            expect(received).to.deep.equal([1, 2, 3, 4]);
        });
    });
    describe("toHierarchy()", () => {
        theory.throws("throws if 'hierarchy' is", (hierarchy: any) => AsyncQuery.from([]).toHierarchy(hierarchy), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""],
            "wrong shape": [TypeError, {}]
        });
    });
    describe("toArray()", () => {
        it("creates array", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).toArray()).to.deep.equal([1, 2, 3, 4]));
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => AsyncQuery.from([]).toArray(elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("toSet()", () => {
        it("creates with right size", async () => expect((await AsyncQuery.from([1, 2, 3, 4]).toSet()).size).to.be.equal(4));
        it("creates set in order", async () => expect(await AsyncQuery.from([1, 2, 3, 4]).toSet()).to.be.equalSequence([1, 2, 3, 4]));
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => AsyncQuery.from([]).toSet(elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("toMap()", () => {
        it("creates with right size", async () => expect((await AsyncQuery.from([1, 2, 3, 4]).toMap(x => x)).size).to.be.equal(4));
        it("creates with correct keys", async() => expect((await AsyncQuery.from([1, 2, 3, 4]).toMap(x => x * 2)).get(2)).to.be.equal(1));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([]).toMap(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => AsyncQuery.from([]).toMap(x => x, elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("toLookup()", () => {
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([]).toLookup(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => AsyncQuery.from([]).toLookup(x => x, elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("toObject()", () => {
        it("creates object with prototype", async () => {
            const proto = {};
            const obj: any = await AsyncQuery.from(["a", "b"]).toObject(proto, x => x);
            expect(obj).to.haveOwnProperty("a");
            expect(obj).to.haveOwnProperty("b");
            expect(obj.a).to.equal("a");
            expect(Object.getPrototypeOf(obj)).to.equal(proto);
        });
        it("creates object with null prototype", async () => {
            const obj: any = await AsyncQuery.from(["a", "b"]).toObject(null, x => x);
            expect(obj.a).to.equal("a");
            expect(Object.getPrototypeOf(obj)).to.equal(null);
        });
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([]).toObject({}, keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => AsyncQuery.from([]).toObject({}, String, elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("filterDefined()", () => {
        it("filterDefined()", async () => expect(await AsyncQuery.from([1, undefined, 2]).filterDefined().toArray()).to.deep.equal([1, 2]));
    });
    describe("whereDefined()", () => {
        it("whereDefined()", async () => expect(await AsyncQuery.from([1, undefined, 2]).whereDefined().toArray()).to.deep.equal([1, 2]));
    });
    describe("unzip()", () => {
        it("unzips", async () => expect(await AsyncQuery.from([[1, "a"], [2, "b"]] as [number, string][]).unzip()).to.deep.equal([[1, 2], ["a", "b"]]));
    });
});
describe("AsyncOrderedQuery", () => {
    describe("thenBy()", () => {
        it("preserves preceding order", () => expect(AsyncQuery.from(books.books).orderBy(x => x.title).thenBy(x => x.id)).to.equalSequenceAsync([books.bookA3, books.bookA4, books.bookB1, books.bookB2]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([]).orderBy(x => x).thenBy(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => AsyncQuery.from([]).orderBy(x => x).thenBy(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("thenByDescending()", () => {
        it("preserves preceding order", () => expect(AsyncQuery.from(books.books).orderBy(x => x.title).thenByDescending(x => x.id)).to.equalSequenceAsync([books.bookA4, books.bookA3, books.bookB2, books.bookB1]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([]).orderBy(x => x).thenByDescending(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => AsyncQuery.from([]).orderBy(x => x).thenByDescending(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
});
describe("AsyncHierarchyQuery", () => {
    describe("filter()", () => {
        it("filters", () => expect(AsyncQuery.from([1, 2, 3], numbers.numberHierarchy).filter(x => x >= 2)).to.equalSequenceAsync([2, 3]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], numbers.numberHierarchy).filter(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("do()", () => {
        it("does", async () => {
            const received: number[] = [];
            const result = AsyncQuery.from([1, 2, 3, 4], numbers.numberHierarchy).do(v => received.push(v));
            await expect(result).to.equalSequenceAsync([1, 2, 3, 4]);
            expect(received).to.deep.equal([1, 2, 3, 4]);
        });
        theory.throws("throws if 'callback' is", (callback: any) => AsyncQuery.from([], numbers.numberHierarchy).do(callback), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("expand()", () => {
        it("expands", () => expect(AsyncQuery.from([nodes.nodeA], nodes.nodeHierarchy).expand(x => x.children || [])).to.equalSequenceAsync([nodes.nodeA, nodes.nodeAA, nodes.nodeAB, nodes.nodeAC, nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC, nodes.nodeACA, nodes.nodeAAAA]));
        theory.throws("throws if 'projection' is", (projection: any) => AsyncQuery.from([], numbers.numberHierarchy).expand(projection), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("reverse()", () => {
        it("reverses", () => expect(AsyncQuery.from([1, 2, 3], numbers.numberHierarchy).reverse()).to.equalSequenceAsync([3, 2, 1]));
    });
    describe("skip()", () => {
        it("skips", () => expect(AsyncQuery.from([1, 2, 3], numbers.numberHierarchy).skip(1)).to.equalSequenceAsync([2, 3]));
    });
    describe("skipRight()", () => {
        it("skips right", () => expect(AsyncQuery.from([1, 2, 3], numbers.numberHierarchy).skipRight(1)).to.equalSequenceAsync([1, 2]));
    });
    describe("skipWhile()", () => {
        it("skips while", () => expect(AsyncQuery.from([1, 2, 1, 3], numbers.numberHierarchy).skipWhile(x => x < 2)).to.equalSequenceAsync([2, 1, 3]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], numbers.numberHierarchy).skipWhile(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("take()", () => {
        it("takes", () => expect(AsyncQuery.from([1, 2, 3], numbers.numberHierarchy).take(2)).to.equalSequenceAsync([1, 2]));
    });
    describe("takeRight()", () => {
        it("takes right", () => expect(AsyncQuery.from([1, 2, 3], numbers.numberHierarchy).takeRight(2)).to.equalSequenceAsync([2, 3]));
    });
    describe("takeWhile()", () => {
        it("takes while", () => expect(AsyncQuery.from([1, 2, 3, 1], numbers.numberHierarchy).takeWhile(x => x < 3)).to.equalSequenceAsync([1, 2]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], numbers.numberHierarchy).takeWhile(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("intersect()", () => {
        it("intersects", () => expect(AsyncQuery.from([1, 1, 2, 3, 4], numbers.numberHierarchy).intersect([1, 3, 3, 5, 7])).to.equalSequenceAsync([1, 3]));
    });
    describe("union()", () => {
        it("unions", () => expect(AsyncQuery.from([1, 1, 2, 3, 4], numbers.numberHierarchy).union([1, 3, 3, 5, 7])).to.equalSequenceAsync([1, 2, 3, 4, 5, 7]));
    });
    describe("except()", () => {
        it("excepts", () => expect(AsyncQuery.from([1, 1, 2, 3, 4], numbers.numberHierarchy).except([2, 4])).to.equalSequenceAsync([1, 3]));
    });
    describe("concat()", () => {
        it("concats", () => expect(AsyncQuery.from([1, 1, 2, 3, 4], numbers.numberHierarchy).concat([1, 3, 3, 5, 7])).to.equalSequenceAsync([1, 1, 2, 3, 4, 1, 3, 3, 5, 7]));
    });
    describe("distinct()", () => {
        it("is distinct", () => expect(AsyncQuery.from([1, 1, 2, 3, 4], numbers.numberHierarchy).distinct()).to.equalSequenceAsync([1, 2, 3, 4]));
    });
    describe("append()", () => {
        it("appends", () => expect(AsyncQuery.from([1, 2, 3], numbers.numberHierarchy).append(5)).to.equalSequenceAsync([1, 2, 3, 5]));
    });
    describe("prepend()", () => {
        it("prepends", () => expect(AsyncQuery.from([1, 2, 3], numbers.numberHierarchy).prepend(5)).to.equalSequenceAsync([5, 1, 2, 3]));
    });
    describe("patch()", () => {
        const data: [number, number, number[], number[]][] = [
            [0, 0, [9, 8, 7], [9, 8, 7, 1, 2, 3]],
            [0, 2, [9, 8, 7], [9, 8, 7, 3]],
            [2, 0, [9, 8, 7], [1, 2, 9, 8, 7, 3]],
            [5, 0, [9, 8, 7], [1, 2, 3, 9, 8, 7]],
            [2, 1, [9, 8, 7], [1, 2, 9, 8, 7]],
            [2, 3, [9, 8, 7], [1, 2, 9, 8, 7]]
        ];
        theory("patches", data, (start, skip, range, actual) => expect(AsyncQuery.from([1, 2, 3], numbers.numberHierarchy).patch(start, skip, range)).to.equalSequenceAsync(actual));
    });
    describe("defaultIfEmpty()", () => {
        it("not empty", () => expect(AsyncQuery.from([1, 2, 3], numbers.numberHierarchy).defaultIfEmpty(9)).to.equalSequenceAsync([1, 2, 3]));
        it("empty", () => expect(AsyncQuery.from([], numbers.numberHierarchy).defaultIfEmpty(9)).to.equalSequenceAsync([9]));
    });
    describe("orderBy()", () => {
        it("orders", () => expect(AsyncQuery.from([3, 1, 2], numbers.numberHierarchy).orderBy(x => x)).to.equalSequenceAsync([1, 2, 3]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([], numbers.numberHierarchy).orderBy(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => AsyncQuery.from([], numbers.numberHierarchy).orderBy(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("orderByDescending()", () => {
        it("orders", () => expect(AsyncQuery.from([3, 1, 2], numbers.numberHierarchy).orderByDescending(x => x)).to.equalSequenceAsync([3, 2, 1]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([], numbers.numberHierarchy).orderByDescending(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => AsyncQuery.from([], numbers.numberHierarchy).orderByDescending(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("root()", () => {
        it("gets root", () => expect(AsyncQuery.from([nodes.nodeAAAA], nodes.nodeHierarchy).root()).to.equalSequenceAsync([nodes.nodeA]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).root()).to.equalSequenceAsync([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).root(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("ancestors()", () => {
        it("gets ancestors", () => expect(AsyncQuery.from([nodes.nodeAAAA], nodes.nodeHierarchy).ancestors()).to.equalSequenceAsync([nodes.nodeAAA, nodes.nodeAA, nodes.nodeA]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).ancestors()).to.equalSequenceAsync([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).ancestors(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("ancestorsAndSelf()", () => {
        it("gets ancestors and self", () => expect(AsyncQuery.from([nodes.nodeAAAA], nodes.nodeHierarchy).ancestorsAndSelf()).to.equalSequenceAsync([nodes.nodeAAAA, nodes.nodeAAA, nodes.nodeAA, nodes.nodeA]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).ancestorsAndSelf()).to.equalSequenceAsync([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).ancestorsAndSelf(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("parents()", () => {
        it("gets parents", () => expect(AsyncQuery.from([nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC], nodes.nodeHierarchy).parents()).to.equalSequenceAsync([nodes.nodeAA, nodes.nodeAA, nodes.nodeAA]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).parents()).to.equalSequenceAsync([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).parents(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("self()", () => {
        it("gets self", () => expect(AsyncQuery.from([nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC], nodes.nodeHierarchy).self()).to.equalSequenceAsync([nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).self()).to.equalSequenceAsync([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).self(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("siblings()", () => {
        it("gets siblings", () => expect(AsyncQuery.from([nodes.nodeAAA], nodes.nodeHierarchy).siblings()).to.equalSequenceAsync([nodes.nodeAAB, nodes.nodeAAC]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).siblings()).to.equalSequenceAsync([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).siblings(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("siblingsAndSelf()", () => {
        it("gets siblings and self", () => expect(AsyncQuery.from([nodes.nodeAAA], nodes.nodeHierarchy).siblingsAndSelf()).to.equalSequenceAsync([nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).siblingsAndSelf()).to.equalSequenceAsync([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).siblingsAndSelf(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("siblingsBeforeSelf()", () => {
        it("gets siblings before self", () => expect(AsyncQuery.from([nodes.nodeAAB], nodes.nodeHierarchy).siblingsBeforeSelf()).to.equalSequenceAsync([nodes.nodeAAA]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).siblingsBeforeSelf()).to.equalSequenceAsync([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).siblingsBeforeSelf(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("siblingsAfterSelf()", () => {
        it("gets siblings after self", () => expect(AsyncQuery.from([nodes.nodeAAB], nodes.nodeHierarchy).siblingsAfterSelf()).to.equalSequenceAsync([nodes.nodeAAC]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).siblingsAfterSelf()).to.equalSequenceAsync([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).siblingsAfterSelf(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("children()", () => {
        it("gets children", () => expect(AsyncQuery.from([nodes.nodeAA, nodes.nodeAB, nodes.nodeAC], nodes.nodeHierarchy).children()).to.equalSequenceAsync([nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC, nodes.nodeACA]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).children()).to.equalSequenceAsync([]));
        it("of undefined children", () => expect(AsyncQuery.from(books.books, books.bookHierarchy).children()).to.equalSequenceAsync([]));
        it("of undefined child", () => expect(AsyncQuery.from([nodes.badNode], nodes.nodeHierarchy).children()).to.equalSequenceAsync([]));
        it("with predicate", () => expect(AsyncQuery.from([nodes.nodeAA], nodes.nodeHierarchy).children(x => x.marker)).to.equalSequenceAsync([nodes.nodeAAB]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).children(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("nthChild()", () => {
        it("gets nthChild(0)", () => expect(AsyncQuery.from([nodes.nodeAA], nodes.nodeHierarchy).nthChild(0)).to.equalSequenceAsync([nodes.nodeAAA]));
        it("gets nthChild(2)", () => expect(AsyncQuery.from([nodes.nodeAA], nodes.nodeHierarchy).nthChild(2)).to.equalSequenceAsync([nodes.nodeAAC]));
        it("gets nthChild(-1)", () => expect(AsyncQuery.from([nodes.nodeAA], nodes.nodeHierarchy).nthChild(-1)).to.equalSequenceAsync([nodes.nodeAAC]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).nthChild(0)).to.equalSequenceAsync([]));
        theory.throws("throws if 'offset' is", (offset: any) => AsyncQuery.from([], nodes.nodeHierarchy).nthChild(offset), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "float": [TypeError, 1.5],
            "NaN": [TypeError, NaN],
            "Infinity": [TypeError, Infinity]
        });
    });
    describe("descendants()", () => {
        it("gets descendants", () => expect(AsyncQuery.from([nodes.nodeAA], nodes.nodeHierarchy).descendants()).to.equalSequenceAsync([nodes.nodeAAA, nodes.nodeAAAA, nodes.nodeAAB, nodes.nodeAAC]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).descendants()).to.equalSequenceAsync([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).descendants(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("descendantsAndSelf()", () => {
        it("gets descendants and self", () => expect(AsyncQuery.from([nodes.nodeAA], nodes.nodeHierarchy).descendantsAndSelf()).to.equalSequenceAsync([nodes.nodeAA, nodes.nodeAAA, nodes.nodeAAAA, nodes.nodeAAB, nodes.nodeAAC]));
        it("of undefined", () => expect(AsyncQuery.from([undefined], nodes.nodeHierarchy).descendantsAndSelf()).to.equalSequenceAsync([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => AsyncQuery.from([], nodes.nodeHierarchy).descendantsAndSelf(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
});
describe("AsyncOrderedHierarchyQuery", () => {
    describe("thenBy()", () => {
        it("preserves preceding order", () => expect(AsyncQuery.from(books.books, books.bookHierarchy).orderBy(x => x.title).thenBy(x => x.id)).to.equalSequenceAsync([books.bookA3, books.bookA4, books.bookB1, books.bookB2]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([], books.bookHierarchy).orderBy(x => x).thenBy(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => AsyncQuery.from([], books.bookHierarchy).orderBy(x => x).thenBy(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("thenByDescending()", () => {
        it("preserves preceding order", () => expect(AsyncQuery.from(books.books, books.bookHierarchy).orderBy(x => x.title).thenByDescending(x => x.id)).to.equalSequenceAsync([books.bookA4, books.bookA3, books.bookB2, books.bookB1]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => AsyncQuery.from([], books.bookHierarchy).orderBy(x => x).thenByDescending(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => AsyncQuery.from([], books.bookHierarchy).orderBy(x => x).thenByDescending(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
});
describe("fromAsync()", () => {
    it("Iterable", () => expect(fromAsync([1, 2, 3])).to.equalSequenceAsync([1, 2, 3]));
    it("ArrayLike", () => expect(fromAsync({ 0: 1, 1: 2, 2: 3, length: 3 })).to.equalSequenceAsync([1, 2, 3]));
    theory.throws("throws if 'source' is", (source: any) => fromAsync(source), {
        "undefined": [TypeError, undefined],
        "null": [TypeError, null],
        "non-object": [TypeError, 0],
        "non-queryable": [TypeError, {}]
    });
});