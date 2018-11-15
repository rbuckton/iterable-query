import { Lazy } from "../lib";
import { expect } from "chai";

describe("Lazy", () => {
    describe("from()", () => {
        it("eval only once", () => {
            let counter = 0;
            const lazy = Lazy.from(() => counter++);
            expect(counter).to.equal(0);
            expect(lazy.hasValue).to.be.false;
            expect(lazy.value).to.equal(0);
            expect(lazy.hasValue).to.be.true;
            expect(counter).to.equal(1);
            expect(lazy.value).to.equal(0);
            expect(counter).to.equal(1);
        });
        it("throws if recursive", () => {
            const lazy: Lazy<any> = Lazy.from(() => lazy.value);
            expect(lazy.hasValue).to.be.false;
            expect(() => lazy.value).to.throw();
            expect(lazy.hasValue).to.be.false;
        });
    });
    describe("for()", () => {
        it("is value", () => {
            const lazy = Lazy.for(0);
            expect(lazy.hasValue).to.be.true;
            expect(lazy.value).to.equal(0);
        })
    });
});