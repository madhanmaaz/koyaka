const fs = require("node:fs/promises");
const path = require("node:path");

async function exists(target) {
    try {
        await fs.access(target);
        return true;
    } catch {
        return false;
    }
}

async function readIfExists(target) {
    try {
        return await fs.readFile(target, "utf8");
    } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
    }
}

async function writeFileEnsured(target, content) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
}

// never write outside the install directory, whatever the registry says
function resolveInside(base, relativePath) {
    const target = path.resolve(base, relativePath);
    const relative = path.relative(base, target);

    if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error(`Refusing to write outside ${base}: ${relativePath}`);
    }

    return target;
}

module.exports = {
    exists,
    readIfExists,
    writeFileEnsured,
    resolveInside,
};
