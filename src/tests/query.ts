import { assert, expect } from "chai";
import { theory, preconditions } from "./test-utils";
import * as es6 from "../lib/query";
import * as es5 from "../es5/query";
import * as collections from "../es5/collections";

const NoUndefineds: [any, ErrorConstructor][] = [
    [undefined, TypeError]
];

const NoNulls: [any, ErrorConstructor][] = [
    [null, TypeError]
];

const NoStrings: [any, ErrorConstructor][] = [
    ["", TypeError],
    ["1", TypeError],
    ["string", TypeError]
];

const NoNumbers: [any, ErrorConstructor][] = [
    [0, TypeError],
    [NaN, TypeError],
    [Infinity, TypeError]
];

const NoFloats: [any, ErrorConstructor][] = [
    [NaN, TypeError],
    [+Infinity, TypeError],
    [-Infinity, TypeError],
    [1.1, TypeError],
    [-0, TypeError]
]

const NoNaN: [any, ErrorConstructor][] = [
    [NaN, RangeError]
];

const NoInfinity: [any, ErrorConstructor][] = [
    [+Infinity, RangeError],
    [-Infinity, RangeError]
];

const NoZeros: [any, ErrorConstructor][] = [
    [+0, RangeError],
    [-0, RangeError]
];

const NoNegatives: [any, ErrorConstructor][] = [
    [-1, RangeError]
];

const NoObjects: [any, ErrorConstructor][] = [
    [{}, TypeError],
    [{ valueOf() { return 1; } }, TypeError]
];

const NoFunctions: [any, ErrorConstructor][] = [
    [() => { }, TypeError]
];

const NoBooleans: [any, ErrorConstructor][] = [
    [true, TypeError],
    [false, TypeError]
];

const MustBePositiveNonZeroFiniteNumber: [any, ErrorConstructor][] = [].concat(
    NoUndefineds,
    NoNulls,
    NoStrings,
    NoBooleans,
    NoObjects,
    NoFunctions,
    NoNaN,
    NoInfinity,
    NoNegatives,
    NoZeros,
    [[1], [1.5]]
);

const MustBePositiveNonZeroFiniteNumberOrUndefined: [any, ErrorConstructor][] = [].concat(
    NoNulls,
    NoStrings,
    NoBooleans,
    NoObjects,
    NoFunctions,
    NoNaN,
    NoInfinity,
    NoNegatives,
    NoZeros,
    [[1], [1.5], [undefined]]
);

const MustBePositiveFiniteNumber: [any, ErrorConstructor][] = [].concat(
    NoUndefineds,
    NoNulls,
    NoStrings,
    NoBooleans,
    NoObjects,
    NoFunctions,
    NoNaN,
    NoInfinity,
    NoNegatives,
    [[0], [1], [1.5]]
);

const MustBeFiniteNumber: [any, ErrorConstructor][] = [].concat(
    NoUndefineds,
    NoNulls,
    NoStrings,
    NoBooleans,
    NoObjects,
    NoFunctions,
    NoNaN,
    NoInfinity,
    [[-1], [0], [1], [1.5]]
);

const MustBeInteger: [any, ErrorConstructor][] = [].concat(
    NoUndefineds,
    NoNulls,
    NoStrings,
    NoBooleans,
    NoObjects,
    NoFunctions,
    NoFloats,
    [[-1], [0], [1]]
);

const MustBeFunction: [any, ErrorConstructor][] = [].concat(
    NoUndefineds,
    NoNulls,
    NoStrings,
    NoBooleans,
    NoObjects,
    NoNumbers,
    [[() => { }]]
);

const MustBeFunctionOrUndefined: [any, ErrorConstructor][] = [].concat(
    NoNulls,
    NoStrings,
    NoBooleans,
    NoObjects,
    NoNumbers,
    [[() => { }], [undefined]]
);

const MustBeIterator: [any, ErrorConstructor][] = [].concat(
    NoUndefineds,
    NoNulls,
    NoStrings,
    NoBooleans,
    NoFunctions,
    NoNumbers,
    [
        [{}, TypeError],
        [{ next: "" }, TypeError],
        [{ next: () => { }, return: "" }, TypeError],
        [{ next: () => { } }],
        [{ next: () => { }, return: () => { } }],
    ]
);

const MustBeObject: [any, ErrorConstructor][] = [].concat(
    NoUndefineds,
    NoNulls,
    NoStrings,
    NoBooleans,
    NoNumbers,
    [
        [{}],
        [() => { }]
    ]
);

const MustBeObjectOrNull: [any, ErrorConstructor][] = [].concat(
    NoUndefineds,
    NoStrings,
    NoBooleans,
    NoNumbers,
    [
        [{}],
        [null],
        [() => { }]
    ]
);

const MustBeHierarchyProvider: [any, ErrorConstructor][] = [].concat(
    NoUndefineds,
    NoNulls,
    NoStrings,
    NoBooleans,
    NoFunctions,
    NoNumbers,
    [
        [{}, TypeError],
        [{ parent: "" }, TypeError],
        [{ parent: () => { }, children: "" }, TypeError],
        [{ parent: () => { }, children: () => { } }],
    ]
);

const MustBeQueryable: [any, ErrorConstructor][] = [].concat(
    NoUndefineds,
    NoNulls,
    NoStrings,
    NoBooleans,
    NoFunctions,
    NoNumbers,
    NoObjects,
    [[[]]]
);

const MustBeQueryableOrUndefined: [any, ErrorConstructor][] = [].concat(
    NoNulls,
    NoStrings,
    NoBooleans,
    NoFunctions,
    NoNumbers,
    NoObjects,
    [[[]], [undefined]]
);

const aliceUser = { name: "alice", role: "admin" };
const bobUser = { name: "bob", role: "user" };
const daveUser = { name: "dave", role: "user" };
const users = [aliceUser, bobUser, daveUser];
const adminRole = { name: "admin" };
const userRole = { name: "user" };
const guestRole = { name: "guest" };
const roles = [adminRole, userRole, guestRole];

interface Node {
    name: string;
    parent?: Node;
    children?: Node[];
    toJSON?: () => any;
    marker?: boolean;
}

function makeTree(node: Node, parent?: Node) {
    node.toJSON = () => node.name;
    node.parent = parent;
    if (node.children) {
        for (const child of node.children) {
            if (child) makeTree(child, node);
        }
    }

    return node;
}

const nodeAAAA: Node = { name: "AAAA" }
const nodeAAA: Node = { name: "AAA", children: [nodeAAAA] };
const nodeAAB: Node = { name: "AAB", marker: true };
const nodeAAC: Node = { name: "AAC" };
const nodeAA: Node = { name: "AA", children: [nodeAAA, nodeAAB, nodeAAC] };
const nodeAB: Node = { name: "AB" };
const nodeACA: Node = { name: "ACA" };
const nodeAC: Node = { name: "AC", children: [nodeACA] };
const nodeA: Node = { name: "A", children: [nodeAA, nodeAB, nodeAC] };
makeTree(nodeA);

const badNode: Node = { name: "bad", children: [undefined] };

const nodeHierarchy = {
    parent(node: Node) {
        return node.parent;
    },
    children(node: Node) {
        return node.children || [];
    }
};

const numberHierarchy = {
    parent(node: number): number { return undefined; },
    children(node: number): number[] { return undefined; }
}

interface Book { title: string; id: number }
const bookA3 = { title: "A", id: 3 };
const bookA4 = { title: "A", id: 4 };
const bookB1 = { title: "B", id: 1 };
const bookB2 = { title: "B", id: 2 };
const bookB2_same = { title: "B", id: 2 };
const books = [bookA4, bookB2, bookB1, bookA3];
const books_same = [bookB2, bookB2_same];

const bookHierarchy = {
    parent(node: Book): Book { return undefined; },
    children(node: Book): Book[] { return undefined; }
}

interface Context {
    name: string;
    query: typeof es6;
    Set: typeof Set;
};

const contexts: Context[] = [
    { name: "es6", query: <any>es6, Set: Set },
    { name: "es5", query: <any>es5, Set: <any>collections.Set }
];

for (const context of contexts) {
    const query = context.query;
    const Query = query.Query;
    const HierarchyQuery = query.HierarchyQuery;
    const Lookup = query.Lookup;
    const from = query.from;
    const range = query.range;
    const repeat = query.repeat;
    const hierarchy = query.hierarchy;
    const Set = context.Set;
    describe(context.name, () => {
        describe("Query", () => {
            describe("new()", () => {
                it("Iterable", () => expect(new Query([1, 2, 3])).to.equalSequence([1, 2, 3]));
                it("ArrayLike", () => expect(new Query({ 0: 1, 1: 2, 2: 3, length: 3 })).to.equalSequence([1, 2, 3]));
                preconditions("source", MustBeQueryable, source => new Query(source));
            });
            describe("from()", () => {
                it("Iterable", () => expect(Query.from([1, 2, 3])).to.equalSequence([1, 2, 3]));
                it("ArrayLike", () => expect(Query.from({ 0: 1, 1: 2, 2: 3, length: 3 })).to.equalSequence([1, 2, 3]));
                preconditions("source", MustBeQueryable, source => Query.from(source));
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
                preconditions("count", MustBePositiveFiniteNumber, value => Query.repeat("a", value));
            });
            describe("range()", () => {
                it("same", () => expect(Query.range(1, 1)).to.equalSequence([1]));
                it("low to high", () => expect(Query.range(1, 3)).to.equalSequence([1, 2, 3]));
                it("low to high by 2", () => expect(Query.range(1, 3, 2)).to.equalSequence([1, 3]));
                it("high to low", () => expect(Query.range(3, 1)).to.equalSequence([3, 2, 1]));
                it("high to low by 2", () => expect(Query.range(3, 1, 2)).to.equalSequence([3, 1]));
                preconditions("start", MustBeFiniteNumber, value => Query.range(value, 3));
                preconditions("end", MustBeFiniteNumber, value => Query.range(1, value));
                preconditions("increment", MustBePositiveNonZeroFiniteNumberOrUndefined, value => Query.range(1, 3, value));
            });
            describe("continuous()", () => {
                it("after 5 elements", () => expect(Query.continuous(1)).to.startWithSequence([1, 1, 1, 1, 1]));
                it("after 10 elements", () => expect(Query.continuous(1)).to.startWithSequence([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
            });
            describe("generate()", () => {
                it("even numbers", () => expect(Query.generate(3, i => i * 2)).to.equalSequence([0, 2, 4]));
                preconditions("count", MustBePositiveFiniteNumber, value => Query.generate(value, () => { }));
                preconditions("generator", MustBeFunction, value => Query.generate(1, value));
            });
            describe("hierarchy()", () => {
                preconditions("hierarchy", MustBeHierarchyProvider, hierarchy => Query.hierarchy({}, hierarchy));
            });
            describe("consume()", () => {
                it("consumes", () => {
                    const q = Query.consume(function* () { yield 1; } ());
                    expect(q).to.equalSequence([1]);
                    expect(q).to.equalSequence([]);
                });
                preconditions("iterator", MustBeIterator, value => Query.consume(value));
            });
            describe("objectKeys()", () => {
                it("gets keys", () => expect(Query.objectKeys({ a: 1, b: 2 })).to.equalSequence(["a", "b"]));
                preconditions("source", MustBeObject, source => Query.objectKeys(source));
            });
            describe("objectValues()", () => {
                it("gets values", () => expect(Query.objectValues({ a: 1, b: 2 })).to.equalSequence([1, 2]));
                preconditions("source", MustBeObject, source => Query.objectValues(source));
            });
            describe("objectEntries()", () => {
                it("gets keys", () => expect(Query.objectEntries({ a: 1, b: 2 }).toArray()).to.deep.equal([["a", 1], ["b", 2]]));
                preconditions("source", MustBeObject, source => Query.objectEntries(source));
            });
            describe("if()", () => {
                it("when true", () => expect(Query.if(() => true, [1, 2], [3, 4])).to.equalSequence([1, 2]));
                it("when false", () => expect(Query.if(() => false, [1, 2], [3, 4])).to.equalSequence([3, 4]));
                preconditions("condition", MustBeFunction, condition => Query.if(condition, [], []));
                preconditions("thenQueryable", MustBeQueryable, thenQueryable => Query.if(() => true, thenQueryable, []));
                preconditions("elseQueryable", MustBeQueryable, elseQueryable => Query.if(() => true, [], elseQueryable));
            });
            describe("choose()", () => {
                it("choice 1", () => expect(Query.choose(() => 1, [[1, [1, 2]], [2, [3, 4]]])).to.equalSequence([1, 2]));
                it("choice 2", () => expect(Query.choose(() => 2, [[1, [1, 2]], [2, [3, 4]]])).to.equalSequence([3, 4]));
                it("otherwise", () => expect(Query.choose(() => 3, [[1, [1, 2]], [2, [3, 4]]], [5, 6])).to.equalSequence([5, 6]));
                it("no match", () => expect(Query.choose(() => 3, [[1, [1, 2]], [2, [3, 4]]])).to.equalSequence([]));
                preconditions("chooser", MustBeFunction, chooser => Query.choose(chooser, [], []));
                preconditions("choices", MustBeQueryable, choices => Query.choose(() => 0, choices, []));
                preconditions("otherwise", MustBeQueryableOrUndefined, otherwise => Query.choose(() => 0, [], otherwise));
            });
            describe("filter()", () => {
                it("filters", () => expect(Query.from([1, 2, 3]).filter(x => x >= 2)).to.equalSequence([2, 3]));
                preconditions("predicate", MustBeFunction, value => Query.from([]).filter(value));
            });
            describe("where()", () => {
                it("filters", () => expect(Query.from([1, 2, 3]).where(x => x >= 2)).to.equalSequence([2, 3]));
                preconditions("predicate", MustBeFunction, value => Query.from([]).where(value));
            });
            describe("map()", () => {
                it("maps", () => expect(Query.from([1, 2, 3]).map(x => x * 2)).to.equalSequence([2, 4, 6]));
                preconditions("selector", MustBeFunction, value => Query.from([]).map(value));
            });
            describe("select()", () => {
                it("maps", () => expect(Query.from([1, 2, 3]).select(x => x * 2)).to.equalSequence([2, 4, 6]));
                preconditions("selector", MustBeFunction, value => Query.from([]).select(value));
            });
            describe("flatMap()", () => {
                it("flatMaps", () => expect(Query.from([1, 2, 3]).flatMap(x => [x, 0])).to.equalSequence([1, 0, 2, 0, 3, 0]));
                preconditions("projection", MustBeFunction, value => Query.from([]).flatMap(value));
            });
            describe("selectMany()", () => {
                it("flatMaps", () => expect(Query.from([1, 2, 3]).selectMany(x => [x, 0])).to.equalSequence([1, 0, 2, 0, 3, 0]));
                preconditions("projection", MustBeFunction, value => Query.from([]).selectMany(value));
            });
            describe("do()", () => {
                it("does", () => {
                    const received: number[] = [];
                    const result = Query.from([1, 2, 3, 4]).do(v => received.push(v));
                    expect(result).to.equalSequence([1, 2, 3, 4]);
                    expect(received).to.deep.equal([1, 2, 3, 4]);
                });
                preconditions("callback", MustBeFunction, callback => Query.from([]).do(callback));
            });
            describe("expand()", () => {
                it("expands", () => expect(Query.from([nodeA]).expand(x => x.children || [])).to.equalSequence([nodeA, nodeAA, nodeAB, nodeAC, nodeAAA, nodeAAB, nodeAAC, nodeACA, nodeAAAA]));
                preconditions("projection", MustBeFunction, projection => Query.from([]).expand(projection));
            });
            describe("reverse()", () => {
                it("reverses", () => expect(Query.from([1, 2, 3]).reverse()).to.equalSequence([3, 2, 1]));
            });
            describe("skip()", () => {
                it("skips", () => expect(Query.from([1, 2, 3]).skip(1)).to.equalSequence([2, 3]));
                it("skip none", () => expect(Query.from([1, 2, 3]).skip(0)).to.equalSequence([1, 2, 3]));
                preconditions("count", MustBePositiveFiniteNumber, value => Query.from([]).skip(value));
            });
            describe("skipRight()", () => {
                it("skips right", () => expect(Query.from([1, 2, 3]).skipRight(1)).to.equalSequence([1, 2]));
                it("skips right none", () => expect(Query.from([1, 2, 3]).skipRight(0)).to.equalSequence([1, 2, 3]));
                preconditions("count", MustBePositiveFiniteNumber, value => Query.from([]).skipRight(value));
            });
            describe("skipWhile()", () => {
                it("skips while", () => expect(Query.from([1, 2, 1, 3]).skipWhile(x => x < 2)).to.equalSequence([2, 1, 3]));
                preconditions("predicate", MustBeFunction, value => Query.from([]).skipWhile(value));
            });
            describe("take()", () => {
                it("takes", () => expect(Query.from([1, 2, 3]).take(2)).to.equalSequence([1, 2]));
                it("takes none", () => expect(Query.from([1, 2, 3]).take(0)).to.equalSequence([]));
                preconditions("count", MustBePositiveFiniteNumber, value => Query.from([]).take(value));
            });
            describe("takeRight()", () => {
                it("takes right", () => expect(Query.from([1, 2, 3]).takeRight(2)).to.equalSequence([2, 3]));
                it("takes right none", () => expect(Query.from([1, 2, 3]).takeRight(0)).to.equalSequence([]));
                preconditions("count", MustBePositiveFiniteNumber, value => Query.from([]).takeRight(value));
            });
            describe("takeWhile()", () => {
                it("takes while", () => expect(Query.from([1, 2, 3, 1]).takeWhile(x => x < 3)).to.equalSequence([1, 2]));
                preconditions("predicate", MustBeFunction, value => Query.from([]).takeWhile(value));
            });
            describe("intersect()", () => {
                it("intersects", () => expect(Query.from([1, 1, 2, 3, 4]).intersect([1, 3, 3, 5, 7])).to.equalSequence([1, 3]));
                it("intersects none", () => expect(Query.from([1, 1, 2, 3, 4]).intersect([])).to.equalSequence([]));
                preconditions("other", MustBeQueryable, value => Query.from([]).intersect(value));
            });
            describe("union()", () => {
                it("unions", () => expect(Query.from([1, 1, 2, 3, 4]).union([1, 3, 3, 5, 7])).to.equalSequence([1, 2, 3, 4, 5, 7]));
                preconditions("other", MustBeQueryable, value => Query.from([]).intersect(value));
            });
            describe("except()", () => {
                it("excepts", () => expect(Query.from([1, 1, 2, 3, 4]).except([2, 4])).to.equalSequence([1, 3]));
                preconditions("other", MustBeQueryable, value => Query.from([]).intersect(value));
            });
            describe("concat()", () => {
                it("concats", () => expect(Query.from([1, 1, 2, 3, 4]).concat([1, 3, 3, 5, 7])).to.equalSequence([1, 1, 2, 3, 4, 1, 3, 3, 5, 7]));
                preconditions("other", MustBeQueryable, value => Query.from([]).intersect(value));
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
                preconditions("start", MustBePositiveFiniteNumber, value => Query.from([]).patch(value, 0, []));
                preconditions("skipCount", MustBePositiveFiniteNumber, value => Query.from([]).patch(0, value, []));
                preconditions("range", MustBeQueryable, value => Query.from([]).patch(0, 0, value));
            });
            describe("defaultIfEmpty()", () => {
                it("not empty", () => expect(Query.from([1, 2, 3]).defaultIfEmpty(9)).to.equalSequence([1, 2, 3]));
                it("empty", () => expect(Query.from([]).defaultIfEmpty(9)).to.equalSequence([9]));
            });
            describe("pageBy()", () => {
                it("pages with partial last page", () => expect(Query.from([1, 2, 3]).pageBy(2).map(x => x.toArray()).toArray()).to.deep.equal([[1, 2], [3]]));
                it("pages exact", () => expect(Query.from([1, 2, 3, 4]).pageBy(2).map(x => x.toArray()).toArray()).to.deep.equal([[1, 2], [3, 4]]));
                preconditions("pageSize", MustBePositiveNonZeroFiniteNumber, value => Query.from([]).pageBy(value));
            });
            describe("zip()", () => {
                const data: [number[], string[], [number, string][]][] = [
                    [[1, 2, 3], ["a", "b", "c"], [[1, "a"], [2, "b"], [3, "c"]]],
                    [[1, 2], ["a", "b", "c"], [[1, "a"], [2, "b"]]],
                    [[1, 2, 3], ["a", "b"], [[1, "a"], [2, "b"]]],
                ];
                theory("zips", data, (left, right, expected) => expect(Query.from(left).zip(right).toArray()).to.deep.equal(expected));
                preconditions("right", MustBeQueryable, value => Query.from([]).zip(value));
                preconditions("selector", MustBeFunctionOrUndefined, value => Query.from([]).zip([], value));
            });
            describe("orderBy()", () => {
                it("orders", () => expect(Query.from([3, 1, 2]).orderBy(x => x)).to.equalSequence([1, 2, 3]));
                it("orders same", () => {
                    const q = Query.from(books_same).orderBy(x => x.title).toArray();
                    expect(q[0]).to.equal(bookB2);
                    expect(q[1]).to.equal(bookB2_same);
                });
                preconditions("keySelector", MustBeFunction, value => Query.from([]).orderBy(value));
                preconditions("comparison", MustBeFunctionOrUndefined, value => Query.from([]).orderBy(x => x, value));
            });
            describe("orderByDescending()", () => {
                it("orders", () => expect(Query.from([3, 1, 2]).orderByDescending(x => x)).to.equalSequence([3, 2, 1]));
                preconditions("keySelector", MustBeFunction, value => Query.from([]).orderByDescending(value));
                preconditions("comparison", MustBeFunctionOrUndefined, value => Query.from([]).orderByDescending(x => x, value));
            });
            describe("spanMap()", () => {
                it("odd/even spans", () => expect(Query.from([1, 3, 2, 4, 5, 7]).spanMap(k => k % 2 === 1).map(g => g.toArray()).toArray()).to.deep.equal([[1, 3], [2, 4], [5, 7]]));
                it("empty", () => expect(Query.from([]).spanMap(k => k % 2 === 1)).to.equalSequence([]));
                preconditions("keySelector", MustBeFunction, value => Query.from([]).spanMap(value));
                preconditions("elementSelector", MustBeFunctionOrUndefined, value => Query.from([]).spanMap(x => x, value));
                preconditions("spanSelector", MustBeFunctionOrUndefined, value => Query.from([]).spanMap(x => x, x => x, value));
            });
            describe("groupBy()", () => {
                it("group by role", () => expect(Query.from(users).groupBy(u => u.role, u => u.name, (role, names) => ({ role: role, names: names.toArray() })).toArray())
                    .to.deep.equal([
                        { role: "admin", names: ["alice"] },
                        { role: "user", names: ["bob", "dave"] }
                    ]));
                preconditions("keySelector", MustBeFunction, value => Query.from([]).groupBy(value));
                preconditions("elementSelector", MustBeFunctionOrUndefined, value => Query.from([]).groupBy(x => x, value));
                preconditions("resultSelector", MustBeFunctionOrUndefined, value => Query.from([]).groupBy(x => x, x => x, value));
            });
            describe("groupJoin()", () => {
                it("joins groups", () => expect(Query.from(roles).groupJoin(users, g => g.name, u => u.role, (role, users) => ({ role: role, users: users.toArray() })).toArray())
                    .to.deep.equal([
                        { role: adminRole, users: [aliceUser] },
                        { role: userRole, users: [bobUser, daveUser] },
                        { role: guestRole, users: [] }
                    ]));
                preconditions("inner", MustBeQueryable, value => Query.from([]).groupJoin(value, x => x, x => x, x => x));
                preconditions("outerKeySelector", MustBeFunction, value => Query.from([]).groupJoin([], value, x => x, x => x));
                preconditions("innerKeySelector", MustBeFunction, value => Query.from([]).groupJoin([], x => x, value, x => x));
                preconditions("resultSelector", MustBeFunction, value => Query.from([]).groupJoin([], x => x, x => x, value));
            });
            describe("join()", () => {
                it("joins", () => expect(Query.from(roles).join(users, g => g.name, u => u.role, (role, user) => ({ role: role, user: user })).toArray())
                    .to.deep.equal([
                        { role: adminRole, user: aliceUser },
                        { role: userRole, user: bobUser },
                        { role: userRole, user: daveUser }
                    ]));
                preconditions("inner", MustBeQueryable, value => Query.from([]).join(value, x => x, x => x, x => x));
                preconditions("outerKeySelector", MustBeFunction, value => Query.from([]).join([], value, x => x, x => x));
                preconditions("innerKeySelector", MustBeFunction, value => Query.from([]).join([], x => x, value, x => x));
                preconditions("resultSelector", MustBeFunction, value => Query.from([]).join([], x => x, x => x, value));
            });
            describe("scan()", () => {
                it("scans sums", () => expect(Query.from([1, 2, 3]).scan((c, e) => c + e, 0)).to.equalSequence([1, 3, 6]));
                it("scans sums no seed", () => expect(Query.from([1, 2, 3]).scan((c, e) => c + e)).to.equalSequence([3, 6]));
                preconditions("accumulator", MustBeFunction, value => Query.from([]).scan(value));
            });
            describe("scanRight()", () => {
                it("scans sums from right", () => expect(Query.from([1, 2, 3]).scanRight((c, e) => c + e, 0)).to.equalSequence([3, 5, 6]));
                it("scans sums from right no seed", () => expect(Query.from([1, 2, 3]).scanRight((c, e) => c + e)).to.equalSequence([5, 6]));
                preconditions("accumulator", MustBeFunction, value => Query.from([]).scanRight(value));
            });
            describe("reduce()", () => {
                it("reduces sum", () => expect(Query.from([1, 2, 3]).reduce((c, e) => c + e)).to.equal(6));
                it("reduces average", () => expect(Query.from([1, 2, 3]).reduce((c, e) => c + e, 0, (r, c) => r / c)).to.equal(2));
                preconditions("accumulator", MustBeFunction, value => Query.from([]).reduce(value));
                preconditions("resultSelector", MustBeFunctionOrUndefined, value => Query.from([]).reduce(x => x, undefined, value));
            });
            describe("reduceRight()", () => {
                it("reduces sum", () => expect(Query.from([1, 2, 3]).reduceRight((c, e) => c + e)).to.equal(6));
                it("reduces average", () => expect(Query.from([1, 2, 3]).reduceRight((c, e) => c + e, 0, (r, c) => r / c)).to.equal(2));
                preconditions("accumulator", MustBeFunction, value => Query.from([]).reduceRight(value));
                preconditions("resultSelector", MustBeFunctionOrUndefined, value => Query.from([]).reduceRight(x => x, undefined, value));
            });
            describe("count()", () => {
                it("counts array", () => expect(Query.from([1, 2, 3]).count()).to.equal(3));
                it("counts set", () => expect(Query.from(new Set([1, 2, 3])).count()).to.equal(3));
                it("counts map", () => expect(Query.from(new Set([1, 2, 3])).count()).to.equal(3));
                it("counts range", () => expect(Query.range(1, 3).count()).to.equal(3));
                it("counts odds", () => expect(Query.from([1, 2, 3]).count(x => x % 2 === 1)).to.equal(2));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => Query.from([]).count(predicate));
            });
            describe("first()", () => {
                it("finds first", () => expect(Query.from([1, 2, 3]).first()).to.equal(1));
                it("finds first even", () => expect(Query.from([1, 2, 3, 4]).first(x => x % 2 === 0)).to.equal(2));
                it("finds undefined when empty", () => expect(Query.from([]).first()).to.be.undefined);
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => Query.from([]).first(predicate));
            });
            describe("last()", () => {
                it("finds last", () => expect(Query.from([1, 2, 3]).last()).to.equal(3));
                it("finds last odd", () => expect(Query.from([1, 2, 3, 4]).last(x => x % 2 === 1)).to.equal(3));
                it("finds undefined when empty", () => expect(Query.from([]).last()).to.be.undefined);
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => Query.from([]).last(predicate));
            });
            describe("single()", () => {
                it("finds single", () => expect(Query.from([1]).single()).to.equal(1));
                it("finds undefined when many", () => expect(Query.from([1, 2, 3]).single()).to.be.undefined);
                it("finds undefined when empty", () => expect(Query.from([]).single()).to.be.undefined);
            });
            describe("min()", () => {
                it("finds minimum", () => expect(Query.from([5, 6, 3, 9, 4]).min()).to.equal(3));
                it("finds undefined when empty", () => expect(Query.from([]).min()).to.be.undefined);
                preconditions("comparison", MustBeFunctionOrUndefined, comparison => Query.from([]).min(comparison));
            });
            describe("max()", () => {
                it("finds maximum", () => expect(Query.from([5, 6, 3, 9, 4]).max()).to.equal(9));
                it("finds undefined when empty", () => expect(Query.from([]).max()).to.be.undefined);
                preconditions("comparison", MustBeFunctionOrUndefined, comparison => Query.from([]).max(comparison));
            });
            describe("some()", () => {
                it("false when empty", () => expect(Query.from([]).some()).to.be.false);
                it("true when one or more", () => expect(Query.from([1]).some()).to.be.true);
                it("false when no match", () => expect(Query.from([1, 3]).some(x => x === 2)).to.be.false);
                it("true when matched", () => expect(Query.from([1, 3]).some(x => x === 3)).to.be.true);
                preconditions("comparison", MustBeFunctionOrUndefined, comparison => Query.from([]).some(comparison));
            });
            describe("every()", () => {
                it("false when empty", () => expect(Query.from([]).every(x => x % 2 === 1)).to.be.false);
                it("false when no match", () => expect(Query.from([2, 4]).every(x => x % 2 === 1)).to.be.false);
                it("false when partial match", () => expect(Query.from([1, 2]).every(x => x % 2 === 1)).to.be.false);
                it("true when fully matched", () => expect(Query.from([1, 3]).every(x => x % 2 === 1)).to.be.true);
                preconditions("comparison", MustBeFunction, comparison => Query.from([]).every(comparison));
            });
            describe("corresponds()", () => {
                it("true when both match", () => expect(Query.from([1, 2, 3]).corresponds([1, 2, 3])).to.be.true);
                it("false when source has fewer elements", () => expect(Query.from([1, 2]).corresponds([1, 2, 3])).to.be.false);
                it("false when other has fewer elements", () => expect(Query.from([1, 2, 3]).corresponds([1, 2])).to.be.false);
                it("false when other has elements in different order", () => expect(Query.from([1, 2, 3]).corresponds([1, 3, 2])).to.be.false);
                it("false when other has different elements", () => expect(Query.from([1, 2, 3]).corresponds([1, 2, 4])).to.be.false);
                preconditions("other", MustBeQueryable, other => Query.from([]).corresponds(other));
                preconditions("equalityComparison", MustBeFunctionOrUndefined, equalityComparison => Query.from([]).corresponds([], equalityComparison));
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
                preconditions("other", MustBeQueryable, other => Query.from([]).includesSequence(other));
                preconditions("equalityComparison", MustBeFunctionOrUndefined, equalityComparison => Query.from([]).includesSequence([], equalityComparison));
            });
            describe("startsWith()", () => {
                it("true when starts with other", () => expect(Query.from([1, 2, 3, 4]).startsWith([1, 2])).to.be.true);
                it("false when not at start", () => expect(Query.from([1, 2, 3, 4]).startsWith([2, 3])).to.be.false);
                it("false when wrong order", () => expect(Query.from([1, 2, 3, 4]).startsWith([2, 1])).to.be.false);
                it("false when not present", () => expect(Query.from([1, 2, 3, 4]).startsWith([5, 6])).to.be.false);
                it("false when source empty", () => expect(Query.from([]).startsWith([1, 2])).to.be.false);
                it("true when other empty", () => expect(Query.from([1, 2, 3, 4]).startsWith([])).to.be.true);
                preconditions("other", MustBeQueryable, other => Query.from([]).startsWith(other));
                preconditions("equalityComparison", MustBeFunctionOrUndefined, equalityComparison => Query.from([]).startsWith([], equalityComparison));
            });
            describe("endsWith()", () => {
                it("true when ends with other", () => expect(Query.from([1, 2, 3, 4]).endsWith([3, 4])).to.be.true);
                it("false when not at end", () => expect(Query.from([1, 2, 3, 4]).endsWith([2, 3])).to.be.false);
                it("false when wrong order", () => expect(Query.from([1, 2, 3, 4]).endsWith([4, 3])).to.be.false);
                it("false when not present", () => expect(Query.from([1, 2, 3, 4]).endsWith([5, 6])).to.be.false);
                it("false when source empty", () => expect(Query.from([]).endsWith([1, 2])).to.be.false);
                it("true when other empty", () => expect(Query.from([1, 2, 3, 4]).endsWith([])).to.be.true);
                preconditions("other", MustBeQueryable, other => Query.from([]).endsWith(other));
                preconditions("equalityComparison", MustBeFunctionOrUndefined, equalityComparison => Query.from([]).endsWith([], equalityComparison));
            });
            describe("elementAt()", () => {
                it("at offset 0", () => expect(Query.from([1, 2, 3]).elementAt(0)).to.equal(1));
                it("at offset 1", () => expect(Query.from([1, 2, 3]).elementAt(1)).to.equal(2));
                it("at offset -1", () => expect(Query.from([1, 2, 3]).elementAt(-1)).to.equal(3));
                it("at offset -2", () => expect(Query.from([1, 2, 3]).elementAt(-2)).to.equal(2));
                it("at offset greater than size", () => expect(Query.from([1, 2, 3]).elementAt(3)).to.be.undefined);
                it("at negative offset greater than size", () => expect(Query.from([1, 2, 3]).elementAt(-4)).to.be.undefined);
                preconditions("offset", MustBeInteger, offset => Query.from([]).elementAt(offset));
            });
            describe("span()", () => {
                it("gets initial span", () => expect(Query.from([1, 2, 3, 4]).span(x => x < 3).map(x => x.toArray())).to.deep.equal([[1, 2], [3, 4]]));
                it("gets whole source", () => expect(Query.from([1, 2, 3, 4]).span(x => x < 5).map(x => x.toArray())).to.deep.equal([[1, 2, 3, 4], []]));
                it("gets no initial span", () => expect(Query.from([1, 2, 3, 4]).span(x => x < 1).map(x => x.toArray())).to.deep.equal([[], [1, 2, 3, 4]]));
                preconditions("predicate", MustBeFunction, predicate => Query.from([]).span(predicate));
            });
            describe("break()", () => {
                it("gets initial span", () => expect(Query.from([1, 2, 3, 4]).break(x => x > 2).map(x => x.toArray())).to.deep.equal([[1, 2], [3, 4]]));
                it("gets whole source", () => expect(Query.from([1, 2, 3, 4]).break(x => x > 4).map(x => x.toArray())).to.deep.equal([[1, 2, 3, 4], []]));
                it("gets no initial span", () => expect(Query.from([1, 2, 3, 4]).break(x => x > 0).map(x => x.toArray())).to.deep.equal([[], [1, 2, 3, 4]]));
                preconditions("predicate", MustBeFunction, predicate => Query.from([]).break(predicate));
            });
            describe("forEach()", () => {
                it("called for each item", () => {
                    const received: number[] = [];
                    Query.from([1, 2, 3, 4]).forEach(v => received.push(v));
                    expect(received).to.deep.equal([1, 2, 3, 4]);
                });

                // node's for..of does not call return :/
                it.skip("close iterator on error", () => {
                    let returnWasCalled = false;
                    const iterator: IterableIterator<number> = {
                        [Symbol.iterator]() { return this; },
                        next() { return { value: 1, done: false } },
                        return() { returnWasCalled = true; return { done: true } }
                    };
                    const error = new Error();
                    expect(() => Query.from(iterator).forEach(x => { throw error; })).to.throw(error);
                    expect(returnWasCalled).to.be.true;
                });

                preconditions("callback", MustBeFunction, callback => Query.from([]).forEach(callback));
            });
            describe("drain()", () => {
                it("drains", () => {
                    const received: number[] = [];
                    Query.from([1, 2, 3, 4]).do(x => received.push(x)).drain();
                    expect(received).to.deep.equal([1, 2, 3, 4]);
                });
            });
            describe("toHierarchy()", () => {
                preconditions("hierarchy", MustBeHierarchyProvider, hierarchy => Query.from([]).toHierarchy(hierarchy));
            });
            describe("toArray()", () => {
                it("creates array", () => expect(Query.from([1, 2, 3, 4]).toArray()).to.deep.equal([1, 2, 3, 4]));
                preconditions("elementSelector", MustBeFunctionOrUndefined, elementSelector => Query.from([]).toArray(elementSelector));
            });
            describe("toSet()", () => {
                it("creates with right size", () => expect(Query.from([1, 2, 3, 4]).toSet().size).to.be.equal(4));
                it("creates set in order", () => expect(Query.from([1, 2, 3, 4]).toSet()).to.be.equalSequence([1, 2, 3, 4]));
                preconditions("elementSelector", MustBeFunctionOrUndefined, elementSelector => Query.from([]).toSet(elementSelector));
            });
            describe("toMap()", () => {
                it("creates with right size", () => expect(Query.from([1, 2, 3, 4]).toMap(x => x).size).to.be.equal(4));
                it("creates with correct keys", () => expect(Query.from([1, 2, 3, 4]).toMap(x => x * 2).get(2)).to.be.equal(1));
                preconditions("keySelector", MustBeFunction, keySelector => Query.from([]).toMap(keySelector));
                preconditions("elementSelector", MustBeFunctionOrUndefined, elementSelector => Query.from([]).toMap(x => x, elementSelector));
            });
            describe("toLookup()", () => {
                preconditions("keySelector", MustBeFunction, keySelector => Query.from([]).toLookup(keySelector));
                preconditions("elementSelector", MustBeFunctionOrUndefined, elementSelector => Query.from([]).toLookup(x => x, elementSelector));
            });
            describe("toObject()", () => {
                it("creates object with prototype", () => {
                    const proto = {};
                    const obj = Query.from(["a", "b"]).toObject(proto, x => x);
                    expect(obj).to.haveOwnProperty("a");
                    expect(obj).to.haveOwnProperty("b");
                    expect(obj.a).to.equal("a");
                    expect(Object.getPrototypeOf(obj)).to.equal(proto);
                });
                it("creates object with null prototype", () => {
                    const obj = Query.from(["a", "b"]).toObject(null, x => x);
                    expect(obj.a).to.equal("a");
                    expect(Object.getPrototypeOf(obj)).to.equal(null);
                });
                preconditions("keySelector", MustBeFunction, keySelector => Query.from([]).toObject({}, keySelector));
                preconditions("elementSelector", MustBeFunctionOrUndefined, elementSelector => Query.from([]).toObject({}, x => "", elementSelector));
            });
            describe("toJSON()", () => {
                it("is array", () => expect(Query.from([1, 2, 3, 4]).toJSON()).to.be.deep.equal([1, 2, 3, 4]));
            });
        });
        describe("OrderedQuery", () => {
            describe("thenBy()", () => {
                it("preserves preceding order", () => expect(Query.from(books).orderBy(x => x.title).thenBy(x => x.id)).to.equalSequence([bookA3, bookA4, bookB1, bookB2]));
                preconditions("keySelector", MustBeFunction, keySelector => Query.from([]).orderBy(x => x).thenBy(keySelector));
                preconditions("comparison", MustBeFunctionOrUndefined, comparison => Query.from([]).orderBy(x => x).thenBy(x => x, comparison));
            });
            describe("thenByDescending()", () => {
                it("preserves preceding order", () => expect(Query.from(books).orderBy(x => x.title).thenByDescending(x => x.id)).to.equalSequence([bookA4, bookA3, bookB2, bookB1]));
                preconditions("keySelector", MustBeFunction, keySelector => Query.from([]).orderBy(x => x).thenByDescending(keySelector));
                preconditions("comparison", MustBeFunctionOrUndefined, comparison => Query.from([]).orderBy(x => x).thenByDescending(x => x, comparison));
            });
        });
        describe("HierarchyQuery", () => {
            describe("filter()", () => {
                it("filters", () => expect(new HierarchyQuery([1, 2, 3], numberHierarchy).filter(x => x >= 2)).to.equalSequence([2, 3]));
                preconditions("predicate", MustBeFunction, value => new HierarchyQuery([], numberHierarchy).filter(value));
            });
            describe("do()", () => {
                it("does", () => {
                    const received: number[] = [];
                    const result = new HierarchyQuery([1, 2, 3, 4], numberHierarchy).do(v => received.push(v));
                    expect(result).to.equalSequence([1, 2, 3, 4]);
                    expect(received).to.deep.equal([1, 2, 3, 4]);
                });
                preconditions("callback", MustBeFunction, callback => new HierarchyQuery([], numberHierarchy).do(callback));
            });
            describe("expand()", () => {
                it("expands", () => expect(new HierarchyQuery([nodeA], nodeHierarchy).expand(x => x.children || [])).to.equalSequence([nodeA, nodeAA, nodeAB, nodeAC, nodeAAA, nodeAAB, nodeAAC, nodeACA, nodeAAAA]));
                preconditions("projection", MustBeFunction, projection => new HierarchyQuery([], numberHierarchy).expand(projection));
            });
            describe("reverse()", () => {
                it("reverses", () => expect(new HierarchyQuery([1, 2, 3], numberHierarchy).reverse()).to.equalSequence([3, 2, 1]));
            });
            describe("skip()", () => {
                it("skips", () => expect(new HierarchyQuery([1, 2, 3], numberHierarchy).skip(1)).to.equalSequence([2, 3]));
                preconditions("count", MustBePositiveFiniteNumber, value => new HierarchyQuery([], numberHierarchy).skip(value));
            });
            describe("skipRight()", () => {
                it("skips right", () => expect(new HierarchyQuery([1, 2, 3], numberHierarchy).skipRight(1)).to.equalSequence([1, 2]));
                preconditions("count", MustBePositiveFiniteNumber, value => new HierarchyQuery([], numberHierarchy).skipRight(value));
            });
            describe("skipWhile()", () => {
                it("skips while", () => expect(new HierarchyQuery([1, 2, 1, 3], numberHierarchy).skipWhile(x => x < 2)).to.equalSequence([2, 1, 3]));
                preconditions("predicate", MustBeFunction, value => new HierarchyQuery([], numberHierarchy).skipWhile(value));
            });
            describe("take()", () => {
                it("takes", () => expect(new HierarchyQuery([1, 2, 3], numberHierarchy).take(2)).to.equalSequence([1, 2]));
                preconditions("count", MustBePositiveFiniteNumber, value => new HierarchyQuery([], numberHierarchy).take(value));
            });
            describe("takeRight()", () => {
                it("takes right", () => expect(new HierarchyQuery([1, 2, 3], numberHierarchy).takeRight(2)).to.equalSequence([2, 3]));
                preconditions("count", MustBePositiveFiniteNumber, value => new HierarchyQuery([], numberHierarchy).takeRight(value));
            });
            describe("takeWhile()", () => {
                it("takes while", () => expect(new HierarchyQuery([1, 2, 3, 1], numberHierarchy).takeWhile(x => x < 3)).to.equalSequence([1, 2]));
                preconditions("predicate", MustBeFunction, value => new HierarchyQuery([], numberHierarchy).takeWhile(value));
            });
            describe("intersect()", () => {
                it("intersects", () => expect(new HierarchyQuery([1, 1, 2, 3, 4], numberHierarchy).intersect([1, 3, 3, 5, 7])).to.equalSequence([1, 3]));
                preconditions("other", MustBeQueryable, value => new HierarchyQuery([], numberHierarchy).intersect(value));
            });
            describe("union()", () => {
                it("unions", () => expect(new HierarchyQuery([1, 1, 2, 3, 4], numberHierarchy).union([1, 3, 3, 5, 7])).to.equalSequence([1, 2, 3, 4, 5, 7]));
                preconditions("other", MustBeQueryable, value => new HierarchyQuery([], numberHierarchy).intersect(value));
            });
            describe("except()", () => {
                it("excepts", () => expect(new HierarchyQuery([1, 1, 2, 3, 4], numberHierarchy).except([2, 4])).to.equalSequence([1, 3]));
                preconditions("other", MustBeQueryable, value => new HierarchyQuery([], numberHierarchy).intersect(value));
            });
            describe("concat()", () => {
                it("concats", () => expect(new HierarchyQuery([1, 1, 2, 3, 4], numberHierarchy).concat([1, 3, 3, 5, 7])).to.equalSequence([1, 1, 2, 3, 4, 1, 3, 3, 5, 7]));
                preconditions("other", MustBeQueryable, value => new HierarchyQuery([], numberHierarchy).intersect(value));
            });
            describe("distinct()", () => {
                it("is distinct", () => expect(new HierarchyQuery([1, 1, 2, 3, 4], numberHierarchy).distinct()).to.equalSequence([1, 2, 3, 4]));
            });
            describe("append()", () => {
                it("appends", () => expect(new HierarchyQuery([1, 2, 3], numberHierarchy).append(5)).to.equalSequence([1, 2, 3, 5]));
            });
            describe("prepend()", () => {
                it("prepends", () => expect(new HierarchyQuery([1, 2, 3], numberHierarchy).prepend(5)).to.equalSequence([5, 1, 2, 3]));
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
                theory("patches", data, (start, skip, range, actual) => expect(new HierarchyQuery([1, 2, 3], numberHierarchy).patch(start, skip, range)).to.equalSequence(actual));
                preconditions("start", MustBePositiveFiniteNumber, value => new HierarchyQuery([], numberHierarchy).patch(value, 0, []));
                preconditions("skipCount", MustBePositiveFiniteNumber, value => new HierarchyQuery([], numberHierarchy).patch(0, value, []));
                preconditions("range", MustBeQueryable, value => new HierarchyQuery([], numberHierarchy).patch(0, 0, value));
            });
            describe("defaultIfEmpty()", () => {
                it("not empty", () => expect(new HierarchyQuery([1, 2, 3], numberHierarchy).defaultIfEmpty(9)).to.equalSequence([1, 2, 3]));
                it("empty", () => expect(new HierarchyQuery([], numberHierarchy).defaultIfEmpty(9)).to.equalSequence([9]));
            });
            describe("orderBy()", () => {
                it("orders", () => expect(new HierarchyQuery([3, 1, 2], numberHierarchy).orderBy(x => x)).to.equalSequence([1, 2, 3]));
                preconditions("keySelector", MustBeFunction, value => new HierarchyQuery([], numberHierarchy).orderBy(value));
                preconditions("comparison", MustBeFunctionOrUndefined, value => new HierarchyQuery([], numberHierarchy).orderBy(x => x, value));
            });
            describe("orderByDescending()", () => {
                it("orders", () => expect(new HierarchyQuery([3, 1, 2], numberHierarchy).orderByDescending(x => x)).to.equalSequence([3, 2, 1]));
                preconditions("keySelector", MustBeFunction, value => new HierarchyQuery([], numberHierarchy).orderByDescending(value));
                preconditions("comparison", MustBeFunctionOrUndefined, value => new HierarchyQuery([], numberHierarchy).orderByDescending(x => x, value));
            });
            describe("root()", () => {
                it("gets root", () => expect(new HierarchyQuery([nodeAAAA], nodeHierarchy).root()).to.equalSequence([nodeA]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).root()).to.equalSequence([]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).root(predicate));
            });
            describe("ancestors()", () => {
                it("gets ancestors", () => expect(new HierarchyQuery([nodeAAAA], nodeHierarchy).ancestors()).to.equalSequence([nodeAAA, nodeAA, nodeA]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).ancestors()).to.equalSequence([]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).ancestors(predicate));
            });
            describe("ancestorsAndSelf()", () => {
                it("gets ancestors and self", () => expect(new HierarchyQuery([nodeAAAA], nodeHierarchy).ancestorsAndSelf()).to.equalSequence([nodeAAAA, nodeAAA, nodeAA, nodeA]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).ancestorsAndSelf()).to.equalSequence([]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).ancestorsAndSelf(predicate));
            });
            describe("parents()", () => {
                it("gets parents", () => expect(new HierarchyQuery([nodeAAA, nodeAAB, nodeAAC], nodeHierarchy).parents()).to.equalSequence([nodeAA, nodeAA, nodeAA]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).parents()).to.equalSequence([]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).parents(predicate));
            });
            describe("self()", () => {
                it("gets self", () => expect(new HierarchyQuery([nodeAAA, nodeAAB, nodeAAC], nodeHierarchy).self()).to.equalSequence([nodeAAA, nodeAAB, nodeAAC]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).self()).to.equalSequence([]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).self(predicate));
            });
            describe("siblings()", () => {
                it("gets siblings", () => expect(new HierarchyQuery([nodeAAA], nodeHierarchy).siblings()).to.equalSequence([nodeAAB, nodeAAC]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).siblings()).to.equalSequence([]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).siblings(predicate));
            });
            describe("siblingsAndSelf()", () => {
                it("gets siblings and self", () => expect(new HierarchyQuery([nodeAAA], nodeHierarchy).siblingsAndSelf()).to.equalSequence([nodeAAA, nodeAAB, nodeAAC]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).siblingsAndSelf()).to.equalSequence([]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).siblingsAndSelf(predicate));
            });
            describe("siblingsBeforeSelf()", () => {
                it("gets siblings before self", () => expect(new HierarchyQuery([nodeAAB], nodeHierarchy).siblingsBeforeSelf()).to.equalSequence([nodeAAA]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).siblingsBeforeSelf()).to.equalSequence([]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).siblingsBeforeSelf(predicate));
            });
            describe("siblingsAfterSelf()", () => {
                it("gets siblings after self", () => expect(new HierarchyQuery([nodeAAB], nodeHierarchy).siblingsAfterSelf()).to.equalSequence([nodeAAC]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).siblingsAfterSelf()).to.equalSequence([]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).siblingsAfterSelf(predicate));
            });
            describe("children()", () => {
                it("gets children", () => expect(new HierarchyQuery([nodeAA, nodeAB, nodeAC], nodeHierarchy).children()).to.equalSequence([nodeAAA, nodeAAB, nodeAAC, nodeACA]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).children()).to.equalSequence([]));
                it("of undefined children", () => expect(new HierarchyQuery(books, bookHierarchy).children()).to.equalSequence([]));
                it("of undefined child", () => expect(new HierarchyQuery([badNode], nodeHierarchy).children()).to.equalSequence([]));
                it("with predicate", () => expect(new HierarchyQuery([nodeAA], nodeHierarchy).children(x => x.marker)).to.equalSequence([nodeAAB]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).children(predicate));
            });
            describe("nthChild()", () => {
                it("gets nthChild(0)", () => expect(new HierarchyQuery([nodeAA], nodeHierarchy).nthChild(0)).to.equalSequence([nodeAAA]));
                it("gets nthChild(2)", () => expect(new HierarchyQuery([nodeAA], nodeHierarchy).nthChild(2)).to.equalSequence([nodeAAC]));
                it("gets nthChild(-1)", () => expect(new HierarchyQuery([nodeAA], nodeHierarchy).nthChild(-1)).to.equalSequence([nodeAAC]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).nthChild(0)).to.equalSequence([]));
                preconditions("offset", MustBeInteger, offset => new HierarchyQuery([], nodeHierarchy).nthChild(offset));
            });
            describe("descendants()", () => {
                it("gets descendants", () => expect(new HierarchyQuery([nodeAA], nodeHierarchy).descendants()).to.equalSequence([nodeAAA, nodeAAAA, nodeAAB, nodeAAC]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).descendants()).to.equalSequence([]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).descendants(predicate));
            });
            describe("descendantsAndSelf()", () => {
                it("gets descendants and self", () => expect(new HierarchyQuery([nodeAA], nodeHierarchy).descendantsAndSelf()).to.equalSequence([nodeAA, nodeAAA, nodeAAAA, nodeAAB, nodeAAC]));
                it("of undefined", () => expect(new HierarchyQuery([undefined], nodeHierarchy).descendantsAndSelf()).to.equalSequence([]));
                preconditions("predicate", MustBeFunctionOrUndefined, predicate => new HierarchyQuery([], nodeHierarchy).descendantsAndSelf(predicate));
            });
        });
        describe("OrderedHierarchyQuery", () => {
            describe("thenBy()", () => {
                it("preserves preceding order", () => expect(new HierarchyQuery(books, bookHierarchy).orderBy(x => x.title).thenBy(x => x.id)).to.equalSequence([bookA3, bookA4, bookB1, bookB2]));
                preconditions("keySelector", MustBeFunction, keySelector => new HierarchyQuery([], bookHierarchy).orderBy(x => x).thenBy(keySelector));
                preconditions("comparison", MustBeFunctionOrUndefined, comparison => new HierarchyQuery([], bookHierarchy).orderBy(x => x).thenBy(x => x, comparison));
            });
            describe("thenByDescending()", () => {
                it("preserves preceding order", () => expect(new HierarchyQuery(books, bookHierarchy).orderBy(x => x.title).thenByDescending(x => x.id)).to.equalSequence([bookA4, bookA3, bookB2, bookB1]));
                preconditions("keySelector", MustBeFunction, keySelector => new HierarchyQuery([], bookHierarchy).orderBy(x => x).thenByDescending(keySelector));
                preconditions("comparison", MustBeFunctionOrUndefined, comparison => new HierarchyQuery([], bookHierarchy).orderBy(x => x).thenByDescending(x => x, comparison));
            });
        });
        describe("Lookup", () => {
            it("size", () => expect(new Lookup(<[string, number[]][]>[["a", [1]]]).size).to.equal(1));
            it("applyResultSelector()", () => expect(new Lookup(<[string, number[]][]>[["a", [1]]]).applyResultSelector((x, y) => [x, y.toArray()]).toArray()).to.deep.equal([["a", [1]]]));
            it("get empty", () => expect(new Lookup<string, string>([]).get("doesNotExist")).to.equalSequence([]));
        });
        describe("from()", () => {
            it("Iterable", () => expect(from([1, 2, 3])).to.equalSequence([1, 2, 3]));
            it("ArrayLike", () => expect(from({ 0: 1, 1: 2, 2: 3, length: 3 })).to.equalSequence([1, 2, 3]));
            preconditions("source", MustBeQueryable, source => from(source));
        });
        describe("range()", () => {
            it("same", () => expect(range(1, 1)).to.equalSequence([1]));
            it("low to high", () => expect(range(1, 3)).to.equalSequence([1, 2, 3]));
            it("low to high by 2", () => expect(range(1, 3, 2)).to.equalSequence([1, 3]));
            it("high to low", () => expect(range(3, 1)).to.equalSequence([3, 2, 1]));
            it("high to low by 2", () => expect(range(3, 1, 2)).to.equalSequence([3, 1]));
            preconditions("start", MustBeFiniteNumber, value => range(value, 3));
            preconditions("end", MustBeFiniteNumber, value => range(1, value));
            preconditions("increment", MustBePositiveNonZeroFiniteNumberOrUndefined, value => range(1, 3, value));
        });
        describe("repeat()", () => {
            it("0 times", () => expect(repeat("a", 0)).to.equalSequence([]));
            it("5 times", () => expect(repeat("a", 5)).to.equalSequence(["a", "a", "a", "a", "a"]));
            preconditions("count", MustBePositiveFiniteNumber, value => repeat("a", value));
        });
        describe("hierarchy()", () => {
            preconditions("hierarchy", MustBeHierarchyProvider, hierarchy_ => hierarchy({}, hierarchy_));
        });
    });
}