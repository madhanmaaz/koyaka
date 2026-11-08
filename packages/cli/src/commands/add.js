const path = require("node:path");

const { readConfig } = require("../helpers/config.js");
const { getFile, getIndex, resolveItems } = require("../helpers/registry.js");
const {
    readIfExists,
    resolveInside,
    writeFileEnsured,
} = require("../helpers/files.js");
const {
    detectPackageManager,
    getMissingDependencies,
    installDependencies,
} = require("../helpers/pm.js");
const { logger } = require("../helpers/logger.js");
const { ask } = require("../helpers/prompt.js");

const normalize = (text) => text.replace(/\r\n/g, "\n");

async function pickComponents(index) {
    const { selected } = await ask({
        type: "multiselect",
        name: "selected",
        message: "Which components?",
        choices: Object.keys(index.components ?? {}).map((name) => ({
            title: name,
            value: name,
        })),
        hint: "space to select, enter to confirm",
    });

    return selected ?? [];
}

async function add(names, options) {
    const cwd = path.resolve(options.cwd);
    const config = await readConfig(cwd);

    if (!config) {
        throw new Error(`No koyaka.json found. Run "koyaka init" first.`);
    }

    const index = await getIndex(config.framework);

    let selected = names;

    if (options.all) {
        selected = Object.keys(index.components ?? {});
    } else if (selected.length === 0) {
        selected = await pickComponents(index);
    }

    if (selected.length === 0) {
        logger.warn("Nothing selected.");
        return;
    }

    const items = resolveItems(index, selected);
    const base = path.resolve(cwd, config.dir);
    const result = { created: [], overwritten: [], unchanged: [], skipped: [] };
    const handled = new Set(); // items share files, so write each one once

    for (const item of items) {
        for (const file of item.files) {
            if (handled.has(file)) continue;
            handled.add(file);

            const target = resolveInside(base, file);
            const label = path.relative(cwd, target).split(path.sep).join("/");
            const content = await getFile(config.framework, file);
            const existing = await readIfExists(target);

            if (existing === null) {
                await writeFileEnsured(target, content);
                result.created.push(label);
                continue;
            }

            if (normalize(existing) === normalize(content)) {
                result.unchanged.push(label);
                continue;
            }

            let overwrite = Boolean(options.overwrite);

            if (!overwrite && !options.yes) {
                ({ overwrite } = await ask({
                    type: "confirm",
                    name: "overwrite",
                    message: `${label} already exists and differs. Overwrite?`,
                    initial: false,
                }));
            }

            if (overwrite) {
                await writeFileEnsured(target, content);
                result.overwritten.push(label);
            } else {
                result.skipped.push(label);
            }
        }
    }

    if (options.install) {
        const dependencies = [
            ...new Set(items.flatMap((item) => item.dependencies)),
        ];
        const missing = await getMissingDependencies(cwd, dependencies);

        if (missing.length > 0) {
            const manager = detectPackageManager(cwd);

            logger.info(`Installing ${missing.join(", ")} with ${manager}`);
            await installDependencies(manager, missing, cwd);
        }
    }

    for (const label of result.created) {
        logger.success(`created     ${label}`);
    }
    for (const label of result.overwritten) {
        logger.success(`overwritten ${label}`);
    }
    for (const label of result.unchanged) {
        logger.dim(`unchanged   ${label}`);
    }
    for (const label of result.skipped) {
        logger.warn(`skipped     ${label}`);
    }
}

module.exports = {
    add,
};
