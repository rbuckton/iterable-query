// @ts-check
const path = require("path");
const { exec, Debouncer } = require("./utils");

class ProjectQueue {
    /**
     * @param {(projects: string[], force: boolean) => Promise<any>} action
     */
    constructor(action) {
        /** @type {{ force: boolean, projects?: string[], debouncer: Debouncer }[]} */
        this._debouncers = [];
        this._action = action;
    }

    /**
     * @param {string} project
     * @param {object} options
     */
    enqueue(project, { force = false } = {}) {
        let entry = this._debouncers.find(entry => entry.force === force);
        if (!entry) {
            const debouncer = new Debouncer(100, async () => {
                const projects = entry.projects;
                if (projects) {
                    entry.projects = undefined;
                    await this._action(projects, force);
                }
            });
            this._debouncers.push(entry = { force, debouncer });
        }
        if (!entry.projects) entry.projects = [];
        entry.projects.push(project);
        return entry.debouncer.enqueue();
    }
}

const projectBuilder = new ProjectQueue((projects, force) => exec(path.resolve("./node_modules/.bin/tsc"), ["-b", ...(force ? ["--force"] : []), ...projects], { hidePrompt: true }));

/**
 * @param {string} project
 * @param {object} [options]
 * @param {boolean} [options.force=false]
 */
exports.buildProject = (project, { force } = {}) => projectBuilder.enqueue(project, { force });

const projectCleaner = new ProjectQueue((projects) => exec(path.resolve("./node_modules/.bin/tsc"), ["-b", "--clean", ...projects], { hidePrompt: true }));

/**
 * @param {string} project
 */
exports.cleanProject = (project) => projectCleaner.enqueue(project);

const projectWatcher = new ProjectQueue((projects) => exec(path.resolve("./node_modules/.bin/tsc"), ["-b", "--watch", ...projects], { hidePrompt: true }));

/**
 * @param {string} project
 */
exports.watchProject = (project) => projectWatcher.enqueue(project);
