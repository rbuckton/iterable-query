// @ts-check
const { Sandbox } = require("../out/sandbox");
const sandbox = new Sandbox({
    context: global,
    resolve: request => request === "typescript" ? require.resolve("typescript") : undefined
});
const typedoc = /** @type {typeof import("gulp-typedoc")} */(sandbox.require("gulp-typedoc"));

/**
 * @param {import("gulp-typedoc").Options & { tsconfig?: string, plugin?: string[], excludeNotExported?: boolean, toc?: string[] }} options
 */
module.exports = function (options) {
    return typedoc(options);
}
