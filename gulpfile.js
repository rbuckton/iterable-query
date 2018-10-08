// @ts-check
const fs = require('fs');
const gulp = require('gulp');
const del = require('del');
const path = require('path');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const { build } = require("./scripts/build");
const minimist = require("minimist");
const typedoc = require("./scripts/typedoc");
const options = /** @type {minimist.ParsedArgs & {force: boolean, verbose: boolean | "minimal"}} */ (minimist(process.argv.slice(2), {
    boolean: ["force", "verbose"],
    alias: { "f": "force" },
    default: { force: false, verbose: "minimal" }
}));

var useCoverage = false;
var watching = false;

gulp.task("typedoc", build("src/typedoc/plugin"));
gulp.task("build:lib", build("src/lib/tsconfig.json", { force: options.force, verbose: options.verbose }));
gulp.task("build:es2015", build("src/lib/tsconfig.es2015.json", { force: options.force, verbose: options.verbose }));
gulp.task("build:es5", build("src/lib/tsconfig.es5.json", { force: options.force, verbose: options.verbose }));
gulp.task("build:tests", ["build:lib", "build:es2015", "build:es5"], build("src/tests/tsconfig.json", { force: options.force, verbose: options.verbose }));
gulp.task("build", ["build:lib", "build:es2015", "build:es5", "build:tests"]);
gulp.task("clean:dist", () => del("dist"));
gulp.task("clean:docs", () => del("docs"));
gulp.task("clean", ["clean:dist", "clean:docs"]);
gulp.task("cover", setCoverage());
gulp.task("test:pre-test", ["build"], preTest());
gulp.task("test", ["test:pre-test"], test({ main: "dist/tests/index.js", coverage: { thresholds: { global: 80 } } }));
gulp.task("watch", watch(["src/**/*"], ["test"]));
gulp.task("default", ["test"]);
gulp.task("docs", ["typedoc"], () => gulp.src("src/lib/**/*.ts", { read: false })
    .pipe(typedoc({
        tsconfig: "src/lib/tsconfig.typedoc.json",
        out: "docs",
        mode: "modules",
        theme: "src/typedoc/theme",
        gitRevision: "master",
        excludePrivate: true,
        excludeNotExported: true,
        excludeEmpty: true,
        groupCategories: true,
        renameModuleToNamespace: true,
        categoryOrder: ["Query", "Scalar", "Subquery", "Order", "Join", "Hierarchy", "*", "Other"],
        biblio: "./biblio.json",
        plugin: [
            require.resolve("./dist/typedoc/plugin"),
            "typedoc-plugin-external-module-name",
        ]
    })));
gulp.task("prepublishOnly", ["clean"], () => gulp.start(["build", "docs"]));

function setCoverage() {
    return function () {
        useCoverage = true;
    };
}

function preTest() {
    return function () {
        if (useCoverage) {
            return gulp.src(['dist/lib/*.js', 'dist/es5/*.js'])
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