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

import Module = require("module");
import * as vm from "vm";
import * as path from "path";

export function removeShebang(source: string) {
    return source.replace(/^\#\!.*/, '');
}

export function nodeModulePaths(dirname: string): string[] {
    return (<any>Module)._nodeModulePaths(dirname);
}

export function isModuleId(text: string) {
    return !path.isAbsolute(text)
        && text.length > 0 && text.charAt(0) !== ".";
}

export function resolvePath(base: string, value: string) {
    return isModuleId(value) ? value : path.resolve(base, value);
}

export function resolveFilename(request: string, parent: Module, isMain: boolean, options?: { paths?: string[]; }): string {
    return (<any>Module)._resolveFilename(request, parent, isMain, options);
}

export function resolveLookupPaths(request: string, parent: Module, newReturn?: boolean): string[] {
    return (<any>Module)._resolveLookupPaths(request, parent, newReturn);
}

export function findPath(request: string, paths: string[], isMain = false): string | false {
    return (<any>Module)._findPath(request, paths, isMain);
}

export function runInContext(content: string, context: vm.Context | undefined, options: string | vm.RunningScriptOptions) {
    return context === global || context === undefined
        ? vm.runInThisContext(content, options)
        : vm.runInContext(content, context, options);
}

export function captureStackTrace(stackCrawlMark: Function = captureStackTrace, skipFrames = 0) {
    const savedPrepareStackTrace = Error.prepareStackTrace;
    try {
        let result: NodeJS.CallSite[] | undefined;
        Error.prepareStackTrace = function (_, callSites) {
            result = callSites.slice(skipFrames);
            return "";
        };
        const dummy: { stack?: string } = {};
        Error.captureStackTrace(dummy, stackCrawlMark);
        noop(dummy.stack);
        return result || [];
    }
    finally {
        Error.prepareStackTrace = savedPrepareStackTrace;
    }
}

function noop(_: any) {}