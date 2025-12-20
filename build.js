const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const CleanCSS = require("clean-css");
const chokidar = require("chokidar");
const http = require("http");

const isDev = process.argv.includes("--dev");
const distRoot = path.join(__dirname, "dist");
const cssSourceRoot = path.join(__dirname, "src", "css");
const PORT = 8090;

function minifyAndwriteContent(fileName, content) {
    const output = new CleanCSS().minify(content);
    fs.writeFileSync(fileName, output.styles, "utf-8");
}

function build() {
    const start = performance.now();

    const cssFiles = fs
        .readdirSync(cssSourceRoot)
        .filter((f) => f.endsWith(".css"))
        .map((filename) => {
            return path.join(cssSourceRoot, filename);
        })
        .filter(Boolean)
        .sort((a, b) => {
            const isRootA = a.endsWith("_root.css");
            const isRootB = b.endsWith("_root.css");
            return isRootA ? -1 : isRootB ? 1 : 0;
        });

    if (!fs.existsSync(distRoot)) {
        fs.mkdirSync(distRoot);
    }

    let all = "";
    let noUtils = "";
    for (const filePath of cssFiles) {
        const data = fs.readFileSync(filePath, "utf-8");
        all += data;

        if (!filePath.includes("utilities.css")) {
            noUtils += data;
        }
    }

    minifyAndwriteContent(path.join(distRoot, "koyaka.all.min.css"), all);
    minifyAndwriteContent(path.join(distRoot, "koyaka.min.css"), noUtils);

    console.log(`Build Success - ${(performance.now() - start).toFixed(2)}ms`);
}

if (isDev) {
    console.log(`Watching - ${cssSourceRoot}`);
    chokidar
        .watch(cssSourceRoot, { ignoreInitial: true })
        .on("change", (file) => {
            console.log(`Rebuilding - ${file}`);
            build();
        });

    const server = http.createServer((req, res) => {
        fs.readFile(
            path.join(distRoot, "koyaka.all.min.css"),
            (err, content) => {
                if (err) {
                    res.writeHead(404);
                    res.end("Not Found");
                    return;
                }

                res.writeHead(200, { "Content-Type": "text/css" });
                res.end(content);
            },
        );
    });
    server.listen(PORT, () => {
        console.log(`Listening - http://localhost:${PORT}`);
    });
} else {
    build();
}
