const fs = require("node:fs/promises");
const path = require("node:path");

const { CONFIG_FILE, FRAMEWORKS } = require("../constants.js");
const { readIfExists } = require("./files.js");

async function readConfig(cwd) {
    const text = await readIfExists(path.join(cwd, CONFIG_FILE));
    if (text === null) return null;

    let config;

    try {
        config = JSON.parse(text);
    } catch {
        throw new Error(`${CONFIG_FILE} is not valid JSON.`);
    }

    if (!FRAMEWORKS.includes(config.framework)) {
        throw new Error(
            `${CONFIG_FILE}: "framework" must be one of ${FRAMEWORKS.join(", ")}.`,
        );
    }

    if (typeof config.dir !== "string" || !config.dir) {
        throw new Error(`${CONFIG_FILE}: "dir" must be a non-empty string.`);
    }

    return config;
}

function writeConfig(cwd, config) {
    return fs.writeFile(
        path.join(cwd, CONFIG_FILE),
        JSON.stringify(config, null, 4) + "\n",
    );
}

module.exports = {
    readConfig,
    writeConfig,
};
