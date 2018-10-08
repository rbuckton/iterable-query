// @ts-check
const { Sandbox } = require("vm-sandbox");
const sandbox = new Sandbox({
    base: __dirname,
    context: global,
    resolve: request => request === "typescript" ? require.resolve("typescript") : undefined
});

module.exports = /** @type {typeof import("./typedoc.sandbox")} */(sandbox.require("./typedoc.sandbox.js"));