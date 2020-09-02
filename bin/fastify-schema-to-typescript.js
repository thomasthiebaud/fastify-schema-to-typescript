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

function parseExtension(value) {
  if (!value.match(/^\./)) {
    console.error('File extension needs to start with a "."');
    process.exit(-1);
  }

  return value;
}

program
  .option(
    "-g, --glob <value>",
    "glob matching JSON schema to convert",
    "src/**/schema.{json,yaml,yml}"
  )
  .option(
    "-p, --prefix <value>",
    "prefix to use before interfaces' name",
    parsePrefix,
    ""
  )
  .option(
    "-e, --ext <value>",
    "file extension to use for generated files",
    parseExtension,
    ".ts"
  )
  .option(
    "-m, --module <value>",
    "module to import the RouteHandler type from",
    "fastify"
  );

program.parse(process.argv);

convert({
  glob: program.glob,
  prefix: program.prefix,
  ext: program.ext,
  module: program.module,
});
