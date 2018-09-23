// @ts-check
var gulp = require('gulp')
  , del = require('del')
  , mocha = require('gulp-mocha')
  , istanbul = require('gulp-istanbul')
  , { build } = require("./build/project");

var useCoverage = false;
var watching = false;

gulp.task("build:lib", build("src/lib/tsconfig.json"));
gulp.task("build:es5", build("src/lib/tsconfig.es5.json"));
gulp.task("build:tests", ["build:lib", "build:es5"], build("src/tests/tsconfig.json"));
gulp.task("build", ["build:lib", "build:tests", "build:es5"]);
gulp.task("clean", cb => del("out", cb));
gulp.task("cover", setCoverage());
gulp.task("test:pre-test", ["build"], preTest());
gulp.task("test", ["test:pre-test"], test({ main: "out/tests/index.js", coverage: { thresholds: { global: 80 } } }));
gulp.task("watch", watch(["src/**/*"], ["test"]));
gulp.task("default", ["test"]);

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