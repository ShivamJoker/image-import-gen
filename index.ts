#! /usr/bin/env node

import fg from "fast-glob";
import { writeFileSync } from "fs";
import { createCommand, Option } from "commander";
import { join } from "path";
import { bold, green, red, yellow } from "colorette";

const program = createCommand();

const cwd = process.cwd();

interface Opts {
  dir: string;
  trim: number;
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
    new Option(
      "-t, --trim <number>",
      "Trim characters from end of path"
    ).default(0, "None")
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

const removeFileExt = (path: string) => {
  // split them, so that we can remove the extension
  const pathArr = path.split(".");
  // file ext will be in last idx
  pathArr.pop();
  //stitch them back
  return pathArr.join(".");
};

const generateTypes = () => {
  let list = fg.sync(glob, {
    cwd: absolutePath,
    ignore: options.ignore,
  });

  // console.log(glob, list);

  const { keep, trim } = options;
  // remove extension if keep is false or trim is needed
  if (!keep || trim) {
    list = list.map((path) => {
      // only remove extension if user specifies
      const pathStr = keep ? path : removeFileExt(path);
      // remove chars from str if specied
      return trim ? pathStr.slice(0, -trim) : pathStr;
    });
  }

  // put the paths array in set to remove any duplicates
  const listSet = new Set([...list]);

  let unionList = [...listSet].join('"\n  | "');

  const str = `export type ${options.name} =
  | "${unionList}";`;

  writeFileSync(join(cwd, options.output), str);

  console.log(green(bold(`Types generated in ${options.output}.\n`)));
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
      console.log(green(`New file added ${filename}`));
      generateTypes();
    })
    .on("unlink", (filename) => {
      console.log(red(`File removed ${filename}`));
      generateTypes();
    })
    .on("ready", () => console.log(yellow("Watch mode enabled!")));
}
