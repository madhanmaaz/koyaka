<p align="center">
    <img src="https://raw.githubusercontent.com/madhanmaaz/koyaka/master/logo.webp" height="250">
</p>
<h1 align="center">Koyaka</h1>

<p align="center">
   Koyaka is a modern CSS for building responsive, customizable, and user interfaces.
</p>

<p align="center">
    <a href="https://koyaka.netlify.app/">Documentation</a>
</p>

## Usage

Add the stylesheet to your page.

```html
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/koyaka@latest/dist/koyaka.css"
/>
```

To also get the utility classes (gap, display, margin, padding and so on), use the bundle with utilities instead.

```html
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/koyaka@latest/dist/koyaka.all.css"
/>
```

### Load only what you need

Every component has its own stylesheet. Always include `base/root.css` first, because it defines the theme tokens the components read.

```html
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/koyaka@latest/dist/base/root.css"
/>
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/koyaka@latest/dist/components/alert.css"
/>
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/koyaka@latest/dist/components/badge.css"
/>
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/koyaka@latest/dist/components/button.css"
/>
```

### Install from npm

```bash
npm install koyaka
```

## License

MIT © Madhan (Madhanmaaz)
