# Path Types

#### Automatically generate import/exports for your images

Easily import and use it in your React, React Native, Vue or anything you want

## Usage

```shell
❯ npx image-import-gen --help

Usage: Image import generator [options]

Generate file path types

Options:
  -d, --dir [directory]           Relative path of the image directory (default: current dir)
  -o, --output [output]           Output file location (default: Images.ts)
  -e, --extension [extension...]  File extension, eg. jpg, png, svg (default: jpg, svg, png ...)
  -w, --watch                     Enable watching (default: disabled)
  -h, --help                      display help for command
```

## Generated

```typescript
// Images.ts
import _balls from "./cool-images/balls.svg";
import _cuteguy from "./cool-images/cuteguy.webp";

export const balls = _balls;
export const cuteguy = _cuteguy;
```

## Usage

```typescript
// Gallery.ts
import { balls, cuteguy } from "Images";

export const Gallery = () => {
  return (
    <>
      <img src={balls} />
      <img src={cuteguy} />
    </>
  );
};
```
