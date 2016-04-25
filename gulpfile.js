var fs = require('fs')
  , path = require("path")
  , gulp = require('gulp')
  , ts = require('gulp-typescript')
  , typescript = require('typescript')
  , sourcemaps = require('gulp-sourcemaps')
  , gutil = require("gulp-util")
  , del = require('del')
  , mocha = require('gulp-mocha')
  , istanbul = require('gulp-istanbul')
  , merge = require('merge2');

var lib = {
    project: "src/lib/tsconfig.json",
    src: ["src/lib/**/*.ts"],
    base: "src/lib",
    out: "out/lib"
};

var es5 = {
    project: "src/es5/tsconfig.json",
    src: [
        "src/es5/**/*.ts",
        "!src/es5/typings/browser/**/*",
        "!src/es5/typings/browser.d.ts"
    ],
    base: "src/es5",
    out: "out/es5"
}

var tests = {
    project: "src/tests/tsconfig.json",
    src: ["src/tests/*.ts", "src/tests/typings/main.d.ts"],
    base: "src/tests",
    out: "out/tests",
    main: "out/tests/index.js",
    coverage: {
        thresholds: {
            global: 80
        }
    }
};

var useCoverage = false;

gulp.task("build:lib", build(lib));
gulp.task("build:es5", build(es5));
gulp.task("build:tests", build(tests));
gulp.task("build", ["build:lib", "build:es5", "build:tests"]);
gulp.task("clean", cb => del("out", cb));
gulp.task("cover", setCoverage());
gulp.task("test:pre-test", ["build"], preTest());
gulp.task("test", ["test:pre-test"], test(tests));
gulp.task("watch", watch([].concat(lib.src, es5.src, tests.src), ["test"]));
gulp.task("default", ["test"]);

function build(opts) {
    return function () {
        var tee = gulp
            .src(opts.src, { base: opts.base || "src" })
            .pipe(sourcemaps.init())
            .pipe(ts(ts.createProject(opts.project, {
                typescript: typescript
            })));
        var sourceRoot = opts.sourceRoot
            || path.posix.relative(opts.out || "out", opts.base || "src");
        return merge([
            tee.dts.pipe(gulp.dest(opts.out || "out")),
            tee.js
                .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: sourceRoot }))
                .pipe(gulp.dest(opts.out || "out"))
        ]);
    };
}

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
            .pipe(mocha({ reporter: 'dot' }));
        return useCoverage
            ? stream
                .pipe(istanbul.writeReports({ reporters: ["text", "html"] }))
                .pipe(istanbul.enforceThresholds(opts.coverage))
            : stream;
    };
}

function watch(src, tasks) {
    return function () {
        return gulp.watch(src, tasks);
    };
}