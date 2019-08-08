# subimage-match

Lightweight library that finds matches of an image within another image, perfect for visual validation in testing scenarios.
Heavily inspired by (read: blatantly copied some subroutines from) [pixelmatch](https://github.com/mapbox/pixelmatch), and just like [pixelmatch](https://github.com/mapbox/pixelmatch), its advantages are that it's fast and lightweight, with zero dependencies.

Usage demo:
```js
const foundMatch = subImageMatch(img, subImg);
```

## API

### pixelmatch(img, subImg[, options])

- `img1`, `img2` — Image data of the images to compare (`Buffer`, `Uint8Array` or `Uint8ClampedArray`).
- `options` is an object literal with only one property currently:
    - `threshold` — Matching threshold, ranges from `0` to `1`. Smaller values make the comparison more sensitive. `0.1` by default.

Returns a boolean indicating whether or not a match has been found

## Example usage

### Node.js

```js
const fs = require("fs");
const PNG = require("pngjs").PNG;
const subImageMatch = require("subimage-match");

const img = PNG.sync.read(fs.readFileSync("image.png"));
const subImg = PNG.sync.read(fs.readFileSync("sub_image.png"));
subImageMatch(img1.data, img2.data, {threshold: 0.1});
```

## Install

Install with NPM:

```bash
npm install pixelmatch
```

## [Changelog](https://github.com/dieterwalckiers/subimage-match/releases)
