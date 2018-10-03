// @ts-check
const gulp = require('gulp');
const del = require('del');
const path = require('path');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const { build } = require("./scripts/build");
const minimist = require("minimist");
const typedoc = require("./scripts/typedoc");
const merge2 = require("merge2");
const options = /** @type {minimist.ParsedArgs & {force: boolean, verbose: boolean | "minimal"}} */ (minimist(process.argv.slice(2), {
    boolean: ["force", "verbose"],
    alias: { "f": "force" },
    default: { force: false, verbose: "minimal" }
}));

var useCoverage = false;
var watching = false;

gulp.task("build:sandbox", build("src/sandbox/tsconfig.json"));
gulp.task("build:typedoc-plugin-custom", build("src/typedoc-plugin-custom/tsconfig.json", {
    after: stream => merge2([stream, gulp.src(["src/typedoc-plugin-custom/theme/**/*", "!src/typedoc-plugin-custom/theme/**/*.ts"], { base: "src/typedoc-plugin-custom" })])
}));
gulp.task("build:lib", build("src/lib/tsconfig.json", { force: options.force, verbose: options.verbose }));
gulp.task("build:es2015", build("src/lib/tsconfig.es2015.json", { force: options.force, verbose: options.verbose }));
gulp.task("build:es5", build("src/lib/tsconfig.es5.json", { force: options.force, verbose: options.verbose }));
gulp.task("build:tests", ["build:lib", "build:es2015", "build:es5", "build:sandbox"], build("src/tests/tsconfig.json", { force: options.force, verbose: options.verbose }));
gulp.task("build", ["build:lib", "build:es2015", "build:es5", "build:tests"]);
gulp.task("clean", cb => del("out", cb));
gulp.task("cover", setCoverage());
gulp.task("test:pre-test", ["build"], preTest());
gulp.task("test", ["test:pre-test"], test({ main: "out/tests/index.js", coverage: { thresholds: { global: 80 } } }));
gulp.task("watch", watch(["src/**/*"], ["test"]));
gulp.task("default", ["test"]);
gulp.task("docs", ["build:sandbox", "build:typedoc-plugin-custom"], () => gulp.src("src/lib/**/*.ts", { read: false })
    .pipe(typedoc({
        out: "docs",
        mode: "modules",
        excludePrivate: true,
        plugin: [
            "typedoc-plugin-markdown",
            "typedoc-plugin-internal-external",
            "typedoc-plugin-external-module-name",
            require.resolve("./out/typedoc-plugin-custom")
        ],
        theme: "out/typedoc-plugin-custom/theme",
        tsconfig: "src/lib/tsconfig.typedoc.json"
    })));

function setCoverage() {
    return function () {
        useCoverage = true;
    };
}

function preTest() {
    return function () {
        if (useCoverage) {
            return gulp.src(['out/lib/*.js', 'out/es5/*.js'])
                .pipe(istanbul())
                .pipe(istanbul.hookRequire());
        }
    };
}

function test(opts) {
    return function () {
        var stream = gulp
            .src(opts.main, { read: false })
            .pipe(mocha({ reporter: watching ? 'min' : 'dot' }));
        return useCoverage
            ? stream
                .pipe(istanbul.writeReports({ reporters: ["text", "html"] }))
                .pipe(istanbul.enforceThresholds(opts.coverage))
            : stream;
    };
}

function watch(src, tasks) {
    return function () {
        watching = true;
        return gulp.watch(src, tasks);
    };
}