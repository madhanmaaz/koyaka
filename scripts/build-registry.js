const fs = require("node:fs");
const path = require("node:path");
const { builtinModules } = require("node:module");
const { getPkg } = require("./helpers/utils");

// scripts/build-registry.js  ->  registry/<framework>/registry.json
const registryRoot = path.join(__dirname, "../registry");
const check = process.argv.includes("--check");

// folders that hold installable items; helpers, hooks and shared are pulled in by imports
const GROUPS = ["components", "blocks"];

// packages every item needs; `koyaka init` checks these
const FRAMEWORK_DEPENDENCIES = {
    solid: ["solid-js"],
};

const CODE_EXT = [".tsx", ".ts", ".jsx", ".js"];
const SKIP_ENTRY =
    /^(\.|node_modules$|__tests__$)|\.(test|spec|stories)\.[^.]+$/;
const IMPORT_RE =
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g;

const toPosix = (value) => value.split(path.sep).join("/");

const toKebab = (value) =>
    value
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/[._\s]+/g, "-")
        .toLowerCase();

const isFile = (target) =>
    fs.existsSync(target) && fs.statSync(target).isFile();

const isDirectory = (target) =>
    fs.existsSync(target) && fs.statSync(target).isDirectory();

const stripComments = (source) =>
    source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const packageName = (spec) =>
    spec.startsWith("@")
        ? spec.split("/").slice(0, 2).join("/")
        : spec.split("/")[0];

const isBuiltin = (spec) =>
    spec.startsWith("node:") || builtinModules.includes(spec.split("/")[0]);

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (SKIP_ENTRY.test(entry.name)) return [];

        const full = path.join(dir, entry.name);

        return entry.isDirectory() ? walk(full) : [full];
    });
}

function readSpecs(frameworkRoot, file) {
    if (!CODE_EXT.includes(path.extname(file))) return [];

    const source = stripComments(
        fs.readFileSync(path.join(frameworkRoot, file), "utf8"),
    );

    return [...source.matchAll(IMPORT_RE)].map((match) => match[1]);
}

function resolveRelative(frameworkRoot, fromFile, spec) {
    const base = path.posix.normalize(
        path.posix.join(path.posix.dirname(fromFile), spec),
    );

    const candidates = [
        base,
        ...CODE_EXT.map((ext) => base + ext),
        ...CODE_EXT.map((ext) => `${base}/index${ext}`),
    ];

    return candidates.find(
        (candidate) =>
            !candidate.startsWith("..") &&
            isFile(path.join(frameworkRoot, candidate)),
    );
}

// every top-level folder or file inside components/ and blocks/ is one item:
//   components/accordion/**      -> "accordion"
//   blocks/loginForm.tsx         -> "login-form"
// components and blocks share one namespace, so `koyaka add <name>` is unambiguous
function collectEntries(frameworkRoot) {
    const groups = {};
    const names = new Map();

    for (const group of GROUPS) {
        groups[group] = [];

        const groupDir = path.join(frameworkRoot, group);

        if (!isDirectory(groupDir)) continue;

        const dirents = fs
            .readdirSync(groupDir, { withFileTypes: true })
            .filter((entry) => !SKIP_ENTRY.test(entry.name))
            .filter(
                (entry) =>
                    entry.isDirectory() ||
                    CODE_EXT.includes(path.extname(entry.name)),
            )
            .sort((a, b) => a.name.localeCompare(b.name));

        for (const entry of dirents) {
            const full = path.join(groupDir, entry.name);
            const files = (entry.isDirectory() ? walk(full) : [full]).map(
                (file) => toPosix(path.relative(frameworkRoot, file)),
            );

            if (files.length === 0) continue;

            const name = toKebab(
                entry.isDirectory()
                    ? entry.name
                    : path.basename(entry.name, path.extname(entry.name)),
            );
            const source = `${group}/${entry.name}`;

            if (names.has(name)) {
                throw new Error(
                    `Duplicate name "${name}": ${names.get(name)} and ${source}`,
                );
            }

            names.set(name, source);
            groups[group].push({ name, files });
        }
    }

    return groups;
}

// own files + every file they import (recursively), and the npm packages they need
function resolveEntry(frameworkRoot, entry, globalDependencies) {
    const files = new Set(entry.files);
    const dependencies = new Set();
    const queue = [...files];

    while (queue.length > 0) {
        const file = queue.shift();

        for (const spec of readSpecs(frameworkRoot, file)) {
            if (spec.startsWith(".")) {
                const resolved = resolveRelative(frameworkRoot, file, spec);

                if (!resolved) {
                    throw new Error(
                        `${entry.name}: ${file} imports "${spec}", which cannot be resolved inside the registry`,
                    );
                }

                if (!files.has(resolved)) {
                    files.add(resolved);
                    queue.push(resolved);
                }
            } else if (!isBuiltin(spec)) {
                const pkg = packageName(spec);

                if (!globalDependencies.includes(pkg)) dependencies.add(pkg);
            }
        }
    }

    return {
        files: [...files].sort(),
        dependencies: [...dependencies].sort(),
    };
}

function buildFramework(framework) {
    const frameworkRoot = path.join(registryRoot, framework);
    const globalDependencies = FRAMEWORK_DEPENDENCIES[framework] ?? [];
    const groups = collectEntries(frameworkRoot);

    const { version } = getPkg(frameworkRoot);

    const data = {
        framework,
        version,
        dependencies: [...globalDependencies],
    };

    for (const group of GROUPS) {
        data[group] = {};

        for (const entry of groups[group]) {
            data[group][entry.name] = resolveEntry(
                frameworkRoot,
                entry,
                globalDependencies,
            );
        }
    }

    return data;
}

const frameworks = fs
    .readdirSync(registryRoot, { withFileTypes: true })
    .filter(
        (entry) =>
            entry.isDirectory() &&
            GROUPS.some((group) =>
                isDirectory(path.join(registryRoot, entry.name, group)),
            ),
    )
    .map((entry) => entry.name);

if (frameworks.length === 0) {
    console.error(
        `✖ No registry/<framework>/(${GROUPS.join("|")}) folders found in ${registryRoot}`,
    );
    process.exit(1);
}

let failed = false;

for (const framework of frameworks) {
    try {
        const data = buildFramework(framework);
        const output = JSON.stringify(data, null, 4) + "\n";
        const target = path.join(registryRoot, framework, "registry.json");

        if (check) {
            const current = isFile(target)
                ? fs.readFileSync(target, "utf8")
                : "";

            if (current !== output) {
                console.error(
                    `✖ ${framework}/registry.json is out of date. Run: node scripts/build-registry.js`,
                );
                failed = true;
            }
        } else {
            fs.writeFileSync(target, output);

            const counts = GROUPS.map(
                (group) => `${Object.keys(data[group]).length} ${group}`,
            ).join(", ");

            console.log(`✔ ${framework}: ${counts}`);
        }
    } catch (error) {
        console.error(`✖ ${framework}: ${error.message}`);
        failed = true;
    }
}

if (failed) process.exit(1);
