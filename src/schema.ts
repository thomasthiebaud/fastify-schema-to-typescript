import fs from "fs";
import { globSync } from "glob";
import yaml from "js-yaml";
import { compile, Options as CompilerOptions } from "json-schema-to-typescript";
import path from "path";

import { Options } from "./types";
import { capitalize, writeFile } from "./utils";

const compileOptions: Partial<CompilerOptions> = { bannerComment: "" };
const defaultSchema = { type: "object", additionalProperties: false };

export function addDefaultValueToSchema(
  schema: Record<string, any>
): Record<string, any> {
  return Object.entries(schema).reduce((acc, [key, value]) => {
    if (
      value !== null &&
      typeof value == "object" &&
      Array.isArray(value) === false
    ) {
      acc[key] = addDefaultValueToSchema(value);
    } else {
      acc[key] = value;
    }

    if (key === "properties" && !acc.additionalProperties) {
      acc.additionalProperties = false;
    }

    return acc;
  }, {} as any);
}

export const defaultOptions = {
  glob: "src/**/schema.{json,yaml,yml}",
  prefix: "",
  ext: ".ts",
  module: "fastify",
};

export async function generateDefinitionInterfaces(
  definitions: Record<any, any> = {}
) {
  const generatedInterfaces = [];
  const generatedReplyNames = [];

  for (const [definitionName, definitionSchema] of Object.entries(
    definitions
  )) {
    generatedReplyNames.push(capitalize(definitionName));
    generatedInterfaces.push(
      await compile(
        {
          ...addDefaultValueToSchema(definitionSchema || defaultSchema),
          definitions,
        },
        capitalize(definitionName),
        compileOptions
      )
    );
  }

  return `\
${generatedInterfaces.join("\n")}
export type Definitions = ${generatedReplyNames.join(" | ") || "{}"}\
  `.trim();
}

export async function generateReplyInterfaces(
  prefix: string,
  replies: Record<any, any> = {},
  definitions: Record<any, any> = {}
) {
  const generatedInterfaces = [];
  const generatedReplyNames = [];
  for (const [replyCode, replySchema] of Object.entries(replies)) {
    generatedReplyNames.push(prefix + "Reply" + replyCode.toUpperCase());
    generatedInterfaces.push(
      await compile(
        {
          ...addDefaultValueToSchema(replySchema || defaultSchema),
          definitions,
        },
        prefix + "Reply" + replyCode.toUpperCase(),
        compileOptions
      )
    );
  }

  return `
${generatedInterfaces.join("\n")}
export type ${prefix}Reply = ${generatedReplyNames.join(" | ") || "{}"}
`.trim();
}

function writeSchema(schema: any) {
  return `\
const schema = ${JSON.stringify(schema, null, 2)}\
`;
}

export async function generateInterfaces(schema: any, options: Options) {
  return `\
/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify the corresponding JSONSchema file and regenerate the types.
 */

import { RouteHandler } from "${options.module}"

export ${writeSchema(schema)}

${await generateDefinitionInterfaces(schema.definitions || {})}
${await compile(
  {
    ...addDefaultValueToSchema(schema.params || defaultSchema),
    definitions: schema.definitions,
  },
  options.prefix + "Params",
  compileOptions
)}
${await compile(
  {
    ...addDefaultValueToSchema(
      schema.querystring || schema.query || defaultSchema
    ),
    definitions: schema.definitions,
  },
  options.prefix + "Query",
  compileOptions
)}
${await compile(
  {
    ...addDefaultValueToSchema(schema.body || defaultSchema),
    definitions: schema.definitions,
  },
  options.prefix + "Body",
  compileOptions
)}
${await compile(
  {
    ...addDefaultValueToSchema(schema.headers || defaultSchema),
    definitions: schema.definitions,
  },
  options.prefix + "Headers",
  compileOptions
)}
${await generateReplyInterfaces(
  options.prefix,
  schema.response,
  schema.definitions
)}

export type ${options.prefix}RouteGeneric = {
  Querystring: ${options.prefix}Query;
  Body: ${options.prefix}Body;
  Params: ${options.prefix}Params;
  Headers: ${options.prefix}Headers;
  Reply: ${options.prefix}Reply;
}

export type ${options.prefix}Handler = RouteHandler<${
    options.prefix
  }RouteGeneric>;\
`;
}

export async function convert(options: Options) {
  const filePaths = globSync(options.glob);
  for (const filePath of filePaths) {
    const parsedPath = path.parse(filePath);
    try {
      if (parsedPath.ext === ".yaml" || parsedPath.ext === ".yml") {
        const schema = yaml.load(fs.readFileSync(filePath, "utf-8"));
        const template = await generateInterfaces(schema, options);
        await writeFile(parsedPath, template, options);
      } else {
        const schema = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const template = await generateInterfaces(schema, options);
        await writeFile(parsedPath, template, options);
      }
    } catch (err) {
      console.error(`Failed to process file ${filePath} with error ${err}`);
    }
  }
}
