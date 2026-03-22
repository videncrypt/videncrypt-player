# videncrypt-player

Monorepo for VidEncrypt player SDKs.

| Package | Version | Description |
|---|---|---|
| [`@videncrypt/js`](./packages/js) | ![npm](https://img.shields.io/npm/v/@videncrypt/js) | Vanilla JS SDK — works everywhere |
| [`@videncrypt/react`](./packages/react) | ![npm](https://img.shields.io/npm/v/@videncrypt/react) | React component + hook |

---

## Quick start

### Vanilla JS (CDN)

```html
<div id="player"></div>
<script src="https://sdk.videncrypt.com/ve.js"></script>
<script>
  const player = new VidEncrypt.Player({
    videoId:   'YOUR_VIDEO_ID',
    container: '#player',
  });
</script>
```

### npm

```bash
npm install @videncrypt/js
# or
npm install @videncrypt/react
```

```js
// Vanilla JS
import { Player } from '@videncrypt/js';

const player = new Player({
  videoId:   'YOUR_VIDEO_ID',
  container: '#player',
});
```

```tsx
// React
import { VidEncryptPlayer } from '@videncrypt/react';

<VidEncryptPlayer videoId="YOUR_VIDEO_ID" />
```

---

## Packages

### [@videncrypt/js](./packages/js)

Zero-dependency vanilla JS SDK. Works in any framework or plain HTML.
Uses an iframe under the hood — AES keys and tokens never exposed to the host page.

**[→ Full docs](./packages/js/README.md)**

### [@videncrypt/react](./packages/react)

React component and `usePlayer` hook wrapping `@videncrypt/js`.
Built-in loading and error states. Full TypeScript support.

**[→ Full docs](./packages/react/README.md)**

---

## CDN URLs

```
Latest:   https://sdk.videncrypt.com/ve.js
Pinned:   https://sdk.videncrypt.com/v{version}/ve.js
```

---

## Development

### Prerequisites

- Node.js 20+
- pnpm 8+

### Setup

```bash
git clone https://github.com/videncrypt/videncrypt-player
cd videncrypt-player
pnpm install
```

### Build all packages

```bash
pnpm build
```

### Watch mode

```bash
pnpm build:watch
```

### Type check

```bash
pnpm typecheck
```

### Run examples

```bash
cd packages/js
pnpm examples
# open http://localhost:4000/examples/basic.html
```

---

## Release

Releases are fully automated via GitHub Actions.

```bash
# Bump version and push tag
npm version patch   # or minor / major
git push && git push --tags
```

GitHub Actions then:
1. Builds all packages
2. Uploads `@videncrypt/js` to `sdk.videncrypt.com`
3. Publishes both packages to npm
4. Creates a GitHub Release with changelog

---

## Repository structure

```
videncrypt-player/
├── packages/
│   ├── js/           @videncrypt/js
│   └── react/        @videncrypt/react
├── package.json      workspace root
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## License

MIT