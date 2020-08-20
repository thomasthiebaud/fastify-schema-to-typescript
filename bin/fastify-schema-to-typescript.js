#!/usr/bin/env node

const { program } = require("commander");
const { convert } = require("../dist/index");

function parsePrefix(value) {
  if (!value.match(/^\w/i)) {
    console.error("Prefix needs to start with a letter");
    process.exit(-1);
  }

  return value;
}

program
  .option(
    "-g, --glob <value>",
    "glob matching JSON schema to convert",
    "src/**/schema.json"
  )
  .option(
    "-p, --prefix <value>",
    "prefix to use before interfaces' name",
    parsePrefix,
    ""
  );

program.parse(process.argv);

convert({ glob: program.glob, prefix: program.prefix });
