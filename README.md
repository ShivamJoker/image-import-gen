# Path Types

#### Easily generate path name types

## Usage

```shell
❯ npx path-types --help

Usage: path-types [options]

Generate file path types

Options:
  -d, --dir [directory]           Relative path of the directory, whose paths you want to generate (default: current dir)
  -o, --output [output]           Output file location (default: FilePaths.ts)
  -e, --extension [extension...]  File extension, eg. ts, js (default: ts)
  -n, --name [name]               Type name (default: FilePaths)
  -i, --ignore [ignore...]        ignore paths (default: node_modules)
  -w, --watch                     Enable watching (default: disabled)
  -k, --keep                      Keep file extension name (default: disabled)
  -h, --help                      display help for command
```

## Generated

```typescript
// FilePaths.ts

export type FilePaths =
  | "client"
  | "utils"
  | "cloudsearch/addUser"
  | "cloudsearch/updateUser"
  | "cognito/getUserInfo"
  | "cognito/onUserRegister"
  | "cognito/updateUser"
  | "db/client"
  | "db/dbStreamHandler";
```
