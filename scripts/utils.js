// @ts-check

const log = require("fancy-log");
/** @type {*} */
const chalk = require("chalk");
const { spawn } = require("child_process");
const { CancellationToken, CancelError, Deferred } = require("prex");

const isWindows = /^win/.test(process.platform);

/**
 * Executes the provided command once with the supplied arguments.
 * @param {string} cmd
 * @param {string[]} args
 * @param {ExecOptions} [options]
 *
 * @typedef ExecOptions
 * @property {boolean} [ignoreExitCode]
 * @property {import("prex").CancellationToken} [cancelToken]
 * @property {boolean} [hidePrompt]
 */
function exec(cmd, args, options = {}) {
    return /**@type {Promise<{exitCode: number}>}*/(new Promise((resolve, reject) => {
        const { ignoreExitCode, cancelToken = CancellationToken.none } = options;
        cancelToken.throwIfCancellationRequested();

        // TODO (weswig): Update child_process types to add windowsVerbatimArguments to the type definition
        const subshellFlag = isWindows ? "/c" : "-c";
        const command = isWindows ? [possiblyQuote(cmd), ...args] : [`${cmd} ${args.join(" ")}`];

        if (!options.hidePrompt) log(`> ${chalk.green(cmd)} ${args.join(" ")}`);
        const proc = spawn(isWindows ? "cmd" : "/bin/sh", [subshellFlag, ...command], { stdio: "inherit", windowsVerbatimArguments: true });
        const registration = cancelToken.register(() => {
            log(`${chalk.red("killing")} '${chalk.green(cmd)} ${args.join(" ")}'...`);
            proc.kill("SIGINT");
            proc.kill("SIGTERM");
            reject(new CancelError());
        });
        proc.on("exit", exitCode => {
            registration.unregister();
            if (exitCode === 0 || ignoreExitCode) {
                resolve({ exitCode });
            }
            else {
                reject(new Error(`Process exited with code: ${exitCode}`));
            }
        });
        proc.on("error", error => {
            registration.unregister();
            reject(error);
        });
    }));
}
exports.exec = exec;

/**
 * @param {string} cmd
 */
function possiblyQuote(cmd) {
    return cmd.indexOf(" ") >= 0 ? `"${cmd}"` : cmd;
}


class Debouncer {
    /**
     * @param {number} timeout
     * @param {() => Promise<any>} action
     */
    constructor(timeout, action) {
        this._timeout = timeout;
        this._action = action;
    }

    enqueue() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = undefined;
        }

        if (!this._deferred) {
            this._deferred = new Deferred();
        }

        this._timer = setTimeout(() => this.run(), 100);
        return this._deferred.promise;
    }

    run() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = undefined;
        }

        const deferred = this._deferred;
        this._deferred = undefined;
        this._projects = undefined;
        try {
            deferred.resolve(this._action());
        }
        catch (e) {
            deferred.reject(e);
        }
    }
}
exports.Debouncer = Debouncer;