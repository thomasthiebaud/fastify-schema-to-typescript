import fs from "fs";
import glob from "glob";
import yaml from "js-yaml";
import { compile, Options as CompilerOptions } from "json-schema-to-typescript";
import path from "path";
import { promisify } from "util";

const compileOptions: Partial<CompilerOptions> = { bannerComment: "" };
const defaultSchema = { type: "object", additionalProperties: false };

export interface Options {
  glob: string;
  prefix: string;
  ext: string;
  module: string;
}

function addDefaultValueToSchema(schema: any) {
  return {
    ...schema,
    additionalProperties: schema.additionalProperties || false,
  };
}

export async function generateReplyInterfaces(
  prefix: string,
  replies: Record<any, any> = {}
) {
  const generatedInterfaces = [];
  const generatedReplyNames = [];
  for (const [replyCode, replySchema] of Object.entries(replies)) {
    generatedReplyNames.push(prefix + "Reply" + replyCode.toUpperCase());
    generatedInterfaces.push(
      await compile(
        addDefaultValueToSchema(replySchema || defaultSchema),
        prefix + "Reply" + replyCode.toUpperCase(),
        compileOptions
      )
    );
  }

  return `
${generatedInterfaces.join("\n")}
type ${prefix}Reply = ${generatedReplyNames.join(" | ") || "{}"}
`.trim();
}

function writeSchema(schema: any) {
  return `\
const schema = ${JSON.stringify(schema, null, 2)}\
`;
}

async function generateInterfaces(schema: any, options: Options) {
  return `\
/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify the corresponding JSONSchema file and regenerate the types.
 */

import { RouteHandler } from "${options.module}"

${writeSchema(schema)}

${await compile(
  addDefaultValueToSchema(schema.params || defaultSchema),
  options.prefix + "Params",
  compileOptions
)}
${await compile(
  addDefaultValueToSchema(schema.querystring || schema.query || defaultSchema),
  options.prefix + "Query",
  compileOptions
)}
${await compile(
  addDefaultValueToSchema(schema.body || defaultSchema),
  options.prefix + "Body",
  compileOptions
)}
${await compile(
  schema.headers || defaultSchema,
  options.prefix + "Headers",
  compileOptions
)}
${await generateReplyInterfaces(options.prefix, schema.response)}

type ${options.prefix}RouteGeneric = {
  Querystring: ${options.prefix}Query;
  Body: ${options.prefix}Body;
  Params: ${options.prefix}Params;
  Headers: ${options.prefix}Headers;
  Reply: ${options.prefix}Reply;
}

type ${options.prefix}Handler = RouteHandler<${options.prefix}RouteGeneric>;

export { ${options.prefix}Handler, ${options.prefix}RouteGeneric, schema }\
`;
}

async function writeFile(
  parsedPath: path.ParsedPath,
  template: string,
  options: Options
) {
  const write = promisify(fs.writeFile);
  return write(
    path.join(parsedPath.dir, parsedPath.name + options.ext),
    template
  );
}

export async function convert(options: Options) {
  const filePaths = glob.sync(options.glob);
  for (const filePath of filePaths) {
    const parsedPath = path.parse(filePath);
    try {
      if (parsedPath.ext === ".yaml" || parsedPath.ext === ".yml") {
        const schema = yaml.safeLoad(fs.readFileSync(filePath, "utf-8"));
        const template = await generateInterfaces(schema, options);
        await writeFile(parsedPath, template, options);
      } else {
        const schema = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const template = await generateInterfaces(schema, options);
        await writeFile(parsedPath, template, options);
      }
    } catch (err) {
      console.error(
        `Failed to process file ${filePath} with error ${JSON.stringify(err)}`
      );
    }
  }
}
