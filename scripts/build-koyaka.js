const path = require("node:path");
const fs = require("node:fs");

const chokidar = require("chokidar");
const sass = require("sass");

const { distCleanup, getBanner, isDev } = require("./helpers/utils");

const ignoreMinify = process.argv.includes("--ignore-minify");

const packageRoot = path.resolve(__dirname, "../packages/koyaka");
const sourceDir = path.join(packageRoot, "src");
const distDir = path.join(packageRoot, "dist");

const banner = getBanner(packageRoot);

const buildEntries = [
    { in: "koyaka.all.scss", out: "koyaka.all.css" },
    { in: "koyaka.scss", out: "koyaka.css" },

    ...globDir("base"),
    ...globDir("components"),
    ...globDir("shared"),
    ...globDir("themes"),
    ...globDir("utilities"),
];

function globDir(dir) {
    return fs
        .readdirSync(path.join(sourceDir, dir))
        .filter((f) => {
            return f.endsWith(".scss") && f !== "_index.scss";
        })
        .map((f) => {
            return {
                in: path.join(dir, f),
                out: path.join(dir, f.replace(/\.scss$/, ".css")),
            };
        });
}

function compileEntry(entry, { style, sourceMap }) {
    try {
        const inputPath = path.join(sourceDir, entry.in);
        const outputPath = path.join(distDir, entry.out);

        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        const result = sass.compile(inputPath, {
            loadPaths: [sourceDir],
            style,
            sourceMap,
            sourceMapIncludeSources: sourceMap,
        });

        // Remove UTF-8 BOM
        const css = result.css.replace(/^\uFEFF/, "");

        const output = [`${banner}\n${css}\n`];

        if (sourceMap && result.sourceMap) {
            fs.writeFileSync(
                outputPath + ".map",
                JSON.stringify(result.sourceMap),
            );
            output.push(
                `\n/*# sourceMappingURL=${path.basename(entry.out)}.map */\n`,
            );
        }

        fs.writeFileSync(outputPath, output.join(""));
        console.log(`[+] built ${entry.out}`);
    } catch (err) {
        console.log(err);
    }
}

function runBuild() {
    for (const entry of buildEntries) {
        compileEntry(entry, {
            style: ignoreMinify ? "expanded" : "compressed",
            sourceMap: false,
        });
    }
}

function runWatch() {
    compileEntry(buildEntries[0], { style: "expanded", sourceMap: true });
    console.log(`[+] watching ${sourceDir} for changes...`);

    chokidar
        .watch(sourceDir, {
            ignoreInitial: true,
        })
        .on("change", (filepath) => {
            if (!filepath.endsWith(".scss")) return;

            console.log(`[+] changed ${path.relative(sourceDir, filepath)}`);

            compileEntry(buildEntries[0], {
                style: "expanded",
                sourceMap: true,
            });
        });
}

function main() {
    distCleanup(distDir);

    if (isDev) {
        return runWatch();
    }

    runBuild();
}

main();
