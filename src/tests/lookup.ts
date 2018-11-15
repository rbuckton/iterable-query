import { expect } from "chai";
import { Lookup, from } from "../lib";

describe("lookup", () => {
    it("constructor()", () => {
        const lookup = new Lookup([["a", [1, 2]], ["b", [3, 4]]]);
        expect(lookup.size).to.equal(2);
    });
    it("has()", () => {
        const lookup = new Lookup([["a", [1, 2]], ["b", [3, 4]]]);
        expect(lookup.has("a")).to.be.true;
        expect(lookup.has("c")).to.be.false;
    });
    it("get()", () => {
        const lookup = new Lookup([["a", [1, 2]], ["b", [3, 4]]]);
        expect(lookup.get("a")).to.equalSequence([1, 2]);
    });
    it("applyResultSelector()", () => {
        const lookup = new Lookup([["a", [1, 2]], ["b", [3, 4]]]);
        expect([...lookup.applyResultSelector((key, values) => [key, ...from(values)])]).to.deep.equal([["a", 1, 2], ["b", 3, 4]]);
    });
});