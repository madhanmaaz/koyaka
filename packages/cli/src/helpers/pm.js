const spawn = require("cross-spawn");
const fs = require("node:fs");
const path = require("node:path");

const { readIfExists } = require("./files.js");

const LOCKFILES = [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lockb", "bun"],
    ["bun.lock", "bun"],
    ["package-lock.json", "npm"],
];

const PACKAGE_NAME = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

function detectPackageManager(cwd) {
    for (const [file, manager] of LOCKFILES) {
        if (fs.existsSync(path.join(cwd, file))) return manager;
    }

    const agent = process.env.npm_config_user_agent ?? "";
    return (
        ["pnpm", "yarn", "bun"].find((name) => agent.startsWith(name)) ?? "npm"
    );
}

async function getMissingDependencies(cwd, dependencies) {
    const text = await readIfExists(path.join(cwd, "package.json"));

    if (text === null) throw new Error(`No package.json found in ${cwd}.`);

    const pkg = JSON.parse(text);
    const installed = new Set([
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.devDependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {}),
    ]);

    return dependencies.filter((name) => !installed.has(name));
}

function installDependencies(manager, dependencies, cwd) {
    // names come from a remote registry and run through a shell on Windows
    for (const name of dependencies) {
        if (!PACKAGE_NAME.test(name)) {
            throw new Error(`Invalid dependency name in registry: "${name}"`);
        }
    }

    const args = [manager === "npm" ? "install" : "add", ...dependencies];

    return new Promise((resolve, reject) => {
        const child = spawn(manager, args, {
            cwd,
            stdio: "inherit",
        });

        child.on("error", reject);

        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(
                    new Error(`${manager} ${args[0]} exited with code ${code}`),
                );
            }
        });
    });
}

module.exports = {
    detectPackageManager,
    getMissingDependencies,
    installDependencies,
};
