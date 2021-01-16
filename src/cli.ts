#!/usr/bin/env node

import { program } from "commander";

import { convert, defaultOptions } from "./schema";

function parsePrefix(value: string) {
  if (!value.match(/^\w/i)) {
    console.error("Prefix needs to start with a letter");
    process.exit(-1);
  }

  return value;
}

function parseExtension(value: string) {
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
    defaultOptions.glob
  )
  .option(
    "-p, --prefix <value>",
    "prefix to use before interfaces' name",
    parsePrefix,
    defaultOptions.prefix
  )
  .option(
    "-e, --ext <value>",
    "file extension to use for generated files",
    parseExtension,
    defaultOptions.ext
  )
  .option(
    "-m, --module <value>",
    "module to import the RouteHandler type from",
    defaultOptions.module
  );

program.parse(process.argv);
const options = program.opts();

convert({
  glob: options.glob,
  prefix: options.prefix,
  ext: options.ext,
  module: options.module,
});
