const { REGISTRY_DIR, REGISTRY_URL } = require("../constants.js");

const cache = new Map();

function registryBase(framework) {
    const root = (process.env.KOYAKA_REGISTRY_URL ?? REGISTRY_URL).replace(
        /\/$/,
        "",
    );

    return `${root}/${REGISTRY_DIR}/${framework}`;
}

async function fetchText(url) {
    if (cache.has(url)) return cache.get(url);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} - ${url}`);
    }

    const text = await response.text();
    cache.set(url, text);

    return text;
}

async function getIndex(framework) {
    return JSON.parse(
        await fetchText(`${registryBase(framework)}/registry.json`),
    );
}

function getFile(framework, file) {
    return fetchText(`${registryBase(framework)}/${file}`);
}

const lookup = (map, name) =>
    map && Object.hasOwn(map, name) ? map[name] : undefined;

const findItem = (index, name) =>
    lookup(index.components, name) ?? lookup(index.blocks, name);

// returns the requested items as { name, files, dependencies }
function resolveItems(index, names) {
    return [...new Set(names)].map((name) => {
        const item = findItem(index, name);

        if (!item) {
            throw new Error(
                `"${name}" is not in the registry. Run "koyaka list".`,
            );
        }

        return { name, ...item };
    });
}

module.exports = {
    getIndex,
    getFile,
    findItem,
    resolveItems,
};
