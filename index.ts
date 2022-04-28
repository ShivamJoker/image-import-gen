#! /usr/bin/env node

import fg from "fast-glob";
import { writeFileSync } from "fs";
import { createCommand, Option } from "commander";
import { join } from "path";

const program = createCommand();

const cwd = process.cwd();

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";

interface Opts {
  dir: string;
  output: string;
  extension: string[];
  name: string;
  keep: boolean;
  ignore: string[];
  watch: boolean;
}

program.name("path-types");
program.description("Generate file path types");

program
  .addOption(
    new Option(
      "-d, --dir [directory]",
      "Relative path of the directory, whose paths you want to generate"
    ).default("./", "current dir")
  )
  .addOption(
    new Option("-o, --output [output]", "Output file location").default(
      "./FilePaths.ts",
      "FilePaths.ts"
    )
  )
  .addOption(
    new Option(
      "-e, --extension [extension...]",
      "File extension, eg. ts, js"
    ).default("ts", "ts")
  )
  .addOption(
    new Option("-n, --name [name]", "Type name").default(
      "FilePaths",
      "FilePaths"
    )
  )
  .addOption(
    new Option("-i, --ignore [ignore...]", "ignore paths").default(
      "node_modules",
      "node_modules"
    )
  )
  .addOption(
    new Option("-w, --watch", "Enable watching").default(false, "disabled")
  )
  .addOption(
    new Option("-k, --keep", "Keep file extension name").default(
      false,
      "disabled"
    )
  );

program.parse(process.argv);

const options = program.opts<Opts>();

// console.log(options);

const glob = `**/*.{${
  Array.isArray(options.extension)
    ? options.extension.join(",")
    : options.extension
},}`;
// output -> "**/*.{js,ts}"[Symbol]

const absolutePath = join(cwd, options.dir);

const generateTypes = () => {
  let list = fg.sync(glob, {
    cwd: absolutePath,
    ignore: options.ignore,
  });

  // console.log(glob, list);

  if (!options.keep) {
    list = list.map((item) => {
      // split them, so that we can remove the extension
      const pathArr = item.split(".");
      pathArr.pop();
      //stitch them back
      return pathArr.join(".");
    });
  }

  let unionList = list.join('"\n  | "');

  const str = `export type ${options.name} =
  | "${unionList}";`;

  writeFileSync(join(cwd, options.output), str);

  console.log(`Types generated in ${options.output}.\n`);
};

// run generate function once
generateTypes();

if (options.watch) {
  const chokidar = await import("chokidar");
  chokidar
    .watch(glob, {
      cwd: absolutePath,
      ignored: [...options.ignore, options.output],
      ignoreInitial: true,
    })
    .on("add", (filename) => {
      console.log(`${GREEN}New file added${RESET}`, filename);
      generateTypes();
    })
    .on("unlink", (filename) => {
      console.log(`${RED}File Removed${RESET}`, filename);
      generateTypes();
    })
    .on("ready", () => console.log("Watch mode enabled."));
}
