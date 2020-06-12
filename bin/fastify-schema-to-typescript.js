#!/usr/bin/env node

const { program } = require("commander");
const { convert } = require("../dist/index");

program
  .option(
    "-g, --glob <value>",
    "glob matching JSON schema to convert",
    "src/**/schema.json"
  )
  .option("-p, --prefix <value>", "prefix to use before interfaces' name", "");

program.parse(process.argv);

convert(program.glob, program.prefix);
