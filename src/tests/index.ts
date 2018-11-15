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

function requireCommon(sandbox: Sandbox) {
    sandbox.require("./chai-iterable");
    sandbox.require("./query");
    sandbox.require("./asyncQuery");
    sandbox.require("./lazy");
    sandbox.require("./lookup");
}

describe("es5", () => {
    requireCommon(es5);
    es5.require("./collections");
});

describe("es2015", () => {
    requireCommon(es2015);
});

describe("es2017", () => {
    requireCommon(es2017);
});
