import "source-map-support/register";
import { Sandbox } from "vm-sandbox";

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

const es5 = new Sandbox({
    base: __dirname,
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

const es2015 = new Sandbox({
    base: __dirname,
    context: {
        ...globals,
        ...es6Globals,
        ...nodeGlobals,
        ...mochaGlobals
    },
    paths: {
        "../lib/*": ["../es2015/*"] // redirect 'lib' to 'es2015' build
    },
    requires
});

const es2017 = new Sandbox({
    base: __dirname,
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

describe("es5", () => {
    es5.require("./chai-iterable");
    es5.require("./collections");
    es5.require("./query");
    es5.require("./asyncQuery");
});

describe("es2015", () => {
    es2015.require("./chai-iterable");
    es2015.require("./query");
    es2015.require("./asyncQuery");
});

describe("es2017", () => {
    es2017.require("./chai-iterable");
    es2017.require("./query");
    es2017.require("./asyncQuery");
});
