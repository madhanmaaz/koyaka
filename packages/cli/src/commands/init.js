const path = require("node:path");

const {
    CONFIG_FILE,
    DEFAULT_DIR,
    DEFAULT_FRAMEWORK,
    FRAMEWORKS,
} = require("../constants.js");
const { readConfig, writeConfig } = require("../helpers/config.js");
const { exists } = require("../helpers/files.js");
const {
    detectPackageManager,
    getMissingDependencies,
    installDependencies,
} = require("../helpers/pm.js");
const { getIndex } = require("../helpers/registry.js");
const { logger } = require("../helpers/logger.js");
const { ask } = require("../helpers/prompt.js");

async function init(options) {
    const cwd = path.resolve(options.cwd);

    if (!(await exists(path.join(cwd, "package.json")))) {
        throw new Error("No package.json found. Run this inside your project.");
    }

    if ((await readConfig(cwd)) && !options.yes) {
        const { overwrite } = await ask({
            type: "confirm",
            name: "overwrite",
            message: `${CONFIG_FILE} already exists. Overwrite?`,
            initial: false,
        });

        if (!overwrite) return;
    }

    let framework = DEFAULT_FRAMEWORK;
    let dir = DEFAULT_DIR;

    if (!options.yes) {
        if (FRAMEWORKS.length > 1) {
            ({ framework } = await ask({
                type: "select",
                name: "framework",
                message: "Framework",
                choices: FRAMEWORKS.map((value) => ({ title: value, value })),
            }));
        }

        ({ dir } = await ask({
            type: "text",
            name: "dir",
            message: "Where should components be installed?",
            initial: DEFAULT_DIR,
            validate: (value) =>
                value &&
                !path.isAbsolute(value) &&
                !value.split(/[\\/]/).includes("..")
                    ? true
                    : "Use a relative path inside the project",
        }));
    }

    await writeConfig(cwd, { framework, dir });
    logger.success(`Created ${CONFIG_FILE}`);

    // global dependencies come from the registry
    let required = [];

    try {
        required = (await getIndex(framework)).dependencies ?? [];
    } catch (error) {
        logger.warn(`Could not check required packages: ${error.message}`);
    }

    const missing = await getMissingDependencies(cwd, required);

    if (missing.length > 0) {
        let install = true;

        if (!options.yes) {
            ({ install } = await ask({
                type: "confirm",
                name: "install",
                message: `Install required packages (${missing.join(", ")})?`,
                initial: true,
            }));
        }

        if (install) {
            const manager = detectPackageManager(cwd);

            logger.info(`Installing ${missing.join(", ")} with ${manager}`);
            await installDependencies(manager, missing, cwd);
        } else {
            logger.warn(`Install these yourself: ${missing.join(", ")}`);
        }
    }

    logger.dim(`Run "koyaka add <component>" to install components.`);
}

module.exports = {
    init,
};
