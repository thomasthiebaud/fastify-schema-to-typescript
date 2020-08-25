import glob from "glob";
import path from "path";
import fs from "fs";
import { compile } from "json-schema-to-typescript";
import { promisify } from "util";

const compileOptions = { bannerComment: "" };
const defaultSchema = { type: "object", additionalProperties: false };

export interface Options {
  glob: string;
  prefix: string;
  ext: string;
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
        replySchema || defaultSchema,
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

async function generateInterfaces(
  parsedPath: path.ParsedPath,
  schema: any,
  options: Options
) {
  return `\
/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify the corresponding JSONSchema file and regenerate the types.
 */

import { RouteHandler } from "fastify"

import schema from './${parsedPath.base}'

${await compile(
  schema.params || defaultSchema,
  options.prefix + "Params",
  compileOptions
)}
${await compile(
  schema.querystring || schema.query || defaultSchema,
  options.prefix + "Query",
  compileOptions
)}
${await compile(
  schema.body || defaultSchema,
  options.prefix + "Body",
  compileOptions
)}
${await compile(
  schema.headers || defaultSchema,
  options.prefix + "Headers",
  compileOptions
)}
${await generateReplyInterfaces(options.prefix, schema.response)}

type ${options.prefix}Handler = RouteHandler<{
  Querystring: ${options.prefix}Query;
  Body: ${options.prefix}Body;
  Params: ${options.prefix}Params;
  Headers: ${options.prefix}Headers;
  Reply: ${options.prefix}Reply;
}>;

export { ${options.prefix}Handler, schema }\
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
    const schema = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const template = await generateInterfaces(parsedPath, schema, options);
    await writeFile(parsedPath, template, options);
  }
}
