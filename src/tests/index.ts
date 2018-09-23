import "source-map-support/register";
import { Sandbox } from "./sandbox";

const requires = {
    "mocha": require("mocha"),
    "source-map-support": require("source-map-support")
};

const globals = {
    // Reuse error constructors to support 'chai'
    Error,
    TypeError,
    RangeError,
    SyntaxError,
    ReferenceError
};

const es6Globals = {
};

const es5Globals = {
    Map: undefined as undefined,
    Set: undefined as undefined,
    WeakMap: undefined as undefined,
    WeakSet: undefined as undefined
};

const mochaGlobals = {
    describe,
    xdescribe,
    it,
    xit,
    before,
    beforeEach,
    after,
    afterEach
};

const nodeGlobals = {
    process,
    Buffer
};

const es5 = new Sandbox(__dirname, {
    context: {
        ...globals,
        ...es5Globals,
        ...nodeGlobals,
        ...mochaGlobals
    },
    paths: {
        "../lib/*": ["../es5/*"] // redirect 'lib' to 'es5' build
    },
    requires
});

const es6 = new Sandbox(__dirname, {
    context: {
        ...globals,
        ...es6Globals,
        ...nodeGlobals,
        ...mochaGlobals
    },
    paths: {
    },
    requires
});

describe("es6", () => {
    es6.require("./chai-iterable");
    es6.require("./query");
    es6.require("./asyncQuery");
});
describe("es5", () => {
    es5.require("./chai-iterable");
    es5.require("./collections");
    es5.require("./query");
    es5.require("./asyncQuery");
});