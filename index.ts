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
  output: string;
  extension: string[];
  name: string;
  watch: boolean;
}

program.name("Image import generator");
program.description("Generate file path types");

program
  .addOption(
    new Option(
      "-d, --dir [directory]",
      "Relative path of the image directory"
    ).default("./", "current dir")
  )
  .addOption(
    new Option("-o, --output [output]", "Output file location").default(
      "./Images.ts",
      "Images.ts"
    )
  )
  .addOption(
    new Option(
      "-e, --extension [extension...]",
      "File extension, eg. jpg, png, svg"
    ).default(["jpg", "jpeg", "gif", "png", "svg", "webp"], "jpg, svg, png ...")
  )
  .addOption(
    new Option("-w, --watch", "Enable watching").default(false, "disabled")
  );

program.parse(process.argv);

const options = program.opts<Opts>();

// console.log(options);

const glob = `**/*.{${
  Array.isArray(options.extension)
    ? options.extension.join(",")
    : options.extension
},}`;
// output -> "**/*.{png,webp,svg}"

const absolutePath = join(cwd, options.dir);

const generateImports = () => {
  let list = fg.sync(glob, {
    cwd: absolutePath,
  });

  // console.log(glob, list);

  // put the paths array in set to remove any duplicates
  const listSet = new Set([...list]);

  let importsStr = "";
  let exportsStr = "";

  listSet.forEach((path) => {
    let filename = path.split("/").at(-1);
    filename = filename?.split(".").at(0);
    filename = filename?.replace("-", "_");

    if (!filename) {
      throw Error("Failed to extract image name");
    }

    const relativePath = options.dir === "./" ? "" : `${options.dir}/`;
    importsStr += `import _${filename} from "./${relativePath}${path}";\n`;
    exportsStr += `export const ${filename} = _${filename};\n`;
  });

  const finalStr = importsStr + "\n" + exportsStr;

  writeFileSync(join(cwd, options.output), finalStr);

  console.log(green(bold(`Types generated in ${options.output}.\n`)));
};

// run generate function once
generateImports();

if (options.watch) {
  const chokidar = await import("chokidar");
  chokidar
    .watch(glob, {
      cwd: absolutePath,
      ignoreInitial: true,
    })
    .on("add", (filename) => {
      console.log(green(`New image added ${filename}`));
      generateImports();
    })
    .on("unlink", (filename) => {
      console.log(red(`Image removed ${filename}`));
      generateImports();
    })
    .on("ready", () => console.log(yellow("Watch mode enabled!")));
}
