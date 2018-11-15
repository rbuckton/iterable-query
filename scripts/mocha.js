const foreground = require("foreground-child");

/**
 * @param {object} options
 * @param {string[]} options.files
 * @param {string} [options.reporter]
 * @param {string} [options.coverageTempDirectory]
 */
async function mocha(options) {
    const cmd = "./node_modules/.bin/mocha";
    let args = [];
    if (options.reporter) args.push("-R", options.reporter);
    if (options.coverageTempDirectory) process.env.NODE_V8_COVERAGE = options.coverageTempDirectory;
    try {
        await new Promise(resolve => foreground(cmd, [...args, ...options.files], () => resolve()));
    }
    finally {
        if (options.coverageTempDirectory) process.env.NODE_V8_COVERAGE = "";
    }
}

exports.mocha = mocha;