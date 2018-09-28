import "../lib/compat";
import { expect } from "chai";
import { theory } from "./test-utils";
import { Query, Lookup, from } from "../lib";
import * as users from "./data/users";
import * as nodes from "./data/nodes";
import * as books from "./data/books";
import * as numbers from "./data/numbers";

describe("Query", () => {
    describe("new()", () => {
        it("Iterable", () => expect(new Query([1, 2, 3])).to.equalSequence([1, 2, 3]));
        it("ArrayLike", () => expect(new Query({ 0: 1, 1: 2, 2: 3, length: 3 })).to.equalSequence([1, 2, 3]));
        theory.throws("throws if 'source' is", (source: any) => new Query(source), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, undefined],
            "function": [TypeError, () => {}],
        });
    });
    describe("from()", () => {
        it("Iterable", () => expect(Query.from([1, 2, 3])).to.equalSequence([1, 2, 3]));
        it("ArrayLike", () => expect(Query.from({ 0: 1, 1: 2, 2: 3, length: 3 })).to.equalSequence([1, 2, 3]));
        theory.throws("throws if 'source' is", (source: any) => Query.from(source), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, undefined],
            "function": [TypeError, () => {}],
        });
    });
    describe("of()", () => {
        it("no arguments", () => expect(Query.of()).to.equalSequence([]));
        it("multiple arguments", () => expect(Query.of(1, 2, 3)).to.equalSequence([1, 2, 3]));
    });
    describe("empty()", () => {
        it("is empty", () => expect(Query.empty()).to.equalSequence([]));
    });
    describe("once()", () => {
        it("is once", () => expect(Query.once(1)).to.equalSequence([1]));
    });
    describe("repeat()", () => {
        it("0 times", () => expect(Query.repeat("a", 0)).to.equalSequence([]));
        it("5 times", () => expect(Query.repeat("a", 5)).to.equalSequence(["a", "a", "a", "a", "a"]));
        theory.throws("throws if 'count' is", (count: any) => Query.repeat("a", count), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
    });
    describe("range()", () => {
        it("same", () => expect(Query.range(1, 1)).to.equalSequence([1]));
        it("low to high", () => expect(Query.range(1, 3)).to.equalSequence([1, 2, 3]));
        it("low to high by 2", () => expect(Query.range(1, 3, 2)).to.equalSequence([1, 3]));
        it("high to low", () => expect(Query.range(3, 1)).to.equalSequence([3, 2, 1]));
        it("high to low by 2", () => expect(Query.range(3, 1, 2)).to.equalSequence([3, 1]));
        theory.throws("throws if 'start' is", (start: any) => Query.range(start, 3), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
        theory.throws("throws if 'end' is", (end: any) => Query.range(1, end), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
        theory.throws("throws if 'increment' is", (increment: any) => Query.range(1, 3, increment), {
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "0": [RangeError, 0],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
    });
    describe("continuous()", () => {
        it("after 5 elements", () => expect(Query.continuous(1)).to.startWithSequence([1, 1, 1, 1, 1]));
        it("after 10 elements", () => expect(Query.continuous(1)).to.startWithSequence([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
    });
    describe("generate()", () => {
        it("even numbers", () => expect(Query.generate(3, i => i * 2)).to.equalSequence([0, 2, 4]));
        theory.throws("throws if 'count' is", (count: any) => Query.generate(count, () => {}), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
        theory.throws("throws if 'generator' is", (generator: any) => Query.generate(1, generator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("hierarchy()", () => {
        theory.throws("throws if 'hierarchy' is", (hierarchy: any) => Query.hierarchy({}, hierarchy), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""],
            "non-provider": [TypeError, {}],
        });
    });
    describe("consume()", () => {
        it("consumes", () => {
            const q = Query.consume(function* () { yield 1; } ());
            expect(q).to.equalSequence([1]);
            expect(q).to.equalSequence([]);
        });
        theory.throws("throws if 'iterator' is", (iterator: any) => Query.consume(iterator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""],
            "non-iterator": [TypeError, {}],
        });
    });
    describe("objectKeys()", () => {
        it("gets keys", () => expect(Query.objectKeys({ a: 1, b: 2 })).to.equalSequence(["a", "b"]));
        theory.throws("throws if 'source' is", (source: any) => Query.objectKeys(source), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""]
        });
    });
    describe("objectValues()", () => {
        it("gets values", () => expect(Query.objectValues({ a: 1, b: 2 })).to.equalSequence([1, 2]));
        theory.throws("throws if 'source' is", (source: any) => Query.objectValues(source), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""]
        });
    });
    describe("objectEntries()", () => {
        it("gets keys", () => expect(Query.objectEntries({ a: 1, b: 2 }).toArray()).to.deep.equal([["a", 1], ["b", 2]]));
        theory.throws("throws if 'source' is", (source: any) => Query.objectEntries(source), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""]
        });
    });
    describe("if()", () => {
        it("when true", () => expect(Query.if(() => true, [1, 2], [3, 4])).to.equalSequence([1, 2]));
        it("when false", () => expect(Query.if(() => false, [1, 2], [3, 4])).to.equalSequence([3, 4]));
        theory.throws("throws if 'condition' is", (condition: any) => Query.if(condition, [], []), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'thenQueryable' is", (thenQueryable: any) => Query.if(() => true, thenQueryable, []), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elseQueryable' is", (elseQueryable: any) => Query.if(() => true, [], elseQueryable), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("choose()", () => {
        it("choice 1", () => expect(Query.choose(() => 1, [[1, [1, 2]], [2, [3, 4]]])).to.equalSequence([1, 2]));
        it("choice 2", () => expect(Query.choose(() => 2, [[1, [1, 2]], [2, [3, 4]]])).to.equalSequence([3, 4]));
        it("otherwise", () => expect(Query.choose(() => 3, [[1, [1, 2]], [2, [3, 4]]], [5, 6])).to.equalSequence([5, 6]));
        it("no match", () => expect(Query.choose(() => 3, [[1, [1, 2]], [2, [3, 4]]])).to.equalSequence([]));
        theory.throws("throws if 'chooser' is", (chooser: any) => Query.choose(chooser, [], []), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'choices' is", (choices: any) => Query.choose(() => 0, choices, []), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-queryable": [TypeError, 0]
        });
        theory.throws("throws if 'otherwise' is", (otherwise: any) => Query.choose(() => 0, [], otherwise), {
            "null": [TypeError, null],
            "non-queryable": [TypeError, 0]
        });
    });
    describe("filter()", () => {
        it("filters", () => expect(Query.from([1, 2, 3]).filter(x => x >= 2)).to.equalSequence([2, 3]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).filter(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("where()", () => {
        it("filters", () => expect(Query.from([1, 2, 3]).where(x => x >= 2)).to.equalSequence([2, 3]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).where(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("map()", () => {
        it("maps", () => expect(Query.from([1, 2, 3]).map(x => x * 2)).to.equalSequence([2, 4, 6]));
        theory.throws("throws if 'selector' is", (selector: any) => Query.from([]).map(selector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("select()", () => {
        it("maps", () => expect(Query.from([1, 2, 3]).select(x => x * 2)).to.equalSequence([2, 4, 6]));
        theory.throws("throws if 'selector' is", (selector: any) => Query.from([]).select(selector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("flatMap()", () => {
        it("flatMaps", () => expect(Query.from([1, 2, 3]).flatMap(x => [x, 0])).to.equalSequence([1, 0, 2, 0, 3, 0]));
        theory.throws("throws if 'projection' is", (projection: any) => Query.from([]).flatMap(projection), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("selectMany()", () => {
        it("flatMaps", () => expect(Query.from([1, 2, 3]).selectMany(x => [x, 0])).to.equalSequence([1, 0, 2, 0, 3, 0]));
        theory.throws("throws if 'projection' is", (projection: any) => Query.from([]).selectMany(projection), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("do()", () => {
        it("does", () => {
            const received: number[] = [];
            const result = Query.from([1, 2, 3, 4]).do(v => received.push(v));
            expect(result).to.equalSequence([1, 2, 3, 4]);
            expect(received).to.deep.equal([1, 2, 3, 4]);
        });
        theory.throws("throws if 'callback' is", (callback: any) => Query.from([]).do(callback), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("tap()", () => {
        it("taps", () => {
            const received: number[] = [];
            const result = Query.from([1, 2, 3, 4]).tap(v => received.push(v));
            expect(result).to.equalSequence([1, 2, 3, 4]);
            expect(received).to.deep.equal([1, 2, 3, 4]);
        });
        theory.throws("throws if 'callback' is", (callback: any) => Query.from([]).do(callback), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("expand()", () => {
        it("expands", () => expect(Query.from([nodes.nodeA]).expand(x => x.children || [])).to.equalSequence([nodes.nodeA, nodes.nodeAA, nodes.nodeAB, nodes.nodeAC, nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC, nodes.nodeACA, nodes.nodeAAAA]));
        theory.throws("throws if 'projection' is", (projection: any) => Query.from([]).expand(projection), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("reverse()", () => {
        it("reverses", () => expect(Query.from([1, 2, 3]).reverse()).to.equalSequence([3, 2, 1]));
    });
    describe("skip()", () => {
        it("skips", () => expect(Query.from([1, 2, 3]).skip(1)).to.equalSequence([2, 3]));
        it("skip none", () => expect(Query.from([1, 2, 3]).skip(0)).to.equalSequence([1, 2, 3]));
        theory.throws("throws if 'count' is", (count: any) => Query.from([]).skip(count), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
    });
    describe("skipRight()", () => {
        it("skips right", () => expect(Query.from([1, 2, 3]).skipRight(1)).to.equalSequence([1, 2]));
        it("skips right none", () => expect(Query.from([1, 2, 3]).skipRight(0)).to.equalSequence([1, 2, 3]));
        theory.throws("throws if 'count' is", (count: any) => Query.from([]).skipRight(count), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
    });
    describe("skipWhile()", () => {
        it("skips while", () => expect(Query.from([1, 2, 1, 3]).skipWhile(x => x < 2)).to.equalSequence([2, 1, 3]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).skipWhile(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("take()", () => {
        it("takes", () => expect(Query.from([1, 2, 3]).take(2)).to.equalSequence([1, 2]));
        it("takes none", () => expect(Query.from([1, 2, 3]).take(0)).to.equalSequence([]));
        theory.throws("throws if 'count' is", (count: any) => Query.from([]).take(count), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
    });
    describe("takeRight()", () => {
        it("takes right", () => expect(Query.from([1, 2, 3]).takeRight(2)).to.equalSequence([2, 3]));
        it("takes right none", () => expect(Query.from([1, 2, 3]).takeRight(0)).to.equalSequence([]));
        theory.throws("throws if 'count' is", (count: any) => Query.from([]).takeRight(count), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
    });
    describe("takeWhile()", () => {
        it("takes while", () => expect(Query.from([1, 2, 3, 1]).takeWhile(x => x < 3)).to.equalSequence([1, 2]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).takeWhile(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("intersect()", () => {
        it("intersects", () => expect(Query.from([1, 1, 2, 3, 4]).intersect([1, 3, 3, 5, 7])).to.equalSequence([1, 3]));
        it("intersects none", () => expect(Query.from([1, 1, 2, 3, 4]).intersect([])).to.equalSequence([]));
        theory.throws("throws if 'other' is", (other: any) => Query.from([]).intersect(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
    });
    describe("union()", () => {
        it("unions", () => expect(Query.from([1, 1, 2, 3, 4]).union([1, 3, 3, 5, 7])).to.equalSequence([1, 2, 3, 4, 5, 7]));
        theory.throws("throws if 'other' is", (other: any) => Query.from([]).union(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
    });
    describe("except()", () => {
        it("excepts", () => expect(Query.from([1, 1, 2, 3, 4]).except([2, 4])).to.equalSequence([1, 3]));
        theory.throws("throws if 'other' is", (other: any) => Query.from([]).except(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
    });
    describe("concat()", () => {
        it("concats", () => expect(Query.from([1, 1, 2, 3, 4]).concat([1, 3, 3, 5, 7])).to.equalSequence([1, 1, 2, 3, 4, 1, 3, 3, 5, 7]));
        theory.throws("throws if 'other' is", (other: any) => Query.from([]).concat(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
    });
    describe("distinct()", () => {
        it("is distinct", () => expect(Query.from([1, 1, 2, 3, 4]).distinct()).to.equalSequence([1, 2, 3, 4]));
    });
    describe("append()", () => {
        it("appends", () => expect(Query.from([1, 2, 3]).append(5)).to.equalSequence([1, 2, 3, 5]));
    });
    describe("prepend()", () => {
        it("prepends", () => expect(Query.from([1, 2, 3]).prepend(5)).to.equalSequence([5, 1, 2, 3]));
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
        theory("patches", data, (start, skip, range, actual) => expect(Query.from([1, 2, 3]).patch(start, skip, range)).to.equalSequence(actual));
        theory.throws("throws if 'start' is", (start: any) => Query.from([]).patch(start, 0, []), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
        theory.throws("throws if 'skipCount' is", (skipCount: any) => Query.from([]).patch(0, skipCount, []), {
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "negative": [RangeError, -1],
            "NaN": [RangeError, NaN],
            "Infinity": [RangeError, Infinity]
        });
        theory.throws("throws if 'range' is", (range: any) => Query.from([]).patch(0, 0, range), {
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
    });
    describe("defaultIfEmpty()", () => {
        it("not empty", () => expect(Query.from([1, 2, 3]).defaultIfEmpty(9)).to.equalSequence([1, 2, 3]));
        it("empty", () => expect(Query.from([]).defaultIfEmpty(9)).to.equalSequence([9]));
    });
    describe("pageBy()", () => {
        it("pages with partial last page", () => expect(Query.from([1, 2, 3]).pageBy(2).map(x => Array.from(x)).toArray()).to.deep.equal([[1, 2], [3]]));
        it("pages exact", () => expect(Query.from([1, 2, 3, 4]).pageBy(2).map(x => Array.from(x)).toArray()).to.deep.equal([[1, 2], [3, 4]]));
        theory.throws("throws if 'pageSize' is", (pageSize: any) => Query.from([]).pageBy(pageSize), {
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
        theory("zips", data, (left, right, expected) => expect(Query.from(left).zip(right).toArray()).to.deep.equal(expected));
        theory.throws("throws if 'right' is", (right: any) => Query.from([]).zip(right), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'selector' is", (selector: any) => Query.from([]).zip([], selector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("orderBy()", () => {
        it("orders", () => expect(Query.from([3, 1, 2]).orderBy(x => x)).to.equalSequence([1, 2, 3]));
        it("orders same", () => {
            const q = Query.from(books.books_same).orderBy(x => x.title).toArray();
            expect(q[0]).to.equal(books.bookB2);
            expect(q[1]).to.equal(books.bookB2_same);
        });
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([]).orderBy(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => Query.from([]).orderBy(x => x, comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("orderByDescending()", () => {
        it("orders", () => expect(Query.from([3, 1, 2]).orderByDescending(x => x)).to.equalSequence([3, 2, 1]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([]).orderByDescending(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => Query.from([]).orderByDescending(x => x, comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("spanMap()", () => {
        it("odd/even spans", () => expect(Query.from([1, 3, 2, 4, 5, 7]).spanMap(k => k % 2 === 1).map(g => Array.from(g)).toArray()).to.deep.equal([[1, 3], [2, 4], [5, 7]]));
        it("empty", () => expect(Query.from([]).spanMap(k => k % 2 === 1)).to.equalSequence([]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([]).spanMap(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => Query.from([]).spanMap(x => x, elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'spanSelector' is", (spanSelector: any) => Query.from([]).spanMap(x => x, x => x, spanSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("groupBy()", () => {
        it("group by role", () => expect(Query.from(users.users).groupBy(u => u.role, u => u.name, (role, names) => ({ role: role, names: names.toArray() })).toArray())
            .to.deep.equal([
                { role: "admin", names: ["alice"] },
                { role: "user", names: ["bob", "dave"] }
            ]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([]).groupBy(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => Query.from([]).groupBy(x => x, elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'resultSelector' is", (resultSelector: any) => Query.from([]).groupBy(x => x, x => x, resultSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        it("group by symbol", () => {
            const sym = Symbol();
            const data = [
                { category: "a", value: 1 },
                { category: "a", value: 2 },
                { category: "a", value: 3 },
                { category: sym, value: 4 }
            ];
            expect(Query.from(data).groupBy(row => row.category, row => row.value, (category, values) => ({ category, values: values.toArray() })).toArray())
                .to.deep.equal([
                    { category: "a", values: [1, 2, 3] },
                    { category: sym, values: [4] }
                ]);
        });
    });
    describe("groupJoin()", () => {
        it("joins groups", () => expect(Query.from(users.roles).groupJoin(users.users, g => g.name, u => u.role, (role, users) => ({ role: role, users: users.toArray() })).toArray())
            .to.deep.equal([
                { role: users.adminRole, users: [users.aliceUser] },
                { role: users.userRole, users: [users.bobUser, users.daveUser] },
                { role: users.guestRole, users: [] }
            ]));
        theory.throws("throws if 'inner' is", (inner: any) => Query.from([]).groupJoin(inner, x => x, x => x, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'outerKeySelector' is", (outerKeySelector: any) => Query.from([]).groupJoin([], outerKeySelector, x => x, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'innerKeySelector' is", (innerKeySelector: any) => Query.from([]).groupJoin([], x => x, innerKeySelector, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'resultSelector' is", (resultSelector: any) => Query.from([]).groupJoin([], x => x, x => x, resultSelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("join()", () => {
        it("joins", () => expect(Query.from(users.roles).join(users.users, g => g.name, u => u.role, (role, user) => ({ role: role, user: user })).toArray())
            .to.deep.equal([
                { role: users.adminRole, user: users.aliceUser },
                { role: users.userRole, user: users.bobUser },
                { role: users.userRole, user: users.daveUser }
            ]));
        theory.throws("throws if 'inner' is", (inner: any) => Query.from([]).join(inner, x => x, x => x, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'outerKeySelector' is", (outerKeySelector: any) => Query.from([]).join([], outerKeySelector, x => x, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'innerKeySelector' is", (innerKeySelector: any) => Query.from([]).join([], x => x, innerKeySelector, x => x), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'resultSelector' is", (resultSelector: any) => Query.from([]).join([], x => x, x => x, resultSelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("scan()", () => {
        it("scans sums", () => expect(Query.from([1, 2, 3]).scan((c, e) => c + e, 0)).to.equalSequence([1, 3, 6]));
        it("scans sums no seed", () => expect(Query.from([1, 2, 3]).scan((c, e) => c + e)).to.equalSequence([3, 6]));
        theory.throws("throws if 'accumulator' is", (accumulator: any) => Query.from([]).scan(accumulator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("scanRight()", () => {
        it("scans sums from right", () => expect(Query.from([1, 2, 3]).scanRight((c, e) => c + e, 0)).to.equalSequence([3, 5, 6]));
        it("scans sums from right no seed", () => expect(Query.from([1, 2, 3]).scanRight((c, e) => c + e)).to.equalSequence([5, 6]));
        theory.throws("throws if 'accumulator' is", (accumulator: any) => Query.from([]).scanRight(accumulator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("reduce()", () => {
        it("reduces sum", () => expect(Query.from([1, 2, 3]).reduce((c, e) => c + e)).to.equal(6));
        it("reduces average", () => expect(Query.from([1, 2, 3]).reduce((c, e) => c + e, 0, (r, c) => r / c)).to.equal(2));
        theory.throws("throws if 'accumulator' is", (accumulator: any) => Query.from([]).reduce(accumulator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'resultSelector' is", (resultSelector: any) => Query.from([]).reduce(x => x, undefined, resultSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("reduceRight()", () => {
        it("reduces sum", () => expect(Query.from([1, 2, 3]).reduceRight((c, e) => c + e)).to.equal(6));
        it("reduces average", () => expect(Query.from([1, 2, 3]).reduceRight((c, e) => c + e, 0, (r, c) => r / c)).to.equal(2));
        theory.throws("throws if 'accumulator' is", (accumulator: any) => Query.from([]).reduceRight(accumulator), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'resultSelector' is", (resultSelector: any) => Query.from([]).reduceRight(x => x, undefined, resultSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("count()", () => {
        it("counts array", () => expect(Query.from([1, 2, 3]).count()).to.equal(3));
        it("counts set", () => expect(Query.from(new Set([1, 2, 3])).count()).to.equal(3));
        it("counts map", () => expect(Query.from(new Set([1, 2, 3])).count()).to.equal(3));
        it("counts range", () => expect(Query.range(1, 3).count()).to.equal(3));
        it("counts odds", () => expect(Query.from([1, 2, 3]).count(x => x % 2 === 1)).to.equal(2));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).count(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("first()", () => {
        it("finds first", () => expect(Query.from([1, 2, 3]).first()).to.equal(1));
        it("finds first even", () => expect(Query.from([1, 2, 3, 4]).first(x => x % 2 === 0)).to.equal(2));
        it("finds undefined when empty", () => expect(Query.from([]).first()).to.be.undefined);
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).first(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("last()", () => {
        it("finds last", () => expect(Query.from([1, 2, 3]).last()).to.equal(3));
        it("finds last odd", () => expect(Query.from([1, 2, 3, 4]).last(x => x % 2 === 1)).to.equal(3));
        it("finds undefined when empty", () => expect(Query.from([]).last()).to.be.undefined);
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).last(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("single()", () => {
        it("finds single", () => expect(Query.from([1]).single()).to.equal(1));
        it("finds undefined when many", () => expect(Query.from([1, 2, 3]).single()).to.be.undefined);
        it("finds undefined when empty", () => expect(Query.from([]).single()).to.be.undefined);
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).single(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("min()", () => {
        it("finds minimum", () => expect(Query.from([5, 6, 3, 9, 4]).min()).to.equal(3));
        it("finds undefined when empty", () => expect(Query.from([]).min()).to.be.undefined);
        theory.throws("throws if 'comparison' is", (comparison: any) => Query.from([]).min(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("max()", () => {
        it("finds maximum", () => expect(Query.from([5, 6, 3, 9, 4]).max()).to.equal(9));
        it("finds undefined when empty", () => expect(Query.from([]).max()).to.be.undefined);
        theory.throws("throws if 'comparison' is", (comparison: any) => Query.from([]).max(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("some()", () => {
        it("false when empty", () => expect(Query.from([]).some()).to.be.false);
        it("true when one or more", () => expect(Query.from([1]).some()).to.be.true);
        it("false when no match", () => expect(Query.from([1, 3]).some(x => x === 2)).to.be.false);
        it("true when matched", () => expect(Query.from([1, 3]).some(x => x === 3)).to.be.true);
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).some(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("every()", () => {
        it("false when empty", () => expect(Query.from([]).every(x => x % 2 === 1)).to.be.false);
        it("false when no match", () => expect(Query.from([2, 4]).every(x => x % 2 === 1)).to.be.false);
        it("false when partial match", () => expect(Query.from([1, 2]).every(x => x % 2 === 1)).to.be.false);
        it("true when fully matched", () => expect(Query.from([1, 3]).every(x => x % 2 === 1)).to.be.true);
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).every(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("corresponds()", () => {
        it("true when both match", () => expect(Query.from([1, 2, 3]).corresponds([1, 2, 3])).to.be.true);
        it("false when source has fewer elements", () => expect(Query.from([1, 2]).corresponds([1, 2, 3])).to.be.false);
        it("false when other has fewer elements", () => expect(Query.from([1, 2, 3]).corresponds([1, 2])).to.be.false);
        it("false when other has elements in different order", () => expect(Query.from([1, 2, 3]).corresponds([1, 3, 2])).to.be.false);
        it("false when other has different elements", () => expect(Query.from([1, 2, 3]).corresponds([1, 2, 4])).to.be.false);
        theory.throws("throws if 'other' is", (other: any) => Query.from([]).corresponds(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'equalityComparison' is", (equalityComparison: any) => Query.from([]).corresponds([], equalityComparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("includes()", () => {
        it("true when present", () => expect(Query.from([1, 2, 3]).includes(2)).to.be.true);
        it("false when missing", () => expect(Query.from([1, 2, 3]).includes(4)).to.be.false);
        it("false when empty", () => expect(Query.from([]).includes(4)).to.be.false);
    });
    describe("includesSequence()", () => {
        it("true when included", () => expect(Query.from([1, 2, 3, 4]).includesSequence([2, 3])).to.be.true);
        it("false when wrong order", () => expect(Query.from([1, 2, 3, 4]).includesSequence([3, 2])).to.be.false);
        it("false when not present", () => expect(Query.from([1, 2, 3, 4]).includesSequence([5, 6])).to.be.false);
        it("false when source empty", () => expect(Query.from([]).includesSequence([1, 2])).to.be.false);
        it("true when other empty", () => expect(Query.from([1, 2, 3, 4]).includesSequence([])).to.be.true);
        theory.throws("throws if 'other' is", (other: any) => Query.from([]).includesSequence(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'equalityComparison' is", (equalityComparison: any) => Query.from([]).includesSequence([], equalityComparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("startsWith()", () => {
        it("true when starts with other", () => expect(Query.from([1, 2, 3, 4]).startsWith([1, 2])).to.be.true);
        it("false when not at start", () => expect(Query.from([1, 2, 3, 4]).startsWith([2, 3])).to.be.false);
        it("false when wrong order", () => expect(Query.from([1, 2, 3, 4]).startsWith([2, 1])).to.be.false);
        it("false when not present", () => expect(Query.from([1, 2, 3, 4]).startsWith([5, 6])).to.be.false);
        it("false when source empty", () => expect(Query.from([]).startsWith([1, 2])).to.be.false);
        it("true when other empty", () => expect(Query.from([1, 2, 3, 4]).startsWith([])).to.be.true);
        theory.throws("throws if 'other' is", (other: any) => Query.from([]).startsWith(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'equalityComparison' is", (equalityComparison: any) => Query.from([]).startsWith([], equalityComparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("endsWith()", () => {
        it("true when ends with other", () => expect(Query.from([1, 2, 3, 4]).endsWith([3, 4])).to.be.true);
        it("false when not at end", () => expect(Query.from([1, 2, 3, 4]).endsWith([2, 3])).to.be.false);
        it("false when wrong order", () => expect(Query.from([1, 2, 3, 4]).endsWith([4, 3])).to.be.false);
        it("false when not present", () => expect(Query.from([1, 2, 3, 4]).endsWith([5, 6])).to.be.false);
        it("false when source empty", () => expect(Query.from([]).endsWith([1, 2])).to.be.false);
        it("true when other empty", () => expect(Query.from([1, 2, 3, 4]).endsWith([])).to.be.true);
        theory.throws("throws if 'other' is", (other: any) => Query.from([]).endsWith(other), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, 0],
            "non-queryable": [TypeError, {}]
        });
        theory.throws("throws if 'equalityComparison' is", (equalityComparison: any) => Query.from([]).endsWith([], equalityComparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("elementAt()", () => {
        it("at offset 0", () => expect(Query.from([1, 2, 3]).elementAt(0)).to.equal(1));
        it("at offset 1", () => expect(Query.from([1, 2, 3]).elementAt(1)).to.equal(2));
        it("at offset -1", () => expect(Query.from([1, 2, 3]).elementAt(-1)).to.equal(3));
        it("at offset -2", () => expect(Query.from([1, 2, 3]).elementAt(-2)).to.equal(2));
        it("at offset greater than size", () => expect(Query.from([1, 2, 3]).elementAt(3)).to.be.undefined);
        it("at negative offset greater than size", () => expect(Query.from([1, 2, 3]).elementAt(-4)).to.be.undefined);
        theory.throws("throws if 'offset' is", (offset: any) => Query.from([]).elementAt(offset), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "float": [TypeError, 1.5],
            "NaN": [TypeError, NaN],
            "Infinity": [TypeError, Infinity]
        });
    });
    describe("span()", () => {
        it("gets initial span", () => expect(Query.from([1, 2, 3, 4]).span(x => x < 3).map(x => x.toArray())).to.deep.equal([[1, 2], [3, 4]]));
        it("gets whole source", () => expect(Query.from([1, 2, 3, 4]).span(x => x < 5).map(x => x.toArray())).to.deep.equal([[1, 2, 3, 4], []]));
        it("gets no initial span", () => expect(Query.from([1, 2, 3, 4]).span(x => x < 1).map(x => x.toArray())).to.deep.equal([[], [1, 2, 3, 4]]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).span(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("break()", () => {
        it("gets initial span", () => expect(Query.from([1, 2, 3, 4]).break(x => x > 2).map(x => x.toArray())).to.deep.equal([[1, 2], [3, 4]]));
        it("gets whole source", () => expect(Query.from([1, 2, 3, 4]).break(x => x > 4).map(x => x.toArray())).to.deep.equal([[1, 2, 3, 4], []]));
        it("gets no initial span", () => expect(Query.from([1, 2, 3, 4]).break(x => x > 0).map(x => x.toArray())).to.deep.equal([[], [1, 2, 3, 4]]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([]).break(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("forEach()", () => {
        it("called for each item", () => {
            const received: number[] = [];
            Query.from([1, 2, 3, 4]).forEach(v => received.push(v));
            expect(received).to.deep.equal([1, 2, 3, 4]);
        });

        // node's for..of does not call return :/
        it("close iterator on error", () => {
            let returnWasCalled = false;
            const iterator: IterableIterator<number> = {
                [Symbol.iterator]() { return this; },
                next() { return { value: 1, done: false } },
                return() { returnWasCalled = true; return { value: undefined, done: true } }
            };
            const error = new Error();
            expect(() => Query.from(iterator).forEach(() => { throw error; })).to.throw(error);
            expect(returnWasCalled).to.be.true;
        });

        theory.throws("throws if 'callback' is", (callback: any) => Query.from([]).forEach(callback), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("drain()", () => {
        it("drains", () => {
            const received: number[] = [];
            Query.from([1, 2, 3, 4]).do(x => received.push(x)).drain();
            expect(received).to.deep.equal([1, 2, 3, 4]);
        });
    });
    describe("toHierarchy()", () => {
        theory.throws("throws if 'hierarchy' is", (hierarchy: any) => Query.from([]).toHierarchy(hierarchy), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-object": [TypeError, ""],
            "wrong shape": [TypeError, {}]
        });
    });
    describe("toArray()", () => {
        it("creates array", () => expect(Query.from([1, 2, 3, 4]).toArray()).to.deep.equal([1, 2, 3, 4]));
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => Query.from([]).toArray(elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("toSet()", () => {
        it("creates with right size", () => expect(Query.from([1, 2, 3, 4]).toSet().size).to.be.equal(4));
        it("creates set in order", () => expect(Query.from([1, 2, 3, 4]).toSet()).to.be.equalSequence([1, 2, 3, 4]));
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => Query.from([]).toSet(elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("toMap()", () => {
        it("creates with right size", () => expect(Query.from([1, 2, 3, 4]).toMap(x => x).size).to.be.equal(4));
        it("creates with correct keys", () => expect(Query.from([1, 2, 3, 4]).toMap(x => x * 2).get(2)).to.be.equal(1));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([]).toMap(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => Query.from([]).toMap(x => x, elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("toLookup()", () => {
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([]).toLookup(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => Query.from([]).toLookup(x => x, elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("toObject()", () => {
        it("creates object with prototype", () => {
            const proto = {};
            const obj: any = Query.from(["a", "b"]).toObject(proto, x => x);
            expect(obj).to.haveOwnProperty("a");
            expect(obj).to.haveOwnProperty("b");
            expect(obj.a).to.equal("a");
            expect(Object.getPrototypeOf(obj)).to.equal(proto);
        });
        it("creates object with null prototype", () => {
            const obj: any = Query.from(["a", "b"]).toObject(null, x => x);
            expect(obj.a).to.equal("a");
            expect(Object.getPrototypeOf(obj)).to.equal(null);
        });
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([]).toObject({}, keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'elementSelector' is", (elementSelector: any) => Query.from([]).toObject({}, String, elementSelector), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("toJSON()", () => {
        it("is array", () => expect(Query.from([1, 2, 3, 4]).toJSON()).to.be.deep.equal([1, 2, 3, 4]));
    });
});
describe("OrderedQuery", () => {
    describe("thenBy()", () => {
        it("preserves preceding order", () => expect(Query.from(books.books).orderBy(x => x.title).thenBy(x => x.id)).to.equalSequence([books.bookA3, books.bookA4, books.bookB1, books.bookB2]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([]).orderBy(x => x).thenBy(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => Query.from([]).orderBy(x => x).thenBy(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("thenByDescending()", () => {
        it("preserves preceding order", () => expect(Query.from(books.books).orderBy(x => x.title).thenByDescending(x => x.id)).to.equalSequence([books.bookA4, books.bookA3, books.bookB2, books.bookB1]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([]).orderBy(x => x).thenByDescending(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => Query.from([]).orderBy(x => x).thenByDescending(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
});
describe("HierarchyQuery", () => {
    describe("filter()", () => {
        it("filters", () => expect(Query.from([1, 2, 3], numbers.numberHierarchy).filter(x => x >= 2)).to.equalSequence([2, 3]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], numbers.numberHierarchy).filter(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("do()", () => {
        it("does", () => {
            const received: number[] = [];
            const result = Query.from([1, 2, 3, 4], numbers.numberHierarchy).do(v => received.push(v));
            expect(result).to.equalSequence([1, 2, 3, 4]);
            expect(received).to.deep.equal([1, 2, 3, 4]);
        });
        theory.throws("throws if 'callback' is", (callback: any) => Query.from([], numbers.numberHierarchy).do(callback), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("expand()", () => {
        it("expands", () => expect(Query.from([nodes.nodeA], nodes.nodeHierarchy).expand(x => x.children || [])).to.equalSequence([nodes.nodeA, nodes.nodeAA, nodes.nodeAB, nodes.nodeAC, nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC, nodes.nodeACA, nodes.nodeAAAA]));
        theory.throws("throws if 'projection' is", (projection: any) => Query.from([], numbers.numberHierarchy).expand(projection), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("reverse()", () => {
        it("reverses", () => expect(Query.from([1, 2, 3], numbers.numberHierarchy).reverse()).to.equalSequence([3, 2, 1]));
    });
    describe("skip()", () => {
        it("skips", () => expect(Query.from([1, 2, 3], numbers.numberHierarchy).skip(1)).to.equalSequence([2, 3]));
    });
    describe("skipRight()", () => {
        it("skips right", () => expect(Query.from([1, 2, 3], numbers.numberHierarchy).skipRight(1)).to.equalSequence([1, 2]));
    });
    describe("skipWhile()", () => {
        it("skips while", () => expect(Query.from([1, 2, 1, 3], numbers.numberHierarchy).skipWhile(x => x < 2)).to.equalSequence([2, 1, 3]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], numbers.numberHierarchy).skipWhile(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("take()", () => {
        it("takes", () => expect(Query.from([1, 2, 3], numbers.numberHierarchy).take(2)).to.equalSequence([1, 2]));
    });
    describe("takeRight()", () => {
        it("takes right", () => expect(Query.from([1, 2, 3], numbers.numberHierarchy).takeRight(2)).to.equalSequence([2, 3]));
    });
    describe("takeWhile()", () => {
        it("takes while", () => expect(Query.from([1, 2, 3, 1], numbers.numberHierarchy).takeWhile(x => x < 3)).to.equalSequence([1, 2]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], numbers.numberHierarchy).takeWhile(predicate), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("intersect()", () => {
        it("intersects", () => expect(Query.from([1, 1, 2, 3, 4], numbers.numberHierarchy).intersect([1, 3, 3, 5, 7])).to.equalSequence([1, 3]));
    });
    describe("union()", () => {
        it("unions", () => expect(Query.from([1, 1, 2, 3, 4], numbers.numberHierarchy).union([1, 3, 3, 5, 7])).to.equalSequence([1, 2, 3, 4, 5, 7]));
    });
    describe("except()", () => {
        it("excepts", () => expect(Query.from([1, 1, 2, 3, 4], numbers.numberHierarchy).except([2, 4])).to.equalSequence([1, 3]));
    });
    describe("concat()", () => {
        it("concats", () => expect(Query.from([1, 1, 2, 3, 4], numbers.numberHierarchy).concat([1, 3, 3, 5, 7])).to.equalSequence([1, 1, 2, 3, 4, 1, 3, 3, 5, 7]));
    });
    describe("distinct()", () => {
        it("is distinct", () => expect(Query.from([1, 1, 2, 3, 4], numbers.numberHierarchy).distinct()).to.equalSequence([1, 2, 3, 4]));
    });
    describe("append()", () => {
        it("appends", () => expect(Query.from([1, 2, 3], numbers.numberHierarchy).append(5)).to.equalSequence([1, 2, 3, 5]));
    });
    describe("prepend()", () => {
        it("prepends", () => expect(Query.from([1, 2, 3], numbers.numberHierarchy).prepend(5)).to.equalSequence([5, 1, 2, 3]));
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
        theory("patches", data, (start, skip, range, actual) => expect(Query.from([1, 2, 3], numbers.numberHierarchy).patch(start, skip, range)).to.equalSequence(actual));
    });
    describe("defaultIfEmpty()", () => {
        it("not empty", () => expect(Query.from([1, 2, 3], numbers.numberHierarchy).defaultIfEmpty(9)).to.equalSequence([1, 2, 3]));
        it("empty", () => expect(Query.from([], numbers.numberHierarchy).defaultIfEmpty(9)).to.equalSequence([9]));
    });
    describe("orderBy()", () => {
        it("orders", () => expect(Query.from([3, 1, 2], numbers.numberHierarchy).orderBy(x => x)).to.equalSequence([1, 2, 3]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([], numbers.numberHierarchy).orderBy(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => Query.from([], numbers.numberHierarchy).orderBy(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("orderByDescending()", () => {
        it("orders", () => expect(Query.from([3, 1, 2], numbers.numberHierarchy).orderByDescending(x => x)).to.equalSequence([3, 2, 1]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([], numbers.numberHierarchy).orderByDescending(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => Query.from([], numbers.numberHierarchy).orderByDescending(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("root()", () => {
        it("gets root", () => expect(Query.from([nodes.nodeAAAA], nodes.nodeHierarchy).root()).to.equalSequence([nodes.nodeA]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).root()).to.equalSequence([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).root(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("ancestors()", () => {
        it("gets ancestors", () => expect(Query.from([nodes.nodeAAAA], nodes.nodeHierarchy).ancestors()).to.equalSequence([nodes.nodeAAA, nodes.nodeAA, nodes.nodeA]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).ancestors()).to.equalSequence([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).ancestors(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("ancestorsAndSelf()", () => {
        it("gets ancestors and self", () => expect(Query.from([nodes.nodeAAAA], nodes.nodeHierarchy).ancestorsAndSelf()).to.equalSequence([nodes.nodeAAAA, nodes.nodeAAA, nodes.nodeAA, nodes.nodeA]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).ancestorsAndSelf()).to.equalSequence([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).ancestorsAndSelf(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("parents()", () => {
        it("gets parents", () => expect(Query.from([nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC], nodes.nodeHierarchy).parents()).to.equalSequence([nodes.nodeAA, nodes.nodeAA, nodes.nodeAA]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).parents()).to.equalSequence([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).parents(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("self()", () => {
        it("gets self", () => expect(Query.from([nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC], nodes.nodeHierarchy).self()).to.equalSequence([nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).self()).to.equalSequence([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).self(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("siblings()", () => {
        it("gets siblings", () => expect(Query.from([nodes.nodeAAA], nodes.nodeHierarchy).siblings()).to.equalSequence([nodes.nodeAAB, nodes.nodeAAC]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).siblings()).to.equalSequence([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).siblings(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("siblingsAndSelf()", () => {
        it("gets siblings and self", () => expect(Query.from([nodes.nodeAAA], nodes.nodeHierarchy).siblingsAndSelf()).to.equalSequence([nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).siblingsAndSelf()).to.equalSequence([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).siblingsAndSelf(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("siblingsBeforeSelf()", () => {
        it("gets siblings before self", () => expect(Query.from([nodes.nodeAAB], nodes.nodeHierarchy).siblingsBeforeSelf()).to.equalSequence([nodes.nodeAAA]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).siblingsBeforeSelf()).to.equalSequence([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).siblingsBeforeSelf(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("siblingsAfterSelf()", () => {
        it("gets siblings after self", () => expect(Query.from([nodes.nodeAAB], nodes.nodeHierarchy).siblingsAfterSelf()).to.equalSequence([nodes.nodeAAC]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).siblingsAfterSelf()).to.equalSequence([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).siblingsAfterSelf(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("children()", () => {
        it("gets children", () => expect(Query.from([nodes.nodeAA, nodes.nodeAB, nodes.nodeAC], nodes.nodeHierarchy).children()).to.equalSequence([nodes.nodeAAA, nodes.nodeAAB, nodes.nodeAAC, nodes.nodeACA]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).children()).to.equalSequence([]));
        it("of undefined children", () => expect(Query.from(books.books, books.bookHierarchy).children()).to.equalSequence([]));
        it("of undefined child", () => expect(Query.from([nodes.badNode], nodes.nodeHierarchy).children()).to.equalSequence([]));
        it("with predicate", () => expect(Query.from([nodes.nodeAA], nodes.nodeHierarchy).children(x => x.marker)).to.equalSequence([nodes.nodeAAB]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).children(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("nthChild()", () => {
        it("gets nthChild(0)", () => expect(Query.from([nodes.nodeAA], nodes.nodeHierarchy).nthChild(0)).to.equalSequence([nodes.nodeAAA]));
        it("gets nthChild(2)", () => expect(Query.from([nodes.nodeAA], nodes.nodeHierarchy).nthChild(2)).to.equalSequence([nodes.nodeAAC]));
        it("gets nthChild(-1)", () => expect(Query.from([nodes.nodeAA], nodes.nodeHierarchy).nthChild(-1)).to.equalSequence([nodes.nodeAAC]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).nthChild(0)).to.equalSequence([]));
        theory.throws("throws if 'offset' is", (offset: any) => Query.from([], nodes.nodeHierarchy).nthChild(offset), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-number": [TypeError, ""],
            "float": [TypeError, 1.5],
            "NaN": [TypeError, NaN],
            "Infinity": [TypeError, Infinity]
        });
    });
    describe("descendants()", () => {
        it("gets descendants", () => expect(Query.from([nodes.nodeAA], nodes.nodeHierarchy).descendants()).to.equalSequence([nodes.nodeAAA, nodes.nodeAAAA, nodes.nodeAAB, nodes.nodeAAC]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).descendants()).to.equalSequence([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).descendants(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("descendantsAndSelf()", () => {
        it("gets descendants and self", () => expect(Query.from([nodes.nodeAA], nodes.nodeHierarchy).descendantsAndSelf()).to.equalSequence([nodes.nodeAA, nodes.nodeAAA, nodes.nodeAAAA, nodes.nodeAAB, nodes.nodeAAC]));
        it("of undefined", () => expect(Query.from([undefined], nodes.nodeHierarchy).descendantsAndSelf()).to.equalSequence([]));
        theory.throws("throws if 'predicate' is", (predicate: any) => Query.from([], nodes.nodeHierarchy).descendantsAndSelf(predicate), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
});
describe("OrderedHierarchyQuery", () => {
    describe("thenBy()", () => {
        it("preserves preceding order", () => expect(Query.from(books.books, books.bookHierarchy).orderBy(x => x.title).thenBy(x => x.id)).to.equalSequence([books.bookA3, books.bookA4, books.bookB1, books.bookB2]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([], books.bookHierarchy).orderBy(x => x).thenBy(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => Query.from([], books.bookHierarchy).orderBy(x => x).thenBy(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
    describe("thenByDescending()", () => {
        it("preserves preceding order", () => expect(Query.from(books.books, books.bookHierarchy).orderBy(x => x.title).thenByDescending(x => x.id)).to.equalSequence([books.bookA4, books.bookA3, books.bookB2, books.bookB1]));
        theory.throws("throws if 'keySelector' is", (keySelector: any) => Query.from([], books.bookHierarchy).orderBy(x => x).thenByDescending(keySelector), {
            "undefined": [TypeError, undefined],
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
        theory.throws("throws if 'comparison' is", (comparison: any) => Query.from([], books.bookHierarchy).orderBy(x => x).thenByDescending(comparison), {
            "null": [TypeError, null],
            "non-function": [TypeError, ""]
        });
    });
});
describe("Lookup", () => {
    it("size", () => expect(new Lookup(<[string, number[]][]>[["a", [1]]]).size).to.equal(1));
    it("applyResultSelector()", () => expect(Array.from(new Lookup(<[string, number[]][]>[["a", [1]]]).applyResultSelector((x, y) => [x, Array.from(y)]))).to.deep.equal([["a", [1]]]));
    it("get empty", () => expect(new Lookup<string, string>([]).get("doesNotExist")).to.equalSequence([]));
});
describe("from()", () => {
    it("Iterable", () => expect(from([1, 2, 3])).to.equalSequence([1, 2, 3]));
    it("ArrayLike", () => expect(from({ 0: 1, 1: 2, 2: 3, length: 3 })).to.equalSequence([1, 2, 3]));
    theory.throws("throws if 'source' is", (source: any) => from(source), {
        "undefined": [TypeError, undefined],
        "null": [TypeError, null],
        "non-object": [TypeError, 0],
        "non-queryable": [TypeError, {}]
    });
});
