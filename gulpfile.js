// @ts-check
const gulp = require('gulp');
const del = require('del');
const minimist = require("minimist");
const typedoc = require("./scripts/typedoc");
const coverage = require("./scripts/coverage");
const { buildProject } = require("./scripts/projects");
const { mocha } = require("./scripts/mocha");

const options = /** @type {minimist.ParsedArgs & Options} */ (minimist(process.argv.slice(2), {
    boolean: ["force", "verbose", "coverage"],
    alias: { "f": "force" },
    default: { force: false, verbose: "minimal", coverage: true }
}));

let useDebug = process.env.npm_lifecycle_event !== "prepublishOnly";
let watching = false;

gulp.task("typedoc", () => buildProject("src/typedoc/plugin/tsconfig.json"));
gulp.task("build:lib", () => buildProject("src/lib/tsconfig.json", { force: options.force }));
gulp.task("build:es2015", () => buildProject("src/lib/tsconfig.es2015.json", { force: options.force }));
gulp.task("build:es5", () => buildProject("src/lib/tsconfig.es5.json", { force: options.force }));
gulp.task("build:tests", ["build:lib", "build:es2015", "build:es5"], () => buildProject("src/tests/tsconfig.json", { force: options.force }));
gulp.task("build", ["build:lib", "build:es2015", "build:es5", "build:tests"]);
gulp.task("clean:dist", () => del("dist"));
gulp.task("clean:docs", () => del("docs"));
gulp.task("clean", ["clean:dist", "clean:docs"]);
gulp.task("test", ["build"], test({ main: "dist/tests/index.js" }));
gulp.task("watch", watch(["src/**/*"], ["test"]));
gulp.task("default", ["docs", "test"]);
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
        noJekyll: true,
        categoryOrder: ["Query", "Scalar", "Subquery", "Order", "Join", "Hierarchy", "*", "Other"],
        biblio: "./biblio.json",
        plugin: [
            require.resolve("./dist/typedoc/plugin"),
            "typedoc-plugin-external-module-name",
        ]
    })));
gulp.task("prepublishOnly", ["clean"], () => gulp.start(["test", "docs"]));

/**
 * @param {{ main: string; }} opts
 */
function test(opts) {
    return async function () {
        let coverageTempDirectory;
        if (options.coverage) {
            coverageTempDirectory = "./coverage/tmp";
            await coverage.init(coverageTempDirectory);
        }

        await mocha({ files: [opts.main], reporter: watching ? "min" : "dot", coverageTempDirectory });

        if (options.coverage) {
            await coverage.write({
                exclude: ["coverage/**", "**/mode_modules/**", "dist/tests/**", "dist/{es2015,lib}/compat/**"],
                reporter: ["html"],
                tempDirectory: coverageTempDirectory
            });
        }
    };
}

/**
 * @param {string[]} src
 * @param {string[]} tasks
 */
function watch(src, tasks) {
    return function () {
        watching = true;
        return gulp.watch(src, tasks);
    };
}

/**
 * @typedef Options
 * @property {boolean} force
 * @property {boolean|"minimal"} verbose
 * @property {boolean} coverage
 */
void 0;