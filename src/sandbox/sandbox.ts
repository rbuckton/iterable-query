/*!
  Copyright 2018 Ron Buckton (rbuckton@chronicles.org)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

import * as path from "path";
import * as vm from "vm";
import NodeJSModule from "module";
import { Resolver } from "./resolver";
import { nodeModulePaths, removeShebang, runInContext, resolveLookupPaths, captureStackTrace } from "./utils";

export interface Options {
    base?: string;
    context?: vm.Context;
    requires?: Requires;
    paths?: Paths;
    resolve?: (request: string, parent?: NodeModule, options?: { paths?: string[] }) => string | undefined;
    extensions?: NodeExtensions;
}

export interface Paths {
    [pattern: string]: ReadonlyArray<string>;
}

export interface Requires {
    [id: string]: any;
}

export class Sandbox {
    readonly context: vm.Context;
    readonly global: object;
    readonly cache: Record<string, NodeModule> = Object.create(null);
    readonly extensions: NodeExtensions = Object.create(null);
    readonly Module: typeof NodeJS.Module;

    private _resolver: Resolver;
    private _options: Options;

    constructor(options: Options = {}) {
        let base = options.base;
        if (!base) {
            const frames = captureStackTrace(new.target, 0);
            const caller = frames[0];
            base = caller && caller.getFileName() || undefined;
            if (!base) throw new Error("Could not determine base. Please set 'base' in options.");
        }
        this._resolver = new Resolver(base, options.paths);
        this._options = options;
        this.context = options.context === global ? global : vm.createContext(options.context || {});
        this.global = this.context === global ? global : vm.runInContext("const global = this; this", this.context);
        Object.assign(this.extensions, require.extensions);
        Object.assign(this.extensions, options.extensions);
        this.Module = makeModuleConstructor(this);
    }

    require(request: string) {
        return this.load(request);
    }

    module(request: string, parent?: NodeModule) {
        return getModule(this._loadCore(request, parent));
    }

    load(request: string, parent?: NodeModule): any {
        return getExports(this._loadCore(request, parent));
    }

    resolve(request: string, parent?: NodeModule, options?: { paths?: string[] }) {
        return this._options.resolve && this._options.resolve(request, parent, options)
            || this._resolver.resolve(request, parent && getNodeModule(parent), options);
    }

    private _loadCore(request: string, parent?: NodeModule): LoadResult {
        const filename = this.resolve(request, parent);
        if (typeof filename !== "string") throw new TypeError();
        return this._tryLoadFromCache(filename, parent)
            || this._tryLoadModuleModule(request)
            || this._tryLoadBuiltin(request)
            || this._tryLoadCustom(request)
            || this._loadModule(filename, parent);
    }

    private _tryLoadFromCache(filename: string, parent: NodeModule | undefined): LoadResult | undefined {
        const cachedModule = this.cache[filename];
        if (cachedModule) {
            if (parent && parent.children.indexOf(cachedModule) === -1) {
                parent.children.push(cachedModule);
            }
            return { kind: "module", module: cachedModule };
        }
        return undefined;
    }

    private _tryLoadModuleModule(request: string): LoadResult | undefined {
        return request === "module"
            ? { kind: "intercept", exports: this.Module }
            : undefined;
    }

    private _tryLoadCustom(request: string): LoadResult | undefined {
        const intercept = this._options.requires && this._options.requires[request];
        return intercept
            ? { kind: "intercept", exports: intercept }
            : undefined;
    }

    private _tryLoadBuiltin(request: string): LoadResult | undefined {
        return NodeJSModule.builtinModules.includes(request)
            ? { kind: "builtin", exports: require(request) }
            : undefined;
    }

    private _loadModule(filename: string, parent: NodeModule | undefined): LoadResult {
        const module = new this.Module(filename, parent) as InstanceType<ModuleConstructor>;
        this.cache[filename] = module;
        let ok = false;
        try {
            module.load(filename);
            ok = true;
        }
        finally {
            if (!ok) {
                delete this.cache[filename];
            }
        }
        return { kind: "module", module };
    }
}

type ModuleConstructor = ReturnType<typeof makeModuleConstructor>;
type LoadResult =
    | { kind: "module", module: NodeModule }
    | { kind: "intercept" | "builtin", exports: any };

const weakNodeModule = new WeakMap<NodeModule, NodeModule>();

function setNodeModule(sandboxModule: NodeModule, nodeModule: NodeModule) {
    weakNodeModule.set(sandboxModule, nodeModule);
}

function getNodeModule(sandboxModule: NodeModule) {
    const nodeModule = weakNodeModule.get(sandboxModule);
    if (!nodeModule) throw new TypeError("Object not a Module");
    return nodeModule;
}

function makeModuleConstructor(sandbox: Sandbox) {
    class Module {
        static builtinModules: string[];
        static wrapper: string[];
        static Module: typeof Module;
        static _cache: Record<string, NodeModule> = sandbox.cache;
        static _extensions: NodeExtensions = sandbox.extensions;

        parent: Module | null;
        children: Module[];

        constructor(id: string, parent?: NodeModule) {
            if (typeof id !== "string") throw new TypeError();
            if (parent && !getNodeModule(parent)) throw new TypeError();
            this.parent = parent as Module | null;
            this.children = [];
            if (this.parent) this.parent.children.push(this);
            setNodeModule(this, new NodeJSModule(id, (this.parent && getNodeModule(this.parent)) as NodeModule | undefined));
        }

        get id(): string { return getNodeModule(this).id; }

        get filename(): string { return getNodeModule(this).filename; }
        set filename(value) { getNodeModule(this).filename = value; }

        get loaded(): boolean { return getNodeModule(this).loaded; }
        set loaded(value) { getNodeModule(this).loaded = value; }

        get exports(): any { return getNodeModule(this).exports; }
        set exports(value) { getNodeModule(this).exports = value; }

        get paths(): string[] { return getNodeModule(this).paths; }
        set paths(value) { getNodeModule(this).paths = value; }

        static runMain(): void { throw new Error("Not supported"); }

        static wrap(content: string) {
            return this.wrapper[0] + content + this.wrapper[1];
        }

        // static _load(filename: string, parent?: Module): any {
        //     if (typeof filename !== "string") throw new TypeError();
        //     if (parent && !(parent instanceof Module)) throw new TypeError();
        //     return sandbox.load(filename, parent);
        // }

        require(id: string): any {
            if (typeof id !== "string") throw new TypeError();
            if (id.length === 0) throw new TypeError();
            return sandbox.load(id, this);
        }

        load(filename: string) {
            if (typeof filename !== "string") throw new TypeError();
            if (this.loaded) throw new Error();
            this.filename = filename;
            this.paths = nodeModulePaths(path.dirname(filename));
            let extension = path.extname(filename) || ".js";
            if (!Module._extensions[extension]) extension = ".js";
            Module._extensions[extension](this, filename);
            this.loaded = true;
        }

        _compile(content: string, filename: string) {
            const wrapper = Module.wrap(removeShebang(content));
            const compiledWrapper = runInContext(
                wrapper,
                sandbox.context,
                {
                    filename,
                    lineOffset: 0,
                    displayErrors: true
                });
            return compiledWrapper.call(
                this.exports,
                this.exports,
                makeRequire(sandbox, this),
                this,
                filename,
                path.dirname(filename));
        }
    };

    Module.Module = Module;
    Module.builtinModules = NodeJSModule.builtinModules;
    Module.wrapper = [`(function (exports, require, module, __filename, __dirname) { `, `\n});`];
    return Module;
}

function makeRequire(sandbox: Sandbox, module: NodeModule): NodeRequire {
    function require(id: string) { return module.require(id); }
    function resolve(id: string, options?: { paths?: string[]; }) { return sandbox.resolve(id, module, options); }
    function paths(id: string) { return resolveLookupPaths(id, module, /*newReturn*/ true); }
    resolve.paths = paths;
    require.resolve = resolve;
    require.cache = sandbox.cache;
    require.extensions = sandbox.extensions;
    require.main = process.mainModule!;
    return require;
}

function getExports(result: LoadResult) {
    return result.kind === "module" ? result.module.exports : result.exports;
}

function getModule(result: LoadResult) {
    return result.kind === "module" ? result.module : undefined;
}
