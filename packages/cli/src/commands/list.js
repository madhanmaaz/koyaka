const path = require("node:path");
const pc = require("picocolors");

const { DEFAULT_FRAMEWORK, REGISTRY_GROUPS } = require("../constants.js");
const { readConfig } = require("../helpers/config.js");
const { getIndex } = require("../helpers/registry.js");

async function list(options) {
    const config = await readConfig(path.resolve(options.cwd));
    const framework =
        options.framework ?? config?.framework ?? DEFAULT_FRAMEWORK;

    const index = await getIndex(framework);

    for (const group of REGISTRY_GROUPS) {
        const entries = Object.entries(index[group] ?? {});

        if (entries.length === 0) continue;

        console.log(`\n${pc.bold(group)}:`);

        for (const [name, item] of entries) {
            const needs = item.dependencies.length
                ? pc.dim(`  needs ${item.dependencies.join(", ")}`)
                : "";

            console.log(`  ${name}${needs}`);
        }
    }

    console.log();
}

module.exports = {
    list,
};
