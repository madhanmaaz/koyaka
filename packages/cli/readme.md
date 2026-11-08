# koyaka

Add [Koyaka](https://github.com/madhanmaaz/koyaka) components to your project. The CLI copies the source files into your codebase, so you own the code and can edit it freely. Nothing is installed as a hidden dependency.

## Requirements

Node.js 18 or newer, and a project with a `package.json`.

## Quick start

```bash
npx koyaka init
npx koyaka add menu modal
```

`init` creates a `koyaka.json` file and asks which folder components should go in. `add` downloads the components you name, along with everything they depend on, and installs any missing npm packages using your project's package manager (pnpm, yarn, bun, or npm, detected from your lockfile).

After the commands above, a project using the default folder looks like this:

```
src/koyaka/
├─ components/
│  ├─ menu.tsx
│  └─ modal.tsx
├─ helpers/
│  ├─ positioner.ts
│  ├─ types.ts
│  └─ utils.ts
└─ shared/
   └─ floatingEngine.tsx
```

The folder layout is kept exactly as it is in the registry, so the relative imports between files (such as `../helpers/utils`) keep working without any rewriting.

## Commands

### init

```bash
koyaka init [options]
```

Creates `koyaka.json` in your project. It asks for the framework (only when more than one is available) and the install folder, which defaults to `src/koyaka`. If `koyaka.json` already exists you are asked before it is replaced.

Options:

- `-y, --yes` uses the defaults and skips every prompt.
- `--cwd <path>` runs against another directory.

### add

```bash
koyaka add [components...] [options]
```

Adds one or more components. When you name no components, an interactive list lets you pick them. Components pull in their own requirements automatically: adding `menu` also adds the shared floating engine, helpers, and types it imports. Each file is only written once, even when several components need it.

If a file already exists and its content is identical, it is left alone. If it exists and differs from the registry version, you are asked whether to overwrite it, and the default answer is no.

Options:

- `-a, --all` adds every component.
- `-o, --overwrite` overwrites files that already exist, without asking.
- `-y, --yes` disables prompts. Existing files that differ are skipped, unless `--overwrite` is also given, so a scripted run never silently replaces your edits.
- `--no-install` copies the files but skips installing npm dependencies.
- `--cwd <path>` runs against another directory.

You can add hooks, helpers, and shared modules by name too, for example `koyaka add floating-engine`.

### list

```bash
koyaka list [options]
```

Prints everything in the registry, grouped by type (component, helper, hook, shared). Items that need other items show what they depend on.

Options:

- `-f, --framework <name>` lists another framework's registry. It defaults to the framework in `koyaka.json`.
- `--cwd <path>` runs against another directory.

### Global option

`--registry <url>` changes where files are downloaded from. See "Pinning a version" below.

## Configuration

`koyaka.json` lives in your project root:

```json
{
    "framework": "solid",
    "dir": "src/koyaka"
}
```

`framework` selects which registry to use. `dir` is the folder, relative to the project root, where files are written. If you move that folder later, update `dir` so future `add` runs write to the new place. Files you already have are not moved for you.

## Styles

The CLI installs component source only. The components rely on the class names from the Koyaka stylesheet, so make sure your project includes the Koyaka CSS.

## Pinning a version

By default the CLI reads the registry from `https://cdn.jsdelivr.net/gh/madhanmaaz/koyaka@latest`. The `@latest` alias resolves to the newest release tag, and jsDelivr caches it, so a new release can take a few hours to appear.

To get reproducible installs, point at a specific tag:

```bash
koyaka add menu --registry https://cdn.jsdelivr.net/gh/madhanmaaz/koyaka@v0.1.0
```

You can also set the `KOYAKA_REGISTRY_URL` environment variable instead of passing the flag each time.

## Testing against a local registry

From the Koyaka repository root, serve the files and point the CLI at them:

```bash
npx serve .
koyaka add menu --registry http://localhost:3000
```

The CLI requests `<registry>/registry/<framework>/registry.json`, so the URL you pass is the repository root, not the `registry` folder.

## How the registry works

The registry lives in the Koyaka repository under `registry/<framework>/`, split into `components`, `helpers`, `hooks`, and `shared`. Next to those folders sits a generated `registry.json`, which lists every file as an item:

```json
{
    "name": "menu",
    "type": "component",
    "files": ["components/menu.tsx"],
    "dependencies": ["solid-js"],
    "registryDependencies": ["floating-engine", "types", "utils"]
}
```

`name` is the kebab-case file name and must be unique across all folders. `dependencies` are npm packages, and `registryDependencies` are other registry items. You never write this file by hand: the build script reads each source file's imports and works both lists out.

### Updating the registry

After changing, adding, or removing any registry file:

```bash
npm run registry:build
```

Commit the regenerated `registry.json`, then tag a release. jsDelivr serves committed files only, so a registry change that isn't committed and tagged is invisible to the CLI. To catch a forgotten rebuild in CI, run:

```bash
npm run registry:check
```

It exits with an error when `registry.json` is out of date.

The build fails with a clear message if two files share a name, or if a relative import points at something that isn't in the registry.

## Troubleshooting

**`"x" is not in the registry`** — the name is wrong, or the registry version you're reading predates that component. Run `koyaka list` to see what is available, and check whether you pinned an older version with `--registry`.

**A new release isn't showing up** — jsDelivr caches version aliases. Pin the new tag explicitly, or wait for the cache to refresh.

**`No koyaka.json found`** — run `koyaka init` in your project root, or pass `--cwd`.

**Dependency install fails** — the files were already copied. Install the packages yourself, or rerun with `--no-install` and handle it manually.

## License

MIT © 2026 Madhan (Madhanmaaz)
