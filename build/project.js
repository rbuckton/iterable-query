// @ts-check
const path = require("path");
const fs = require("fs");
const tsc = require("gulp-typescript");
const ts = require("typescript");
const gulp = require("gulp");
const gulpif = require("gulp-if");
const sourcemaps = require("gulp-sourcemaps");
const upToDate = require("./upToDate");
const log = require("fancy-log");
const merge2 = require("merge2");

// patch gulp-typescript
const tsc_host = require("gulp-typescript/release/host");
if (!/**@type {*}*/(tsc_host).Host.prototype.readDirectory) {
    /**@type {*}*/(tsc_host).Host.prototype.readDirectory = function (root, extensions, excludes, includes, depth) {
        return this.fallback.readDirectory(root, extensions, excludes, includes, depth);
    };
}

/** @type {Paths} */
const defaultPaths = {
    cwd: normalizeSlashes(process.cwd()), 
    base: normalizeSlashes(process.cwd())
};

/** @type {ts.FormatDiagnosticsHost} */
const defaultFormatDiagnosticsHost = {
    getCanonicalFileName: fileName => fileName,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => ts.sys.newLine
};

/**
 * @param {string} [cwd] 
 * @returns {ts.FormatDiagnosticsHost}
 */
function getFormatDiagnosticsHost(cwd) {
    if (!cwd || cwd === process.cwd()) return defaultFormatDiagnosticsHost;
    return {
        getCanonicalFileName: defaultFormatDiagnosticsHost.getCanonicalFileName,
        getCurrentDirectory: () => cwd,
        getNewLine: defaultFormatDiagnosticsHost.getNewLine
    };
}

/** @type {ts.ParseConfigFileHost} */
const defaultParseConfigFileHost = {
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    fileExists: fileName => ts.sys.fileExists(fileName),
    readFile: fileName => ts.sys.readFile(fileName),
    getCurrentDirectory: () => process.cwd(),
    readDirectory: (rootDir, extensions, exclude, include, depth) => ts.sys.readDirectory(rootDir, extensions, exclude, include, depth),
    onUnRecoverableConfigFileDiagnostic: diagnostic => reportDiagnostics([diagnostic])
};

/**
 * @param {string} [cwd]
 * @returns {ts.ParseConfigFileHost}
 */
function getParseConfigFileHost(cwd) {
    if (!cwd || cwd === defaultPaths.cwd) return defaultParseConfigFileHost;
    return {
        useCaseSensitiveFileNames: defaultParseConfigFileHost.useCaseSensitiveFileNames,
        fileExists: defaultParseConfigFileHost.fileExists,
        readFile: defaultParseConfigFileHost.readFile,
        getCurrentDirectory: () => cwd,
        readDirectory: defaultParseConfigFileHost.readDirectory,
        onUnRecoverableConfigFileDiagnostic: diagnostic => reportDiagnostics([diagnostic], { cwd })
    };
}

/**
 * @param {ts.Diagnostic[]} diagnostics
 * @param {{ cwd?: string, pretty?: boolean }} [options]
 */
function formatDiagnostics(diagnostics, options) {
    return options && options.pretty 
        ? ts.formatDiagnosticsWithColorAndContext(diagnostics, getFormatDiagnosticsHost(options && options.cwd)) 
        : ts.formatDiagnostics(diagnostics, getFormatDiagnosticsHost(options && options.cwd));
}

/**
 * @param {ts.Diagnostic[]} diagnostics
 * @param {{ cwd?: string, pretty?: boolean }} [options]
 */
function reportDiagnostics(diagnostics, options) {
    log(formatDiagnostics(diagnostics, { cwd: options && options.cwd, pretty: process.stdout.isTTY }));
}

/**
 * @param {string} file 
 */
function normalizeSlashes(file) {
    return file.replace(/\\/g, "/");
}

/**
 * @param {string} basePath 
 * @param  {...string} paths 
 */
function resolvePath(basePath, ...paths) {
    return normalizeSlashes(path.resolve(basePath, ...paths));
}

/**
 * @param {string} file 
 */
function fileExists(file) {
    try {
        const stat = fs.statSync(file);
        return stat.isFile();
    }
    catch (e) {
        return false;
    }
}

/**
 * @param {string} projectSpec 
 * @param {{cwd: string, base: string}} paths 
 * @param {ParsedCommandLine} [referrer] 
 */
function resolveProjectSpec(projectSpec, paths, referrer) {
    let projectPath = resolvePath(paths.cwd, referrer && path.dirname(referrer.options.configFilePath) || "", projectSpec);
    if (!fileExists(projectPath)) projectPath = resolvePath(paths.cwd, projectPath, "tsconfig.json");
    return normalizeSlashes(projectPath);
}

/**
 * @param {Partial<Paths>} options
 * @returns {Paths}
 */
function resolvePathOptions(options) {
    const cwd = options && options.cwd ? resolvePath(defaultPaths.cwd, options.cwd) : defaultPaths.cwd;
    const base = options && options.base ? resolvePath(cwd, options.base) : cwd;
    return cwd === defaultPaths.cwd && base === defaultPaths.base ? defaultPaths : { cwd, base };
}

/**
 * @param {string} projectSpec 
 * @param {Paths} paths 
 * @returns {ParsedCommandLine}
 */
function parseProject(projectSpec, paths) {
    return ts.getParsedCommandLineOfConfigFile(projectSpec, {}, getParseConfigFileHost(paths.cwd));
}

/**
 * @param {{cwd: string, base: string}} paths 
 */
function createParseProject(paths) {
    /**
     * @param {string} configFilePath
     */
    function getProject(configFilePath) {
        const projectSpec = resolveProjectSpec(configFilePath, paths, /*referrer*/ undefined);
        const project = parseProject(projectSpec, defaultPaths);
        return project;
    }
    return getProject;
}

/**
 * @param {string} from 
 * @param {string} to 
 */
function relativePath(from, to) {
    let relativePath = normalizeSlashes(path.relative(from, to));
    if (!relativePath) relativePath = ".";
    if (path.isAbsolute(relativePath)) return relativePath;
    if (relativePath.charAt(0) !== ".") relativePath = "./" + relativePath;
    return relativePath;
}


/**
 * @param {ParsedCommandLine} parsedProject 
 * @param {Paths} paths 
 */
function resolveDestPath(parsedProject, paths) {
    let destPath = path.dirname(parsedProject.options.configFilePath);
    if (parsedProject.options.outDir) {
        destPath = resolvePath(paths.cwd, destPath, parsedProject.options.outDir);
    }
    else if (parsedProject.options.outFile || parsedProject.options.out) {
        destPath = path.dirname(resolvePath(paths.cwd, destPath, parsedProject.options.outFile || parsedProject.options.out));
    }
    return relativePath(paths.base, destPath);
}

/**
 * @param {string} projectSpec
 * @param {{force?: boolean, verbose?: boolean | "minimal", cwd?: string, base?: string}} [options] 
 */
function build(projectSpec, options = {}) {
    const paths = resolvePathOptions(options);
    const resolvedProjectSpec = resolveProjectSpec(projectSpec, paths);
    const parseProject = createParseProject(paths);
    const parsedProject = parseProject(resolvedProjectSpec);
    return function () {
        const destPath = resolveDestPath(parsedProject, paths);
        const { sourceMap, inlineSourceMap, inlineSources = false, sourceRoot, declarationMap } = parsedProject.options;
        const sourceMapPath = inlineSourceMap ? undefined : ".";
        const sourceMapOptions = { includeContent: inlineSources, sourceRoot, destPath };
        const project = tsc.createProject(parsedProject.options.configFilePath, { typescript: require("typescript") });
        const stream = project.src()
            .pipe(gulpif(!options.force, upToDate(parsedProject, { verbose: options.verbose, parseProject })))
            .pipe(gulpif(sourceMap || inlineSourceMap, sourcemaps.init()))
            .pipe(project())
        const js = stream.js
            .pipe(gulpif(sourceMap || inlineSourceMap, sourcemaps.write(sourceMapPath, sourceMapOptions)));
        const dts = stream.dts
            .pipe(gulpif(declarationMap, sourcemaps.write(sourceMapPath, sourceMapOptions)));
        return merge2([js, dts])
            .pipe(gulp.dest(destPath));
    };
}
exports.build = build;

/**
 * @typedef {{cwd: string, base: string}} Paths
 * @typedef {import("typescript").CompilerOptions & { configFilePath?: string }} CompilerOptions
 * @typedef {import("typescript").ParsedCommandLine & { options: CompilerOptions }} ParsedCommandLine
 */
void 0;