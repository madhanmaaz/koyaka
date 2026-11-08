const path = require("node:path");
const fs = require("node:fs");

exports.isDev = process.argv.includes("--dev");

exports.getPkg = function (packageRoot) {
    return JSON.parse(
        fs.readFileSync(path.resolve(packageRoot, "package.json")),
    );
};

exports.getBanner = function (packageRoot) {
    const packageJson = exports.getPkg(packageRoot);

    return `/*! ${packageJson.name} ${packageJson.version} - ${packageJson.license} License */`;
};

exports.distCleanup = function (distDir) {
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, {
            recursive: true,
            force: true,
        });
    }
};
