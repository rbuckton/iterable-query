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
import NodeModule = require("module");
import { Paths } from "./sandbox";
import { Pattern } from "./paths";
import { nodeModulePaths, resolvePath, resolveFilename, resolveLookupPaths, findPath } from "./utils";

export class Resolver {
    readonly base: string;
    readonly paths: Paths | undefined;

    private module: NodeModule;

    constructor(base: string, paths?: Paths) {
        this.base = base;
        this.paths = paths;

        const origin = path.join(this.base, "index.js");
        this.module = new NodeModule(origin);
        this.module.filename = origin;
        this.module.paths = nodeModulePaths(path.dirname(origin));
    }

    resolve(request: string, parent = this.module, options?: { paths?: string[] }): string {
        if (this.paths) {
            const base = parent ? path.dirname(parent.filename) : this.base;
            const resolved = resolvePath(base, request);
            for (const key in this.paths) {
                const pattern = Pattern.parse(resolvePath(base, key));
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

        return resolveFilename(request, parent, false, options);
    }

    private resolveTemplatePaths(fragment: string, templatePaths: ReadonlyArray<string>, parent: NodeModule) {
        const paths = templatePaths.map(template => {
            const pattern = Pattern.parse(template);
            return resolvePath(this.base, typeof pattern === "string" ? pattern : pattern.apply(fragment));
        });
        return this.resolvePaths(paths, parent);
    }

    private resolvePaths(paths: ReadonlyArray<string>, parent: NodeModule) {
        for (const request of paths) {
            const lookupPaths = resolveLookupPaths(request, parent);
            const resolved = findPath(request, lookupPaths);
            if (resolved) return resolved;
        }
        return false;
    }
}