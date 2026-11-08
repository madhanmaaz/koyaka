#!/usr/bin/env node

const { Command } = require("commander");

const { init } = require("./commands/init.js");
const { add } = require("./commands/add.js");
const { list } = require("./commands/list.js");
const { logger } = require("./helpers/logger.js");
const pkg = require("../package.json");

const run =
    (fn) =>
    async (...args) => {
        try {
            await fn(...args);
        } catch (error) {
            logger.error(error.message);
            process.exitCode = 1;
        }
    };

const program = new Command();

program
    .name("koyaka")
    .description("Add Koyaka components to your project")
    .version(pkg.version)
    .option(
        "--registry <url>",
        "registry base URL (pin a version or point at a local server)",
    );

program.hook("preAction", (command) => {
    const { registry } = command.opts();
    if (registry) process.env.KOYAKA_REGISTRY_URL = registry;
});

program
    .command("init")
    .description("create koyaka.json")
    .option("-y, --yes", "use defaults, no prompts")
    .option("--cwd <path>", "project directory", process.cwd())
    .action(run(init));

program
    .command("add [components...]")
    .description("add components and everything they depend on")
    .option("-a, --all", "add every component")
    .option("-o, --overwrite", "overwrite files that already exist")
    .option("-y, --yes", "no prompts (existing files are skipped unless -o)")
    .option("--no-install", "skip installing npm dependencies")
    .option("--cwd <path>", "project directory", process.cwd())
    .action(run(add));

program
    .command("list")
    .description("list available items")
    .option("-f, --framework <name>", "framework to list")
    .option("--cwd <path>", "project directory", process.cwd())
    .action(run(list));

program.parseAsync();
