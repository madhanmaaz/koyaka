# koyaka

Add [Koyaka](https://github.com/madhanmaaz/koyaka) components to your project. The CLI copies the source files into your codebase, so you own the code and can edit it freely. Nothing is installed as a hidden dependency.

## Requirements

Node.js 18 or newer, and a project with a `package.json`.

## Quick start

```bash
npx koyaka init
npx koyaka add menu modal
```

`init` creates a `koyaka.json` file, asks which folder components should go in, and installs the packages every Koyaka component needs (for the Solid registry, that is `solid-js`). `add` downloads the components you name, along with every file they import, and installs any other npm packages they need using your project's package manager (pnpm, yarn, bun, or npm, detected from your lockfile).

After the commands above, a project using the default folder looks like this:

```
src/koyaka/
├─ components/
│  ├─ menu/
│  │  ├─ index.ts
│  │  └─ menu.tsx
│  └─ modal/
│     ├─ index.ts
│     └─ modal.tsx
├─ helpers/
│  ├─ events.ts
│  ├─ types.ts
│  └─ utils.ts
└─ shared/
   ├─ floatingEngine.tsx
   └─ overlayEngine.tsx
```

The folder layout is kept exactly as it is in the registry, so the relative imports between files (such as `../../helpers/utils`) keep working without any rewriting.

## Commands

### init

```bash
koyaka init [options]
```

Creates `koyaka.json` in your project. It asks for the framework (only when more than one is available) and the install folder, which defaults to `src/koyaka`. If `koyaka.json` already exists you are asked before it is replaced.

After the config is written, `init` checks your `package.json` for the packages the registry says every component needs, and offers to install any that are missing. If the registry can't be reached, it warns and leaves the config in place; run `init` again later, or install the packages yourself.

Options:

- `-y, --yes` uses the defaults, skips every prompt, and installs missing packages without asking.
- `--cwd <path>` runs against another directory.

### add

```bash
koyaka add [names...] [options]
```

Adds one or more components or blocks by name. When you name nothing, an interactive list lets you pick components.

Every item is self-contained: all the files it imports, such as helpers and shared modules, are copied along with it. If two items need the same file, it is written only once. Adding `menu`, for example, also copies the floating engine and the helpers it uses.

If a file already exists and its content is identical, it is left alone. If it exists and differs from the registry version, you are asked whether to overwrite it, and the default answer is no.

Options:

- `-a, --all` adds every component. Blocks are not included.
- `-o, --overwrite` overwrites files that already exist, without asking.
- `-y, --yes` disables prompts. Existing files that differ are skipped, unless `--overwrite` is also given, so a scripted run never silently replaces your edits.
- `--no-install` copies the files but skips installing npm dependencies.
- `--cwd <path>` runs against another directory.

Helpers, hooks, and shared modules can't be added on their own. They come along with the components and blocks that use them.

### list

```bash
koyaka list [options]
```

Prints every component and block in the registry. Items that need extra npm packages show which ones.

Options:

- `-f, --framework <name>` lists another framework's registry. It defaults to the framework in `koyaka.json`.
- `--cwd <path>` runs against another directory.

### Global option

`--registry <url>` changes where files are downloaded from. See "Pinning a version" below.

## Components and blocks

A component is a single building block, like a menu or a modal. A block is a larger piece built from components. Both are added with `koyaka add <name>`, and their names are unique across the whole registry, so a name never means two things.

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

The registry lives in the Koyaka repository under `registry/<framework>/`. Two folders hold the items people can install: `components` and `blocks`. Three more, `helpers`, `hooks`, and `shared`, hold code that items import. Next to those folders sits a generated `registry.json`:

```json
{
    "framework": "solid",
    "version": "0.0.0",
    "dependencies": ["solid-js"],
    "components": {
        "menu": {
            "files": [
                "components/menu/index.ts",
                "components/menu/menu.tsx",
                "helpers/events.ts",
                "helpers/types.ts",
                "helpers/utils.ts",
                "shared/floatingEngine.tsx"
            ],
            "dependencies": []
        }
    },
    "blocks": {}
}
```

The top-level `dependencies` are the packages every item needs, and `koyaka init` checks them. Each item's own `dependencies` list holds any additional npm packages that item requires. `files` lists everything the item needs: its own files plus every file they import, followed recursively.

You never write this file by hand. The build script finds items by folder:

- Every top-level folder or file inside `components` and `blocks` is one item, named after the folder or file in kebab-case. `components/accordion/` becomes `accordion`, and `blocks/loginForm.tsx` becomes `login-form`.
- It reads each file's imports to work out the full `files` list and the npm packages each item needs. Test, spec, and story files are ignored.
- The packages every item needs for a framework are set in `FRAMEWORK_DEPENDENCIES` at the top of `scripts/build-registry.js`. Add an entry there when you add a framework.

If a folder holds code that several components share, move it into `helpers` or `shared` rather than keeping it inside one component.

### Updating the registry

After changing, adding, or removing any registry file:

```bash
npm run build:registry
```

Commit the regenerated `registry.json`, then tag a release. jsDelivr serves committed files only, so a registry change that isn't committed and tagged is invisible to the CLI. To catch a forgotten rebuild in CI, run:

```bash
npm run check:registry
```

It exits with an error when `registry.json` is out of date.

The build fails with a clear message if two items share a name, or if a relative import can't be resolved inside the registry.

## Troubleshooting

**`"x" is not in the registry`** — the name is wrong, or the registry version you're reading predates that component. Run `koyaka list` to see what is available, and check whether you pinned an older version with `--registry`.

**A new release isn't showing up** — jsDelivr caches version aliases. Pin the new tag explicitly, or wait for the cache to refresh.

**`No koyaka.json found`** — run `koyaka init` in your project root, or pass `--cwd`.

**Dependency install fails** — the files were already copied. Install the packages yourself, or rerun with `--no-install` and handle it manually.

**`Could not check required packages` during init** — the registry couldn't be reached, but your config was still created. Check your connection or the `--registry` URL, then install the packages listed for your framework yourself.

## License

MIT © 2026 Madhan (Madhanmaaz)
