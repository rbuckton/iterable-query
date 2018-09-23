import Module = require("module");
import * as path from "path";
import * as vm from "vm";
import * as fs from "fs";

export interface SandboxOptions {
    context?: vm.Context;
    paths?: Paths;
    requires?: Requires;
}

export interface Paths {
    readonly [pattern: string]: ReadonlyArray<string>;
}

export interface Requires {
    readonly [id: string]: any;
}

export class Sandbox {
    readonly context: vm.Context;
    readonly global: vm.Context;
    readonly SandboxModule: SandboxModuleConstructor;

    private _resolver: Resolver;
    private _requires: Requires | undefined;

    constructor(base: string, options: SandboxOptions = {}) {
        const sandbox = this;

        this.context = vm.createContext(options.context || {});
        this.global = vm.runInContext("this", this.context);
        this._resolver = new Resolver(base, options.paths);
        this._requires = options.requires;

        class Module extends SandboxModule {
            constructor(id: string, parent?: SandboxModule) {
                super(sandbox, id, parent);
            }
        }

        Module.builtinModules = Module.builtinModules;
        Module.wrapper = [`(function (exports, require, module, __filename, __dirname, global) { `, `\n});`];
        Module._cache = Object.create(null);
        Module._extensions = Object.create(null);
        Module._extensions[".js"] = (module, filename) => { module._compile(fs.readFileSync(filename, "utf8"), filename); };
        Module._extensions[".json"] = (_module, filename) => { module.exports = require(this._resolver.resolve(filename)) };
        Module._extensions[".node"] = (_module, filename) => { module.exports = require(this._resolver.resolve(filename)) };
        Module["_sandbox"] = this;

        this.SandboxModule = Module;
    }

    require(request: string) {
        return this._load(request);
    }

    private _load(request: string, parent?: SandboxModule): any {
        const filename = this._resolve(request, parent);
        if (typeof filename !== "string") throw new TypeError(typeof filename);

        const cachedModule = this.SandboxModule._cache[filename];
        if (cachedModule) {
            if (parent && parent.children.indexOf(cachedModule) === -1) {
                parent.children.push(cachedModule);
            }
            return cachedModule.exports;
        }

        if (request === "module") {
            return this.SandboxModule;
        }

        const intercept = this._requires && this._requires[request];
        if (intercept) {
            return intercept;
        }

        if (Module.builtinModules.includes(request)) {
            return require(request);
        }

        const SandboxModule = this.SandboxModule;
        const module = new SandboxModule(filename, parent);
        SandboxModule._cache[filename] = module;

        let ok = false;
        try {
            module.load(filename);
            ok = true;
        }
        finally {
            if (!ok) {
                delete SandboxModule._cache[filename];
            }
        }

        return module.exports;
    }

    private _resolve(request: string, parent?: SandboxModule) {
        if (parent && !(parent instanceof this.SandboxModule)) throw new TypeError();
        return this._resolver.resolve(request, parent && parent["_module"]);
    }

    private _nodeModulePaths(dirname: string) {
        return (<any>Module)._nodeModulePaths(dirname) as string[];
    }

    private _makeRequire(module: SandboxModule) {
        if (!(module instanceof this.SandboxModule)) throw new TypeError();
        const require = ((id: string) => module.require(id)) as NodeRequire;
        const resolve = ((id: string) => this._resolve(id, module)) as RequireResolve;
        require.resolve = resolve;
        return require;
    }
}

type Base<T> = { [P in keyof T]: T[P] };

interface SandboxModuleConstructor extends Base<typeof SandboxModule> {
    new (id: string, parent?: SandboxModule): SandboxModule;
}

class SandboxModule {
    static builtinModules: string[];
    static wrapper: string[];
    static _cache: Record<string, SandboxModule>;
    static _extensions: Record<string, (module: SandboxModule, filename: string) => void>;

    private static _sandbox: Sandbox;

    parent: SandboxModule | undefined;
    children: SandboxModule[];

    private _module: Module;
    private _sandbox: Sandbox;

    constructor(sandbox: Sandbox, id: string, parent?: SandboxModule) {
        if (!(sandbox instanceof Sandbox)) throw new TypeError();
        if (typeof id !== "string") throw new TypeError();
        if (parent && !(parent instanceof sandbox.SandboxModule)) throw new TypeError();
        this.parent = parent;
        this.children = [];
        if (parent) this.parent.children.push(this);
        this._sandbox = sandbox;
        this._module = new Module(id, parent && parent._module);
    }

    static get Module() { return this; }

    get id() { return this._module.id; }

    get filename() { return this._module.filename; }
    set filename(value) { this._module.filename = value; }

    get loaded() { return this._module.loaded; }
    set loaded(value) { this._module.loaded = value; }

    get exports() { return this._module.exports; }
    set exports(value) { this._module.exports = value; }

    get paths() { return this._module.paths; }
    set paths(value) { this._module.paths = value; }

    static wrap(content: string) {
        return this.wrapper[0] + content + this.wrapper[1];
    }

    static _load(filename: string, parent?: SandboxModule): any {
        if (typeof filename !== "string") throw new TypeError();
        if (parent && !(parent instanceof SandboxModule)) throw new TypeError();
        return this._sandbox["_load"](filename, parent);
    }

    require(id: string) {
        if (typeof id !== "string") throw new TypeError();
        if (id.length === 0) throw new TypeError();
        return this._sandbox.SandboxModule._load(id, this);
    }

    load(filename: string) {
        if (typeof filename !== "string") throw new TypeError();
        if (this.loaded) throw new Error();
        this.filename = filename;
        this.paths = this._sandbox["_nodeModulePaths"](path.dirname(filename));
        let extension = path.extname(filename) || ".js";
        if (!this._sandbox.SandboxModule._extensions[extension]) extension = ".js";
        this._sandbox.SandboxModule._extensions[extension](this, filename);
        this.loaded = true;
    }

    _compile(content: string, filename: string) {
        const wrapper = this._sandbox.SandboxModule.wrap(removeShebang(content));
        const compiledWrapper = vm.runInContext(
            wrapper,
            this._sandbox.context,
            {
                filename,
                lineOffset: 0,
                displayErrors: true
            });
        return compiledWrapper.call(
            this.exports,
            this.exports,
            this._sandbox["_makeRequire"](this),
            this,
            filename,
            path.dirname(filename),
            this._sandbox.global);
    }
}

class Resolver {
    readonly base: string;
    readonly paths: Paths | undefined;

    private module: Module;

    constructor(base: string, paths?: Paths) {
        this.base = base;
        this.paths = paths;

        const origin = path.join(this.base, "index.js");
        this.module = new Module(origin);
        this.module.filename = origin;
        this.module.paths = (<any>Module)._nodeModulePaths(path.dirname(origin));
    }

    resolve(request: string, parent = this.module): string {
        if (this.paths) {
            const base = parent ? path.dirname(parent.filename) : this.base;
            const resolved = resolvePath(base, request);
            for (const key in this.paths) {
                const pattern = parsePattern(resolvePath(base, key));
                if (typeof pattern === "string") {
                    if (pattern === resolved) {
                        const result = this.resolvePaths(this.paths[key], parent);
                        if (result) return result;
                    }
                }
                else {
                    const fragment = pattern.exec(resolved);
                    if (fragment) {
                        const result = this.resolveTemplatePaths(fragment, this.paths[key], parent);
                        if (result) return result;
                    }
                }
            }
        }

        return (<any>Module)._resolveFilename(request, parent, false) as string;
    }

    private resolveLookupPaths(request: string, parent = this.module): string[] {
        return (<any>Module)._resolveLookupPaths(request, parent);
    }

    private findPath(request: string, paths: string[]): string | false {
        return (<any>Module)._findPath(request, paths, false);
    }

    private resolveTemplatePaths(fragment: string, templatePaths: ReadonlyArray<string>, parent?: Module) {
        const paths = templatePaths.map(template => {
            const pattern = parsePattern(template);
            return resolvePath(this.base, typeof pattern === "string" ? pattern : pattern.apply(fragment));
        });
        return this.resolvePaths(paths, parent);
    }

    private resolvePaths(paths: ReadonlyArray<string>, parent?: Module) {
        for (const request of paths) {
            const lookupPaths = this.resolveLookupPaths(request, parent);
            const resolved = this.findPath(request, lookupPaths);
            if (resolved) return resolved;
        }
        return false;
    }
}

function removeShebang(source: string) {
    return source.replace(/^\#\!.*/, '');
}

function isModuleId(text: string) {
    return !path.isAbsolute(text)
        && text.length > 0 && text.charAt(0) !== ".";
}

function resolvePath(base: string, value: string) {
    return isModuleId(value) ? value : path.resolve(base, value);
}

class Pattern {
    prefix: string;
    suffix: string;

    constructor(prefix: string, suffix: string) {
        this.prefix = prefix;
        this.suffix = suffix;
    }

    exec(input: string) {
        if (input.length >= this.prefix.length + this.suffix.length &&
            input.startsWith(this.prefix) &&
            input.endsWith(this.suffix)) {
            return input.slice(this.prefix.length, input.length - this.suffix.length);
        }
        return null;
    }

    apply(value: string) {
        return this.prefix + value + this.suffix;
    }

    toString() {
        return `${this.prefix}*${this.suffix}`;
    }
}

function parsePattern(pattern: string) {
    const starIndex = pattern.indexOf("*");
    if (starIndex === -1) return undefined;
    const prefix = pattern.slice(0, starIndex);
    const suffix = pattern.slice(starIndex + 1);
    return new Pattern(prefix, suffix);
}
