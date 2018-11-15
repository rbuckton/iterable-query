const del = require('del');
const util = require("util");
const mkdirp = util.promisify(require("mkdirp"));
const report = require("c8/lib/report");

/**
 * @param {string} tempDirectory 
 */
async function initCoverage(tempDirectory) {
    await del(tempDirectory);
    await mkdirp(tempDirectory);
}
exports.init = initCoverage;

/**
 * @param {object} options
 * @param {string} options.tempDirectory
 * @param {string[]} [options.include]
 * @param {string[]} [options.exclude]
 * @param {string[]} [options.reporter]
 */
function writeCoverage(options) {
    console.log("Generating code coverage report... (to disable use '--no-coverage')");
    report({
        ...options,
        resolve: "",
        omitRelative: true
    });
}
exports.write = writeCoverage;