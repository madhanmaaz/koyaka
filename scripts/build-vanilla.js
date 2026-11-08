const path = require("node:path");

const esbuild = require("esbuild");

const { isDev, getBanner, distCleanup } = require("./helpers/utils");

const packageRoot = path.resolve(__dirname, "..", "packages", "vanilla");
const sourceDir = path.join(packageRoot, "src");
const distDir = path.join(packageRoot, "dist");

const packageJson = require(path.join(packageRoot, "package.json"));
const packageVersion = packageJson.version;

const baseBuildOptions = {
    banner: {
        js: getBanner(packageRoot),
    },
    target: ["es2017"],
    logLevel: "debug",
    minify: !isDev,

    sourcemap: isDev ? "inline" : false,
    jsxFactory: "createElement",
    loader: { ".js": "jsx" },

    define: {
        __APP_VERSION__: JSON.stringify(packageVersion),
    },
};

async function main() {
    distCleanup(distDir);

    const buildOptions = {
        ...baseBuildOptions,
        entryPoints: [path.join(sourceDir, "index.esm.js")],
        outfile: path.join(distDir, "koyaka.js"),
        bundle: true,
    };

    if (isDev) {
        const ctx = await esbuild.context(buildOptions);

        await ctx.watch();
    } else {
        await esbuild.build(buildOptions);

        await esbuild.build({
            ...baseBuildOptions,
            entryPoints: [path.join(sourceDir, "**")],
            outbase: sourceDir,
            outdir: distDir,
            bundle: false,
        });
    }
}

main().catch((err) => {
    console.log(err);
    process.exit(1);
});
